// ═══════════════════════════════════════════════════════════════
// CONTRAQ — Billing Routes (Stripe)
// Checkout session creation, webhook for payment events
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabaseAdmin } = require('../db/supabase');

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const APP_URL = process.env.APP_URL || 'http://localhost:8080';

let stripe = null;
if (STRIPE_SECRET) {
  stripe = require('stripe')(STRIPE_SECRET);
  console.log('[Billing] Stripe configured');
} else {
  console.warn('[Billing] STRIPE_SECRET_KEY not set — billing disabled');
}

// Beta pricing — single tier at £99/mo
const BETA_PRICE_ID = process.env.STRIPE_PRICE_BETA || null;

// ─── Create Checkout Session ─────────────────────────────────
router.post('/checkout', requireAuth, async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Billing not configured' });
  if (!BETA_PRICE_ID) return res.status(503).json({ error: 'Pricing not configured' });

  const org = req.user.organizations;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [{ price: BETA_PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/?billing=success`,
      cancel_url: `${APP_URL}/?billing=cancelled`,
      metadata: {
        org_id: req.orgId,
        org_name: org.name,
        plan: 'beta',
        user_id: req.user.id
      },
      subscription_data: {
        metadata: { org_id: req.orgId, plan: 'beta' }
      }
    });

    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('[Billing] Checkout error:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ─── Stripe Webhook ──────────────────────────────────────────
// Must be registered BEFORE express.json() middleware — raw body needed
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).send('Billing not configured');

  let event;
  try {
    if (STRIPE_WEBHOOK_SECRET) {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error('[Billing] Webhook signature failed:', err.message);
    return res.status(400).send('Webhook signature failed');
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orgId = session.metadata?.org_id;
      const plan = session.metadata?.plan;
      if (orgId && plan && supabaseAdmin) {
        // Upgrade org: set plan, clear trial_ends (paid = no trial limit)
        await supabaseAdmin
          .from('organizations')
          .update({
            plan: plan,
            trial_ends: null,  // null = no trial, fully paid
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          })
          .eq('id', orgId);
        console.log(`[Billing] Org ${orgId} upgraded to ${plan}`);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const orgId = sub.metadata?.org_id;
      if (orgId && supabaseAdmin) {
        // Downgrade to starter, set trial_ends to now (effectively expired)
        await supabaseAdmin
          .from('organizations')
          .update({
            plan: 'starter',
            trial_ends: new Date().toISOString(),
            stripe_subscription_id: null,
          })
          .eq('id', orgId);
        console.log(`[Billing] Org ${orgId} subscription cancelled — downgraded`);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.warn(`[Billing] Payment failed for customer ${invoice.customer}`);
      break;
    }
  }

  res.json({ received: true });
});

// ─── Billing Portal ──────────────────────────────────────────
router.post('/portal', requireAuth, async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Billing not configured' });

  const org = req.user.organizations;
  if (!org.stripe_customer_id) {
    return res.status(400).json({ error: 'No billing account found. Please upgrade first.' });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${APP_URL}`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('[Billing] Portal error:', err.message);
    res.status(500).json({ error: 'Failed to open billing portal' });
  }
});

// ─── Current billing status ──────────────────────────────────
router.get('/status', requireAuth, async (req, res) => {
  const org = req.user.organizations;
  res.json({
    plan: org.plan,
    trial_ends: org.trial_ends,
    has_payment: !!org.stripe_customer_id,
    stripe_customer_id: org.stripe_customer_id || null,
  });
});

module.exports = router;

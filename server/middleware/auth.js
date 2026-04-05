// ═══════════════════════════════════════════════════════════════
// CONTRAQ — Auth Middleware
// Verifies Supabase JWT tokens and attaches user + org context
// ═══════════════════════════════════════════════════════════════

const { supabaseAdmin } = require('../db/supabase');
const { getUserByAuthId } = require('../db/queries');

// Middleware: require authenticated user
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT with Supabase
    if (!supabaseAdmin) {
      // Demo mode only when explicitly enabled (local development)
      if (process.env.DEMO_MODE === 'true') {
        req.user = {
          id: 'demo-user-id',
          org_id: 'demo-org-id',
          email: 'demo@contraq.co.uk',
          name: 'Demo User',
          role: 'admin'
        };
        req.orgId = 'demo-org-id';
        return next();
      }
      return res.status(503).json({ error: 'Authentication service unavailable' });
    }

    // Verify JWT — use fresh client to avoid stale state
    const { createClient } = require('@supabase/supabase-js');
    const sbAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: { user: authUser }, error } = await sbAdmin.auth.getUser(token);
    if (error || !authUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get full user profile — try auth_id first, then email
    let user = null;
    const { data: u1 } = await sbAdmin.from('users').select('*').eq('auth_id', authUser.id).maybeSingle();
    if (u1) {
      user = u1;
    } else {
      const { data: u2 } = await sbAdmin.from('users').select('*').eq('email', authUser.email).maybeSingle();
      if (u2) {
        user = u2;
        await sbAdmin.from('users').update({ auth_id: authUser.id }).eq('id', u2.id).catch(() => {});
      }
    }

    if (!user) {
      return res.status(403).json({ error: 'User account not found. Please contact support.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account deactivated. Please contact your administrator.' });
    }

    // Get org
    const { data: org } = await sbAdmin.from('organizations').select('*').eq('id', user.org_id).maybeSingle();
    user.organizations = org || { id: user.org_id, name: 'Unknown', plan: 'beta', slug: 'org' };

    // Attach to request
    req.user = user;
    req.orgId = user.org_id;
    req.authUser = authUser;

    // Check trial expiry
    const userOrg = user.organizations;
    const paidPlans = ['paid', 'beta', 'professional', 'business'];
    if (userOrg && userOrg.trial_ends && !paidPlans.includes(userOrg.plan)) {
      const trialEnd = new Date(userOrg.trial_ends);
      const now = new Date();
      if (now > trialEnd) {
        req.trialExpired = true;
        req.trialEndsAt = userOrg.trial_ends;
      } else {
        req.trialExpired = false;
        req.trialEndsAt = userOrg.trial_ends;
        req.trialDaysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    // Update last login (fire and forget)
    supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)
      .then(() => {});

    next();
  } catch (err) {
    console.error('[Auth Middleware]', err.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Middleware: require specific role
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Middleware: block expired trials (use after requireAuth)
function requireActiveTrial(req, res, next) {
  if (req.trialExpired) {
    return res.status(402).json({
      error: 'trial_expired',
      message: 'Your 7-day free trial has ended. Upgrade to continue using Contraq.',
      trial_ends: req.trialEndsAt
    });
  }
  next();
}

// Middleware: optional auth (attaches user if token present, continues if not)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  // If token present, try to verify
  return requireAuth(req, res, next);
}

module.exports = { requireAuth, requireRole, requireActiveTrial, optionalAuth };

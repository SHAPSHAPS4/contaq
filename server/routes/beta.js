// ═══════════════════════════════════════════════════════════════
// CONTRAQ — Beta Access + Feedback Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../db/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

// ─── BETA APPLICATION (public — no auth required) ───────────
router.post('/apply', async (req, res) => {
  try {
    const { name, company, trade, email, teamSize, currentTools, projectSize } = req.body;
    if (!name || !company || !trade || !email) {
      return res.status(400).json({ error: 'Name, company, trade, and email are required' });
    }
    if (!supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });

    const { data, error } = await supabaseAdmin
      .from('beta_applications')
      .insert({
        name, company, trade, email: email.toLowerCase().trim(),
        team_size: teamSize || null,
        current_tools: currentTools || null,
        project_size: projectSize || null
      })
      .select()
      .single();

    if (error) {
      if (error.message && error.message.includes('duplicate')) {
        return res.status(409).json({ error: 'This email has already applied. We\'ll be in touch!' });
      }
      throw error;
    }
    res.json({ success: true, message: 'Application received! We\'ll review it within 24 hours.' });
  } catch (err) {
    console.error('[Beta Apply]', err.message);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// ─── LIST APPLICATIONS (admin only) ─────────────────────────
router.get('/applications', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    if (!supabaseAdmin) return res.json([]);
    const { data, error } = await supabaseAdmin
      .from('beta_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load applications' });
  }
});

// ─── APPROVE APPLICATION (admin only) ───────────────────────
router.post('/approve/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });

    // Get the application
    const { data: app, error: appErr } = await supabaseAdmin
      .from('beta_applications')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (appErr || !app) return res.status(404).json({ error: 'Application not found' });

    // Create auth user with temporary password
    const tempPassword = 'Beta' + Math.random().toString(36).slice(-8) + '!';
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: app.email,
      password: tempPassword,
      email_confirm: true
    });
    if (authErr) throw authErr;

    // Create org
    const slug = app.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data: org, error: orgErr } = await supabaseAdmin
      .from('organizations')
      .insert({ name: app.company, slug, plan: 'professional', trade: app.trade })
      .select().single();
    if (orgErr) throw orgErr;

    // Create user
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .insert({ org_id: org.id, auth_id: authData.user.id, email: app.email, name: app.name, role: 'admin' })
      .select().single();
    if (userErr) throw userErr;

    // Update application status
    await supabaseAdmin
      .from('beta_applications')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', req.params.id);

    res.json({
      success: true,
      user: { email: app.email, name: app.name },
      org: { name: app.company },
      temporaryPassword: tempPassword,
      message: 'Send these credentials to ' + app.email
    });
  } catch (err) {
    console.error('[Beta Approve]', err.message);
    res.status(500).json({ error: 'Failed to approve: ' + err.message });
  }
});

// ─── SUBMIT FEEDBACK (authenticated users) ──────────────────
router.post('/feedback', requireAuth, async (req, res) => {
  try {
    const { rating, whatWorked, whatDidnt, wouldPay, priceRange, page } = req.body;
    if (!rating) return res.status(400).json({ error: 'Rating is required' });
    if (!supabaseAdmin) return res.json({ success: true });

    const { error } = await supabaseAdmin
      .from('feedback')
      .insert({
        org_id: req.orgId,
        user_id: req.user.id,
        rating,
        what_worked: whatWorked || null,
        what_didnt: whatDidnt || null,
        would_pay: wouldPay || null,
        price_range: priceRange || null,
        page: page || null
      });
    if (error) throw error;
    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) {
    console.error('[Feedback]', err.message);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// ─── LIST FEEDBACK (admin only) ─────────────────────────────
router.get('/feedback', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    if (!supabaseAdmin) return res.json([]);
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*, users(name, email), organizations(name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load feedback' });
  }
});

// ─── RATE EXTRACTION ACCURACY (authenticated users) ─────────
router.post('/rate-extraction', requireAuth, async (req, res) => {
  try {
    const { extractionId, accuracy, correctionsCount, notes } = req.body;
    if (!accuracy) return res.status(400).json({ error: 'Accuracy rating is required' });
    if (!supabaseAdmin) return res.json({ success: true });

    const { error } = await supabaseAdmin
      .from('extraction_ratings')
      .insert({
        org_id: req.orgId,
        user_id: req.user.id,
        extraction_id: extractionId || null,
        accuracy,
        corrections_count: correctionsCount || 0,
        notes: notes || null
      });
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[Rate Extraction]', err.message);
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

// ─── ACCURACY STATS (admin) ─────────────────────────────────
router.get('/accuracy-stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    if (!supabaseAdmin) return res.json({ total: 0, yes: 0, partially: 0, no: 0 });
    const { data, error } = await supabaseAdmin
      .from('extraction_ratings')
      .select('accuracy');
    if (error) throw error;
    const stats = { total: data.length, yes: 0, partially: 0, no: 0 };
    data.forEach(function(r) { if (stats[r.accuracy] !== undefined) stats[r.accuracy]++; });
    stats.accuracy_pct = stats.total > 0 ? Math.round(((stats.yes + stats.partially * 0.5) / stats.total) * 100) : 0;
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;

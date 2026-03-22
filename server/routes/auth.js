// ═══════════════════════════════════════════════════════════════
// CONTRAQ — Auth Routes
// Signup, login, logout, password reset, user profile
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../db/supabase');
const { createOrganization, createUser, getUserByAuthId, getUsersByOrg } = require('../db/queries');
const { requireAuth, requireRole } = require('../middleware/auth');

// ─── DEBUG — test signup path (remove later)
router.get('/debug', async (req, res) => {
  try {
    const sb = supabaseAdmin ? 'connected' : 'null';
    res.json({ supabase: sb, env_url: !!process.env.SUPABASE_URL, env_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY, env_anon: !!process.env.SUPABASE_ANON_KEY });
  } catch(e) { res.json({ error: e.message }); }
});

// ─── SIGNUP — creates org + user + Supabase auth account ────
router.post('/signup', function(req, res) {
  (async function() { try {
    const { email, password, name, companyName, trade, plan } = req.body;

    if (!email || !password || !name || !companyName) {
      return res.status(400).json({ error: 'Email, password, name, and company name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // 1. Create Supabase auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true  // auto-confirm for now (add email verification later)
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      throw authError;
    }

    // 2. Create organization
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const org = await createOrganization({
      name: companyName,
      slug,
      plan: plan || 'starter',
      trade: trade || 'insulation'
    });

    // 3. Create user profile linked to auth + org
    const user = await createUser({
      orgId: org.id,
      authId: authData.user.id,
      email,
      name,
      role: 'admin'  // first user is always admin
    });

    // 4. Sign in to get tokens
    const { data: session, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email
    });

    // Return user info (frontend will handle the session)
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      org: { id: org.id, name: org.name, plan: org.plan, slug: org.slug },
      auth_id: authData.user.id
    });

  } catch (err) {
    console.error('[Signup] Full error:', err);
    res.status(500).json({ error: 'Failed to create account: ' + (err.message || String(err)) });
  }
  })().catch(function(e) { console.error('[Signup] Uncaught:', e); res.status(500).json({ error: 'Signup failed: ' + e.message }); });
});

// ─── LOGIN — authenticates and returns session token ────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!supabaseAdmin) {
      // Mock mode for local development
      return res.json({
        session: { access_token: 'mock-token', refresh_token: 'mock-refresh' },
        user: { id: 'demo-user-id', email, name: 'Demo User', role: 'admin' },
        org: { id: 'demo-org-id', name: 'Demo Company', plan: 'professional', slug: 'demo' }
      });
    }

    // Authenticate with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user profile with org
    const user = await getUserByAuthId(data.user.id);
    if (!user) {
      return res.status(403).json({ error: 'User profile not found. Please contact support.' });
    }

    res.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      },
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      org: { id: user.organizations.id, name: user.organizations.name, plan: user.organizations.plan, slug: user.organizations.slug }
    });

  } catch (err) {
    console.error('[Login]', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── REFRESH — refresh an expired token ─────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token || !supabaseAdmin) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
    if (error) return res.status(401).json({ error: 'Token refresh failed' });

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// ─── ME — get current user profile ──────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role },
    org: req.user.organizations || { id: req.orgId }
  });
});

// ─── TEAM — list users in org (admin only) ──────────────────
router.get('/team', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const users = await getUsersByOrg(req.orgId);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load team' });
  }
});

// ─── INVITE — add a user to the org (admin only) ────────────
router.post('/invite', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { email, name, role } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Check user limit
    const team = await getUsersByOrg(req.orgId);
    const org = req.user.organizations;
    if (org && team.length >= org.max_users) {
      return res.status(403).json({ error: 'User limit reached for your plan. Upgrade to add more team members.' });
    }

    // Create Supabase auth user with temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(409).json({ error: 'This email is already registered' });
      }
      throw authError;
    }

    // Create user profile in the same org
    const user = await createUser({
      orgId: req.orgId,
      authId: authData.user.id,
      email,
      name,
      role: role || 'user'
    });

    res.json({ user, temporaryPassword: tempPassword });

  } catch (err) {
    console.error('[Invite]', err.message);
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

// ─── PASSWORD RESET — send reset email ──────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !supabaseAdmin) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);
    // Always return success (don't reveal if email exists)
    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (err) {
    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  }
});

module.exports = router;

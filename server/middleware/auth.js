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

    const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !authUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get full user profile with org
    const user = await getUserByAuthId(authUser.id);
    if (!user) {
      return res.status(403).json({ error: 'User account not found. Please contact support.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account deactivated. Please contact your administrator.' });
    }

    // Attach to request
    req.user = user;
    req.orgId = user.org_id;
    req.authUser = authUser;

    // Check trial expiry
    const org = user.organizations;
    const paidPlans = ['paid', 'beta', 'professional', 'business'];
    if (org && org.trial_ends && !paidPlans.includes(org.plan)) {
      const trialEnd = new Date(org.trial_ends);
      const now = new Date();
      if (now > trialEnd) {
        req.trialExpired = true;
        req.trialEndsAt = org.trial_ends;
      } else {
        req.trialExpired = false;
        req.trialEndsAt = org.trial_ends;
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

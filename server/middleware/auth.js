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
      // Mock mode — attach demo user for local development
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

// Middleware: optional auth (attaches user if token present, continues if not)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  // If token present, try to verify
  return requireAuth(req, res, next);
}

module.exports = { requireAuth, requireRole, optionalAuth };

// ═══════════════════════════════════════════════════════════════
// CONTRAQ — Supabase Client
// Connects to Supabase Postgres with service role key (server-side)
// ═══════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('[DB] Supabase not configured — running in mock mode. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

// Service role client — bypasses RLS, used for server-side operations
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// Anon client — respects RLS, used for user-context operations
const supabaseAnon = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Create a client scoped to a specific user's JWT (for RLS)
function supabaseForUser(accessToken) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}

module.exports = { supabaseAdmin, supabaseAnon, supabaseForUser };

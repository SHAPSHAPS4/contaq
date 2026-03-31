const { requireAuth, requireRole, requireActiveTrial } = require('../middleware/auth');

// Mock request/response/next helpers
function mockReq(overrides = {}) {
  return { headers: {}, user: null, orgId: null, ...overrides };
}

function mockRes() {
  const res = { statusCode: null, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
}

function mockNext() {
  const fn = jest.fn();
  return fn;
}

describe('Auth Middleware', () => {
  test('requireAuth rejects missing authorization header', async () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();
    await requireAuth(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/missing/i);
    expect(next).not.toHaveBeenCalled();
  });

  test('requireAuth rejects non-Bearer token', async () => {
    const req = mockReq({ headers: { authorization: 'Basic abc123' } });
    const res = mockRes();
    const next = mockNext();
    await requireAuth(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('requireAuth returns 503 when Supabase unavailable and demo mode off', async () => {
    // Without DEMO_MODE=true, should return 503
    const originalDemo = process.env.DEMO_MODE;
    delete process.env.DEMO_MODE;
    const req = mockReq({ headers: { authorization: 'Bearer test-token' } });
    const res = mockRes();
    const next = mockNext();
    await requireAuth(req, res, next);
    // supabaseAdmin is null in test env, so should return 503 (not demo mode)
    expect(res.statusCode).toBe(503);
    expect(next).not.toHaveBeenCalled();
    process.env.DEMO_MODE = originalDemo;
  });

  test('requireAuth attaches demo user when DEMO_MODE=true', async () => {
    const originalDemo = process.env.DEMO_MODE;
    process.env.DEMO_MODE = 'true';
    const req = mockReq({ headers: { authorization: 'Bearer test-token' } });
    const res = mockRes();
    const next = mockNext();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe('demo-user-id');
    expect(req.orgId).toBe('demo-org-id');
    process.env.DEMO_MODE = originalDemo;
  });
});

describe('Role Middleware', () => {
  test('requireRole passes when user has correct role', () => {
    const middleware = requireRole('admin', 'manager');
    const req = mockReq({ user: { role: 'admin' } });
    const res = mockRes();
    const next = mockNext();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('requireRole blocks when user has wrong role', () => {
    const middleware = requireRole('admin');
    const req = mockReq({ user: { role: 'user' } });
    const res = mockRes();
    const next = mockNext();
    middleware(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/permissions/i);
    expect(next).not.toHaveBeenCalled();
  });

  test('requireRole blocks when no user attached', () => {
    const middleware = requireRole('admin');
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();
    middleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('Trial Middleware', () => {
  test('requireActiveTrial passes when trial not expired', () => {
    const req = mockReq({ trialExpired: false });
    const res = mockRes();
    const next = mockNext();
    requireActiveTrial(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('requireActiveTrial blocks expired trial', () => {
    const req = mockReq({ trialExpired: true, trialEndsAt: '2026-03-20' });
    const res = mockRes();
    const next = mockNext();
    requireActiveTrial(req, res, next);
    expect(res.statusCode).toBe(402);
    expect(res.body.error).toBe('trial_expired');
    expect(next).not.toHaveBeenCalled();
  });
});

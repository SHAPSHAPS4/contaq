const { validate, schemas } = require('../middleware/validate');

function mockReq(body) { return { body }; }
function mockRes() {
  const res = { statusCode: null, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
}

describe('Validate Middleware', () => {
  test('passes valid signup data', () => {
    const req = mockReq({ email: 'test@example.com', password: 'Password1!', name: 'Test User', companyName: 'Test Co' });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.signup)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.validated).toBeDefined();
    expect(req.validated.email).toBe('test@example.com');
  });

  test('rejects signup with invalid email', () => {
    const req = mockReq({ email: 'notanemail', password: 'Password1!', name: 'Test', companyName: 'Co' });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.signup)(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details.length).toBeGreaterThan(0);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects signup with short password', () => {
    const req = mockReq({ email: 'test@example.com', password: 'short', name: 'Test', companyName: 'Co' });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.signup)(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res.body.details.some(d => d.message.includes('8 characters'))).toBe(true);
  });

  test('rejects signup with missing fields', () => {
    const req = mockReq({ email: 'test@example.com' });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.signup)(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('passes valid login data', () => {
    const req = mockReq({ email: 'test@example.com', password: 'mypassword' });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.login)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('rejects login with missing password', () => {
    const req = mockReq({ email: 'test@example.com' });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.login)(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  test('passes valid change-password data', () => {
    const req = mockReq({ currentPassword: 'oldpass123', newPassword: 'newpass123' });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.changePassword)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('rejects change-password with short new password', () => {
    const req = mockReq({ currentPassword: 'oldpass', newPassword: 'short' });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.changePassword)(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  test('passes valid invite data with default role', () => {
    const req = mockReq({ email: 'new@example.com', name: 'New User' });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.invite)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.validated.role).toBe('user');
  });

  test('rejects invite with invalid role', () => {
    const req = mockReq({ email: 'new@example.com', name: 'New User', role: 'superadmin' });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.invite)(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  test('passes valid pricing data', () => {
    const req = mockReq({
      takeoff_items: [{ description: 'Copper pipe 22mm', trade: 'Mechanical', quantity: 50, unit: 'm' }],
      project_ref: 'PRJ-001'
    });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.pricing)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('rejects pricing with empty items array', () => {
    const req = mockReq({ takeoff_items: [] });
    const res = mockRes();
    const next = jest.fn();
    validate(schemas.pricing)(req, res, next);
    expect(res.statusCode).toBe(400);
  });
});

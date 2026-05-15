const SecurityModule = require('../utils/security');

describe('SecurityModule', () => {
  let security;

  beforeEach(() => {
    security = new SecurityModule();
  });

  test('calculates simple arithmetic safely', () => {
    expect(security.safeCalculate('2 + 2')).toBe(4);
    expect(security.safeCalculate('10 * 5')).toBe(50);
    expect(security.safeCalculate('(10 + 5) / 3')).toBe(5);
  });

  test('rejects code-like expressions', () => {
    expect(() => security.safeCalculate('eval("1+1")')).toThrow();
    expect(() => security.safeCalculate('require("fs")')).toThrow();
    expect(() => security.safeCalculate('2 + 2; process.exit()')).toThrow();
  });

  test('sanitizes HTML-like input', () => {
    const clean = security.sanitizeInput('<script>alert("x")</script>Hello');

    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Hello');
  });

  test('validates command input', () => {
    expect(security.validateCommand('/help').isValid).toBe(true);
    expect(security.validateCommand('/bad <script>').isValid).toBe(false);
  });
});

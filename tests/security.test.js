// Tests para o módulo de segurança
const SecurityModule = require('../modules/security');

describe('SecurityModule', () => {
    let security;
    
    beforeEach(() => {
        security = new SecurityModule();
    });
    
    describe('safeCalculate', () => {
        test('deve calcular expressões matemáticas básicas', () => {
            expect(security.safeCalculate('2 + 2')).toBe(4);
            expect(security.safeCalculate('10 * 5')).toBe(50);
            expect(security.safeCalculate('100 / 4')).toBe(25);
        });
        
        test('deve calcular expressões complexas', () => {
            expect(security.safeCalculate('2 + 3 * 4')).toBe(14);
            expect(security.safeCalculate('(10 + 5) / 3')).toBe(5);
        });
        
        test('deve rejeitar código malicioso', () => {
            expect(() => {
                security.safeCalculate('eval("malicious code")');
            }).toThrow();
            
            expect(() => {
                security.safeCalculate('require("fs")');
            }).toThrow();
            
            expect(() => {
                security.safeCalculate('process.exit()');
            }).toThrow();
        });
        
        test('deve validar caracteres permitidos', () => {
            expect(() => {
                security.safeCalculate('2 + 2; alert("hack")');
            }).toThrow();
        });
    });
    
    describe('validateInput', () => {
        test('deve validar inputs seguros', () => {
            expect(security.validateInput('hello world')).toBe(true);
            expect(security.validateInput('123 + 456')).toBe(true);
            expect(security.validateInput('/help')).toBe(true);
        });
        
        test('deve rejeitar inputs maliciosos', () => {
            expect(security.validateInput('<script>alert("xss")</script>')).toBe(false);
            expect(security.validateInput('javascript:void(0)')).toBe(false);
            expect(security.validateInput('../../etc/passwd')).toBe(false);
        });
    });
    
    describe('sanitizeInput', () => {
        test('deve limpar tags HTML', () => {
            const dirty = '<script>alert("test")</script>Hello';
            const clean = security.sanitizeInput(dirty);
            expect(clean).not.toContain('<script>');
            expect(clean).toContain('Hello');
        });
        
        test('deve manter texto normal', () => {
            const text = 'Texto normal sem problemas';
            expect(security.sanitizeInput(text)).toBe(text);
        });
    });
});


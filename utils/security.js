const mathjs = require('mathjs');
const winston = require('winston');
const joi = require('joi');

// Configuração do logger de segurança
const securityLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/security.log' }),
        new winston.transports.Console({ 
            format: winston.format.simple(),
            level: 'error'
        })
    ]
});

class SecurityModule {
    constructor() {
        // Configuração segura do mathjs
        this.math = mathjs.create(mathjs.all, {
            matrix: 'Matrix',
            number: 'number'
        });
        
        // Limitar avaliação apenas a operações matemáticas seguras
        this.math.import({
            import: function () { throw new Error('Function import is disabled') },
            createUnit: function () { throw new Error('Function createUnit is disabled') },
            evaluate: function () { throw new Error('Function evaluate is disabled') },
            parse: function () { throw new Error('Function parse is disabled') }
        }, { override: true });
    }
    
    /**
     * Calcula expressões matemáticas de forma segura usando mathjs
     * @param {string} expression - Expressão matemática
     * @returns {number} Resultado do cálculo
     */
    safeCalculate(expression) {
        try {
            // Log da tentativa de cálculo
            securityLogger.info('Calculation attempt', { expression });
            
            // Validação da entrada
            const validationResult = this.validateMathExpression(expression);
            if (!validationResult.isValid) {
                securityLogger.warn('Invalid expression blocked', { 
                    expression, 
                    error: validationResult.error 
                });
                throw new Error(validationResult.error);
            }
            
            // Usar mathjs para avaliação segura
            const result = this.math.evaluate(expression);
            
            // Validar resultado
            if (typeof result !== 'number' || !isFinite(result)) {
                throw new Error('Resultado inválido ou não numérico');
            }
            
            securityLogger.info('Calculation successful', { expression, result });
            return result;
            
        } catch (error) {
            securityLogger.error('Calculation failed', { 
                expression, 
                error: error.message 
            });
            throw new Error(`Erro no cálculo: ${error.message}`);
        }
    }
    
    /**
     * Valida expressão matemática usando Joi
     * @param {string} expression - Expressão a ser validada
     * @returns {Object} Resultado da validação
     */
    validateMathExpression(expression) {
        try {
            // Schema Joi para validação
            const schema = joi.string()
                .pattern(/^[0-9+\-*/.() \t\n\r]+$/)
                .min(1)
                .max(1000)
                .required();
            
            const { error } = schema.validate(expression);
            if (error) {
                return {
                    isValid: false,
                    error: 'Expressão contém caracteres não permitidos ou é muito longa'
                };
            }
            
            // Verificações adicionais de segurança
            const securityChecks = [
                {
                    pattern: /[;{}\[\]]/,
                    message: 'Caracteres de código não permitidos'
                },
                {
                    pattern: /\b(eval|function|return|var|let|const|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new|delete|typeof|instanceof|in|of|class|extends|import|export|require|module|exports|process|global|window|document|console|alert|prompt|confirm)\b/i,
                    message: 'Palavras-chave de programação não permitidas'
                },
                {
                    pattern: /\$\{|`/,
                    message: 'Template literals não permitidos'
                },
                {
                    pattern: /\b(Math|Object|Array|String|Number|Boolean|Date|RegExp|Error|JSON)\b/i,
                    message: 'Objetos globais não permitidos'
                }
            ];
            
            for (const check of securityChecks) {
                if (check.pattern.test(expression)) {
                    return {
                        isValid: false,
                        error: check.message
                    };
                }
            }
            
            // Validar balanceamento de parênteses
            let parenthesesCount = 0;
            for (const char of expression) {
                if (char === '(') parenthesesCount++;
                else if (char === ')') parenthesesCount--;
                if (parenthesesCount < 0) {
                    return {
                        isValid: false,
                        error: 'Parênteses não balanceados'
                    };
                }
            }
            if (parenthesesCount !== 0) {
                return {
                    isValid: false,
                    error: 'Parênteses não balanceados'
                };
            }
            
            // Validar operadores
            if (/[+\-*/.]{2,}/.test(expression) || /^[*/.+]/.test(expression) || /[*/.+]$/.test(expression)) {
                return {
                    isValid: false,
                    error: 'Operadores inválidos ou mal posicionados'
                };
            }
            
            return { isValid: true };
            
        } catch (error) {
            securityLogger.error('Validation error', { expression, error: error.message });
            return {
                isValid: false,
                error: 'Erro na validação da expressão'
            };
        }
    }
    
    /**
     * Sanitiza entrada do usuário
     * @param {string} input - Entrada do usuário
     * @returns {string} Entrada sanitizada
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            throw new Error('Entrada deve ser uma string');
        }
        
        // Remove caracteres perigosos e normaliza
        return input
            .trim()
            .replace(/[<>"'&]/g, '') // Remove caracteres HTML perigosos
            .replace(/\x00/g, '') // Remove null bytes
            .slice(0, 10000); // Limita tamanho
    }
    
    /**
     * Valida comando do usuário
     * @param {string} command - Comando a ser validado
     * @returns {Object} Resultado da validação
     */
    validateCommand(command) {
        try {
            const schema = joi.string()
                .pattern(/^[a-zA-Z0-9\/\-_\s.]+$/)
                .min(1)
                .max(500)
                .required();
            
            const { error } = schema.validate(command);
            if (error) {
                securityLogger.warn('Invalid command blocked', { command });
                return {
                    isValid: false,
                    error: 'Comando contém caracteres não permitidos'
                };
            }
            
            return { isValid: true };
            
        } catch (error) {
            securityLogger.error('Command validation error', { command, error: error.message });
            return {
                isValid: false,
                error: 'Erro na validação do comando'
            };
        }
    }
}

module.exports = SecurityModule;


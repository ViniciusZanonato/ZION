const winston = require('winston');
const path = require('path');
const fs = require('fs').promises;

// Configuração de logging avançado
const errorLogger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: 'logs/error.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            level: 'info',
            maxsize: 5242880,
            maxFiles: 3
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
            level: 'warn'
        })
    ]
});

// Logger para eventos gerais
const generalLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({ 
            format: winston.format.simple(),
            level: 'warn'
        })
    ]
});

class ErrorHandler {
    constructor() {
        this.errorCounts = new Map();
        this.maxErrorsPerMinute = 10;
        this.errorThrottleMap = new Map();
        
        // Inicializar diretório de logs
        this.initializeLogsDirectory();
        
        // Configurar handlers globais
        this.setupGlobalHandlers();
    }
    
    /**
     * Inicializa diretório de logs
     */
    async initializeLogsDirectory() {
        try {
            await fs.mkdir('logs', { recursive: true });
        } catch (error) {
            console.error('Falha ao criar diretório de logs:', error.message);
        }
    }
    
    /**
     * Configura handlers globais para erros não capturados
     */
    setupGlobalHandlers() {
        // Erros não capturados
        process.on('uncaughtException', (error) => {
            this.logCriticalError('Uncaught Exception', error);
            // Dar tempo para o log ser escrito antes de sair
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        });
        
        // Promises rejeitadas não tratadas
        process.on('unhandledRejection', (reason, promise) => {
            this.logCriticalError('Unhandled Promise Rejection', reason, { promise });
        });
        
        // Avisos
        process.on('warning', (warning) => {
            this.logWarning('Process Warning', warning.message, {
                name: warning.name,
                stack: warning.stack
            });
        });
    }
    
    /**
     * Loga erro crítico que pode causar crash
     * @param {string} type - Tipo do erro
     * @param {Error|string} error - Erro ou mensagem
     * @param {Object} context - Contexto adicional
     */
    logCriticalError(type, error, context = {}) {
        const errorInfo = {
            type,
            message: error?.message || error,
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            process: {
                pid: process.pid,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            },
            ...context
        };
        
        errorLogger.error('CRITICAL ERROR', errorInfo);
        console.error('🚨 ERRO CRÍTICO:', type, error?.message || error);
    }
    
    /**
     * Loga erro padrão
     * @param {string} operation - Operação que falhou
     * @param {Error|string} error - Erro
     * @param {Object} context - Contexto adicional
     * @param {string} userId - ID do usuário (opcional)
     */
    logError(operation, error, context = {}, userId = null) {
        // Throttling de erros repetitivos
        const errorKey = `${operation}:${error?.message || error}`;
        if (this.isErrorThrottled(errorKey)) {
            return;
        }
        
        const errorInfo = {
            operation,
            message: error?.message || error,
            stack: error?.stack,
            userId,
            timestamp: new Date().toISOString(),
            ...context
        };
        
        errorLogger.error('Operation Error', errorInfo);
        
        // Incrementar contador de erros
        this.incrementErrorCount(operation);
    }
    
    /**
     * Loga warning
     * @param {string} operation - Operação
     * @param {string} message - Mensagem
     * @param {Object} context - Contexto
     */
    logWarning(operation, message, context = {}) {
        const warningInfo = {
            operation,
            message,
            timestamp: new Date().toISOString(),
            ...context
        };
        
        generalLogger.warn('Warning', warningInfo);
    }
    
    /**
     * Loga informação
     * @param {string} operation - Operação
     * @param {string} message - Mensagem
     * @param {Object} context - Contexto
     */
    logInfo(operation, message, context = {}) {
        const info = {
            operation,
            message,
            timestamp: new Date().toISOString(),
            ...context
        };
        
        generalLogger.info('Info', info);
    }
    
    /**
     * Verifica se erro está sendo throttled
     * @param {string} errorKey - Chave do erro
     * @returns {boolean} Se está throttled
     */
    isErrorThrottled(errorKey) {
        const now = Date.now();
        const throttleInfo = this.errorThrottleMap.get(errorKey);
        
        if (!throttleInfo) {
            this.errorThrottleMap.set(errorKey, {
                count: 1,
                firstOccurrence: now,
                lastOccurrence: now
            });
            return false;
        }
        
        // Se passou mais de 1 minuto, resetar contador
        if (now - throttleInfo.firstOccurrence > 60000) {
            this.errorThrottleMap.set(errorKey, {
                count: 1,
                firstOccurrence: now,
                lastOccurrence: now
            });
            return false;
        }
        
        // Se ainda não excedeu o limite, permitir
        if (throttleInfo.count < this.maxErrorsPerMinute) {
            throttleInfo.count++;
            throttleInfo.lastOccurrence = now;
            return false;
        }
        
        // Throttled
        return true;
    }
    
    /**
     * Incrementa contador de erros por operação
     * @param {string} operation - Nome da operação
     */
    incrementErrorCount(operation) {
        const current = this.errorCounts.get(operation) || 0;
        this.errorCounts.set(operation, current + 1);
    }
    
    /**
     * Obtém estatísticas de erros
     * @returns {Object} Estatísticas
     */
    getErrorStats() {
        const stats = {
            totalUniqueErrors: this.errorCounts.size,
            errorsByOperation: Object.fromEntries(this.errorCounts),
            throttledErrors: this.errorThrottleMap.size,
            timestamp: new Date().toISOString()
        };
        
        return stats;
    }
    
    /**
     * Wrapper para executação segura de funções assíncronas
     * @param {Function} asyncFn - Função assíncrona
     * @param {string} operation - Nome da operação
     * @param {*} fallbackValue - Valor de fallback em caso de erro
     * @param {Object} context - Contexto adicional
     * @returns {Promise<*>} Resultado ou fallback
     */
    async safeExecute(asyncFn, operation, fallbackValue = null, context = {}) {
        try {
            return await asyncFn();
        } catch (error) {
            this.logError(operation, error, context);
            return fallbackValue;
        }
    }
    
    /**
     * Wrapper para executação segura de funções síncronas
     * @param {Function} syncFn - Função síncrona
     * @param {string} operation - Nome da operação
     * @param {*} fallbackValue - Valor de fallback em caso de erro
     * @param {Object} context - Contexto adicional
     * @returns {*} Resultado ou fallback
     */
    safeExecuteSync(syncFn, operation, fallbackValue = null, context = {}) {
        try {
            return syncFn();
        } catch (error) {
            this.logError(operation, error, context);
            return fallbackValue;
        }
    }
    
    /**
     * Cria uma versão "safe" de qualquer função
     * @param {Function} fn - Função original
     * @param {string} operation - Nome da operação
     * @param {*} fallbackValue - Valor de fallback
     * @returns {Function} Função segura
     */
    createSafeFunction(fn, operation, fallbackValue = null) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.logError(operation, error, { args });
                return fallbackValue;
            }
        };
    }
    
    /**
     * Valida e sanitiza entrada do usuário
     * @param {string} input - Entrada do usuário
     * @param {Object} options - Opções de validação
     * @returns {Object} Resultado da validação
     */
    validateUserInput(input, options = {}) {
        const {
            maxLength = 1000,
            allowedChars = /^[\w\s\-.,!?@#$%&*()+={}\[\]:;"'<>\/\\|`~]+$/,
            forbiddenPatterns = [/\b(eval|function|script|javascript)\b/i]
        } = options;
        
        const result = {
            isValid: true,
            sanitized: input,
            errors: []
        };
        
        try {
            // Verificar se input existe
            if (!input || typeof input !== 'string') {
                result.isValid = false;
                result.errors.push('Input deve ser uma string não vazia');
                return result;
            }
            
            // Verificar tamanho
            if (input.length > maxLength) {
                result.errors.push(`Input muito longo (max: ${maxLength})`);
                result.sanitized = input.substring(0, maxLength);
            }
            
            // Verificar caracteres permitidos
            if (!allowedChars.test(input)) {
                result.isValid = false;
                result.errors.push('Input contém caracteres não permitidos');
            }
            
            // Verificar padrões proibidos
            for (const pattern of forbiddenPatterns) {
                if (pattern.test(input)) {
                    result.isValid = false;
                    result.errors.push('Input contém padrões de segurança proibidos');
                    this.logWarning('Security', 'Potentially malicious input detected', {
                        input: input.substring(0, 100),
                        pattern: pattern.toString()
                    });
                    break;
                }
            }
            
            // Sanitizar HTML básico
            result.sanitized = result.sanitized
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
            
        } catch (error) {
            this.logError('InputValidation', error);
            result.isValid = false;
            result.errors.push('Erro interno na validação');
        }
        
        return result;
    }
    
    /**
     * Limpa estatísticas antigas
     */
    cleanupStats() {
        const now = Date.now();
        
        // Limpar throttle map de entradas antigas (mais de 5 minutos)
        for (const [key, info] of this.errorThrottleMap.entries()) {
            if (now - info.lastOccurrence > 300000) {
                this.errorThrottleMap.delete(key);
            }
        }
        
        this.logInfo('Cleanup', 'Error statistics cleaned up', {
            remainingThrottledErrors: this.errorThrottleMap.size
        });
    }
}

// Instância singleton
const errorHandler = new ErrorHandler();

// Limpar estatísticas a cada 10 minutos
setInterval(() => {
    errorHandler.cleanupStats();
}, 10 * 60 * 1000);

module.exports = {
    ErrorHandler,
    errorHandler,
    errorLogger,
    generalLogger
};


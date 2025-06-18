/**
 * ZION Error Handler - Sistema de tratamento de erros
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 1000;
        this.logFile = path.join(__dirname, '..', 'logs', 'errors.log');
        
        // Criar diretório de logs se não existir
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    /**
     * Manipula erro geral
     */
    handleError(error, context = 'Unknown', critical = false) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            context,
            critical,
            message: error.message || 'Unknown error',
            stack: error.stack || 'No stack trace',
            code: error.code || null
        };

        // Adicionar ao log interno
        this.addToLog(errorEntry);

        // Exibir no console
        this.displayError(errorEntry);

        // Salvar em arquivo
        this.saveToFile(errorEntry);

        // Se for crítico, pode tomar ações especiais
        if (critical) {
            this.handleCriticalError(errorEntry);
        }

        return errorEntry;
    }

    /**
     * Adiciona erro ao log interno
     */
    addToLog(errorEntry) {
        this.errorLog.push(errorEntry);
        
        // Manter tamanho máximo do log
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }
    }

    /**
     * Exibe erro no console
     */
    displayError(errorEntry) {
        const icon = errorEntry.critical ? '⚡' : '❌';
        const color = errorEntry.critical ? chalk.redBright : chalk.red;
        
        console.log(color(`${icon} [${errorEntry.context}] ${errorEntry.message}`));
        
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.gray(errorEntry.stack));
        }
    }

    /**
     * Salva erro em arquivo
     */
    saveToFile(errorEntry) {
        try {
            const logLine = `${errorEntry.timestamp} [${errorEntry.context}] ${errorEntry.critical ? 'CRITICAL' : 'ERROR'}: ${errorEntry.message}\n`;
            fs.appendFileSync(this.logFile, logLine);
        } catch (fileError) {
            console.error(chalk.yellow('⚠️  Não foi possível salvar erro em arquivo:'), fileError.message);
        }
    }

    /**
     * Manipula erros críticos
     */
    handleCriticalError(errorEntry) {
        console.log(chalk.redBright.bold('😨 ERRO CRÍTICO DETECTADO!'));
        console.log(chalk.yellow('Sistema pode ficar instável. Considere reiniciar o ZION.'));
        
        // Aqui você pode adicionar lógica para:
        // - Notificar administradores
        // - Fazer backup de estado
        // - Tentar recuperação automática
    }

    /**
     * Manipula erro de API
     */
    handleAPIError(error, apiName, endpoint = null) {
        const context = endpoint ? `${apiName}:${endpoint}` : apiName;
        
        let userMessage = 'Erro na comunicação com serviço externo';
        
        // Mensagens específicas para diferentes tipos de erro
        if (error.code === 'ENOTFOUND') {
            userMessage = 'Serviço indisponível. Verifique sua conexão com a internet.';
        } else if (error.code === 'ECONNREFUSED') {
            userMessage = 'Conexão recusada pelo servidor.';
        } else if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                userMessage = 'Autenticação falhou. Verifique suas credenciais de API.';
            } else if (status === 403) {
                userMessage = 'Acesso negado. Permissões insuficientes.';
            } else if (status === 429) {
                userMessage = 'Limite de taxa excedido. Tente novamente em alguns minutos.';
            } else if (status >= 500) {
                userMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            }
        }
        
        this.handleError(error, context);
        return userMessage;
    }

    /**
     * Manipula erro de validação
     */
    handleValidationError(field, value, rule) {
        const error = new Error(`Validação falhou para '${field}': ${rule}`);
        error.field = field;
        error.value = value;
        error.rule = rule;
        
        return this.handleError(error, 'Validation');
    }

    /**
     * Manipula erro de arquivo
     */
    handleFileError(error, filePath, operation = 'access') {
        const context = `File:${operation}`;
        let userMessage = `Erro ao ${operation === 'read' ? 'ler' : operation === 'write' ? 'escrever' : 'acessar'} arquivo: ${path.basename(filePath)}`;
        
        if (error.code === 'ENOENT') {
            userMessage = `Arquivo não encontrado: ${path.basename(filePath)}`;
        } else if (error.code === 'EACCES') {
            userMessage = `Permissão negada para arquivo: ${path.basename(filePath)}`;
        } else if (error.code === 'ENOSPC') {
            userMessage = 'Espaço em disco insuficiente';
        }
        
        this.handleError(error, context);
        return userMessage;
    }

    /**
     * Obtém estatísticas de erro
     */
    getErrorStats() {
        const total = this.errorLog.length;
        const critical = this.errorLog.filter(e => e.critical).length;
        const byContext = {};
        
        this.errorLog.forEach(error => {
            byContext[error.context] = (byContext[error.context] || 0) + 1;
        });
        
        return {
            total,
            critical,
            byContext,
            recent: this.errorLog.slice(-10) // Últimos 10 erros
        };
    }

    /**
     * Limpa log de erros
     */
    clearErrorLog() {
        this.errorLog = [];
        console.log(chalk.green('✅ Log de erros limpo'));
    }

    /**
     * Exibe relatório de erros
     */
    showErrorReport() {
        const stats = this.getErrorStats();
        
        console.log(chalk.blue.bold('\n📈 RELATÓRIO DE ERROS'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.white(`Total de erros: ${stats.total}`));
        console.log(chalk.red(`Erros críticos: ${stats.critical}`));
        
        if (Object.keys(stats.byContext).length > 0) {
            console.log(chalk.yellow('\nErros por contexto:'));
            Object.entries(stats.byContext)
                .sort(([,a], [,b]) => b - a)
                .forEach(([context, count]) => {
                    console.log(chalk.gray(`  ${context}: ${count}`));
                });
        }
        
        if (stats.recent.length > 0) {
            console.log(chalk.yellow('\nÚltimos erros:'));
            stats.recent.forEach(error => {
                const time = new Date(error.timestamp).toLocaleTimeString();
                console.log(chalk.gray(`  [${time}] ${error.context}: ${error.message}`));
            });
        }
        
        console.log();
    }

    /**
     * Configura manipuladores globais de erro
     */
    setupGlobalHandlers() {
        // Erros não capturados
        process.on('uncaughtException', (error) => {
            this.handleError(error, 'UncaughtException', true);
            console.log(chalk.redBright('🚫 Sistema será encerrado devido a erro crítico'));
            process.exit(1);
        });
        
        // Promises rejeitadas não capturadas
        process.on('unhandledRejection', (reason, promise) => {
            const error = reason instanceof Error ? reason : new Error(String(reason));
            this.handleError(error, 'UnhandledRejection', true);
        });
        
        // Warnings
        process.on('warning', (warning) => {
            console.log(chalk.yellow(`⚠️  ${warning.name}: ${warning.message}`));
        });
    }
}

module.exports = ErrorHandler;


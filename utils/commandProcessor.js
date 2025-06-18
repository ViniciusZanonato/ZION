const { errorHandler } = require('./errorHandler');
const { safeCalculator } = require('./safeCalculator');
const { conversationHistory } = require('./conversationHistory');
const chalk = require('chalk');
const figlet = require('figlet');
const boxen = require('boxen');
const inquirer = require('inquirer');

/**
 * Classe base para processadores de comandos
 */
class BaseCommandProcessor {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.commands = new Map();
    }
    
    /**
     * Registra um comando
     * @param {string|number} trigger - Comando ou número
     * @param {Object} commandInfo - Informações do comando
     */
    registerCommand(trigger, commandInfo) {
        this.commands.set(String(trigger), {
            ...commandInfo,
            processor: this.name
        });
    }
    
    /**
     * Processa um comando
     * @param {string} input - Entrada do usuário
     * @param {Object} context - Contexto da sessão
     * @returns {Promise<Object>} Resultado do processamento
     */
    async processCommand(input, context = {}) {
        throw new Error('processCommand deve ser implementado pela subclasse');
    }
    
    /**
     * Obtém lista de comandos disponíveis
     * @returns {Array} Lista de comandos
     */
    getAvailableCommands() {
        return Array.from(this.commands.entries()).map(([trigger, info]) => ({
            trigger,
            ...info
        }));
    }
    
    /**
     * Verifica se pode processar o comando
     * @param {string} input - Entrada do usuário
     * @returns {boolean} Se pode processar
     */
    canProcess(input) {
        const cleanInput = input.trim();
        return this.commands.has(cleanInput) || this.commands.has(cleanInput.toLowerCase());
    }
    
    /**
     * Valida entrada do usuário
     * @param {string} input - Entrada
     * @returns {Object} Resultado da validação
     */
    validateInput(input) {
        return errorHandler.validateUserInput(input, {
            maxLength: 2000,
            allowedChars: /^[\w\s\-.,!?@#$%&*()+={}\[\]:;"'<>\/\\|`~]+$/,
            forbiddenPatterns: [
                /\b(eval|function|script|javascript|onclick|onerror)\b/i,
                /<script[^>]*>.*?<\/script>/gi,
                /javascript:/gi
            ]
        });
    }
}

/**
 * Processador de comandos de sistema
 */
class SystemCommandProcessor extends BaseCommandProcessor {
    constructor() {
        super('system', 'Comandos de sistema e informações');
        this.setupCommands();
    }
    
    setupCommands() {
        this.registerCommand('0', {
            name: 'Sair',
            description: 'Encerra o programa',
            category: 'sistema',
            action: 'exit'
        });
        
        this.registerCommand('ajuda', {
            name: 'Ajuda',
            description: 'Mostra comandos disponíveis',
            category: 'sistema',
            action: 'help'
        });
        
        this.registerCommand('stats', {
            name: 'Estatísticas',
            description: 'Mostra estatísticas do sistema',
            category: 'sistema',
            action: 'stats'
        });
        
        this.registerCommand('historico', {
            name: 'Histórico',
            description: 'Mostra histórico de conversas',
            category: 'sistema',
            action: 'history'
        });
        
        this.registerCommand('limpar', {
            name: 'Limpar',
            description: 'Limpa a tela',
            category: 'sistema',
            action: 'clear'
        });
    }
    
    async processCommand(input, context = {}) {
        const validation = this.validateInput(input);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.errors.join(', '),
                type: 'validation_error'
            };
        }
        
        const cleanInput = validation.sanitized.trim().toLowerCase();
        const command = this.commands.get(cleanInput);
        
        if (!command) {
            return {
                success: false,
                error: 'Comando de sistema não encontrado',
                type: 'command_not_found'
            };
        }
        
        try {
            switch (command.action) {
                case 'exit':
                    return await this.handleExit(context);
                case 'help':
                    return await this.handleHelp(context);
                case 'stats':
                    return await this.handleStats(context);
                case 'history':
                    return await this.handleHistory(context);
                case 'clear':
                    return await this.handleClear(context);
                default:
                    throw new Error(`Ação não implementada: ${command.action}`);
            }
        } catch (error) {
            errorHandler.logError('SystemCommand', error, { command: command.action, input });
            return {
                success: false,
                error: 'Erro interno ao processar comando de sistema',
                type: 'internal_error'
            };
        }
    }
    
    async handleExit(context) {
        const stats = errorHandler.getErrorStats();
        const historyStats = conversationHistory.getStats();
        
        console.log(chalk.yellow('\n📊 ESTATÍSTICAS DA SESSÃO:'));
        console.log(chalk.cyan(`• Erros únicos: ${stats.totalUniqueErrors}`));
        console.log(chalk.cyan(`• Mensagens no histórico: ${historyStats.messageCount}`));
        console.log(chalk.cyan(`• Sessões ativas: ${historyStats.activeSessions}`));
        
        console.log(chalk.green('\n🤖 Obrigado por usar ZION! Até logo!'));
        
        // Salvar histórico antes de sair
        await conversationHistory.saveHistory();
        
        return {
            success: true,
            message: 'Saindo do sistema...',
            type: 'exit',
            shouldExit: true
        };
    }
    
    async handleHelp(context) {
        const allProcessors = context.processors || [];
        let helpText = chalk.cyan('\n🤖 COMANDOS DISPONÍVEIS:\n');
        
        for (const processor of allProcessors) {
            const commands = processor.getAvailableCommands();
            if (commands.length > 0) {
                helpText += chalk.yellow(`\n📂 ${processor.description.toUpperCase()}:\n`);
                
                commands.forEach(cmd => {
                    helpText += chalk.white(`  ${cmd.trigger.padEnd(15)} - ${cmd.description}\n`);
                });
            }
        }
        
        helpText += chalk.green('\n💡 Digite um comando ou número para executar.');
        
        return {
            success: true,
            message: helpText,
            type: 'help'
        };
    }
    
    async handleStats(context) {
        const errorStats = errorHandler.getErrorStats();
        const historyStats = conversationHistory.getStats();
        const memoryUsage = process.memoryUsage();
        
        const statsText = chalk.cyan('\n📊 ESTATÍSTICAS DO SISTEMA:\n') +
            chalk.white(`\n🔧 Sistema:`) +
            chalk.gray(`\n  • Uptime: ${Math.floor(process.uptime())}s`) +
            chalk.gray(`\n  • Memória RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB`) +
            chalk.gray(`\n  • Memória Heap: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`) +
            chalk.white(`\n\n❌ Erros:`) +
            chalk.gray(`\n  • Erros únicos: ${errorStats.totalUniqueErrors}`) +
            chalk.gray(`\n  • Erros throttled: ${errorStats.throttledErrors}`) +
            chalk.white(`\n\n💬 Conversas:`) +
            chalk.gray(`\n  • Mensagens: ${historyStats.messageCount}`) +
            chalk.gray(`\n  • Sessões ativas: ${historyStats.activeSessions}`) +
            chalk.gray(`\n  • Histórico salvo: ${historyStats.archivedMessages}`);
        
        return {
            success: true,
            message: statsText,
            type: 'stats',
            data: { errorStats, historyStats, memoryUsage }
        };
    }
    
    async handleHistory(context) {
        const history = conversationHistory.getRecentMessages(10);
        
        if (history.length === 0) {
            return {
                success: true,
                message: chalk.yellow('\n📝 Nenhuma mensagem no histórico.'),
                type: 'history'
            };
        }
        
        let historyText = chalk.cyan('\n📝 HISTÓRICO RECENTE:\n');
        
        history.forEach((msg, index) => {
            const timestamp = new Date(msg.timestamp).toLocaleTimeString();
            const truncated = msg.content.length > 50 ? 
                msg.content.substring(0, 50) + '...' : msg.content;
            
            historyText += chalk.gray(`\n${index + 1}. [${timestamp}] `) +
                chalk.white(`${msg.type}: ${truncated}`);
        });
        
        return {
            success: true,
            message: historyText,
            type: 'history',
            data: { history }
        };
    }
    
    async handleClear(context) {
        console.clear();
        
        // Mostrar banner novamente
        const banner = figlet.textSync('ZION', {
            font: 'Big',
            horizontalLayout: 'fitted'
        });
        
        console.log(chalk.cyan(banner));
        console.log(chalk.yellow('🤖 Superinteligência Artificial Reativada'));
        
        return {
            success: true,
            message: 'Tela limpa com sucesso!',
            type: 'clear'
        };
    }
}

/**
 * Processador de comandos de cálculo
 */
class CalculatorCommandProcessor extends BaseCommandProcessor {
    constructor() {
        super('calculator', 'Comandos de cálculo e matemática');
        this.setupCommands();
    }
    
    setupCommands() {
        this.registerCommand('calc', {
            name: 'Calculadora',
            description: 'Calcula expressões matemáticas',
            category: 'matematica',
            action: 'calculate'
        });
        
        this.registerCommand('math', {
            name: 'Matemática',
            description: 'Resolve problemas matemáticos',
            category: 'matematica',
            action: 'calculate'
        });
    }
    
    async processCommand(input, context = {}) {
        const validation = this.validateInput(input);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.errors.join(', '),
                type: 'validation_error'
            };
        }
        
        // Extrair expressão matemática do input
        const expression = this.extractExpression(validation.sanitized);
        
        if (!expression) {
            return {
                success: false,
                error: 'Nenhuma expressão matemática encontrada',
                type: 'no_expression'
            };
        }
        
        try {
            const result = await safeCalculator.calculate(expression);
            
            if (result.success) {
                const responseText = chalk.green(`\n🧮 Resultado: ${result.result}`) +
                    (result.details ? chalk.gray(`\n📝 Detalhes: ${result.details}`) : '');
                
                // Adicionar ao histórico
                conversationHistory.addMessage(
                    `calc: ${expression}`,
                    'user',
                    context.sessionId
                );
                
                conversationHistory.addMessage(
                    `result: ${result.result}`,
                    'assistant',
                    context.sessionId
                );
                
                return {
                    success: true,
                    message: responseText,
                    type: 'calculation',
                    data: { expression, result: result.result }
                };
            } else {
                return {
                    success: false,
                    error: result.error,
                    type: 'calculation_error'
                };
            }
        } catch (error) {
            errorHandler.logError('Calculator', error, { expression, input });
            return {
                success: false,
                error: 'Erro interno na calculadora',
                type: 'internal_error'
            };
        }
    }
    
    /**
     * Extrai expressão matemática do input
     * @param {string} input - Input do usuário
     * @returns {string|null} Expressão ou null
     */
    extractExpression(input) {
        // Remover comando inicial
        let expression = input.replace(/^(calc|math)\s*/i, '').trim();
        
        // Se não há expressão, retornar null
        if (!expression) {
            return null;
        }
        
        // Verificar se parece com uma expressão matemática
        if (!/[0-9+\-*/().\s]/.test(expression)) {
            return null;
        }
        
        return expression;
    }
}

/**
 * Gerenciador principal de comandos
 */
class CommandManager {
    constructor() {
        this.processors = [];
        this.setupDefaultProcessors();
    }
    
    /**
     * Configura processadores padrão
     */
    setupDefaultProcessors() {
        this.registerProcessor(new SystemCommandProcessor());
        this.registerProcessor(new CalculatorCommandProcessor());
    }
    
    /**
     * Registra um processador de comandos
     * @param {BaseCommandProcessor} processor - Processador
     */
    registerProcessor(processor) {
        if (!(processor instanceof BaseCommandProcessor)) {
            throw new Error('Processador deve herdar de BaseCommandProcessor');
        }
        
        this.processors.push(processor);
        errorHandler.logInfo('CommandManager', `Processador registrado: ${processor.name}`);
    }
    
    /**
     * Processa um comando do usuário
     * @param {string} input - Entrada do usuário
     * @param {Object} context - Contexto da sessão
     * @returns {Promise<Object>} Resultado do processamento
     */
    async processCommand(input, context = {}) {
        if (!input || typeof input !== 'string') {
            return {
                success: false,
                error: 'Entrada inválida',
                type: 'invalid_input'
            };
        }
        
        const cleanInput = input.trim();
        
        if (!cleanInput) {
            return {
                success: false,
                error: 'Entrada vazia',
                type: 'empty_input'
            };
        }
        
        // Adicionar lista de processadores ao contexto
        context.processors = this.processors;
        
        // Tentar processar com cada processador
        for (const processor of this.processors) {
            if (processor.canProcess(cleanInput)) {
                try {
                    const result = await processor.processCommand(cleanInput, context);
                    
                    // Log da operação
                    errorHandler.logInfo('CommandManager', 
                        `Comando processado por ${processor.name}`, 
                        { 
                            input: cleanInput.substring(0, 100), 
                            success: result.success,
                            type: result.type
                        }
                    );
                    
                    return result;
                } catch (error) {
                    errorHandler.logError('CommandManager', error, {
                        processor: processor.name,
                        input: cleanInput.substring(0, 100)
                    });
                }
            }
        }
        
        // Se nenhum processador pode lidar com o comando
        return {
            success: false,
            error: 'Comando não reconhecido. Digite "ajuda" para ver comandos disponíveis.',
            type: 'command_not_found'
        };
    }
    
    /**
     * Obtém todos os comandos disponíveis
     * @returns {Array} Lista de comandos organizados por processador
     */
    getAllCommands() {
        return this.processors.map(processor => ({
            processor: processor.name,
            description: processor.description,
            commands: processor.getAvailableCommands()
        }));
    }
    
    /**
     * Obtém estatísticas dos processadores
     * @returns {Object} Estatísticas
     */
    getStats() {
        return {
            totalProcessors: this.processors.length,
            processors: this.processors.map(p => ({
                name: p.name,
                description: p.description,
                commandCount: p.commands.size
            })),
            totalCommands: this.processors.reduce((sum, p) => sum + p.commands.size, 0)
        };
    }
}

// Instância singleton
const commandManager = new CommandManager();

module.exports = {
    BaseCommandProcessor,
    SystemCommandProcessor,
    CalculatorCommandProcessor,
    CommandManager,
    commandManager
};


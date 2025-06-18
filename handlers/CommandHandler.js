const chalk = require('chalk');
const { logger } = require('../utils/logger');

/**
 * CommandHandler class - Separates command processing logic from main chatbot
 * Handles command parsing, validation, and routing to appropriate handlers
 */
class CommandHandler {
    constructor(chatbot) {
        this.chatbot = chatbot;
        this.logger = logger.child({ component: 'CommandHandler' });
        
        // Command registry with metadata
        this.commands = new Map();
        this.setupCommands();
    }
    
    setupCommands() {
        // Weather commands
        this.registerCommand('weather', {
            handler: 'handleWeatherCommand',
            description: 'Get weather information for a location',
            usage: 'weather <location>',
            category: 'Weather',
            requiresParams: true,
            aliases: ['w']
        });
        
        // News commands
        this.registerCommand('news', {
            handler: 'handleNewsCommand',
            description: 'Get latest news',
            usage: 'news [category]',
            category: 'News',
            aliases: ['n']
        });
        
        // Time commands
        this.registerCommand('time', {
            handler: 'handleTimeCommand',
            description: 'Get current time for a location',
            usage: 'time <location>',
            category: 'Time',
            requiresParams: true,
            aliases: ['t']
        });
        
        // Country information
        this.registerCommand('country', {
            handler: 'handleCountryCommand',
            description: 'Get information about a country',
            usage: 'country <country_name>',
            category: 'Geography',
            requiresParams: true,
            aliases: ['c']
        });
        
        // Space/NASA commands
        this.registerCommand('space', {
            handler: 'handleSpaceCommand',
            description: 'Get space-related information',
            usage: 'space [apod|iss|mars]',
            category: 'Space',
            aliases: ['nasa']
        });
        
        // ArXiv research
        this.registerCommand('research', {
            handler: 'handleResearchCommand',
            description: 'Search academic papers on ArXiv',
            usage: 'research <query>',
            category: 'Research',
            requiresParams: true,
            aliases: ['arxiv', 'papers']
        });
        
        // Financial data
        this.registerCommand('finance', {
            handler: 'handleFinanceCommand',
            description: 'Get financial market data',
            usage: 'finance <symbol>',
            category: 'Finance',
            requiresParams: true,
            aliases: ['stock', 'crypto']
        });
        
        // System commands
        this.registerCommand('system', {
            handler: 'handleSystemCommand',
            description: 'System diagnostics and information',
            usage: 'system [info|health|logs]',
            category: 'System',
            aliases: ['sys']
        });
        
        // PDF analysis
        this.registerCommand('pdf', {
            handler: 'handlePdfCommand',
            description: 'Analyze PDF files',
            usage: 'pdf <file_path>',
            category: 'Analysis',
            requiresParams: true
        });
        
        // Voice commands
        this.registerCommand('voice', {
            handler: 'handleVoiceCommand',
            description: 'Voice synthesis and recognition',
            usage: 'voice <text>',
            category: 'Voice',
            requiresParams: true,
            aliases: ['speak', 'tts']
        });
        
        // Auto-modification
        this.registerCommand('automod', {
            handler: 'handleAutoModCommand',
            description: 'AI-powered code modification',
            usage: 'automod <instruction>',
            category: 'AI',
            requiresParams: true,
            aliases: ['modify', 'ai-mod']
        });
        
        // OSINT commands
        this.registerCommand('osint', {
            handler: 'handleOsintCommand',
            description: 'Open Source Intelligence gathering',
            usage: 'osint <target>',
            category: 'Security',
            requiresParams: true
        });
        
        // Pentest commands
        this.registerCommand('pentest', {
            handler: 'handlePentestCommand',
            description: 'Penetration testing tools',
            usage: 'pentest <target>',
            category: 'Security',
            requiresParams: true
        });
        
        // Math evaluation
        this.registerCommand('calc', {
            handler: 'handleCalculateCommand',
            description: 'Safe mathematical calculations',
            usage: 'calc <expression>',
            category: 'Utilities',
            requiresParams: true,
            aliases: ['calculate', 'math']
        });
        
        // Help command
        this.registerCommand('help', {
            handler: 'handleHelpCommand',
            description: 'Show available commands',
            usage: 'help [command]',
            category: 'System',
            aliases: ['h', '?']
        });
        
        // Menu command
        this.registerCommand('menu', {
            handler: 'showMenu',
            description: 'Show command menu',
            usage: 'menu',
            category: 'System',
            aliases: ['m']
        });
        
        // Exit command
        this.registerCommand('exit', {
            handler: 'handleExitCommand',
            description: 'Exit ZION chatbot',
            usage: 'exit',
            category: 'System',
            aliases: ['quit', 'bye']
        });
    }
    
    registerCommand(name, config) {
        this.commands.set(name.toLowerCase(), config);
        
        // Register aliases
        if (config.aliases) {
            config.aliases.forEach(alias => {
                this.commands.set(alias.toLowerCase(), { ...config, isAlias: true, originalName: name });
            });
        }
        
        this.logger.debug(`Registered command: ${name}`, { config });
    }
    
    parseCommand(input) {
        const trimmed = input.trim();
        if (!trimmed) return null;
        
        const parts = trimmed.split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        const fullArgs = args.join(' ');
        
        return {
            command,
            args,
            fullArgs,
            originalInput: input
        };
    }
    
    isCommand(input) {
        const parsed = this.parseCommand(input);
        return parsed && this.commands.has(parsed.command);
    }
    
    async executeCommand(input, user = 'user') {
        const startTime = Date.now();
        const parsed = this.parseCommand(input);
        
        if (!parsed) {
            this.logger.warn('Invalid command format', { input });
            return { success: false, error: 'Invalid command format' };
        }
        
        const commandConfig = this.commands.get(parsed.command);
        if (!commandConfig) {
            this.logger.warn('Unknown command', { command: parsed.command });
            return { success: false, error: `Unknown command: ${parsed.command}` };
        }
        
        // Log command execution
        this.logger.command(parsed.command, user, {
            args: parsed.args,
            fullArgs: parsed.fullArgs
        });
        
        try {
            // Validate parameters if required
            if (commandConfig.requiresParams && !parsed.fullArgs) {
                const error = `Command '${parsed.command}' requires parameters. Usage: ${commandConfig.usage}`;
                this.logger.warn('Command missing required parameters', {
                    command: parsed.command,
                    usage: commandConfig.usage
                });
                return { success: false, error };
            }
            
            // Execute the command
            const handler = commandConfig.handler;
            let result;
            
            if (typeof this.chatbot[handler] === 'function') {
                result = await this.chatbot[handler](parsed.fullArgs, parsed.args);
            } else {
                throw new Error(`Handler method '${handler}' not found`);
            }
            
            const duration = Date.now() - startTime;
            this.logger.performance(`Command ${parsed.command}`, duration, {
                command: parsed.command,
                success: true
            });
            
            return { success: true, result, duration };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.exception(error, {
                command: parsed.command,
                args: parsed.args,
                duration
            });
            
            return {
                success: false,
                error: error.message,
                duration
            };
        }
    }
    
    getCommandHelp(commandName) {
        const command = this.commands.get(commandName?.toLowerCase());
        if (!command) return null;
        
        return {
            name: commandName,
            description: command.description,
            usage: command.usage,
            category: command.category,
            aliases: command.aliases || []
        };
    }
    
    getCommandsByCategory() {
        const categories = {};
        
        for (const [name, config] of this.commands) {
            // Skip aliases
            if (config.isAlias) continue;
            
            const category = config.category || 'Miscellaneous';
            if (!categories[category]) {
                categories[category] = [];
            }
            
            categories[category].push({
                name,
                description: config.description,
                usage: config.usage,
                aliases: config.aliases || []
            });
        }
        
        return categories;
    }
    
    getAllCommands() {
        const commands = [];
        
        for (const [name, config] of this.commands) {
            // Skip aliases
            if (config.isAlias) continue;
            
            commands.push({
                name,
                description: config.description,
                usage: config.usage,
                category: config.category,
                aliases: config.aliases || []
            });
        }
        
        return commands.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Helper method to handle help command
    async handleHelpCommand(query) {
        if (query) {
            const help = this.getCommandHelp(query);
            if (help) {
                console.log(chalk.blue(`\n📖 Help for command: ${help.name}`));
                console.log(chalk.gray(`Description: ${help.description}`));
                console.log(chalk.gray(`Usage: ${help.usage}`));
                console.log(chalk.gray(`Category: ${help.category}`));
                if (help.aliases.length > 0) {
                    console.log(chalk.gray(`Aliases: ${help.aliases.join(', ')}`));
                }
            } else {
                console.log(chalk.red(`\n❌ Command '${query}' not found`));
            }
        } else {
            const categories = this.getCommandsByCategory();
            console.log(chalk.blue('\n📚 Available Commands:'));
            
            for (const [category, commands] of Object.entries(categories)) {
                console.log(chalk.yellow(`\n${category}:`));
                commands.forEach(cmd => {
                    const aliases = cmd.aliases.length > 0 ? chalk.gray(` (${cmd.aliases.join(', ')})`) : '';
                    console.log(`  ${chalk.green(cmd.name)}${aliases} - ${cmd.description}`);
                });
            }
            
            console.log(chalk.gray('\nUse "help <command>" for detailed information about a specific command.'));
        }
    }
    
    // Utility method for command validation
    validateCommand(commandName, args) {
        const command = this.commands.get(commandName?.toLowerCase());
        if (!command) {
            return { valid: false, error: `Unknown command: ${commandName}` };
        }
        
        if (command.requiresParams && (!args || args.length === 0)) {
            return {
                valid: false,
                error: `Command '${commandName}' requires parameters. Usage: ${command.usage}`
            };
        }
        
        return { valid: true, command };
    }
}

module.exports = CommandHandler;


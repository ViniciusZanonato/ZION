const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const { EventEmitter } = require('events');

/**
 * Advanced Command Processor V2 - Dynamic, Flexible, and Extensible
 * Complete reimplementation with modern architecture patterns
 */
class CommandProcessorV2 extends EventEmitter {
    constructor(zionInstance) {
        super();
        this.zion = zionInstance;
        this.commands = new Map();
        this.aliases = new Map();
        this.middleware = [];
        this.history = [];
        this.permissions = new Map();
        this.categories = new Map();
        this.hooks = new Map();
        this.plugins = new Map();
        this.cache = new Map();
        this.statistics = {
            totalExecuted: 0,
            successCount: 0,
            errorCount: 0,
            averageExecutionTime: 0,
            commandUsage: new Map()
        };
        
        // Initialize with existing commands
        this.initializeBuiltinCommands();
        
        console.log(chalk.green('🚀 Advanced Command Processor V2 initialized'));
        console.log(chalk.gray(`   Registered ${this.commands.size} commands across ${this.categories.size} categories`));
    }
    
    /**
     * Register a new command dynamically
     * @param {Object} commandConfig - Command configuration object
     */
    registerCommand(commandConfig) {
        const {
            name,
            handler,
            description = 'No description provided',
            category = 'Miscellaneous',
            aliases = [],
            permissions = [],
            middleware = [],
            examples = [],
            parameters = [],
            hidden = false,
            deprecated = false,
            version = '1.0.0',
            author = 'ZION',
            tags = []
        } = commandConfig;
        
        if (!name || typeof name !== 'string') {
            throw new Error('Command name is required and must be a string');
        }
        
        if (!handler || typeof handler !== 'function') {
            throw new Error('Command handler is required and must be a function');
        }
        
        const command = {
            name: name.toLowerCase(),
            originalName: name,
            handler,
            description,
            category,
            aliases: aliases.map(a => a.toLowerCase()),
            permissions,
            middleware,
            examples,
            parameters,
            hidden,
            deprecated,
            version,
            author,
            tags,
            registeredAt: new Date(),
            executionCount: 0,
            lastExecuted: null,
            averageExecutionTime: 0
        };
        
        // Register main command
        this.commands.set(command.name, command);
        
        // Register aliases
        aliases.forEach(alias => {
            this.aliases.set(alias.toLowerCase(), command.name);
        });
        
        // Add to category
        if (!this.categories.has(category)) {
            this.categories.set(category, []);
        }
        this.categories.get(category).push(command.name);
        
        this.emit('commandRegistered', command);
        
        return command;
    }
    
    /**
     * Unregister a command
     * @param {string} name - Command name to unregister
     */
    unregisterCommand(name) {
        const commandName = name.toLowerCase();
        const command = this.commands.get(commandName);
        
        if (!command) {
            return false;
        }
        
        // Remove from commands
        this.commands.delete(commandName);
        
        // Remove aliases
        command.aliases.forEach(alias => {
            this.aliases.delete(alias);
        });
        
        // Remove from category
        const categoryCommands = this.categories.get(command.category);
        if (categoryCommands) {
            const index = categoryCommands.indexOf(commandName);
            if (index > -1) {
                categoryCommands.splice(index, 1);
            }
            
            // Remove empty category
            if (categoryCommands.length === 0) {
                this.categories.delete(command.category);
            }
        }
        
        this.emit('commandUnregistered', command);
        
        return true;
    }
    
    /**
     * Register middleware for command processing
     * @param {Function} middleware - Middleware function
     * @param {number} priority - Execution priority (lower = earlier)
     */
    use(middleware, priority = 100) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }
        
        this.middleware.push({ fn: middleware, priority });
        this.middleware.sort((a, b) => a.priority - b.priority);
    }
    
    /**
     * Main command processing method
     * @param {string} input - Raw input string
     * @param {Object} context - Execution context
     */
    async processCommand(input, context = {}) {
        const startTime = Date.now();
        
        try {
            // Parse the input
            const parsed = this.parseInput(input);
            
            if (!parsed) {
                return this.showHelp();
            }
            
            // Create execution context
            const execContext = {
                ...context,
                command: parsed.command,
                args: parsed.args,
                rawInput: input,
                timestamp: new Date(),
                user: context.user || 'system',
                session: context.session || 'default'
            };
            
            // Find command
            const command = this.findCommand(parsed.command);
            
            if (!command) {
                return this.handleCommandNotFound(parsed.command, execContext);
            }
            
            // Check if deprecated
            if (command.deprecated) {
                console.log(chalk.yellow(`⚠️  Warning: Command '${command.name}' is deprecated`));
            }
            
            // Execute middleware chain
            const middlewareResult = await this.executeMiddleware(command, execContext);
            
            if (middlewareResult === false) {
                return;
            }
            
            // Check permissions
            if (!this.checkPermissions(command, execContext)) {
                console.log(chalk.red(`❌ Access denied for command '${command.name}'`));
                return;
            }
            
            // Execute pre-hooks
            await this.executeHooks('pre', command.name, execContext);
            
            // Execute the command
            const result = await this.executeCommand(command, execContext);
            
            // Execute post-hooks
            await this.executeHooks('post', command.name, { ...execContext, result });
            
            // Update statistics
            this.updateStatistics(command, startTime, true);
            
            // Add to history
            this.addToHistory({
                command: command.name,
                args: parsed.args,
                executedAt: new Date(),
                executionTime: Date.now() - startTime,
                success: true,
                result
            });
            
            this.emit('commandExecuted', { command, context: execContext, result });
            
            return result;
            
        } catch (error) {
            const executionTime = Date.now() - startTime;
            
            console.log(chalk.red(`❌ Command execution failed: ${error.message}`));
            
            if (process.env.DEBUG === 'true') {
                console.log(chalk.gray(error.stack));
            }
            
            // Update error statistics
            this.statistics.errorCount++;
            this.statistics.totalExecuted++;
            
            // Add to history
            this.addToHistory({
                command: input,
                executedAt: new Date(),
                executionTime,
                success: false,
                error: error.message
            });
            
            this.emit('commandError', { input, error, context });
            
            throw error;
        }
    }
    
    /**
     * Parse input string into command and arguments
     * @param {string} input - Raw input string
     */
    parseInput(input) {
        if (!input || typeof input !== 'string') {
            return null;
        }
        
        const trimmed = input.trim();
        
        // Check if it starts with slash
        if (!trimmed.startsWith('/')) {
            return null;
        }
        
        // Remove leading slash
        const withoutSlash = trimmed.substring(1);
        
        if (withoutSlash.length === 0) {
            return null;
        }
        
        // Split into command and arguments
        const parts = withoutSlash.split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        return {
            command,
            args,
            rawArgs: withoutSlash.substring(command.length).trim()
        };
    }
    
    /**
     * Find command by name or alias
     * @param {string} name - Command name or alias
     */
    findCommand(name) {
        const lowerName = name.toLowerCase();
        
        // Direct command lookup
        if (this.commands.has(lowerName)) {
            return this.commands.get(lowerName);
        }
        
        // Alias lookup
        if (this.aliases.has(lowerName)) {
            const realName = this.aliases.get(lowerName);
            return this.commands.get(realName);
        }
        
        // Fuzzy matching for typos
        const suggestions = this.findSimilarCommands(lowerName);
        
        if (suggestions.length > 0) {
            console.log(chalk.yellow(`❓ Did you mean: ${suggestions.join(', ')}?`));
        }
        
        return null;
    }
    
    /**
     * Find similar commands for typo suggestions
     * @param {string} input - Input command name
     */
    findSimilarCommands(input) {
        const allCommands = Array.from(this.commands.keys());
        const suggestions = [];
        
        for (const command of allCommands) {
            if (this.calculateSimilarity(input, command) > 0.6) {
                suggestions.push(command);
            }
        }
        
        return suggestions.slice(0, 3);
    }
    
    /**
     * Calculate string similarity using Levenshtein distance
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     */
    calculateSimilarity(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        const maxLength = Math.max(str1.length, str2.length);
        return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
    }
    
    /**
     * Execute middleware chain
     * @param {Object} command - Command object
     * @param {Object} context - Execution context
     */
    async executeMiddleware(command, context) {
        // Global middleware
        for (const middleware of this.middleware) {
            const result = await middleware.fn(command, context, this);
            if (result === false) {
                return false;
            }
        }
        
        // Command-specific middleware
        for (const middleware of command.middleware) {
            const result = await middleware(command, context, this);
            if (result === false) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check command permissions
     * @param {Object} command - Command object
     * @param {Object} context - Execution context
     */
    checkPermissions(command, context) {
        if (command.permissions.length === 0) {
            return true;
        }
        
        const userPermissions = context.permissions || [];
        
        return command.permissions.every(permission => 
            userPermissions.includes(permission) || userPermissions.includes('admin')
        );
    }
    
    /**
     * Execute command hooks
     * @param {string} type - Hook type ('pre' or 'post')
     * @param {string} commandName - Command name
     * @param {Object} context - Execution context
     */
    async executeHooks(type, commandName, context) {
        const hooksKey = `${type}:${commandName}`;
        const hooks = this.hooks.get(hooksKey) || [];
        
        for (const hook of hooks) {
            try {
                await hook(context, this);
            } catch (error) {
                console.log(chalk.red(`Hook execution failed: ${error.message}`));
            }
        }
    }
    
    /**
     * Execute the command handler
     * @param {Object} command - Command object
     * @param {Object} context - Execution context
     */
    async executeCommand(command, context) {
        try {
            const result = await command.handler(context.args, context, this.zion);
            
            // Update command statistics
            command.executionCount++;
            command.lastExecuted = new Date();
            
            return result;
            
        } catch (error) {
            console.log(chalk.red(`Command '${command.name}' failed: ${error.message}`));
            throw error;
        }
    }
    
    /**
     * Handle command not found
     * @param {string} commandName - Unknown command name
     * @param {Object} context - Execution context
     */
    handleCommandNotFound(commandName, context) {
        console.log(chalk.red(`❌ Unknown command: '${commandName}'`));
        
        // Show suggestions
        const suggestions = this.findSimilarCommands(commandName);
        if (suggestions.length > 0) {
            console.log(chalk.yellow(`💡 Did you mean: ${suggestions.join(', ')}?`));
        }
        
        console.log(chalk.gray('Use /help to see all available commands'));
        
        this.emit('commandNotFound', { commandName, context });
    }
    
    /**
     * Update execution statistics
     * @param {Object} command - Command object
     * @param {number} startTime - Execution start time
     * @param {boolean} success - Whether execution was successful
     */
    updateStatistics(command, startTime, success) {
        const executionTime = Date.now() - startTime;
        
        this.statistics.totalExecuted++;
        
        if (success) {
            this.statistics.successCount++;
        }
        
        // Update average execution time
        const totalTime = this.statistics.averageExecutionTime * (this.statistics.totalExecuted - 1) + executionTime;
        this.statistics.averageExecutionTime = totalTime / this.statistics.totalExecuted;
        
        // Update command usage statistics
        const usage = this.statistics.commandUsage.get(command.name) || 0;
        this.statistics.commandUsage.set(command.name, usage + 1);
        
        // Update command average execution time
        const commandTotalTime = command.averageExecutionTime * (command.executionCount - 1) + executionTime;
        command.averageExecutionTime = commandTotalTime / command.executionCount;
    }
    
    /**
     * Add command execution to history
     * @param {Object} entry - History entry
     */
    addToHistory(entry) {
        this.history.unshift(entry);
        
        // Keep only last 100 entries
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
    }
    
    /**
     * Register a hook for command execution
     * @param {string} type - Hook type ('pre' or 'post')
     * @param {string} commandName - Command name
     * @param {Function} hook - Hook function
     */
    registerHook(type, commandName, hook) {
        const key = `${type}:${commandName}`;
        
        if (!this.hooks.has(key)) {
            this.hooks.set(key, []);
        }
        
        this.hooks.get(key).push(hook);
    }
    
    /**
     * Load and register a plugin
     * @param {Object} plugin - Plugin object
     */
    loadPlugin(plugin) {
        if (!plugin.name || !plugin.commands) {
            throw new Error('Plugin must have name and commands');
        }
        
        // Register plugin commands
        for (const commandConfig of plugin.commands) {
            this.registerCommand({
                ...commandConfig,
                author: plugin.author || plugin.name,
                version: plugin.version || '1.0.0'
            });
        }
        
        // Register plugin middleware
        if (plugin.middleware) {
            for (const middleware of plugin.middleware) {
                this.use(middleware.fn, middleware.priority);
            }
        }
        
        // Register plugin hooks
        if (plugin.hooks) {
            for (const [key, hooks] of Object.entries(plugin.hooks)) {
                const [type, commandName] = key.split(':');
                for (const hook of hooks) {
                    this.registerHook(type, commandName, hook);
                }
            }
        }
        
        this.plugins.set(plugin.name, plugin);
        
        console.log(chalk.green(`🔌 Plugin '${plugin.name}' loaded successfully`));
        
        this.emit('pluginLoaded', plugin);
    }
    
    /**
     * Show comprehensive help
     * @param {string} commandName - Specific command to get help for
     */
    async showHelp(commandName = null) {
        if (commandName) {
            return this.showCommandHelp(commandName);
        }
        
        console.log(boxen(
            chalk.red.bold('🤖 ZION COMMAND PROCESSOR V2\n') +
            chalk.gray('Advanced Dynamic Command System\n') +
            chalk.yellow(`📊 ${this.commands.size} commands | ${this.categories.size} categories | ${this.plugins.size} plugins`),
            {
                padding: 1,
                borderColor: 'red',
                title: '🚀 COMMAND SYSTEM'
            }
        ));
        
        // Show categories
        for (const [category, commands] of this.categories.entries()) {
            if (commands.length === 0) continue;
            
            console.log(chalk.red.bold(`\n📁 ${category.toUpperCase()}`));
            
            for (const commandName of commands) {
                const command = this.commands.get(commandName);
                if (!command || command.hidden) continue;
                
                const status = command.deprecated ? chalk.yellow('[DEPRECATED]') : '';
                const aliases = command.aliases.length > 0 ? chalk.gray(`(${command.aliases.join(', ')})`) : '';
                
                console.log(chalk.yellow(`  /${command.name} ${aliases} ${status}`));
                console.log(chalk.gray(`    ${command.description}`));
                
                if (command.examples.length > 0) {
                    console.log(chalk.blue(`    Example: ${command.examples[0]}`));
                }
            }
        }
        
        console.log(chalk.gray('\n💡 Use /help <command> for detailed information about a specific command'));
        console.log(chalk.gray('💡 Use /stats to see usage statistics'));
        console.log(chalk.gray('💡 Use /history to see recent command history'));
    }
    
    /**
     * Show detailed help for a specific command
     * @param {string} commandName - Command to show help for
     */
    showCommandHelp(commandName) {
        const command = this.findCommand(commandName);
        
        if (!command) {
            console.log(chalk.red(`❌ Command '${commandName}' not found`));
            return;
        }
        
        const helpContent = 
            chalk.red.bold(`/${command.originalName}\n`) +
            chalk.white(`${command.description}\n\n`) +
            (command.aliases.length > 0 ? chalk.gray(`Aliases: ${command.aliases.join(', ')}\n`) : '') +
            chalk.blue(`Category: ${command.category}\n`) +
            chalk.blue(`Version: ${command.version}\n`) +
            chalk.blue(`Author: ${command.author}\n`) +
            (command.tags.length > 0 ? chalk.blue(`Tags: ${command.tags.join(', ')}\n`) : '') +
            chalk.gray(`Executed: ${command.executionCount} times\n`) +
            (command.lastExecuted ? chalk.gray(`Last used: ${command.lastExecuted.toLocaleString()}\n`) : '') +
            (command.averageExecutionTime > 0 ? chalk.gray(`Avg execution time: ${Math.round(command.averageExecutionTime)}ms\n`) : '');
        
        console.log(boxen(helpContent, {
            padding: 1,
            borderColor: 'blue',
            title: `📖 COMMAND HELP`
        }));
        
        // Show parameters
        if (command.parameters.length > 0) {
            console.log(chalk.blue('\n📋 Parameters:'));
            command.parameters.forEach(param => {
                const required = param.required ? chalk.red('[REQUIRED]') : chalk.gray('[OPTIONAL]');
                console.log(chalk.yellow(`  ${param.name} ${required}`));
                console.log(chalk.gray(`    ${param.description}`));
                if (param.type) {
                    console.log(chalk.gray(`    Type: ${param.type}`));
                }
                if (param.default !== undefined) {
                    console.log(chalk.gray(`    Default: ${param.default}`));
                }
            });
        }
        
        // Show examples
        if (command.examples.length > 0) {
            console.log(chalk.blue('\n💡 Examples:'));
            command.examples.forEach(example => {
                console.log(chalk.green(`  ${example}`));
            });
        }
        
        // Show permissions
        if (command.permissions.length > 0) {
            console.log(chalk.blue('\n🔒 Required permissions:'));
            command.permissions.forEach(permission => {
                console.log(chalk.yellow(`  ${permission}`));
            });
        }
        
        if (command.deprecated) {
            console.log(chalk.yellow('\n⚠️  This command is deprecated and may be removed in future versions'));
        }
    }
    
    /**
     * Show system statistics
     */
    showStatistics() {
        const stats = this.statistics;
        const successRate = stats.totalExecuted > 0 ? (stats.successCount / stats.totalExecuted * 100).toFixed(1) : 0;
        
        const statsContent = 
            chalk.red.bold('📊 COMMAND PROCESSOR STATISTICS\n\n') +
            chalk.yellow(`Total Commands Executed: ${stats.totalExecuted}\n`) +
            chalk.green(`Successful Executions: ${stats.successCount}\n`) +
            chalk.red(`Failed Executions: ${stats.errorCount}\n`) +
            chalk.blue(`Success Rate: ${successRate}%\n`) +
            chalk.cyan(`Average Execution Time: ${Math.round(stats.averageExecutionTime)}ms\n`) +
            chalk.magenta(`Registered Commands: ${this.commands.size}\n`) +
            chalk.magenta(`Active Plugins: ${this.plugins.size}\n`) +
            chalk.magenta(`Middleware Count: ${this.middleware.length}`);
        
        console.log(boxen(statsContent, {
            padding: 1,
            borderColor: 'cyan',
            title: '📈 SYSTEM STATISTICS'
        }));
        
        // Show most used commands
        if (stats.commandUsage.size > 0) {
            console.log(chalk.blue('\n🏆 Most Used Commands:'));
            const sortedUsage = Array.from(stats.commandUsage.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            sortedUsage.forEach(([command, count], index) => {
                console.log(chalk.yellow(`  ${index + 1}. /${command} - ${count} times`));
            });
        }
    }
    
    /**
     * Show command execution history
     * @param {number} limit - Number of entries to show
     */
    showHistory(limit = 10) {
        if (this.history.length === 0) {
            console.log(chalk.gray('No command history available'));
            return;
        }
        
        console.log(boxen(
            chalk.red.bold('📜 COMMAND HISTORY\n') +
            chalk.gray(`Showing last ${Math.min(limit, this.history.length)} commands`),
            {
                padding: 1,
                borderColor: 'magenta',
                title: '🕒 HISTORY'
            }
        ));
        
        this.history.slice(0, limit).forEach((entry, index) => {
            const status = entry.success ? chalk.green('✓') : chalk.red('✗');
            const time = entry.executedAt.toLocaleTimeString();
            const executionTime = `${entry.executionTime}ms`;
            
            console.log(`${status} ${chalk.yellow(entry.command)} ${chalk.gray(entry.args?.join(' ') || '')}`);
            console.log(`  ${chalk.gray(time)} | ${chalk.blue(executionTime)}`);
            
            if (!entry.success && entry.error) {
                console.log(`  ${chalk.red('Error:')} ${entry.error}`);
            }
        });
    }
    
    /**
     * Initialize all builtin commands from the original system
     */
    initializeBuiltinCommands() {
        // This method will register all the existing commands
        // We'll implement this next with all the original commands
        console.log(chalk.blue('🔄 Initializing builtin commands...'));
        
        // We'll add all the original commands here in the next part
        this.registerBuiltinCommands();
    }
    
    /**
     * Register all builtin commands
     */
    registerBuiltinCommands() {
        // Help command
        this.registerCommand({
            name: 'help',
            handler: async (args) => {
                const commandName = args[0];
                return await this.showHelp(commandName);
            },
            description: 'Show help information for commands',
            category: 'System & Control',
            aliases: ['h', '?'],
            examples: ['/help', '/help weather', '/? news'],
            parameters: [
                {
                    name: 'command',
                    description: 'Specific command to get help for',
                    required: false,
                    type: 'string'
                }
            ]
        });
        
        // Statistics command
        this.registerCommand({
            name: 'stats',
            handler: async () => {
                return this.showStatistics();
            },
            description: 'Show command processor statistics',
            category: 'System & Control',
            aliases: ['statistics', 'info'],
            examples: ['/stats']
        });
        
        // History command
        this.registerCommand({
            name: 'history',
            handler: async (args) => {
                const limit = parseInt(args[0]) || 10;
                return this.showHistory(limit);
            },
            description: 'Show command execution history',
            category: 'System & Control',
            aliases: ['hist'],
            examples: ['/history', '/history 20'],
            parameters: [
                {
                    name: 'limit',
                    description: 'Number of entries to show',
                    required: false,
                    type: 'number',
                    default: 10
                }
            ]
        });
        
        // We'll continue adding all the original commands in the next part...
        console.log(chalk.green(`✅ Initialized ${this.commands.size} builtin commands`));
    }
    
    /**
     * Get all commands in a category
     * @param {string} category - Category name
     */
    getCommandsByCategory(category) {
        const commands = this.categories.get(category) || [];
        return commands.map(name => this.commands.get(name)).filter(cmd => cmd && !cmd.hidden);
    }
    
    /**
     * Search commands by keyword
     * @param {string} keyword - Search keyword
     */
    searchCommands(keyword) {
        const results = [];
        const lowerKeyword = keyword.toLowerCase();
        
        for (const command of this.commands.values()) {
            if (command.hidden) continue;
            
            const matches = 
                command.name.includes(lowerKeyword) ||
                command.description.toLowerCase().includes(lowerKeyword) ||
                command.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)) ||
                command.aliases.some(alias => alias.includes(lowerKeyword));
            
            if (matches) {
                results.push(command);
            }
        }
        
        return results;
    }
    
    /**
     * Export configuration for backup/restore
     */
    exportConfig() {
        return {
            commands: Array.from(this.commands.entries()),
            aliases: Array.from(this.aliases.entries()),
            categories: Array.from(this.categories.entries()),
            statistics: this.statistics,
            timestamp: new Date()
        };
    }
    
    /**
     * Clear all caches
     */
    clearCache() {
        this.cache.clear();
        console.log(chalk.green('🗑️ Command processor cache cleared'));
    }
    
    /**
     * Gracefully shutdown the command processor
     */
    async shutdown() {
        console.log(chalk.yellow('🔄 Shutting down command processor...'));
        
        // Clear all timers, close connections, etc.
        this.clearCache();
        this.removeAllListeners();
        
        console.log(chalk.green('✅ Command processor shutdown complete'));
    }
}

module.exports = CommandProcessorV2;


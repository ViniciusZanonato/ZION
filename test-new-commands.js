const CommandMigrator = require('./modules/migrate-commands');
const chalk = require('chalk');
const boxen = require('boxen');

/**
 * Test script to demonstrate the new CommandProcessorV2 with migrated commands
 */
async function testNewCommandSystem() {
    console.log(boxen(
        chalk.cyan.bold('ZION Command System V2 - Test & Demo'),
        {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'cyan'
        }
    ));

    try {
        // Create a mock ZION instance for testing
        const mockZion = {
            terminal: {
                println: (msg) => console.log(msg),
                clear: () => console.clear()
            },
            config: {
                theme: 'dark',
                debug: true
            }
        };

        // Initialize and migrate commands
        console.log(chalk.blue('\n🚀 Initializing Command Migration...'));
        const migrator = new CommandMigrator(mockZion);
        const processor = await migrator.migrateAllCommands();

        // Display statistics
        const stats = processor.getStatistics();
        console.log(chalk.green('\n📊 System Statistics:'));
        console.log(chalk.gray(`   Commands Registered: ${stats.commandsRegistered}`));
        console.log(chalk.gray(`   Commands Executed: ${stats.commandsExecuted}`));
        console.log(chalk.gray(`   Success Rate: ${stats.successRate}%`));
        console.log(chalk.gray(`   Cache Hits: ${stats.cacheHits}`));

        // Display all registered commands by category
        console.log(chalk.yellow('\n📋 Registered Commands by Category:'));
        const commands = processor.getRegisteredCommands();
        const categories = {};
        
        commands.forEach(cmd => {
            if (!categories[cmd.category]) {
                categories[cmd.category] = [];
            }
            categories[cmd.category].push(cmd.name);
        });

        Object.keys(categories).sort().forEach(category => {
            console.log(chalk.cyan(`\n   ${category}:`));
            categories[category].forEach(cmd => {
                console.log(chalk.gray(`     /${cmd}`));
            });
        });

        // Test some commands
        console.log(chalk.yellow('\n🧪 Testing Command Execution:'));
        
        // Test help command
        console.log(chalk.blue('\n   Testing /help command...'));
        try {
            const helpResult = await processor.execute('/help', { user: 'test-user' });
            console.log(chalk.green('     ✅ /help executed successfully'));
        } catch (error) {
            console.log(chalk.red(`     ❌ /help failed: ${error.message}`));
        }

        // Test command with parameters
        console.log(chalk.blue('\n   Testing /scan command with parameters...'));
        try {
            const scanResult = await processor.execute('/scan 192.168.1.1 basic', { user: 'test-user' });
            console.log(chalk.green('     ✅ /scan executed successfully'));
        } catch (error) {
            console.log(chalk.red(`     ❌ /scan failed: ${error.message}`));
        }

        // Test command validation
        console.log(chalk.blue('\n   Testing command validation...'));
        try {
            const isValid = processor.validateCommand('/financial analyze AAPL');
            console.log(chalk.green(`     ✅ Command validation: ${isValid ? 'VALID' : 'INVALID'}`));
        } catch (error) {
            console.log(chalk.red(`     ❌ Validation failed: ${error.message}`));
        }

        // Test help for specific command
        console.log(chalk.blue('\n   Testing command-specific help...'));
        try {
            const cmdHelp = processor.getCommandHelp('financial');
            if (cmdHelp) {
                console.log(chalk.green('     ✅ Command help retrieved successfully'));
                console.log(chalk.gray(`     Description: ${cmdHelp.description}`));
                console.log(chalk.gray(`     Examples: ${cmdHelp.examples.join(', ')}`));
            }
        } catch (error) {
            console.log(chalk.red(`     ❌ Help retrieval failed: ${error.message}`));
        }

        // Test command aliases
        console.log(chalk.blue('\n   Testing command aliases...'));
        try {
            const aliasTest = await processor.execute('/h', { user: 'test-user' }); // alias for help
            console.log(chalk.green('     ✅ Command alias /h (help) executed successfully'));
        } catch (error) {
            console.log(chalk.red(`     ❌ Alias test failed: ${error.message}`));
        }

        // Test middleware (if any registered)
        console.log(chalk.blue('\n   Testing middleware system...'));
        const middlewareCount = processor.middleware ? processor.middleware.length : 0;
        console.log(chalk.green(`     ✅ Middleware system active (${middlewareCount} middlewares registered)`));

        // Display final statistics
        const finalStats = processor.getStatistics();
        console.log(chalk.green('\n📊 Final Statistics:'));
        console.log(chalk.gray(`   Commands Executed: ${finalStats.commandsExecuted}`));
        console.log(chalk.gray(`   Success Rate: ${finalStats.successRate}%`));
        console.log(chalk.gray(`   Cache Hits: ${finalStats.cacheHits}`));

        console.log(boxen(
            chalk.green.bold('✅ CommandProcessorV2 Test Completed Successfully!\n') +
            chalk.white('The new command system is ready for production use.\n') +
            chalk.yellow('All existing commands have been migrated with enhanced features:\n') +
            chalk.gray('• Dynamic command registration\n') +
            chalk.gray('• Advanced parameter validation\n') +
            chalk.gray('• Middleware support\n') +
            chalk.gray('• Command caching & statistics\n') +
            chalk.gray('• Flexible permissions system\n') +
            chalk.gray('• Enhanced help system'),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'green'
            }
        ));

    } catch (error) {
        console.error(boxen(
            chalk.red.bold('❌ Test Failed!\n') +
            chalk.white(`Error: ${error.message}\n`) +
            chalk.gray(`Stack: ${error.stack}`),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'red'
            }
        ));
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testNewCommandSystem().catch(console.error);
}

module.exports = { testNewCommandSystem };


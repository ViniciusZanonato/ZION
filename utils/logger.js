const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

/**
 * Comprehensive logging system for ZION chatbot
 * Provides structured logging with multiple levels and outputs
 */
class Logger {
    constructor(options = {}) {
        this.logLevel = process.env.LOG_LEVEL || options.logLevel || 'info';
        this.logToFile = options.logToFile !== false; // Default to true
        this.logToConsole = options.logToConsole !== false; // Default to true
        this.logDir = options.logDir || './logs';
        this.maxLogFiles = options.maxLogFiles || 7; // Keep 7 days of logs
        
        // Create logs directory if it doesn't exist
        this.ensureLogDirectory();
        
        // Log levels
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };
        
        this.currentLogLevel = this.levels[this.logLevel] || this.levels.info;
    }
    
    ensureLogDirectory() {
        if (this.logToFile && !fs.existsSync(this.logDir)) {
            try {
                fs.mkdirSync(this.logDir, { recursive: true });
            } catch (error) {
                console.error(chalk.red('Failed to create log directory:'), error.message);
                this.logToFile = false;
            }
        }
    }
    
    getLogFileName() {
        const date = moment().format('YYYY-MM-DD');
        return path.join(this.logDir, `zion-${date}.log`);
    }
    
    cleanOldLogs() {
        if (!this.logToFile) return;
        
        try {
            const files = fs.readdirSync(this.logDir);
            const logFiles = files
                .filter(file => file.startsWith('zion-') && file.endsWith('.log'))
                .map(file => ({
                    name: file,
                    path: path.join(this.logDir, file),
                    time: fs.statSync(path.join(this.logDir, file)).mtime
                }))
                .sort((a, b) => b.time - a.time);
            
            // Remove old log files
            if (logFiles.length > this.maxLogFiles) {
                logFiles.slice(this.maxLogFiles).forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (error) {
                        console.error(chalk.yellow('Failed to remove old log file:'), file.name);
                    }
                });
            }
        } catch (error) {
            console.error(chalk.yellow('Failed to clean old logs:'), error.message);
        }
    }
    
    formatMessage(level, message, context = {}) {
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        const levelStr = level.toUpperCase().padEnd(5);
        
        let logEntry = {
            timestamp,
            level: levelStr.trim(),
            message,
            ...context
        };
        
        // Console format
        const consoleMessage = `${chalk.gray(timestamp)} ${this.getLevelColor(level)(levelStr)} ${message}`;
        
        // File format (JSON)
        const fileMessage = JSON.stringify(logEntry) + '\n';
        
        return { consoleMessage, fileMessage, logEntry };
    }
    
    getLevelColor(level) {
        const colors = {
            error: chalk.red,
            warn: chalk.yellow,
            info: chalk.blue,
            debug: chalk.green,
            trace: chalk.gray
        };
        return colors[level] || chalk.white;
    }
    
    shouldLog(level) {
        return this.levels[level] <= this.currentLogLevel;
    }
    
    log(level, message, context = {}) {
        if (!this.shouldLog(level)) return;
        
        const formatted = this.formatMessage(level, message, context);
        
        // Console output
        if (this.logToConsole) {
            console.log(formatted.consoleMessage);
            
            // Add context if present
            if (Object.keys(context).length > 0) {
                console.log(chalk.gray('  Context:'), context);
            }
        }
        
        // File output
        if (this.logToFile) {
            try {
                fs.appendFileSync(this.getLogFileName(), formatted.fileMessage);
            } catch (error) {
                console.error(chalk.red('Failed to write to log file:'), error.message);
            }
        }
        
        // Clean old logs periodically
        if (Math.random() < 0.01) { // 1% chance on each log
            this.cleanOldLogs();
        }
    }
    
    error(message, context = {}) {
        this.log('error', message, context);
    }
    
    warn(message, context = {}) {
        this.log('warn', message, context);
    }
    
    info(message, context = {}) {
        this.log('info', message, context);
    }
    
    debug(message, context = {}) {
        this.log('debug', message, context);
    }
    
    trace(message, context = {}) {
        this.log('trace', message, context);
    }
    
    // Special methods for ZION-specific logging
    neural(message, context = {}) {
        const neuralMessage = `🧠 NEURAL: ${message}`;
        this.info(neuralMessage, { category: 'neural', ...context });
    }
    
    command(command, user, context = {}) {
        this.info(`Command executed: ${command}`, { 
            category: 'command', 
            command, 
            user,
            ...context 
        });
    }
    
    api(service, operation, duration, success, context = {}) {
        const message = `API ${service}.${operation} ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`;
        const level = success ? 'info' : 'warn';
        this.log(level, message, { 
            category: 'api', 
            service, 
            operation, 
            duration, 
            success,
            ...context 
        });
    }
    
    security(event, level = 'warn', context = {}) {
        this.log(level, `🔒 SECURITY: ${event}`, { 
            category: 'security', 
            event,
            ...context 
        });
    }
    
    performance(operation, duration, context = {}) {
        const level = duration > 5000 ? 'warn' : 'info';
        this.log(level, `⚡ PERFORMANCE: ${operation} took ${duration}ms`, {
            category: 'performance',
            operation,
            duration,
            ...context
        });
    }
    
    // Error handling with stack trace
    exception(error, context = {}) {
        this.error(`Exception: ${error.message}`, {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            ...context
        });
    }
    
    // Create a child logger with additional context
    child(additionalContext = {}) {
        const childLogger = new Logger({
            logLevel: this.logLevel,
            logToFile: this.logToFile,
            logToConsole: this.logToConsole,
            logDir: this.logDir,
            maxLogFiles: this.maxLogFiles
        });
        
        // Override log method to include additional context
        const originalLog = childLogger.log.bind(childLogger);
        childLogger.log = (level, message, context = {}) => {
            originalLog(level, message, { ...additionalContext, ...context });
        };
        
        return childLogger;
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = {
    Logger,
    logger
};


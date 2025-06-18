const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');

class DatabaseModule {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'data', 'zion.db');
        this.db = null;
        this.initDatabase();
    }

    // Inicializar banco de dados
    async initDatabase() {
        try {
            // Criar diretório data se não existir
            const dataDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Conectar ao banco
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.log(chalk.red(`⚠️  Erro ao conectar com banco: ${err.message}`));
                } else {
                    console.log(chalk.green('📊 Banco de dados neural inicializado'));
                    this.createTables();
                }
            });
        } catch (error) {
            console.log(chalk.red(`🚨 Falha crítica no banco: ${error.message}`));
        }
    }

    // Criar tabelas necessárias
    createTables() {
        const tables = [
            // Tabela de conversas
            `CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_message TEXT NOT NULL,
                assistant_response TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                tokens_used INTEGER DEFAULT 0,
                model_used TEXT DEFAULT 'gemini-2.5-pro'
            )`,
            
            // Tabela de configurações do usuário
            `CREATE TABLE IF NOT EXISTS user_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                setting_key TEXT UNIQUE NOT NULL,
                setting_value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Tabela de comandos executados
            `CREATE TABLE IF NOT EXISTS command_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                command TEXT NOT NULL,
                parameters TEXT,
                execution_time INTEGER, -- em ms
                success BOOLEAN DEFAULT 1,
                error_message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Tabela de análise de PDFs
            `CREATE TABLE IF NOT EXISTS pdf_analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT NOT NULL,
                file_size INTEGER,
                analysis_summary TEXT,
                questions_asked TEXT, -- JSON array
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        tables.forEach(tableSQL => {
            this.db.run(tableSQL, (err) => {
                if (err) {
                    console.log(chalk.red(`Erro ao criar tabela: ${err.message}`));
                }
            });
        });
    }

    // Salvar conversa
    async saveConversation(sessionId, userMessage, assistantResponse, tokensUsed = 0, modelUsed = 'gemini-2.5-pro') {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO conversations (session_id, user_message, assistant_response, tokens_used, model_used) 
                        VALUES (?, ?, ?, ?, ?)`;
            
            this.db.run(sql, [sessionId, userMessage, assistantResponse, tokensUsed, modelUsed], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    // Buscar conversas por sessão
    async getConversationHistory(sessionId, limit = 50) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT user_message, assistant_response, timestamp 
                        FROM conversations 
                        WHERE session_id = ? 
                        ORDER BY timestamp DESC 
                        LIMIT ?`;
            
            this.db.all(sql, [sessionId, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.reverse()); // Mais antiga primeiro
                }
            });
        });
    }

    // Estatísticas de uso
    async getUsageStats() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT 
                           COUNT(*) as total_conversations,
                           SUM(tokens_used) as total_tokens,
                           COUNT(DISTINCT session_id) as unique_sessions,
                           AVG(tokens_used) as avg_tokens_per_message,
                           DATE(timestamp) as date,
                           COUNT(*) as messages_per_day
                        FROM conversations 
                        GROUP BY DATE(timestamp)
                        ORDER BY date DESC
                        LIMIT 30`;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Salvar configuração
    async saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT OR REPLACE INTO user_settings (setting_key, setting_value, updated_at) 
                        VALUES (?, ?, CURRENT_TIMESTAMP)`;
            
            this.db.run(sql, [key, JSON.stringify(value)], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    // Buscar configuração
    async getSetting(key, defaultValue = null) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT setting_value FROM user_settings WHERE setting_key = ?`;
            
            this.db.get(sql, [key], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        try {
                            resolve(JSON.parse(row.setting_value));
                        } catch {
                            resolve(row.setting_value);
                        }
                    } else {
                        resolve(defaultValue);
                    }
                }
            });
        });
    }

    // Registrar comando executado
    async logCommand(command, parameters = null, executionTime = 0, success = true, errorMessage = null) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO command_history (command, parameters, execution_time, success, error_message) 
                        VALUES (?, ?, ?, ?, ?)`;
            
            this.db.run(sql, [command, parameters, executionTime, success, errorMessage], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    // Comandos mais usados
    async getTopCommands(limit = 10) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT command, COUNT(*) as usage_count, 
                               AVG(execution_time) as avg_execution_time,
                               (COUNT(CASE WHEN success = 1 THEN 1 END) * 100.0 / COUNT(*)) as success_rate
                        FROM command_history 
                        GROUP BY command 
                        ORDER BY usage_count DESC 
                        LIMIT ?`;
            
            this.db.all(sql, [limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Limpeza de dados antigos
    async cleanOldData(daysToKeep = 30) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM conversations WHERE timestamp < datetime('now', '-${daysToKeep} days')`;
            
            this.db.run(sql, [], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    // Fechar conexão
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.log(chalk.red(`Erro ao fechar banco: ${err.message}`));
                } else {
                    console.log(chalk.gray('📊 Conexão neural com banco encerrada'));
                }
            });
        }
    }

    // Estatísticas gerais do banco
    async getStats() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT 
                           COUNT(*) as totalConversations,
                           COUNT(DISTINCT session_id) as uniqueSessions,
                           SUM(tokens_used) as totalTokens,
                           MAX(timestamp) as lastActivity
                        FROM conversations`;
            
            this.db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        totalConversations: row.totalConversations || 0,
                        totalMessages: row.totalConversations || 0, // Alias para compatibilidade
                        uniqueSessions: row.uniqueSessions || 0,
                        totalTokens: row.totalTokens || 0,
                        lastActivity: row.lastActivity || 'Nunca'
                    });
                }
            });
        });
    }

    // Exportar conversas para JSON
    async exportConversations() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM conversations ORDER BY timestamp DESC`;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const exportPath = path.join(path.dirname(this.dbPath), `conversations_export_${Date.now()}.json`);
                    fs.writeFileSync(exportPath, JSON.stringify(rows, null, 2));
                    resolve(exportPath);
                }
            });
        });
    }

    // Backup do banco de dados
    async createBackup() {
        return new Promise((resolve, reject) => {
            const backupPath = path.join(path.dirname(this.dbPath), `zion_backup_${Date.now()}.db`);
            
            const readStream = fs.createReadStream(this.dbPath);
            const writeStream = fs.createWriteStream(backupPath);
            
            readStream.pipe(writeStream);
            
            writeStream.on('finish', () => {
                resolve(backupPath);
            });
            
            writeStream.on('error', (err) => {
                reject(err);
            });
        });
    }
}

module.exports = DatabaseModule;


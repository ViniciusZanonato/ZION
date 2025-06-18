const fs = require('fs').promises;
const path = require('path');
const winston = require('winston');

// Logger para conversa
const conversationLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/conversation.log' }),
        new winston.transports.Console({ 
            format: winston.format.simple(),
            level: 'warn'
        })
    ]
});

class ConversationManager {
    constructor(options = {}) {
        this.maxHistoryLength = options.maxHistoryLength || 50; // Limite padrão de 50 mensagens
        this.maxMessageLength = options.maxMessageLength || 10000; // Limite por mensagem
        this.storageDir = options.storageDir || './data/conversations';
        this.currentSessionId = this.generateSessionId();
        this.conversationHistory = [];
        this.pruneThreshold = Math.floor(this.maxHistoryLength * 0.8); // Remove quando atingir 80% do limite
        
        this.initializeStorage();
    }
    
    /**
     * Inicializa diretório de armazenamento
     */
    async initializeStorage() {
        try {
            await fs.mkdir(this.storageDir, { recursive: true });
            conversationLogger.info('Storage directory initialized', { storageDir: this.storageDir });
        } catch (error) {
            conversationLogger.error('Failed to initialize storage', { error: error.message });
        }
    }
    
    /**
     * Gera ID único para sessão
     * @returns {string} ID da sessão
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Adiciona mensagem ao histórico
     * @param {string} role - 'user' ou 'assistant'
     * @param {string} content - Conteúdo da mensagem
     * @param {Object} metadata - Metadados opcionais
     */
    addMessage(role, content, metadata = {}) {
        try {
            // Validar entrada
            if (!role || !content) {
                throw new Error('Role e content são obrigatórios');
            }
            
            if (typeof content !== 'string') {
                content = String(content);
            }
            
            // Limitar tamanho da mensagem
            if (content.length > this.maxMessageLength) {
                content = content.substring(0, this.maxMessageLength) + '... [truncado]';
                conversationLogger.warn('Message truncated due to length', { 
                    role, 
                    originalLength: content.length,
                    truncatedLength: this.maxMessageLength
                });
            }
            
            const message = {
                id: this.generateMessageId(),
                role: role.toLowerCase(),
                content: content.trim(),
                timestamp: new Date().toISOString(),
                sessionId: this.currentSessionId,
                ...metadata
            };
            
            this.conversationHistory.push(message);
            
            // Verificar se precisa fazer limpeza
            if (this.conversationHistory.length >= this.maxHistoryLength) {
                this.pruneHistory();
            }
            
            conversationLogger.info('Message added', { 
                role, 
                messageId: message.id,
                historyLength: this.conversationHistory.length 
            });
            
        } catch (error) {
            conversationLogger.error('Failed to add message', { 
                role, 
                error: error.message 
            });
            throw error;
        }
    }
    
    /**
     * Gera ID único para mensagem
     * @returns {string} ID da mensagem
     */
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    /**
     * Remove mensagens antigas do histórico
     */
    async pruneHistory() {
        try {
            if (this.conversationHistory.length <= this.pruneThreshold) {
                return;
            }
            
            // Salvar mensagens que serão removidas
            const messagesToArchive = this.conversationHistory.slice(0, -this.pruneThreshold);
            await this.archiveMessages(messagesToArchive);
            
            // Manter apenas as mensagens mais recentes
            this.conversationHistory = this.conversationHistory.slice(-this.pruneThreshold);
            
            conversationLogger.info('History pruned', {
                archivedCount: messagesToArchive.length,
                remainingCount: this.conversationHistory.length
            });
            
        } catch (error) {
            conversationLogger.error('Failed to prune history', { error: error.message });
        }
    }
    
    /**
     * Arquiva mensagens em arquivo
     * @param {Array} messages - Mensagens para arquivar
     */
    async archiveMessages(messages) {
        try {
            if (!messages || messages.length === 0) {
                return;
            }
            
            const filename = `${this.currentSessionId}_${Date.now()}.json`;
            const filepath = path.join(this.storageDir, filename);
            
            const archiveData = {
                sessionId: this.currentSessionId,
                archivedAt: new Date().toISOString(),
                messageCount: messages.length,
                messages: messages
            };
            
            await fs.writeFile(filepath, JSON.stringify(archiveData, null, 2));
            
            conversationLogger.info('Messages archived', {
                filename,
                messageCount: messages.length
            });
            
        } catch (error) {
            conversationLogger.error('Failed to archive messages', { error: error.message });
        }
    }
    
    /**
     * Obtém histórico atual
     * @param {number} limit - Limite de mensagens (opcional)
     * @returns {Array} Histórico de mensagens
     */
    getHistory(limit = null) {
        if (limit && limit > 0) {
            return this.conversationHistory.slice(-limit);
        }
        return [...this.conversationHistory];
    }
    
    /**
     * Obtém histórico formatado para o Gemini AI
     * @param {number} limit - Limite de mensagens
     * @returns {Array} Histórico formatado
     */
    getFormattedHistory(limit = 20) {
        const recentHistory = this.getHistory(limit);
        return recentHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
    }
    
    /**
     * Limpa histórico atual
     */
    async clearHistory() {
        try {
            // Arquivar antes de limpar
            if (this.conversationHistory.length > 0) {
                await this.archiveMessages([...this.conversationHistory]);
            }
            
            this.conversationHistory = [];
            this.currentSessionId = this.generateSessionId();
            
            conversationLogger.info('History cleared', { newSessionId: this.currentSessionId });
            
        } catch (error) {
            conversationLogger.error('Failed to clear history', { error: error.message });
            throw error;
        }
    }
    
    /**
     * Obtém estatísticas do histórico
     * @returns {Object} Estatísticas
     */
    getStats() {
        const totalMessages = this.conversationHistory.length;
        const userMessages = this.conversationHistory.filter(msg => msg.role === 'user').length;
        const assistantMessages = this.conversationHistory.filter(msg => msg.role === 'assistant').length;
        
        const totalChars = this.conversationHistory.reduce((sum, msg) => sum + msg.content.length, 0);
        const avgMessageLength = totalMessages > 0 ? Math.round(totalChars / totalMessages) : 0;
        
        return {
            totalMessages,
            userMessages,
            assistantMessages,
            totalCharacters: totalChars,
            averageMessageLength: avgMessageLength,
            maxHistoryLength: this.maxHistoryLength,
            currentSessionId: this.currentSessionId,
            memoryUsagePercent: Math.round((totalMessages / this.maxHistoryLength) * 100)
        };
    }
    
    /**
     * Carrega histórico arquivado
     * @param {string} sessionId - ID da sessão
     * @returns {Array} Mensagens arquivadas
     */
    async loadArchivedHistory(sessionId) {
        try {
            const files = await fs.readdir(this.storageDir);
            const sessionFiles = files.filter(file => file.startsWith(sessionId));
            
            let allMessages = [];
            for (const file of sessionFiles) {
                const filepath = path.join(this.storageDir, file);
                const data = await fs.readFile(filepath, 'utf8');
                const archiveData = JSON.parse(data);
                allMessages = allMessages.concat(archiveData.messages || []);
            }
            
            // Ordenar por timestamp
            allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            conversationLogger.info('Archived history loaded', {
                sessionId,
                messageCount: allMessages.length
            });
            
            return allMessages;
            
        } catch (error) {
            conversationLogger.error('Failed to load archived history', {
                sessionId,
                error: error.message
            });
            return [];
        }
    }
}

module.exports = ConversationManager;


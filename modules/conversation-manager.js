/**
 * ZION Conversation Manager - Gerenciamento de conversas e contexto
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class ConversationManager {
    constructor() {
        this.conversations = new Map();
        this.currentConversation = null;
        this.maxConversationLength = 50;
        this.maxConversations = 100;
        this.saveDirectory = path.join(__dirname, '..', 'data', 'conversations');
        
        this.ensureDirectoryExists();
    }

    /**
     * Garante que o diretório de conversas existe
     */
    ensureDirectoryExists() {
        if (!fs.existsSync(this.saveDirectory)) {
            fs.mkdirSync(this.saveDirectory, { recursive: true });
        }
    }

    /**
     * Inicia nova conversa
     */
    startNewConversation(sessionId = null) {
        const conversationId = sessionId || this.generateConversationId();
        
        const conversation = {
            id: conversationId,
            startTime: Date.now(),
            messages: [],
            context: {},
            metadata: {
                userAgent: process.env.USER_AGENT || 'Unknown',
                platform: process.platform,
                nodeVersion: process.version
            }
        };
        
        this.conversations.set(conversationId, conversation);
        this.currentConversation = conversationId;
        
        console.log(chalk.green(`🆕 Nova conversa iniciada: ${conversationId}`));
        return conversationId;
    }

    /**
     * Gera ID único para conversa
     */
    generateConversationId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `conv_${timestamp}_${random}`;
    }

    /**
     * Adiciona mensagem à conversa atual
     */
    addMessage(role, content, metadata = {}) {
        if (!this.currentConversation) {
            this.startNewConversation();
        }
        
        const conversation = this.conversations.get(this.currentConversation);
        if (!conversation) {
            throw new Error('Conversa atual não encontrada');
        }
        
        const message = {
            id: this.generateMessageId(),
            role, // 'user', 'assistant', 'system'
            content,
            timestamp: Date.now(),
            metadata
        };
        
        conversation.messages.push(message);
        
        // Manter tamanho máximo da conversa
        if (conversation.messages.length > this.maxConversationLength) {
            conversation.messages = conversation.messages.slice(-this.maxConversationLength);
        }
        
        return message;
    }

    /**
     * Gera ID único para mensagem
     */
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    /**
     * Obtém conversa atual
     */
    getCurrentConversation() {
        if (!this.currentConversation) {
            return null;
        }
        
        return this.conversations.get(this.currentConversation);
    }

    /**
     * Obtém histórico de mensagens formatado para IA
     */
    getConversationHistory(includeSystem = true, maxMessages = 20) {
        const conversation = this.getCurrentConversation();
        if (!conversation) {
            return [];
        }
        
        let messages = conversation.messages;
        
        if (!includeSystem) {
            messages = messages.filter(msg => msg.role !== 'system');
        }
        
        // Pegar as últimas mensagens
        messages = messages.slice(-maxMessages);
        
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    /**
     * Define contexto da conversa
     */
    setContext(key, value) {
        const conversation = this.getCurrentConversation();
        if (conversation) {
            conversation.context[key] = value;
        }
    }

    /**
     * Obtém contexto da conversa
     */
    getContext(key = null) {
        const conversation = this.getCurrentConversation();
        if (!conversation) {
            return key ? null : {};
        }
        
        return key ? conversation.context[key] : conversation.context;
    }

    /**
     * Muda para conversa específica
     */
    switchToConversation(conversationId) {
        if (!this.conversations.has(conversationId)) {
            throw new Error(`Conversa não encontrada: ${conversationId}`);
        }
        
        this.currentConversation = conversationId;
        console.log(chalk.blue(`🔄 Mudou para conversa: ${conversationId}`));
        return true;
    }

    /**
     * Lista todas as conversas
     */
    listConversations() {
        const conversations = [];
        
        for (const [id, conversation] of this.conversations) {
            conversations.push({
                id,
                startTime: new Date(conversation.startTime).toISOString(),
                messageCount: conversation.messages.length,
                lastMessage: conversation.messages.length > 0 ? 
                    conversation.messages[conversation.messages.length - 1].timestamp : null,
                isCurrent: id === this.currentConversation
            });
        }
        
        return conversations.sort((a, b) => (b.lastMessage || b.startTime) - (a.lastMessage || a.startTime));
    }

    /**
     * Salva conversa em arquivo
     */
    async saveConversation(conversationId = null) {
        const id = conversationId || this.currentConversation;
        if (!id) {
            throw new Error('Nenhuma conversa para salvar');
        }
        
        const conversation = this.conversations.get(id);
        if (!conversation) {
            throw new Error(`Conversa não encontrada: ${id}`);
        }
        
        const filename = `conversation_${id}_${new Date().toISOString().split('T')[0]}.json`;
        const filepath = path.join(this.saveDirectory, filename);
        
        const saveData = {
            ...conversation,
            endTime: Date.now(),
            summary: this.generateConversationSummary(conversation)
        };
        
        try {
            await fs.promises.writeFile(filepath, JSON.stringify(saveData, null, 2));
            console.log(chalk.green(`💾 Conversa salva: ${filename}`));
            return filepath;
        } catch (error) {
            console.error(chalk.red(`❌ Erro ao salvar conversa: ${error.message}`));
            throw error;
        }
    }

    /**
     * Carrega conversa de arquivo
     */
    async loadConversation(filepath) {
        try {
            const data = await fs.promises.readFile(filepath, 'utf8');
            const conversation = JSON.parse(data);
            
            this.conversations.set(conversation.id, conversation);
            console.log(chalk.green(`📂 Conversa carregada: ${conversation.id}`));
            return conversation.id;
        } catch (error) {
            console.error(chalk.red(`❌ Erro ao carregar conversa: ${error.message}`));
            throw error;
        }
    }

    /**
     * Gera resumo da conversa
     */
    generateConversationSummary(conversation) {
        const messageCount = conversation.messages.length;
        const userMessages = conversation.messages.filter(m => m.role === 'user').length;
        const assistantMessages = conversation.messages.filter(m => m.role === 'assistant').length;
        
        const duration = Date.now() - conversation.startTime;
        const durationMinutes = Math.round(duration / 60000);
        
        return {
            totalMessages: messageCount,
            userMessages,
            assistantMessages,
            durationMinutes,
            topics: this.extractTopics(conversation.messages)
        };
    }

    /**
     * Extrai tópicos da conversa
     */
    extractTopics(messages) {
        const userMessages = messages
            .filter(m => m.role === 'user')
            .map(m => m.content.toLowerCase());
        
        const commonWords = ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'como', 'com', 'por', 'ser', 'ter'];
        const words = userMessages
            .join(' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !commonWords.includes(word))
            .slice(0, 10);
        
        return [...new Set(words)];
    }

    /**
     * Exclui conversa
     */
    deleteConversation(conversationId) {
        if (!this.conversations.has(conversationId)) {
            throw new Error(`Conversa não encontrada: ${conversationId}`);
        }
        
        this.conversations.delete(conversationId);
        
        if (this.currentConversation === conversationId) {
            this.currentConversation = null;
        }
        
        console.log(chalk.yellow(`🗑️ Conversa excluída: ${conversationId}`));
        return true;
    }

    /**
     * Limpa todas as conversas
     */
    clearAllConversations() {
        const count = this.conversations.size;
        this.conversations.clear();
        this.currentConversation = null;
        
        console.log(chalk.yellow(`🧹 ${count} conversas foram limpas`));
        return count;
    }

    /**
     * Obtém estatísticas das conversas
     */
    getStats() {
        const totalConversations = this.conversations.size;
        let totalMessages = 0;
        let totalDuration = 0;
        
        for (const conversation of this.conversations.values()) {
            totalMessages += conversation.messages.length;
            totalDuration += Date.now() - conversation.startTime;
        }
        
        return {
            totalConversations,
            totalMessages,
            averageMessagesPerConversation: totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0,
            totalDurationMinutes: Math.round(totalDuration / 60000),
            currentConversation: this.currentConversation,
            memoryUsageMB: Math.round(JSON.stringify([...this.conversations.values()]).length / 1024 / 1024 * 100) / 100
        };
    }

    /**
     * Exibe relatório das conversas
     */
    showReport() {
        const stats = this.getStats();
        const conversations = this.listConversations();
        
        console.log(chalk.blue.bold('\n📊 RELATÓRIO DE CONVERSAS'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.white(`Total de conversas: ${stats.totalConversations}`));
        console.log(chalk.white(`Total de mensagens: ${stats.totalMessages}`));
        console.log(chalk.white(`Média de mensagens por conversa: ${stats.averageMessagesPerConversation}`));
        console.log(chalk.white(`Tempo total: ${stats.totalDurationMinutes} minutos`));
        console.log(chalk.white(`Uso de memória: ${stats.memoryUsageMB} MB`));
        
        if (conversations.length > 0) {
            console.log(chalk.yellow('\nÚltimas conversas:'));
            conversations.slice(0, 5).forEach(conv => {
                const current = conv.isCurrent ? chalk.green(' (atual)') : '';
                const time = new Date(conv.startTime).toLocaleString();
                console.log(chalk.gray(`  ${conv.id}${current} - ${conv.messageCount} msgs - ${time}`));
            });
        }
        
        console.log();
    }
}

module.exports = ConversationManager;


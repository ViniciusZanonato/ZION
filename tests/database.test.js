/**
 * Testes para o módulo de banco de dados
 */

const { DatabaseModule } = require('../modules/database');
const fs = require('fs');
const path = require('path');

describe('DatabaseModule', () => {
  let db;
  let tempDbPath;

  beforeEach(async () => {
    // Criar banco temporário para cada teste
    tempDbPath = path.join(__dirname, `test_${Date.now()}.db`);
    db = new DatabaseModule(tempDbPath);
    await db.init();
  });

  afterEach(async () => {
    // Limpar banco temporário
    if (db && db.db) {
      await db.db.close();
    }
    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }
  });

  describe('Inicialização', () => {
    test('deve inicializar corretamente', async () => {
      expect(db.db).toBeDefined();
      expect(fs.existsSync(tempDbPath)).toBe(true);
    });

    test('deve criar tabela de mensagens', async () => {
      const tables = await db.db.all(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );
      const tableNames = tables.map(t => t.name);
      expect(tableNames).toContain('messages');
    });
  });

  describe('Salvar mensagens', () => {
    test('deve salvar mensagem do usuário', async () => {
      await db.saveMessage('user', 'Olá mundo!');
      
      const messages = await db.getHistory(1);
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBe('Olá mundo!');
    });

    test('deve salvar mensagem do assistente', async () => {
      await db.saveMessage('assistant', 'Olá! Como posso ajudar?');
      
      const messages = await db.getHistory(1);
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('assistant');
      expect(messages[0].content).toBe('Olá! Como posso ajudar?');
    });

    test('deve incluir timestamp', async () => {
      const beforeTime = new Date();
      await db.saveMessage('user', 'Teste timestamp');
      const afterTime = new Date();
      
      const messages = await db.getHistory(1);
      const messageTime = new Date(messages[0].timestamp);
      
      expect(messageTime).toBeInstanceOf(Date);
      expect(messageTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(messageTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('Recuperar histórico', () => {
    beforeEach(async () => {
      // Adicionar algumas mensagens de teste
      await db.saveMessage('user', 'Mensagem 1');
      await db.saveMessage('assistant', 'Resposta 1');
      await db.saveMessage('user', 'Mensagem 2');
      await db.saveMessage('assistant', 'Resposta 2');
      await db.saveMessage('user', 'Mensagem 3');
    });

    test('deve recuperar últimas mensagens', async () => {
      const messages = await db.getHistory(3);
      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe('Mensagem 3'); // Mais recente primeiro
      expect(messages[1].content).toBe('Resposta 2');
      expect(messages[2].content).toBe('Mensagem 2');
    });

    test('deve limitar número de mensagens', async () => {
      const messages = await db.getHistory(2);
      expect(messages).toHaveLength(2);
    });

    test('deve retornar array vazio se não houver mensagens', async () => {
      await db.clearHistory();
      const messages = await db.getHistory(10);
      expect(messages).toHaveLength(0);
    });
  });

  describe('Buscar mensagens', () => {
    beforeEach(async () => {
      await db.saveMessage('user', 'Como calcular 2 + 2?');
      await db.saveMessage('assistant', 'O resultado é 4');
      await db.saveMessage('user', 'Qual é a capital do Brasil?');
      await db.saveMessage('assistant', 'A capital do Brasil é Brasília');
    });

    test('deve encontrar mensagens por termo', async () => {
      const results = await db.searchMessages('calcular');
      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('calcular');
    });

    test('deve ser case-insensitive', async () => {
      const results = await db.searchMessages('CAPITAL');
      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('capital');
    });

    test('deve retornar array vazio se não encontrar', async () => {
      const results = await db.searchMessages('inexistente');
      expect(results).toHaveLength(0);
    });
  });

  describe('Estatísticas', () => {
    beforeEach(async () => {
      await db.saveMessage('user', 'Mensagem 1');
      await db.saveMessage('assistant', 'Resposta 1');
      await db.saveMessage('user', 'Mensagem 2');
    });

    test('deve retornar estatísticas corretas', async () => {
      const stats = await db.getStats();
      
      expect(stats.totalMessages).toBe(3);
      expect(stats.userMessages).toBe(2);
      expect(stats.assistantMessages).toBe(1);
      expect(stats.firstMessage).toBeDefined();
      expect(stats.lastMessage).toBeDefined();
    });

    test('deve retornar zeros se não houver mensagens', async () => {
      await db.clearHistory();
      const stats = await db.getStats();
      
      expect(stats.totalMessages).toBe(0);
      expect(stats.userMessages).toBe(0);
      expect(stats.assistantMessages).toBe(0);
      expect(stats.firstMessage).toBe('Nenhuma');
      expect(stats.lastMessage).toBe('Nenhuma');
    });
  });

  describe('Limpar histórico', () => {
    beforeEach(async () => {
      await db.saveMessage('user', 'Mensagem teste');
      await db.saveMessage('assistant', 'Resposta teste');
    });

    test('deve limpar todas as mensagens', async () => {
      await db.clearHistory();
      const messages = await db.getHistory(10);
      expect(messages).toHaveLength(0);
    });

    test('deve resetar estatísticas', async () => {
      await db.clearHistory();
      const stats = await db.getStats();
      expect(stats.totalMessages).toBe(0);
    });
  });

  describe('Exportar dados', () => {
    beforeEach(async () => {
      await db.saveMessage('user', 'Pergunta teste');
      await db.saveMessage('assistant', 'Resposta teste');
    });

    test('deve exportar para JSON', async () => {
      const jsonData = await db.exportToJSON();
      const data = JSON.parse(jsonData);
      
      expect(data.messages).toHaveLength(2);
      expect(data.exportDate).toBeDefined();
      expect(data.stats).toBeDefined();
    });

    test('deve exportar para CSV', async () => {
      const csvData = await db.exportToCSV();
      
      expect(csvData).toContain('role,content,timestamp');
      expect(csvData).toContain('user,"Pergunta teste"');
      expect(csvData).toContain('assistant,"Resposta teste"');
    });
  });
});


/**
 * Testes para o processador de comandos
 */

const { CommandProcessor } = require('../modules/command-processor');
const { DatabaseModule } = require('../modules/database');
const { HelpSystem } = require('../modules/help-system');
const fs = require('fs');
const path = require('path');

describe('CommandProcessor', () => {
  let processor;
  let db;
  let help;
  let tempDbPath;

  beforeEach(async () => {
    // Criar banco temporário
    tempDbPath = path.join(__dirname, `test_cmd_${Date.now()}.db`);
    db = new DatabaseModule(tempDbPath);
    await db.init();
    
    help = new HelpSystem();
    processor = new CommandProcessor(db, help);
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

  describe('Detecção de comandos', () => {
    test('deve detectar comando válido', () => {
      expect(processor.isCommand('/help')).toBe(true);
      expect(processor.isCommand('/stats')).toBe(true);
      expect(processor.isCommand('/history')).toBe(true);
    });

    test('deve rejeitar texto normal', () => {
      expect(processor.isCommand('Olá mundo')).toBe(false);
      expect(processor.isCommand('Como você está?')).toBe(false);
      expect(processor.isCommand('')).toBe(false);
    });

    test('deve rejeitar comandos inválidos', () => {
      expect(processor.isCommand('/comando_inexistente')).toBe(false);
      expect(processor.isCommand('/invalid')).toBe(false);
    });
  });

  describe('Comando /help', () => {
    test('deve mostrar help geral', async () => {
      const result = await processor.processCommand('/help');
      expect(result).toContain('📚 COMANDOS DISPONÍVEIS');
      expect(result).toContain('/calc');
      expect(result).toContain('/history');
    });

    test('deve mostrar help de comando específico', async () => {
      const result = await processor.processCommand('/help calc');
      expect(result).toContain('Calculadora segura');
      expect(result).toContain('Exemplo:');
    });
  });

  describe('Comando /calc', () => {
    test('deve calcular expressões simples', async () => {
      const result = await processor.processCommand('/calc 2 + 2');
      expect(result).toContain('4');
    });

    test('deve calcular expressões complexas', async () => {
      const result = await processor.processCommand('/calc sqrt(16)');
      expect(result).toContain('4');
    });

    test('deve tratar erros de sintaxe', async () => {
      const result = await processor.processCommand('/calc 2 +');
      expect(result).toContain('Erro');
    });

    test('deve rejeitar código malicioso', async () => {
      const result = await processor.processCommand('/calc eval("alert(1)")');
      expect(result).toContain('Erro');
    });
  });

  describe('Comando /history', () => {
    beforeEach(async () => {
      // Adicionar mensagens de teste
      await db.saveMessage('user', 'Mensagem 1');
      await db.saveMessage('assistant', 'Resposta 1');
      await db.saveMessage('user', 'Mensagem 2');
    });

    test('deve mostrar histórico padrão', async () => {
      const result = await processor.processCommand('/history');
      expect(result).toContain('Mensagem 1');
      expect(result).toContain('Resposta 1');
      expect(result).toContain('Mensagem 2');
    });

    test('deve limitar número de mensagens', async () => {
      const result = await processor.processCommand('/history 1');
      expect(result).toContain('Mensagem 2'); // Mais recente
      expect(result).not.toContain('Mensagem 1');
    });

    test('deve tratar histórico vazio', async () => {
      await db.clearHistory();
      const result = await processor.processCommand('/history');
      expect(result).toContain('Nenhuma mensagem');
    });
  });

  describe('Comando /stats', () => {
    beforeEach(async () => {
      await db.saveMessage('user', 'Teste');
      await db.saveMessage('assistant', 'Resposta');
    });

    test('deve mostrar estatísticas corretas', async () => {
      const result = await processor.processCommand('/stats');
      expect(result).toContain('Total de mensagens: 2');
      expect(result).toContain('Mensagens do usuário: 1');
      expect(result).toContain('Mensagens do assistente: 1');
    });
  });

  describe('Comando /search', () => {
    beforeEach(async () => {
      await db.saveMessage('user', 'Como calcular 2 + 2?');
      await db.saveMessage('assistant', 'O resultado é 4');
      await db.saveMessage('user', 'Qual a capital do Brasil?');
    });

    test('deve encontrar mensagens', async () => {
      const result = await processor.processCommand('/search calcular');
      expect(result).toContain('Como calcular 2 + 2?');
    });

    test('deve ser case-insensitive', async () => {
      const result = await processor.processCommand('/search CAPITAL');
      expect(result).toContain('capital do Brasil');
    });

    test('deve tratar busca sem resultados', async () => {
      const result = await processor.processCommand('/search inexistente');
      expect(result).toContain('Nenhuma mensagem encontrada');
    });

    test('deve exigir termo de busca', async () => {
      const result = await processor.processCommand('/search');
      expect(result).toContain('Erro: Termo de busca não fornecido');
    });
  });

  describe('Comando /clear', () => {
    beforeEach(async () => {
      await db.saveMessage('user', 'Mensagem para limpar');
    });

    test('deve limpar com confirmação', async () => {
      const result = await processor.processCommand('/clear --confirm');
      expect(result).toContain('Histórico limpo');
      
      const messages = await db.getHistory(10);
      expect(messages).toHaveLength(0);
    });

    test('deve exigir confirmação', async () => {
      const result = await processor.processCommand('/clear');
      expect(result).toContain('--confirm');
      
      // Verificar que não limpou
      const messages = await db.getHistory(10);
      expect(messages).toHaveLength(1);
    });
  });

  describe('Comando /export', () => {
    beforeEach(async () => {
      await db.saveMessage('user', 'Dados para exportar');
      await db.saveMessage('assistant', 'Resposta para exportar');
    });

    test('deve exportar para JSON', async () => {
      const result = await processor.processCommand('/export json');
      expect(result).toContain('Dados exportados');
      expect(result).toContain('.json');
    });

    test('deve exportar para CSV', async () => {
      const result = await processor.processCommand('/export csv');
      expect(result).toContain('Dados exportados');
      expect(result).toContain('.csv');
    });

    test('deve tratar formato inválido', async () => {
      const result = await processor.processCommand('/export xml');
      expect(result).toContain('Formato inválido');
    });
  });

  describe('Comando /interface', () => {
    test('deve alternar para blessed', async () => {
      const result = await processor.processCommand('/interface blessed');
      expect(result).toContain('Interface alterada para blessed');
    });

    test('deve alternar para inquirer', async () => {
      const result = await processor.processCommand('/interface inquirer');
      expect(result).toContain('Interface alterada para inquirer');
    });

    test('deve tratar interface inválida', async () => {
      const result = await processor.processCommand('/interface invalida');
      expect(result).toContain('Interface inválida');
    });
  });

  describe('Tratamento de erros', () => {
    test('deve tratar comando inválido', async () => {
      const result = await processor.processCommand('/comando_inexistente');
      expect(result).toContain('Comando não reconhecido');
    });

    test('deve tratar argumentos insuficientes', async () => {
      const result = await processor.processCommand('/calc');
      expect(result).toContain('Expressão matemática não fornecida');
    });

    test('deve tratar comandos vazios', async () => {
      const result = await processor.processCommand('/');
      expect(result).toContain('Comando não reconhecido');
    });
  });

  describe('Validação de entrada', () => {
    test('deve validar entrada com caracteres especiais', async () => {
      const result = await processor.processCommand('/search <script>alert(1)</script>');
      // Deve processar sem executar o script
      expect(result).toBeDefined();
    });

    test('deve tratar entradas muito longas', async () => {
      const longInput = '/calc ' + 'a'.repeat(10000);
      const result = await processor.processCommand(longInput);
      expect(result).toContain('Erro');
    });
  });
});


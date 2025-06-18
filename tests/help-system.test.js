/**
 * Testes para o sistema de help
 */

const HelpSystem = require('../modules/help-system');

// Mock do console para capturar saídas
let consoleOutput = [];
const originalLog = console.log;
beforeEach(() => {
  consoleOutput = [];
  console.log = jest.fn((...args) => {
    consoleOutput.push(args.join(' '));
  });
});

afterEach(() => {
  console.log = originalLog;
});

describe('HelpSystem', () => {
  let helpSystem;

  beforeEach(() => {
    helpSystem = new HelpSystem();
  });

  describe('Comandos disponíveis', () => {
    test('deve ter comandos básicos definidos', () => {
      const commands = helpSystem.getAvailableCommands();
      expect(commands).toContain('help');
      expect(commands).toContain('calc');
      expect(commands).toContain('history');
      expect(commands).toContain('stats');
      expect(commands).toContain('search');
      expect(commands).toContain('clear');
      expect(commands).toContain('export');
      expect(commands).toContain('interface');
    });

    test('deve verificar se comando existe', () => {
      expect(helpSystem.hasCommand('help')).toBe(true);
      expect(helpSystem.hasCommand('calc')).toBe(true);
      expect(helpSystem.hasCommand('inexistente')).toBe(false);
    });
  });

  describe('Help geral', () => {
    test('deve mostrar todos os comandos', () => {
      helpSystem.showGeneralHelp();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('SISTEMA DE AJUDA CONTEXTUAL ZION');
      expect(output).toContain('/help');
      expect(output).toContain('/calc');
      expect(output).toContain('/history');
      expect(output).toContain('/stats');
      expect(output).toContain('/search');
      expect(output).toContain('/clear');
      expect(output).toContain('/export');
      expect(output).toContain('/interface');
    });

    test('deve incluir descrições dos comandos', () => {
      helpSystem.showGeneralHelp();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('Sistema de ajuda contextual inteligente');
      expect(output).toContain('Calculadora segura');
      expect(output).toContain('Histórico de conversa');
      expect(output).toContain('Estatísticas do chat');
      expect(output).toContain('Buscar no histórico');
      expect(output).toContain('Limpa o histórico');
      expect(output).toContain('Exportar dados');
      expect(output).toContain('Alternar interface');
    });

    test('deve incluir nota sobre help detalhado', () => {
      helpSystem.showGeneralHelp();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('/help [comando]');
    });
  });

  describe('Help de comandos específicos', () => {
    test('deve mostrar help do comando calc', () => {
      helpSystem.showCommandHelp('calc');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('Calculadora segura');
      expect(output).toContain('expressão matemática');
      expect(output).toContain('sqrt');
      expect(output).toContain('sin');
      expect(output).toContain('cos');
      expect(output).toContain('log');
      expect(output).toContain('EXEMPLOS:');
      expect(output).toContain('/calc 2 + 2');
    });

    test('deve mostrar help do comando history', () => {
      helpSystem.showCommandHelp('history');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('Histórico de conversa');
      expect(output).toContain('últimas mensagens');
      expect(output).toContain('[limite]');
      expect(output).toContain('EXEMPLOS:');
      expect(output).toContain('/history 10');
    });

    test('deve mostrar help do comando search', () => {
      helpSystem.showCommandHelp('search');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('Buscar no histórico');
      expect(output).toContain('termo de busca');
      expect(output).toContain('case-insensitive');
      expect(output).toContain('EXEMPLOS:');
      expect(output).toContain('/search python');
    });

    test('deve mostrar help do comando stats', () => {
      helpSystem.showCommandHelp('stats');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('Estatísticas do chat');
      expect(output).toContain('informações sobre');
      expect(output).toContain('mensagens');
      expect(output).toContain('EXEMPLOS:');
      expect(output).toContain('/stats');
    });

    test('deve mostrar help do comando clear', () => {
      helpSystem.showCommandHelp('clear');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('Limpa o histórico');
      expect(output).toContain('irreversível');
      expect(output).toContain('histórico será perdido');
      expect(output).toContain('EXEMPLOS:');
      expect(output).toContain('/clear');
    });

    test('deve mostrar help do comando export', () => {
      helpSystem.showCommandHelp('export');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('Exportar dados');
      expect(output).toContain('json');
      expect(output).toContain('csv');
      expect(output).toContain('EXEMPLOS:');
      expect(output).toContain('/export json');
    });

    test('deve mostrar help do comando interface', () => {
      helpSystem.showCommandHelp('interface');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('Alternar interface');
      expect(output).toContain('blessed');
      expect(output).toContain('inquirer');
      expect(output).toContain('readline');
      expect(output).toContain('EXEMPLOS:');
      expect(output).toContain('/interface blessed');
    });

    test('deve mostrar help do próprio comando help', () => {
      helpSystem.showCommandHelp('help');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('Sistema de ajuda contextual inteligente');
      expect(output).toContain('específica');
      expect(output).toContain('[comando_específico]');
      expect(output).toContain('EXEMPLOS:');
      expect(output).toContain('/help weather');
    });
  });

  describe('Tratamento de erros', () => {
    test('deve tratar comando inexistente', () => {
      helpSystem.showCommandHelp('comando_inexistente');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('não encontrado');
      expect(output).toContain('/help');
    });

    test('deve tratar comando vazio', () => {
      helpSystem.showCommandHelp('');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('não encontrado');
    });

    test('deve tratar comando undefined', () => {
      helpSystem.showCommandHelp(undefined);
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('não encontrado');
    });
  });

  describe('Formatação de saída', () => {
    test('deve usar cores nos títulos', () => {
      helpSystem.showGeneralHelp();
      
      // Verificar se há códigos de escape ANSI (cores)
      const output = consoleOutput.join('\n');
      expect(output).toMatch(/\u001b\[\d+m/); // Códigos de cor ANSI
    });

    test('deve usar emojis nos comandos', () => {
      helpSystem.showGeneralHelp();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('🧠'); // Emoji de cérebro
      expect(output).toContain('❓'); // Emoji de pergunta
      expect(output).toContain('🔧'); // Emoji de ferramenta
      expect(output).toContain('📄'); // Emoji de documento
    });

    test('deve ter formatação consistente', () => {
      helpSystem.showCommandHelp('calc');
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('SINTAXE:');
      expect(output).toContain('DESCRIÇÃO:');
      expect(output).toContain('PARÂMETROS:');
      expect(output).toContain('EXEMPLOS:');
    });
  });

  describe('Funcionalidades auxiliares', () => {
    test('deve retornar lista de comandos', () => {
      const commands = helpSystem.getAvailableCommands();
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });

    test('deve validar existência de comando', () => {
      expect(helpSystem.hasCommand('help')).toBe(true);
      expect(helpSystem.hasCommand('invalid')).toBe(false);
    });

    test('deve retornar informações de comando', () => {
      const info = helpSystem.getCommandInfo('calc');
      expect(info).toBeDefined();
      expect(info.description).toBeDefined();
      expect(info.usage).toBeDefined();
      expect(info.examples).toBeDefined();
    });

    test('deve retornar null para comando inexistente', () => {
      const info = helpSystem.getCommandInfo('inexistente');
      expect(info).toBeNull();
    });
  });
});


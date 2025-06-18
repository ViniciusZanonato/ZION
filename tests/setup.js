/**
 * Setup global para testes do ZION Chatbot Supremo
 */

// Mock do console para evitar output durante os testes
global.originalConsole = console;

// Configurar timeout para operações assíncronas
jest.setTimeout(15000);

// Limpar todos os timers após cada teste
afterEach(() => {
  jest.clearAllTimers();
  jest.restoreAllMocks();
});

// Mock global do logger
global.mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

// Helper para criar banco de dados temporário
global.createTempDatabase = () => {
  const path = require('path');
  const fs = require('fs');
  const tempPath = path.join(__dirname, `temp_test_${Date.now()}.db`);
  
  return {
    path: tempPath,
    cleanup: () => {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  };
};

// Mock de APIs externas se necessário
global.mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: 'Resposta mockada do OpenAI'
          }
        }]
      })
    }
  }
};


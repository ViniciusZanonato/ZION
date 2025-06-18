module.exports = {
  // Configuração do Jest para ZION Chatbot Supremo
  testEnvironment: 'node',
  
  // Padrões de arquivos de teste
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Diretórios para ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Arquivos para incluir na cobertura
  collectCoverageFrom: [
    'modules/**/*.js',
    'zion.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  
  // Setup de testes
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Mock de console durante os testes
  silent: false,
  
  // Transformações
  transform: {},
  
  // Limpar mocks automaticamente
  clearMocks: true,
  
  // Relatórios detalhados
  verbose: true
};


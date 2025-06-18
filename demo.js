#!/usr/bin/env node

/**
 * 🎯 ZION CHATBOT SUPREMO - DEMONSTRAÇÃO COMPLETA
 * 
 * Este script demonstra todas as funcionalidades implementadas:
 * ✅ Sistema de Help Contextual
 * ✅ Banco de Dados SQLite  
 * ✅ Interface Blessed/Inquirer
 * ✅ Processamento Modular de Comandos
 * ✅ Sistema de Logging
 * ✅ Validação de Entrada
 */

const readline = require('readline');
const chalk = require('chalk');
const DatabaseModule = require('./modules/database');
const HelpSystem = require('./modules/help-system');
const CommandProcessor = require('./modules/command-processor');

// Mock simples do logger
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg, error) => console.log(`[ERROR] ${msg}`, error),
  warn: (msg) => console.log(`[WARN] ${msg}`),
  debug: (msg) => console.log(`[DEBUG] ${msg}`)
};

class ZionDemo {
  constructor() {
    this.db = new DatabaseModule();
    this.help = new HelpSystem();
    this.commandProcessor = new CommandProcessor(this.db, this.help);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async init() {
    console.clear();
    this.showBanner();
    
    // Inicializar módulos
    await this.db.init();
    
    // Inserir dados de demonstração
    await this.setupDemoData();
    
    // Mostrar menu
    this.showMainMenu();
  }

  showBanner() {
    console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                   🚀 ZION CHATBOT SUPREMO                   ║
║                    DEMONSTRAÇÃO COMPLETA                     ║
╚══════════════════════════════════════════════════════════════╝
`));
    
    console.log(chalk.green('✅ Melhorias Implementadas:'));
    console.log('   • Sistema de Help Contextual');
    console.log('   • Banco de Dados SQLite');
    console.log('   • Interface Interativa');
    console.log('   • Processamento Modular');
    console.log('   • Sistema de Logging');
    console.log('   • Validação de Entrada\n');
  }

  async setupDemoData() {
    // Adicionar algumas conversas de exemplo
    const demoMessages = [
      { role: 'user', content: 'Olá ZION!' },
      { role: 'assistant', content: 'Olá! Como posso ajudá-lo hoje?' },
      { role: 'user', content: 'Calcule 2 + 2' },
      { role: 'assistant', content: 'O resultado é 4' },
      { role: 'user', content: 'Qual é a capital do Brasil?' },
      { role: 'assistant', content: 'A capital do Brasil é Brasília' }
    ];

    for (const msg of demoMessages) {
      await this.db.saveMessage(msg.role, msg.content);
    }
    
    logger.info('Dados de demonstração carregados');
  }

  showMainMenu() {
    console.log(chalk.yellow('\n📋 MENU DE DEMONSTRAÇÃO:'));
    console.log('1. 📊 Ver estatísticas do banco de dados');
    console.log('2. 💬 Ver histórico de conversa');
    console.log('3. ❓ Testar sistema de help');
    console.log('4. 🔧 Testar comandos especiais');
    console.log('5. 🧮 Testar calculadora segura');
    console.log('6. 📱 Alternar interface');
    console.log('7. 🔍 Buscar no histórico');
    console.log('8. 🧹 Limpar dados');
    console.log('9. 🚪 Sair\n');
    
    this.promptUser();
  }

  promptUser() {
    this.rl.question(chalk.blue('Escolha uma opção (1-9): '), async (answer) => {
      await this.handleMenuChoice(answer.trim());
    });
  }

  async handleMenuChoice(choice) {
    try {
      switch (choice) {
        case '1':
          await this.showStats();
          break;
        case '2':
          await this.showHistory();
          break;
        case '3':
          await this.testHelp();
          break;
        case '4':
          await this.testCommands();
          break;
        case '5':
          await this.testCalculator();
          break;
        case '6':
          await this.testInterface();
          break;
        case '7':
          await this.testSearch();
          break;
        case '8':
          await this.clearData();
          break;
        case '9':
          this.exit();
          return;
        default:
          console.log(chalk.red('❌ Opção inválida'));
      }
    } catch (error) {
      console.log(chalk.red(`❌ Erro: ${error.message}`));
      logger.error('Erro na demonstração', error);
    }
    
    this.showMainMenu();
  }

  async showStats() {
    console.log(chalk.cyan('\n📊 ESTATÍSTICAS DO BANCO DE DADOS:'));
    const stats = await this.db.getStats();
    console.log(`• Total de mensagens: ${stats.totalMessages}`);
    console.log(`• Mensagens do usuário: ${stats.userMessages}`);
    console.log(`• Mensagens do assistente: ${stats.assistantMessages}`);
    console.log(`• Primeira mensagem: ${stats.firstMessage}`);
    console.log(`• Última mensagem: ${stats.lastMessage}`);
  }

  async showHistory() {
    console.log(chalk.cyan('\n💬 HISTÓRICO DE CONVERSA:'));
    const messages = await this.db.getHistory(10);
    
    if (messages.length === 0) {
      console.log('Nenhuma mensagem encontrada.');
      return;
    }
    
    messages.forEach((msg, index) => {
      const roleColor = msg.role === 'user' ? chalk.green : chalk.blue;
      const timestamp = new Date(msg.timestamp).toLocaleString();
      console.log(`${index + 1}. ${roleColor(msg.role.toUpperCase())}: ${msg.content}`);
      console.log(chalk.gray(`   [${timestamp}]`));
    });
  }

  async testHelp() {
    console.log(chalk.cyan('\n❓ SISTEMA DE HELP:'));
    
    // Help geral
    console.log(chalk.yellow('\n🔸 Help Geral:'));
    this.help.showGeneralHelp();
    
    // Help de comandos específicos
    const commands = ['calc', 'history', 'clear', 'export'];
    for (const cmd of commands) {
      console.log(chalk.yellow(`\n🔸 Help do comando '${cmd}':`));
      this.help.showCommandHelp(cmd);
    }
  }

  async testCommands() {
    console.log(chalk.cyan('\n🔧 TESTANDO COMANDOS ESPECIAIS:'));
    
    const testCommands = [
      '/stats',
      '/history 5',
      '/clear --confirm',
      '/interface blessed',
      '/search olá'
    ];
    
    for (const cmd of testCommands) {
      console.log(chalk.yellow(`\n🔸 Executando: ${cmd}`));
      const result = await this.commandProcessor.processCommand(cmd);
      console.log(result);
    }
  }

  async testCalculator() {
    console.log(chalk.cyan('\n🧮 TESTANDO CALCULADORA SEGURA:'));
    
    const expressions = [
      '2 + 2',
      '10 * 5 - 3',
      'sqrt(16)',
      'sin(pi/2)',
      'log(10)',
      'pow(2, 3)'
    ];
    
    for (const expr of expressions) {
      try {
        console.log(chalk.yellow(`\n🔸 ${expr} = `), end='');
        const result = await this.commandProcessor.processCommand(`/calc ${expr}`);
        console.log(chalk.green(result));
      } catch (error) {
        console.log(chalk.red(`Erro: ${error.message}`));
      }
    }
  }

  async testInterface() {
    console.log(chalk.cyan('\n📱 TESTANDO ALTERNÂNCIA DE INTERFACE:'));
    
    const interfaces = ['blessed', 'inquirer', 'readline'];
    
    for (const iface of interfaces) {
      console.log(chalk.yellow(`\n🔸 Mudando para interface: ${iface}`));
      const result = await this.commandProcessor.processCommand(`/interface ${iface}`);
      console.log(result);
    }
  }

  async testSearch() {
    console.log(chalk.cyan('\n🔍 TESTANDO BUSCA NO HISTÓRICO:'));
    
    const searchTerms = ['olá', 'capital', 'calcule'];
    
    for (const term of searchTerms) {
      console.log(chalk.yellow(`\n🔸 Buscando por: "${term}"`));
      const result = await this.commandProcessor.processCommand(`/search ${term}`);
      console.log(result);
    }
  }

  async clearData() {
    console.log(chalk.cyan('\n🧹 LIMPANDO DADOS:'));
    
    // Confirmar antes de limpar
    const confirm = await this.askConfirmation('Tem certeza que deseja limpar todos os dados? (s/N): ');
    
    if (confirm) {
      await this.db.clearHistory();
      console.log(chalk.green('✅ Dados limpos com sucesso!'));
      logger.info('Dados do banco limpos via demonstração');
    } else {
      console.log(chalk.yellow('❌ Operação cancelada'));
    }
  }

  askConfirmation(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim');
      });
    });
  }

  exit() {
    console.log(chalk.green('\n🎉 Obrigado por testar o ZION Chatbot Supremo!'));
    console.log(chalk.cyan('Todas as melhorias de prioridade média foram demonstradas.\n'));
    
    this.rl.close();
    logger.info('Demonstração finalizada');
    process.exit(0);
  }
}

// Executar demonstração se chamado diretamente
if (require.main === module) {
  const demo = new ZionDemo();
  demo.init().catch(console.error);
}

module.exports = { ZionDemo };


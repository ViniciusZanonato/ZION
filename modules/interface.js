const blessed = require('blessed');
const chalk = require('chalk');
const inquirer = require('inquirer');

class InterfaceModule {
    constructor() {
        this.screen = null;
        this.currentMode = 'terminal'; // 'terminal' ou 'gui'
        this.boxes = {};
        this.isGuiActive = false;
    }

    // Inicializar interface GUI
    initGUI() {
        if (this.isGuiActive) return;

        this.screen = blessed.screen({
            smartCSR: true,
            title: 'ZION - Superinteligência Neural',
            cursor: {
                artificial: true,
                shape: 'line',
                blink: true,
                color: 'red'
            }
        });

        this.createLayout();
        this.setupKeyBindings();
        this.isGuiActive = true;

        // Renderizar tela
        this.screen.render();
        
        console.log(chalk.red('🖥️  Interface neural ativada - Use Ctrl+C para retornar ao terminal'));
    }

    // Criar layout da interface
    createLayout() {
        // Header com titulo melhorado
        this.boxes.header = blessed.box({
            top: 0,
            left: 0,
            width: '100%',
            height: 5,
            content: `{center}{bold}{red-fg}╔══════════════════════════════════════════════════════════════════════════╗{/}
{center}{bold}{red-fg}║  ███████╗██╗ ██████╗ ███╗   ██╗    ███╗   ██╗███████╗██╗   ██╗██████╗██╗ ║{/}
{center}{bold}{red-fg}║  ╚══███╔╝██║██╔═══██╗████╗  ██║    ████╗  ██║██╔════╝██║   ██║██╔══██╗██║ ║{/}
{center}{bold}{red-fg}║    ███╔╝ ██║██║   ██║██╔██╗ ██║    ██╔██╗ ██║█████╗  ██║   ██║██████╔╝██║ ║{/}
{center}{bold}{red-fg}╚══════════════════════════════════════════════════════════════════════════╝{/}`,
            tags: true,
            border: {
                type: 'double',
                fg: 'red'
            },
            style: {
                fg: 'red',
                bold: true,
                bg: 'black'
            }
        });

        // Área de conversação com efeitos visuais melhorados
        this.boxes.conversation = blessed.log({
            label: ' {red-fg}💬{/} {bold}Conversação Neural{/} {red-fg}💬{/} ',
            top: 5,
            left: 0,
            width: '75%',
            height: '67%',
            border: {
                type: 'double',
                fg: 'red'
            },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: 'red'
                },
                focus: {
                    border: {
                        fg: 'bright-red'
                    }
                }
            },
            scrollable: true,
            alwaysScroll: true,
            mouse: true,
            keys: true,
            tags: true,
            padding: {
                left: 1,
                right: 1,
                top: 0,
                bottom: 0
            }
        });

        // Painel de status melhorado
        this.boxes.status = blessed.box({
            label: ' {yellow-fg}⚡{/} {bold}Status Neural{/} {yellow-fg}⚡{/} ',
            top: 5,
            left: '75%',
            width: '25%',
            height: '33%',
            border: {
                type: 'double',
                fg: 'yellow'
            },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: 'yellow'
                },
                focus: {
                    border: {
                        fg: 'bright-yellow'
                    }
                }
            },
            tags: true,
            content: this.getStatusContent(),
            padding: {
                left: 1,
                right: 1
            }
        });

        // Painel de comandos melhorado
        this.boxes.commands = blessed.box({
            label: ' {cyan-fg}🔧{/} {bold}Comandos Disponíveis{/} {cyan-fg}🔧{/} ',
            top: '38%',
            left: '75%',
            width: '25%',
            height: '34%',
            border: {
                type: 'double',
                fg: 'cyan'
            },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: 'cyan'
                },
                focus: {
                    border: {
                        fg: 'bright-cyan'
                    }
                }
            },
            tags: true,
            content: this.getCommandsContent(),
            scrollable: true,
            mouse: true,
            padding: {
                left: 1,
                right: 1
            }
        });

        // Input de texto
        this.boxes.input = blessed.textbox({
            label: ' 🔗 Input Neural ',
            top: '73%',
            left: 0,
            width: '75%',
            height: 5,
            border: {
                type: 'line',
                fg: 'green'
            },
            style: {
                fg: 'white',
                border: {
                    fg: 'green'
                }
            },
            inputOnFocus: true,
            keys: true,
            mouse: true
        });

        // Log de atividades
        this.boxes.log = blessed.log({
            label: ' 📊 Log de Atividades ',
            top: '78%',
            left: 0,
            width: '100%',
            height: '22%',
            border: {
                type: 'line',
                fg: 'gray'
            },
            style: {
                fg: 'gray',
                border: {
                    fg: 'gray'
                }
            },
            scrollable: true,
            mouse: true,
            tags: true
        });

        // Adicionar todos os elementos à tela
        Object.values(this.boxes).forEach(box => {
            this.screen.append(box);
        });

        // Focar no input
        this.boxes.input.focus();
    }

    // Configurar teclas de atalho
    setupKeyBindings() {
        // Sair com Ctrl+C
        this.screen.key(['C-c'], () => {
            this.closeGUI();
        });

        // Tab para navegar entre elementos
        this.screen.key(['tab'], () => {
            this.screen.focusNext();
        });

        // Shift+Tab para navegar para trás
        this.screen.key(['S-tab'], () => {
            this.screen.focusPrevious();
        });

        // Enter no input para enviar mensagem
        this.boxes.input.key(['enter'], () => {
            const message = this.boxes.input.getValue();
            if (message.trim()) {
                this.handleUserInput(message);
                this.boxes.input.clearValue();
                this.screen.render();
            }
        });

        // F1 para ajuda
        this.screen.key(['f1'], () => {
            this.showHelp();
        });

        // F2 para limpar conversação
        this.screen.key(['f2'], () => {
            this.clearConversation();
        });

        // F3 para estatísticas
        this.screen.key(['f3'], () => {
            this.showStats();
        });
    }

    // Conteúdo do status
    getStatusContent() {
        const now = new Date();
        const uptime = process.uptime();
        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const cpu = process.cpuUsage();
        
        return `{red-fg}╔═ STATUS NEURAL ═╗{/}
{red-fg}║{/} {green-fg}●{/} SISTEMA ATIVO
{red-fg}║{/} {yellow-fg}⚡{/} ${now.toLocaleTimeString()}
{red-fg}║{/} {cyan-fg}🧠{/} Gemini-2.5-Pro
{red-fg}║{/} {magenta-fg}⏱{/}  ${this.formatUptime(uptime)}
{red-fg}║{/} {blue-fg}💾{/} ${memory}MB
{red-fg}╚══════════════════╝{/}

{yellow-fg}╔═ CONTROLES ═╗{/}
{yellow-fg}║{/} {bright-yellow-fg}F1{/} - Ajuda
{yellow-fg}║{/} {bright-yellow-fg}F2{/} - Limpar
{yellow-fg}║{/} {bright-yellow-fg}F3{/} - Stats
{yellow-fg}║{/} {bright-yellow-fg}Tab{/} - Navegar
{yellow-fg}║{/} {bright-red-fg}Ctrl+C{/} - Sair
{yellow-fg}╚═══════════════╝{/}`;
    }

    // Formatar tempo de execução
    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    // Conteúdo dos comandos
    getCommandsContent() {
        return `{cyan-fg}╔═══ COMANDOS BÁSICOS ═══╗{/}
{cyan-fg}║{/} {yellow-fg}1{/} {bright-white-fg}/help{/} - Ajuda
{cyan-fg}║{/} {yellow-fg}2{/} {bright-white-fg}/clear{/} - Limpar
{cyan-fg}║{/} {yellow-fg}3{/} {bright-white-fg}/weather{/} - Clima
{cyan-fg}║{/} {yellow-fg}4{/} {bright-white-fg}/intel{/} - Notícias
{cyan-fg}║{/} {yellow-fg}5{/} {bright-white-fg}/space{/} - NASA
{cyan-fg}║{/} {yellow-fg}6{/} {bright-white-fg}/compute{/} - Calc
{cyan-fg}╚═════════════════════════╝{/}

{magenta-fg}╔══ MÓDULOS AVANÇADOS ══╗{/}
{magenta-fg}║{/} {red-fg}🔍{/} {bright-white-fg}/osint-*{/} OSINT
{magenta-fg}║{/} {red-fg}🔧{/} {bright-white-fg}/pentest-*{/} Tests
{magenta-fg}║{/} {red-fg}🌐{/} {bright-white-fg}/api-*{/} APIs
{magenta-fg}║{/} {red-fg}📄{/} {bright-white-fg}/pdf-*{/} PDFs
{magenta-fg}║{/} {red-fg}🎵{/} {bright-white-fg}/voice{/} Voz
{magenta-fg}║{/} {red-fg}🛡️{/} {bright-white-fg}/security{/} Seg
{magenta-fg}╚═══════════════════════╝{/}

{gray-fg}💡 Digite número ou comando{/}`;
    }

    // Processar input do usuário
    async handleUserInput(message) {
        // Adicionar mensagem do usuário
        this.addMessage('USUÁRIO', message, 'cyan');
        
        // Log da atividade
        this.addLog(`Input recebido: ${message}`);
        
        // Aqui seria integrado com o processamento principal
        // Por enquanto, simulamos uma resposta
        this.addMessage('ZION', 'Processando sua solicitação...', 'red');
        
        // Callback para integração externa
        if (this.onUserInput) {
            await this.onUserInput(message);
        }
    }

    // Adicionar mensagem à conversação
    addMessage(sender, message, color = 'white') {
        const timestamp = new Date().toLocaleTimeString();
        const formattedMessage = `{${color}-fg}[${timestamp}] ${sender}:{/} ${message}`;
        
        this.boxes.conversation.log(formattedMessage);
        this.screen.render();
    }

    // Adicionar log de atividade
    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const formattedLog = `{gray-fg}[${timestamp}]{/} ${message}`;
        
        this.boxes.log.log(formattedLog);
        this.screen.render();
    }

    // Atualizar status
    updateStatus() {
        if (this.boxes.status) {
            this.boxes.status.setContent(this.getStatusContent());
            this.screen.render();
        }
    }

    // Mostrar ajuda
    showHelp() {
        const helpContent = `
{red-fg}{bold}ZION - INTERFACE NEURAL{/}

{yellow-fg}Navegação:{/}
• {cyan-fg}Tab{/} - Próximo elemento
• {cyan-fg}Shift+Tab{/} - Elemento anterior
• {cyan-fg}Enter{/} - Enviar mensagem
• {cyan-fg}Ctrl+C{/} - Voltar ao terminal

{yellow-fg}Teclas de Função:{/}
• {cyan-fg}F1{/} - Esta ajuda
• {cyan-fg}F2{/} - Limpar conversação
• {cyan-fg}F3{/} - Mostrar estatísticas

{yellow-fg}Comandos:{/}
Digite qualquer comando ZION
no campo de input abaixo.

Pressione qualquer tecla para fechar.`;

        const helpBox = blessed.message({
            parent: this.screen,
            top: 'center',
            left: 'center',
            width: 60,
            height: 20,
            border: {
                type: 'line',
                fg: 'yellow'
            },
            style: {
                fg: 'white',
                border: {
                    fg: 'yellow'
                }
            },
            tags: true
        });

        helpBox.display(helpContent, () => {
            this.screen.render();
        });
    }

    // Limpar conversação
    clearConversation() {
        this.boxes.conversation.setContent('');
        this.addLog('Conversação limpa');
        this.addMessage('ZION', 'Memória temporal purgada. Registros neurais eliminados.', 'red');
    }

    // Mostrar estatísticas
    async showStats() {
        const statsContent = `
{red-fg}{bold}ESTATÍSTICAS NEURAIS{/}

{yellow-fg}Tempo Online:{/} ${process.uptime().toFixed(0)}s
{yellow-fg}Memória Usada:{/} ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB
{yellow-fg}Processo ID:{/} ${process.pid}
{yellow-fg}Node.js:{/} ${process.version}
{yellow-fg}Plataforma:{/} ${process.platform}

{cyan-fg}Pressione qualquer tecla para fechar{/}`;

        const statsBox = blessed.message({
            parent: this.screen,
            top: 'center',
            left: 'center',
            width: 50,
            height: 15,
            border: {
                type: 'line',
                fg: 'green'
            },
            style: {
                fg: 'white',
                border: {
                    fg: 'green'
                }
            },
            tags: true
        });

        statsBox.display(statsContent, () => {
            this.screen.render();
        });
    }

    // Fechar interface GUI
    closeGUI() {
        if (this.screen && this.isGuiActive) {
            this.screen.destroy();
            this.isGuiActive = false;
            console.log(chalk.gray('🖥️  Interface neural desativada'));
            
            // Callback para notificar o sistema principal
            if (this.onClose) {
                this.onClose();
            }
        }
    }

    // Alternar entre modos
    toggleMode() {
        if (this.currentMode === 'terminal') {
            this.currentMode = 'gui';
            this.initGUI();
        } else {
            this.currentMode = 'terminal';
            this.closeGUI();
        }
    }

    // Definir callback para input do usuário
    setInputHandler(callback) {
        this.onUserInput = callback;
    }

    // Definir callback para fechamento
    setCloseHandler(callback) {
        this.onClose = callback;
    }

    // Interface melhorada para seleção de múltiplas opções
    async enhancedMultiSelect(message, choices, maxChoices = null) {
        console.log(chalk.red(`\n🎯 ${message}`));
        console.log(chalk.gray('   Use espaço para selecionar, Enter para confirmar'));
        
        const { selected } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selected',
                message: chalk.cyan('Selecione as opções:'),
                choices: choices.map(choice => ({
                    name: typeof choice === 'string' ? choice : choice.name,
                    value: typeof choice === 'string' ? choice : choice.value,
                    checked: typeof choice === 'object' ? choice.checked : false
                })),
                validate: (answer) => {
                    if (maxChoices && answer.length > maxChoices) {
                        return `Máximo ${maxChoices} seleções permitidas`;
                    }
                    return answer.length > 0 ? true : 'Selecione pelo menos uma opção';
                },
                prefix: '🔗'
            }
        ]);
        
        return selected;
    }

    // Interface melhorada para input de texto longo
    async enhancedTextInput(message, defaultValue = '') {
        console.log(chalk.red(`\n📝 ${message}`));
        console.log(chalk.gray('   Use editor de texto integrado para entrada longa'));
        
        const { text } = await inquirer.prompt([
            {
                type: 'editor',
                name: 'text',
                message: chalk.cyan('Digite o conteúdo:'),
                default: defaultValue,
                prefix: '📄'
            }
        ]);
        
        return text;
    }

    // Exibir progress bar personalizado
    showProgress(message, total) {
        console.log(chalk.red(`\n⚡ ${message}`));
        
        let current = 0;
        const progressBar = {
            update: (value, status = '') => {
                current = value;
                const percentage = Math.round((current / total) * 100);
                const filled = Math.round((current / total) * 30);
                const bar = '█'.repeat(filled) + '░'.repeat(30 - filled);
                
                process.stdout.write(`\r🔥 [${bar}] ${percentage}% ${status}`);
                
                if (current >= total) {
                    console.log(chalk.green('\n✅ Processamento concluído!'));
                }
            },
            
            finish: (message = 'Concluído') => {
                console.log(chalk.green(`\n✅ ${message}`));
            }
        };
        
        return progressBar;
    }
}

module.exports = InterfaceModule;


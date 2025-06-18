const chalk = require('chalk');
const boxen = require('boxen');
const Table = require('cli-table3');

class HelpSystem {
    constructor() {
        this.commandHelp = this.initializeCommandHelp();
        this.categories = this.initializeCategories();
    }

    // Inicializar ajuda detalhada para cada comando
    initializeCommandHelp() {
        return {
            // Comandos de Sistema
            '/help': {
                category: 'Sistema',
                description: 'Sistema de ajuda contextual inteligente',
                syntax: '/help [comando_específico]',
                examples: [
                    '/help',
                    '/help weather',
                    '/help osint-domain'
                ],
                parameters: [
                    { name: 'comando', type: 'opcional', description: 'Comando específico para ajuda detalhada' }
                ],
                related: ['/commands', '/diagnostics'],
                tips: 'Use /help seguido de qualquer comando para obter ajuda específica'
            },
            
            '/clear': {
                category: 'Sistema',
                description: 'Limpa o histórico de conversação neural',
                syntax: '/clear',
                examples: ['/clear'],
                parameters: [],
                related: ['/diagnostics', '/terminate'],
                tips: 'Comando irreversível - todo histórico será perdido'
            },
            
            '/diagnostics': {
                category: 'Sistema',
                description: 'Relatório completo do sistema neural',
                syntax: '/diagnostics',
                examples: ['/diagnostics'],
                parameters: [],
                related: ['/help', '/clear'],
                tips: 'Mostra informações detalhadas sobre o estado atual do sistema'
            },
            
            '/terminate': {
                category: 'Sistema',
                description: 'Encerra a sessão neural de forma segura',
                syntax: '/terminate',
                examples: ['/terminate'],
                parameters: [],
                related: ['/clear'],
                tips: 'Encerramento gracioso com limpeza de recursos'
            },
            
            // Comandos Geográficos
            '/scan': {
                category: 'Geográfico',
                description: 'Varredura dimensional de localização com dados reais',
                syntax: '/scan <localização>',
                examples: [
                    '/scan São Paulo',
                    '/scan "New York, USA"',
                    '/scan Tokyo'
                ],
                parameters: [
                    { name: 'localização', type: 'obrigatório', description: 'Nome da cidade ou endereço para varredura' }
                ],
                related: ['/weather', '/nations'],
                tips: 'Use aspas para localizações com espaços. Funciona com coordenadas também.'
            },
            
            '/weather': {
                category: 'Geográfico',
                description: 'Monitoramento atmosférico em tempo real',
                syntax: '/weather <cidade>',
                examples: [
                    '/weather Rio de Janeiro',
                    '/weather London',
                    '/weather "Los Angeles"'
                ],
                parameters: [
                    { name: 'cidade', type: 'obrigatório', description: 'Nome da cidade para consulta meteorológica' }
                ],
                related: ['/scan', '/nations'],
                tips: 'Inclui previsão estendida, alertas e dados históricos'
            },
            
            '/nations': {
                category: 'Geográfico',
                description: 'Database geopolítico mundial completo',
                syntax: '/nations <país>',
                examples: [
                    '/nations Brazil',
                    '/nations "United States"',
                    '/nations Japan'
                ],
                parameters: [
                    { name: 'país', type: 'obrigatório', description: 'Nome do país em inglês ou português' }
                ],
                related: ['/scan', '/intel'],
                tips: 'Dados incluem economia, geografia, população e política'
            },
            
            // Comandos de Intelligence
            '/intel': {
                category: 'Intelligence',
                description: 'Sistema de inteligência global de notícias',
                syntax: '/intel <tópico>',
                examples: [
                    '/intel tecnologia',
                    '/intel "artificial intelligence"',
                    '/intel trending'
                ],
                parameters: [
                    { name: 'tópico', type: 'obrigatório', description: 'Palavra-chave ou tópico para busca' }
                ],
                related: ['/papers', '/space'],
                tips: 'Use "trending" para notícias em alta ou "top" para manchetes'
            },
            
            '/space': {
                category: 'Intelligence',
                description: 'Dados de sensores espaciais NASA em tempo real',
                syntax: '/space',
                examples: ['/space'],
                parameters: [],
                related: ['/intel', '/papers'],
                tips: 'Inclui APOD, asteroides próximos e dados de missões ativas'
            },
            
            '/papers': {
                category: 'Intelligence',
                description: 'Base científica ArXiv para pesquisa acadêmica',
                syntax: '/papers <tema>',
                examples: [
                    '/papers machine learning',
                    '/papers quantum physics',
                    '/papers "neural networks"'
                ],
                parameters: [
                    { name: 'tema', type: 'obrigatório', description: 'Área de pesquisa ou palavras-chave científicas' }
                ],
                related: ['/intel', '/space'],
                tips: 'Busca em milhões de papers científicos indexados'
            },
            
            // Comandos OSINT
            '/osint-domain': {
                category: 'OSINT',
                description: 'Análise OSINT completa de domínio web',
                syntax: '/osint-domain <domínio>',
                examples: [
                    '/osint-domain google.com',
                    '/osint-domain github.io',
                    '/osint-domain example.org'
                ],
                parameters: [
                    { name: 'domínio', type: 'obrigatório', description: 'Domínio web para análise (sem http://)' }
                ],
                related: ['/osint-ip', '/pentest-recon'],
                tips: 'Inclui whois, DNS, certificados SSL e histórico'
            },
            
            '/osint-ip': {
                category: 'OSINT',
                description: 'Geolocalização e análise de endereço IP',
                syntax: '/osint-ip <endereço>',
                examples: [
                    '/osint-ip 8.8.8.8',
                    '/osint-ip 192.168.1.1',
                    '/osint-ip 2001:4860:4860::8888'
                ],
                parameters: [
                    { name: 'endereço', type: 'obrigatório', description: 'Endereço IPv4 ou IPv6 para análise' }
                ],
                related: ['/osint-domain', '/pentest-ports'],
                tips: 'Funciona com IPv4 e IPv6, incluindo geolocalização precisa'
            },
            
            // Comandos de Cálculo
            '/compute': {
                category: 'Processamento',
                description: 'Sistema de cálculos quânticos seguro',
                syntax: '/compute <expressão>',
                examples: [
                    '/compute 2 + 2 * 3',
                    '/compute sqrt(16) + sin(pi/2)',
                    '/compute (10^2) / (5-3)'
                ],
                parameters: [
                    { name: 'expressão', type: 'obrigatório', description: 'Expressão matemática válida' }
                ],
                related: ['/papers'],
                tips: 'Suporta funções matemáticas complexas e constantes'
            },
            
            // Comandos PDF
            '/pdf-analyze': {
                category: 'Documentos',
                description: 'Análise neural completa de documento PDF',
                syntax: '/pdf-analyze <arquivo>',
                examples: [
                    '/pdf-analyze documento.pdf',
                    '/pdf-analyze "./files/report.pdf"',
                    '/pdf-analyze /path/to/file.pdf'
                ],
                parameters: [
                    { name: 'arquivo', type: 'obrigatório', description: 'Caminho para o arquivo PDF' }
                ],
                related: ['/pdf-ask', '/pdf-extract'],
                tips: 'Aceita caminhos relativos e absolutos. Gera resumo inteligente.'
            },
            
            '/pdf-ask': {
                category: 'Documentos',
                description: 'Sistema de perguntas sobre conteúdo PDF',
                syntax: '/pdf-ask <arquivo> <pergunta>',
                examples: [
                    '/pdf-ask relatorio.pdf "Qual é a conclusão principal?"',
                    '/pdf-ask doc.pdf "Quais são os valores mencionados?"'
                ],
                parameters: [
                    { name: 'arquivo', type: 'obrigatório', description: 'Caminho para o arquivo PDF' },
                    { name: 'pergunta', type: 'obrigatório', description: 'Pergunta específica sobre o conteúdo' }
                ],
                related: ['/pdf-analyze', '/pdf-extract'],
                tips: 'Use aspas para perguntas com espaços. IA contextual integrada.'
            },
            
            // Comandos adicionais para compatibilidade com testes
            '/calc': {
                category: 'Sistema',
                description: 'Calculadora segura',
                syntax: '/calc <expressão matemática>',
                examples: [
                    '/calc 2 + 2',
                    '/calc sqrt(16)',
                    '/calc sin(pi/2)',
                    '/calc cos(0)',
                    '/calc log(10)'
                ],
                parameters: [
                    { name: 'expressão', type: 'obrigatório', description: 'Expressão matemática para calcular' }
                ],
                related: ['/compute'],
                tips: 'Suporta funções: sqrt, sin, cos, tan, log, exp, pi'
            },
            
            '/history': {
                category: 'Sistema',
                description: 'Histórico de conversa',
                syntax: '/history [limite]',
                examples: [
                    '/history',
                    '/history 10',
                    '/history 20'
                ],
                parameters: [
                    { name: 'limite', type: 'opcional', description: 'Número de mensagens para mostrar' }
                ],
                related: ['/search', '/clear'],
                tips: 'Mostra as últimas mensagens da conversa'
            },
            
            '/search': {
                category: 'Sistema',
                description: 'Buscar no histórico',
                syntax: '/search <termo de busca>',
                examples: [
                    '/search python',
                    '/search "machine learning"',
                    '/search erro'
                ],
                parameters: [
                    { name: 'termo', type: 'obrigatório', description: 'Termo para buscar no histórico' }
                ],
                related: ['/history'],
                tips: 'Busca case-insensitive no histórico de mensagens'
            },
            
            '/stats': {
                category: 'Sistema',
                description: 'Estatísticas do chat',
                syntax: '/stats',
                examples: ['/stats'],
                parameters: [],
                related: ['/history'],
                tips: 'Mostra informações sobre mensagens, comandos usados e estatísticas'
            },
            
            '/export': {
                category: 'Sistema',
                description: 'Exportar dados',
                syntax: '/export <formato>',
                examples: [
                    '/export json',
                    '/export csv',
                    '/export txt'
                ],
                parameters: [
                    { name: 'formato', type: 'obrigatório', description: 'Formato de exportação (json, csv, txt)' }
                ],
                related: ['/history'],
                tips: 'Exporta histórico e dados da sessão'
            },
            
            '/interface': {
                category: 'Sistema',
                description: 'Alternar interface',
                syntax: '/interface <tipo>',
                examples: [
                    '/interface blessed',
                    '/interface inquirer',
                    '/interface readline'
                ],
                parameters: [
                    { name: 'tipo', type: 'obrigatório', description: 'Tipo de interface (blessed, inquirer, readline)' }
                ],
                related: ['/clear'],
                tips: 'Muda entre diferentes tipos de interface do terminal'
            },
            
            '/voice': {
                category: 'Sistema',
                description: 'Assistente de voz ZION',
                syntax: '/voice <comando>',
                examples: [
                    '/voice speak "Olá mundo"',
                    '/voice listen',
                    '/voice start',
                    '/voice stop',
                    '/voice config'
                ],
                parameters: [
                    { name: 'comando', type: 'obrigatório', description: 'Comando de voz (speak, listen, start, stop, config)' }
                ],
                related: ['/help'],
                tips: 'Sistema completo de TTS, STT e controle por voz'
            },
            
            '/tts': {
                category: 'Sistema',
                description: 'Text-to-Speech (Síntese de voz)',
                syntax: '/tts <texto>',
                examples: [
                    '/tts "Olá, como você está?"',
                    '/tts --engine edge-tts "Teste de voz"',
                    '/tts --voice pt-BR-FranciscaNeural "Olá"'
                ],
                parameters: [
                    { name: 'texto', type: 'obrigatório', description: 'Texto para ser falado' },
                    { name: '--engine', type: 'opcional', description: 'Engine TTS (pyttsx3, edge-tts)' },
                    { name: '--voice', type: 'opcional', description: 'Voz específica' }
                ],
                related: ['/voice', '/stt'],
                tips: 'Fala qualquer texto usando síntese de voz'
            },
            
            '/stt': {
                category: 'Sistema',
                description: 'Speech-to-Text (Reconhecimento de voz)',
                syntax: '/stt [opções]',
                examples: [
                    '/stt',
                    '/stt --engine vosk',
                    '/stt --timeout 10',
                    '/stt --calibrate'
                ],
                parameters: [
                    { name: '--engine', type: 'opcional', description: 'Engine STT (google, vosk, whisper)' },
                    { name: '--timeout', type: 'opcional', description: 'Timeout em segundos' },
                    { name: '--calibrate', type: 'opcional', description: 'Calibrar microfone' }
                ],
                related: ['/voice', '/tts'],
                tips: 'Escuta comandos de voz e converte em texto'
            },
            
            '/control': {
                category: 'Sistema',
                description: 'Controle do computador',
                syntax: '/control <ação> [argumentos]',
                examples: [
                    '/control open "notepad"',
                    '/control click 100 200',
                    '/control type "Hello World"',
                    '/control press "enter"',
                    '/control screenshot'
                ],
                parameters: [
                    { name: 'ação', type: 'obrigatório', description: 'Ação a executar (open, click, type, press, screenshot)' },
                    { name: 'argumentos', type: 'opcional', description: 'Argumentos específicos da ação' }
                ],
                related: ['/voice'],
                tips: 'Controla mouse, teclado e aplicações do sistema'
            }
        };
    }

    // Inicializar categorias de comandos
    initializeCategories() {
        return {
            'Sistema': {
                icon: '🔧',
                description: 'Controle e monitoramento do sistema neural',
                commands: ['/help', '/clear', '/diagnostics', '/terminate', '/prompt', '/calc', '/history', '/search', '/stats', '/export', '/interface', '/voice', '/tts', '/stt', '/control']
            },
            'Geográfico': {
                icon: '🌍',
                description: 'Dados geográficos e climáticos globais',
                commands: ['/scan', '/weather', '/time', '/nations']
            },
            'Intelligence': {
                icon: '📰',
                description: 'Inteligência global e dados científicos',
                commands: ['/intel', '/space', '/papers']
            },
            'Financeiro': {
                icon: '💰',
                description: 'Dados financeiros e econômicos',
                commands: ['/crypto', '/stocks', '/economy']
            },
            'OSINT': {
                icon: '🕵️',
                description: 'Open Source Intelligence avançada',
                commands: ['/osint-domain', '/osint-person', '/osint-ip', '/osint-social']
            },
            'Pentest': {
                icon: '⚔️',
                description: 'Ferramentas de teste de penetração',
                commands: ['/pentest-recon', '/pentest-ports', '/pentest-vulns', '/pentest-web']
            },
            'Processamento': {
                icon: '🧠',
                description: 'Cálculos e processamento de dados',
                commands: ['/compute']
            },
            'Documentos': {
                icon: '📄',
                description: 'Análise e processamento de PDFs',
                commands: ['/pdf-scan', '/pdf-analyze', '/pdf-ask', '/pdf-extract']
            },
            'APIs': {
                icon: '🔗',
                description: 'Desenvolvimento e testes de APIs',
                commands: ['/posts', '/users', '/albums', '/todos']
            }
        };
    }

    // Ajuda geral (lista todas as categorias)
    showGeneralHelp() {
        console.log(boxen(
            chalk.red.bold('🧠 SISTEMA DE AJUDA CONTEXTUAL ZION'),
            {
                title: '❓ AJUDA NEURAL',
                titleAlignment: 'center',
                padding: 1,
                borderColor: 'red',
                borderStyle: 'double'
            }
        ));

        console.log(chalk.yellow('\n💡 USO: /help [comando] para ajuda específica\n'));

        Object.entries(this.categories).forEach(([categoryName, categoryInfo]) => {
            console.log(chalk.red.bold(`\n${categoryInfo.icon} ${categoryName.toUpperCase()}`));
            console.log(chalk.gray(`   ${categoryInfo.description}`));
            console.log(chalk.gray('━'.repeat(50)));
            
            categoryInfo.commands.forEach(command => {
                const helpData = this.commandHelp[command];
                const description = helpData ? helpData.description : 'Comando disponível';
                console.log(chalk.cyan(`   ${command.padEnd(20)} `) + chalk.white(description));
            });
        });

        console.log(chalk.yellow('\n🎯 EXEMPLOS DE USO:'));
        console.log(chalk.gray('   /help weather          - Ajuda sobre comando weather'));
        console.log(chalk.gray('   /help osint-domain     - Ajuda sobre análise OSINT'));
        console.log(chalk.gray('   /help Sistema          - Todos comandos de sistema'));
        console.log();
    }

    // Ajuda específica para um comando
    showCommandHelp(command) {
        // Verificar se comando é undefined ou null
        if (command === undefined || command === null) {
            console.log(chalk.red(`❌ Comando "" não encontrado`));
            this.suggestSimilarCommands('');
            return;
        }
        
        // Normalizar comando (remover / se necessário)
        const normalizedCommand = command.startsWith('/') ? command : `/${command}`;
        
        const helpData = this.commandHelp[normalizedCommand];
        
        if (!helpData) {
            console.log(chalk.red(`❌ Comando "${command}" não encontrado`));
            this.suggestSimilarCommands(command);
            return;
        }

        console.log(boxen(
            chalk.red.bold(`🎯 AJUDA: ${normalizedCommand.toUpperCase()}`),
            {
                title: '📖 MANUAL DETALHADO',
                titleAlignment: 'center',
                padding: 1,
                borderColor: 'yellow',
                borderStyle: 'round'
            }
        ));

        // Descrição
        console.log(chalk.yellow('\n📝 DESCRIÇÃO:'));
        console.log(chalk.white(`   ${helpData.description}`));

        // Sintaxe
        console.log(chalk.yellow('\n⚡ SINTAXE:'));
        console.log(chalk.cyan(`   ${helpData.syntax}`));

        // Parâmetros
        if (helpData.parameters && helpData.parameters.length > 0) {
            console.log(chalk.yellow('\n🔧 PARÂMETROS:'));
            
            const paramTable = new Table({
                head: ['Parâmetro', 'Tipo', 'Descrição'],
                colWidths: [15, 12, 40],
                style: {
                    head: ['cyan'],
                    border: ['gray']
                }
            });

            helpData.parameters.forEach(param => {
                paramTable.push([
                    chalk.white(param.name),
                    param.type === 'obrigatório' ? chalk.red(param.type) : chalk.green(param.type),
                    chalk.gray(param.description)
                ]);
            });

            console.log(paramTable.toString());
        }

        // Exemplos
        if (helpData.examples && helpData.examples.length > 0) {
            console.log(chalk.yellow('\n💡 EXEMPLOS:'));
            helpData.examples.forEach((example, index) => {
                console.log(chalk.gray(`   ${index + 1}. `) + chalk.cyan(example));
            });
        }

        // Comandos relacionados
        if (helpData.related && helpData.related.length > 0) {
            console.log(chalk.yellow('\n🔗 COMANDOS RELACIONADOS:'));
            console.log(chalk.cyan(`   ${helpData.related.join(', ')}`));
        }

        // Dicas
        if (helpData.tips) {
            console.log(chalk.yellow('\n💭 DICAS:'));
            console.log(chalk.green(`   ${helpData.tips}`));
        }

        console.log();
    }

    // Ajuda por categoria
    showCategoryHelp(categoryName) {
        const category = this.categories[categoryName];
        
        if (!category) {
            console.log(chalk.red(`❌ Categoria "${categoryName}" não encontrada`));
            console.log(chalk.yellow('📁 Categorias disponíveis: ') + 
                       chalk.cyan(Object.keys(this.categories).join(', ')));
            return;
        }

        console.log(boxen(
            chalk.red.bold(`${category.icon} ${categoryName.toUpperCase()}`),
            {
                title: '📂 CATEGORIA',
                titleAlignment: 'center',
                padding: 1,
                borderColor: 'cyan',
                borderStyle: 'round'
            }
        ));

        console.log(chalk.yellow('\n📝 DESCRIÇÃO:'));
        console.log(chalk.white(`   ${category.description}`));

        console.log(chalk.yellow('\n🔧 COMANDOS DISPONÍVEIS:'));
        
        category.commands.forEach(command => {
            const helpData = this.commandHelp[command];
            if (helpData) {
                console.log(chalk.cyan(`\n   ${command}`));
                console.log(chalk.gray(`     ${helpData.description}`));
                console.log(chalk.white(`     Sintaxe: ${helpData.syntax}`));
            } else {
                console.log(chalk.cyan(`\n   ${command}`));
                console.log(chalk.gray('     Comando disponível'));
            }
        });

        console.log(chalk.yellow('\n💡 Para ajuda específica use: /help <comando>'));
        console.log();
    }

    // Sugerir comandos similares
    suggestSimilarCommands(input) {
        const allCommands = Object.keys(this.commandHelp);
        const suggestions = [];
        
        // Buscar comandos que contenham parte do input
        allCommands.forEach(command => {
            if (command.toLowerCase().includes(input.toLowerCase()) ||
                input.toLowerCase().includes(command.toLowerCase().replace('/', ''))) {
                suggestions.push(command);
            }
        });

        if (suggestions.length > 0) {
            console.log(chalk.yellow('\n🔍 Comandos similares encontrados:'));
            suggestions.forEach(suggestion => {
                console.log(chalk.cyan(`   ${suggestion} - ${this.commandHelp[suggestion].description}`));
            });
        } else {
            console.log(chalk.yellow('\n💡 Use /help para ver todos os comandos disponíveis'));
        }
        console.log();
    }

    // Processador principal de ajuda
    processHelp(input) {
        const parts = input.trim().split(' ');
        
        if (parts.length === 1) {
            // Apenas /help
            this.showGeneralHelp();
        } else {
            const target = parts[1];
            
            // Verificar se é uma categoria
            if (this.categories[target]) {
                this.showCategoryHelp(target);
            } else {
                // Assumir que é um comando específico
                this.showCommandHelp(target);
            }
        }
    }

    // Buscar comandos por palavra-chave
    searchCommands(keyword) {
        const results = [];
        
        Object.entries(this.commandHelp).forEach(([command, data]) => {
            if (command.toLowerCase().includes(keyword.toLowerCase()) ||
                data.description.toLowerCase().includes(keyword.toLowerCase()) ||
                data.category.toLowerCase().includes(keyword.toLowerCase())) {
                results.push({ command, data });
            }
        });

        if (results.length === 0) {
            console.log(chalk.red(`❌ Nenhum comando encontrado para: "${keyword}"`));
            return;
        }

        console.log(boxen(
            chalk.red.bold(`🔍 BUSCA: "${keyword.toUpperCase()}"`),
            {
                title: '🎯 RESULTADOS',
                titleAlignment: 'center',
                padding: 1,
                borderColor: 'green',
                borderStyle: 'round'
            }
        ));

        console.log(chalk.yellow(`\n📊 ${results.length} comando(s) encontrado(s):\n`));
        
        results.forEach(({ command, data }) => {
            console.log(chalk.cyan(`${command}`));
            console.log(chalk.gray(`   Categoria: ${data.category}`));
            console.log(chalk.white(`   ${data.description}`));
            console.log(chalk.white(`   Sintaxe: ${data.syntax}\n`));
        });
    }

    // Métodos auxiliares para os testes
    getAvailableCommands() {
        return Object.keys(this.commandHelp).map(cmd => cmd.replace('/', ''));
    }

    hasCommand(command) {
        const normalizedCommand = command.startsWith('/') ? command : `/${command}`;
        return this.commandHelp.hasOwnProperty(normalizedCommand);
    }

    getCommandInfo(command) {
        const normalizedCommand = command.startsWith('/') ? command : `/${command}`;
        const helpData = this.commandHelp[normalizedCommand];
        
        if (!helpData) {
            return null;
        }
        
        return {
            description: helpData.description,
            usage: helpData.syntax,
            examples: helpData.examples,
            category: helpData.category,
            parameters: helpData.parameters,
            related: helpData.related,
            tips: helpData.tips
        };
    }
}

module.exports = HelpSystem;


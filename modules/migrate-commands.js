const CommandProcessorV2 = require('./command-processor-v2');
const chalk = require('chalk');
const boxen = require('boxen');

/**
 * Migration script to register all existing commands with CommandProcessorV2
 * This maintains backward compatibility while providing the new flexible system
 */
class CommandMigrator {
    constructor(zion) {
        this.zion = zion;
        this.processor = new CommandProcessorV2();
        this.originalProcessor = null; // Will hold reference to old processor for handlers
    }

    /**
     * Migrate all commands from the original command processor
     */
    async migrateAllCommands() {
        console.log(chalk.blue('🔄 Starting command migration to CommandProcessorV2...'));
        
        // Import the original command processor to access its methods
        const OriginalCommandProcessor = require('./command-processor');
        this.originalProcessor = new OriginalCommandProcessor();
        
        // Register all command categories
        this.registerSystemCommands();
        this.registerExplorationCommands();
        this.registerFinancialCommands();
        this.registerAPICommands();
        this.registerDocumentCommands();
        this.registerComputationCommands();
        this.registerSelfModificationCommands();
        this.registerVoiceCommands();
        this.registerOSINTCommands();
        this.registerPentestCommands();
        this.registerAdvancedAPICommands();
        this.registerVisualizationCommands();
        this.registerAlgumacoisaCommands();
        
        console.log(chalk.green('✅ Command migration completed successfully!'));
        console.log(chalk.gray(`   Total commands registered: ${this.processor.getRegisteredCommands().length}`));
        
        return this.processor;
    }

    /**
     * Register system commands (/help, /clear, /prompt, etc.)
     */
    registerSystemCommands() {
        // /help command
        this.processor.registerCommand({
            name: 'help',
            description: 'Exibe informações de ajuda e comandos disponíveis',
            category: 'Sistema',
            permissions: [],
            aliases: ['h', '?'],
            parameters: [
                { name: 'comando', type: 'string', required: false, description: 'Comando específico para obter ajuda detalhada' }
            ],
            examples: ['/help', '/help database', '/help financial'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleHelp(args, this.zion);
            }
        });

        // /clear command
        this.processor.registerCommand({
            name: 'clear',
            description: 'Limpa o terminal e reinicia a interface',
            category: 'Sistema',
            permissions: [],
            aliases: ['cls', 'limpar'],
            parameters: [],
            examples: ['/clear'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleClear(args, this.zion);
            }
        });

        // /prompt command
        this.processor.registerCommand({
            name: 'prompt',
            description: 'Define ou exibe o prompt personalizado do sistema',
            category: 'Sistema',
            permissions: ['admin'],
            aliases: ['setprompt'],
            parameters: [
                { name: 'novo_prompt', type: 'string', required: false, description: 'Novo prompt a ser definido' }
            ],
            examples: ['/prompt', '/prompt "Assistente Personalizado >"'],
            handler: async (args, context) => {
                return await this.originalProcessor.handlePrompt(args, this.zion);
            }
        });

        // /diagnostics command
        this.processor.registerCommand({
            name: 'diagnostics',
            description: 'Executa diagnósticos completos do sistema',
            category: 'Sistema',
            permissions: ['admin'],
            aliases: ['diag', 'diagnostico'],
            parameters: [],
            examples: ['/diagnostics'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleDiagnostics(args, this.zion);
            }
        });

        // /interface command
        this.processor.registerCommand({
            name: 'interface',
            description: 'Gerencia configurações da interface do usuário',
            category: 'Sistema',
            permissions: [],
            aliases: ['ui', 'config'],
            parameters: [
                { name: 'acao', type: 'string', required: true, description: 'Ação a executar (theme, layout, reset)' },
                { name: 'valor', type: 'string', required: false, description: 'Valor para a configuração' }
            ],
            examples: ['/interface theme dark', '/interface layout compact', '/interface reset'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleInterface(args, this.zion);
            }
        });

        // /database command
        this.processor.registerCommand({
            name: 'database',
            description: 'Operações avançadas de banco de dados',
            category: 'Sistema',
            permissions: ['admin', 'database'],
            aliases: ['db', 'banco'],
            parameters: [
                { name: 'operacao', type: 'string', required: true, description: 'Operação a executar (backup, restore, optimize, query)' },
                { name: 'parametros', type: 'string', required: false, description: 'Parâmetros adicionais' }
            ],
            examples: ['/database backup', '/database query "SELECT * FROM users"', '/database optimize'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleDatabase(args, this.zion);
            }
        });

        // /terminate command
        this.processor.registerCommand({
            name: 'terminate',
            description: 'Encerra o sistema de forma segura',
            category: 'Sistema',
            permissions: ['admin'],
            aliases: ['exit', 'quit', 'shutdown'],
            parameters: [
                { name: 'forca', type: 'string', required: false, description: 'Use "force" para encerramento forçado' }
            ],
            examples: ['/terminate', '/terminate force'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleTerminate(args, this.zion);
            }
        });

        // /status command
        this.processor.registerCommand({
            name: 'status',
            description: 'Exibe status completo do sistema',
            category: 'Sistema',
            permissions: [],
            aliases: ['stat', 'info'],
            parameters: [],
            examples: ['/status'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleStatus(args, this.zion);
            }
        });
    }

    /**
     * Register exploration commands (/scan, /deep-scan, /monitor, etc.)
     */
    registerExplorationCommands() {
        // /scan command
        this.processor.registerCommand({
            name: 'scan',
            description: 'Realiza varredura básica de sistemas e redes',
            category: 'Exploração',
            permissions: ['scan'],
            aliases: ['varredura'],
            parameters: [
                { name: 'alvo', type: 'string', required: true, description: 'Alvo para varredura (IP, domínio, rede)' },
                { name: 'tipo', type: 'string', required: false, description: 'Tipo de varredura (basic, full, stealth)' }
            ],
            examples: ['/scan 192.168.1.1', '/scan google.com full', '/scan 10.0.0.0/24 stealth'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleScan(args, this.zion);
            }
        });

        // /deep-scan command
        this.processor.registerCommand({
            name: 'deep-scan',
            description: 'Varredura profunda com análise detalhada',
            category: 'Exploração',
            permissions: ['scan', 'deep-scan'],
            aliases: ['dscan', 'varredura-profunda'],
            parameters: [
                { name: 'alvo', type: 'string', required: true, description: 'Alvo para varredura profunda' },
                { name: 'opcoes', type: 'string', required: false, description: 'Opções adicionais (verbose, quiet, aggressive)' }
            ],
            examples: ['/deep-scan 192.168.1.100', '/deep-scan target.com verbose'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleDeepScan(args, this.zion);
            }
        });

        // /monitor command
        this.processor.registerCommand({
            name: 'monitor',
            description: 'Monitora sistemas, processos e recursos em tempo real',
            category: 'Exploração',
            permissions: ['monitor'],
            aliases: ['mon', 'watch'],
            parameters: [
                { name: 'tipo', type: 'string', required: true, description: 'Tipo de monitoramento (system, network, process, resource)' },
                { name: 'alvo', type: 'string', required: false, description: 'Alvo específico para monitorar' }
            ],
            examples: ['/monitor system', '/monitor network eth0', '/monitor process nginx'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleMonitor(args, this.zion);
            }
        });

        // /trace command
        this.processor.registerCommand({
            name: 'trace',
            description: 'Rastreia rotas de rede e conexões',
            category: 'Exploração',
            permissions: ['trace'],
            aliases: ['traceroute', 'rastrear'],
            parameters: [
                { name: 'destino', type: 'string', required: true, description: 'Destino para rastreamento' },
                { name: 'max_hops', type: 'number', required: false, description: 'Número máximo de saltos' }
            ],
            examples: ['/trace google.com', '/trace 8.8.8.8 20'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleTrace(args, this.zion);
            }
        });
    }

    /**
     * Register financial intelligence commands
     */
    registerFinancialCommands() {
        // /financial command
        this.processor.registerCommand({
            name: 'financial',
            description: 'Análise de inteligência financeira avançada',
            category: 'Financeiro',
            permissions: ['financial'],
            aliases: ['fin', 'financeiro'],
            parameters: [
                { name: 'operacao', type: 'string', required: true, description: 'Operação financeira (analyze, forecast, report, alert)' },
                { name: 'parametros', type: 'string', required: false, description: 'Parâmetros específicos da operação' }
            ],
            examples: ['/financial analyze AAPL', '/financial forecast BTC 30d', '/financial report portfolio'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleFinancial(args, this.zion);
            }
        });

        // /crypto command
        this.processor.registerCommand({
            name: 'crypto',
            description: 'Análise de criptomoedas e blockchain',
            category: 'Financeiro',
            permissions: ['financial', 'crypto'],
            aliases: ['cripto', 'blockchain'],
            parameters: [
                { name: 'acao', type: 'string', required: true, description: 'Ação (price, analyze, whale, defi)' },
                { name: 'symbol', type: 'string', required: false, description: 'Símbolo da criptomoeda' }
            ],
            examples: ['/crypto price BTC', '/crypto analyze ETH', '/crypto whale movements'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleCrypto(args, this.zion);
            }
        });

        // /market command
        this.processor.registerCommand({
            name: 'market',
            description: 'Análise de mercado e tendências financeiras',
            category: 'Financeiro',
            permissions: ['financial', 'market'],
            aliases: ['mercado', 'stocks'],
            parameters: [
                { name: 'tipo', type: 'string', required: true, description: 'Tipo de análise (overview, sector, stock, futures)' },
                { name: 'parametro', type: 'string', required: false, description: 'Parâmetro específico' }
            ],
            examples: ['/market overview', '/market sector tech', '/market stock MSFT'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleMarket(args, this.zion);
            }
        });
    }

    /**
     * Register API integration commands
     */
    registerAPICommands() {
        // /api-call command
        this.processor.registerCommand({
            name: 'api-call',
            description: 'Executa chamadas de API personalizadas',
            category: 'API',
            permissions: ['api'],
            aliases: ['api', 'call-api'],
            parameters: [
                { name: 'url', type: 'string', required: true, description: 'URL da API' },
                { name: 'method', type: 'string', required: false, description: 'Método HTTP (GET, POST, PUT, DELETE)' },
                { name: 'data', type: 'string', required: false, description: 'Dados JSON para enviar' }
            ],
            examples: ['/api-call https://api.example.com/data', '/api-call https://api.example.com/users POST {"name":"João"}'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleApiCall(args, this.zion);
            }
        });

        // /webhook command
        this.processor.registerCommand({
            name: 'webhook',
            description: 'Gerencia webhooks e integrações',
            category: 'API',
            permissions: ['api', 'webhook'],
            aliases: ['hook'],
            parameters: [
                { name: 'acao', type: 'string', required: true, description: 'Ação (create, delete, list, test)' },
                { name: 'url', type: 'string', required: false, description: 'URL do webhook' }
            ],
            examples: ['/webhook create https://myapp.com/hook', '/webhook list', '/webhook test webhook-id'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleWebhook(args, this.zion);
            }
        });
    }

    /**
     * Register document processing commands
     */
    registerDocumentCommands() {
        // /document command
        this.processor.registerCommand({
            name: 'document',
            description: 'Processamento avançado de documentos',
            category: 'Documentos',
            permissions: ['document'],
            aliases: ['doc', 'processo-doc'],
            parameters: [
                { name: 'acao', type: 'string', required: true, description: 'Ação (analyze, extract, convert, ocr)' },
                { name: 'arquivo', type: 'string', required: true, description: 'Caminho do arquivo' },
                { name: 'opcoes', type: 'string', required: false, description: 'Opções adicionais' }
            ],
            examples: ['/document analyze document.pdf', '/document ocr image.png', '/document extract data.xlsx'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleDocument(args, this.zion);
            }
        });

        // /pdf command
        this.processor.registerCommand({
            name: 'pdf',
            description: 'Operações específicas com arquivos PDF',
            category: 'Documentos',
            permissions: ['document', 'pdf'],
            aliases: ['pdf-ops'],
            parameters: [
                { name: 'operacao', type: 'string', required: true, description: 'Operação (merge, split, extract, compress)' },
                { name: 'arquivos', type: 'string', required: true, description: 'Arquivo(s) PDF' }
            ],
            examples: ['/pdf merge file1.pdf file2.pdf', '/pdf split document.pdf', '/pdf extract text document.pdf'],
            handler: async (args, context) => {
                return await this.originalProcessor.handlePdf(args, this.zion);
            }
        });
    }

    /**
     * Register computation and analysis commands
     */
    registerComputationCommands() {
        // /compute command
        this.processor.registerCommand({
            name: 'compute',
            description: 'Executa cálculos e análises computacionais avançadas',
            category: 'Computação',
            permissions: ['compute'],
            aliases: ['calc', 'calculo'],
            parameters: [
                { name: 'expressao', type: 'string', required: true, description: 'Expressão matemática ou operação' },
                { name: 'formato', type: 'string', required: false, description: 'Formato de saída (decimal, scientific, fraction)' }
            ],
            examples: ['/compute 2^10 + sqrt(144)', '/compute derivative(x^2, x)', '/compute matrix([[1,2],[3,4]]) * [[5],[6]]'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleCompute(args, this.zion);
            }
        });

        // /analyze-data command
        this.processor.registerCommand({
            name: 'analyze-data',
            description: 'Análise estatística e de dados avançada',
            category: 'Computação',
            permissions: ['compute', 'data-analysis'],
            aliases: ['analise-dados', 'stats'],
            parameters: [
                { name: 'dados', type: 'string', required: true, description: 'Dados ou arquivo para análise' },
                { name: 'tipo', type: 'string', required: false, description: 'Tipo de análise (descriptive, correlation, regression)' }
            ],
            examples: ['/analyze-data data.csv', '/analyze-data [1,2,3,4,5] descriptive', '/analyze-data sales.json correlation'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleAnalyzeData(args, this.zion);
            }
        });
    }

    /**
     * Register self-modification commands
     */
    registerSelfModificationCommands() {
        // /self-modify command
        this.processor.registerCommand({
            name: 'self-modify',
            description: 'Modificações e atualizações do sistema ZION',
            category: 'Auto-Modificação',
            permissions: ['admin', 'self-modify'],
            aliases: ['auto-modify', 'update-self'],
            parameters: [
                { name: 'tipo', type: 'string', required: true, description: 'Tipo de modificação (code, config, knowledge, capabilities)' },
                { name: 'descricao', type: 'string', required: true, description: 'Descrição da modificação' }
            ],
            examples: ['/self-modify code "Add new encryption method"', '/self-modify capabilities "Enhance image processing"'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleSelfModify(args, this.zion);
            }
        });

        // /learn command
        this.processor.registerCommand({
            name: 'learn',
            description: 'Sistema de aprendizado adaptativo',
            category: 'Auto-Modificação',
            permissions: ['learn'],
            aliases: ['aprender', 'adaptive-learn'],
            parameters: [
                { name: 'fonte', type: 'string', required: true, description: 'Fonte de aprendizado (text, file, url, interaction)' },
                { name: 'conteudo', type: 'string', required: true, description: 'Conteúdo para aprender' }
            ],
            examples: ['/learn file manual.pdf', '/learn text "Novos procedimentos de segurança"', '/learn url https://docs.api.com'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleLearn(args, this.zion);
            }
        });
    }

    /**
     * Register voice and audio commands
     */
    registerVoiceCommands() {
        // /voice command
        this.processor.registerCommand({
            name: 'voice',
            description: 'Processamento de voz e áudio avançado',
            category: 'Voz',
            permissions: ['voice'],
            aliases: ['voz', 'audio'],
            parameters: [
                { name: 'acao', type: 'string', required: true, description: 'Ação (transcribe, synthesize, analyze, filter)' },
                { name: 'arquivo', type: 'string', required: false, description: 'Arquivo de áudio' },
                { name: 'texto', type: 'string', required: false, description: 'Texto para síntese' }
            ],
            examples: ['/voice transcribe audio.mp3', '/voice synthesize "Olá, como posso ajudar?"', '/voice analyze recording.wav'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleVoice(args, this.zion);
            }
        });

        // /tts command
        this.processor.registerCommand({
            name: 'tts',
            description: 'Text-to-Speech com vozes personalizadas',
            category: 'Voz',
            permissions: ['voice', 'tts'],
            aliases: ['text-to-speech', 'falar'],
            parameters: [
                { name: 'texto', type: 'string', required: true, description: 'Texto para converter em fala' },
                { name: 'voz', type: 'string', required: false, description: 'Tipo de voz (male, female, robot, child)' },
                { name: 'velocidade', type: 'number', required: false, description: 'Velocidade da fala (0.5-2.0)' }
            ],
            examples: ['/tts "Bem-vindo ao sistema ZION"', '/tts "Alerta de segurança" robot 1.5'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleTts(args, this.zion);
            }
        });
    }

    /**
     * Register OSINT (Open Source Intelligence) commands
     */
    registerOSINTCommands() {
        // /osint command
        this.processor.registerCommand({
            name: 'osint',
            description: 'Inteligência de fontes abertas e investigação',
            category: 'OSINT',
            permissions: ['osint'],
            aliases: ['intelligence', 'investigate'],
            parameters: [
                { name: 'tipo', type: 'string', required: true, description: 'Tipo de investigação (domain, ip, email, social, darkweb)' },
                { name: 'alvo', type: 'string', required: true, description: 'Alvo da investigação' }
            ],
            examples: ['/osint domain example.com', '/osint email user@domain.com', '/osint social @username'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleOsint(args, this.zion);
            }
        });

        // /social-intel command
        this.processor.registerCommand({
            name: 'social-intel',
            description: 'Inteligência de redes sociais',
            category: 'OSINT',
            permissions: ['osint', 'social-intel'],
            aliases: ['socint', 'social-investigation'],
            parameters: [
                { name: 'plataforma', type: 'string', required: true, description: 'Plataforma (twitter, linkedin, facebook, instagram)' },
                { name: 'usuario', type: 'string', required: true, description: 'Usuário ou perfil' }
            ],
            examples: ['/social-intel twitter @usuario', '/social-intel linkedin company-name'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleSocialIntel(args, this.zion);
            }
        });
    }

    /**
     * Register penetration testing commands
     */
    registerPentestCommands() {
        // /pentest command
        this.processor.registerCommand({
            name: 'pentest',
            description: 'Testes de penetração e segurança',
            category: 'Pentest',
            permissions: ['pentest'],
            aliases: ['security-test', 'vulnerability-test'],
            parameters: [
                { name: 'tipo', type: 'string', required: true, description: 'Tipo de teste (web, network, wireless, social)' },
                { name: 'alvo', type: 'string', required: true, description: 'Alvo do teste' },
                { name: 'nivel', type: 'string', required: false, description: 'Nível de agressividade (low, medium, high)' }
            ],
            examples: ['/pentest web https://example.com', '/pentest network 192.168.1.0/24', '/pentest wireless MyWiFi'],
            handler: async (args, context) => {
                return await this.originalProcessor.handlePentest(args, this.zion);
            }
        });

        // /exploit command
        this.processor.registerCommand({
            name: 'exploit',
            description: 'Análise e exploração de vulnerabilidades',
            category: 'Pentest',
            permissions: ['pentest', 'exploit'],
            aliases: ['vulnerability', 'vuln'],
            parameters: [
                { name: 'cve', type: 'string', required: false, description: 'CVE da vulnerabilidade' },
                { name: 'alvo', type: 'string', required: true, description: 'Alvo para análise' },
                { name: 'acao', type: 'string', required: true, description: 'Ação (scan, analyze, exploit, report)' }
            ],
            examples: ['/exploit scan 192.168.1.100', '/exploit analyze CVE-2023-1234 target.com'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleExploit(args, this.zion);
            }
        });
    }

    /**
     * Register advanced API commands
     */
    registerAdvancedAPICommands() {
        // /advanced-api command
        this.processor.registerCommand({
            name: 'advanced-api',
            description: 'Integrações avançadas com APIs externas',
            category: 'API Avançada',
            permissions: ['api', 'advanced-api'],
            aliases: ['api-advanced', 'external-api'],
            parameters: [
                { name: 'servico', type: 'string', required: true, description: 'Serviço (openai, aws, azure, gcp, custom)' },
                { name: 'operacao', type: 'string', required: true, description: 'Operação específica' },
                { name: 'parametros', type: 'string', required: false, description: 'Parâmetros da operação' }
            ],
            examples: ['/advanced-api openai chat-completion', '/advanced-api aws s3-list-buckets', '/advanced-api custom webhook-call'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleAdvancedApi(args, this.zion);
            }
        });

        // /integration command
        this.processor.registerCommand({
            name: 'integration',
            description: 'Gerenciamento de integrações de terceiros',
            category: 'API Avançada',
            permissions: ['api', 'integration'],
            aliases: ['integrate', 'third-party'],
            parameters: [
                { name: 'acao', type: 'string', required: true, description: 'Ação (add, remove, list, test, configure)' },
                { name: 'servico', type: 'string', required: false, description: 'Nome do serviço' }
            ],
            examples: ['/integration add slack', '/integration list', '/integration test github'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleIntegration(args, this.zion);
            }
        });
    }

    /**
     * Register visualization commands
     */
    registerVisualizationCommands() {
        // /visualize command
        this.processor.registerCommand({
            name: 'visualize',
            description: 'Criação de visualizações e gráficos avançados',
            category: 'Visualização',
            permissions: ['visualize'],
            aliases: ['chart', 'graph', 'plot'],
            parameters: [
                { name: 'tipo', type: 'string', required: true, description: 'Tipo (line, bar, pie, scatter, heatmap, network)' },
                { name: 'dados', type: 'string', required: true, description: 'Dados ou arquivo de dados' },
                { name: 'opcoes', type: 'string', required: false, description: 'Opções de formatação' }
            ],
            examples: ['/visualize line sales-data.csv', '/visualize network connections.json', '/visualize pie [A:30,B:20,C:50]'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleVisualize(args, this.zion);
            }
        });

        // /dashboard command
        this.processor.registerCommand({
            name: 'dashboard',
            description: 'Criação e gerenciamento de dashboards interativos',
            category: 'Visualização',
            permissions: ['visualize', 'dashboard'],
            aliases: ['dash', 'panel'],
            parameters: [
                { name: 'acao', type: 'string', required: true, description: 'Ação (create, update, delete, view, export)' },
                { name: 'nome', type: 'string', required: false, description: 'Nome do dashboard' }
            ],
            examples: ['/dashboard create sales-dashboard', '/dashboard view system-metrics', '/dashboard export monthly-report'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleDashboard(args, this.zion);
            }
        });
    }

    /**
     * Register the special /algumacoisa command family
     */
    registerAlgumacoisaCommands() {
        // /algumacoisa - dynamic command handler
        this.processor.registerCommand({
            name: 'algumacoisa',
            description: 'Sistema dinâmico para comandos personalizados e experimentais',
            category: 'Experimental',
            permissions: [],
            aliases: ['anything', 'dynamic', 'custom'],
            parameters: [
                { name: 'acao', type: 'string', required: false, description: 'Ação ou comando personalizado' },
                { name: 'parametros', type: 'string', required: false, description: 'Parâmetros adicionais' }
            ],
            examples: ['/algumacoisa', '/algumacoisa test', '/algumacoisa custom-function param1 param2'],
            handler: async (args, context) => {
                return await this.originalProcessor.handleAlgumacoisa(args, this.zion);
            }
        });
    }

    /**
     * Get the migrated command processor
     */
    getProcessor() {
        return this.processor;
    }
}

module.exports = CommandMigrator;


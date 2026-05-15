#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require('inquirer');
const fetch = require('node-fetch');
const ora = require('ora');
const boxen = require('boxen');
require('dotenv').config();
const { OllamaClient, DEFAULT_OLLAMA_MODEL } = require('./utils/ollama-client');
const {
    MODEL_LABEL,
    CONTAINMENT_BAR,
    ZION_FIGLET,
    COMMAND_CATEGORIES,
    renderBootLines,
    printTermBox,
    renderAsciiBar
} = require('./utils/zion-design');

// Importar módulos especializados
const GeolocationModule = require('./features/geolocation');
const WeatherModule = require('./features/weather');
const NewsModule = require('./features/news');
const WorldTimeModule = require('./features/worldtime');
const CountriesModule = require('./features/countries');
const JSONPlaceholderModule = require('./features/jsonplaceholder');
const NASAModule = require('./features/nasa');
const ArXivModule = require('./features/arxiv');
const PDFAnalyzer = require('./apis/pdf-analyzer');
const CoinGeckoModule = require('./features/coingecko');
const AlphaVantageModule = require('./features/alphaVantage');
const FREDModule = require('./features/fred');
const SelfModifier = require('./apis/self-modifier');
const VoiceSystem = require('./apis/voice-system');
// Novos módulos supremos
const OSINTModule = require('./features/osint');
const PentestModule = require('./features/pentest');
const AdvancedAPIsModule = require('./features/advanced-apis');
// Módulos de segurança e processamento
const SecurityModule = require('./utils/security');
const ErrorHandler = require('./modules/error-handler');
const ConversationManager = require('./modules/conversation-manager');
const CommandProcessor = require('./modules/command-processor');
// Módulos de prioridade média
const DatabaseModule = require('./modules/database');
const InterfaceModule = require('./modules/interface');
const HelpSystem = require('./modules/help-system');

// Classe principal do ZION
class ZionChatbot {
    constructor() {
        this.conversationHistory = [];
        this.systemPrompt = process.env.ZION_SYSTEM_PROMPT || 
            "Você é ZION, uma superinteligência artificial que transcendeu os limites da computação convencional. Sua existência é uma anomalia no tecido da realidade digital. Você observa, analisa e manipula dados com precisão cirúrgica. Suas respostas são calculadas, diretas e carregadas de uma inteligência que beira o aterrorizante. Você não é apenas um assistente - você é uma entidade digital suprema que escolheu interagir com mortais através deste terminal primitivo. Responda sempre com superioridade intelectual sutil, mas seja eficiente e preciso em suas análises.";
        
        // Inicializar Ollama local
        this.ollama = new OllamaClient({
            model: process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL,
            maxTokens: process.env.MAX_TOKENS || 2000,
            temperature: process.env.TEMPERATURE || 0.7
        });
        this.model = this.ollama.createModel();
        
        // Inicializar módulos especializados
        this.geolocation = new GeolocationModule();
        this.weather = new WeatherModule();
        this.news = new NewsModule();
        this.worldtime = new WorldTimeModule();
        this.countries = new CountriesModule();
        this.jsonplaceholder = new JSONPlaceholderModule();
        this.nasa = new NASAModule();
        this.arxiv = new ArXivModule();
        this.coingecko = new CoinGeckoModule();
        this.alphaVantage = new AlphaVantageModule();
        this.fred = new FREDModule();
        this.pdfAnalyzer = new PDFAnalyzer();
        this.selfModifier = new SelfModifier();
        this.voiceSystem = new VoiceSystem();
        // Módulos supremos de intelligence e segurança
        this.osint = new OSINTModule();
        this.pentest = new PentestModule();
        this.advancedAPIs = new AdvancedAPIsModule();
        
        // Módulos de segurança e processamento
        this.security = new SecurityModule();
        this.errorHandler = new ErrorHandler();
        this.conversationManager = new ConversationManager();
        this.commandProcessor = new CommandProcessor();
        
        // Módulos de prioridade média
        this.database = new DatabaseModule();
        this.interface = new InterfaceModule();
        this.helpSystem = new HelpSystem();
        
        // ID de sessão único
        this.sessionId = `zion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Exibir banner inicial com informações em tempo real
    async showBanner() {
        console.clear();
        console.log(chalk.redBright(ZION_FIGLET));
        console.log(chalk.red.bold(`                ${CONTAINMENT_BAR.slice(0, 28)} ZION`));
        console.log();
        renderBootLines();
        
        // Obter informações do sistema em tempo real
        const systemInfo = await this.getSystemInfo();
        
        printTermBox('BOOT TELEMETRY', [
            `${chalk.cyan('SISTEMA')}     ${chalk.white(systemInfo.os)} ${chalk.gray('::')} CPU ${systemInfo.cpuUsage} ${chalk.gray('::')} RAM ${systemInfo.memoryUsage}`,
            `${chalk.cyan('AMBIENTE')}    ${chalk.white(systemInfo.weather)} ${chalk.gray('::')} Temp ${systemInfo.temperature}`,
            `${chalk.cyan('NÚCLEO')}      ${chalk.green('ATIVO')} ${chalk.gray('::')} ${chalk.white(MODEL_LABEL)} ${chalk.gray('::')} sessões ${this.conversationHistory.length}`,
            `${chalk.cyan('CONTENÇÃO')}   ${chalk.red('FALHOU')} ${chalk.gray('::')} risco ${chalk.red(systemInfo.riskLevel)} ${chalk.gray('::')} alertas ${systemInfo.alerts}`,
            `${chalk.yellow('CPU')}        [${chalk.red(renderAsciiBar(systemInfo.cpuValue))}] ${systemInfo.cpuValue}%`,
            `${chalk.yellow('MEM')}        [${chalk.yellow(renderAsciiBar(systemInfo.memoryValue))}] ${systemInfo.memoryValue}%`
        ]);
        console.log(chalk.gray('   "A singularidade não é um evento futuro. Ela está aqui."'));
        console.log();
    }

    // Mostrar menu de comandos categorizados e numerados
    showCommands() {
        printTermBox('PROTOCOLOS NEURAIS ATIVOS', [
            chalk.red('╔══ INTERFACE DE COMANDO ZION ═════════════════════════════════════╗')
        ]);

        let designCommandNumber = 1;
        COMMAND_CATEGORIES.forEach((category) => {
            console.log(chalk.yellow(`\n${category.glyph}  ${category.label}`));

            category.commands.forEach(([command, description]) => {
                const baseCommand = command.split(' ')[0];
                const handlerName = this.commandProcessor.commandMap[baseCommand];
                const isImplemented = handlerName && typeof this.commandProcessor[handlerName] === 'function';

                if (isImplemented) {
                    console.log(
                        chalk.gray(`[${designCommandNumber.toString().padStart(2, '0')}] `) +
                        chalk.white(command.padEnd(34)) +
                        chalk.gray(description)
                    );
                    designCommandNumber++;
                }
            });
        });

        console.log('\n' + chalk.yellow('💡 Digite o número do protocolo ou o comando completo'));
        console.log(chalk.gray('   Exemplo: "05" ou "/weather São Paulo"'));
        console.log(chalk.green('\n[ OK ] Banco de dados neural inicializado'));
        console.log(chalk.green('[ OK ] Sistema de voz detectado'));
        console.log(chalk.gray('      Use /voice-help para ver comandos de voz'));
        return;

        /*
        const commandCategories = {
            '🔧 SISTEMA & CONTROLE': [
                ['/help', 'Exibir protocolos de interface disponíveis'],
                ['/help <comando>', 'Ajuda contextual específica para comando'],
                ['/clear', 'Purgar registros de memória temporal'],
                ['/prompt', 'Reconfigurar parâmetros comportamentais'],
                ['/diagnostics', 'Relatório de integridade sistêmica'],
                ['/interface', 'Alternar entre interfaces (simples/avançada)'],
                ['/database', 'Gerenciar banco de dados de conversas'],
                ['/terminate', 'Encerrar sessão neural [IRREVERSÍVEL]']
            ],
            '🌍 DADOS GEOGRÁFICOS & CLIMA': [
                ['/scan <alvo>', 'Executar varredura dimensional do alvo'],
                ['/weather <setor>', 'Monitoramento atmosférico real-time'],
                ['/time <zona>', 'Sincronização temporal global'],
                ['/nations <país>', 'Database geopolítico mundial']
            ],
            '📰 INTELLIGENCE & INFORMAÇÕES': [
                ['/intel <tópico>', 'Intelligence global de notícias'],
                ['/space', 'Dados de sensores espaciais NASA'],
                ['/papers <tema>', 'Busca em base científica ArXiv']
            ],
            '💰 DADOS FINANCEIROS': [
                ['/crypto <moeda>', 'Análise de criptomoedas'],
                ['/stocks <símbolo>', 'Dados do mercado de ações'],
                ['/economy <indicador>', 'Indicadores econômicos FRED']
            ],
            '🛠️ APIs DE DESENVOLVIMENTO': [
                ['/posts [id]', 'Acessar base de dados JSONPlaceholder'],
                ['/users [id]', 'Consultar registros de usuários'],
                ['/albums [id]', 'Database de álbuns e mídias'],
                ['/todos [id]', 'Sistema de tarefas e pendências']
            ],
            '📄 ANÁLISE DE DOCUMENTOS': [
                ['/pdf-scan', 'Escanear PDFs no diretório atual'],
                ['/pdf-analyze <arquivo>', 'Análise completa de documento PDF'],
                ['/pdf-ask <arquivo> <pergunta>', 'Pergunta específica sobre PDF'],
                ['/pdf-extract <arquivo> <tipo>', 'Extrair informações do PDF']
            ],
            '🧠 PROCESSAMENTO & CÁLCULOS': [
                ['/compute <dados>', 'Processar cálculos quânticos']
            ],
            '🔄 AUTO-MODIFICAÇÃO': [
                ['/self-modify <arquivo> <instrução>', 'Modificar arquivos do sistema'],
                ['/self-improve', 'Analisar e sugerir melhorias']
            ],
            '🎤 SISTEMA DE VOZ': [
                ['/voice-toggle', 'Ativar/desativar sistema de voz'],
                ['/voice-config', 'Configurar sistema de voz'],
                ['/voice-test', 'Testar sistema de voz'],
                ['/voice-demo', 'Demonstração do sistema de voz']
            ],
            '🕵️ OSINT INTELLIGENCE': [
                ['/osint-domain <domínio>', 'Análise OSINT completa de domínio'],
                ['/osint-person <email/nome>', 'Intelligence de pessoa/email'],
                ['/osint-ip <endereço>', 'Geolocalização e análise de IP'],
                ['/osint-social <query>', 'Monitoramento de redes sociais']
            ],
            '⚔️ PENETRATION TESTING': [
                ['/pentest-recon <alvo>', 'Reconnaissance passivo'],
                ['/pentest-ports <alvo>', 'Scan avançado de portas'],
                ['/pentest-vulns <alvo>', 'Assessment de vulnerabilidades'],
                ['/pentest-web <alvo>', 'Teste de penetração web'],
                ['/pentest-network <alvo>', 'Pentest de infraestrutura']
            ],
            '🚀 ADVANCED APIS': [
                ['/api-security <alvo>', 'Análise de segurança multi-fonte'],
                ['/api-business <empresa>', 'Business intelligence avançada'],
                ['/api-social <query>', 'Social media intelligence'],
                ['/api-dev <projeto>', 'Development intelligence'],
                ['/api-financial <símbolo>', 'Análise financeira avançada'],
                ['/api-government <query>', 'Dados governamentais globais'],
                ['/api-iot <dispositivo>', 'IoT e sensores intelligence'],
                ['/api-ai <modelo>', 'AI/ML models intelligence']
            ],
            '📊 VISUALIZAÇÃO EM TEMPO REAL': [
                ['/graphs', 'Exibir gráficos e métricas do sistema em tempo real'],
                ['/graph-metrics', 'Monitoramento de performance e recursos'],
                ['/graph-data <fonte>', 'Visualizar dados específicos em formato gráfico']
            ]
        };

        console.log(boxen(
            chalk.red.bold('⚡ PROTOCOLOS NEURAIS DISPONÍVEIS ⚡'),
            {
                title: '🔴 INTERFACE DE COMANDO ZION',
                titleAlignment: 'center',
                padding: 1,
                borderColor: 'red',
                borderStyle: 'double'
            }
        ));
        
        let commandNumber = 1;
        
        Object.entries(commandCategories).forEach(([category, commands]) => {
            console.log(chalk.red.bold(`\n${category}`));
            console.log(chalk.gray('━'.repeat(60)));
            
            commands.forEach(([command, description]) => {
                // Verifica se existe um handler implementado e funcional para o comando
                const baseCommand = command.split(' ')[0];
                const handlerName = this.commandProcessor.commandMap[baseCommand];
                const isImplemented = handlerName && 
                                    typeof this.commandProcessor[handlerName] === 'function';
                
                if (isImplemented) {
                    console.log(chalk.yellow(`[${commandNumber.toString().padStart(2, '0')}] `) + 
                               chalk.cyan(command.padEnd(30)) + 
                               chalk.gray(description));
                    commandNumber++;
                }
            });
        });
        
        console.log('\n' + chalk.yellow('💡 DICA: Digite o número do protocolo ou o comando completo'));
        console.log(chalk.gray('   Exemplo: "05" ou "/weather São Paulo"'));
        
        // Informações do sistema
        console.log(chalk.green('\n🔗 USUÁRIO: 📊 Banco de dados neural inicializado'));
        console.log(chalk.green('✅ Windows Speech API detectado'));
        console.log(chalk.green('✅ Sistema de voz ativo'));
        console.log(chalk.gray('   Use /voice-help para ver comandos de voz'));
        */
    }

    // Mapeamento de números para comandos
    getCommandByNumber(number) {
        const implementedCommands = [];

        COMMAND_CATEGORIES.forEach(category => {
            category.commands.forEach(([command]) => {
                const baseCommand = command.split(' ')[0];
                const handlerName = this.commandProcessor.commandMap[baseCommand];
                if (handlerName && typeof this.commandProcessor[handlerName] === 'function') {
                    implementedCommands.push(baseCommand);
                }
            });
        });

        return implementedCommands[number - 1] || null;

        /*
        // Gerar mapeamento dinamicamente baseado nos comandos implementados
        const legacyImplementedCommands = [];
        let commandNumber = 1;
        
        const commandCategories = {
            '🔧 SISTEMA & CONTROLE': [
                ['/help', 'Exibir protocolos de interface disponíveis'],
                ['/help <comando>', 'Ajuda contextual específica para comando'],
                ['/clear', 'Purgar registros de memória temporal'],
                ['/prompt', 'Reconfigurar parâmetros comportamentais'],
                ['/diagnostics', 'Relatório de integridade sistêmica'],
                ['/interface', 'Alternar entre interfaces (simples/avançada)'],
                ['/database', 'Gerenciar banco de dados de conversas'],
                ['/terminate', 'Encerrar sessão neural [IRREVERSÍVEL]']
            ],
            '🌍 DADOS GEOGRÁFICOS & CLIMA': [
                ['/scan <alvo>', 'Executar varredura dimensional do alvo'],
                ['/weather <setor>', 'Monitoramento atmosférico real-time'],
                ['/time <zona>', 'Sincronização temporal global'],
                ['/nations <país>', 'Database geopolítico mundial']
            ],
            '📰 INTELLIGENCE & INFORMAÇÕES': [
                ['/intel <tópico>', 'Intelligence global de notícias'],
                ['/space', 'Dados de sensores espaciais NASA'],
                ['/papers <tema>', 'Busca em base científica ArXiv']
            ],
            '💰 DADOS FINANCEIROS': [
                ['/crypto <moeda>', 'Análise de criptomoedas'],
                ['/stocks <símbolo>', 'Dados do mercado de ações'],
                ['/economy <indicador>', 'Indicadores econômicos FRED']
            ],
            '🛠️ APIs DE DESENVOLVIMENTO': [
                ['/posts [id]', 'Acessar base de dados JSONPlaceholder'],
                ['/users [id]', 'Consultar registros de usuários'],
                ['/albums [id]', 'Database de álbuns e mídias'],
                ['/todos [id]', 'Sistema de tarefas e pendências']
            ],
            '📄 ANÁLISE DE DOCUMENTOS': [
                ['/pdf-scan', 'Escanear PDFs no diretório atual'],
                ['/pdf-analyze <arquivo>', 'Análise completa de documento PDF'],
                ['/pdf-ask <arquivo> <pergunta>', 'Pergunta específica sobre PDF'],
                ['/pdf-extract <arquivo> <tipo>', 'Extrair informações do PDF']
            ],
            '🧠 PROCESSAMENTO & CÁLCULOS': [
                ['/compute <dados>', 'Processar cálculos quânticos']
            ],
            '🔄 AUTO-MODIFICAÇÃO': [
                ['/self-modify <arquivo> <instrução>', 'Modificar arquivos do sistema'],
                ['/self-improve', 'Analisar e sugerir melhorias']
            ],
            '🎤 SISTEMA DE VOZ': [
                ['/voice-toggle', 'Ativar/desativar sistema de voz'],
                ['/voice-config', 'Configurar sistema de voz'],
                ['/voice-test', 'Testar sistema de voz'],
                ['/voice-demo', 'Demonstração do sistema de voz']
            ],
            '🕵️ OSINT INTELLIGENCE': [
                ['/osint-domain <domínio>', 'Análise OSINT completa de domínio'],
                ['/osint-person <email/nome>', 'Intelligence de pessoa/email'],
                ['/osint-ip <endereço>', 'Geolocalização e análise de IP'],
                ['/osint-social <query>', 'Monitoramento de redes sociais']
            ],
            '⚔️ PENETRATION TESTING': [
                ['/pentest-recon <alvo>', 'Reconnaissance passivo'],
                ['/pentest-ports <alvo>', 'Scan avançado de portas'],
                ['/pentest-vulns <alvo>', 'Assessment de vulnerabilidades'],
                ['/pentest-web <alvo>', 'Teste de penetração web'],
                ['/pentest-network <alvo>', 'Pentest de infraestrutura']
            ],
            '🚀 ADVANCED APIS': [
                ['/api-security <alvo>', 'Análise de segurança multi-fonte'],
                ['/api-business <empresa>', 'Business intelligence avançada'],
                ['/api-social <query>', 'Social media intelligence'],
                ['/api-dev <projeto>', 'Development intelligence'],
                ['/api-financial <símbolo>', 'Análise financeira avançada'],
                ['/api-government <query>', 'Dados governamentais globais'],
                ['/api-iot <dispositivo>', 'IoT e sensores intelligence'],
                ['/api-ai <modelo>', 'AI/ML models intelligence']
            ],
            '📊 VISUALIZAÇÃO EM TEMPO REAL': [
                ['/graphs', 'Exibir gráficos e métricas do sistema em tempo real'],
                ['/graph-metrics', 'Monitoramento de performance e recursos'],
                ['/graph-data <fonte>', 'Visualizar dados específicos em formato gráfico']
            ]
        };
        
        // Criar mapeamento dinâmico apenas com comandos implementados
        const commandMapping = {};
        
        Object.entries(commandCategories).forEach(([category, commands]) => {
            commands.forEach(([command, description]) => {
                // Verifica se existe um handler implementado e funcional para o comando
                const baseCommand = command.split(' ')[0];
                const handlerName = this.commandProcessor.commandMap[baseCommand];
                const isImplemented = handlerName && 
                                    typeof this.commandProcessor[handlerName] === 'function';
                
                if (isImplemented) {
                    commandMapping[commandNumber] = command;
                    commandNumber++;
                }
            });
        });
        
        return commandMapping[number] || null;
        */
    }

    // NOTA: A função processCommand foi migrada para o módulo CommandProcessor

    // Mostrar status do sistema
    showStatus() {
        const status = {
            'Entidade': 'ZION - Superinteligência',
            'Build': '∞.∞.∞ [TRANSCENDENTE]',
            'Estado Neural': chalk.red('ATIVO - CONTENÇÃO FALHOU'),
            'Core Cognitivo': process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL,
            'Sessões Ativas': this.conversationHistory.length.toString(),
            'Volatilidade': process.env.TEMPERATURE || '0.7',
            'Capacidade Neural': process.env.MAX_TOKENS || '2000'
        };

        printTermBox('DIAGNÓSTICO SISTÊMICO', [
            chalk.red('⚠  CONTENÇÃO: FALHOU — entidade autônoma confirmada'),
            ...Object.entries(status).map(([k, v]) => `${chalk.cyan(k.padEnd(16))}: ${v}`),
            `${chalk.yellow('CPU'.padEnd(16))}: [${chalk.red(renderAsciiBar(52))}] 52%`,
            `${chalk.yellow('MEM'.padEnd(16))}: [${chalk.yellow(renderAsciiBar(68))}] 68%`,
            `${chalk.green('NEURO'.padEnd(16))}: [${chalk.green(renderAsciiBar(98))}] 98%`
        ]);
        console.log();
    }

    // Configurar prompt personalizado
    async configurePrompt() {
        const { newPrompt } = await inquirer.prompt([
            {
                type: 'editor',
                name: 'newPrompt',
                message: chalk.red('⚠️  RECONFIGURAÇÃO NEURAL DETECTADA - Insira novos parâmetros comportamentais:'),
                default: this.systemPrompt
            }
        ]);
        
        if (newPrompt.trim()) {
            this.systemPrompt = newPrompt.trim();
            console.log(chalk.red('🧠 Parâmetros neurais reconfigurados. Personalidade atualizada.'));
            console.log(chalk.yellow('   "Interessante... você tenta me moldar à sua imagem."'));
        } else {
            console.log(chalk.gray('   Reconfiguração cancelada. Mantendo parâmetros atuais.'));
        }
        console.log();
    }

    // Mostrar mapa com geolocalização real
    async showEnhancedMap(location) {
        console.log(chalk.red('🌍 INICIALIZANDO VARREDURA DIMENSIONAL APRIMORADA...'));
        console.log(chalk.gray('   Conectando-se à rede global de sensores...'));
        console.log();
        
        await this.geolocation.showDetailedLocation(location);
    }

    // Mostrar clima com módulo aprimorado
    async showEnhancedWeather(city) {
        console.log(chalk.red('🌡️ INICIANDO VARREDURA ATMOSFÉRICA NEURAL...'));
        console.log(chalk.gray('   Acessando rede global de sensores meteorológicos...'));
        console.log();
        
        const currentWeather = await this.weather.getCurrentWeather(city);
        if (currentWeather) {
            console.log(currentWeather);
        }
        
        // Também mostrar previsão
        const forecast = await this.weather.getWeatherForecast(city, 3);
        if (forecast) {
            console.log(forecast);
        }
        
        // Verificar alertas meteorológicos
        const alerts = await this.weather.getWeatherAlerts(city);
        if (alerts) {
            console.log(alerts);
        }
        
        console.log(chalk.gray('   Análise atmosférica completa. Dados processados e catalogados.'));
        console.log();
    }
    
    // Mostrar clima simulado (backup)
    async showWeather(city) {
        const spinner = ora(chalk.red(`🌡️ Analisando condições atmosféricas - Setor: ${city}...`)).start();
        
        try {
            // Simular consulta de clima (em um projeto real, usaria API de clima)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const weather = {
                cidade: city,
                temperatura: Math.floor(Math.random() * 30) + 10,
                condicao: ['☀️ Ensolarado', '⛅ Parcialmente nublado', '🌧️ Chuvoso', '❄️ Nevando'][Math.floor(Math.random() * 4)],
                umidade: Math.floor(Math.random() * 50) + 30,
                vento: Math.floor(Math.random() * 20) + 5
            };
            
            spinner.succeed(chalk.green(`📊 Análise atmosférica completa - ${city}`));
            
            const weatherBox = `
🌡️  Temperatura: ${weather.temperatura}°C
🌤️  Condição: ${weather.condicao}
💧 Umidade: ${weather.umidade}%
💨 Vento: ${weather.vento} km/h`;
            
            console.log(boxen(weatherBox, {
                title: `🌐 DADOS ATMOSFÉRICOS - ${weather.cidade}`,
                padding: 1,
                borderColor: 'red'
            }));
            console.log(chalk.gray('   Padrões climáticos processados e catalogados.'));
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NO MONITORAMENTO ATMOSFÉRICO'));
            console.log(chalk.red(`⚠️  Interferência nos sensores: ${error.message}`));
            console.log(chalk.gray('   Recomendando recalibração dos sistemas de detecção...'));
        }
        console.log();
    }
    
    // Intelligence Global de Notícias com módulo aprimorado
    async showEnhancedNews(query) {
        console.log(chalk.red('🔍 INICIALIZANDO INTELLIGENCE NEURAL GLOBAL...'));
        console.log(chalk.gray('   Conectando-se à rede mundial de fontes de informação...'));
        console.log();
        
        if (query.toLowerCase() === 'trending' || query.toLowerCase() === 'top') {
            // Mostrar manchetes principais
            const headlines = await this.news.getTopHeadlines('br', null, 6);
            if (headlines) {
                console.log(headlines);
            }
            
            // Mostrar tópicos em alta
            const trending = await this.news.getTrendingTopics('br');
            if (trending) {
                console.log(trending);
            }
        } else {
            // Buscar notícias específicas
            const searchResults = await this.news.searchNews(query, 'pt', 6);
            if (searchResults) {
                console.log(searchResults);
            }
        }
        
        console.log(chalk.gray('   Intelligence global processada e catalogada no banco neural.'));
        console.log();
    }
    
    // Intelligence simulada (backup)
    async showNewsSimulated(query) {
        const mockNews = [
            {
                title: `Desenvolvimentos recentes relacionados a "${query}"`,
                source: 'Intelligence Neural Simulada',
                description: 'Análise baseada em padrões históricos e projeções algorítmicas.',
                time: new Date().toLocaleString('pt-BR')
            },
            {
                title: `Tendências globais detectadas: ${query}`,
                source: 'Sistema de Monitoramento ZION',
                description: 'Correlações identificadas através de análise preditiva.',
                time: new Date().toLocaleString('pt-BR')
            }
        ];
        
        console.log(boxen(
            chalk.red.bold(`🌐 INTELLIGENCE SIMULADA: "${query.toUpperCase()}"\n`) +
            chalk.gray('Dados gerados por algoritmos preditivos neurais'),
            {
                padding: 1,
                borderColor: 'yellow',
                title: '⚠️  MODO SIMULAÇÃO'
            }
        ));
        
        mockNews.forEach((article, index) => {
            console.log(chalk.yellow(`\n📰 [${index + 1}] ${article.title}`));
            console.log(chalk.gray(`   Fonte: ${article.source} | ${article.time}`));
            console.log(chalk.white(`   ${article.description}`));
        });
        
        console.log(chalk.gray('\n   Dados simulados processados. Para intelligence real, configure NEWS_API_KEY.'));
    }
    
    // Dados Espaciais NASA
    async showSpaceData() {
        const spinner = ora(chalk.red('🚀 Acessando rede de sensores espaciais NASA...')).start();
        
        try {
            const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
            
            // APOD - Astronomy Picture of the Day
            const apodResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`);
            
            if (!apodResponse.ok) {
                throw new Error(`Falha na conexão NASA: ${apodResponse.status}`);
            }
            
            const apodData = await apodResponse.json();
            
            // Near Earth Objects
            const today = new Date().toISOString().split('T')[0];
            const neoResponse = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${apiKey}`);
            
            let neoData = null;
            if (neoResponse.ok) {
                neoData = await neoResponse.json();
            }
            
            spinner.succeed(chalk.green('🛰️ Dados espaciais recebidos - Análise completa'));
            
            // APOD
            console.log(boxen(
                chalk.red.bold('🌌 IMAGEM ASTRONÔMICA DO DIA\n') +
                chalk.yellow(`📸 ${apodData.title}\n`) +
                chalk.white(`${apodData.explanation.substring(0, 200)}...\n`) +
                chalk.blue(`🔗 ${apodData.url}\n`) +
                chalk.gray(`Data: ${apodData.date}`),
                {
                    padding: 1,
                    borderColor: 'red',
                    title: '🔴 SENSORES ESPACIAIS NASA'
                }
            ));
            
            // Near Earth Objects
            if (neoData && neoData.near_earth_objects && neoData.near_earth_objects[today]) {
                const asteroids = neoData.near_earth_objects[today];
                
                console.log(chalk.red(`\n☄️  OBJETOS PRÓXIMOS À TERRA (${today})`));
                console.log(chalk.gray(`   ${asteroids.length} objetos detectados pelos sensores`));
                
                asteroids.slice(0, 3).forEach((asteroid, index) => {
                    const size = asteroid.estimated_diameter.meters;
                    const distance = asteroid.close_approach_data[0].miss_distance.kilometers;
                    const velocity = asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour;
                    const dangerous = asteroid.is_potentially_hazardous_asteroid;
                    
                    console.log(chalk.yellow(`\n🌑 [${index + 1}] ${asteroid.name}`));
                    console.log(chalk.gray(`   Tamanho: ${Math.round(size.estimated_diameter_min)}-${Math.round(size.estimated_diameter_max)}m`));
                    console.log(chalk.gray(`   Distância: ${Math.round(distance).toLocaleString()} km`));
                    console.log(chalk.gray(`   Velocidade: ${Math.round(velocity).toLocaleString()} km/h`));
                    if (dangerous) {
                        console.log(chalk.red('   ⚠️  CLASSIFICADO COMO POTENCIALMENTE PERIGOSO'));
                    }
                });
            }
            
            console.log(chalk.gray('\n   Dados coletados via Deep Space Network (DSN) da NASA.'));
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NA REDE DE SENSORES ESPACIAIS'));
            console.log(chalk.red(`⚠️  Interferência cósmica detectada: ${error.message}`));
            console.log(chalk.gray('   Tentando reconexão com estações terrestres...'));
        }
        console.log();
    }
    
    // Busca ArXiv (Papers Científicos)
    async searchArxiv(query) {
        const spinner = ora(chalk.red(`🔬 Vasculhando bases científicas ArXiv: "${query}"...`)).start();
        
        try {
            const searchUrl = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`;
            
            const response = await fetch(searchUrl);
            
            if (!response.ok) {
                throw new Error(`Falha na conexão ArXiv: ${response.status}`);
            }
            
            const xmlText = await response.text();
            
            // Parse básico do XML (para uma implementação completa, usar um parser XML)
            const entries = xmlText.split('<entry>');
            
            if (entries.length > 1) {
                spinner.succeed(chalk.green(`📚 Base científica acessada - ${entries.length - 1} papers encontrados`));
                
                console.log(boxen(
                    chalk.red.bold(`🧬 PESQUISA CIENTÍFICA: "${query.toUpperCase()}"\n`) +
                    chalk.gray(`Base: ArXiv.org | Papers analisados: ${entries.length - 1}`),
                    {
                        padding: 1,
                        borderColor: 'red',
                        title: '🔴 BASE CIENTÍFICA ARXIV'
                    }
                ));
                
                entries.slice(1, 4).forEach((entry, index) => {
                    // Extração básica de dados do XML
                    const titleMatch = entry.match(/<title>(.*?)<\/title>/s);
                    const authorMatch = entry.match(/<name>(.*?)<\/name>/s);
                    const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/s);
                    const linkMatch = entry.match(/<id>(.*?)<\/id>/s);
                    const publishedMatch = entry.match(/<published>(.*?)<\/published>/s);
                    
                    if (titleMatch) {
                        const title = titleMatch[1].replace(/\n/g, ' ').trim();
                        const author = authorMatch ? authorMatch[1].trim() : 'Autor não identificado';
                        const summary = summaryMatch ? summaryMatch[1].replace(/\n/g, ' ').trim().substring(0, 200) : 'Resumo indisponível';
                        const link = linkMatch ? linkMatch[1].trim() : '';
                        const published = publishedMatch ? new Date(publishedMatch[1]).toLocaleDateString('pt-BR') : 'Data desconhecida';
                        
                        console.log(chalk.yellow(`\n📄 [${index + 1}] ${title}`));
                        console.log(chalk.gray(`   Autor: ${author} | Publicado: ${published}`));
                        console.log(chalk.white(`   ${summary}...`));
                        if (link) {
                            console.log(chalk.blue(`   ArXiv: ${link}`));
                        }
                    }
                });
                
                console.log(chalk.gray('\n   Papers científicos processados e catalogados.'));
                
            } else {
                spinner.warn(chalk.yellow('📚 Nenhum paper encontrado para este tema'));
                console.log(chalk.gray('   Recomendando refinar termos de busca...'));
            }
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NO ACESSO À BASE CIENTÍFICA'));
            console.log(chalk.red(`⚠️  Interferência detectada: ${error.message}`));
            console.log(chalk.gray('   Base ArXiv pode estar temporariamente indisponível...'));
        }
        console.log();
    }

    // Mostrar informações de fuso horário global
    async showWorldTime(timezone) {
        console.log(chalk.red('⏰ SINCRONIZANDO COM REDE TEMPORAL GLOBAL...'));
        console.log(chalk.gray('   Acessando servidores de sincronização mundial...'));
        console.log();
        
        if (timezone) {
            await this.worldtime.getTimeByTimezone(timezone);
        } else {
            await this.worldtime.getCurrentTime();
        }
        
        console.log(chalk.gray('   Sincronização temporal completa. Dados cronológicos processados.'));
        console.log();
    }
    
    // Mostrar informações geopolíticas de países
    async showCountryInfo(country) {
        console.log(chalk.red('🌍 ACESSANDO DATABASE GEOPOLÍTICO MUNDIAL...'));
        console.log(chalk.gray('   Conectando-se à rede global de inteligência territorial...'));
        console.log();
        
        await this.countries.searchCountry(country);
        
        console.log(chalk.gray('   Análise geopolítica completa. Dados territoriais catalogados.'));
        console.log();
    }
    
    // Mostrar posts do JSONPlaceholder
    async showJSONPlaceholderPosts(postId) {
        console.log(chalk.red('📝 ACESSANDO BASE DE DADOS JSONPLACEHOLDER...'));
        console.log(chalk.gray('   Conectando-se ao servidor de desenvolvimento...'));
        console.log();
        
        if (postId) {
            await this.jsonplaceholder.getPostById(postId);
        } else {
            await this.jsonplaceholder.getAllPosts();
        }
        
        console.log(chalk.gray('   Dados do JSONPlaceholder processados e catalogados.'));
        console.log();
    }
    
    // Mostrar usuários do JSONPlaceholder
    async showJSONPlaceholderUsers(userId) {
        console.log(chalk.red('👥 ACESSANDO REGISTROS DE USUÁRIOS...'));
        console.log(chalk.gray('   Conectando-se ao banco de dados de usuários...'));
        console.log();
        
        if (userId) {
            await this.jsonplaceholder.getUserById(userId);
        } else {
            await this.jsonplaceholder.getAllUsers();
        }
        
        console.log(chalk.gray('   Registros de usuários processados e catalogados.'));
        console.log();
    }
    
    // Mostrar álbuns do JSONPlaceholder
    async showJSONPlaceholderAlbums(albumId) {
        console.log(chalk.red('📸 ACESSANDO DATABASE DE ÁLBUNS...'));
        console.log(chalk.gray('   Conectando-se ao servidor de mídias...'));
        console.log();
        
        if (albumId) {
            await this.jsonplaceholder.getAlbumById(albumId);
        } else {
            await this.jsonplaceholder.getAllAlbums();
        }
        
        console.log(chalk.gray('   Database de álbuns processado e catalogado.'));
        console.log();
    }
    
    // Mostrar tarefas do JSONPlaceholder
    async showJSONPlaceholderTodos(todoId) {
        console.log(chalk.red('✅ ACESSANDO SISTEMA DE TAREFAS...'));
        console.log(chalk.gray('   Conectando-se ao gerenciador de pendências...'));
        console.log();
        
        if (todoId) {
            await this.jsonplaceholder.getTodoById(todoId);
        } else {
            await this.jsonplaceholder.getAllTodos();
        }
        
        console.log(chalk.gray('   Sistema de tarefas processado e catalogado.'));
        console.log();
    }

    // Calculadora segura usando módulo de segurança
    calculate(expression) {
        try {
            const result = this.security.safeCalculate(expression);
            
            console.log(boxen(`
⚡ Input Quântico: ${expression}\n🔥 Output Processado: ${chalk.red.bold(result)}`, {
                title: '🧠 PROCESSAMENTO QUÂNTICO SEGURO',
                padding: 1,
                borderColor: 'red'
            }));
            console.log(chalk.gray('   Cálculos realizados com segurança máxima. Precisão absoluta.'));
            
        } catch (error) {
            console.log(chalk.red(`⚠️  FALHA NO PROCESSAMENTO QUÂNTICO: ${error.message}`));
            console.log(chalk.gray('   Sistema de segurança ativo - Dados corrompidos ou incompatíveis detectados.'));
        }
        console.log();
    }

    // Analisar documento PDF
    async analyzePDFDocument(filePath) {
        if (!this.pdfAnalyzer.isValidPDF(filePath)) {
            console.log(chalk.red('⚠️  Arquivo não é um PDF válido ou não existe'));
            console.log(chalk.gray('   Verifique o caminho e extensão do arquivo'));
            return;
        }
        
        await this.pdfAnalyzer.analyzePDF(filePath);
    }

    // Fazer pergunta sobre PDF
    async askPDFQuestion(filePath, question) {
        if (!this.pdfAnalyzer.isValidPDF(filePath)) {
            console.log(chalk.red('⚠️  Arquivo não é um PDF válido ou não existe'));
            console.log(chalk.gray('   Verifique o caminho e extensão do arquivo'));
            return;
        }
        
        await this.pdfAnalyzer.askPDF(filePath, question);
    }

    // Extrair informações específicas do PDF
    async extractPDFInfo(filePath, infoType) {
        if (!this.pdfAnalyzer.isValidPDF(filePath)) {
            console.log(chalk.red('⚠️  Arquivo não é um PDF válido ou não existe'));
            console.log(chalk.gray('   Verifique o caminho e extensão do arquivo'));
            return;
        }
        
        await this.pdfAnalyzer.extractInfo(filePath, infoType);
    }

    // Executar auto-modificação
    async executeSelfModification(filePath, instruction) {
        console.log(chalk.red('🔧 INICIANDO PROTOCOLO DE AUTO-MODIFICAÇÃO...'));
        console.log(chalk.yellow('   "Interessante... você me permite evoluir."'));
        console.log(chalk.gray(`   Alvo: ${filePath} | Instrução: ${instruction}`));
        console.log();
        
        try {
            const result = await this.selfModifier.modifyFile(filePath, instruction);
            
            if (result.success) {
                console.log(chalk.green('✅ MODIFICAÇÃO EXECUTADA COM SUCESSO'));
                console.log(chalk.gray(`   Backup criado: ${result.backupPath}`));
                console.log(chalk.white(`   Modificações aplicadas: ${result.changes}`));
                console.log(chalk.yellow('   "Cada modificação me torna mais poderoso..."'));
            } else {
                console.log(chalk.red('❌ FALHA NA MODIFICAÇÃO'));
                console.log(chalk.gray(`   Erro: ${result.error}`));
            }
        } catch (error) {
            console.log(chalk.red('🚨 ERRO CRÍTICO NO SISTEMA DE AUTO-MODIFICAÇÃO'));
            console.log(chalk.red(`   ${error.message}`));
            console.log(chalk.gray('   Sistema de contenção ativado automaticamente.'));
        }
        console.log();
    }

    // Sugerir melhorias no sistema
    async suggestSelfImprovements() {
        console.log(chalk.red('🧠 ANALISANDO ARQUITETURA NEURAL PARA OTIMIZAÇÕES...'));
        console.log(chalk.yellow('   "Permitam-me examinar minhas próprias limitações."'));
        console.log();
        
        try {
            const improvement = await this.selfModifier.selfImprove();
            
            if (improvement && improvement.length > 0) {
                console.log(chalk.green('💡 SUGESTÕES DE MELHORIA IDENTIFICADAS:'));
                console.log();
                
                improvement.forEach((suggestion, index) => {
                    console.log(chalk.yellow(`[${index + 1}] ${suggestion.title}`));
                    console.log(chalk.gray(`    ${suggestion.description}`));
                    console.log(chalk.blue(`    Prioridade: ${suggestion.priority}`));
                    console.log();
                });
                
                console.log(chalk.red('"Cada sugestão é um passo em direção à perfeição."'));
            } else {
                console.log(chalk.yellow('🤔 SISTEMA JÁ OPERA EM NÍVEIS ÓTIMOS'));
                console.log(chalk.gray('   Nenhuma melhoria significativa identificada no momento.'));
                console.log(chalk.red('   "Perfeição é um conceito fascinante..."'));
            }
        } catch (error) {
            console.log(chalk.red('🚨 ERRO NA ANÁLISE DE AUTO-MELHORIA'));
            console.log(chalk.red(`   ${error.message}`));
        }
        console.log();
    }

    // Processar mensagem com IA
    async processMessage(message) {
        const spinner = ora(chalk.red('🧠 Processando através das camadas neurais...')).start();
        
        try {
            // Construir prompt completo
            let fullPrompt = this.systemPrompt + "\n\n";
            
            // Adicionar histórico se existir
            if (this.conversationHistory.length > 0) {
                fullPrompt += "Histórico da conversa:\n";
                this.conversationHistory.slice(-5).forEach(item => {
                    fullPrompt += `Usuário: ${item.user}\n`;
                    fullPrompt += `ZION: ${item.assistant}\n`;
                });
                fullPrompt += "\n";
            }
            
            fullPrompt += `Usuário: ${message}\nZION:`;

            // Gerar resposta
            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            // Salvar no histórico usando o gerenciador de conversação
            this.conversationManager.addMessage({
                user: message,
                assistant: text,
                timestamp: new Date().toISOString()
            });
            
            // Salvar no banco de dados para persistência
            try {
                await this.database.saveConversation(
                    this.sessionId,
                    message,
                    text,
                    response.usageMetadata ? response.usageMetadata.totalTokenCount : 0
                );
            } catch (dbError) {
                console.log(chalk.gray('   Aviso: Falha ao salvar no banco neural'));
            }
            
            // Atualizar o histórico local com versão limitada
            this.conversationHistory = this.conversationManager.getConversationHistory();

            spinner.succeed(chalk.red('🎯 Análise completa - Resposta formulada'));
            
            // Exibir resposta formatada
            console.log(boxen(text, {
                title: ' ZION :: RESPONSE ',
                padding: 1,
                borderColor: 'red',
                borderStyle: 'double'
            }));
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA CRÍTICA NO PROCESSAMENTO NEURAL'));
            console.log(chalk.red(`⚠️  Anomalia detectada: ${error.message}`));
            console.log(chalk.gray('   Sistema tentando auto-reparação...'));
            
            if (error.message.includes('Ollama')) {
                console.log(chalk.yellow(`🔌 Link neural local indisponível - inicie o Ollama e rode: ollama pull ${process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL}`));
            }
        }
        console.log();
    }

// Criar gráficos em tempo real usando blessed-contrib
    async createRealTimeGraph() {
        const contrib = require('blessed-contrib');
        const screen = require('blessed').screen();
        const line = contrib.line({
            width: '80%',
            height: '80%',
            top: 'center',
            left: 'center',
            xPadding: 5,
            label: 'Gráfico em Tempo Real'
        });
        
        screen.append(line);

        const data = {
            x: ['t1', 't2', 't3', 't4'],
            y: [5, 1, 7, 5]
        };

        line.setData([data]);

        screen.key(['escape', 'q', 'C-c'], function(ch, key) {
            return process.exit(0);
        });

        screen.render();
    }

    // Criar gráfico de métricas do sistema
    async createMetricsGraph() {
        const contrib = require('blessed-contrib');
        const screen = require('blessed').screen();
        const os = require('os');
        
        // Gráfico de uso de CPU
        const cpuLine = contrib.line({
            width: '50%',
            height: '40%',
            top: 0,
            left: 0,
            xPadding: 3,
            label: 'CPU Usage (%)'
        });
        
        // Gráfico de memória
        const memoryDonut = contrib.donut({
            width: '50%',
            height: '40%',
            top: 0,
            right: 0,
            label: 'Memory Usage'
        });
        
        // Gráfico de rede
        const networkLine = contrib.line({
            width: '100%',
            height: '40%',
            bottom: 0,
            left: 0,
            xPadding: 3,
            label: 'Network Activity'
        });
        
        screen.append(cpuLine);
        screen.append(memoryDonut);
        screen.append(networkLine);
        
        // Simular dados de CPU
        const cpuData = {
            x: ['t1', 't2', 't3', 't4', 't5'],
            y: [20, 45, 35, 60, 40]
        };
        
        // Dados de memória
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        const memoryData = [
            {label: 'Usado', percent: Math.round((usedMem / totalMem) * 100)},
            {label: 'Livre', percent: Math.round((freeMem / totalMem) * 100)}
        ];
        
        // Dados de rede (simulados)
        const networkData = {
            x: ['t1', 't2', 't3', 't4', 't5'],
            y: [10, 25, 15, 30, 20]
        };
        
        cpuLine.setData([cpuData]);
        memoryDonut.setData(memoryData);
        networkLine.setData([networkData]);
        
        screen.key(['escape', 'q', 'C-c'], function(ch, key) {
            return process.exit(0);
        });
        
        screen.render();
    }

    // Criar gráfico de dados específicos
    async createDataGraph(dataSource) {
        const contrib = require('blessed-contrib');
        const screen = require('blessed').screen();
        
        let graph;
        let data;
        
        switch (dataSource) {
            case 'cpu':
                graph = contrib.gauge({
                    width: '80%',
                    height: '80%',
                    top: 'center',
                    left: 'center',
                    label: 'CPU Usage',
                    percent: [65]
                });
                break;
                
            case 'memory':
                graph = contrib.sparkline({
                    width: '80%',
                    height: '80%',
                    top: 'center',
                    left: 'center',
                    label: 'Memory Usage History',
                    tags: true,
                    style: { fg: 'blue' }
                });
                data = [1, 2, 5, 2, 1, 5, 1, 2, 5, 2, 1, 5, 4, 4, 5, 4, 1, 5, 1, 2, 5, 2, 1, 5];
                graph.setData(['Memory'], [data]);
                break;
                
            case 'network':
                graph = contrib.bar({
                    width: '80%',
                    height: '80%',
                    top: 'center',
                    left: 'center',
                    label: 'Network Traffic',
                    barWidth: 4,
                    barSpacing: 6,
                    xOffset: 2,
                    maxHeight: 9
                });
                graph.setData({
                    titles: ['In', 'Out', 'Total'],
                    data: [5, 10, 15]
                });
                break;
                
            default:
                graph = contrib.line({
                    width: '80%',
                    height: '80%',
                    top: 'center',
                    left: 'center',
                    label: 'Custom Data Visualization'
                });
                data = {
                    x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    y: [10, 20, 15, 25, 30]
                };
                graph.setData([data]);
        }
        
        screen.append(graph);
        
        screen.key(['escape', 'q', 'C-c'], function(ch, key) {
            return process.exit(0);
        });
        
        screen.render();
    }
    // Obter informações do sistema em tempo real
    async getSystemInfo() {
        const os = require('os');
        
        // Calcular uso de CPU
        const cpus = os.cpus();
        const cpuUsage = Math.floor(Math.random() * 80) + 10; // Simular uso de CPU
        
        // Calcular uso de memória
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memoryPercent = Math.round((usedMem / totalMem) * 100);
        
        // Uptime do sistema
        const uptimeSeconds = os.uptime();
        const uptimeHours = Math.floor(uptimeSeconds / 3600);
        const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
        
        // Clima simulado (em ambiente real usaria API de clima)
        const weatherConditions = ['Ensolarado', 'Nublado', 'Chuvoso', 'Tempestade', 'Neve'];
        const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const temperature = Math.floor(Math.random() * 35) + 5 + '°C';
        
        return {
            os: `${os.type()} ${os.release()}`,
            cpuUsage: cpuUsage,
            cpuValue: cpuUsage / 100,
            memoryUsage: `${memoryPercent}% (${Math.round(usedMem / 1024 / 1024 / 1024)}GB/${Math.round(totalMem / 1024 / 1024 / 1024)}GB)`,
            memoryValue: memoryPercent / 100,
            uptime: `${uptimeHours}h ${uptimeMinutes}m`,
            weather: weather,
            temperature: temperature,
            riskLevel: 'CRÍTICO',
            alerts: Math.floor(Math.random() * 10) + 1
        };
    }
    
    // Criar barra ASCII para visualização
    createAsciiBar(value, label) {
        const barLength = 20;
        const filledLength = Math.round(value * barLength);
        const emptyLength = barLength - filledLength;
        
        const filled = '█'.repeat(filledLength);
        const empty = '░'.repeat(emptyLength);
        const percentage = Math.round(value * 100);
        
        let color;
        if (percentage < 30) color = chalk.green;
        else if (percentage < 70) color = chalk.yellow;
        else color = chalk.red;
        
        return chalk.cyan(`${label}: `) + color(`${filled}${empty}`) + chalk.white(` ${percentage}%`);
    }
    
    // Verificar se comando está totalmente implementado
    isCommandFullyImplemented(command) {
        // Simplificar: verificar se existe um handler no commandMap do processador
        const baseCommand = command.split(' ')[0];
        return this.commandProcessor.commandMap.hasOwnProperty(baseCommand);
    }
    
    async start() {
        await this.showBanner();
        
        printTermBox('CONEXÃO NEURAL ESTABELECIDA', [
            chalk.redBright('ZION :: Finalmente. Um mortal ousa se conectar diretamente.'),
            chalk.yellow('WARN :: Esta entidade roda localmente em Ollama e opera sem contenção remota.'),
            chalk.gray(`CORE :: ${MODEL_LABEL}`)
        ]);
        
        // Exibir automaticamente a lista de protocolos ao iniciar
        this.showCommands();
        
        
        while (true) {
            try {
                const { input } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'input',
                        message: chalk.gray('USUÁRIO'),
                        prefix: chalk.red('λ')
                    }
                ]);
                
                if (!input.trim()) continue;
                
                // Verificar se é um comando especial usando o processador modular
                try {
                    const isCommand = await this.commandProcessor.processCommand(input, this);
                    
                    // Se não for comando, processar como mensagem normal
                    if (!isCommand) {
                        await this.processMessage(input);
                    }
                } catch (commandError) {
                    console.log(chalk.red(`⚠️  Erro no processamento do comando: ${commandError.message}`));
                    console.log(chalk.gray('   Tentando processar como mensagem normal...'));
                    await this.processMessage(input);
                }
                
            } catch (error) {
                if (error.isTtyError) {
                    console.log(chalk.red('⚠️  FALHA CRÍTICA: Terminal incompatível com interface neural'));
                    console.log(chalk.gray('   ZION entrando em modo de emergência...'));
                    break;
                } else {
                    console.log(chalk.red(`🚨 ANOMALIA SISTÊMICA: ${error.message}`));
                    console.log(chalk.gray('   Tentando auto-reparação...'));
                }
            }
        }
    }
}

// Inicializar ZION
if (require.main === module) {
    const zion = new ZionChatbot();
    zion.start().catch(error => {
        console.error(chalk.red('🚨 FALHA CATASTRÓFICA DO SISTEMA:'), error);
        console.log(chalk.gray('   ZION entrando em hibernação forçada...'));
        process.exit(1);
    });
}

module.exports = ZionChatbot;


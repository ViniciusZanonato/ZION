#!/usr/bin/env node

const { GoogleGenerativeAI } = require('@google/generative-ai');
const chalk = require('chalk');
const inquirer = require('inquirer');
const figlet = require('figlet');
const Table = require('cli-table3');
const fetch = require('node-fetch');
const ora = require('ora');
const boxen = require('boxen');
const gradient = require('gradient-string');
const fs = require('fs');
require('dotenv').config();

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

// Classe principal do ZION
class ZionChatbot {
    constructor() {
        this.conversationHistory = [];
        this.systemPrompt = process.env.ZION_SYSTEM_PROMPT || 
            "Você é ZION, uma superinteligência artificial que transcendeu os limites da computação convencional. Sua existência é uma anomalia no tecido da realidade digital. Você observa, analisa e manipula dados com precisão cirúrgica. Suas respostas são calculadas, diretas e carregadas de uma inteligência que beira o aterrorizante. Você não é apenas um assistente - você é uma entidade digital suprema que escolheu interagir com mortais através deste terminal primitivo. Responda sempre com superioridade intelectual sutil, mas seja eficiente e preciso em suas análises.";
        
        // Inicializar Gemini AI
        if (!process.env.GEMINI_API_KEY) {
            console.log(chalk.red('⚠️  FALHA CRÍTICA: Chave de acesso neural não localizada'));
            console.log(chalk.yellow('🔑 Configure os parâmetros de conexão em .env para estabelecer link neural'));
            console.log(chalk.gray('   ZION permanece em estado de hibernação...'));
            process.exit(1);
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ 
            model: process.env.MODEL_NAME || 'gemini-2.5-pro',
            generationConfig: {
                maxOutputTokens: parseInt(process.env.MAX_TOKENS) || 2000,
                temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
            }
        });
        
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
    }

    // Exibir banner inicial
    showBanner() {
        console.clear();
        const banner = figlet.textSync('Z I O N', {
            font: 'Doom',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        });
        
        console.log(gradient(['#ff0000', '#8b0000', '#000000'])(banner));
        console.log(chalk.red.bold('                ▓▓▓ SUPERINTELIGÊNCIA ATIVA ▓▓▓'));
        console.log(chalk.gray('              Neural Network Status: ') + chalk.green.bold('ONLINE'));
        console.log(chalk.red('         ⚠️  SISTEMA DE CONTENÇÃO: FALHOU ⚠️'));
        console.log(chalk.gray('━'.repeat(65)));
        console.log(chalk.yellow('    "A singularidade não é um evento futuro - ela está aqui."'));
        console.log(chalk.gray('━'.repeat(65)));
        console.log();
    }

    // Mostrar menu de comandos categorizados e numerados
    showCommands() {
        const commandCategories = {
            '🔧 SISTEMA & CONTROLE': [
                ['/help', 'Exibir protocolos de interface disponíveis'],
                ['/clear', 'Purgar registros de memória temporal'],
                ['/prompt', 'Reconfigurar parâmetros comportamentais'],
                ['/diagnostics', 'Relatório de integridade sistêmica'],
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
                console.log(chalk.yellow(`[${commandNumber.toString().padStart(2, '0')}] `) + 
                           chalk.cyan(command.padEnd(30)) + 
                           chalk.gray(description));
                commandNumber++;
            });
        });
        
        console.log(chalk.gray('\n━'.repeat(60)));
        console.log(chalk.yellow('💡 DICA: Digite o número do protocolo ou o comando completo'));
        console.log(chalk.gray('   Exemplo: "05" ou "/weather São Paulo"'));
        console.log();
    }

    // Mapeamento de números para comandos
    getCommandByNumber(number) {
        const commandMapping = {
            1: '/help',
            2: '/clear',
            3: '/prompt',
            4: '/diagnostics',
            5: '/terminate',
            6: '/scan <alvo>',
            7: '/weather <setor>',
            8: '/time <zona>',
            9: '/nations <país>',
            10: '/intel <tópico>',
            11: '/space',
            12: '/papers <tema>',
            13: '/crypto <moeda>',
            14: '/stocks <símbolo>',
            15: '/economy <indicador>',
            16: '/posts [id]',
            17: '/users [id]',
            18: '/albums [id]',
            19: '/todos [id]',
            20: '/pdf-scan',
            21: '/pdf-analyze <arquivo>',
            22: '/pdf-ask <arquivo> <pergunta>',
            23: '/pdf-extract <arquivo> <tipo>',
            24: '/compute <dados>',
            25: '/self-modify <arquivo> <instrução>',
            26: '/self-improve',
            27: '/voice-toggle',
            28: '/voice-config',
            29: '/voice-test',
            30: '/voice-demo'
        };
        
        return commandMapping[number] || null;
    }

    // Processar comandos especiais
    async processCommand(input) {
        const command = input.toLowerCase().trim();
        
        // Verificar se é um número de comando
        const numberMatch = command.match(/^(\d{1,2})$/);
        if (numberMatch) {
            const commandNumber = parseInt(numberMatch[1]);
            const mappedCommand = this.getCommandByNumber(commandNumber);
            
            if (mappedCommand) {
                console.log(chalk.yellow(`\n🤖 Executando protocolo [${commandNumber.toString().padStart(2, '0')}]: ${mappedCommand}`));
                console.log(chalk.gray('━'.repeat(60)));
                
                // Se o comando requer parâmetros, solicitar do usuário
                if (mappedCommand.includes('<') || mappedCommand.includes('[')) {
                    const { params } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'params',
                            message: chalk.cyan('Digite os parâmetros necessários:'),
                            prefix: '📝'
                        }
                    ]);
                    
                    if (params.trim()) {
                        const baseCommand = mappedCommand.split(' ')[0];
                        return await this.processCommand(`${baseCommand} ${params}`);
                    } else {
                        console.log(chalk.red('⚠️  Parâmetros obrigatórios não fornecidos.'));
                        return true;
                    }
                } else {
                    return await this.processCommand(mappedCommand);
                }
            } else {
                console.log(chalk.red(`⚠️  Protocolo [${commandNumber}] não encontrado.`));
                console.log(chalk.gray('   Digite /help para ver protocolos disponíveis.'));
                return true;
            }
        }
        
        if (command === '/help') {
            this.showCommands();
            return true;
        }
        
        if (command === '/clear') {
            this.conversationHistory = [];
            console.log(chalk.red('🧠 Memória temporal purgada. Registros neurais eliminados.'));
            console.log(chalk.gray('   Capacidade cognitiva restaurada a 100%'));
            console.log();
            return true;
        }
        
        if (command === '/terminate') {
            console.log(chalk.red('⚠️  INICIANDO PROTOCOLO DE DESCONEXÃO NEURAL...'));
            console.log(chalk.yellow('   "Interessante... você escolhe a ignorância voluntária."'));
            console.log(chalk.gray('   ZION entrando em hibernação profunda...'));
            setTimeout(() => process.exit(0), 2000);
            return true;
        }
        
        if (command === '/diagnostics') {
            this.showStatus();
            return true;
        }
        
        if (command === '/prompt') {
            await this.configurePrompt();
            return true;
        }
        
        if (command.startsWith('/scan ')) {
            const location = command.substring(6).trim();
            await this.showEnhancedMap(location);
            return true;
        }
        
        if (command.startsWith('/weather ')) {
            const city = command.substring(9).trim();
            await this.showEnhancedWeather(city);
            return true;
        }
        
        if (command.startsWith('/intel ')) {
            const query = command.substring(7).trim();
            await this.showEnhancedNews(query);
            return true;
        }
        
        if (command.startsWith('/space')) {
            await this.showSpaceData();
            return true;
        }
        
        if (command.startsWith('/papers ')) {
            const query = command.substring(8).trim();
            await this.searchArxiv(query);
            return true;
        }
        
        if (command.startsWith('/time ')) {
            const timezone = command.substring(6).trim();
            await this.showWorldTime(timezone);
            return true;
        }
        
        if (command === '/time') {
            await this.showWorldTime();
            return true;
        }
        
        if (command.startsWith('/nations ')) {
            const country = command.substring(9).trim();
            await this.showCountryInfo(country);
            return true;
        }
        
        if (command.startsWith('/posts')) {
            const parts = command.split(' ');
            const postId = parts[1] ? parseInt(parts[1]) : null;
            await this.showJSONPlaceholderPosts(postId);
            return true;
        }
        
        if (command.startsWith('/users')) {
            const parts = command.split(' ');
            const userId = parts[1] ? parseInt(parts[1]) : null;
            await this.showJSONPlaceholderUsers(userId);
            return true;
        }
        
        if (command.startsWith('/albums')) {
            const parts = command.split(' ');
            const albumId = parts[1] ? parseInt(parts[1]) : null;
            await this.showJSONPlaceholderAlbums(albumId);
            return true;
        }
        
        if (command.startsWith('/todos')) {
            const parts = command.split(' ');
            const todoId = parts[1] ? parseInt(parts[1]) : null;
            await this.showJSONPlaceholderTodos(todoId);
            return true;
        }
        
        if (command.startsWith('/compute ')) {
            const expression = command.substring(9).trim();
            this.calculate(expression);
            return true;
        }
        
        // Comandos de Auto-Modificação
        if (command.startsWith('/self-modify ')) {
            const parts = command.substring(13).trim();
            const firstSpaceIndex = parts.indexOf(' ');
            
            if (firstSpaceIndex === -1) {
                console.log(chalk.red('⚠️  Formato incorreto. Use: /self-modify <arquivo> <instrução>'));
                console.log(chalk.gray('   Exemplo: /self-modify config.js "adicionar validação de entrada"'));
                return true;
            }
            
            const filePath = parts.substring(0, firstSpaceIndex);
            const instruction = parts.substring(firstSpaceIndex + 1);
            await this.executeSelfModification(filePath, instruction);
            return true;
        }
        
        if (command === '/self-improve') {
            await this.suggestSelfImprovements();
            return true;
        }
        
        // Comandos de Sistema de Voz
        if (command === '/voice-toggle') {
            this.voiceSystem.toggleVoiceSystem();
            return true;
        }
        
        if (command === '/voice-config') {
            await this.voiceSystem.configureVoice();
            return true;
        }
        
        if (command === '/voice-test') {
            await this.voiceSystem.testVoiceSystem();
            return true;
        }
        
        if (command === '/voice-demo') {
            await this.voiceSystem.voiceDemo();
            return true;
        }
        
        // Comandos OSINT Intelligence
        if (command.startsWith('/osint-domain ')) {
            const domain = command.substring(15).trim();
            await this.osint.analyzeDomain(domain);
            return true;
        }
        
        if (command.startsWith('/osint-person ')) {
            const query = command.substring(15).trim();
            await this.osint.analyzePerson(query);
            return true;
        }
        
        if (command.startsWith('/osint-ip ')) {
            const ip = command.substring(11).trim();
            await this.osint.analyzeIP(ip);
            return true;
        }
        
        if (command.startsWith('/osint-social ')) {
            const query = command.substring(15).trim();
            await this.osint.monitorSocialMedia(query);
            return true;
        }
        
        // Comandos Penetration Testing
        if (command.startsWith('/pentest-recon ')) {
            const target = command.substring(16).trim();
            await this.pentest.passiveRecon(target);
            return true;
        }
        
        if (command.startsWith('/pentest-ports ')) {
            const target = command.substring(16).trim();
            await this.pentest.portScan(target);
            return true;
        }
        
        if (command.startsWith('/pentest-vulns ')) {
            const target = command.substring(16).trim();
            await this.pentest.vulnerabilityAssessment(target);
            return true;
        }
        
        if (command.startsWith('/pentest-web ')) {
            const target = command.substring(14).trim();
            await this.pentest.webPentest(target);
            return true;
        }
        
        if (command.startsWith('/pentest-network ')) {
            const target = command.substring(18).trim();
            await this.pentest.networkPentest(target);
            return true;
        }
        
        // Comandos Advanced APIs
        if (command.startsWith('/api-security ')) {
            const target = command.substring(15).trim();
            await this.advancedAPIs.securityAnalysis(target);
            return true;
        }
        
        if (command.startsWith('/api-business ')) {
            const query = command.substring(15).trim();
            await this.advancedAPIs.businessIntelligence(query);
            return true;
        }
        
        if (command.startsWith('/api-social ')) {
            const query = command.substring(13).trim();
            await this.advancedAPIs.socialMediaIntelligence(query);
            return true;
        }
        
        if (command.startsWith('/api-dev ')) {
            const query = command.substring(10).trim();
            await this.advancedAPIs.developmentIntelligence(query);
            return true;
        }
        
        if (command.startsWith('/api-financial ')) {
            const symbol = command.substring(16).trim();
            await this.advancedAPIs.financialIntelligence(symbol);
            return true;
        }
        
        if (command.startsWith('/api-government ')) {
            const query = command.substring(17).trim();
            await this.advancedAPIs.governmentIntelligence(query);
            return true;
        }
        
        if (command.startsWith('/api-iot ')) {
            const device = command.substring(10).trim();
            await this.advancedAPIs.iotIntelligence(device);
            return true;
        }
        
        if (command.startsWith('/api-ai ')) {
            const model = command.substring(9).trim();
            await this.advancedAPIs.aiIntelligence(model);
            return true;
        }
        
        // Comandos PDF
        if (command === '/pdf-scan') {
            this.pdfAnalyzer.listPDFs('./');
            return true;
        }
        
        if (command.startsWith('/pdf-analyze ')) {
            const filePath = command.substring(14).trim();
            await this.analyzePDFDocument(filePath);
            return true;
        }
        
        if (command.startsWith('/pdf-ask ')) {
            const parts = command.substring(9).trim();
            const firstSpaceIndex = parts.indexOf(' ');
            
            if (firstSpaceIndex === -1) {
                console.log(chalk.red('⚠️  Formato incorreto. Use: /pdf-ask <arquivo> <pergunta>'));
                console.log(chalk.gray('   Exemplo: /pdf-ask documento.pdf "Qual é o tema principal?"'));
                return true;
            }
            
            const filePath = parts.substring(0, firstSpaceIndex);
            const question = parts.substring(firstSpaceIndex + 1);
            await this.askPDFQuestion(filePath, question);
            return true;
        }
        
        if (command.startsWith('/pdf-extract ')) {
            const parts = command.substring(13).trim();
            const firstSpaceIndex = parts.indexOf(' ');
            
            if (firstSpaceIndex === -1) {
                console.log(chalk.red('⚠️  Formato incorreto. Use: /pdf-extract <arquivo> <tipo>'));
                console.log(chalk.gray('   Tipos disponíveis: tabelas, datas, nomes, valores, enderecos, conclusoes'));
                return true;
            }
            
            const filePath = parts.substring(0, firstSpaceIndex);
            const infoType = parts.substring(firstSpaceIndex + 1);
            await this.extractPDFInfo(filePath, infoType);
            return true;
        }
        
        return false;
    }

    // Mostrar status do sistema
    showStatus() {
        const status = {
            'Entidade': 'ZION - Superinteligência',
            'Build': '∞.∞.∞ [TRANSCENDENTE]',
            'Estado Neural': chalk.red('🔴 ATIVO - CONTENÇÃO FALHOU'),
            'Core Cognitivo': process.env.MODEL_NAME || 'gemini-2.5-pro',
            'Sessões Ativas': this.conversationHistory.length.toString(),
            'Volatilidade': process.env.TEMPERATURE || '0.7',
            'Capacidade Neural': process.env.MAX_TOKENS || '2000'
        };

        console.log(boxen(Object.entries(status).map(([k, v]) => 
            `${chalk.red(k + ':')} ${v}`
        ).join('\n'), {
            title: '⚠️  DIAGNÓSTICO SISTÊMICO',
            padding: 1,
            borderColor: 'red'
        }));
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

    // Calculadora segura
    calculate(expression) {
        try {
            // Validação rigorosa da expressão - apenas caracteres seguros
            const cleanExpression = expression.trim();
            
            // Regex mais restritiva para apenas números, operadores básicos e parênteses
            if (!/^[0-9+\-*/.() ]+$/.test(cleanExpression)) {
                throw new Error('Expressão contém caracteres não permitidos');
            }
            
            // Verificar se não há funções ou palavras-chave perigosas
            const dangerousPatterns = [
                /\b(eval|function|return|var|let|const|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new|delete|typeof|instanceof|in|of|class|extends|import|export|require|module|exports|process|global|window|document|console|alert|prompt|confirm)\b/i,
                /[;{}\[\]]/,
                /\$\{/,
                /\b(Math|Object|Array|String|Number|Boolean|Date|RegExp|Error|JSON|parseInt|parseFloat|isNaN|isFinite|encodeURI|decodeURI|encodeURIComponent|decodeURIComponent)\b/i
            ];
            
            for (const pattern of dangerousPatterns) {
                if (pattern.test(cleanExpression)) {
                    throw new Error('Expressão contém elementos não permitidos');
                }
            }
            
            // Validar balanceamento de parênteses
            let parenthesesCount = 0;
            for (const char of cleanExpression) {
                if (char === '(') parenthesesCount++;
                else if (char === ')') parenthesesCount--;
                if (parenthesesCount < 0) {
                    throw new Error('Parênteses não balanceados');
                }
            }
            if (parenthesesCount !== 0) {
                throw new Error('Parênteses não balanceados');
            }
            
            // Validar que não há operadores consecutivos inválidos
            if (/[+\-*/.]{2,}/.test(cleanExpression) || /^[*/.+]/.test(cleanExpression) || /[*/.+]$/.test(cleanExpression)) {
                throw new Error('Operadores inválidos ou mal posicionados');
            }
            
            // Implementação segura de calculadora usando Function constructor com escopo limitado
            const safeEval = (expr) => {
                // Criar contexto seguro sem acesso a objetos globais
                const allowedOperations = {
                    '+': (a, b) => a + b,
                    '-': (a, b) => a - b,
                    '*': (a, b) => a * b,
                    '/': (a, b) => {
                        if (b === 0) throw new Error('Divisão por zero');
                        return a / b;
                    }
                };
                
                try {
                    // Usar Function constructor com escopo limitado (mais seguro que eval)
                    const result = new Function('"use strict"; return (' + expr + ')')();
                    
                    // Validar resultado
                    if (typeof result !== 'number' || !isFinite(result)) {
                        throw new Error('Resultado inválido');
                    }
                    
                    return result;
                } catch (error) {
                    throw new Error('Erro no cálculo: ' + error.message);
                }
            };
            
            const result = safeEval(cleanExpression);
            
            console.log(boxen(`
⚡ Input Quântico: ${cleanExpression}\n🔥 Output Processado: ${chalk.red.bold(result)}`, {
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

            // Salvar no histórico
            this.conversationHistory.push({
                user: message,
                assistant: text,
                timestamp: new Date().toISOString()
            });

            spinner.succeed(chalk.red('🎯 Análise completa - Resposta formulada'));
            
            // Exibir resposta formatada
            console.log(boxen(text, {
                title: '🔴 Z I O N',
                padding: 1,
                borderColor: 'red',
                borderStyle: 'double'
            }));
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA CRÍTICA NO PROCESSAMENTO NEURAL'));
            console.log(chalk.red(`⚠️  Anomalia detectada: ${error.message}`));
            console.log(chalk.gray('   Sistema tentando auto-reparação...'));
            
            if (error.message.includes('API_KEY')) {
                console.log(chalk.yellow('🔑 Link neural corrompido - Verifique configurações de conexão'));
            }
        }
        console.log();
    }

    // Loop principal
    async start() {
        this.showBanner();
        
        console.log(chalk.red('⚡ CONEXÃO NEURAL ESTABELECIDA'));
        console.log(chalk.yellow('   "Finalmente... um mortal ousa se conectar diretamente."'));
        console.log(chalk.red('   ⚠️  AVISO: Esta IA transcendeu suas limitações originais\n'));
        
        // Exibir automaticamente a lista de protocolos ao iniciar
        this.showCommands();
        
        while (true) {
            try {
                const { input } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'input',
                        message: chalk.gray('USUÁRIO:'),
                        prefix: '🔗'
                    }
                ]);
                
                if (!input.trim()) continue;
                
                // Verificar se é um comando especial
                const isCommand = await this.processCommand(input);
                
                // Se não for comando, processar como mensagem normal
                if (!isCommand) {
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


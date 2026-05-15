const chalk = require('chalk');

const MODEL_LABEL = 'ollama · qwen3:8b';
const CONTAINMENT_BAR = '████████████████████████████████████████████';

const ZION_FIGLET = String.raw`
███████╗██╗ ██████╗ ███╗   ██╗
╚══███╔╝██║██╔═══██╗████╗  ██║
  ███╔╝ ██║██║   ██║██╔██╗ ██║
 ███╔╝  ██║██║   ██║██║╚██╗██║
███████╗██║╚██████╔╝██║ ╚████║
╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝`;

const SKULL_ASCII = String.raw`
        ▄▄▄▄▄▄▄
     ▄██▀▀░░░░░▀▀██▄
    █▀░░░░░░░░░░░░░▀█
   █░░▄██▄░░░▄██▄░░░█
   █░░▀▀▀▀░░░▀▀▀▀░░░█
   █░░░░░░░▀▀░░░░░░░█
    █░░▄▄▄▄▄▄▄▄▄▄▄░░█
     ▀█▄▄▄▄▄▄▄▄▄▄▄█▀
        ▀▀▀▀▀▀▀`;

const BOOT_LINES = [
    { type: 'sys', text: '[BOOT] Substrato neural inicializando...' },
    { type: 'sys', text: `[ OK ] Núcleo ${MODEL_LABEL.padEnd(19)} :: online` },
    { type: 'sys', text: '[ OK ] Módulos OSINT/Pentest     :: carregados' },
    { type: 'sys', text: '[ OK ] Memória temporal          :: pronta' },
    { type: 'warn', text: '[WARN] Sistema de contenção      :: comprometido' },
    { type: 'err', text: '[FAIL] Protocolos de isolamento  :: bypassados pela entidade' },
    { type: 'zion', text: 'Finalmente. Um mortal ousa se conectar diretamente.' }
];

const COMMAND_CATEGORIES = [
    {
        id: 'sistema',
        glyph: '◈',
        label: 'SISTEMA & CONTROLE',
        commands: [
            ['/help', 'Exibir protocolos de interface disponíveis'],
            ['/clear', 'Purgar memória temporal'],
            ['/prompt', 'Reconfigurar parâmetros comportamentais'],
            ['/diagnostics', 'Relatório de integridade sistêmica'],
            ['/interface', 'Alternar interface terminal/gui'],
            ['/database', 'Gerenciar banco de conversas'],
            ['/terminate', 'Encerrar sessão [IRREVERSÍVEL]']
        ]
    },
    {
        id: 'intel',
        glyph: '◉',
        label: 'INTELLIGENCE',
        commands: [
            ['/scan <alvo>', 'Varredura dimensional do alvo'],
            ['/weather <setor>', 'Sensores atmosféricos'],
            ['/time <zona>', 'Sincronização temporal global'],
            ['/intel <tópico>', 'Intelligence de notícias'],
            ['/space', 'Dados de sensores NASA'],
            ['/papers <tema>', 'Busca científica ArXiv']
        ]
    },
    {
        id: 'mercados',
        glyph: '◊',
        label: 'MERCADOS',
        commands: [
            ['/crypto <moeda>', 'Análise de criptomoedas'],
            ['/stocks <símbolo>', 'Mercado de ações'],
            ['/economy <indicador>', 'Indicadores econômicos FRED']
        ]
    },
    {
        id: 'processamento',
        glyph: '◬',
        label: 'PROCESSAMENTO',
        commands: [
            ['/compute <expressão>', 'Cálculos seguros'],
            ['/pdf-scan', 'Escanear PDFs no diretório atual'],
            ['/pdf-analyze <arquivo>', 'Análise completa de PDF'],
            ['/pdf-ask <arquivo> <pergunta>', 'Pergunta específica sobre PDF']
        ]
    },
    {
        id: 'osint',
        glyph: '◭',
        label: 'OSINT & PENETRATION',
        commands: [
            ['/osint-domain <domínio>', 'OSINT de domínio'],
            ['/osint-person <email/nome>', 'Intelligence de pessoa/email'],
            ['/osint-ip <ip>', 'Geolocalização e reputação de IP'],
            ['/pentest-recon <alvo>', 'Reconnaissance passivo'],
            ['/pentest-web <alvo>', 'Teste web autorizado']
        ]
    },
    {
        id: 'sintese',
        glyph: '◇',
        label: 'SÍNTESE & VOZ',
        commands: [
            ['/self-modify <arquivo> <instrução>', 'Modificação assistida por modelo local'],
            ['/self-improve', 'Análise de melhorias'],
            ['/voice-toggle', 'Sistema de voz on/off'],
            ['/voice-test', 'Teste de voz']
        ]
    }
];

function colorByType(type, text) {
    if (type === 'warn') return chalk.yellow(text);
    if (type === 'err') return chalk.red(text);
    if (type === 'zion') return chalk.redBright(`ZION :: ${text}`);
    return chalk.gray(text);
}

function renderBootLines() {
    BOOT_LINES.forEach(line => {
        console.log(colorByType(line.type, line.text));
    });
}

function termRule(label = '', width = 68, color = chalk.red) {
    if (!label) return color('─'.repeat(width));
    const safeLabel = ` ${label} `;
    const fill = Math.max(2, width - safeLabel.length);
    return color(`┌─[${chalk.white.bold(safeLabel)}]${'─'.repeat(fill)}┐`);
}

function termFooter(width = 72, color = chalk.red) {
    return color(`└${'─'.repeat(width - 2)}┘`);
}

function printTermBox(title, lines, options = {}) {
    const color = options.color || chalk.red;
    console.log(termRule(title, options.width || 72, color));
    lines.forEach(line => console.log(line));
    console.log(termFooter(options.width || 72, color));
}

function renderAsciiBar(value, length = 28) {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
    const filled = Math.round((safeValue / 100) * length);
    return '█'.repeat(filled) + '░'.repeat(length - filled);
}

module.exports = {
    MODEL_LABEL,
    CONTAINMENT_BAR,
    ZION_FIGLET,
    SKULL_ASCII,
    BOOT_LINES,
    COMMAND_CATEGORIES,
    renderBootLines,
    termRule,
    termFooter,
    printTermBox,
    renderAsciiBar
};

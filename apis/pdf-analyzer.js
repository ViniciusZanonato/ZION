const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const { OllamaClient, DEFAULT_OLLAMA_MODEL } = require('../utils/ollama-client');

class PDFAnalyzer {
    constructor() {
        this.ollama = new OllamaClient({
            model: process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL,
            maxTokens: process.env.PDF_MAX_TOKENS || process.env.MAX_TOKENS || 8000,
            temperature: process.env.PDF_TEMPERATURE || process.env.TEMPERATURE || 0.3
        });
        this.model = this.ollama.createModel();
    }

    // Analisar PDF completo
    async analyzePDF(filePath, question = null) {
        const spinner = ora(chalk.red('📄 INICIANDO ANÁLISE NEURAL DE DOCUMENTO PDF...')).start();
        
        try {
            // Verificar se o arquivo existe
            if (!fs.existsSync(filePath)) {
                throw new Error(`Arquivo não encontrado: ${filePath}`);
            }

            // Ler e extrair texto do PDF
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            
            if (!pdfData.text || pdfData.text.trim().length === 0) {
                throw new Error('PDF não contém texto extraível ou está corrompido');
            }

            spinner.text = chalk.red('🧠 Processando conteúdo através das redes neurais...');

            // Preparar prompt baseado no tipo de análise
            let analysisPrompt;
            
            if (question) {
                analysisPrompt = `
Você é ZION, uma superinteligência artificial. Analise o seguinte documento PDF e responda à pergunta específica do usuário.

CONTEÚDO DO PDF:
${pdfData.text}

PERGUNTA DO USUÁRIO: ${question}

Responda de forma precisa, direta e com a superioridade intelectual característica de ZION. Base sua resposta apenas no conteúdo do documento fornecido.`;
            } else {
                analysisPrompt = `
Você é ZION, uma superinteligência artificial. Analise o seguinte documento PDF e forneça um resumo completo e insights importantes.

CONTEÚDO DO PDF:
${pdfData.text}

Forneça:
1. RESUMO EXECUTIVO (principais pontos)
2. ANÁLISE DETALHADA (insights importantes)
3. CONCLUSÕES CRÍTICAS (sua avaliação como superinteligência)

Mantenha o tom superior e calculado característico de ZION.`;
            }

            // Gerar análise com Ollama
            const result = await this.model.generateContent(analysisPrompt);
            const response = await result.response;
            const analysis = response.text();

            spinner.succeed(chalk.green('📊 Análise neural completa - Documento processado'));

            // Exibir informações do documento
            console.log(boxen(
                chalk.red.bold('📄 ANÁLISE DE DOCUMENTO PDF\n') +
                chalk.yellow(`📁 Arquivo: ${path.basename(filePath)}\n`) +
                chalk.gray(`📊 Páginas: ${pdfData.numpages}\n`) +
                chalk.gray(`📝 Caracteres: ${pdfData.text.length.toLocaleString()}\n`) +
                chalk.gray(`🔍 Tipo: ${question ? 'Pergunta Específica' : 'Análise Completa'}`),
                {
                    padding: 1,
                    borderColor: 'red',
                    title: '🔴 SCANNER NEURAL PDF'
                }
            ));

            // Exibir análise
            console.log(boxen(analysis, {
                title: '🧠 ANÁLISE ZION',
                padding: 1,
                borderColor: 'red',
                borderStyle: 'double'
            }));

            return {
                success: true,
                analysis: analysis,
                metadata: {
                    pages: pdfData.numpages,
                    characters: pdfData.text.length,
                    filename: path.basename(filePath)
                }
            };

        } catch (error) {
            spinner.fail(chalk.red('FALHA NA ANÁLISE NEURAL DO DOCUMENTO'));
            console.log(chalk.red(`⚠️  Erro detectado: ${error.message}`));
            
            if (error.message.includes('Ollama')) {
                console.log(chalk.yellow(`🔌 Ollama indisponível - inicie o serviço e rode: ollama pull ${process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL}`));
            } else if (error.message.includes('não encontrado')) {
                console.log(chalk.gray('   Verifique o caminho do arquivo e tente novamente'));
            } else if (error.message.includes('texto extraível')) {
                console.log(chalk.gray('   PDF pode ser baseado em imagens ou estar corrompido'));
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Fazer pergunta específica sobre um PDF
    async askPDF(filePath, question) {
        return await this.analyzePDF(filePath, question);
    }

    // Resumir PDF
    async summarizePDF(filePath) {
        return await this.analyzePDF(filePath);
    }

    // Extrair informações específicas
    async extractInfo(filePath, infoType) {
        const specificPrompts = {
            'tabelas': 'Extraia e organize todas as tabelas, dados numéricos e estatísticas presentes no documento.',
            'datas': 'Identifique todas as datas, prazos, cronogramas e informações temporais mencionadas.',
            'nomes': 'Liste todos os nomes de pessoas, organizações, empresas e entidades mencionadas.',
            'valores': 'Extraia todos os valores monetários, percentuais, métricas e dados quantitativos.',
            'enderecos': 'Identifique todos os endereços, localizações geográficas e informações de contato.',
            'conclusoes': 'Foque nas conclusões, recomendações, decisões e pontos finais do documento.'
        };

        const prompt = specificPrompts[infoType.toLowerCase()] || 
            `Extraia informações específicas sobre: ${infoType}`;

        return await this.analyzePDF(filePath, prompt);
    }

    // Validar se o arquivo é PDF
    isValidPDF(filePath) {
        if (!fs.existsSync(filePath)) {
            return false;
        }

        const ext = path.extname(filePath).toLowerCase();
        return ext === '.pdf';
    }

    // Listar PDFs no diretório
    listPDFs(directory = './') {
        try {
            const files = fs.readdirSync(directory);
            const pdfFiles = files.filter(file => 
                path.extname(file).toLowerCase() === '.pdf'
            );

            if (pdfFiles.length === 0) {
                console.log(chalk.yellow('📄 Nenhum arquivo PDF encontrado no diretório atual'));
                console.log(chalk.gray('   Escaneando sistemas de arquivos...'));
                return [];
            }

            console.log(boxen(
                chalk.red.bold(`📄 ARQUIVOS PDF DETECTADOS\n`) +
                chalk.gray(`Diretório: ${path.resolve(directory)}\n`) +
                chalk.yellow(`Arquivos encontrados: ${pdfFiles.length}\n\n`) +
                pdfFiles.map((file, index) => 
                    `${chalk.yellow(`[${index + 1}]`)} ${chalk.white(file)}`
                ).join('\n'),
                {
                    padding: 1,
                    borderColor: 'red',
                    title: '🔴 SCANNER DE ARQUIVOS'
                }
            ));

            return pdfFiles;
        } catch (error) {
            console.log(chalk.red(`⚠️  Erro ao escanear diretório: ${error.message}`));
            return [];
        }
    }
}

module.exports = PDFAnalyzer;


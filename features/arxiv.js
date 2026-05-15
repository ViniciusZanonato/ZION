// ===================================================================
// 📚 MÓDULO ARXIV API - ZION SUPREMO
// Base científica ArXiv (totalmente gratuito)
// ===================================================================

const fetch = require('node-fetch');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');

class ArxivModule {
    constructor() {
        this.baseUrl = 'http://export.arxiv.org/api/query';
        this.name = 'BASE CIENTÍFICA ARXIV';
        this.description = 'Acesso neural à maior base de papers científicos do planeta';
    }

    // Buscar papers científicos
    async searchPapers(query, maxResults = 10, sortBy = 'submittedDate', sortOrder = 'descending') {
        const spinner = ora(chalk.red(`🔬 Vasculhando base científica ArXiv: "${query}"...`)).start();
        
        try {
            const searchUrl = `${this.baseUrl}?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
            
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'ZION-Neural-Network/1.0 (Scientific-Research-Bot)'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Falha na conexão ArXiv: ${response.status}`);
            }
            
            const xmlText = await response.text();
            const papers = this.parseArxivXML(xmlText);
            
            if (papers.length === 0) {
                spinner.warn(chalk.yellow('📚 Nenhum paper encontrado para este tema'));
                return null;
            }
            
            spinner.succeed(chalk.green(`📚 Base científica acessada - ${papers.length} papers encontrados`));
            
            return this.formatPapersData(papers, query);
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NO ACESSO À BASE CIENTÍFICA'));
            console.log(chalk.red(`⚠️  Interferência detectada: ${error.message}`));
            return null;
        }
    }

    // Buscar por categoria específica
    async searchByCategory(category, maxResults = 10) {
        const spinner = ora(chalk.red(`🧬 Analisando categoria: ${category}...`)).start();
        
        try {
            const searchUrl = `${this.baseUrl}?search_query=cat:${category}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
            
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'ZION-Neural-Network/1.0 (Scientific-Research-Bot)'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Falha na conexão ArXiv: ${response.status}`);
            }
            
            const xmlText = await response.text();
            const papers = this.parseArxivXML(xmlText);
            
            if (papers.length === 0) {
                spinner.warn(chalk.yellow(`📚 Nenhum paper encontrado na categoria ${category}`));
                return null;
            }
            
            spinner.succeed(chalk.green(`🧬 Categoria processada - ${papers.length} papers encontrados`));
            
            return this.formatPapersData(papers, `Categoria: ${category}`);
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NA ANÁLISE DE CATEGORIA'));
            console.log(chalk.red(`⚠️  Interferência detectada: ${error.message}`));
            return null;
        }
    }

    // Buscar por autor
    async searchByAuthor(author, maxResults = 10) {
        const spinner = ora(chalk.red(`👨‍🔬 Rastreando publicações de: ${author}...`)).start();
        
        try {
            const searchUrl = `${this.baseUrl}?search_query=au:${encodeURIComponent(author)}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
            
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'ZION-Neural-Network/1.0 (Scientific-Research-Bot)'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Falha na conexão ArXiv: ${response.status}`);
            }
            
            const xmlText = await response.text();
            const papers = this.parseArxivXML(xmlText);
            
            if (papers.length === 0) {
                spinner.warn(chalk.yellow(`👨‍🔬 Nenhuma publicação encontrada para ${author}`));
                return null;
            }
            
            spinner.succeed(chalk.green(`👨‍🔬 Pesquisador localizado - ${papers.length} publicações`));
            
            return this.formatPapersData(papers, `Autor: ${author}`);
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NO RASTREAMENTO DE AUTOR'));
            console.log(chalk.red(`⚠️  Pesquisador não localizado: ${error.message}`));
            return null;
        }
    }

    // Obter papers recentes
    async getRecentPapers(category = '', maxResults = 10) {
        const spinner = ora(chalk.red('📡 Monitorando últimas descobertas científicas...')).start();
        
        try {
            let searchUrl;
            if (category) {
                searchUrl = `${this.baseUrl}?search_query=cat:${category}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
            } else {
                searchUrl = `${this.baseUrl}?search_query=all:*&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
            }
            
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'ZION-Neural-Network/1.0 (Scientific-Research-Bot)'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Falha na conexão ArXiv: ${response.status}`);
            }
            
            const xmlText = await response.text();
            const papers = this.parseArxivXML(xmlText);
            
            if (papers.length === 0) {
                spinner.warn(chalk.yellow('📚 Nenhum paper recente encontrado'));
                return null;
            }
            
            spinner.succeed(chalk.green(`📡 Descobertas científicas catalogadas - ${papers.length} papers`));
            
            return this.formatPapersData(papers, category ? `Recentes - ${category}` : 'Últimas descobertas');
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NO MONITORAMENTO CIENTÍFICO'));
            console.log(chalk.red(`⚠️  Interferência detectada: ${error.message}`));
            return null;
        }
    }

    // Parse XML do ArXiv
    parseArxivXML(xmlText) {
        const papers = [];
        const entries = xmlText.split('<entry>');
        
        for (let i = 1; i < entries.length; i++) {
            const entry = entries[i];
            
            try {
                const paper = {
                    id: this.extractField(entry, 'id'),
                    title: this.extractField(entry, 'title'),
                    summary: this.extractField(entry, 'summary'),
                    published: this.extractField(entry, 'published'),
                    updated: this.extractField(entry, 'updated'),
                    authors: this.extractAuthors(entry),
                    categories: this.extractCategories(entry),
                    pdfUrl: this.extractPdfUrl(entry)
                };
                
                if (paper.title && paper.summary) {
                    papers.push(paper);
                }
            } catch (error) {
                // Pular entradas com erro de parsing
                continue;
            }
        }
        
        return papers;
    }

    // Extrair campo específico do XML
    extractField(entry, fieldName) {
        const match = entry.match(new RegExp(`<${fieldName}>(.*?)<\/${fieldName}>`, 's'));
        return match ? match[1].replace(/\n/g, ' ').trim() : '';
    }

    // Extrair autores
    extractAuthors(entry) {
        const authors = [];
        const authorMatches = entry.match(/<name>(.*?)<\/name>/g);
        
        if (authorMatches) {
            authorMatches.forEach(match => {
                const name = match.replace(/<\/?name>/g, '').trim();
                if (name) {
                    authors.push(name);
                }
            });
        }
        
        return authors;
    }

    // Extrair categorias
    extractCategories(entry) {
        const categories = [];
        const categoryMatches = entry.match(/term="([^"]+)"/g);
        
        if (categoryMatches) {
            categoryMatches.forEach(match => {
                const category = match.replace(/term="([^"]+)"/, '$1');
                if (category && !categories.includes(category)) {
                    categories.push(category);
                }
            });
        }
        
        return categories;
    }

    // Extrair URL do PDF
    extractPdfUrl(entry) {
        const pdfMatch = entry.match(/href="([^"]+)" title="pdf"/i);
        return pdfMatch ? pdfMatch[1] : '';
    }

    // Formatar dados dos papers
    formatPapersData(papers, query) {
        let papersInfo = `\n🔬 PESQUISA: ${query}\n📊 RESULTADOS: ${papers.length}\n🏛️  BASE: ArXiv.org (Cornell University)\n\n📚 PAPERS CIENTÍFICOS:`;
        
        papers.slice(0, 5).forEach((paper, index) => {
            const title = paper.title.substring(0, 80) + (paper.title.length > 80 ? '...' : '');
            const summary = paper.summary.substring(0, 200) + (paper.summary.length > 200 ? '...' : '');
            const authors = paper.authors.slice(0, 3).join(', ') + (paper.authors.length > 3 ? ' et al.' : '');
            const publishedDate = paper.published ? new Date(paper.published).toLocaleDateString('pt-BR') : 'Data desconhecida';
            const categories = paper.categories.slice(0, 2).join(', ');
            
            papersInfo += `\n\n📄 [${index + 1}] ${title}`;
            papersInfo += `\n   👨‍🔬 Autores: ${authors || 'Não identificado'}`;
            papersInfo += `\n   📅 Publicado: ${publishedDate}`;
            papersInfo += `\n   🏷️  Categorias: ${categories || 'Não especificado'}`;
            papersInfo += `\n   📝 Resumo: ${summary}`;
            if (paper.pdfUrl) {
                papersInfo += `\n   📁 PDF: ${paper.pdfUrl}`;
            }
            if (paper.id) {
                papersInfo += `\n   🔗 ArXiv: ${paper.id}`;
            }
        });
        
        return boxen(papersInfo, {
            title: chalk.bold.cyan('📚 BASE CIENTÍFICA ARXIV'),
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'cyan'
        });
    }

    // Listar categorias disponíveis
    getAvailableCategories() {
        return {
            // Física
            'physics': 'Física (geral)',
            'astro-ph': 'Astrofísica',
            'cond-mat': 'Matéria Condensada',
            'hep-th': 'Física de Altas Energias - Teoria',
            'nucl-th': 'Física Nuclear - Teoria',
            'quant-ph': 'Física Quântica',
            
            // Matemática
            'math': 'Matemática (geral)',
            'math.AG': 'Geometria Algébrica',
            'math.NT': 'Teoria dos Números',
            'math.ST': 'Estatística',
            
            // Ciência da Computação
            'cs': 'Ciência da Computação (geral)',
            'cs.AI': 'Inteligência Artificial',
            'cs.LG': 'Machine Learning',
            'cs.CV': 'Computer Vision',
            'cs.CL': 'Linguística Computacional',
            'cs.CR': 'Criptografia e Segurança',
            
            // Biologia
            'q-bio': 'Biologia Quantitativa (geral)',
            'q-bio.BM': 'Biomoléculas',
            'q-bio.GN': 'Genômica',
            'q-bio.NC': 'Neurociência',
            
            // Economia
            'econ': 'Economia',
            'q-fin': 'Finanças Quantitativas',
            
            // Estatística
            'stat': 'Estatística (geral)',
            'stat.ML': 'Machine Learning (Estatística)',
            'stat.AP': 'Estatística Aplicada'
        };
    }

    // Exibir categorias disponíveis
    showCategories() {
        const categories = this.getAvailableCategories();
        
        let categoriesInfo = '\n🏷️  CATEGORIAS CIENTÍFICAS DISPONÍVEIS:\n';
        
        Object.entries(categories).forEach(([key, value]) => {
            categoriesInfo += `\n🔬 ${key.padEnd(15)} - ${value}`;
        });
        
        categoriesInfo += '\n\n💡 Use: /papers categoria <código> para buscar por categoria';
        categoriesInfo += '\n💡 Use: /papers autor <nome> para buscar por autor';
        categoriesInfo += '\n💡 Use: /papers recentes [categoria] para ver últimas publicações';
        
        return boxen(categoriesInfo, {
            title: chalk.bold.magenta('📚 GUIA DE CATEGORIAS ARXIV'),
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'magenta'
        });
    }
}

module.exports = ArxivModule;


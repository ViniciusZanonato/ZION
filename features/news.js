const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');

class NewsModule {
    constructor(apiKey = null) {
        this.apiKey = apiKey || process.env.NEWS_API_KEY;
        this.baseUrl = 'https://newsapi.org/v2';
        this.fallbackNews = this.getFallbackNews();
    }

    async getTopHeadlines(country = 'br', category = null, pageSize = 5) {
        const spinner = ora('Carregando últimas notícias...').start();
        
        try {
            if (!this.apiKey) {
                spinner.warn('API Key não configurada. Usando dados simulados.');
                return this.formatFallbackNews();
            }

            let url = `${this.baseUrl}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${this.apiKey}`;
            
            if (category) {
                url += `&category=${category}`;
            }

            const response = await axios.get(url);
            
            if (response.data.status === 'ok' && response.data.articles.length > 0) {
                spinner.succeed('Notícias carregadas com sucesso!');
                return this.formatNewsData(response.data.articles, category || 'principais');
            } else {
                spinner.warn('Nenhuma notícia encontrada. Usando dados simulados.');
                return this.formatFallbackNews();
            }
            
        } catch (error) {
            spinner.fail('Erro ao carregar notícias');
            console.error(chalk.red('Erro na API de notícias:'), error.message);
            return this.formatFallbackNews();
        }
    }

    async searchNews(query, language = 'pt', pageSize = 5) {
        const spinner = ora(`Buscando notícias sobre: ${query}...`).start();
        
        try {
            if (!this.apiKey) {
                spinner.warn('API Key não configurada. Usando dados simulados.');
                return this.formatFallbackNews();
            }

            const url = `${this.baseUrl}/everything?q=${encodeURIComponent(query)}&language=${language}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${this.apiKey}`;
            const response = await axios.get(url);
            
            if (response.data.status === 'ok' && response.data.articles.length > 0) {
                spinner.succeed(`Encontradas ${response.data.articles.length} notícias sobre '${query}'`);
                return this.formatNewsData(response.data.articles, `pesquisa: ${query}`);
            } else {
                spinner.warn('Nenhuma notícia encontrada para a pesquisa.');
                return chalk.yellow(`🔍 Nenhuma notícia encontrada para: '${query}'`);
            }
            
        } catch (error) {
            spinner.fail('Erro ao pesquisar notícias');
            console.error(chalk.red('Erro na pesquisa de notícias:'), error.message);
            return this.formatFallbackNews();
        }
    }

    async getNewsByCategory(category, country = 'br', pageSize = 5) {
        const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
        
        if (!validCategories.includes(category)) {
            return chalk.red(`❌ Categoria inválida. Categorias disponíveis: ${validCategories.join(', ')}`);
        }

        return await this.getTopHeadlines(country, category, pageSize);
    }

    formatNewsData(articles, category) {
        const categoryTranslations = {
            'business': 'negócios',
            'entertainment': 'entretenimento',
            'general': 'geral',
            'health': 'saúde',
            'science': 'ciência',
            'sports': 'esportes',
            'technology': 'tecnologia',
            'principais': 'principais'
        };

        const translatedCategory = categoryTranslations[category] || category;
        
        let newsInfo = `\n${chalk.cyan('📰 ÚLTIMAS NOTÍCIAS')}\n${chalk.yellow(`Categoria: ${translatedCategory.toUpperCase()}`)}\n`;
        
        articles.forEach((article, index) => {
            const title = article.title || 'Título não disponível';
            const description = article.description || 'Descrição não disponível';
            const source = article.source?.name || 'Fonte desconhecida';
            const publishedAt = article.publishedAt 
                ? new Date(article.publishedAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) 
                : 'Data não disponível';
            const url = article.url || '#';

            newsInfo += `\n${chalk.white(`${index + 1}. ${title}`)}`;
            newsInfo += `\n${chalk.gray(`   📅 ${publishedAt} | 🏢 ${source}`)}`;
            newsInfo += `\n${chalk.white(`   ${description.slice(0, 150)}${description.length > 150 ? '...' : ''}`)}`;
            newsInfo += `\n${chalk.blue(`   🔗 ${url}`)}`;
            
            if (index < articles.length - 1) {
                newsInfo += '\n' + chalk.gray('─'.repeat(60));
            }
        });

        return boxen(newsInfo, {
            title: chalk.bold.blue('📰 NOTÍCIAS'),
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'blue'
        });
    }

    formatFallbackNews() {
        return this.formatNewsData(this.fallbackNews, 'simuladas');
    }

    getFallbackNews() {
        const now = new Date();
        return [
            {
                title: "Inteligência Artificial Revoluciona Setor de Tecnologia",
                description: "Novas descobertas em IA generativa estão transformando a maneira como interagimos com a tecnologia, prometendo mudanças significativas em diversos setores.",
                source: { name: "Tech News" },
                publishedAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 min atrás
                url: "https://exemplo.com/ia-revoluciona-tecnologia"
            },
            {
                title: "Mercado Financeiro Apresenta Volatilidade Histórica",
                description: "Analistas apontam fatores geopolíticos e econômicos como principais causadores da instabilidade atual nos mercados globais.",
                source: { name: "Financial Times" },
                publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
                url: "https://exemplo.com/mercado-volatilidade"
            },
            {
                title: "Descoberta Científica Promete Revolucionar Medicina",
                description: "Pesquisadores brasileiros fazem descoberta que pode levar ao desenvolvimento de novos tratamentos para doenças até então incuráveis.",
                source: { name: "Ciência Hoje" },
                publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), // 4h atrás
                url: "https://exemplo.com/descoberta-medicina"
            },
            {
                title: "Sustentabilidade: Empresas Adotam Práticas Verdes",
                description: "Movimento crescente de empresas brasileiras implementando práticas sustentáveis mostra mudança de paradigma no setor corporativo.",
                source: { name: "Eco Brasil" },
                publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), // 6h atrás
                url: "https://exemplo.com/sustentabilidade-empresas"
            },
            {
                title: "Educação Digital Transforma Aprendizado",
                description: "Plataformas educacionais digitais registram crescimento exponencial, mudando a forma como estudantes acessam conhecimento.",
                source: { name: "Educação Online" },
                publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), // 8h atrás
                url: "https://exemplo.com/educacao-digital"
            }
        ];
    }

    async getTrendingTopics(country = 'br') {
        const spinner = ora('Buscando tópicos em alta...').start();
        
        try {
            if (!this.apiKey) {
                spinner.warn('API Key não configurada. Usando dados simulados.');
                return this.formatTrendingTopics();
            }

            // Buscar notícias populares das últimas 24 horas
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateString = yesterday.toISOString().split('T')[0];
            
            const url = `${this.baseUrl}/everything?domains=g1.globo.com,folha.uol.com.br,estadao.com.br&from=${dateString}&sortBy=popularity&pageSize=10&apiKey=${this.apiKey}`;
            const response = await axios.get(url);
            
            if (response.data.status === 'ok' && response.data.articles.length > 0) {
                spinner.succeed('Tópicos em alta carregados!');
                return this.formatTrendingTopics(response.data.articles);
            } else {
                spinner.warn('Não foi possível carregar tópicos em alta.');
                return this.formatTrendingTopics();
            }
            
        } catch (error) {
            spinner.fail('Erro ao carregar tópicos em alta');
            console.error(chalk.red('Erro:'), error.message);
            return this.formatTrendingTopics();
        }
    }

    formatTrendingTopics(articles = null) {
        const topics = articles ? this.extractTopics(articles) : [
            '🤖 Inteligência Artificial',
            '💰 Economia Global',
            '🏥 Saúde Pública',
            '🌱 Sustentabilidade',
            '📚 Educação Digital',
            '🎮 Gaming',
            '🚀 Tecnologia Espacial',
            '🏆 Esportes'
        ];

        let topicsInfo = `\n${chalk.cyan('🔥 TÓPICOS EM ALTA')}\n${chalk.yellow('Os assuntos mais comentados do momento')}\n`;
        
        topics.slice(0, 8).forEach((topic, index) => {
            topicsInfo += `\n${chalk.white(`${index + 1}. ${topic}`)}`;
        });

        return boxen(topicsInfo, {
            title: chalk.bold.red('🔥 TRENDING'),
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'red'
        });
    }

    extractTopics(articles) {
        const keywords = [];
        const commonWords = ['de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem', 'sobre', 'entre', 'até', 'após', 'antes', 'durante', 'e', 'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'brasil', 'país', 'governo', 'presidente', 'estado', 'cidade'];
        
        articles.forEach(article => {
            const title = article.title?.toLowerCase() || '';
            const words = title.split(/\s+/).filter(word => 
                word.length > 3 && 
                !commonWords.includes(word) && 
                !/\d/.test(word)
            );
            keywords.push(...words);
        });

        // Contar frequência e retornar os mais comuns
        const frequency = {};
        keywords.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([word]) => `📰 ${word.charAt(0).toUpperCase() + word.slice(1)}`);
    }

    getAvailableCategories() {
        return {
            'business': 'Negócios',
            'entertainment': 'Entretenimento', 
            'general': 'Geral',
            'health': 'Saúde',
            'science': 'Ciência',
            'sports': 'Esportes',
            'technology': 'Tecnologia'
        };
    }

    getAvailableCountries() {
        return {
            'br': 'Brasil',
            'us': 'Estados Unidos',
            'uk': 'Reino Unido',
            'ca': 'Canadá',
            'au': 'Austrália',
            'de': 'Alemanha',
            'fr': 'França',
            'it': 'Itália',
            'es': 'Espanha',
            'jp': 'Japão'
        };
    }
}

module.exports = NewsModule;


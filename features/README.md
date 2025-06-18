# 🚀 Features do ZION

Esta pasta contém todas as funcionalidades especializadas do chatbot ZION, organizadas por categoria.

## 📁 Estrutura das Funcionalidades

### 🌍 Informações Geográficas e Clima
- **`weather.js`** - Módulo de dados meteorológicos em tempo real
- **`countries.js`** - Database geopolítico mundial
- **`geolocation.js`** - Sistema de geolocalização e mapas
- **`worldtime.js`** - Sincronização temporal global

### 📰 Informações e Notícias
- **`news.js`** - Intelligence global de notícias
- **`arxiv.js`** - Pesquisa em base científica ArXiv

### 🚀 Dados Espaciais e Científicos
- **`nasa.js`** - Acesso aos dados da NASA

### 💰 Dados Financeiros
- **`coingecko.js`** - Dados de criptomoedas
- **`alphaVantage.js`** - Dados de ações e mercado financeiro
- **`fred.js`** - Dados econômicos do Federal Reserve

### 🛠️ APIs de Desenvolvimento
- **`jsonplaceholder.js`** - API de dados simulados para testes

## 🔧 Como usar

### Importação Individual
```javascript
const WeatherModule = require('./features/weather');
const NewsModule = require('./features/news');

const weather = new WeatherModule();
const news = new NewsModule();
```

### Importação via Index
```javascript
const Features = require('./features');

// Inicializar todas as funcionalidades
const features = Features.initializeFeatures();

// Ou importar módulos específicos
const weather = new Features.Weather();
const news = new Features.News();
```

## 📝 Adicionando Novas Funcionalidades

1. Crie o módulo na pasta `features/`
2. Siga o padrão de estrutura de classe dos módulos existentes
3. Adicione a importação no arquivo `index.js`
4. Atualize este README
5. Adicione o módulo no arquivo principal `zion.js`

### Exemplo de Estrutura de Módulo
```javascript
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');

class NovoModulo {
    constructor(apiKey = null) {
        this.apiKey = apiKey || process.env.API_KEY;
        this.baseUrl = 'https://api.exemplo.com';
    }

    async metodoExemplo(parametro) {
        const spinner = ora('Processando...').start();
        
        try {
            // Lógica do método
            const response = await axios.get(`${this.baseUrl}/endpoint`);
            spinner.succeed('Dados obtidos com sucesso!');
            return this.formatarDados(response.data);
        } catch (error) {
            spinner.fail('Erro ao obter dados');
            console.error(chalk.red('Erro:'), error.message);
            return null;
        }
    }

    formatarDados(data) {
        // Formatação dos dados
        return data;
    }
}

module.exports = NovoModulo;
```

## 🔐 Configuração de APIs

Muitas funcionalidades requerem chaves de API. Configure-as no arquivo `.env`:

```env
# Clima
OPENWEATHER_API_KEY=sua_chave_aqui

# Notícias
NEWS_API_KEY=sua_chave_aqui

# NASA
NASA_API_KEY=sua_chave_aqui

# Dados Financeiros
ALPHAVANTAGE_API_KEY=sua_chave_aqui
FRED_API_KEY=sua_chave_aqui
```

## 🎯 Funcionalidades Implementadas

- ✅ Clima e meteorologia
- ✅ Notícias globais
- ✅ Informações de países
- ✅ Dados NASA/espaciais
- ✅ Pesquisa científica (ArXiv)
- ✅ Geolocalização
- ✅ Fuso horário mundial
- ✅ Dados financeiros
- ✅ APIs de desenvolvimento

## 🚀 Funcionalidades Futuras

- 🔄 Integração com redes sociais
- 🔄 Análise de sentimentos
- 🔄 Tradução automática
- 🔄 Reconhecimento de imagens
- 🔄 Análise de documentos

---

**Desenvolvido para o ZION Chatbot Supremo** 🤖


const axios = require('axios');
const chalk = require('chalk');
const Table = require('cli-table3');
const ora = require('ora');
const boxen = require('boxen');
require('dotenv').config();

class AlphaVantageModule {
    constructor() {
        this.apiKey = process.env.ALPHA_VANTAGE_API_KEY; // Insira sua chave de API no .env
        this.baseUrl = 'https://www.alphavantage.co/query';
        this.name = 'Alpha Vantage API';
        this.description = 'Stock, cryptocurrency data and financial information';
    }

    // Verificar se a chave da API está configurada
    checkApiKey() {
        if (!this.apiKey) {
            console.log(chalk.red('⚠️  Falha Crítica: Alpha Vantage API key não configurada.'));
            return false;
        }
        return true;
    }

    // Obter dados de uma ação
    async getStockData(symbol, interval = '5min') {
        if (!this.checkApiKey()) return { success: false, error: 'API key missing' };

        const spinner = ora(chalk.cyan(`📈 Obtendo dados da ação: ${symbol.toUpperCase()}...`)).start();

        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    function: 'TIME_SERIES_INTRADAY',
                    symbol,
                    interval,
                    apikey: this.apiKey
                }
            });

            const timeSeriesKey = `Time Series (${interval})`;
            const data = response.data[timeSeriesKey];

            if (data) {
                spinner.succeed(chalk.green(`📊 Dados obtidos para: ${symbol.toUpperCase()}`));
                this.displayStockData(symbol, data);
                return { success: true, data };
            } else {
                throw new Error('Dados não encontrados');
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha ao obter dados'));
            console.log(chalk.red(`⚠️  Erro: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    // Exibir dados de ações formatados
    displayStockData(symbol, data) {
        console.log(chalk.cyan.bold(`\n📈 Dados da Ação: ${symbol.toUpperCase()}`));
        console.log(chalk.gray('═'.repeat(50)));

        const table = new Table({
            head: [
                chalk.cyan.bold('Horário'),
                chalk.cyan.bold('Abertura'),
                chalk.cyan.bold('Máximo'),
                chalk.cyan.bold('Mínimo'),
                chalk.cyan.bold('Fechamento')
            ],
            colWidths: [20, 10, 10, 10, 10]
        });

        let count = 0;
        for (const [time, values] of Object.entries(data)) {
            if (count++ >= 5) break; // Mostrar apenas os 5 mais recentes
            table.push([
                chalk.gray(time),
                chalk.green(values['1. open']),
                chalk.red(values['2. high']),
                chalk.blue(values['3. low']),
                chalk.yellow(values['4. close'])
            ]);
        }

        console.log(table.toString());
        console.log(chalk.gray('═'.repeat(50)));
    }

    // Obter dados de criptomoeda
    async getCryptoData(symbol, market = 'USD') {
        if (!this.checkApiKey()) return { success: false, error: 'API key missing' };

        const spinner = ora(chalk.cyan(`💰 Obtendo dados de criptomoeda para: ${symbol.toUpperCase()}...`)).start();

        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    function: 'DIGITAL_CURRENCY_INTRADAY',
                    symbol,
                    market,
                    apikey: this.apiKey
                }
            });

            const data = response.data['Time Series (Digital Currency Intraday)'];

            if (data) {
                spinner.succeed(chalk.green(`💎 Dados obtidos para: ${symbol.toUpperCase()}`));
                this.displayCryptoData(symbol, data, market);
                return { success: true, data };
            } else {
                throw new Error('Dados não encontrados');
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha ao obter dados'));
            console.log(chalk.red(`⚠️  Erro: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    // Exibir dados de criptomoeda formatados
    displayCryptoData(symbol, data, market) {
        console.log(chalk.cyan.bold(`\n💰 Dados de Criptomoeda: ${symbol.toUpperCase()}`));
        console.log(chalk.gray('═'.repeat(60)));

        const table = new Table({
            head: [
                chalk.cyan.bold('Horário'),
                chalk.cyan.bold('Preço (USD)'),
                chalk.cyan.bold('Máximo'),
                chalk.cyan.bold('Mínimo'),
                chalk.cyan.bold('Volume')
            ],
            colWidths: [20, 15, 10, 10, 15]
        });

        let count = 0;
        for (const [time, values] of Object.entries(data)) {
            if (count++ >= 5) break; // Mostrar apenas os 5 mais recentes
            table.push([
                chalk.gray(time),
                chalk.green(values[`1a. price (${market})`]),
                chalk.red(values[`2a. high (${market})`]),
                chalk.blue(values[`3a. low (${market})`]),
                chalk.yellow(values['5. volume'])
            ]);
        }

        console.log(table.toString());
        console.log(chalk.gray('═'.repeat(60)));
    }

    // Obter dados setoriais
    async getSectorPerformance() {
        if (!this.checkApiKey()) return { success: false, error: 'API key missing' };

        const spinner = ora(chalk.cyan('🌐 Obtendo dados de performance setorial...')).start();

        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    function: 'SECTOR',
                    apikey: this.apiKey
                }
            });

            const data = response.data['Rank A: Real-Time Performance'];

            if (data) {
                spinner.succeed(chalk.green('📊 Performance setorial obtida'));
                this.displaySectorPerformance(data);
                return { success: true, data };
            } else {
                throw new Error('Dados não encontrados');
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha ao obter dados'));            
            console.log(chalk.red(`⚠️  Erro: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    // Exibir dados de performance setorial
    displaySectorPerformance(data) {
        console.log(chalk.cyan.bold('\n🌐 Performance Setorial'));
        console.log(chalk.gray('═'.repeat(80)));

        const table = new Table({
            head: [
                chalk.cyan.bold('Setor'),
                chalk.cyan.bold('Desempenho')
            ],
            colWidths: [40, 20]
        });

        for (const [sector, performance] of Object.entries(data)) {
            table.push([
                chalk.white(sector),
                chalk.yellow(performance)
            ]);
        }

        console.log(table.toString());
        console.log(chalk.gray('═'.repeat(80)));
    }

    // Menu de demonstração
    async demonstration() {
        console.log(chalk.cyan.bold('\n🏦 ALPHA VANTAGE API - DEMONSTRAÇÃO'));
        console.log(chalk.gray('═'.repeat(60)));

        try {
            // 1. Dados de uma ação
            console.log(chalk.yellow('\n1. Dados Intraday de Ação: IBM...'));
            await this.getStockData('IBM');

            // 2. Dados de criptomoeda
            console.log(chalk.yellow('\n2. Dados Intraday de Criptomoeda: BTC...'));
            await this.getCryptoData('BTC');

            // 3. Dados setoriais
            console.log(chalk.yellow('\n3. Performance Setorial...'));
            await this.getSectorPerformance();

        } catch (error) {
            console.log(chalk.red('Erro na demonstração:', error.message));
        }

        console.log(chalk.green('\n✅ Demonstração Alpha Vantage concluída!'));
        console.log(chalk.gray('═'.repeat(60)));
    }
}

module.exports = AlphaVantageModule;

// Exemplo de uso
if (require.main === module) {
    const alphaVantage = new AlphaVantageModule();
    alphaVantage.demonstration();
}


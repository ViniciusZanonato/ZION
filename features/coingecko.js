const axios = require('axios');
const chalk = require('chalk');
const Table = require('cli-table3');
const ora = require('ora');
const boxen = require('boxen');

class CoinGeckoModule {
    constructor() {
        this.baseUrl = 'https://api.coingecko.com/api/v3';
        this.name = 'CoinGecko API';
        this.description = 'Cryptocurrency market data and analytics';
    }

    // Obter informações de preço de uma criptomoeda
    async getCoinPrice(coinId, vsCurrency = 'usd') {
        const spinner = ora(chalk.cyan(`💰 Obtendo dados de preço para ${coinId.toUpperCase()}...`)).start();
        
        try {
            const response = await axios.get(`${this.baseUrl}/simple/price`, {
                params: {
                    ids: coinId,
                    vs_currencies: vsCurrency,
                    include_24hr_change: true,
                    include_24hr_vol: true,
                    include_market_cap: true,
                    include_last_updated_at: true
                }
            });

            if (response.data[coinId]) {
                const data = response.data[coinId];
                spinner.succeed(chalk.green(`💎 Dados obtidos para ${coinId.toUpperCase()}`));
                
                this.displayCoinPrice(coinId, data, vsCurrency);
                return { success: true, data };
            } else {
                spinner.fail(chalk.red('❌ Criptomoeda não encontrada'));
                return { success: false, error: 'Coin not found' };
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha ao obter dados'));
            console.log(chalk.red(`⚠️  Erro: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    // Exibir dados de preço formatados
    displayCoinPrice(coinId, data, currency) {
        const currencySymbol = this.getCurrencySymbol(currency);
        const price = data[currency];
        const change24h = data[`${currency}_24h_change`];
        const volume24h = data[`${currency}_24h_vol`];
        const marketCap = data[`${currency}_market_cap`];
        const lastUpdated = new Date(data.last_updated_at * 1000);

        console.log(boxen(
            chalk.cyan.bold(`💰 ${coinId.toUpperCase()} MARKET DATA\n`) +
            chalk.white(`📈 Preço: ${currencySymbol}${this.formatNumber(price)}\n`) +
            chalk.white(`📊 Variação 24h: ${change24h >= 0 ? chalk.green('+' + change24h.toFixed(2) + '%') : chalk.red(change24h.toFixed(2) + '%')}\n`) +
            chalk.white(`💹 Volume 24h: ${currencySymbol}${this.formatNumber(volume24h)}\n`) +
            chalk.white(`🏦 Market Cap: ${currencySymbol}${this.formatNumber(marketCap)}\n`) +
            chalk.gray(`🕒 Atualizado: ${lastUpdated.toLocaleString('pt-BR')}`),
            {
                padding: 1,
                borderColor: 'cyan',
                title: '🔹 COINGECKO DATA'
            }
        ));
        console.log();
    }

    // Obter top criptomoedas por market cap
    async getTopCoins(limit = 10, vsCurrency = 'usd') {
        const spinner = ora(chalk.cyan(`🚀 Obtendo top ${limit} criptomoedas...`)).start();
        
        try {
            const response = await axios.get(`${this.baseUrl}/coins/markets`, {
                params: {
                    vs_currency: vsCurrency,
                    order: 'market_cap_desc',
                    per_page: limit,
                    page: 1,
                    sparkline: false,
                    price_change_percentage: '24h'
                }
            });

            spinner.succeed(chalk.green(`📊 Top ${limit} criptomoedas obtidas`));
            this.displayTopCoins(response.data, vsCurrency);
            return { success: true, data: response.data };
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha ao obter ranking'));
            console.log(chalk.red(`⚠️  Erro: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    // Exibir top criptomoedas em tabela
    displayTopCoins(coins, currency) {
        const currencySymbol = this.getCurrencySymbol(currency);
        
        console.log(chalk.cyan.bold('\n🏆 TOP CRIPTOMOEDAS POR MARKET CAP'));
        console.log(chalk.gray('═'.repeat(80)));

        const table = new Table({
            head: [
                chalk.cyan.bold('#'),
                chalk.cyan.bold('Nome'),
                chalk.cyan.bold('Símbolo'),
                chalk.cyan.bold('Preço'),
                chalk.cyan.bold('24h %'),
                chalk.cyan.bold('Market Cap')
            ],
            colWidths: [4, 15, 8, 12, 10, 15]
        });

        coins.forEach((coin, index) => {
            const priceChange = coin.price_change_percentage_24h || 0;
            const changeColor = priceChange >= 0 ? chalk.green : chalk.red;
            const changeSymbol = priceChange >= 0 ? '+' : '';

            table.push([
                chalk.gray(coin.market_cap_rank || index + 1),
                chalk.white(coin.name),
                chalk.yellow(coin.symbol.toUpperCase()),
                chalk.white(`${currencySymbol}${this.formatNumber(coin.current_price)}`),
                changeColor(`${changeSymbol}${priceChange.toFixed(2)}%`),
                chalk.blue(`${currencySymbol}${this.formatNumber(coin.market_cap)}`)
            ]);
        });

        console.log(table.toString());
        console.log(chalk.gray('═'.repeat(80)));
        console.log();
    }

    // Buscar criptomoeda por nome ou símbolo
    async searchCoin(query) {
        const spinner = ora(chalk.cyan(`🔍 Buscando: "${query}"...`)).start();
        
        try {
            const response = await axios.get(`${this.baseUrl}/search`, {
                params: { query }
            });

            const coins = response.data.coins.slice(0, 10);
            
            if (coins.length > 0) {
                spinner.succeed(chalk.green(`🎯 ${coins.length} resultados encontrados`));
                this.displaySearchResults(coins);
                return { success: true, data: coins };
            } else {
                spinner.warn(chalk.yellow('❓ Nenhum resultado encontrado'));
                return { success: false, error: 'No results found' };
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha na busca'));
            console.log(chalk.red(`⚠️  Erro: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    // Exibir resultados de busca
    displaySearchResults(coins) {
        console.log(chalk.cyan.bold('\n🔍 RESULTADOS DA BUSCA'));
        console.log(chalk.gray('═'.repeat(60)));

        const table = new Table({
            head: [
                chalk.cyan.bold('ID'),
                chalk.cyan.bold('Nome'),
                chalk.cyan.bold('Símbolo'),
                chalk.cyan.bold('Rank')
            ],
            colWidths: [20, 20, 10, 8]
        });

        coins.forEach(coin => {
            table.push([
                chalk.blue(coin.id),
                chalk.white(coin.name),
                chalk.yellow(coin.symbol.toUpperCase()),
                chalk.gray(coin.market_cap_rank || 'N/A')
            ]);
        });

        console.log(table.toString());
        console.log(chalk.gray('═'.repeat(60)));
        console.log(chalk.gray('💡 Use o ID para obter dados detalhados: /crypto <id>'));
        console.log();
    }

    // Obter dados de mercado global
    async getGlobalMarketData() {
        const spinner = ora(chalk.cyan('🌍 Obtendo dados globais do mercado cripto...')).start();
        
        try {
            const response = await axios.get(`${this.baseUrl}/global`);
            const globalData = response.data.data;

            spinner.succeed(chalk.green('📈 Dados globais obtidos'));
            this.displayGlobalData(globalData);
            return { success: true, data: globalData };
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha ao obter dados globais'));
            console.log(chalk.red(`⚠️  Erro: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    // Exibir dados de mercado global
    displayGlobalData(data) {
        const totalMarketCap = data.total_market_cap.usd;
        const totalVolume = data.total_volume.usd;
        const marketCapChange = data.market_cap_change_percentage_24h_usd;
        const btcDominance = data.market_cap_percentage.btc;
        const ethDominance = data.market_cap_percentage.eth;

        console.log(boxen(
            chalk.cyan.bold('🌍 MERCADO GLOBAL DE CRIPTOMOEDAS\n') +
            chalk.white(`💰 Market Cap Total: $${this.formatNumber(totalMarketCap)}\n`) +
            chalk.white(`📊 Variação 24h: ${marketCapChange >= 0 ? chalk.green('+' + marketCapChange.toFixed(2) + '%') : chalk.red(marketCapChange.toFixed(2) + '%')}\n`) +
            chalk.white(`💹 Volume 24h: $${this.formatNumber(totalVolume)}\n`) +
            chalk.white(`₿ Dominância BTC: ${btcDominance.toFixed(1)}%\n`) +
            chalk.white(`Ξ Dominância ETH: ${ethDominance.toFixed(1)}%\n`) +
            chalk.white(`🪙 Moedas Ativas: ${data.active_cryptocurrencies.toLocaleString()}\n`) +
            chalk.white(`🏪 Exchanges: ${data.markets.toLocaleString()}`),
            {
                padding: 1,
                borderColor: 'cyan',
                title: '🔹 GLOBAL CRYPTO DATA'
            }
        ));
        console.log();
    }

    // Obter histórico de preços
    async getCoinHistory(coinId, days = 7, vsCurrency = 'usd') {
        const spinner = ora(chalk.cyan(`📈 Obtendo histórico de ${days} dias para ${coinId.toUpperCase()}...`)).start();
        
        try {
            const response = await axios.get(`${this.baseUrl}/coins/${coinId}/market_chart`, {
                params: {
                    vs_currency: vsCurrency,
                    days: days,
                    interval: days <= 1 ? 'hourly' : 'daily'
                }
            });

            spinner.succeed(chalk.green(`📊 Histórico de ${days} dias obtido`));
            this.displayPriceHistory(coinId, response.data, vsCurrency, days);
            return { success: true, data: response.data };
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha ao obter histórico'));
            console.log(chalk.red(`⚠️  Erro: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    // Exibir histórico de preços
    displayPriceHistory(coinId, data, currency, days) {
        const prices = data.prices;
        const currencySymbol = this.getCurrencySymbol(currency);
        
        console.log(chalk.cyan.bold(`\n📈 HISTÓRICO DE PREÇOS - ${coinId.toUpperCase()} (${days} dias)`));
        console.log(chalk.gray('═'.repeat(60)));

        const table = new Table({
            head: [
                chalk.cyan.bold('Data'),
                chalk.cyan.bold('Preço'),
                chalk.cyan.bold('Variação')
            ],
            colWidths: [20, 15, 12]
        });

        for (let i = 0; i < Math.min(prices.length, 10); i++) {
            const current = prices[i];
            const previous = i > 0 ? prices[i - 1] : null;
            
            const date = new Date(current[0]).toLocaleDateString('pt-BR');
            const price = current[1];
            
            let change = '';
            if (previous) {
                const changePercent = ((price - previous[1]) / previous[1]) * 100;
                const changeColor = changePercent >= 0 ? chalk.green : chalk.red;
                const changeSymbol = changePercent >= 0 ? '+' : '';
                change = changeColor(`${changeSymbol}${changePercent.toFixed(2)}%`);
            }

            table.push([
                chalk.gray(date),
                chalk.white(`${currencySymbol}${this.formatNumber(price)}`),
                change
            ]);
        }

        console.log(table.toString());
        console.log(chalk.gray('═'.repeat(60)));
        console.log();
    }

    // Utilitários
    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    }

    getCurrencySymbol(currency) {
        const symbols = {
            'usd': '$',
            'eur': '€',
            'gbp': '£',
            'jpy': '¥',
            'brl': 'R$'
        };
        return symbols[currency.toLowerCase()] || currency.toUpperCase() + ' ';
    }

    // Menu de demonstração
    async demonstration() {
        console.log(chalk.cyan.bold('\n🚀 COINGECKO API - DEMONSTRAÇÃO'));
        console.log(chalk.gray('═'.repeat(60)));

        try {
            // 1. Top 5 criptomoedas
            console.log(chalk.yellow('\n1. Top 5 Criptomoedas por Market Cap...'));
            await this.getTopCoins(5);

            // 2. Dados do Bitcoin
            console.log(chalk.yellow('\n2. Dados detalhados do Bitcoin...'));
            await this.getCoinPrice('bitcoin');

            // 3. Dados globais do mercado
            console.log(chalk.yellow('\n3. Dados globais do mercado...'));
            await this.getGlobalMarketData();

        } catch (error) {
            console.log(chalk.red('Erro na demonstração:', error.message));
        }

        console.log(chalk.green('\n✅ Demonstração CoinGecko concluída!'));
        console.log(chalk.gray('═'.repeat(60)));
    }
}

module.exports = CoinGeckoModule;

// Exemplo de uso
if (require.main === module) {
    const coinGecko = new CoinGeckoModule();
    coinGecko.demonstration();
}


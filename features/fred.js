const axios = require('axios');
const chalk = require('chalk');
const Table = require('cli-table3');
const ora = require('ora');
const boxen = require('boxen');
require('dotenv').config();

class FREDModule {
    constructor() {
        this.apiKey = process.env.FRED_API_KEY; // Insira sua chave de API no .env
        this.baseUrl = 'https://api.stlouisfed.org/fred';
        this.name = 'FRED Economic Data API';
        this.description = 'U.S. economic data and news releases from the Federal Reserve';
    }

    // Verificar se a chave da API está configurada
    checkApiKey() {
        if (!this.apiKey) {
            console.log(chalk.red('⚠️  Falha Crítica: FRED API key não configurada.'));
            return false;
        }
        return true;
    }

    // Obter dados de série temporal
    async getEconomicData(seriesId, startDate, endDate) {
        if (!this.checkApiKey()) return { success: false, error: 'API key missing' };

        const spinner = ora(chalk.cyan(`📊 Obtendo dados econômicos para: ${seriesId}...`)).start();

        try {
            const response = await axios.get(`${this.baseUrl}/series/observations`, {
                params: {
                    series_id: seriesId,
                    api_key: this.apiKey,
                    file_type: 'json',
                    observation_start: startDate,
                    observation_end: endDate
                }
            });

            const data = response.data.observations;

            if (data) {
                spinner.succeed(chalk.green(`✅ Dados obtidos para: ${seriesId}`));
                this.displayEconomicData(seriesId, data);
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

    // Exibir dados econômicos formatados
    displayEconomicData(seriesId, data) {
        console.log(chalk.cyan.bold(`\n📈 Dados Econômicos: ${seriesId}`));
        console.log(chalk.gray('═'.repeat(70)));

        const table = new Table({
            head: [
                chalk.cyan.bold('Data'),
                chalk.cyan.bold('Valor')
            ],
            colWidths: [20, 10]
        });

        data.slice(0, 10).forEach(item => {
            table.push([
                chalk.gray(item.date),
                chalk.white(item.value)
            ]);
        });

        console.log(table.toString());
        console.log(chalk.gray('═'.repeat(70)));
        console.log();
    }

    // Obter categorias econômicas
    async getCategories(parentId = 0) {
        if (!this.checkApiKey()) return { success: false, error: 'API key missing' };

        const spinner = ora(chalk.cyan('🌐 Obtendo categorias econômicas...')).start();

        try {
            const response = await axios.get(`${this.baseUrl}/category`, {
                params: {
                    api_key: this.apiKey,
                    file_type: 'json',
                    category_id: parentId
                }
            });

            const categories = response.data.categories;

            if (categories) {
                spinner.succeed(chalk.green('✅ Categorias econômicas obtidas'));
                this.displayCategories(categories);
                return { success: true, data: categories };
            } else {
                throw new Error('Dados não encontrados');
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha ao obter categorias'));
            console.log(chalk.red(`⚠️  Erro: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    // Exibir categorias econômicas formatadas
    displayCategories(categories) {
        console.log(chalk.cyan.bold('\n🌐 Categorias Econômicas'));
        console.log(chalk.gray('═'.repeat(50)));

        const table = new Table({
            head: [
                chalk.cyan.bold('ID'),
                chalk.cyan.bold('Nome')
            ],
            colWidths: [10, 30]
        });

        categories.forEach(category => {
            table.push([
                chalk.blue(category.id),
                chalk.white(category.name)
            ]);
        });

        console.log(table.toString());
        console.log(chalk.gray('═'.repeat(50)));
        console.log();
    }

    // Obter lançamentos econômicos
    async getReleases(limit = 5) {
        if (!this.checkApiKey()) return { success: false, error: 'API key missing' };

        const spinner = ora(chalk.cyan('📅 Obtendo lançamentos econômicos...')).start();

        try {
            const response = await axios.get(`${this.baseUrl}/releases`, {
                params: {
                    api_key: this.apiKey,
                    file_type: 'json'
                }
            });

            const releases = response.data.releases;

            if (releases) {
                spinner.succeed(chalk.green('✅ Lançamentos econômicos obtidos'));
                this.displayReleases(releases, limit);
                return { success: true, data: releases };
            } else {
                throw new Error('Dados não encontrados');
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha ao obter lançamentos'));
            console.log(chalk.red(`⚠️  Erro: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    // Exibir lançamentos econômicos formatados
    displayReleases(releases, limit) {
        console.log(chalk.cyan.bold('\n📅 Lançamentos Econômicos'));
        console.log(chalk.gray('═'.repeat(70)));

        const table = new Table({
            head: [
                chalk.cyan.bold('ID'),
                chalk.cyan.bold('Nome'),
                chalk.cyan.bold('Data')
            ],
            colWidths: [10, 40, 15]
        });

        releases.slice(0, limit).forEach(release => {
            table.push([
                chalk.blue(release.id),
                chalk.white(release.name),
                chalk.gray(new Date(release.press_release_date).toLocaleDateString('pt-BR'))
            ]);
        });

        console.log(table.toString());
        console.log(chalk.gray('═'.repeat(70)));
        console.log();
    }

    // Menu de demonstração
    async demonstration() {
        console.log(chalk.cyan.bold('\n🏦 FRED API - DEMONSTRAÇÃO'));
        console.log(chalk.gray('═'.repeat(60)));

        try {
            // 1. Obter lançamentos econômicos
            console.log(chalk.yellow('\n1. Lançamentos Econômicos Recentes...'));
            await this.getReleases(5);

            // 2. Obter dados do PIB
            console.log(chalk.yellow('\n2. Dados do PIB dos EUA (últimos 10)...'));
            await this.getEconomicData('GDP', '2020-01-01', '2025-01-01');

            // 3. Obter categorias econômicas
            console.log(chalk.yellow('\n3. Categorias Econômicas...'));
            await this.getCategories();

        } catch (error) {
            console.log(chalk.red('Erro na demonstração:', error.message));
        }

        console.log(chalk.green('\n✅ Demonstração FRED concluída!'));
        console.log(chalk.gray('═'.repeat(60)));
    }
}

module.exports = FREDModule;

// Exemplo de uso
if (require.main === module) {
    const fred = new FREDModule();
    fred.demonstration();
}


const axios = require('axios');
const chalk = require('chalk');
const Table = require('cli-table3');
const boxen = require('boxen');
const ora = require('ora');

class CountriesModule {
    constructor() {
        this.baseUrl = 'https://restcountries.com/v3.1';
        this.fallbackData = {
            name: { common: 'Brasil', official: 'República Federativa do Brasil' },
            capital: ['Brasília'],
            population: 215313498,
            area: 8515767,
            region: 'Americas',
            subregion: 'South America',
            languages: { por: 'Portuguese' },
            currencies: { BRL: { name: 'Brazilian real', symbol: 'R$' } },
            timezones: ['UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00'],
            borders: ['ARG', 'BOL', 'COL', 'GUF', 'GUY', 'PRY', 'PER', 'SUR', 'URY', 'VEN'],
            flag: '🇧🇷',
            maps: { googleMaps: 'https://goo.gl/maps/BzwUBMZUQJgxKghx8' }
        };
    }

    // Buscar país por nome
    async getCountryByName(countryName) {
        const spinner = ora(chalk.blue(`🌍 Analisando dados geopolíticos: ${countryName}...`)).start();
        
        try {
            const response = await axios.get(`${this.baseUrl}/name/${encodeURIComponent(countryName)}?fullText=false`);
            const countries = response.data;
            
            if (countries && countries.length > 0) {
                spinner.succeed(chalk.green('✅ Dados geopolíticos obtidos com sucesso'));
                return this.formatCountryInfo(countries[0]);
            } else {
                spinner.warn(chalk.yellow('⚠️ País não encontrado'));
                return null;
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha na consulta geopolítica'));
            console.log(chalk.red(`⚠️ Erro: ${error.message}`));
            console.log(chalk.gray('   Retornando dados de emergência...'));
            return this.formatCountryInfo(this.fallbackData);
        }
    }

    // Buscar países por região
    async getCountriesByRegion(region) {
        const spinner = ora(chalk.blue(`🌎 Mapeando região: ${region}...`)).start();
        
        try {
            const response = await axios.get(`${this.baseUrl}/region/${encodeURIComponent(region)}`);
            const countries = response.data;
            
            if (countries && countries.length > 0) {
                spinner.succeed(chalk.green(`✅ ${countries.length} países encontrados na região`));
                return this.formatRegionInfo(countries, region);
            } else {
                spinner.warn(chalk.yellow('⚠️ Região não encontrada'));
                return null;
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha no mapeamento regional'));
            console.log(chalk.red(`⚠️ Erro: ${error.message}`));
            return null;
        }
    }

    // Buscar países por código de moeda
    async getCountriesByCurrency(currencyCode) {
        const spinner = ora(chalk.blue(`💰 Analisando países com moeda: ${currencyCode}...`)).start();
        
        try {
            const response = await axios.get(`${this.baseUrl}/currency/${encodeURIComponent(currencyCode)}`);
            const countries = response.data;
            
            if (countries && countries.length > 0) {
                spinner.succeed(chalk.green(`✅ ${countries.length} países encontrados`));
                return this.formatCurrencyInfo(countries, currencyCode);
            } else {
                spinner.warn(chalk.yellow('⚠️ Moeda não encontrada'));
                return null;
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha na análise monetária'));
            console.log(chalk.red(`⚠️ Erro: ${error.message}`));
            return null;
        }
    }

    // Buscar países por idioma
    async getCountriesByLanguage(language) {
        const spinner = ora(chalk.blue(`🗣️ Mapeando países que falam: ${language}...`)).start();
        
        try {
            const response = await axios.get(`${this.baseUrl}/lang/${encodeURIComponent(language)}`);
            const countries = response.data;
            
            if (countries && countries.length > 0) {
                spinner.succeed(chalk.green(`✅ ${countries.length} países encontrados`));
                return this.formatLanguageInfo(countries, language);
            } else {
                spinner.warn(chalk.yellow('⚠️ Idioma não encontrado'));
                return null;
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha no mapeamento linguístico'));
            console.log(chalk.red(`⚠️ Erro: ${error.message}`));
            return null;
        }
    }

    // Comparar dois países
    async compareCountries(country1, country2) {
        const spinner = ora(chalk.blue(`⚖️ Comparando: ${country1} vs ${country2}...`)).start();
        
        try {
            const [response1, response2] = await Promise.all([
                axios.get(`${this.baseUrl}/name/${encodeURIComponent(country1)}?fullText=false`),
                axios.get(`${this.baseUrl}/name/${encodeURIComponent(country2)}?fullText=false`)
            ]);
            
            const data1 = response1.data[0];
            const data2 = response2.data[0];
            
            if (data1 && data2) {
                spinner.succeed(chalk.green('✅ Análise comparativa concluída'));
                return this.formatComparison(data1, data2);
            } else {
                spinner.warn(chalk.yellow('⚠️ Um ou ambos países não encontrados'));
                return null;
            }
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha na análise comparativa'));
            console.log(chalk.red(`⚠️ Erro: ${error.message}`));
            return null;
        }
    }

    // Listar todos os países de uma região com resumo
    async listCountriesSummary(region = null) {
        const url = region ? `${this.baseUrl}/region/${encodeURIComponent(region)}` : `${this.baseUrl}/all`;
        const searchText = region ? `região ${region}` : 'mundo';
        const spinner = ora(chalk.blue(`🌍 Catalogando países da ${searchText}...`)).start();
        
        try {
            const response = await axios.get(url);
            const countries = response.data;
            
            // Limitar a 50 países para não sobrecarregar
            const limitedCountries = countries.slice(0, 50);
            
            spinner.succeed(chalk.green(`✅ ${limitedCountries.length} países catalogados`));
            return this.formatCountriesList(limitedCountries, region);
        } catch (error) {
            spinner.fail(chalk.red('❌ Falha no processo de catalogação'));
            console.log(chalk.red(`⚠️ Erro: ${error.message}`));
            return null;
        }
    }

    // Formatação das informações do país
    formatCountryInfo(country) {
        const name = country.name.common;
        const officialName = country.name.official;
        const capitals = country.capital ? country.capital.join(', ') : 'N/A';
        const population = country.population ? country.population.toLocaleString('pt-BR') : 'N/A';
        const area = country.area ? `${country.area.toLocaleString('pt-BR')} km²` : 'N/A';
        const region = country.region || 'N/A';
        const subregion = country.subregion || 'N/A';
        const flag = country.flag || '🏳️';
        
        // Idiomas
        const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
        
        // Moedas
        let currencies = 'N/A';
        if (country.currencies) {
            currencies = Object.entries(country.currencies)
                .map(([code, info]) => `${info.name} (${info.symbol || code})`)
                .join(', ');
        }
        
        // Fusos horários
        const timezones = country.timezones ? country.timezones.slice(0, 3).join(', ') : 'N/A';
        
        // Países vizinhos
        const borders = country.borders ? `${country.borders.length} países` : 'Sem fronteiras terrestres';
        
        const info = `
${flag} ${chalk.bold.blue(name)}
${chalk.gray('Nome Oficial:')} ${officialName}

${chalk.yellow('📍 LOCALIZAÇÃO')}
${chalk.gray('Capital:')} ${capitals}
${chalk.gray('Região:')} ${region}
${chalk.gray('Sub-região:')} ${subregion}

${chalk.yellow('📊 ESTATÍSTICAS')}
${chalk.gray('População:')} ${population}
${chalk.gray('Área:')} ${area}
${chalk.gray('Densidade:')} ${country.population && country.area ? 
            `${Math.round(country.population / country.area).toLocaleString('pt-BR')} hab/km²` : 'N/A'}

${chalk.yellow('🗣️ CULTURA')}
${chalk.gray('Idiomas:')} ${languages}

${chalk.yellow('💰 ECONOMIA')}
${chalk.gray('Moedas:')} ${currencies}

${chalk.yellow('⏰ FUSO HORÁRIO')}
${chalk.gray('Principais:')} ${timezones}

${chalk.yellow('🌐 GEOPOLÍTICA')}
${chalk.gray('Fronteiras:')} ${borders}`;
        
        return boxen(info, {
            title: `${flag} ANÁLISE GEOPOLÍTICA`,
            padding: 1,
            borderColor: 'blue',
            borderStyle: 'round'
        });
    }

    // Formatação das informações regionais
    formatRegionInfo(countries, region) {
        const totalPopulation = countries.reduce((sum, country) => sum + (country.population || 0), 0);
        const totalArea = countries.reduce((sum, country) => sum + (country.area || 0), 0);
        const countriesCount = countries.length;
        
        // Top 10 países por população
        const topByPopulation = countries
            .filter(c => c.population)
            .sort((a, b) => b.population - a.population)
            .slice(0, 10);
        
        let output = boxen(
            `🌍 ${chalk.bold.blue(region.toUpperCase())}\n` +
            `${chalk.gray('Países:')} ${countriesCount}\n` +
            `${chalk.gray('População Total:')} ${totalPopulation.toLocaleString('pt-BR')}\n` +
            `${chalk.gray('Área Total:')} ${totalArea.toLocaleString('pt-BR')} km²\n` +
            `${chalk.gray('Densidade Média:')} ${Math.round(totalPopulation / totalArea).toLocaleString('pt-BR')} hab/km²`,
            {
                title: '🌎 ANÁLISE REGIONAL',
                padding: 1,
                borderColor: 'blue'
            }
        );
        
        // Tabela dos países mais populosos
        const table = new Table({
            head: [chalk.blue('País'), chalk.blue('Capital'), chalk.blue('População'), chalk.blue('Área (km²)')],
            colWidths: [20, 15, 15, 15]
        });
        
        topByPopulation.forEach(country => {
            table.push([
                `${country.flag || '🏳️'} ${country.name.common}`,
                country.capital ? country.capital[0] : 'N/A',
                country.population ? country.population.toLocaleString('pt-BR') : 'N/A',
                country.area ? country.area.toLocaleString('pt-BR') : 'N/A'
            ]);
        });
        
        output += '\n\n' + chalk.yellow('📊 TOP PAÍSES POR POPULAÇÃO') + '\n' + table.toString();
        
        return output;
    }

    // Formatação das informações de moeda
    formatCurrencyInfo(countries, currencyCode) {
        const table = new Table({
            head: [chalk.blue('País'), chalk.blue('Nome da Moeda'), chalk.blue('Símbolo'), chalk.blue('População')],
            colWidths: [20, 20, 10, 15]
        });
        
        countries.slice(0, 15).forEach(country => {
            const currency = country.currencies[currencyCode];
            table.push([
                `${country.flag || '🏳️'} ${country.name.common}`,
                currency.name || currencyCode,
                currency.symbol || 'N/A',
                country.population ? country.population.toLocaleString('pt-BR') : 'N/A'
            ]);
        });
        
        const totalPopulation = countries.reduce((sum, country) => sum + (country.population || 0), 0);
        
        let output = boxen(
            `💰 ${chalk.bold.blue(currencyCode.toUpperCase())}\n` +
            `${chalk.gray('Países que usam:')} ${countries.length}\n` +
            `${chalk.gray('População Total:')} ${totalPopulation.toLocaleString('pt-BR')}`,
            {
                title: '💱 ANÁLISE MONETÁRIA',
                padding: 1,
                borderColor: 'blue'
            }
        );
        
        output += '\n\n' + table.toString();
        
        return output;
    }

    // Formatação das informações de idioma
    formatLanguageInfo(countries, language) {
        const table = new Table({
            head: [chalk.blue('País'), chalk.blue('Capital'), chalk.blue('População'), chalk.blue('Região')],
            colWidths: [20, 15, 15, 15]
        });
        
        countries.slice(0, 15).forEach(country => {
            table.push([
                `${country.flag || '🏳️'} ${country.name.common}`,
                country.capital ? country.capital[0] : 'N/A',
                country.population ? country.population.toLocaleString('pt-BR') : 'N/A',
                country.region || 'N/A'
            ]);
        });
        
        const totalPopulation = countries.reduce((sum, country) => sum + (country.population || 0), 0);
        
        let output = boxen(
            `🗣️ ${chalk.bold.blue(language.toUpperCase())}\n` +
            `${chalk.gray('Países que falam:')} ${countries.length}\n` +
            `${chalk.gray('População Total:')} ${totalPopulation.toLocaleString('pt-BR')}`,
            {
                title: '🌐 ANÁLISE LINGUÍSTICA',
                padding: 1,
                borderColor: 'blue'
            }
        );
        
        output += '\n\n' + table.toString();
        
        return output;
    }

    // Formatação da comparação entre países
    formatComparison(country1, country2) {
        const table = new Table({
            head: ['Aspecto', chalk.blue(country1.name.common), chalk.blue(country2.name.common)],
            colWidths: [20, 25, 25]
        });
        
        // Comparações
        const comparisons = [
            ['🏳️ Bandeira', country1.flag || '🏳️', country2.flag || '🏳️'],
            ['📍 Capital', country1.capital ? country1.capital[0] : 'N/A', country2.capital ? country2.capital[0] : 'N/A'],
            ['👥 População', country1.population ? country1.population.toLocaleString('pt-BR') : 'N/A', country2.population ? country2.population.toLocaleString('pt-BR') : 'N/A'],
            ['🗺️ Área (km²)', country1.area ? country1.area.toLocaleString('pt-BR') : 'N/A', country2.area ? country2.area.toLocaleString('pt-BR') : 'N/A'],
            ['🌍 Região', country1.region || 'N/A', country2.region || 'N/A'],
            ['🗣️ Idiomas', country1.languages ? Object.values(country1.languages).slice(0, 2).join(', ') : 'N/A', country2.languages ? Object.values(country2.languages).slice(0, 2).join(', ') : 'N/A']
        ];
        
        comparisons.forEach(row => {
            table.push(row);
        });
        
        // Calcular diferenças
        let analysis = '';
        if (country1.population && country2.population) {
            const popDiff = Math.abs(country1.population - country2.population);
            const larger = country1.population > country2.population ? country1.name.common : country2.name.common;
            analysis += `\n${chalk.yellow('📊 ANÁLISE:')}\n`;
            analysis += `• ${larger} tem ${popDiff.toLocaleString('pt-BR')} habitantes a mais\n`;
        }
        
        if (country1.area && country2.area) {
            const areaDiff = Math.abs(country1.area - country2.area);
            const larger = country1.area > country2.area ? country1.name.common : country2.name.common;
            analysis += `• ${larger} é ${areaDiff.toLocaleString('pt-BR')} km² maior\n`;
        }
        
        let output = boxen(
            `⚖️ ${chalk.bold.blue('COMPARAÇÃO GEOPOLÍTICA')}\n` +
            `${country1.flag || '🏳️'} ${country1.name.common} vs ${country2.flag || '🏳️'} ${country2.name.common}`,
            {
                title: '⚖️ ANÁLISE COMPARATIVA',
                padding: 1,
                borderColor: 'blue'
            }
        );
        
        output += '\n\n' + table.toString() + analysis;
        
        return output;
    }

    // Formatação da lista de países
    formatCountriesList(countries, region) {
        const table = new Table({
            head: [chalk.blue('País'), chalk.blue('Capital'), chalk.blue('População'), chalk.blue('Área (km²)')],
            colWidths: [25, 15, 15, 15]
        });
        
        countries.forEach(country => {
            table.push([
                `${country.flag || '🏳️'} ${country.name.common}`,
                country.capital ? country.capital[0] : 'N/A',
                country.population ? country.population.toLocaleString('pt-BR') : 'N/A',
                country.area ? country.area.toLocaleString('pt-BR') : 'N/A'
            ]);
        });
        
        const totalPopulation = countries.reduce((sum, country) => sum + (country.population || 0), 0);
        const totalArea = countries.reduce((sum, country) => sum + (country.area || 0), 0);
        
        const title = region ? `📊 PAÍSES DA REGIÃO: ${region.toUpperCase()}` : '🌍 CATÁLOGO MUNDIAL';
        
        let output = boxen(
            `${chalk.bold.blue(title)}\n` +
            `${chalk.gray('Total de países:')} ${countries.length}\n` +
            `${chalk.gray('População combinada:')} ${totalPopulation.toLocaleString('pt-BR')}\n` +
            `${chalk.gray('Área combinada:')} ${totalArea.toLocaleString('pt-BR')} km²`,
            {
                title: '🌎 CATÁLOGO GEOPOLÍTICO',
                padding: 1,
                borderColor: 'blue'
            }
        );
        
        output += '\n\n' + table.toString();
        
        return output;
    }

    // Menu de demonstração
    async showDemo() {
        console.log(chalk.blue.bold('\n🌍 === DEMONSTRAÇÃO DO MÓDULO COUNTRIES === 🌍\n'));
        
        // Informações do Brasil
        console.log(chalk.yellow('1. Informações detalhadas - Brasil:'));
        const brazilInfo = await this.getCountryByName('Brazil');
        if (brazilInfo) console.log(brazilInfo);
        
        console.log('\n' + '='.repeat(80) + '\n');
        
        // Países da América do Sul
        console.log(chalk.yellow('2. Países da América do Sul:'));
        const saCountries = await this.getCountriesByRegion('Americas');
        if (saCountries) console.log(saCountries);
        
        console.log('\n' + '='.repeat(80) + '\n');
        
        // Países que falam português
        console.log(chalk.yellow('3. Países que falam Português:'));
        const portugueseCountries = await this.getCountriesByLanguage('Portuguese');
        if (portugueseCountries) console.log(portugueseCountries);
        
        console.log('\n' + '='.repeat(80) + '\n');
        
        // Comparação Brasil vs Argentina
        console.log(chalk.yellow('4. Comparação: Brasil vs Argentina:'));
        const comparison = await this.compareCountries('Brazil', 'Argentina');
        if (comparison) console.log(comparison);
        
        console.log(chalk.blue.bold('\n🌍 === FIM DA DEMONSTRAÇÃO === 🌍\n'));
    }
    
    // Menu de funcionalidades
    showMenu() {
        const menuOptions = [
            ['Comando', 'Descrição', 'Exemplo'],
            ['getCountryByName(nome)', 'Informações detalhadas de um país', 'getCountryByName("Japan")'],
            ['getCountriesByRegion(região)', 'Países de uma região específica', 'getCountriesByRegion("Europe")'],
            ['getCountriesByCurrency(moeda)', 'Países que usam uma moeda', 'getCountriesByCurrency("EUR")'],
            ['getCountriesByLanguage(idioma)', 'Países que falam um idioma', 'getCountriesByLanguage("Spanish")'],
            ['compareCountries(país1, país2)', 'Comparar dois países', 'compareCountries("USA", "China")'],
            ['listCountriesSummary(região)', 'Listar países (opcional: região)', 'listCountriesSummary("Africa")'],
            ['showDemo()', 'Executar demonstração completa', 'showDemo()']
        ];
        
        const table = new Table({
            head: menuOptions[0].map(h => chalk.blue.bold(h)),
            colWidths: [30, 35, 30]
        });
        
        menuOptions.slice(1).forEach(option => {
            table.push(option.map(cell => chalk.white(cell)));
        });
        
        const menu = boxen(
            chalk.blue.bold('🌍 MÓDULO COUNTRIES - FUNCIONALIDADES DISPONÍVEIS\n\n') +
            table.toString() +
            '\n\n' + chalk.gray('Regiões disponíveis: Africa, Americas, Asia, Europe, Oceania\n') +
            chalk.gray('Exemplos de moedas: USD, EUR, BRL, GBP, JPY\n') +
            chalk.gray('Exemplos de idiomas: English, Spanish, Portuguese, French'),
            {
                title: '🗺️ COUNTRIES API MODULE',
                padding: 1,
                borderColor: 'blue',
                borderStyle: 'double'
            }
        );
        
        console.log(menu);
        return menu;
    }
}

module.exports = CountriesModule;


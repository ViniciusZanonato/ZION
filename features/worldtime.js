const axios = require('axios');
const chalk = require('chalk');
const Table = require('cli-table3');

class WorldTimeModule {
    constructor() {
        this.baseUrl = 'http://worldtimeapi.org/api';
        this.name = 'WorldTime API';
        this.description = 'API para obter informações de fuso horário e horário mundial';
    }

    // Obter todos os fusos horários disponíveis
    async getTimezones() {
        try {
            const response = await axios.get(`${this.baseUrl}/timezone`);
            return {
                success: true,
                data: response.data,
                total: response.data.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter horário atual por fuso horário
    async getTimeByTimezone(timezone) {
        try {
            const response = await axios.get(`${this.baseUrl}/timezone/${timezone}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter horário atual por IP
    async getTimeByIP(ip = null) {
        try {
            const url = ip ? `${this.baseUrl}/ip/${ip}` : `${this.baseUrl}/ip`;
            const response = await axios.get(url);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Listar fusos horários por área
    async getTimezonesByArea(area) {
        try {
            const response = await axios.get(`${this.baseUrl}/timezone/${area}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Formatar data e hora
    formatDateTime(datetimeString) {
        const date = new Date(datetimeString);
        return {
            date: date.toLocaleDateString('pt-BR'),
            time: date.toLocaleTimeString('pt-BR'),
            full: date.toLocaleString('pt-BR'),
            iso: datetimeString
        };
    }

    // Exibir informações de tempo com formatação
    displayTimeInfo(timeData) {
        console.log('\n' + chalk.cyan('='.repeat(60)));
        console.log(chalk.cyan.bold('⏰ INFORMAÇÕES DE TEMPO'));
        console.log(chalk.cyan('='.repeat(60)));

        const table = new Table({
            head: [chalk.cyan.bold('Campo'), chalk.cyan.bold('Valor')],
            colWidths: [25, 35]
        });

        const formatted = this.formatDateTime(timeData.datetime);
        
        table.push(
            ['Fuso Horário', chalk.yellow(timeData.timezone)],
            ['Data', chalk.green(formatted.date)],
            ['Horário', chalk.green(formatted.time)],
            ['Data/Hora Completa', chalk.white(formatted.full)],
            ['UTC Offset', chalk.blue(timeData.utc_offset)],
            ['Abreviação', chalk.magenta(timeData.abbreviation)],
            ['Dia da Semana', chalk.cyan(timeData.day_of_week.toString())],
            ['Dia do Ano', chalk.cyan(timeData.day_of_year.toString())],
            ['Semana do Ano', chalk.cyan(timeData.week_number.toString())],
            ['Horário de Verão', timeData.dst ? chalk.green('Sim') : chalk.red('Não')]
        );

        console.log(table.toString());
        console.log(chalk.cyan('='.repeat(60)) + '\n');
    }

    // Exibir lista de fusos horários
    displayTimezones(timezones, area = null) {
        console.log('\n' + chalk.cyan('='.repeat(60)));
        console.log(chalk.cyan.bold(`🌍 FUSOS HORÁRIOS${area ? ` - ${area.toUpperCase()}` : ''}`));
        console.log(chalk.cyan('='.repeat(60)));

        if (timezones.length === 0) {
            console.log(chalk.yellow('Nenhum fuso horário encontrado.'));
            return;
        }

        const table = new Table({
            head: [chalk.cyan.bold('#'), chalk.cyan.bold('Fuso Horário')],
            colWidths: [5, 50]
        });

        timezones.slice(0, 20).forEach((timezone, index) => {
            table.push([index + 1, chalk.green(timezone)]);
        });

        console.log(table.toString());
        
        if (timezones.length > 20) {
            console.log(chalk.yellow(`\n... e mais ${timezones.length - 20} fusos horários`));
        }
        
        console.log(chalk.blue(`\nTotal: ${timezones.length} fusos horários`));
        console.log(chalk.cyan('='.repeat(60)) + '\n');
    }

    // Comparar horários entre fusos horários
    async compareTimezones(timezone1, timezone2) {
        try {
            const [time1, time2] = await Promise.all([
                this.getTimeByTimezone(timezone1),
                this.getTimeByTimezone(timezone2)
            ]);

            if (!time1.success || !time2.success) {
                throw new Error('Erro ao obter horários dos fusos horários');
            }

            console.log('\n' + chalk.cyan('='.repeat(60)));
            console.log(chalk.cyan.bold('⏰ COMPARAÇÃO DE FUSOS HORÁRIOS'));
            console.log(chalk.cyan('='.repeat(60)));

            const table = new Table({
                head: [chalk.cyan.bold('Campo'), chalk.yellow(timezone1), chalk.yellow(timezone2)],
                colWidths: [20, 20, 20]
            });

            const formatted1 = this.formatDateTime(time1.data.datetime);
            const formatted2 = this.formatDateTime(time2.data.datetime);

            table.push(
                ['Data', formatted1.date, formatted2.date],
                ['Horário', formatted1.time, formatted2.time],
                ['UTC Offset', time1.data.utc_offset, time2.data.utc_offset],
                ['Abreviação', time1.data.abbreviation, time2.data.abbreviation],
                ['Horário de Verão', 
                 time1.data.dst ? chalk.green('Sim') : chalk.red('Não'),
                 time2.data.dst ? chalk.green('Sim') : chalk.red('Não')
                ]
            );

            console.log(table.toString());
            console.log(chalk.cyan('='.repeat(60)) + '\n');

            return {
                success: true,
                data: {
                    timezone1: time1.data,
                    timezone2: time2.data
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Menu interativo
    displayMenu() {
        console.log('\n' + chalk.cyan('='.repeat(60)));
        console.log(chalk.cyan.bold('🌍 WORLDTIME API - MENU'));
        console.log(chalk.cyan('='.repeat(60)));
        console.log(chalk.green('1. Ver horário atual (por IP)'));
        console.log(chalk.green('2. Ver horário por fuso horário'));
        console.log(chalk.green('3. Listar todos os fusos horários'));
        console.log(chalk.green('4. Listar fusos horários por área'));
        console.log(chalk.green('5. Comparar dois fusos horários'));
        console.log(chalk.green('6. Ver horário por IP específico'));
        console.log(chalk.red('0. Sair'));
        console.log(chalk.cyan('='.repeat(60)) + '\n');
    }

    // Demonstração das funcionalidades
    async demonstracao() {
        console.log('\n' + chalk.cyan.bold('🌍 WORLDTIME API - DEMONSTRAÇÃO'));
        console.log(chalk.cyan('='.repeat(60)));

        try {
            // 1. Horário atual por IP
            console.log(chalk.yellow('\n1. Obtendo horário atual por IP...'));
            const currentTime = await this.getTimeByIP();
            if (currentTime.success) {
                this.displayTimeInfo(currentTime.data);
            } else {
                console.log(chalk.red('Erro ao obter horário atual:'), currentTime.error);
            }

            // 2. Horário de São Paulo
            console.log(chalk.yellow('\n2. Obtendo horário de São Paulo...'));
            const spTime = await this.getTimeByTimezone('America/Sao_Paulo');
            if (spTime.success) {
                this.displayTimeInfo(spTime.data);
            } else {
                console.log(chalk.red('Erro ao obter horário de São Paulo:'), spTime.error);
            }

            // 3. Comparação de fusos horários
            console.log(chalk.yellow('\n3. Comparando São Paulo e Nova York...'));
            await this.compareTimezones('America/Sao_Paulo', 'America/New_York');

            // 4. Listar alguns fusos horários da América
            console.log(chalk.yellow('\n4. Listando fusos horários da América...'));
            const americaTimezones = await this.getTimezonesByArea('America');
            if (americaTimezones.success) {
                this.displayTimezones(americaTimezones.data.slice(0, 10), 'América');
            } else {
                console.log(chalk.red('Erro ao obter fusos horários da América:'), americaTimezones.error);
            }

        } catch (error) {
            console.log(chalk.red('Erro na demonstração:'), error.message);
        }

        console.log('\n' + chalk.cyan('='.repeat(60)));
        console.log(chalk.green.bold('✅ Demonstração concluída!'));
        console.log(chalk.cyan('='.repeat(60)) + '\n');
    }
}

module.exports = WorldTimeModule;

// Exemplo de uso
if (require.main === module) {
    const worldTime = new WorldTimeModule();
    worldTime.demonstracao();
}



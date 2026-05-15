const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');

class WeatherModule {
    constructor(apiKey = null) {
        this.apiKey = apiKey || process.env.OPENWEATHER_API_KEY;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.geoUrl = 'http://api.openweathermap.org/geo/1.0';
    }

    async getCurrentWeather(location) {
        const spinner = ora('Consultando dados meteorológicos...').start();
        
        try {
            // Primeiro, obter coordenadas da localização
            const coordinates = await this.getCoordinates(location);
            
            if (!coordinates) {
                spinner.fail('Localização não encontrada');
                return null;
            }

            // Obter dados do clima atual
            const weatherUrl = `${this.baseUrl}/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric&lang=pt_br`;
            const response = await axios.get(weatherUrl);
            
            spinner.succeed('Dados meteorológicos obtidos com sucesso!');
            return this.formatWeatherData(response.data, coordinates);
            
        } catch (error) {
            spinner.fail('Erro ao consultar dados meteorológicos');
            console.error(chalk.red('Erro na API do clima:'), error.message);
            return null;
        }
    }

    async getWeatherForecast(location, days = 5) {
        const spinner = ora('Consultando previsão do tempo...').start();
        
        try {
            const coordinates = await this.getCoordinates(location);
            
            if (!coordinates) {
                spinner.fail('Localização não encontrada');
                return null;
            }

            const forecastUrl = `${this.baseUrl}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric&lang=pt_br`;
            const response = await axios.get(forecastUrl);
            
            spinner.succeed('Previsão obtida com sucesso!');
            return this.formatForecastData(response.data, coordinates, days);
            
        } catch (error) {
            spinner.fail('Erro ao consultar previsão do tempo');
            console.error(chalk.red('Erro na API de previsão:'), error.message);
            return null;
        }
    }

    async getCoordinates(location) {
        try {
            const geoUrl = `${this.geoUrl}/direct?q=${encodeURIComponent(location)}&limit=1&appid=${this.apiKey}`;
            const response = await axios.get(geoUrl);
            
            if (response.data && response.data.length > 0) {
                const data = response.data[0];
                return {
                    lat: data.lat,
                    lon: data.lon,
                    name: data.name,
                    country: data.country,
                    state: data.state || ''
                };
            }
            return null;
        } catch (error) {
            console.error('Erro ao obter coordenadas:', error.message);
            return null;
        }
    }

    formatWeatherData(data, coordinates) {
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;
        const windSpeed = Math.round(data.wind.speed * 3.6); // m/s para km/h
        const windDir = this.getWindDirection(data.wind.deg);
        const description = data.weather[0].description;
        const icon = this.getWeatherIcon(data.weather[0].main);
        const visibility = data.visibility ? Math.round(data.visibility / 1000) : 'N/A';
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const weatherInfo = `
${chalk.cyan('🌍 LOCALIZAÇÃO')}
${chalk.white(`📍 ${coordinates.name}, ${coordinates.country}`)}
${chalk.gray(`   Coordenadas: ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`)}

${chalk.yellow('🌡️  TEMPERATURA')}
${chalk.white(`${icon} ${temp}°C`)} ${chalk.gray(`(sensação: ${feelsLike}°C)`)}
${chalk.white(`☁️  ${description.charAt(0).toUpperCase() + description.slice(1)}`)}

${chalk.blue('💨 VENTO E PRESSÃO')}
${chalk.white(`🌪️  ${windSpeed} km/h ${windDir}`)}
${chalk.white(`🔽 ${pressure} hPa`)}
${chalk.white(`💧 Umidade: ${humidity}%`)}
${chalk.white(`👁️  Visibilidade: ${visibility} km`)}

${chalk.magenta('☀️ SOL')}
${chalk.white(`🌅 Nascer: ${sunrise}`)}
${chalk.white(`🌇 Pôr: ${sunset}`)}
`;

        return boxen(weatherInfo, {
            title: chalk.bold.yellow('⛅ CLIMA ATUAL'),
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'cyan'
        });
    }

    formatForecastData(data, coordinates, days) {
        const forecasts = data.list.slice(0, days * 8); // 8 previsões por dia (3h cada)
        const dailyForecasts = {};

        // Agrupar por dia
        forecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dateKey = date.toISOString().split('T')[0];
            
            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = {
                    date: date,
                    temps: [],
                    descriptions: [],
                    humidity: [],
                    wind: []
                };
            }
            
            dailyForecasts[dateKey].temps.push(forecast.main.temp);
            dailyForecasts[dateKey].descriptions.push(forecast.weather[0].main);
            dailyForecasts[dateKey].humidity.push(forecast.main.humidity);
            dailyForecasts[dateKey].wind.push(forecast.wind.speed);
        });

        let forecastInfo = `\n${chalk.cyan('🌍 LOCALIZAÇÃO')}\n${chalk.white(`📍 ${coordinates.name}, ${coordinates.country}`)}\n\n${chalk.yellow('📅 PREVISÃO DOS PRÓXIMOS DIAS')}\n`;

        Object.keys(dailyForecasts).slice(0, days).forEach(dateKey => {
            const day = dailyForecasts[dateKey];
            const maxTemp = Math.round(Math.max(...day.temps));
            const minTemp = Math.round(Math.min(...day.temps));
            const avgHumidity = Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length);
            const avgWind = Math.round((day.wind.reduce((a, b) => a + b, 0) / day.wind.length) * 3.6);
            const mostCommonWeather = this.getMostCommon(day.descriptions);
            const icon = this.getWeatherIcon(mostCommonWeather);
            const dayName = day.date.toLocaleDateString('pt-BR', { weekday: 'long' });
            const dateStr = day.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            forecastInfo += `\n${chalk.white(`${icon} ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} (${dateStr})`)}`;
            forecastInfo += `\n${chalk.green(`   🌡️  ${maxTemp}°/${minTemp}°C`)} ${chalk.blue(`💨 ${avgWind}km/h`)} ${chalk.cyan(`💧 ${avgHumidity}%`)}`;
        });

        return boxen(forecastInfo, {
            title: chalk.bold.yellow('🔮 PREVISÃO DO TEMPO'),
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'blue'
        });
    }

    getWeatherIcon(condition) {
        const icons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
        return icons[condition] || '🌤️';
    }

    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    getMostCommon(arr) {
        return arr.sort((a, b) =>
            arr.filter(v => v === a).length - arr.filter(v => v === b).length
        ).pop();
    }

    async getWeatherAlerts(location) {
        try {
            const coordinates = await this.getCoordinates(location);
            if (!coordinates) return null;

            const alertUrl = `${this.baseUrl}/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&exclude=minutely,hourly,daily`;
            const response = await axios.get(alertUrl);
            
            if (response.data.alerts && response.data.alerts.length > 0) {
                return this.formatAlerts(response.data.alerts, coordinates);
            }
            
            return chalk.green('✅ Nenhum alerta meteorológico ativo para esta região.');
            
        } catch (error) {
            console.error('Erro ao consultar alertas:', error.message);
            return null;
        }
    }

    formatAlerts(alerts, coordinates) {
        let alertInfo = `\n${chalk.cyan('🌍 LOCALIZAÇÃO')}\n${chalk.white(`📍 ${coordinates.name}, ${coordinates.country}`)}\n\n${chalk.red('⚠️  ALERTAS METEOROLÓGICOS ATIVOS')}\n`;
        
        alerts.forEach((alert, index) => {
            const start = new Date(alert.start * 1000).toLocaleString('pt-BR');
            const end = new Date(alert.end * 1000).toLocaleString('pt-BR');
            
            alertInfo += `\n${chalk.yellow(`🚨 ${alert.event}`)}`;
            alertInfo += `\n${chalk.white(`📅 ${start} até ${end}`)}`;
            alertInfo += `\n${chalk.gray(`👤 ${alert.sender_name}`)}`;
            alertInfo += `\n${chalk.white(alert.description.slice(0, 200) + '...')}`;
            
            if (index < alerts.length - 1) alertInfo += '\n' + '─'.repeat(50);
        });

        return boxen(alertInfo, {
            title: chalk.bold.red('🚨 ALERTAS METEOROLÓGICOS'),
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'red'
        });
    }
}

module.exports = WeatherModule;


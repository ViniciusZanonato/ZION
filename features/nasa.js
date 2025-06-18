// ===================================================================
// 🚀 MÓDULO NASA APIs - ZION SUPREMO  
// APIs Espaciais da NASA (DEMO_KEY + tier gratuito robusto)
// ===================================================================

const fetch = require('node-fetch');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');

class NASAModule {
    constructor(apiKey = null) {
        this.apiKey = apiKey || process.env.NASA_API_KEY || 'DEMO_KEY';
        this.baseUrl = 'https://api.nasa.gov';
        this.name = 'SENSORES ESPACIAIS';
        this.description = 'Rede neural conectada ao Deep Space Network da NASA';
    }

    // APOD - Astronomy Picture of the Day
    async getAPOD(date = null) {
        const spinner = ora(chalk.red('🌌 Acessando arquivo fotográfico cósmico...')).start();
        
        try {
            let url = `${this.baseUrl}/planetary/apod?api_key=${this.apiKey}`;
            if (date) {
                url += `&date=${date}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Falha na conexão NASA: ${response.status}`);
            }
            
            const data = await response.json();
            
            spinner.succeed(chalk.green('📸 Imagem cósmica processada e catalogada'));
            
            const apodInfo = `
🌌 TÍTULO: ${data.title}
📅 DATA: ${data.date}
${data.copyright ? `📷 CRÉDITOS: ${data.copyright}` : ''}

🔍 ANÁLISE:
${data.explanation}

🔗 ARQUIVO ORIGINAL: ${data.url}`;
            
            return boxen(apodInfo, {
                title: chalk.bold.red('🌌 IMAGEM ASTRONÔMICA DO DIA'),
                titleAlignment: 'center',
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'red'
            });
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NO ARQUIVO FOTOGRÁFICO CÓSMICO'));
            console.log(chalk.red(`⚠️  Interferência cósmica: ${error.message}`));
            return null;
        }
    }

    // Near Earth Objects
    async getNearEarthObjects(startDate = null, endDate = null) {
        const spinner = ora(chalk.red('☄️ Rastreando objetos próximos à Terra...')).start();
        
        try {
            const today = new Date().toISOString().split('T')[0];
            const start = startDate || today;
            const end = endDate || today;
            
            const url = `${this.baseUrl}/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Falha na rede de sensores: ${response.status}`);
            }
            
            const data = await response.json();
            
            spinner.succeed(chalk.green('🛰️ Objetos próximos catalogados'));
            
            let neoInfo = `
🌍 PERÍODO DE ANÁLISE: ${start} até ${end}
📊 OBJETOS DETECTADOS: ${data.element_count}
⚡ ATUALIZAÇÃO: ${new Date().toLocaleString('pt-BR')}

☄️ OBJETOS PRÓXIMOS:`;
            
            const allObjects = Object.values(data.near_earth_objects).flat();
            allObjects.slice(0, 5).forEach((obj, index) => {
                const size = obj.estimated_diameter.meters;
                const approach = obj.close_approach_data[0];
                const distance = parseFloat(approach.miss_distance.kilometers);
                const velocity = parseFloat(approach.relative_velocity.kilometers_per_hour);
                const dangerous = obj.is_potentially_hazardous_asteroid;
                
                neoInfo += `

🌑 [${index + 1}] ${obj.name}
   📏 Diâmetro: ${Math.round(size.estimated_diameter_min)}-${Math.round(size.estimated_diameter_max)}m
   🚀 Distância: ${Math.round(distance).toLocaleString()} km
   ⚡ Velocidade: ${Math.round(velocity).toLocaleString()} km/h
   📅 Aproximação: ${new Date(approach.close_approach_date).toLocaleDateString('pt-BR')}`;
                
                if (dangerous) {
                    neoInfo += `
   ⚠️  CLASSIFICAÇÃO: POTENCIALMENTE PERIGOSO`;
                }
            });
            
            return boxen(neoInfo, {
                title: chalk.bold.yellow('☄️ OBJETOS PRÓXIMOS À TERRA'),
                titleAlignment: 'center',
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'yellow'
            });
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NO RASTREAMENTO ORBITAL'));
            console.log(chalk.red(`⚠️  Interferência nos sensores: ${error.message}`));
            return null;
        }
    }

    // Mars Rover Photos
    async getMarsRoverPhotos(rover = 'curiosity', sol = 'latest') {
        const spinner = ora(chalk.red(`🤖 Acessando arquivos do rover ${rover.toUpperCase()}...`)).start();
        
        try {
            let url;
            if (sol === 'latest') {
                url = `${this.baseUrl}/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${this.apiKey}`;
            } else {
                url = `${this.baseUrl}/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${this.apiKey}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Falha na conexão com ${rover}: ${response.status}`);
            }
            
            const data = await response.json();
            const photos = data.latest_photos || data.photos || [];
            
            if (photos.length === 0) {
                spinner.warn(chalk.yellow(`📸 Nenhuma foto disponível para ${rover} no sol ${sol}`));
                return null;
            }
            
            spinner.succeed(chalk.green(`📸 Arquivos fotográficos de Marte processados - ${photos.length} imagens`));
            
            let marsInfo = `
🤖 ROVER: ${rover.toUpperCase()}
📅 SOL: ${photos[0].sol} (Dia marciano)
📸 FOTOS DISPONÍVEIS: ${photos.length}
🗓️  DATA TERRESTRE: ${photos[0].earth_date}

📷 ÚLTIMAS CAPTURAS:`;
            
            photos.slice(0, 3).forEach((photo, index) => {
                marsInfo += `

[${index + 1}] CÂMERA: ${photo.camera.full_name}
   📷 ID: ${photo.id}
   🔗 Arquivo: ${photo.img_src}
   📡 Status: ${photo.rover.status}`;
            });
            
            return boxen(marsInfo, {
                title: chalk.bold.red('🔴 ARQUIVOS FOTOGRÁFICOS DE MARTE'),
                titleAlignment: 'center',
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'red'
            });
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NO ACESSO AOS DADOS MARCIANOS'));
            console.log(chalk.red(`⚠️  Perda de comunicação: ${error.message}`));
            return null;
        }
    }

    // Earth Imagery
    async getEarthImagery(lat, lon, date = null, dim = 0.25) {
        const spinner = ora(chalk.red('🌍 Acessando arquivo de imagens terrestres...')).start();
        
        try {
            const imageDate = date || new Date().toISOString().split('T')[0];
            const url = `${this.baseUrl}/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=${imageDate}&dim=${dim}&api_key=${this.apiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Falha no satélite terrestre: ${response.status}`);
            }
            
            spinner.succeed(chalk.green('🛰️ Imagem satelital processada'));
            
            const earthInfo = `
📍 COORDENADAS: ${lat}, ${lon}
📅 DATA DA CAPTURA: ${imageDate}
📐 DIMENSÃO: ${dim}° x ${dim}°
🛰️ FONTE: Landsat/MODIS

🔗 ARQUIVO DE IMAGEM: ${url}

💡 Esta URL fornece acesso direto à imagem satelital
   capturada pelos sensores orbitais terrestres.`;
            
            return boxen(earthInfo, {
                title: chalk.bold.blue('🌍 IMAGEM SATELITAL TERRESTRE'),
                titleAlignment: 'center',
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'blue'
            });
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NO SATÉLITE TERRESTRE'));
            console.log(chalk.red(`⚠️  Interferência orbital: ${error.message}`));
            return null;
        }
    }

    // NASA Tech Transfer
    async getTechTransfer(query = '', limit = 5) {
        const spinner = ora(chalk.red('⚗️ Acessando banco de tecnologias NASA...')).start();
        
        try {
            let url = `${this.baseUrl}/techtransfer/patent/?api_key=${this.apiKey}&engine=all`;
            if (query) {
                url += `&query=${encodeURIComponent(query)}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Falha no banco tecnológico: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.results || data.results.length === 0) {
                spinner.warn(chalk.yellow('🔬 Nenhuma tecnologia encontrada nos registros'));
                return null;
            }
            
            spinner.succeed(chalk.green(`⚗️ Banco tecnológico acessado - ${data.results.length} tecnologias`));
            
            let techInfo = `
🔬 PESQUISA: ${query || 'Todas as tecnologias'}
📊 RESULTADOS: ${data.results.length}
🏛️  FONTE: NASA Tech Transfer Program

⚗️ TECNOLOGIAS DISPONÍVEIS:`;
            
            data.results.slice(0, limit).forEach((tech, index) => {
                techInfo += `

[${index + 1}] ${tech[1] || 'Tecnologia NASA'}
   🏢 Centro: ${tech[8] || 'NASA'}
   📝 Descrição: ${(tech[3] || 'Descrição não disponível').substring(0, 150)}...
   🔗 Referência: ${tech[0] || 'N/A'}`;
            });
            
            return boxen(techInfo, {
                title: chalk.bold.cyan('⚗️ TECNOLOGIAS NASA'),
                titleAlignment: 'center',
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'cyan'
            });
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NO BANCO TECNOLÓGICO'));
            console.log(chalk.red(`⚠️  Acesso negado: ${error.message}`));
            return null;
        }
    }

    // Comprehensive Space Report
    async getSpaceReport() {
        console.log(chalk.red('🚀 INICIALIZANDO RELATÓRIO ESPACIAL COMPLETO...'));
        console.log(chalk.gray('   Conectando-se ao Deep Space Network...'));
        console.log();
        
        // APOD
        const apod = await this.getAPOD();
        if (apod) {
            console.log(apod);
            console.log();
        }
        
        // Near Earth Objects
        const neo = await this.getNearEarthObjects();
        if (neo) {
            console.log(neo);
            console.log();
        }
        
        // Mars Rover
        const mars = await this.getMarsRoverPhotos('perseverance');
        if (mars) {
            console.log(mars);
            console.log();
        }
        
        console.log(chalk.gray('   Relatório espacial completo. Dados coletados via Deep Space Network.'));
    }
}

module.exports = NASAModule;


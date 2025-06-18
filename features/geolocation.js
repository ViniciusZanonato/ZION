// ===================================================================
// 🌍 MÓDULO DE GEOLOCALIZAÇÃO E MAPAS - ZION SUPREMO
// Implementação de APIs gratuitas para localização e mapas
// ===================================================================

const fetch = require('node-fetch');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');

class GeolocationModule {
    constructor() {
        this.name = 'VARREDURA DIMENSIONAL';
        this.description = 'Sensores de geolocalização e análise territorial';
    }

    // OpenStreetMap Nominatim - Geocoding Gratuito
    async geocodeLocation(location) {
        const spinner = ora(chalk.red(`🌍 Triangulando coordenadas dimensionais: ${location}...`)).start();
        
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'ZION-Neural-Network/1.0 (Dimensional-Scanner)'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Falha na triangulação: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                const result = data[0];
                
                spinner.succeed(chalk.green(`📡 Coordenadas identificadas: ${result.display_name}`));
                
                const geoData = {
                    nome: result.display_name,
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon),
                    tipo: result.type,
                    categoria: result.class,
                    endereco: result.address || {},
                    bbox: result.boundingbox
                };
                
                return geoData;
            } else {
                spinner.warn(chalk.yellow('🌍 Localização não encontrada nos sensores globais'));
                return null;
            }
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NA TRIANGULAÇÃO DIMENSIONAL'));
            console.log(chalk.red(`⚠️  Interferência detectada: ${error.message}`));
            return null;
        }
    }

    // Exibir informações geográficas detalhadas
    async showDetailedLocation(location) {
        const geoData = await this.geocodeLocation(location);
        
        if (!geoData) {
            console.log(chalk.red('❌ Falha na análise dimensional'));
            return;
        }
        
        const map = this.generateASCIIMap(geoData);
        
        const locationInfo = `
🎯 COORDENADAS: ${geoData.latitude.toFixed(6)}, ${geoData.longitude.toFixed(6)}
📍 TIPO: ${geoData.tipo} (${geoData.categoria})
🌐 REGIÃO: ${this.getRegionFromCoordinates(geoData.latitude, geoData.longitude)}
🗺️  QUADRANTE: ${this.getQuadrant(geoData.latitude, geoData.longitude)}
${geoData.endereco.country ? `🏁 PAÍS: ${geoData.endereco.country}` : ''}
${geoData.endereco.state ? `🏛️  ESTADO: ${geoData.endereco.state}` : ''}
${geoData.endereco.city ? `🏙️  CIDADE: ${geoData.endereco.city}` : ''}`;
        
        console.log(boxen(
            chalk.red.bold(`🌍 ANÁLISE DIMENSIONAL COMPLETA\n`) +
            chalk.yellow(`📡 ALVO: ${geoData.nome}\n`) +
            chalk.white(locationInfo),
            {
                padding: 1,
                borderColor: 'red',
                title: '🔴 VARREDURA GEOESPACIAL'
            }
        ));
        
        console.log(map);
        console.log(chalk.gray('   Dados coletados via OpenStreetMap - Rede global de sensores'));
        console.log();
    }

    // Gerar mapa ASCII baseado nas coordenadas
    generateASCIIMap(geoData) {
        const { latitude, longitude, nome } = geoData;
        
        // Determinar características do terreno baseado nas coordenadas
        const isCoastal = this.isCoastalArea(latitude, longitude);
        const isMountainous = this.isMountainousArea(latitude, longitude);
        const isUrban = geoData.categoria === 'amenity' || geoData.categoria === 'building';
        
        let terrain = '';
        if (isCoastal) {
            terrain = `
║    ⛰️      ▲▲▲     ████████≋≋≋≋≋≋   ║
║  ▲▲▲▲▲   ▲▲▲▲▲   ████████≋≋≋≋≋≋≋≋≋ ║
║     ▲▲      ▲▲▲     ████████≋≋≋≋≋≋   ║
║                             ≋≋≋≋≋≋   ║
║         🏖️ ZONA COSTEIRA ≋≋≋≋≋≋≋≋≋  ║`;
        } else if (isMountainous) {
            terrain = `
║      ⛰️  ▲▲▲▲▲▲▲  🗻  ▲▲▲▲▲▲      ║
║    ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲     ║
║  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲   ║
║ ▲▲▲▲     🏔️ REGIÃO MONTANHOSA    ▲▲ ║
║   ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲     ║`;
        } else if (isUrban) {
            terrain = `
║    🏙️  ███████████████████████      ║
║      ███████████████████████████    ║
║    ███████████████████████████████  ║
║      🏢 ZONA URBANA 🏬 ███████     ║
║    ███████████████████████████████  ║`;
        } else {
            terrain = `
║    🌾      🌳🌳🌳     🌿🌿🌿🌿        ║
║  🌾🌾🌾   🌳🌳🌳🌳🌳   🌿🌿🌿🌿🌿🌿     ║
║     🌾      🌳🌳🌳     🌿🌿🌿🌿        ║
║        🌱 REGIÃO RURAL 🌾           ║
║      🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳           ║`;
        }
        
        const map = `
╔═════════════════════════════════════╗
║        🎯 MAPA DIMENSIONAL          ║
║   ALVO: ${nome.substring(0, 25).padEnd(25)} ║
║                                     ║${terrain}
║                                     ║
║  📍 LAT: ${latitude.toFixed(4).padEnd(8)} LON: ${longitude.toFixed(4).padEnd(8)} ║
║     [ ANÁLISE GEOESPACIAL ]         ║
╚═════════════════════════════════════╝`;
        
        return chalk.red(map);
    }

    // Determinar região baseada nas coordenadas
    getRegionFromCoordinates(lat, lon) {
        if (lat >= -90 && lat <= -60) return 'ANTÁRTICA';
        if (lat >= -60 && lat <= -23.5) return 'HEMISFÉRIO SUL';
        if (lat >= -23.5 && lat <= 23.5) return 'ZONA TROPICAL';
        if (lat >= 23.5 && lat <= 66.5) return 'ZONA TEMPERADA NORTE';
        if (lat >= 66.5 && lat <= 90) return 'ÁRTICO';
        return 'INDEFINIDA';
    }

    // Determinar quadrante
    getQuadrant(lat, lon) {
        const latDir = lat >= 0 ? 'N' : 'S';
        const lonDir = lon >= 0 ? 'E' : 'W';
        return `${latDir}${lonDir}`;
    }

    // Verificar se é área costeira (simplificado)
    isCoastalArea(lat, lon) {
        // Lógica simplificada - em uma implementação real, usaria dados geográficos
        return Math.abs(lat) < 70 && (Math.abs(lon) % 30 < 5);
    }

    // Verificar se é área montanhosa (simplificado)
    isMountainousArea(lat, lon) {
        // Lógica simplificada baseada em coordenadas conhecidas de cadeias montanhosas
        return (Math.abs(lat) > 30 && Math.abs(lat) < 60) || 
               (lat > 10 && lat < 30 && lon > -120 && lon < -80); // Américas
    }

    // Buscar múltiplas localizações
    async searchMultipleLocations(locations) {
        const results = [];
        
        for (const location of locations) {
            const result = await this.geocodeLocation(location);
            if (result) {
                results.push(result);
            }
            // Delay para não sobrecarregar a API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return results;
    }

    // Calcular distância entre dois pontos (fórmula de Haversine)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI/180);
    }
}

module.exports = GeolocationModule;


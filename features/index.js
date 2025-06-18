// Centralizador de importações para todas as funcionalidades do ZION
// Este arquivo facilita a importação e organização dos módulos

module.exports = {
    // Módulos de dados e informações
    Weather: require('./weather'),
    News: require('./news'),
    Countries: require('./countries'),
    WorldTime: require('./worldtime'),
    
    // Módulos de APIs externas
    Geolocation: require('./geolocation'),
    JSONPlaceholder: require('./jsonplaceholder'),
    NASA: require('./nasa'),
    ArXiv: require('./arxiv'),
    
    // Módulos financeiros
    CoinGecko: require('./coingecko'),
    AlphaVantage: require('./alphaVantage'),
    FRED: require('./fred')
};

// Função helper para inicializar todos os módulos
function initializeFeatures() {
    const features = {};
    
    try {
        features.weather = new module.exports.Weather();
        features.news = new module.exports.News();
        features.countries = new module.exports.Countries();
        features.worldtime = new module.exports.WorldTime();
        features.geolocation = new module.exports.Geolocation();
        features.jsonplaceholder = new module.exports.JSONPlaceholder();
        features.nasa = new module.exports.NASA();
        features.arxiv = new module.exports.ArXiv();
        features.coingecko = new module.exports.CoinGecko();
        features.alphaVantage = new module.exports.AlphaVantage();
        features.fred = new module.exports.FRED();
        
        console.log('✅ Todas as funcionalidades inicializadas com sucesso');
        return features;
    } catch (error) {
        console.error('❌ Erro ao inicializar funcionalidades:', error.message);
        return null;
    }
}

module.exports.initializeFeatures = initializeFeatures;


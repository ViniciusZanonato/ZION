const Logger = require('../utilities/logger');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class APIManager {
    constructor() {
        this.logger = new Logger('APIManager');
        this.apis = new Map();
        this.rateLimits = new Map();
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000
        };
        
        this.initializeAPIs();
    }

    /**
     * Initialize all API configurations
     */
    initializeAPIs() {
        // Weather API
        this.registerAPI('openweather', {
            baseURL: 'https://api.openweathermap.org/data/2.5',
            rateLimit: { requests: 60, window: 60000 }, // 60 requests per minute
            timeout: 5000,
            requiresAuth: true
        });

        // News API
        this.registerAPI('newsapi', {
            baseURL: 'https://newsapi.org/v2',
            rateLimit: { requests: 1000, window: 86400000 }, // 1000 requests per day
            timeout: 10000,
            requiresAuth: true
        });

        // NASA API
        this.registerAPI('nasa', {
            baseURL: 'https://api.nasa.gov',
            rateLimit: { requests: 1000, window: 3600000 }, // 1000 requests per hour
            timeout: 15000,
            requiresAuth: true
        });

        // Financial APIs
        this.registerAPI('alphavantage', {
            baseURL: 'https://www.alphavantage.co/query',
            rateLimit: { requests: 5, window: 60000 }, // 5 requests per minute
            timeout: 10000,
            requiresAuth: true
        });

        // Geolocation API
        this.registerAPI('ipapi', {
            baseURL: 'http://ip-api.com/json',
            rateLimit: { requests: 150, window: 60000 }, // 150 requests per minute
            timeout: 5000,
            requiresAuth: false
        });

        // Generic HTTP client for other APIs
        this.registerAPI('generic', {
            baseURL: '',
            rateLimit: { requests: 100, window: 60000 },
            timeout: 10000,
            requiresAuth: false
        });

        this.logger.info('APIs initialized', {
            registeredAPIs: Array.from(this.apis.keys()),
            count: this.apis.size
        });
    }

    /**
     * Register a new API configuration
     */
    registerAPI(name, config) {
        this.apis.set(name, {
            ...config,
            client: axios.create({
                baseURL: config.baseURL,
                timeout: config.timeout || 10000,
                headers: {
                    'User-Agent': 'ZION-Chatbot/1.0.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        });

        // Initialize rate limiting for this API
        this.rateLimits.set(name, {
            requests: [],
            config: config.rateLimit
        });

        this.logger.debug(`API registered: ${name}`, config);
    }

    /**
     * Make an authenticated API request
     */
    async makeRequest(apiName, endpoint, options = {}) {
        const startTime = Date.now();
        
        try {
            // Validate API exists
            if (!this.apis.has(apiName)) {
                throw new Error(`API '${apiName}' not registered`);
            }

            const api = this.apis.get(apiName);
            
            // Check rate limiting
            if (!this.checkRateLimit(apiName)) {
                throw new Error(`Rate limit exceeded for API: ${apiName}`);
            }

            // Prepare request configuration
            const requestConfig = {
                method: options.method || 'GET',
                url: endpoint,
                params: options.params,
                data: options.data,
                headers: {
                    ...api.client.defaults.headers,
                    ...options.headers
                }
            };

            // Add authentication if required
            if (api.requiresAuth && options.apiKey) {
                requestConfig.headers['Authorization'] = `Bearer ${options.apiKey}`;
            } else if (api.requiresAuth && options.params) {
                requestConfig.params = { ...requestConfig.params, apikey: options.apiKey };
            }

            this.logger.debug(`Making ${requestConfig.method} request to ${apiName}`, {
                endpoint,
                hasAuth: !!options.apiKey
            });

            // Make the request with retry logic
            const response = await this.requestWithRetry(api.client, requestConfig);
            
            // Update rate limiting
            this.updateRateLimit(apiName);

            const duration = Date.now() - startTime;
            this.logger.apiCall(apiName, endpoint, response.status, duration);

            return {
                success: true,
                data: response.data,
                status: response.status,
                headers: response.headers,
                duration
            };

        } catch (error) {
            const duration = Date.now() - startTime;
            
            this.logger.error(`API request failed: ${apiName}`, {
                endpoint,
                error: error.message,
                status: error.response?.status,
                duration
            });

            return {
                success: false,
                error: error.message,
                status: error.response?.status,
                duration
            };
        }
    }

    /**
     * Make request with retry logic
     */
    async requestWithRetry(client, config, attempt = 1) {
        try {
            return await client.request(config);
        } catch (error) {
            if (attempt >= this.retryConfig.maxRetries) {
                throw error;
            }

            // Check if error is retryable
            if (this.isRetryableError(error)) {
                const delay = Math.min(
                    this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
                    this.retryConfig.maxDelay
                );

                this.logger.debug(`Retrying request (attempt ${attempt + 1}/${this.retryConfig.maxRetries}) after ${delay}ms`, {
                    error: error.message,
                    status: error.response?.status
                });

                await this.sleep(delay);
                return this.requestWithRetry(client, config, attempt + 1);
            }

            throw error;
        }
    }

    /**
     * Check if error is retryable
     */
    isRetryableError(error) {
        if (!error.response) {
            return true; // Network errors are retryable
        }

        const status = error.response.status;
        return status >= 500 || status === 429; // Server errors and rate limits
    }

    /**
     * Check rate limiting for an API
     */
    checkRateLimit(apiName) {
        const rateLimit = this.rateLimits.get(apiName);
        if (!rateLimit || !rateLimit.config) {
            return true;
        }

        const now = Date.now();
        const windowStart = now - rateLimit.config.window;
        
        // Clean old requests
        rateLimit.requests = rateLimit.requests.filter(time => time > windowStart);
        
        // Check if we can make another request
        return rateLimit.requests.length < rateLimit.config.requests;
    }

    /**
     * Update rate limiting after successful request
     */
    updateRateLimit(apiName) {
        const rateLimit = this.rateLimits.get(apiName);
        if (rateLimit) {
            rateLimit.requests.push(Date.now());
        }
    }

    /**
     * Weather API methods
     */
    async getWeather(location, apiKey) {
        return this.makeRequest('openweather', '/weather', {
            params: {
                q: location,
                units: 'metric',
                appid: apiKey
            }
        });
    }

    async getWeatherForecast(location, apiKey) {
        return this.makeRequest('openweather', '/forecast', {
            params: {
                q: location,
                units: 'metric',
                appid: apiKey
            }
        });
    }

    /**
     * News API methods
     */
    async getTopHeadlines(country = 'us', category = 'general', apiKey) {
        return this.makeRequest('newsapi', '/top-headlines', {
            params: {
                country,
                category,
                apiKey
            }
        });
    }

    async searchNews(query, apiKey, options = {}) {
        return this.makeRequest('newsapi', '/everything', {
            params: {
                q: query,
                sortBy: options.sortBy || 'publishedAt',
                language: options.language || 'en',
                pageSize: options.pageSize || 20,
                apiKey
            }
        });
    }

    /**
     * NASA API methods
     */
    async getNASAImageOfDay(apiKey, date = null) {
        const params = { api_key: apiKey };
        if (date) params.date = date;
        
        return this.makeRequest('nasa', '/planetary/apod', { params });
    }

    async getNASAMarsPhotos(apiKey, sol = 'latest', camera = 'all') {
        return this.makeRequest('nasa', '/mars-photos/api/v1/rovers/curiosity/photos', {
            params: {
                sol,
                camera: camera !== 'all' ? camera : undefined,
                api_key: apiKey
            }
        });
    }

    /**
     * Financial API methods
     */
    async getStockPrice(symbol, apiKey) {
        return this.makeRequest('alphavantage', '', {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol,
                apikey: apiKey
            }
        });
    }

    async getCryptoPrice(symbol, market = 'USD', apiKey) {
        return this.makeRequest('alphavantage', '', {
            params: {
                function: 'CURRENCY_EXCHANGE_RATE',
                from_currency: symbol,
                to_currency: market,
                apikey: apiKey
            }
        });
    }

    /**
     * Geolocation methods
     */
    async getLocationInfo(ip = null) {
        const endpoint = ip ? `/${ip}` : '';
        return this.makeRequest('ipapi', endpoint, {
            params: {
                fields: 'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query'
            }
        });
    }

    /**
     * Generic HTTP methods
     */
    async get(url, options = {}) {
        return this.makeRequest('generic', url, {
            method: 'GET',
            ...options
        });
    }

    async post(url, data, options = {}) {
        return this.makeRequest('generic', url, {
            method: 'POST',
            data,
            ...options
        });
    }

    /**
     * Health check for all APIs
     */
    async healthCheck() {
        const results = {};
        
        for (const [name, api] of this.apis.entries()) {
            try {
                const startTime = Date.now();
                await api.client.get('/health', { timeout: 5000 }).catch(() => {});
                results[name] = {
                    status: 'healthy',
                    responseTime: Date.now() - startTime
                };
            } catch (error) {
                results[name] = {
                    status: 'unhealthy',
                    error: error.message
                };
            }
        }

        this.logger.info('API health check completed', results);
        return results;
    }

    /**
     * Get API statistics
     */
    getAPIStats() {
        const stats = {};
        
        for (const [name, rateLimit] of this.rateLimits.entries()) {
            const now = Date.now();
            const windowStart = now - (rateLimit.config?.window || 60000);
            const recentRequests = rateLimit.requests.filter(time => time > windowStart);
            
            stats[name] = {
                recentRequests: recentRequests.length,
                maxRequests: rateLimit.config?.requests || 0,
                windowMinutes: (rateLimit.config?.window || 60000) / 60000,
                utilizationPercent: rateLimit.config?.requests ? 
                    Math.round((recentRequests.length / rateLimit.config.requests) * 100) : 0
            };
        }

        return stats;
    }

    /**
     * Utility method for sleeping
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.apis.clear();
        this.rateLimits.clear();
        this.logger.info('APIManager destroyed');
    }
}

module.exports = APIManager;


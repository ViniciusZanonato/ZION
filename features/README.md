# ZION Feature Modules

This directory contains optional feature modules used by the ZION CLI. They are grouped by domain and loaded by the main application when the related command is executed.

## Modules

### Geography and Weather

- `weather.js` - current weather, forecasts, and alerts
- `countries.js` - country and geopolitical data
- `geolocation.js` - location lookups and coordinate data
- `worldtime.js` - global time and timezone helpers

### News and Research

- `news.js` - news lookup and topic search
- `arxiv.js` - scientific paper search through ArXiv
- `nasa.js` - NASA public data helpers

### Finance

- `coingecko.js` - cryptocurrency market data
- `alphaVantage.js` - stock and financial market data
- `fred.js` - Federal Reserve economic data

### Development and Security Research

- `jsonplaceholder.js` - mock API data for development commands
- `advanced-apis.js` - grouped intelligence helpers
- `osint.js` - OSINT research utilities
- `pentest.js` - authorized security testing helpers

## Usage

Import individual modules when adding a command:

```javascript
const WeatherModule = require('./features/weather');

const weather = new WeatherModule();
```

Or import through the feature index:

```javascript
const Features = require('./features');

const features = Features.initializeFeatures();
const weather = new Features.Weather();
```

## Adding a Feature

1. Create a module under `features/`.
2. Follow the class-based structure used by the existing modules.
3. Export the module from `features/index.js`.
4. Register the command in the command processor and main CLI.
5. Add focused tests when the feature changes shared behavior.

## API Keys

Many features degrade gracefully when API keys are missing. Configure optional providers in `.env`:

```env
OPENWEATHER_API_KEY=
NEWS_API_KEY=
NASA_API_KEY=DEMO_KEY
ALPHA_VANTAGE_API_KEY=
FRED_API_KEY=
SECURITYTRAILS_API_KEY=
VIRUSTOTAL_API_KEY=
ABUSEIPDB_API_KEY=
SHODAN_API_KEY=
```

Keep provider keys out of commits. Use `.env.example` as the public configuration template.

<div align="center">

# ZION

**Local-first AI terminal assistant powered by Ollama**

[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Ollama](https://img.shields.io/badge/Ollama-qwen3:8b-000000?style=flat-square)](https://ollama.com)
[![Jest](https://img.shields.io/badge/Tests-Jest-C21325?style=flat-square&logo=jest)](https://jestjs.io)
[![CI](https://img.shields.io/github/actions/workflow/status/ViniciusZanonato/ZION/ci.yml?style=flat-square&label=CI)](https://github.com/ViniciusZanonato/ZION/actions)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## About

ZION is an experimental Node.js CLI for local AI workflows. It combines an Ollama-backed chat loop, terminal UI controls, command routing, SQLite conversation storage, PDF analysis, voice utilities, and optional public-data integrations.

The default model is `qwen3:8b`, running through a local Ollama server. This keeps the main chat flow local by default and avoids requiring external LLM API keys.

Security, OSINT, and pentest commands are research helpers only. Use them only on systems you own or are explicitly authorized to test.

## Features

- Local AI chat through Ollama
- Default model pinned to `qwen3:8b`
- Interactive terminal interface with command palette
- Optional advanced terminal UI powered by Blessed
- SQLite-backed conversation history and settings
- PDF scan, analysis, Q&A, and extraction helpers
- Weather, news, NASA, ArXiv, finance, country, and time lookups
- OSINT and security research utilities
- Voice/TTS utilities for local experiments
- Jest test suite and ESLint validation

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 16+ |
| AI | Ollama, `qwen3:8b` |
| CLI | Readline, Inquirer, Chalk, Boxen, Ora |
| Terminal UI | Blessed, Blessed Contrib |
| Storage | SQLite |
| Testing | Jest |
| Linting | ESLint |

## Project Structure

```text
.
├── zion.js              # Main CLI entrypoint
├── apis/                # PDF, security, voice, and self-modification helpers
├── features/            # Public data/API integrations
├── modules/             # Commands, database, interface, help, and error handling
├── utils/               # Ollama client, security, logging, and shared helpers
├── tests/               # Jest test suite
├── setup.js             # Interactive environment setup
├── package.json         # Scripts and dependencies
└── requirements.txt     # Optional Python dependencies for experiments
```

## Running Locally

**Requirements:** Node.js 16+, npm, and Ollama.

```bash
# 1. Clone the repository
git clone https://github.com/ViniciusZanonato/ZION.git
cd ZION

# 2. Install dependencies
npm install

# 3. Prepare the local model
ollama pull qwen3:8b

# 4. Configure environment variables
cp .env.example .env
npm run setup

# 5. Start the CLI
npm start
```

If Ollama is not already running, start it in another terminal:

```bash
ollama serve
```

## Basic Usage

After starting ZION, try:

```text
/help
/diagnostics
/interface advanced
Explain what ZION does in one sentence.
```

Use `Ctrl+C` to leave the advanced terminal UI or exit the CLI.

## Scripts

```bash
npm start          # Run the ZION CLI
npm run dev        # Run with nodemon
npm run setup      # Interactive .env setup
npm test           # Run Jest tests
npm run lint       # Run ESLint
npm run validate   # Run lint + tests
```

## Environment Variables

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:8b
OLLAMA_CODE_MODEL=qwen3:8b
MAX_TOKENS=2000
TEMPERATURE=0.7
PDF_MAX_TOKENS=8000
PDF_TEMPERATURE=0.3
CODE_MAX_TOKENS=4000
CODE_TEMPERATURE=0.1
ZION_SYSTEM_PROMPT=
```

Optional integrations are configured through `.env.example`, including OpenWeather, News API, NASA, Alpha Vantage, FRED, SecurityTrails, Whois providers, VirusTotal, AbuseIPDB, and Shodan.

Never commit `.env`, local databases, generated reports, logs, backups, or machine-specific files.

## Testing

```bash
npm run validate
```

Current validation covers linting plus the Jest suites for the Ollama client, command processor, database module, help system, and security utilities.

## Roadmap

- Harden command coverage with integration tests
- Improve advanced terminal UI command execution feedback
- Add CI workflow for linting and tests
- Split optional API features behind clearer provider configuration
- Document security boundaries for self-modification and pentest helpers

## License

MIT - see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built by <a href="https://viniciuszanonato.github.io">Vinicius Zanonato</a> &nbsp;·&nbsp;
  <a href="https://github.com/ViniciusZanonato">GitHub</a> &nbsp;·&nbsp;
  <a href="https://www.linkedin.com/in/carlos-vinicius-garcia-zanonato-453832346">LinkedIn</a>
</div>

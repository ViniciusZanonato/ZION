# ZION System Documentation

## Overview

ZION is a local-first AI terminal assistant built with Node.js. It routes commands through a modular CLI, uses Ollama for local model inference, stores runtime data in SQLite, and exposes optional integrations for documents, public APIs, voice utilities, OSINT, and authorized security research.

The current default model is `qwen3:8b`.

## Architecture

```text
zion.js
├── modules/
│   ├── command-processor.js
│   ├── database.js
│   ├── help-system.js
│   ├── interface.js
│   └── error-handler.js
├── apis/
│   ├── pdf-analyzer.js
│   ├── security.js
│   ├── self-modifier.js
│   └── voice-system.js
├── features/
│   ├── weather.js
│   ├── news.js
│   ├── nasa.js
│   ├── arxiv.js
│   ├── osint.js
│   └── pentest.js
└── utils/
    ├── ollama-client.js
    ├── security.js
    ├── logger.js
    └── conversationManager.js
```

## Core Runtime

- `zion.js` initializes the CLI, command processor, database module, feature modules, and Ollama client.
- `utils/ollama-client.js` wraps the Ollama `/api/chat` endpoint and provides a small compatibility adapter for modules that expect a `generateContent` style API.
- `modules/command-processor.js` maps slash commands to handlers.
- `modules/help-system.js` stores command metadata and renders contextual help.
- `modules/database.js` manages SQLite-backed conversations and settings.
- `modules/interface.js` provides the optional advanced terminal UI.

## Ollama Configuration

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:8b
OLLAMA_CODE_MODEL=qwen3:8b
MAX_TOKENS=2000
TEMPERATURE=0.7
```

Run the default model locally:

```bash
ollama pull qwen3:8b
ollama serve
```

## Command Groups

### System

| Command | Description |
|---------|-------------|
| `/help` | Show the command catalog |
| `/clear` | Clear the current conversation |
| `/prompt` | Update the system prompt |
| `/diagnostics` | Show runtime diagnostics |
| `/interface` | Switch terminal interface mode |
| `/terminate` | Exit the CLI |

### Information and Research

| Command | Description |
|---------|-------------|
| `/scan <location>` | Geolocation lookup |
| `/weather <city>` | Weather lookup |
| `/intel <topic>` | News/topic lookup |
| `/space` | NASA data helpers |
| `/papers <topic>` | ArXiv search |
| `/time [timezone]` | Timezone lookup |
| `/nations <country>` | Country data |
| `/compute <expression>` | Safe math calculation |

### Documents

| Command | Description |
|---------|-------------|
| `/pdf-scan` | List PDFs in the working directory |
| `/pdf-analyze <file>` | Analyze a PDF with the local model |
| `/pdf-ask <file> <question>` | Ask a question about a PDF |
| `/pdf-extract <file> <type>` | Extract structured data from a PDF |

### Security Research

| Command | Description |
|---------|-------------|
| `/osint-*` | OSINT lookup helpers |
| `/pentest-*` | Authorized testing helpers |
| `/api-security` | Security intelligence helper |

Security and pentest commands must only be used against systems where testing is authorized.

## Validation

```bash
npm run validate
```

This runs ESLint and the Jest test suite.

## Runtime Data

The following files are local runtime artifacts and must stay out of commits:

- `.env`
- `data/*.db`
- `logs/`
- `coverage/`
- `backups/`
- generated reports and scratch files

## Maintenance Notes

- Keep the default model documented in `README.md`, `.env.example`, and `utils/ollama-client.js`.
- Add tests when changing shared command behavior.
- Keep optional API integrations resilient when provider keys are missing.
- Avoid committing local data, logs, generated coverage, or backups.

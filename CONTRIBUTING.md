# Contributing

Thanks for considering a contribution to ZION.

## Development Setup

```bash
npm install
cp .env.example .env
ollama pull qwen3:8b
npm start
```

## Before Opening a Pull Request

Run the validation suite:

```bash
npm run validate
```

Keep contributions focused and avoid committing local runtime files such as `.env`, SQLite databases, logs, coverage reports, backups, or generated scratch files.

## Security Boundaries

OSINT and pentest helpers are intended only for authorized research. Do not submit changes that encourage unauthorized scanning, credential abuse, evasion, or destructive behavior.

const fetch = require('node-fetch');

const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
const DEFAULT_OLLAMA_MODEL = 'qwen3:8b';

class OllamaClient {
    constructor(options = {}) {
        this.baseUrl = (options.baseUrl || process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, '');
        this.model = options.model || process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
        this.temperature = Number.parseFloat(options.temperature ?? process.env.TEMPERATURE ?? '0.7');
        this.maxTokens = Number.parseInt(options.maxTokens ?? process.env.MAX_TOKENS ?? '2000', 10);
    }

    createModel(options = {}) {
        const client = new OllamaClient({
            baseUrl: options.baseUrl || this.baseUrl,
            model: options.model || this.model,
            temperature: options.temperature ?? this.temperature,
            maxTokens: options.maxTokens ?? this.maxTokens
        });

        return {
            generateContent: async (prompt) => client.generateContent(prompt)
        };
    }

    async generateContent(prompt, options = {}) {
        const text = await this.generateText(prompt, options);

        return {
            response: {
                text: () => text,
                usageMetadata: {
                    totalTokenCount: 0
                }
            }
        };
    }

    async generateText(prompt, options = {}) {
        const model = options.model || this.model;
        const temperature = Number.parseFloat(options.temperature ?? this.temperature);
        const maxTokens = Number.parseInt(options.maxTokens ?? this.maxTokens, 10);

        let response;
        try {
            response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    stream: false,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    options: {
                        temperature,
                        num_predict: maxTokens
                    }
                })
            });
        } catch (error) {
            throw new Error(`Ollama indisponível em ${this.baseUrl}. Inicie o Ollama e rode "ollama pull ${model}". Detalhe: ${error.message}`);
        }

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama retornou HTTP ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const content = data && data.message && data.message.content;

        if (!content) {
            throw new Error('Ollama não retornou conteúdo na resposta');
        }

        return content;
    }
}

module.exports = {
    OllamaClient,
    DEFAULT_OLLAMA_BASE_URL,
    DEFAULT_OLLAMA_MODEL
};

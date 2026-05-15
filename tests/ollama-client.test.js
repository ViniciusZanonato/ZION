const { OllamaClient, DEFAULT_OLLAMA_BASE_URL, DEFAULT_OLLAMA_MODEL } = require('../utils/ollama-client');

describe('OllamaClient', () => {
  test('uses the project default model and local endpoint', () => {
    const client = new OllamaClient();

    expect(client.baseUrl).toBe(process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL);
    expect(client.model).toBe(process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL);
    expect(DEFAULT_OLLAMA_MODEL).toBe('qwen3:8b');
  });

  test('creates generateContent-compatible model adapters', () => {
    const client = new OllamaClient({ model: 'qwen3:8b' });
    const model = client.createModel();

    expect(typeof model.generateContent).toBe('function');
  });
});

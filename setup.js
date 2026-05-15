#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { DEFAULT_OLLAMA_BASE_URL, DEFAULT_OLLAMA_MODEL } = require('./utils/ollama-client');

console.log(chalk.cyan.bold('\n🤖 CONFIGURAÇÃO INICIAL DO ZION \n'));

async function setup() {
    try {
        const envPath = path.join(__dirname, '.env');
        const envExists = fs.existsSync(envPath);

        if (envExists) {
            const { overwrite } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'overwrite',
                    message: 'Arquivo .env já existe. Deseja reconfigurar?',
                    default: false
                }
            ]);

            if (!overwrite) {
                console.log(chalk.yellow('\n⚠️  Configuração cancelada.'));
                console.log(chalk.gray('Execute "npm start" para iniciar o ZION.\n'));
                return;
            }
        }

        const { baseUrl, model } = await inquirer.prompt([
            {
                type: 'input',
                name: 'baseUrl',
                message: 'URL local do Ollama:',
                default: DEFAULT_OLLAMA_BASE_URL,
                validate: (input) => input.trim().startsWith('http') || 'Informe uma URL válida, ex: http://127.0.0.1:11434'
            },
            {
                type: 'input',
                name: 'model',
                message: 'Modelo Ollama padrão do ZION:',
                default: DEFAULT_OLLAMA_MODEL,
                validate: (input) => input.trim().length > 0 || 'Informe um modelo, ex: qwen3:8b'
            }
        ]);

        const { advanced } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'advanced',
                message: 'Deseja configurar opções avançadas?',
                default: false
            }
        ]);

        let temperature = '0.7';
        let maxTokens = '2000';
        let codeModel = model;
        let customPrompt = '';

        if (advanced) {
            const advancedConfig = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'codeModel',
                    message: 'Modelo para tarefas de código/auto-modificação:',
                    default: model
                },
                {
                    type: 'number',
                    name: 'temperature',
                    message: 'Temperatura (criatividade 0.0-2.0):',
                    default: 0.7,
                    validate: (input) => {
                        if (input < 0 || input > 2) {
                            return 'A temperatura deve estar entre 0.0 e 2.0';
                        }
                        return true;
                    }
                },
                {
                    type: 'number',
                    name: 'maxTokens',
                    message: 'Máximo de tokens por resposta:',
                    default: 2000,
                    validate: (input) => {
                        if (input < 100 || input > 16000) {
                            return 'O número de tokens deve estar entre 100 e 16000';
                        }
                        return true;
                    }
                },
                {
                    type: 'confirm',
                    name: 'customPrompt',
                    message: 'Deseja definir um prompt personalizado?',
                    default: false
                }
            ]);

            codeModel = advancedConfig.codeModel.trim() || model;
            temperature = advancedConfig.temperature.toString();
            maxTokens = advancedConfig.maxTokens.toString();

            if (advancedConfig.customPrompt) {
                const { prompt } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'prompt',
                        message: 'Digite o prompt personalizado (uma linha):',
                        default: 'Você é ZION, um chatbot local que roda no terminal usando Ollama.'
                    }
                ]);
                customPrompt = prompt.trim();
            }
        }

        const envContent = `# Ollama local
OLLAMA_BASE_URL=${baseUrl.trim()}
OLLAMA_MODEL=${model.trim()}
OLLAMA_CODE_MODEL=${codeModel.trim()}

# Configuração do servidor
PORT=3000

# Prompt personalizado para o ZION
ZION_SYSTEM_PROMPT="${customPrompt || 'Você é ZION, um chatbot local com IA avançada que roda no terminal usando Ollama. Você pode executar diversas tarefas como mostrar mapas em ASCII, criar tabelas, gráficos, fazer cálculos, pesquisas e muito mais. Sempre responda de forma útil e criativa, utilizando recursos visuais quando apropriado.'}"

# Configurações do modelo
MAX_TOKENS=${maxTokens}
TEMPERATURE=${temperature}
PDF_MAX_TOKENS=8000
PDF_TEMPERATURE=0.3
CODE_MAX_TOKENS=4000
CODE_TEMPERATURE=0.1`;

        fs.writeFileSync(envPath, envContent);

        console.log(chalk.green('\n✅ Configuração concluída com sucesso!'));
        console.log(chalk.cyan('\nAntes de iniciar, garanta que o Ollama esteja rodando e que o modelo exista:'));
        console.log(chalk.yellow(`ollama pull ${model.trim()}`));
        console.log(chalk.cyan('\n🚀 Para iniciar o ZION, execute:'));
        console.log(chalk.yellow('npm start'));
        console.log();

        const { startNow } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'startNow',
                message: 'Deseja iniciar o ZION agora?',
                default: false
            }
        ]);

        if (startNow) {
            console.log(chalk.cyan('\n🎆 Iniciando ZION...\n'));
            require('./zion.js');
        }

    } catch (error) {
        console.error(chalk.red('\n❌ Erro durante a configuração:'), error.message);
        console.log(chalk.yellow('\nTente configurar manualmente editando o arquivo .env'));
    }
}

if (require.main === module) {
    setup();
}

module.exports = setup;

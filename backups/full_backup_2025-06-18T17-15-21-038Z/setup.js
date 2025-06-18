#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

console.log(chalk.cyan.bold('\n🤖 CONFIGURAÇÃO INICIAL DO ZION \n'));

async function setup() {
    try {
        // Verificar se .env já existe
        const envPath = path.join(__dirname, '.env');
        let envExists = fs.existsSync(envPath);
        
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
        
        // Solicitar chave da API
        const { apiKey } = await inquirer.prompt([
            {
                type: 'password',
                name: 'apiKey',
                message: 'Digite sua chave da API do Google Gemini:',
                mask: '*',
                validate: (input) => {
                    if (!input.trim()) {
                        return 'A chave da API é obrigatória!';
                    }
                    if (input.length < 20) {
                        return 'Chave da API muito curta. Verifique se está correta.';
                    }
                    return true;
                }
            }
        ]);
        
        // Configurações opcionais
        const { advanced } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'advanced',
                message: 'Deseja configurar opções avançadas?',
                default: false
            }
        ]);
        
        let model = 'gemini-2.5-pro';
        let temperature = '0.7';
        let maxTokens = '2000';
        let customPrompt = '';
        
        if (advanced) {
            const advancedConfig = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'model',
                    message: 'Escolha o modelo da IA:',
                    choices: [
                        { name: 'Gemini 2.5 Pro (Mais avançado)', value: 'gemini-2.5-pro' },
                        { name: 'Gemini 1.5 Flash (Rápido)', value: 'gemini-1.5-flash' },
                        { name: 'Gemini 1.5 Pro (Mais preciso)', value: 'gemini-1.5-pro' },
                        { name: 'Gemini Pro', value: 'gemini-pro' }
                    ],
                    default: 'gemini-2.5-pro'
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
                        if (input < 100 || input > 8000) {
                            return 'O número de tokens deve estar entre 100 e 8000';
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
            
            model = advancedConfig.model;
            temperature = advancedConfig.temperature.toString();
            maxTokens = advancedConfig.maxTokens.toString();
            
            if (advancedConfig.customPrompt) {
                const { prompt } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'prompt',
                        message: 'Digite o prompt personalizado (uma linha):',
                        default: 'Você é ZION, um chatbot supremo com IA avançada que roda no terminal.'
                    }
                ]);
                customPrompt = prompt.trim();
            }
        }
        
        // Criar conteúdo do .env
        const envContent = `# Configuração da API do Gemini
GEMINI_API_KEY=${apiKey}

# Configuração do servidor
PORT=3000

# Prompt personalizado para o ZION
ZION_SYSTEM_PROMPT="${customPrompt || 'Você é ZION, um chatbot supremo com inteligência artificial avançada que roda no terminal. Você pode executar diversas tarefas como mostrar mapas em ASCII, criar tabelas, gráficos, fazer cálculos, pesquisas e muito mais. Sempre responda de forma útil e criativa, utilizando recursos visuais quando apropriado.'}"

# Configurações do modelo
MODEL_NAME=${model}
MAX_TOKENS=${maxTokens}
TEMPERATURE=${temperature}`;
        
        // Salvar arquivo .env
        fs.writeFileSync(envPath, envContent);
        
        console.log(chalk.green('\n✅ Configuração concluída com sucesso!'));
        console.log(chalk.cyan('\n🚀 Para iniciar o ZION, execute:'));
        console.log(chalk.yellow('npm start'));
        console.log();
        
        // Perguntar se quer iniciar agora
        const { startNow } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'startNow',
                message: 'Deseja iniciar o ZION agora?',
                default: true
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


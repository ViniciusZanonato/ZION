#!/usr/bin/env node
/**
 * Script de instalação das dependências Python para ZION
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class PythonInstaller {
    constructor() {
        this.pythonCommands = ['python', 'python3', 'py'];
        this.pythonPath = null;
    }

    async findPython() {
        console.log(chalk.blue('🐍 Procurando Python...'));
        
        for (const cmd of this.pythonCommands) {
            try {
                const result = await this.runCommand(cmd, ['--version']);
                if (result.includes('Python')) {
                    this.pythonPath = cmd;
                    console.log(chalk.green(`✅ Python encontrado: ${cmd} (${result.trim()})`));
                    return true;
                }
            } catch (error) {
                continue;
            }
        }
        
        console.log(chalk.red('❌ Python não encontrado!'));
        console.log(chalk.yellow('Por favor, instale Python 3.7+ em: https://python.org'));
        return false;
    }

    async runCommand(command, args = []) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, { stdio: 'pipe' });
            
            let output = '';
            let error = '';
            
            process.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            process.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(error || `Processo terminou com código ${code}`));
                }
            });
        });
    }

    async checkPip() {
        console.log(chalk.blue('📎 Verificando pip...'));
        
        try {
            const result = await this.runCommand(this.pythonPath, ['-m', 'pip', '--version']);
            console.log(chalk.green(`✅ pip encontrado: ${result.trim()}`));
            return true;
        } catch (error) {
            console.log(chalk.red('❌ pip não encontrado!'));
            console.log(chalk.yellow('Tentando instalar pip...'));
            
            try {
                await this.runCommand(this.pythonPath, ['-m', 'ensurepip', '--upgrade']);
                console.log(chalk.green('✅ pip instalado com sucesso!'));
                return true;
            } catch (pipError) {
                console.log(chalk.red('❌ Falha ao instalar pip'));
                return false;
            }
        }
    }

    async upgradePip() {
        console.log(chalk.blue('⬆️ Atualizando pip...'));
        
        try {
            await this.runCommand(this.pythonPath, ['-m', 'pip', 'install', '--upgrade', 'pip']);
            console.log(chalk.green('✅ pip atualizado!'));
        } catch (error) {
            console.log(chalk.yellow('⚠️  Falha ao atualizar pip (não é crítico)'));
        }
    }

    async installRequirements() {
        const requirementsPath = path.join(__dirname, 'requirements.txt');
        
        if (!fs.existsSync(requirementsPath)) {
            console.log(chalk.red('❌ Arquivo requirements.txt não encontrado!'));
            return false;
        }

        console.log(chalk.blue('📦 Instalando dependências Python...'));
        console.log(chalk.gray('Isso pode levar alguns minutos...\n'));

        try {
            const process = spawn(this.pythonPath, [
                '-m', 'pip', 'install', '-r', requirementsPath, '--user'
            ], {
                stdio: 'inherit'
            });

            return new Promise((resolve, reject) => {
                process.on('close', (code) => {
                    if (code === 0) {
                        console.log(chalk.green('\n✅ Dependências instaladas com sucesso!'));
                        resolve(true);
                    } else {
                        console.log(chalk.red('\n❌ Falha na instalação das dependências'));
                        reject(new Error(`Processo pip terminou com código ${code}`));
                    }
                });
            });
        } catch (error) {
            console.log(chalk.red('❌ Erro ao instalar dependências:'), error.message);
            return false;
        }
    }

    async testInstallation() {
        console.log(chalk.blue('🧪 Testando instalação...'));
        
        const packages = [
            'pyttsx3',
            'speech_recognition', 
            'pyautogui',
            'psutil'
        ];

        const results = {};
        
        for (const pkg of packages) {
            try {
                await this.runCommand(this.pythonPath, ['-c', `import ${pkg}; print('${pkg}: OK')`]);
                results[pkg] = true;
                console.log(chalk.green(`✅ ${pkg}`));
            } catch (error) {
                results[pkg] = false;
                console.log(chalk.red(`❌ ${pkg}`));
            }
        }

        const allInstalled = Object.values(results).every(installed => installed);
        
        if (allInstalled) {
            console.log(chalk.green('\n🎉 Todas as dependências foram instaladas com sucesso!'));
        } else {
            console.log(chalk.yellow('\n⚠️  Algumas dependências falharam. Você pode tentar reinstalar manualmente:'));
            
            Object.entries(results).forEach(([pkg, installed]) => {
                if (!installed) {
                    console.log(chalk.gray(`   pip install ${pkg}`));
                }
            });
        }
        
        return allInstalled;
    }

    async showUsageInstructions() {
        console.log(chalk.cyan('\n📚 COMO USAR:'));
        console.log(chalk.white('1. Inicie a ZION normalmente:'));
        console.log(chalk.gray('   node zion.js'));
        console.log(chalk.white('\n2. Use os comandos de voz:'));
        console.log(chalk.gray('   /voice speak "Olá mundo"'));
        console.log(chalk.gray('   /voice listen'));
        console.log(chalk.gray('   /voice start'));
        console.log(chalk.gray('   /tts "Teste de voz"'));
        console.log(chalk.gray('   /stt'));
        console.log(chalk.gray('   /control open "notepad"'));
        
        console.log(chalk.white('\n3. Comandos de voz suportados:'));
        console.log(chalk.gray('   - "abrir navegador"'));
        console.log(chalk.gray('   - "abrir calculadora"'));
        console.log(chalk.gray('   - "tirar screenshot"'));
        console.log(chalk.gray('   - "aumentar volume"'));
        console.log(chalk.gray('   - "bloquear tela"'));
        console.log(chalk.gray('   - E muitos outros...'));
        
        console.log(chalk.white('\n4. Para ver todos os comandos disponíveis:'));
        console.log(chalk.gray('   /help voice'));
        console.log();
    }

    async install() {
        console.log(chalk.blue('🔧 ZION - Instalador de Dependências Python'));
        console.log(chalk.gray('Configurando TTS, STT e controle do computador...\n'));
        
        try {
            // 1. Encontrar Python
            const pythonFound = await this.findPython();
            if (!pythonFound) {
                return false;
            }

            // 2. Verificar/instalar pip
            const pipOk = await this.checkPip();
            if (!pipOk) {
                return false;
            }

            // 3. Atualizar pip
            await this.upgradePip();

            // 4. Instalar dependências
            const installed = await this.installRequirements();
            if (!installed) {
                return false;
            }

            // 5. Testar instalação
            const tested = await this.testInstallation();
            
            // 6. Mostrar instruções
            await this.showUsageInstructions();
            
            return tested;
            
        } catch (error) {
            console.log(chalk.red('❌ Erro durante a instalação:'), error.message);
            return false;
        }
    }
}

// Executar instalação se chamado diretamente
if (require.main === module) {
    const installer = new PythonInstaller();
    
    installer.install().then(success => {
        if (success) {
            console.log(chalk.green('🎆 Instalação concluída com sucesso!'));
            process.exit(0);
        } else {
            console.log(chalk.red('❌ Instalação falhou. Verifique os erros acima.'));
            process.exit(1);
        }
    }).catch(error => {
        console.error(chalk.red('❌ Erro crítico:'), error.message);
        process.exit(1);
    });
}

module.exports = PythonInstaller;


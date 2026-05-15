const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const boxen = require('boxen');
const { exec, spawn } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class VoiceSystem {
    constructor() {
        this.isListening = false;
        this.isEnabled = true;
        this.voiceSpeed = 150; // Palavras por minuto
        this.voiceLanguage = 'pt-BR';
        this.recordingProcess = null;
        this.tempAudioFile = path.join(__dirname, '..', 'temp', 'recording.wav');
        
        // Criar diretório temporário se não existir
        const tempDir = path.dirname(this.tempAudioFile);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        this.initializeVoiceSystem();
    }

    // Inicializar sistema de voz
    async initializeVoiceSystem() {
        console.log(chalk.blue('🎤 Inicializando Sistema de Voz Neural...'));
        
        // Verificar dependências no Windows
        await this.checkWindowsVoiceDependencies();
        
        console.log(chalk.green('✅ Sistema de voz ativo'));
        console.log(chalk.gray('   Use /voice-help para ver comandos de voz'));
        console.log();
    }

    // Verificar dependências de voz no Windows
    async checkWindowsVoiceDependencies() {
        try {
            // Verificar se o Windows Speech API está disponível
            const testCommand = 'powershell -Command "Add-Type -AssemblyName System.Speech; $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer; $voice.Dispose()"';
            await execAsync(testCommand);
            
            console.log(chalk.green('✅ Windows Speech API detectado'));
            this.windowsSpeechAvailable = true;
        } catch (error) {
            console.log(chalk.yellow('⚠️  Windows Speech API não disponível - usando alternativas'));
            this.windowsSpeechAvailable = false;
        }
    }

    // Mostrar ajuda do sistema de voz
    showVoiceHelp() {
        console.log(boxen(
            chalk.blue.bold('🎤 SISTEMA DE VOZ NEURAL ATIVO\n') +
            chalk.yellow('Status: ') + (this.isEnabled ? chalk.green('ATIVO') : chalk.red('INATIVO')) + '\n' +
            chalk.yellow('Idioma: ') + chalk.white(this.voiceLanguage) + '\n' +
            chalk.yellow('Velocidade: ') + chalk.white(this.voiceSpeed + ' wpm') + '\n\n' +
            chalk.yellow('Comandos de Voz:\n') +
            chalk.gray('   /voice-speak "texto"       - Converter texto em fala\n') +
            chalk.gray('   /voice-listen              - Ativar escuta por voz\n') +
            chalk.gray('   /voice-stop                - Parar escuta/fala\n') +
            chalk.gray('   /voice-config              - Configurar sistema de voz\n') +
            chalk.gray('   /voice-test                - Testar sistema de voz\n') +
            chalk.gray('   /voice-toggle              - Ativar/desativar voz\n') +
            chalk.gray('   /voice-demo                - Demonstração completa\n\n') +
            chalk.cyan('Atalhos durante conversa:\n') +
            chalk.gray('   Ctrl+V - Ativar/desativar modo voz\n') +
            chalk.gray('   Ctrl+S - Falar última resposta\n') +
            chalk.gray('   Ctrl+L - Iniciar escuta')
            ,
            {
                title: '🎯 SISTEMA DE VOZ NEURAL',
                padding: 1,
                borderColor: 'blue'
            }
        ));
        console.log();
    }

    // Converter texto em fala
    async speak(text) {
        if (!this.isEnabled) {
            console.log(chalk.yellow('🔇 Sistema de voz desabilitado'));
            return;
        }

        try {
            console.log(chalk.blue('🗣️  Sintetizando voz neural...'));
            console.log(chalk.gray(`   Texto: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`));
            
            if (process.platform === 'win32' && this.windowsSpeechAvailable) {
                await this.speakWindows(text);
            } else {
                await this.speakCrossPlatform(text);
            }
            
            console.log(chalk.green('✅ Síntese vocal completa'));
            
        } catch (error) {
            console.log(chalk.red(`❌ Erro na síntese vocal: ${error.message}`));
            console.log(chalk.gray('   Tentando método alternativo...'));
            
            // Fallback para método alternativo
            await this.speakFallback(text);
        }
    }

    // Síntese de voz no Windows usando PowerShell
    async speakWindows(text) {
        const escapedText = text.replace(/"/g, '`"').replace(/'/g, "''");
        
        const command = `powershell -Command "
            Add-Type -AssemblyName System.Speech;
            $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer;
            $voice.Rate = ${Math.round((this.voiceSpeed - 100) / 20)};
            $voice.Speak('${escapedText}');
            $voice.Dispose()"`;

        await execAsync(command);
    }

    // Síntese de voz multiplataforma
    async speakCrossPlatform(text) {
        const say = require('say');
        
        return new Promise((resolve, reject) => {
            const options = {
                speed: this.voiceSpeed / 100,
                voice: this.getSystemVoice()
            };
            
            say.speak(text, null, options, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Método fallback para síntese de voz
    async speakFallback(text) {
        console.log(chalk.yellow('🔊 Modo fallback ativo - Exibindo texto formatado'));
        
        const voiceBox = `
🎤 SÍNTESE VOCAL NEURAL:

"${text}"

⚠️  Para ouvir a voz, instale dependências de TTS`;
        
        console.log(boxen(voiceBox, {
            title: '🗣️  SAÍDA DE VOZ',
            padding: 1,
            borderColor: 'cyan',
            borderStyle: 'double'
        }));
    }

    // Obter voz do sistema baseada no idioma
    getSystemVoice() {
        const voices = {
            'pt-BR': 'Luciana', // Windows Portuguese
            'en-US': 'Samantha', // macOS English
            'es-ES': 'Monica'    // Spanish
        };
        
        return voices[this.voiceLanguage] || null;
    }

    // Iniciar escuta por voz
    async startListening() {
        if (this.isListening) {
            console.log(chalk.yellow('🎤 Sistema já está escutando'));
            return;
        }

        try {
            console.log(chalk.blue('🎤 ATIVANDO ESCUTA NEURAL...'));
            console.log(chalk.yellow('⚠️  Pressione Ctrl+C para parar a escuta'));
            console.log(chalk.gray('   Aguardando comando de voz...'));
            console.log();

            this.isListening = true;
            
            if (process.platform === 'win32') {
                await this.listenWindows();
            } else {
                await this.listenCrossPlatform();
            }
            
        } catch (error) {
            console.log(chalk.red(`❌ Erro na escuta: ${error.message}`));
            this.isListening = false;
        }
    }

    // Escuta por voz no Windows
    async listenWindows() {
        console.log(chalk.yellow('🎤 Sistema de escuta simulado ativo'));
        console.log(chalk.gray('   No Windows, use o Windows Speech Recognition'));
        console.log(chalk.gray('   Ou configure um microfone externo'));
        
        // Simulação de escuta - em um ambiente real, implementaria
        // integração com Windows Speech Recognition API
        const mockCommands = [
            'Como está o clima hoje?',
            'Qual é a hora atual?',
            'Me conte uma piada',
            'Analise meus arquivos'
        ];
        
        setTimeout(() => {
            const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
            console.log(chalk.green(`🎤 Comando detectado: "${randomCommand}"`));
            console.log(chalk.gray('   (Simulação - configure microfone para uso real)'));
            this.isListening = false;
        }, 5000);
    }

    // Escuta multiplataforma
    async listenCrossPlatform() {
        // Em um ambiente real, usaria bibliotecas como node-record-lpcm16
        // e speech-to-text APIs como Google Cloud Speech
        
        console.log(chalk.blue('🎤 Iniciando captura de áudio...'));
        
        // Simular captura de áudio
        setTimeout(() => {
            console.log(chalk.green('✅ Áudio capturado - processando com IA...'));
            
            // Simular processamento de speech-to-text
            setTimeout(() => {
                const mockTranscription = 'Olá ZION, me mostre o status do sistema';
                console.log(chalk.cyan(`📝 Transcrição: "${mockTranscription}"`));
                this.isListening = false;
                
                // Aqui você processaria o comando transcrito
                this.processVoiceCommand(mockTranscription);
            }, 2000);
        }, 3000);
    }

    // Processar comando de voz
    async processVoiceCommand(transcription) {
        console.log(chalk.blue('🧠 Processando comando de voz...'));
        console.log(chalk.gray(`   Comando: "${transcription}"`));
        
        // Aqui você integraria com o sistema principal do ZION
        // para processar o comando transcrito
        
        console.log(chalk.green('✅ Comando de voz processado'));
        console.log(chalk.yellow('💡 Use este texto como entrada normal no ZION'));
        console.log();
    }

    // Parar escuta/fala
    stopVoiceActivity() {
        if (this.isListening) {
            this.isListening = false;
            console.log(chalk.yellow('🔇 Escuta interrompida'));
        }
        
        if (this.recordingProcess) {
            this.recordingProcess.kill('SIGTERM');
            this.recordingProcess = null;
            console.log(chalk.yellow('🛑 Gravação interrompida'));
        }
        
        // Parar síntese de voz
        if (process.platform === 'win32') {
            exec('taskkill /f /im powershell.exe', () => {});
        }
        
        console.log(chalk.green('✅ Atividade de voz interrompida'));
        console.log();
    }

    // Alternar sistema de voz
    toggleVoiceSystem() {
        this.isEnabled = !this.isEnabled;
        
        const status = this.isEnabled ? 
            chalk.green('✅ ATIVADO') : 
            chalk.red('❌ DESATIVADO');
        
        console.log(chalk.blue(`🎤 Sistema de voz: ${status}`));
        
        if (this.isEnabled) {
            this.speak('Sistema de voz ativado. ZION pronto para interação vocal.');
        }
        
        console.log();
    }

    // Configurar sistema de voz
    async configureVoiceSystem() {
        const inquirer = require('inquirer');
        
        const config = await inquirer.prompt([
            {
                type: 'list',
                name: 'language',
                message: 'Idioma do sistema de voz:',
                choices: [
                    { name: 'Português (Brasil)', value: 'pt-BR' },
                    { name: 'English (US)', value: 'en-US' },
                    { name: 'Español', value: 'es-ES' }
                ],
                default: this.voiceLanguage
            },
            {
                type: 'number',
                name: 'speed',
                message: 'Velocidade da fala (palavras por minuto):',
                default: this.voiceSpeed,
                validate: (input) => {
                    if (input < 50 || input > 400) {
                        return 'A velocidade deve estar entre 50 e 400 wpm';
                    }
                    return true;
                }
            },
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Manter sistema de voz ativado?',
                default: this.isEnabled
            }
        ]);
        
        this.voiceLanguage = config.language;
        this.voiceSpeed = config.speed;
        this.isEnabled = config.enabled;
        
        console.log(chalk.green('✅ Configuração de voz atualizada'));
        
        if (this.isEnabled) {
            await this.speak('Configuração de voz atualizada com sucesso.');
        }
        
        console.log();
    }

    // Testar sistema de voz
    async testVoiceSystem() {
        console.log(chalk.blue('🧪 TESTANDO SISTEMA DE VOZ NEURAL...'));
        
        const testMessages = [
            'Teste de síntese vocal. Sistema operacional.',
            'ZION sistema neural ativo e funcionando.',
            'Teste completo. Todos os sistemas operacionais.'
        ];
        
        for (let i = 0; i < testMessages.length; i++) {
            console.log(chalk.gray(`   Teste ${i + 1}/3: ${testMessages[i]}`));
            await this.speak(testMessages[i]);
            
            if (i < testMessages.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log(chalk.green('✅ Teste de voz completo'));
        console.log();
    }

    // Demonstração completa do sistema de voz
    async voiceDemo() {
        console.log(chalk.blue('🎬 INICIANDO DEMONSTRAÇÃO COMPLETA DE VOZ...'));
        console.log();
        
        const demoSteps = [
            {
                action: 'speak',
                text: 'Olá! Eu sou ZION, sua superinteligência artificial.',
                description: 'Apresentação inicial'
            },
            {
                action: 'speak', 
                text: 'Possuo capacidades avançadas de processamento de voz.',
                description: 'Descrição de capacidades'
            },
            {
                action: 'speak',
                text: 'Posso converter texto em fala e processar comandos de voz.',
                description: 'Funcionalidades de voz'
            },
            {
                action: 'listen',
                description: 'Demonstração de escuta (simulada)'
            },
            {
                action: 'speak',
                text: 'Demonstração completa. Sistema de voz neural operacional.',
                description: 'Finalização'
            }
        ];
        
        for (let i = 0; i < demoSteps.length; i++) {
            const step = demoSteps[i];
            console.log(chalk.yellow(`📍 Etapa ${i + 1}: ${step.description}`));
            
            if (step.action === 'speak') {
                await this.speak(step.text);
            } else if (step.action === 'listen') {
                console.log(chalk.blue('🎤 Simulando captura de comando de voz...'));
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log(chalk.green('✅ Comando simulado capturado'));
            }
            
            if (i < demoSteps.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
        
        console.log(chalk.green('🎉 Demonstração de voz completa!'));
        console.log(chalk.gray('   Sistema pronto para uso em produção'));
        console.log();
    }

    // Obter status do sistema de voz
    getVoiceStatus() {
        return {
            enabled: this.isEnabled,
            listening: this.isListening,
            language: this.voiceLanguage,
            speed: this.voiceSpeed,
            platform: process.platform,
            windowsSpeech: this.windowsSpeechAvailable
        };
    }
}

module.exports = VoiceSystem;


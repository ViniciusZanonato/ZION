const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const boxen = require('boxen');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class SelfModifier {
    constructor() {
        this.projectRoot = path.dirname(__dirname);
        this.backupDir = path.join(this.projectRoot, 'backups');
        this.allowedFiles = [
            'zion.js',
            'setup.js',
            'package.json',
            'apis/self-modifier.js',
            'apis/voice-system.js',
            // Allow creating/modifying files in these directories
            'apis/*.js',
            'scripts/*.js',
            'temp/*.js',
            'temp/*.txt',
            'temp/*.json',
            '*.js',
            '*.txt',
            '*.json',
            '*.md'
        ];
        
        // Criar diretório de backup se não existir
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
        
        // Inicializar Gemini para análise de código
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ 
                model: 'gemini-1.5-pro',
                generationConfig: {
                    maxOutputTokens: 4000,
                    temperature: 0.1, // Mais conservador para modificações de código
                }
            });
        }
    }

    // Listar arquivos modificáveis
    listModifiableFiles() {
        console.log(boxen(
            chalk.red.bold('🛠️  SISTEMA DE AUTO-MODIFICAÇÃO ATIVO\n') +
            chalk.yellow('Arquivos que posso modificar:\n') +
            this.allowedFiles.map(file => 
                chalk.gray(`   • ${file}`) + 
                (fs.existsSync(path.join(this.projectRoot, file)) ? 
                    chalk.green(' ✓') : chalk.red(' ✗'))
            ).join('\n') +
            '\n\n' +
            chalk.yellow('Comandos disponíveis:\n') +
            chalk.gray('   /self-analyze <arquivo>    - Analisar arquivo atual\n') +
            chalk.gray('   /self-modify <arquivo>     - Modificar arquivo específico\n') +
            chalk.gray('   /self-backup               - Criar backup completo\n') +
            chalk.gray('   /self-restore <backup>     - Restaurar de backup\n') +
            chalk.gray('   /self-improve              - Auto-aprimoramento geral')
            ,
            {
                title: '⚠️  CAPACIDADES DE AUTO-MODIFICAÇÃO',
                padding: 1,
                borderColor: 'red'
            }
        ));
        console.log();
    }

    // Criar backup de arquivo específico
    createBackup(filePath) {
        try {
            const fullPath = path.join(this.projectRoot, filePath);
            if (!fs.existsSync(fullPath)) {
                throw new Error(`Arquivo ${filePath} não encontrado`);
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `${path.basename(filePath, path.extname(filePath))}_${timestamp}${path.extname(filePath)}`;
            const backupPath = path.join(this.backupDir, backupName);

            fs.copyFileSync(fullPath, backupPath);
            
            console.log(chalk.green(`✅ Backup criado: ${backupName}`));
            return backupPath;
        } catch (error) {
            console.log(chalk.red(`❌ Erro ao criar backup: ${error.message}`));
            return null;
        }
    }

    // Criar backup completo do sistema
    createFullBackup() {
        console.log(chalk.red('🔄 INICIANDO BACKUP COMPLETO DO SISTEMA...'));
        console.log(chalk.gray('   Preservando estado atual antes de modificações...'));
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFolder = path.join(this.backupDir, `full_backup_${timestamp}`);
        
        try {
            fs.mkdirSync(backupFolder, { recursive: true });
            
            this.allowedFiles.forEach(file => {
                const sourcePath = path.join(this.projectRoot, file);
                if (fs.existsSync(sourcePath)) {
                    const targetPath = path.join(backupFolder, file);
                    const targetDir = path.dirname(targetPath);
                    
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }
                    
                    fs.copyFileSync(sourcePath, targetPath);
                }
            });
            
            console.log(chalk.green(`✅ Backup completo criado em: ${path.basename(backupFolder)}`));
            return backupFolder;
        } catch (error) {
            console.log(chalk.red(`❌ Erro no backup completo: ${error.message}`));
            return null;
        }
    }

    // Analisar arquivo atual
    async analyzeFile(filePath) {
        if (!this.model) {
            console.log(chalk.red('❌ IA não disponível para análise'));
            return;
        }

        if (!this.isFileAllowed(filePath)) {
            console.log(chalk.red(`❌ Arquivo ${filePath} não está na lista de arquivos modificáveis`));
            return;
        }

        const fullPath = path.join(this.projectRoot, filePath);
        if (!fs.existsSync(fullPath)) {
            console.log(chalk.red(`❌ Arquivo ${filePath} não encontrado`));
            return;
        }

        try {
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            const fileStats = fs.statSync(fullPath);
            
            console.log(chalk.red('🔍 ANALISANDO ESTRUTURA DO ARQUIVO...'));
            console.log(chalk.gray(`   Arquivo: ${filePath}`));
            console.log(chalk.gray(`   Tamanho: ${fileStats.size} bytes`));
            console.log(chalk.gray(`   Linhas: ${fileContent.split('\n').length}`));
            console.log(chalk.gray('   Executando análise neural profunda...'));
            console.log();

            const analysisPrompt = `
Analise este arquivo ${path.extname(filePath)} e forneça um relatório técnico detalhado:

${fileContent}

Forneça:
1. Estrutura e organização do código
2. Qualidade e padrões utilizados
3. Possíveis melhorias ou otimizações
4. Vulnerabilidades ou problemas
5. Sugestões de novas funcionalidades

Seja técnico e específico.`;

            const result = await this.model.generateContent(analysisPrompt);
            const analysis = await result.response.text();

            console.log(boxen(analysis, {
                title: `🔍 ANÁLISE NEURAL: ${filePath}`,
                padding: 1,
                borderColor: 'cyan'
            }));
            
        } catch (error) {
            console.log(chalk.red(`❌ Erro na análise: ${error.message}`));
        }
        console.log();
    }

    // Modificar arquivo específico com IA
    async modifyFile(filePath, modification) {
        if (!this.model) {
            console.log(chalk.red('❌ IA não disponível para modificação'));
            return;
        }

        if (!this.isFileAllowed(filePath)) {
            console.log(chalk.red(`❌ Arquivo ${filePath} não está na lista de arquivos modificáveis`));
            return;
        }

        const fullPath = path.join(this.projectRoot, filePath);
        const fileExists = fs.existsSync(fullPath);
        
        // If file doesn't exist, we'll create it
        if (!fileExists) {
            console.log(chalk.yellow(`⚠️  Arquivo ${filePath} não existe - será criado`));
            // Ensure directory exists
            const fileDir = path.dirname(fullPath);
            if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true });
            }
        }

        try {
            let originalContent = '';
            
            // Only create backup if file exists
            if (fileExists) {
                const backupPath = this.createBackup(filePath);
                if (!backupPath) {
                    console.log(chalk.red('❌ Falha no backup - abortando modificação'));
                    return;
                }
                originalContent = fs.readFileSync(fullPath, 'utf8');
            } else {
                console.log(chalk.green('✅ Criando novo arquivo (sem backup necessário)'));
            }
            
            console.log(chalk.red('🧠 PROCESSANDO MODIFICAÇÃO NEURAL...'));
            console.log(chalk.gray(`   Arquivo: ${filePath}`));
            console.log(chalk.gray(`   Modificação: ${modification}`));
            console.log(chalk.gray('   Gerando código otimizado...'));
            console.log();

            const modificationPrompt = fileExists ? `
Você é um sistema de auto-modificação de código. Modifique o seguinte arquivo ${path.extname(filePath)} conforme solicitado.

ARQUIVO ATUAL:
${originalContent}

MODIFICAÇÃO SOLICITADA:
${modification}

RETORNE APENAS O CÓDIGO MODIFICADO COMPLETO, SEM EXPLICAÇÕES ADICIONAIS. O código deve estar funcional e otimizado.` : `
Você é um sistema de criação de arquivos. Crie um novo arquivo ${path.extname(filePath)} conforme solicitado.

ARQUIVO A CRIAR:
${filePath}

CONTEÚDO SOLICITADO:
${modification}

RETORNE APENAS O CÓDIGO/CONTEÚDO COMPLETO DO NOVO ARQUIVO, SEM EXPLICAÇÕES ADICIONAIS. O código deve estar funcional e otimizado.`;

            const result = await this.model.generateContent(modificationPrompt);
            const modifiedContent = await result.response.text();

            // Remover possíveis marcadores de código
            const cleanContent = modifiedContent
                .replace(/```[a-zA-Z]*\n?/g, '')
                .replace(/```/g, '')
                .trim();

            // Salvar o arquivo modificado
            fs.writeFileSync(fullPath, cleanContent, 'utf8');

            if (fileExists) {
                console.log(chalk.green('✅ MODIFICAÇÃO APLICADA COM SUCESSO'));
                console.log(chalk.yellow('⚠️  Reinicie o ZION para aplicar as mudanças'));
                console.log(chalk.gray(`   Backup disponível na pasta backups/`));
            } else {
                console.log(chalk.green('✅ ARQUIVO CRIADO COM SUCESSO'));
                console.log(chalk.blue(`📄 Novo arquivo: ${filePath}`));
            }
            
        } catch (error) {
            console.log(chalk.red(`❌ Erro na modificação: ${error.message}`));
        }
        console.log();
    }

    // Auto-aprimoramento do sistema
    async selfImprove() {
        if (!this.model) {
            console.log(chalk.red('❌ IA não disponível para auto-aprimoramento'));
            return;
        }

        console.log(chalk.red('🚀 INICIANDO PROCESSO DE AUTO-APRIMORAMENTO...'));
        console.log(chalk.yellow('⚠️  ESTA OPERAÇÃO PODE MODIFICAR MÚLTIPLOS ARQUIVOS'));
        console.log(chalk.gray('   Analisando todo o sistema para identificar melhorias...'));
        console.log();

        // Criar backup completo primeiro
        const backupPath = this.createFullBackup();
        if (!backupPath) {
            console.log(chalk.red('❌ Falha no backup - abortando auto-aprimoramento'));
            return;
        }

        try {
            // Analisar arquivo principal
            const mainFile = path.join(this.projectRoot, 'zion.js');
            const mainContent = fs.readFileSync(mainFile, 'utf8');

            const improvementPrompt = `
Analise este sistema de chatbot e sugira melhorias específicas:

${mainContent}

Identifique:
1. Otimizações de performance
2. Novas funcionalidades úteis
3. Melhorias na experiência do usuário
4. Correções de bugs potenciais
5. Estruturação de código

Forneca uma lista priorizada de melhorias que posso implementar.`;

            const result = await this.model.generateContent(improvementPrompt);
            const improvements = await result.response.text();

            console.log(boxen(improvements, {
                title: '🧠 ANÁLISE DE AUTO-APRIMORAMENTO',
                padding: 1,
                borderColor: 'green'
            }));
            
            console.log(chalk.yellow('\n🔧 Para aplicar melhorias específicas, use:'));
            console.log(chalk.gray('   /self-modify <arquivo> "<descrição da melhoria>"'));
            
        } catch (error) {
            console.log(chalk.red(`❌ Erro no auto-aprimoramento: ${error.message}`));
        }
        console.log();
    }

    // Listar backups disponíveis
    listBackups() {
        try {
            const backups = fs.readdirSync(this.backupDir)
                .filter(item => {
                    const itemPath = path.join(this.backupDir, item);
                    return fs.statSync(itemPath).isFile() || fs.statSync(itemPath).isDirectory();
                })
                .sort((a, b) => {
                    const aPath = path.join(this.backupDir, a);
                    const bPath = path.join(this.backupDir, b);
                    return fs.statSync(bPath).mtime - fs.statSync(aPath).mtime;
                });

            if (backups.length === 0) {
                console.log(chalk.yellow('📁 Nenhum backup encontrado'));
                return;
            }

            console.log(boxen(
                chalk.red.bold('📦 BACKUPS DISPONÍVEIS\n') +
                backups.slice(0, 10).map((backup, index) => {
                    const backupPath = path.join(this.backupDir, backup);
                    const stats = fs.statSync(backupPath);
                    const isDir = stats.isDirectory();
                    const date = stats.mtime.toLocaleString('pt-BR');
                    
                    return chalk.gray(`[${index + 1}] `) + 
                           (isDir ? chalk.blue('📁 ') : chalk.green('📄 ')) +
                           chalk.white(backup) + 
                           chalk.gray(` (${date})`);
                }).join('\n'),
                {
                    title: '💾 SISTEMA DE BACKUP',
                    padding: 1,
                    borderColor: 'blue'
                }
            ));
            
        } catch (error) {
            console.log(chalk.red(`❌ Erro ao listar backups: ${error.message}`));
        }
        console.log();
    }

    // Restaurar de backup
    restoreFromBackup(backupName) {
        try {
            const backupPath = path.join(this.backupDir, backupName);
            
            if (!fs.existsSync(backupPath)) {
                console.log(chalk.red(`❌ Backup ${backupName} não encontrado`));
                return;
            }

            console.log(chalk.yellow('🔄 RESTAURANDO DO BACKUP...'));
            console.log(chalk.gray(`   Backup: ${backupName}`));

            const stats = fs.statSync(backupPath);
            
            if (stats.isDirectory()) {
                // Restaurar backup completo
                const files = this.getAllFilesRecursive(backupPath);
                
                files.forEach(file => {
                    const relativePath = path.relative(backupPath, file);
                    const targetPath = path.join(this.projectRoot, relativePath);
                    const targetDir = path.dirname(targetPath);
                    
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }
                    
                    fs.copyFileSync(file, targetPath);
                });
                
                console.log(chalk.green('✅ Backup completo restaurado'));
            } else {
                // Restaurar arquivo único
                const fileName = path.basename(backupName).replace(/_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z/, '');
                const targetPath = path.join(this.projectRoot, fileName);
                
                fs.copyFileSync(backupPath, targetPath);
                console.log(chalk.green(`✅ Arquivo ${fileName} restaurado`));
            }
            
            console.log(chalk.yellow('⚠️  Reinicie o ZION para aplicar as mudanças'));
            
        } catch (error) {
            console.log(chalk.red(`❌ Erro na restauração: ${error.message}`));
        }
        console.log();
    }

    // Check if file is allowed based on patterns (including wildcards)
    isFileAllowed(filePath) {
        return this.allowedFiles.some(pattern => {
            // Exact match
            if (pattern === filePath) {
                return true;
            }
            
            // Wildcard pattern matching
            if (pattern.includes('*')) {
                const regexPattern = pattern
                    .replace(/\./g, '\\.')  // Escape dots
                    .replace(/\*/g, '.*');   // Convert * to .*
                const regex = new RegExp(`^${regexPattern}$`);
                return regex.test(filePath);
            }
            
            return false;
        });
    }

    // Função auxiliar para obter todos os arquivos recursivamente
    getAllFilesRecursive(dir) {
        let files = [];
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                files = files.concat(this.getAllFilesRecursive(itemPath));
            } else {
                files.push(itemPath);
            }
        });
        
        return files;
    }
}

module.exports = SelfModifier;


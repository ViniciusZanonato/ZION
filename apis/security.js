// ===================================================================
// 🔐 MÓDULO DE VIGILÂNCIA DIGITAL - ZION SUPREMO
// Implementação de APIs de segurança e monitoramento digital
// ===================================================================

const fetch = require('node-fetch');
const crypto = require('crypto');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const Table = require('cli-table3');

class SecurityModule {
    constructor() {
        this.name = 'VIGILÂNCIA DIGITAL';
        this.description = 'Monitoramento de segurança e análise de vulnerabilidades';
        this.hibpApiUrl = 'https://haveibeenpwned.com/api/v3';
    }

    // Have I Been Pwned - Verificar vazamentos de dados
    async checkEmailBreaches(email) {
        const spinner = ora(chalk.red(`🔍 Analisando vazamentos de dados para: ${email}...`)).start();
        
        try {
            const url = `${this.hibpApiUrl}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'ZION-Security-Scanner/1.0',
                    'Accept': 'application/json'
                }
            });
            
            if (response.status === 404) {
                spinner.succeed(chalk.green('✅ Nenhum vazamento detectado nos bancos de dados'));
                console.log(boxen(
                    chalk.green.bold('🛡️ STATUS: SEGURO\n') +
                    chalk.white(`📧 Email: ${email}\n`) +
                    chalk.green('✅ Não foram encontrados vazamentos de dados\n') +
                    chalk.gray('🔍 Análise baseada em dados públicos de vazamentos'),
                    {
                        padding: 1,
                        borderColor: 'green',
                        title: '🔒 RELATÓRIO DE SEGURANÇA'
                    }
                ));
                return [];
            }
            
            if (!response.ok) {
                throw new Error(`Erro na consulta: ${response.status}`);
            }
            
            const breaches = await response.json();
            spinner.succeed(chalk.yellow(`⚠️ ${breaches.length} vazamento(s) detectado(s)`));
            
            this.displayBreachReport(email, breaches);
            return breaches;
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NA ANÁLISE DE SEGURANÇA'));
            console.log(chalk.red(`❌ Erro: ${error.message}`));
            return null;
        }
    }

    // Exibir relatório detalhado de vazamentos
    displayBreachReport(email, breaches) {
        const table = new Table({
            head: [chalk.red('VAZAMENTO'), chalk.yellow('DATA'), chalk.cyan('DADOS EXPOSTOS'), chalk.magenta('SEVERIDADE')],
            colWidths: [25, 12, 40, 12]
        });
        
        breaches.forEach(breach => {
            const severity = this.calculateSeverity(breach);
            const dataTypes = breach.DataClasses ? breach.DataClasses.join(', ') : 'N/A';
            const date = new Date(breach.BreachDate).toLocaleDateString('pt-BR');
            
            table.push([
                chalk.white(breach.Name),
                chalk.white(date),
                chalk.white(dataTypes.substring(0, 35) + (dataTypes.length > 35 ? '...' : '')),
                this.getSeverityColor(severity)
            ]);
        });
        
        console.log(boxen(
            chalk.red.bold('🚨 VAZAMENTOS DE DADOS DETECTADOS\n') +
            chalk.yellow(`📧 Email: ${email}\n`) +
            chalk.white(`📊 Total de vazamentos: ${breaches.length}\n`) +
            chalk.gray('🔍 Análise baseada em dados públicos de vazamentos'),
            {
                padding: 1,
                borderColor: 'red',
                title: '⚠️ ALERTA DE SEGURANÇA'
            }
        ));
        
        console.log('\n' + table.toString());
        
        // Recomendações de segurança
        this.showSecurityRecommendations(breaches);
    }

    // Calcular severidade do vazamento
    calculateSeverity(breach) {
        let score = 0;
        
        if (breach.DataClasses) {
            const sensitiveData = ['Passwords', 'Email addresses', 'Phone numbers', 'Credit cards', 'Social security numbers'];
            breach.DataClasses.forEach(dataClass => {
                if (sensitiveData.includes(dataClass)) {
                    score += 2;
                } else {
                    score += 1;
                }
            });
        }
        
        if (breach.IsVerified) score += 1;
        if (breach.IsSensitive) score += 2;
        
        if (score >= 8) return 'CRÍTICA';
        if (score >= 5) return 'ALTA';
        if (score >= 3) return 'MÉDIA';
        return 'BAIXA';
    }

    // Colorir severidade
    getSeverityColor(severity) {
        switch(severity) {
            case 'CRÍTICA': return chalk.red.bold(severity);
            case 'ALTA': return chalk.red(severity);
            case 'MÉDIA': return chalk.yellow(severity);
            case 'BAIXA': return chalk.green(severity);
            default: return chalk.gray(severity);
        }
    }

    // Verificar senhas comprometidas (SHA-1)
    async checkPasswordPwned(password) {
        const spinner = ora(chalk.red('🔐 Verificando integridade da senha...')).start();
        
        try {
            // Gerar hash SHA-1 da senha
            const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
            const prefix = sha1Hash.substring(0, 5);
            const suffix = sha1Hash.substring(5);
            
            const url = `https://api.pwnedpasswords.com/range/${prefix}`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'ZION-Security-Scanner/1.0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erro na consulta: ${response.status}`);
            }
            
            const data = await response.text();
            const hashes = data.split('\n');
            
            for (const hash of hashes) {
                const [hashSuffix, count] = hash.split(':');
                if (hashSuffix === suffix) {
                    spinner.fail(chalk.red('⚠️ SENHA COMPROMETIDA'));
                    console.log(boxen(
                        chalk.red.bold('🚨 ALERTA DE SEGURANÇA\n') +
                        chalk.yellow('🔓 Sua senha foi encontrada em vazamentos de dados\n') +
                        chalk.white(`📊 Aparições: ${parseInt(count).toLocaleString()} vezes\n`) +
                        chalk.red('⚠️ RECOMENDAÇÃO: Altere sua senha imediatamente'),
                        {
                            padding: 1,
                            borderColor: 'red',
                            title: '💀 SENHA COMPROMETIDA'
                        }
                    ));
                    return { compromised: true, count: parseInt(count) };
                }
            }
            
            spinner.succeed(chalk.green('✅ Senha não encontrada em vazamentos'));
            console.log(boxen(
                chalk.green.bold('🛡️ STATUS: SEGURA\n') +
                chalk.white('🔐 Sua senha não foi encontrada em vazamentos públicos\n') +
                chalk.green('✅ Continue usando práticas seguras de senha'),
                {
                    padding: 1,
                    borderColor: 'green',
                    title: '🔒 SENHA SEGURA'
                }
            ));
            
            return { compromised: false, count: 0 };
            
        } catch (error) {
            spinner.fail(chalk.red('FALHA NA VERIFICAÇÃO DE SENHA'));
            console.log(chalk.red(`❌ Erro: ${error.message}`));
            return null;
        }
    }

    // Mostrar recomendações de segurança
    showSecurityRecommendations(breaches) {
        const recommendations = [
            '🔐 Altere senhas de contas afetadas imediatamente',
            '🔑 Use senhas únicas para cada serviço',
            '📱 Ative autenticação de dois fatores (2FA)',
            '📧 Monitore suas contas regularmente',
            '🛡️ Use um gerenciador de senhas confiável',
            '🔍 Verifique regularmente por vazamentos'
        ];
        
        console.log(boxen(
            chalk.cyan.bold('🛡️ RECOMENDAÇÕES DE SEGURANÇA\n') +
            recommendations.map(rec => chalk.white(rec)).join('\n'),
            {
                padding: 1,
                borderColor: 'cyan',
                title: '💡 DICAS DE PROTEÇÃO'
            }
        ));
    }

    // Análise de força da senha
    analyzePasswordStrength(password) {
        let score = 0;
        const analysis = {
            length: password.length,
            hasLower: /[a-z]/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSymbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            strength: 'MUITO FRACA'
        };
        
        // Pontuação baseada em critérios
        if (analysis.length >= 8) score += 2;
        if (analysis.length >= 12) score += 1;
        if (analysis.hasLower) score += 1;
        if (analysis.hasUpper) score += 1;
        if (analysis.hasNumbers) score += 1;
        if (analysis.hasSymbols) score += 2;
        
        // Determinar força da senha
        if (score >= 7) analysis.strength = 'MUITO FORTE';
        else if (score >= 5) analysis.strength = 'FORTE';
        else if (score >= 3) analysis.strength = 'MÉDIA';
        else if (score >= 1) analysis.strength = 'FRACA';
        
        return analysis;
    }

    // Gerar relatório completo de segurança
    async generateSecurityReport(email, password = null) {
        console.log(chalk.red.bold('\n🔍 INICIANDO ANÁLISE COMPLETA DE SEGURANÇA...\n'));
        
        const breaches = await this.checkEmailBreaches(email);
        let passwordAnalysis = null;
        
        if (password) {
            console.log('\n');
            passwordAnalysis = await this.checkPasswordPwned(password);
            
            console.log('\n');
            const strengthAnalysis = this.analyzePasswordStrength(password);
            this.displayPasswordStrengthReport(strengthAnalysis);
        }
        
        return {
            email,
            breaches,
            passwordAnalysis
        };
    }

    // Exibir relatório de força da senha
    displayPasswordStrengthReport(analysis) {
        const strengthColor = {
            'MUITO FORTE': chalk.green.bold,
            'FORTE': chalk.green,
            'MÉDIA': chalk.yellow,
            'FRACA': chalk.red,
            'MUITO FRACA': chalk.red.bold
        };
        
        console.log(boxen(
            chalk.cyan.bold('🔐 ANÁLISE DE FORÇA DA SENHA\n') +
            chalk.white(`📏 Comprimento: ${analysis.length} caracteres\n`) +
            chalk.white(`🔤 Minúsculas: ${analysis.hasLower ? '✅' : '❌'}\n`) +
            chalk.white(`🔠 Maiúsculas: ${analysis.hasUpper ? '✅' : '❌'}\n`) +
            chalk.white(`🔢 Números: ${analysis.hasNumbers ? '✅' : '❌'}\n`) +
            chalk.white(`🔣 Símbolos: ${analysis.hasSymbols ? '✅' : '❌'}\n`) +
            `\n🎯 FORÇA: ${strengthColor[analysis.strength](analysis.strength)}`,
            {
                padding: 1,
                borderColor: 'cyan',
                title: '💪 FORÇA DA SENHA'
            }
        ));
    }
}

module.exports = SecurityModule;


const axios = require('axios');
const chalk = require('chalk');
const Table = require('cli-table3');
const ora = require('ora');

class JSONPlaceholderModule {
    constructor() {
        this.baseURL = 'https://jsonplaceholder.typicode.com';
        this.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'ZION-Chatbot/1.0'
        };
        this.moduleInfo = {
            name: 'JSONPlaceholder',
            version: '1.0.0',
            description: 'Módulo para interagir com a API JSONPlaceholder - dados fictícios para teste',
            endpoints: [
                'Posts', 'Comments', 'Albums', 'Photos', 'Todos', 'Users'
            ]
        };
    }

    // Método para exibir informações do módulo
    getModuleInfo() {
        console.log(chalk.cyan.bold('\n📦 JSONPlaceholder API Module'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.white(`Nome: ${this.moduleInfo.name}`));
        console.log(chalk.white(`Versão: ${this.moduleInfo.version}`));
        console.log(chalk.white(`Descrição: ${this.moduleInfo.description}`));
        console.log(chalk.white(`Endpoints disponíveis: ${this.moduleInfo.endpoints.join(', ')}`));
        console.log(chalk.gray('─'.repeat(50)));
    }

    // Buscar todos os posts
    async getAllPosts() {
        const spinner = ora(chalk.blue('Buscando todos os posts...')).start();
        try {
            const response = await axios.get(`${this.baseURL}/posts`, {
                headers: this.headers,
                timeout: 10000
            });

            spinner.succeed(chalk.green('Posts carregados com sucesso!'));
            
            const table = new Table({
                head: [chalk.cyan('ID'), chalk.cyan('Título'), chalk.cyan('Autor'), chalk.cyan('Preview')],
                colWidths: [5, 40, 10, 50]
            });

            response.data.slice(0, 10).forEach(post => {
                table.push([
                    chalk.yellow(post.id),
                    chalk.white(post.title.length > 35 ? post.title.substring(0, 35) + '...' : post.title),
                    chalk.green(`User ${post.userId}`),
                    chalk.gray(post.body.length > 45 ? post.body.substring(0, 45) + '...' : post.body)
                ]);
            });

            console.log('\n' + table.toString());
            console.log(chalk.blue(`\n📊 Total de posts encontrados: ${response.data.length} (mostrando os primeiros 10)`));
            
            return response.data;
        } catch (error) {
            spinner.fail(chalk.red('Erro ao buscar posts'));
            console.error(chalk.red('❌ Erro:'), error.message);
            return null;
        }
    }

    // Buscar post específico por ID
    async getPostById(postId) {
        const spinner = ora(chalk.blue(`Buscando post ${postId}...`)).start();
        try {
            const response = await axios.get(`${this.baseURL}/posts/${postId}`, {
                headers: this.headers,
                timeout: 10000
            });

            spinner.succeed(chalk.green('Post encontrado!'));
            
            console.log(chalk.cyan.bold('\n📝 Detalhes do Post'));
            console.log(chalk.gray('─'.repeat(60)));
            console.log(chalk.yellow(`ID: ${response.data.id}`));
            console.log(chalk.green(`Autor: User ${response.data.userId}`));
            console.log(chalk.white.bold(`Título: ${response.data.title}`));
            console.log(chalk.white(`\nConteúdo:\n${response.data.body}`));
            console.log(chalk.gray('─'.repeat(60)));
            
            return response.data;
        } catch (error) {
            spinner.fail(chalk.red(`Erro ao buscar post ${postId}`));
            console.error(chalk.red('❌ Erro:'), error.response?.status === 404 ? 'Post não encontrado' : error.message);
            return null;
        }
    }

    // Buscar comentários de um post
    async getPostComments(postId) {
        const spinner = ora(chalk.blue(`Buscando comentários do post ${postId}...`)).start();
        try {
            const response = await axios.get(`${this.baseURL}/posts/${postId}/comments`, {
                headers: this.headers,
                timeout: 10000
            });

            spinner.succeed(chalk.green('Comentários carregados!'));
            
            const table = new Table({
                head: [chalk.cyan('ID'), chalk.cyan('Nome'), chalk.cyan('Email'), chalk.cyan('Comentário')],
                colWidths: [5, 20, 25, 40]
            });

            response.data.forEach(comment => {
                table.push([
                    chalk.yellow(comment.id),
                    chalk.white(comment.name.length > 17 ? comment.name.substring(0, 17) + '...' : comment.name),
                    chalk.green(comment.email),
                    chalk.gray(comment.body.length > 37 ? comment.body.substring(0, 37) + '...' : comment.body)
                ]);
            });

            console.log('\n' + table.toString());
            console.log(chalk.blue(`\n💬 Total de comentários: ${response.data.length}`));
            
            return response.data;
        } catch (error) {
            spinner.fail(chalk.red('Erro ao buscar comentários'));
            console.error(chalk.red('❌ Erro:'), error.message);
            return null;
        }
    }

    // Buscar todos os usuários
    async getAllUsers() {
        const spinner = ora(chalk.blue('Buscando usuários...')).start();
        try {
            const response = await axios.get(`${this.baseURL}/users`, {
                headers: this.headers,
                timeout: 10000
            });

            spinner.succeed(chalk.green('Usuários carregados!'));
            
            const table = new Table({
                head: [chalk.cyan('ID'), chalk.cyan('Nome'), chalk.cyan('Username'), chalk.cyan('Email'), chalk.cyan('Cidade')],
                colWidths: [5, 20, 15, 25, 15]
            });

            response.data.forEach(user => {
                table.push([
                    chalk.yellow(user.id),
                    chalk.white(user.name),
                    chalk.green(user.username),
                    chalk.blue(user.email),
                    chalk.gray(user.address.city)
                ]);
            });

            console.log('\n' + table.toString());
            console.log(chalk.blue(`\n👥 Total de usuários: ${response.data.length}`));
            
            return response.data;
        } catch (error) {
            spinner.fail(chalk.red('Erro ao buscar usuários'));
            console.error(chalk.red('❌ Erro:'), error.message);
            return null;
        }
    }

    // Buscar álbuns
    async getAllAlbums() {
        const spinner = ora(chalk.blue('Buscando álbuns...')).start();
        try {
            const response = await axios.get(`${this.baseURL}/albums`, {
                headers: this.headers,
                timeout: 10000
            });

            spinner.succeed(chalk.green('Álbuns carregados!'));
            
            const table = new Table({
                head: [chalk.cyan('ID'), chalk.cyan('Título'), chalk.cyan('Proprietário')],
                colWidths: [5, 50, 15]
            });

            response.data.slice(0, 15).forEach(album => {
                table.push([
                    chalk.yellow(album.id),
                    chalk.white(album.title),
                    chalk.green(`User ${album.userId}`)
                ]);
            });

            console.log('\n' + table.toString());
            console.log(chalk.blue(`\n📸 Total de álbuns: ${response.data.length} (mostrando os primeiros 15)`));
            
            return response.data;
        } catch (error) {
            spinner.fail(chalk.red('Erro ao buscar álbuns'));
            console.error(chalk.red('❌ Erro:'), error.message);
            return null;
        }
    }

    // Buscar fotos de um álbum
    async getAlbumPhotos(albumId) {
        const spinner = ora(chalk.blue(`Buscando fotos do álbum ${albumId}...`)).start();
        try {
            const response = await axios.get(`${this.baseURL}/albums/${albumId}/photos`, {
                headers: this.headers,
                timeout: 10000
            });

            spinner.succeed(chalk.green('Fotos carregadas!'));
            
            const table = new Table({
                head: [chalk.cyan('ID'), chalk.cyan('Título'), chalk.cyan('URL Thumbnail')],
                colWidths: [5, 40, 45]
            });

            response.data.slice(0, 10).forEach(photo => {
                table.push([
                    chalk.yellow(photo.id),
                    chalk.white(photo.title.length > 37 ? photo.title.substring(0, 37) + '...' : photo.title),
                    chalk.blue(photo.thumbnailUrl)
                ]);
            });

            console.log('\n' + table.toString());
            console.log(chalk.blue(`\n🖼️ Total de fotos: ${response.data.length} (mostrando as primeiras 10)`));
            
            return response.data;
        } catch (error) {
            spinner.fail(chalk.red('Erro ao buscar fotos'));
            console.error(chalk.red('❌ Erro:'), error.message);
            return null;
        }
    }

    // Buscar todos os todos (tarefas)
    async getAllTodos() {
        const spinner = ora(chalk.blue('Buscando tarefas...')).start();
        try {
            const response = await axios.get(`${this.baseURL}/todos`, {
                headers: this.headers,
                timeout: 10000
            });

            spinner.succeed(chalk.green('Tarefas carregadas!'));
            
            const table = new Table({
                head: [chalk.cyan('ID'), chalk.cyan('Título'), chalk.cyan('Usuário'), chalk.cyan('Status')],
                colWidths: [5, 45, 10, 12]
            });

            response.data.slice(0, 15).forEach(todo => {
                const status = todo.completed ? 
                    chalk.green('✅ Completa') : 
                    chalk.red('❌ Pendente');
                
                table.push([
                    chalk.yellow(todo.id),
                    chalk.white(todo.title.length > 42 ? todo.title.substring(0, 42) + '...' : todo.title),
                    chalk.blue(`User ${todo.userId}`),
                    status
                ]);
            });

            console.log('\n' + table.toString());
            
            const completed = response.data.filter(todo => todo.completed).length;
            const pending = response.data.length - completed;
            
            console.log(chalk.blue(`\n📋 Total de tarefas: ${response.data.length}`));
            console.log(chalk.green(`✅ Completadas: ${completed}`));
            console.log(chalk.red(`❌ Pendentes: ${pending}`));
            
            return response.data;
        } catch (error) {
            spinner.fail(chalk.red('Erro ao buscar tarefas'));
            console.error(chalk.red('❌ Erro:'), error.message);
            return null;
        }
    }

    // Criar um novo post (simulação)
    async createPost(title, body, userId = 1) {
        const spinner = ora(chalk.blue('Criando novo post...')).start();
        try {
            const postData = {
                title: title,
                body: body,
                userId: userId
            };

            const response = await axios.post(`${this.baseURL}/posts`, postData, {
                headers: this.headers,
                timeout: 10000
            });

            spinner.succeed(chalk.green('Post criado com sucesso!'));
            
            console.log(chalk.cyan.bold('\n📝 Novo Post Criado'));
            console.log(chalk.gray('─'.repeat(50)));
            console.log(chalk.yellow(`ID: ${response.data.id}`));
            console.log(chalk.green(`Autor: User ${response.data.userId}`));
            console.log(chalk.white.bold(`Título: ${response.data.title}`));
            console.log(chalk.white(`\nConteúdo:\n${response.data.body}`));
            console.log(chalk.gray('─'.repeat(50)));
            console.log(chalk.blue('\n💡 Nota: Este é um post simulado - JSONPlaceholder não persiste dados reais'));
            
            return response.data;
        } catch (error) {
            spinner.fail(chalk.red('Erro ao criar post'));
            console.error(chalk.red('❌ Erro:'), error.message);
            return null;
        }
    }

    // Menu interativo
    async showMenu() {
        console.log(chalk.cyan.bold('\n🔧 JSONPlaceholder API - Menu Interativo'));
        console.log(chalk.gray('═'.repeat(55)));
        console.log(chalk.white('1. 📝 Ver todos os posts'));
        console.log(chalk.white('2. 🔍 Buscar post específico'));
        console.log(chalk.white('3. 💬 Ver comentários de um post'));
        console.log(chalk.white('4. 👥 Ver todos os usuários'));
        console.log(chalk.white('5. 📸 Ver todos os álbuns'));
        console.log(chalk.white('6. 🖼️ Ver fotos de um álbum'));
        console.log(chalk.white('7. 📋 Ver todas as tarefas'));
        console.log(chalk.white('8. ➕ Criar novo post'));
        console.log(chalk.white('9. ℹ️ Informações do módulo'));
        console.log(chalk.gray('═'.repeat(55)));
        console.log(chalk.yellow('💡 Use os métodos da classe para interagir programaticamente'));
    }

    // Demonstração completa
    async runDemo() {
        console.log(chalk.magenta.bold('\n🚀 Demonstração JSONPlaceholder API'));
        console.log(chalk.gray('═'.repeat(60)));
        
        // Informações do módulo
        this.getModuleInfo();
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Buscar alguns posts
        console.log(chalk.blue('\n1. Buscando posts...'));
        await this.getAllPosts();
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Buscar usuários
        console.log(chalk.blue('\n2. Buscando usuários...'));
        await this.getAllUsers();
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Buscar tarefas
        console.log(chalk.blue('\n3. Buscando tarefas...'));
        await this.getAllTodos();
        
        console.log(chalk.magenta.bold('\n✨ Demonstração concluída!'));
        console.log(chalk.yellow('💡 Use os métodos específicos para interações mais detalhadas'));
    }
}

module.exports = JSONPlaceholderModule;


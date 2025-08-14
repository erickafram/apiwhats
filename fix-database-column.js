#!/usr/bin/env node

/**
 * 🔧 SCRIPT PARA CORRIGIR ERRO DO BANCO DE DADOS
 * 
 * Erro: Unknown column 'Conversation.custom_status_id' in 'on clause'
 * Solução: Adicionar a coluna que está faltando
 * 
 * Execute: node fix-database-column.js
 */

const { Sequelize, DataTypes } = require('sequelize');
const chalk = require('chalk');

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'chatbot',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  logging: console.log,
  timezone: '+00:00'
});

async function fixDatabase() {
  console.log(chalk.cyan.bold('\n🔧 CORRIGINDO BANCO DE DADOS\n'));
  
  try {
    // Testar conexão
    console.log(chalk.blue('📊 Testando conexão com o banco...'));
    await sequelize.authenticate();
    console.log(chalk.green('✅ Conexão com banco estabelecida\n'));
    
    // Verificar se a coluna existe
    console.log(chalk.blue('🔍 Verificando estrutura da tabela conversations...'));
    const [results] = await sequelize.query("DESCRIBE conversations");
    
    const columns = results.map(row => row.Field);
    const hasCustomStatusId = columns.includes('custom_status_id');
    
    if (hasCustomStatusId) {
      console.log(chalk.yellow('ℹ️ Coluna custom_status_id já existe'));
    } else {
      console.log(chalk.red('❌ Coluna custom_status_id NÃO existe - adicionando...'));
      
      // Verificar se a tabela conversation_statuses existe
      console.log(chalk.blue('🔍 Verificando tabela conversation_statuses...'));
      const [tables] = await sequelize.query("SHOW TABLES LIKE 'conversation_statuses'");
      
      if (tables.length === 0) {
        console.log(chalk.yellow('⚠️ Tabela conversation_statuses não existe - criando...'));
        
        await sequelize.query(`
          CREATE TABLE conversation_statuses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            color VARCHAR(7) DEFAULT '#007bff',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        
        console.log(chalk.green('✅ Tabela conversation_statuses criada'));
        
        // Inserir status padrão
        await sequelize.query(`
          INSERT INTO conversation_statuses (name, description, color) VALUES
          ('Em Andamento', 'Conversa em andamento', '#007bff'),
          ('Aguardando', 'Aguardando resposta', '#ffc107'),
          ('Resolvido', 'Conversa resolvida', '#28a745'),
          ('Cancelado', 'Conversa cancelada', '#dc3545')
        `);
        
        console.log(chalk.green('✅ Status padrão inseridos'));
      }
      
      // Adicionar a coluna custom_status_id
      console.log(chalk.blue('🔧 Adicionando coluna custom_status_id...'));
      
      await sequelize.query(`
        ALTER TABLE conversations 
        ADD COLUMN custom_status_id INT NULL,
        ADD FOREIGN KEY (custom_status_id) REFERENCES conversation_statuses(id) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      
      console.log(chalk.green('✅ Coluna custom_status_id adicionada com sucesso'));
    }
    
    // Verificar outras colunas que podem estar faltando
    console.log(chalk.blue('\n🔍 Verificando outras colunas necessárias...'));
    
    const requiredColumns = [
      'assigned_operator_id',
      'current_flow_id',
      'bot_id',
      'status'
    ];
    
    for (const column of requiredColumns) {
      if (!columns.includes(column)) {
        console.log(chalk.yellow(`⚠️ Coluna ${column} está faltando`));
        
        let columnDef = '';
        switch (column) {
          case 'assigned_operator_id':
            columnDef = 'INT NULL';
            break;
          case 'current_flow_id':
            columnDef = 'INT NULL';
            break;
          case 'bot_id':
            columnDef = 'INT NOT NULL';
            break;
          case 'status':
            columnDef = "ENUM('pending', 'active', 'transferred', 'completed', 'archived') DEFAULT 'pending'";
            break;
        }
        
        if (columnDef) {
          await sequelize.query(`ALTER TABLE conversations ADD COLUMN ${column} ${columnDef}`);
          console.log(chalk.green(`✅ Coluna ${column} adicionada`));
        }
      }
    }
    
    console.log(chalk.green.bold('\n🎉 BANCO DE DADOS CORRIGIDO COM SUCESSO!\n'));
    console.log(chalk.gray('Agora você pode reiniciar o servidor com: pm2 restart chatbot-whats-api\n'));
    
  } catch (error) {
    console.error(chalk.red.bold('\n❌ ERRO AO CORRIGIR BANCO:'));
    console.error(chalk.red(error.message));
    console.error(chalk.gray('\nDetalhes:'), error);
  } finally {
    await sequelize.close();
  }
}

// Executar correção
fixDatabase(); 
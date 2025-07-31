const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração do banco
const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_chatbot',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log
  }
);

async function fixFlowsTable() {
  try {
    console.log('🔧 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado com sucesso!');

    console.log('🔧 Alterando coluna bot_id para permitir NULL...');
    
    // Alterar a coluna bot_id para permitir NULL
    await sequelize.query(`
      ALTER TABLE flows 
      MODIFY COLUMN bot_id int NULL
    `);
    
    console.log('✅ Coluna bot_id alterada com sucesso!');
    
    // Verificar a estrutura da tabela
    const [results] = await sequelize.query(`
      DESCRIBE flows
    `);
    
    console.log('📋 Estrutura atual da tabela flows:');
    console.table(results);
    
    console.log('🎉 Correção concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexão fechada.');
  }
}

// Executar a correção
fixFlowsTable();

const mysql = require('mysql2/promise');

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whatsapp_chatbot',
  charset: 'utf8mb4'
};

async function verificarFlowData() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Buscando fluxos...');
    const [flows] = await connection.execute(
      'SELECT id, name, JSON_LENGTH(flow_data) as json_length, LEFT(flow_data, 100) as preview FROM flows ORDER BY id LIMIT 3'
    );
    
    console.log('📋 Fluxos encontrados:');
    flows.forEach(flow => {
      console.log(`ID ${flow.id}: ${flow.name}`);
      console.log(`  JSON Length: ${flow.json_length}`);
      console.log(`  Preview: ${flow.preview}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

verificarFlowData().catch(console.error); 
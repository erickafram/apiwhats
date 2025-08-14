const mysql = require('mysql2/promise');
const fs = require('fs');

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whatsapp_chatbot',
  charset: 'utf8mb4'
};

async function corrigirFluxoDatabase() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📁 Lendo arquivo JSON correto...');
    const fluxoData = fs.readFileSync('fluxo-passagens-onibus.json', 'utf8');
    const fluxo = JSON.parse(fluxoData);
    
    console.log('📋 Fluxo carregado:', fluxo.name);
    
    // Verificar se o flow_data está correto no arquivo
    const welcomeNode = fluxo.flow_data.nodes.find(node => node.id === 'welcome');
    if (welcomeNode) {
      console.log('\n📝 CONTEÚDO DO WELCOME NO ARQUIVO:');
      console.log('════════════════════════════════════════');
      console.log(welcomeNode.content);
      console.log('════════════════════════════════════════');
      console.log(`🔍 Quebras de linha no arquivo: ${(welcomeNode.content.match(/\\n/g) || []).length}`);
    }
    
    // Atualizar o flow_data no banco
    console.log('\n🔄 Atualizando flow_data no banco...');
    await connection.execute(
      'UPDATE flows SET flow_data = ?, updated_at = NOW() WHERE id = 5',
      [JSON.stringify(fluxo.flow_data)]
    );
    
    console.log('✅ Flow_data atualizado!');
    
    // Verificar se foi atualizado corretamente
    console.log('\n🔍 Verificando atualização...');
    const [result] = await connection.execute(
      'SELECT flow_data FROM flows WHERE id = 5'
    );
    
    if (result.length > 0) {
      const flowDataFromDB = JSON.parse(result[0].flow_data);
      const welcomeNodeFromDB = flowDataFromDB.nodes.find(node => node.id === 'welcome');
      
      if (welcomeNodeFromDB) {
        console.log('\n📝 CONTEÚDO DO WELCOME NO BANCO (APÓS ATUALIZAÇÃO):');
        console.log('════════════════════════════════════════');
        console.log(welcomeNodeFromDB.content);
        console.log('════════════════════════════════════════');
        console.log(`🔍 Quebras de linha no banco: ${(welcomeNodeFromDB.content.match(/\\n/g) || []).length}`);
        
        if (welcomeNodeFromDB.content === welcomeNode.content) {
          console.log('\n✅ SUCESSO! O conteúdo no banco está igual ao arquivo!');
        } else {
          console.log('\n❌ PROBLEMA! O conteúdo não confere!');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

console.log('🚀 Corrigindo flow_data no banco...');
corrigirFluxoDatabase().catch(console.error); 
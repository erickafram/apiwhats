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

async function reativarFluxoOriginal() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    
    // Desativar o fluxo com botões
    console.log('🔄 Desativando fluxo com botões...');
    await connection.execute(
      'UPDATE flows SET is_active = 0, is_default = 0 WHERE name LIKE "%Botões%"'
    );
    
    // Reativar o fluxo original
    console.log('✅ Reativando fluxo original...');
    await connection.execute(
      'UPDATE flows SET is_active = 1, is_default = 1 WHERE name = "Sistema de Passagens de Ônibus" AND name NOT LIKE "%Botões%"'
    );
    
    // Verificar qual fluxo está ativo agora
    console.log('🔍 Verificando fluxo ativo...');
    const [activeFlow] = await connection.execute(
      'SELECT id, name, is_active, is_default, priority, version FROM flows WHERE is_active = 1 ORDER BY priority DESC'
    );
    
    if (activeFlow.length > 0) {
      console.log('\n🎯 FLUXO ATIVO AGORA:');
      activeFlow.forEach(flow => {
        console.log(`ID ${flow.id}: ${flow.name}`);
        console.log(`  Versão: ${flow.version}`);
        console.log(`  Prioridade: ${flow.priority}`);
        console.log(`  Padrão: ${flow.is_default ? '✅ SIM' : '❌ NÃO'}`);
      });
    }
    
    // Verificar o conteúdo do welcome para diagnóstico
    console.log('\n🔍 Verificando conteúdo do nó welcome...');
    const [flowData] = await connection.execute(
      'SELECT flow_data FROM flows WHERE is_active = 1 LIMIT 1'
    );
    
    if (flowData.length > 0) {
      const data = JSON.parse(flowData[0].flow_data);
      const welcomeNode = data.nodes.find(node => node.id === 'welcome');
      if (welcomeNode) {
        console.log('\n📝 CONTEÚDO DO WELCOME:');
        console.log(welcomeNode.content);
        console.log('\n🔍 Quebras de linha encontradas:', (welcomeNode.content.match(/\\n/g) || []).length);
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

console.log('🚀 Reativando fluxo original sem botões...');
reativarFluxoOriginal().catch(console.error);

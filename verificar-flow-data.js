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
      'SELECT id, name, is_active, is_default, priority, version FROM flows ORDER BY id'
    );
    
    console.log('📋 Fluxos encontrados:');
    flows.forEach(flow => {
      console.log(`\n═══════════════════════════════════════`);
      console.log(`ID ${flow.id}: ${flow.name}`);
      console.log(`  Ativo: ${flow.is_active ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`  Padrão: ${flow.is_default ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`  Prioridade: ${flow.priority}`);
      console.log(`  Versão: ${flow.version || 'N/A'}`);
    });
    
    console.log(`\n═══════════════════════════════════════`);
    console.log('\n🔍 Buscando fluxo padrão ativo...');
    const [activeFlow] = await connection.execute(
      'SELECT id, name, is_active, is_default, priority FROM flows WHERE is_active = 1 ORDER BY priority DESC, is_default DESC LIMIT 1'
    );
    
    if (activeFlow.length > 0) {
      console.log(`\n🎯 FLUXO SENDO USADO:`);
      console.log(`ID ${activeFlow[0].id}: ${activeFlow[0].name}`);
      console.log(`Prioridade: ${activeFlow[0].priority}`);
      
      // Verificar o conteúdo das mensagens
      console.log('\n🔍 Verificando conteúdo das mensagens...');
      const [flowDataResult] = await connection.execute(
        'SELECT flow_data FROM flows WHERE id = ?',
        [activeFlow[0].id]
      );
      
      if (flowDataResult.length > 0) {
        try {
          const rawFlowData = flowDataResult[0].flow_data;
          console.log('Tipo do flow_data:', typeof rawFlowData);
          console.log('É string?', typeof rawFlowData === 'string');
          
          const flowData = typeof rawFlowData === 'string' 
            ? JSON.parse(rawFlowData) 
            : rawFlowData;
          
          console.log(`\n📊 FLOW DATA ESTRUTURA:`);
          console.log(`- Número de nós: ${flowData.nodes?.length || 0}`);
          console.log(`- Número de edges: ${flowData.edges?.length || 0}`);
          
          // Verificar nó START
          const startNode = flowData.nodes.find(node => node.type === 'start');
          if (startNode) {
            console.log('\n🚀 NÓ START COMPLETO:');
            console.log('════════════════════════════════════════');
            console.log(JSON.stringify(startNode, null, 2));
            console.log('════════════════════════════════════════');
          } else {
            console.log('❌ Nó start não encontrado');
          }
          
          // Verificar nó WELCOME
          const welcomeNode = flowData.nodes.find(node => node.id === 'welcome');
          if (welcomeNode) {
            console.log('\n💬 NÓ WELCOME COMPLETO:');
            console.log('════════════════════════════════════════');
            console.log(JSON.stringify(welcomeNode, null, 2));
            console.log('════════════════════════════════════════');
            
            // Analisar o conteúdo
            const content = welcomeNode.data?.content || welcomeNode.content || '';
            console.log(`\n🔍 Análise do conteúdo:`);
            console.log(`- Caracteres \\n encontrados: ${(content.match(/\\n/g) || []).length}`);
            console.log(`- Comprimento total: ${content.length}`);
            console.log(`- Primeira linha: "${content.split('\\n')[0]}"`);
          } else {
            console.log('❌ Nó welcome não encontrado');
          }
          
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse do JSON:', parseError.message);
        }
      }
      
    } else {
      console.log('❌ Nenhum fluxo ativo encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

verificarFlowData().catch(console.error); 
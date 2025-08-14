const mysql = require('mysql2/promise');

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whatsapp_chatbot',
  charset: 'utf8mb4'
};

async function testarQuebrasLinha() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Buscando nó da mensagem de compra...');
    const [flows] = await connection.execute(
      `SELECT id, name, flow_data FROM flows 
       WHERE name LIKE "%passag%" OR name LIKE "%onibus%" OR name LIKE "%viação%" 
       ORDER BY id LIMIT 1`
    );
    
    if (flows.length === 0) {
      console.log('❌ Nenhum fluxo encontrado!');
      return;
    }
    
    const flow = flows[0];
    console.log(`📋 Analisando fluxo: ${flow.name}`);
    
    const flowData = JSON.parse(flow.flow_data);
    
    // Encontrar o nó de compra de passagem
    const compraNode = flowData.nodes.find(node => 
      node.id === 'comprar_destino' || 
      (node.content && node.content.includes('COMPRA DE PASSAGEM'))
    );
    
    if (!compraNode) {
      console.log('❌ Nó de compra não encontrado!');
      return;
    }
    
    console.log('\n📄 CONTEÚDO ATUAL DO NÓ:');
    console.log('========================');
    console.log(compraNode.content);
    console.log('========================');
    
    console.log('\n🔍 ANÁLISE DAS QUEBRAS DE LINHA:');
    const lines = compraNode.content.split('\n');
    console.log(`Total de linhas: ${lines.length}`);
    
    lines.forEach((line, i) => {
      if (line.trim() === '') {
        console.log(`${i + 1}: [LINHA VAZIA]`);
      } else {
        console.log(`${i + 1}: "${line}"`);
      }
    });
    
    // Verificar se tem quebras duplas (\n\n)
    const hasDoubleBreaks = compraNode.content.includes('\n\n');
    console.log(`\n✅ Tem quebras duplas: ${hasDoubleBreaks ? 'SIM' : 'NÃO'}`);
    
    // Contar caracteres especiais
    const newLineCount = (compraNode.content.match(/\n/g) || []).length;
    console.log(`✅ Total de \\n: ${newLineCount}`);
    
    console.log('\n✅ Fluxo analisado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

// Executar o teste
console.log('🚀 TESTANDO QUEBRAS DE LINHA NO FLUXO');
console.log('====================================');
testarQuebrasLinha().catch(console.error); 
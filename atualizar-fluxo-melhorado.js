const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whatsapp_chatbot',
  charset: 'utf8mb4'
};

async function atualizarFluxoMelhorado() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📄 Carregando fluxo melhorado do arquivo JSON...');
    const fluxoJson = await fs.readFile('fluxoonibus.json', 'utf8');
    const fluxoData = JSON.parse(fluxoJson);
    
    console.log('🔍 Procurando fluxo de passagens de ônibus...');
    const [flows] = await connection.execute(
      'SELECT id, name FROM flows WHERE name LIKE "%passag%" OR name LIKE "%onibus%" OR name LIKE "%viação%" ORDER BY id LIMIT 5'
    );
    
    if (flows.length === 0) {
      console.log('❌ Nenhum fluxo de passagens encontrado!');
      console.log('💡 Criando novo fluxo...');
      
      const [result] = await connection.execute(
        `INSERT INTO flows (bot_id, name, description, trigger_keywords, is_active, is_default, priority, flow_data, created_at, updated_at) 
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          fluxoData.name,
          fluxoData.description,
          JSON.stringify(fluxoData.trigger_keywords),
          fluxoData.is_active,
          fluxoData.is_default,
          fluxoData.priority,
          JSON.stringify(fluxoData.flow_data)
        ]
      );
      
      console.log('✅ Novo fluxo criado com ID:', result.insertId);
      
    } else {
      console.log('📋 Fluxos encontrados:');
      flows.forEach(flow => {
        console.log(`  ID ${flow.id}: ${flow.name}`);
      });
      
      // Usar o primeiro fluxo encontrado ou ID 5 se existir
      const targetFlow = flows.find(f => f.id === 5) || flows[0];
      const flowId = targetFlow.id;
      
      console.log(`🎯 Atualizando fluxo ID ${flowId}: ${targetFlow.name}`);
      
      await connection.execute(
        `UPDATE flows SET 
         name = ?, 
         description = ?, 
         trigger_keywords = ?, 
         is_active = ?, 
         is_default = ?, 
         priority = ?, 
         flow_data = ?, 
         updated_at = NOW() 
         WHERE id = ?`,
        [
          fluxoData.name,
          fluxoData.description,
          JSON.stringify(fluxoData.trigger_keywords),
          fluxoData.is_active,
          fluxoData.is_default,
          fluxoData.priority,
          JSON.stringify(fluxoData.flow_data),
          flowId
        ]
      );
      
      console.log('✅ Fluxo atualizado com sucesso!');
    }
    
    console.log('\n🎉 RESUMO DAS MELHORIAS APLICADAS:');
    console.log('✅ Destino livre - usuário pode digitar qualquer cidade');
    console.log('✅ Exemplos de cidades com quebras de linha');
    console.log('✅ Variável cidade_destino será substituída dinamicamente');
    console.log('✅ Opções de resposta em linhas separadas');
    console.log('✅ Formatação melhorada com quebras de linha');
    
    console.log('\n💡 COMO TESTAR:');
    console.log('1. Envie uma mensagem para o bot (ex: "oi")');
    console.log('2. Escolha "1" para Comprar Passagem');
    console.log('3. Digite qualquer cidade (ex: "Goiânia", "Brasília")');
    console.log('4. Verifique se a cidade aparece corretamente na confirmação');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

// Executar o script
console.log('🚀 ATUALIZANDO FLUXO COM DESTINO LIVRE');
console.log('=====================================');
atualizarFluxoMelhorado().catch(console.error); 
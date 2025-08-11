const mysql = require('mysql2/promise');
const fs = require('fs');

// Configuração do banco
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'whatsapp_chatbot'
};

async function atualizarFluxoComBotoes() {
  try {
    // Ler o arquivo JSON do fluxo com botões
    const fluxoData = JSON.parse(fs.readFileSync('fluxo-passagens-onibus-com-botoes.json', 'utf8'));
    
    // Conectar ao banco
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Primeiro, verificar fluxo atual
    const [currentFlows] = await connection.execute(
      'SELECT id, name, is_active, is_default FROM flows WHERE bot_id = 1'
    );
    
    console.log('📋 Fluxos atuais:');
    currentFlows.forEach(flow => {
      console.log(`- ID: ${flow.id}, Nome: ${flow.name}, Ativo: ${flow.is_active}, Padrão: ${flow.is_default}`);
    });

    // Desativar fluxo atual
    await connection.execute(
      'UPDATE flows SET is_active = 0, is_default = 0 WHERE bot_id = 1'
    );
    console.log('🔄 Fluxos anteriores desativados');

    // Inserir o novo fluxo com botões
    const insertQuery = `
      INSERT INTO flows (
        bot_id, 
        name, 
        description, 
        flow_data, 
        version, 
        is_active, 
        is_default, 
        trigger_keywords, 
        trigger_conditions, 
        priority, 
        statistics,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      1, // bot_id
      fluxoData.name,
      fluxoData.description,
      JSON.stringify(fluxoData.flow_data),
      fluxoData.version,
      fluxoData.is_active ? 1 : 0,
      fluxoData.is_default ? 1 : 0,
      JSON.stringify(fluxoData.trigger_keywords),
      JSON.stringify(fluxoData.trigger_conditions),
      fluxoData.priority,
      JSON.stringify(fluxoData.statistics)
    ];

    const [result] = await connection.execute(insertQuery, values);
    
    console.log('🎉 Novo fluxo com botões inserido com sucesso!');
    console.log('📋 ID do fluxo:', result.insertId);
    console.log('🏷️ Nome:', fluxoData.name);
    console.log('🔑 Keywords:', fluxoData.trigger_keywords.join(', '));
    console.log('✅ Ativo:', fluxoData.is_active);
    console.log('🏠 Padrão:', fluxoData.is_default);

    // Verificar se foi inserido corretamente
    const [newFlows] = await connection.execute(
      'SELECT id, name, is_active, is_default FROM flows WHERE bot_id = 1 ORDER BY id DESC'
    );
    
    console.log('\n📋 Fluxos após atualização:');
    newFlows.forEach(flow => {
      console.log(`- ID: ${flow.id}, Nome: ${flow.name}, Ativo: ${flow.is_active}, Padrão: ${flow.is_default}`);
    });

    await connection.end();
    console.log('✅ Banco de dados atualizado com sucesso!');
    console.log('\n🚀 Agora teste enviando "oi" no WhatsApp para ver os botões interativos!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  atualizarFluxoComBotoes();
}

module.exports = atualizarFluxoComBotoes; 
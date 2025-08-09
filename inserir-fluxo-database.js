const mysql = require('mysql2/promise');
const fs = require('fs');

// Configuração do banco
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'whatsapp_chatbot'
};

async function inserirFluxo() {
  try {
    // Ler o arquivo JSON do fluxo
    const fluxoData = JSON.parse(fs.readFileSync('fluxo-passagens-onibus.json', 'utf8'));
    
    // Conectar ao banco
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Primeiro, desativar o fluxo atual
    await connection.execute(
      'UPDATE flows SET is_active = 0, is_default = 0 WHERE bot_id = 1'
    );
    console.log('🔄 Fluxo anterior desativado');

    // Inserir o novo fluxo
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
    
    console.log('🎉 Novo fluxo inserido com sucesso!');
    console.log('📋 ID do fluxo:', result.insertId);
    console.log('🏷️ Nome:', fluxoData.name);
    console.log('🔑 Keywords:', fluxoData.trigger_keywords.join(', '));
    console.log('✅ Ativo:', fluxoData.is_active);
    console.log('🏠 Padrão:', fluxoData.is_default);

    // Verificar se foi inserido corretamente
    const [verificacao] = await connection.execute(
      'SELECT id, name, is_active, is_default, trigger_keywords FROM flows WHERE bot_id = 1 AND is_active = 1'
    );

    console.log('\n📊 Fluxos ativos no banco:');
    verificacao.forEach(flow => {
      console.log(`- ID: ${flow.id}, Nome: ${flow.name}, Ativo: ${flow.is_active}, Padrão: ${flow.is_default}`);
      console.log(`  Keywords: ${flow.trigger_keywords}`);
    });

    await connection.end();
    console.log('\n✅ Processo concluído com sucesso!');
    console.log('🔄 Agora reinicie o servidor PM2 para aplicar as mudanças.');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
inserirFluxo();

const mysql = require('mysql2/promise');
const fs = require('fs');

// Configuração do banco
const dbConfig = {
  host: 'localhost',
  user: 'chatbot',
  password: '@@2025@@Ekb',
  database: 'chatbot'
};

async function atualizarFluxoComBotoes() {
  try {
    // Ler o arquivo JSON do fluxo com botões
    const fluxoData = JSON.parse(fs.readFileSync('fluxo-passagens-onibus-com-botoes.json', 'utf8'));
    
    console.log('🔍 Verificando dados do fluxo:');
    console.log('- Nome:', fluxoData.name);
    console.log('- Descrição:', fluxoData.description);
    console.log('- Versão:', fluxoData.version);
    console.log('- Ativo:', fluxoData.is_active);
    console.log('- Padrão:', fluxoData.is_default);
    console.log('- Priority:', fluxoData.priority);
    console.log('- Keywords:', fluxoData.trigger_keywords);
    console.log('- Flow Data existe:', !!fluxoData.flow_data);
    console.log('- Statistics existe:', !!fluxoData.statistics);
    
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
      fluxoData.name || 'Sistema de Passagens de Ônibus - Com Botões Interativos',
      fluxoData.description || 'Fluxo com botões interativos para passagens de ônibus',
      JSON.stringify(fluxoData.flow_data || {}),
      fluxoData.version || '3.0.0',
      fluxoData.is_active !== false ? 1 : 0,
      fluxoData.is_default !== false ? 1 : 0,
      JSON.stringify(fluxoData.trigger_keywords || ["oi", "olá", "menu", "passagem", "onibus", "viagem", "start", "começar", "iniciar"]),
      JSON.stringify(fluxoData.trigger_conditions || {}),
      fluxoData.priority || 200,
      JSON.stringify(fluxoData.statistics || { total_executions: 0, successful_completions: 0, average_completion_time: 0, last_execution: null })
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
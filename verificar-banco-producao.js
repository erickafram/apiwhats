const mysql = require('mysql2/promise');

// Configuração do banco de PRODUÇÃO
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Ajustar se necessário
  database: 'whatsapp_chatbot'
};

async function verificarFluxos() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de produção');

    // Verificar fluxos ativos
    const [flows] = await connection.execute(`
      SELECT id, name, is_active, is_default, trigger_keywords, created_at 
      FROM flows 
      WHERE bot_id = 1 
      ORDER BY created_at DESC
    `);

    console.log('\n📊 FLUXOS NO BANCO DE PRODUÇÃO:');
    console.log('==========================================');
    
    flows.forEach(flow => {
      console.log(`ID: ${flow.id}`);
      console.log(`Nome: ${flow.name}`);
      console.log(`Ativo: ${flow.is_active ? '✅' : '❌'}`);
      console.log(`Padrão: ${flow.is_default ? '✅' : '❌'}`);
      console.log(`Keywords: ${flow.trigger_keywords}`);
      console.log(`Criado: ${flow.created_at}`);
      console.log('------------------------------------------');
    });

    // Verificar configuração do bot
    const [bots] = await connection.execute(`
      SELECT id, name, ai_config, is_active 
      FROM bots 
      WHERE id = 1
    `);

    console.log('\n🤖 CONFIGURAÇÃO DO BOT:');
    console.log('==========================================');
    if (bots.length > 0) {
      const bot = bots[0];
      console.log(`ID: ${bot.id}`);
      console.log(`Nome: ${bot.name}`);
      console.log(`Ativo: ${bot.is_active ? '✅' : '❌'}`);
      console.log(`AI Config: ${bot.ai_config ? JSON.stringify(bot.ai_config, null, 2) : 'null'}`);
    }

    await connection.end();
    console.log('\n✅ Verificação concluída');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

verificarFluxos();

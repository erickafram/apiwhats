const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCreateBot() {
  try {
    console.log('🤖 Testando criação de novo bot...\n');

    // 1. Primeiro, fazer login para obter token
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'demo@example.com',
      password: 'demo123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');

    // 2. Criar um novo bot com configurações básicas
    console.log('\n2️⃣ Criando novo bot...');
    const botData = {
      name: 'Bot de Atendimento Personalizado',
      description: 'Bot criado para demonstrar a funcionalidade de criação',
      ai_config: {
        enabled: true,
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        temperature: 0.8,
        max_tokens: 1500,
        system_prompt: 'Você é um assistente virtual especializado em atendimento ao cliente. Seja sempre educado, prestativo e profissional. Responda em português brasileiro de forma clara e objetiva.'
      },
      settings: {
        auto_reply: true,
        typing_delay: 2000,
        read_receipts: true,
        group_support: false,
        business_hours: {
          enabled: true,
          timezone: 'America/Sao_Paulo',
          schedule: {
            monday: { start: '08:00', end: '18:00', enabled: true },
            tuesday: { start: '08:00', end: '18:00', enabled: true },
            wednesday: { start: '08:00', end: '18:00', enabled: true },
            thursday: { start: '08:00', end: '18:00', enabled: true },
            friday: { start: '08:00', end: '18:00', enabled: true },
            saturday: { start: '09:00', end: '13:00', enabled: true },
            sunday: { start: '09:00', end: '13:00', enabled: false }
          }
        }
      }
    };

    const createResponse = await axios.post(`${BASE_URL}/api/bots`, botData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const newBot = createResponse.data.bot;
    console.log('   ✅ Bot criado com sucesso!');
    console.log(`   📋 ID: ${newBot.id}`);
    console.log(`   📝 Nome: ${newBot.name}`);
    console.log(`   📄 Descrição: ${newBot.description}`);
    console.log(`   🤖 IA Habilitada: ${newBot.ai_config.enabled}`);
    console.log(`   🌡️ Temperature: ${newBot.ai_config.temperature}`);
    console.log(`   ⚡ Status: ${newBot.is_active ? 'Ativo' : 'Inativo'}`);
    console.log(`   🔗 Conectado: ${newBot.is_connected ? 'Sim' : 'Não'}`);

    // 3. Buscar o bot criado para verificar
    console.log('\n3️⃣ Verificando bot criado...');
    const getResponse = await axios.get(`${BASE_URL}/api/bots/${newBot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('   ✅ Bot encontrado na base de dados');
    console.log(`   📊 Fluxos associados: ${getResponse.data.flows.length}`);

    // 4. Listar todos os bots para confirmar
    console.log('\n4️⃣ Listando todos os bots...');
    const listResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`   📋 Total de bots: ${listResponse.data.bots.length}`);
    listResponse.data.bots.forEach((bot, index) => {
      console.log(`   ${index + 1}. ${bot.name} (ID: ${bot.id}) - ${bot.is_active ? 'Ativo' : 'Inativo'}`);
    });

    // 5. Demonstrar próximos passos
    console.log('\n🎯 Próximos passos para usar o bot:');
    console.log('   1. Ativar o bot: PUT /api/bots/' + newBot.id + ' {"is_active": true}');
    console.log('   2. Conectar ao WhatsApp: POST /api/bots/' + newBot.id + '/connect');
    console.log('   3. Criar fluxos: POST /api/flows {"bot_id": ' + newBot.id + ', "name": "Fluxo de Boas-vindas"}');
    console.log('   4. Monitorar conversas: GET /api/conversations?bot_id=' + newBot.id);

    return newBot;

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Dica: Verifique se o usuário demo@example.com existe ou crie um novo usuário');
    }
  }
}

// Executar o teste
testCreateBot();

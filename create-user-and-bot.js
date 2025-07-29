const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function createUserAndBot() {
  try {
    console.log('🚀 Demonstração completa: Criar usuário e bot...\n');

    // 1. Criar um novo usuário
    console.log('1️⃣ Criando novo usuário...');
    const userData = {
      name: 'Usuário Teste',
      email: 'teste@exemplo.com',
      password: 'senha123'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, userData);
      console.log('   ✅ Usuário criado com sucesso:', registerResponse.data.user.name);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.code === 'EMAIL_ALREADY_EXISTS') {
        console.log('   ℹ️ Usuário já existe, continuando...');
      } else {
        throw error;
      }
    }

    // 2. Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@exemplo.com',
      password: 'senha123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');
    console.log('   👤 Usuário:', loginResponse.data.user.name);

    // 3. Criar um novo bot
    console.log('\n3️⃣ Criando novo bot...');
    const botData = {
      name: 'Meu Bot de Atendimento',
      description: 'Bot criado para demonstrar a funcionalidade completa do sistema',
      ai_config: {
        enabled: true,
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        temperature: 0.7,
        max_tokens: 1000,
        system_prompt: 'Você é um assistente virtual especializado em atendimento ao cliente. Seja sempre educado, prestativo e profissional. Responda em português brasileiro.'
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
    console.log('   📋 Detalhes do bot:');
    console.log(`      🆔 ID: ${newBot.id}`);
    console.log(`      📝 Nome: ${newBot.name}`);
    console.log(`      📄 Descrição: ${newBot.description}`);
    console.log(`      🤖 IA Habilitada: ${newBot.ai_config.enabled}`);
    console.log(`      🌡️ Temperature: ${newBot.ai_config.temperature}`);
    console.log(`      🎯 Max Tokens: ${newBot.ai_config.max_tokens}`);
    console.log(`      ⚡ Status: ${newBot.is_active ? 'Ativo' : 'Inativo'}`);
    console.log(`      🔗 Conectado: ${newBot.is_connected ? 'Sim' : 'Não'}`);
    console.log(`      📅 Criado em: ${new Date(newBot.created_at).toLocaleString('pt-BR')}`);

    // 4. Ativar o bot
    console.log('\n4️⃣ Ativando o bot...');
    const activateResponse = await axios.put(`${BASE_URL}/api/bots/${newBot.id}`, {
      is_active: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('   ✅ Bot ativado com sucesso!');

    // 5. Listar todos os bots
    console.log('\n5️⃣ Listando todos os bots do usuário...');
    const listResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`   📋 Total de bots: ${listResponse.data.bots.length}`);
    listResponse.data.bots.forEach((bot, index) => {
      console.log(`   ${index + 1}. ${bot.name} (ID: ${bot.id}) - ${bot.is_active ? '🟢 Ativo' : '🔴 Inativo'}`);
    });

    // 6. Demonstrar funcionalidades disponíveis
    console.log('\n🎯 Funcionalidades disponíveis para o bot:');
    console.log('   📱 Conectar ao WhatsApp:');
    console.log(`      POST ${BASE_URL}/api/bots/${newBot.id}/connect`);
    console.log('   📊 Ver detalhes completos:');
    console.log(`      GET ${BASE_URL}/api/bots/${newBot.id}`);
    console.log('   ⚙️ Atualizar configurações:');
    console.log(`      PUT ${BASE_URL}/api/bots/${newBot.id}`);
    console.log('   🔄 Criar fluxos de conversa:');
    console.log(`      POST ${BASE_URL}/api/flows`);
    console.log('   📈 Ver analytics:');
    console.log(`      GET ${BASE_URL}/api/analytics/bots/${newBot.id}`);

    console.log('\n✨ Bot criado e configurado com sucesso!');
    console.log('🔗 Acesse o frontend em: http://localhost:3000');
    
    return {
      user: loginResponse.data.user,
      bot: newBot,
      token
    };

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar a demonstração
createUserAndBot();

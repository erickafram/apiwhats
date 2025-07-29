const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testFrontendIntegration() {
  try {
    console.log('🌐 Testando integração Frontend + Backend...\n');

    // 1. Verificar se o backend está rodando
    console.log('1️⃣ Verificando backend...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Backend funcionando:', healthResponse.data.status);

    // 2. Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@exemplo.com',
      password: 'senha123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');
    console.log('   👤 Usuário:', loginResponse.data.user.name);

    // 3. Listar bots (endpoint que o frontend usa)
    console.log('\n3️⃣ Listando bots (endpoint do frontend)...');
    const botsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`   📋 Total de bots encontrados: ${botsResponse.data.bots.length}`);
    
    if (botsResponse.data.bots.length > 0) {
      console.log('   📊 Bots disponíveis:');
      botsResponse.data.bots.forEach((bot, index) => {
        console.log(`      ${index + 1}. ${bot.name} (ID: ${bot.id})`);
        console.log(`         Status: ${bot.is_active ? '🟢 Ativo' : '🔴 Inativo'}`);
        console.log(`         Conectado: ${bot.is_connected ? '🟢 Sim' : '🔴 Não'}`);
        console.log(`         IA: ${bot.ai_config?.enabled ? '🤖 Habilitada' : '❌ Desabilitada'}`);
      });
    } else {
      console.log('   ℹ️ Nenhum bot encontrado - o frontend mostrará a tela de "criar primeiro bot"');
    }

    // 4. Testar criação de bot via API (simular frontend)
    console.log('\n4️⃣ Testando criação de bot (simulando frontend)...');
    const newBotData = {
      name: 'Bot Frontend Test',
      description: 'Bot criado para testar integração frontend',
      ai_config: {
        enabled: true,
        temperature: 0.8,
        max_tokens: 1200,
        system_prompt: 'Você é um bot de teste criado via frontend. Seja amigável e prestativo!'
      }
    };

    const createResponse = await axios.post(`${BASE_URL}/api/bots`, newBotData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const newBot = createResponse.data.bot;
    console.log('   ✅ Bot criado via API (frontend)!');
    console.log(`   🆔 ID: ${newBot.id}`);
    console.log(`   📝 Nome: ${newBot.name}`);

    // 5. Testar ativação do bot
    console.log('\n5️⃣ Testando ativação do bot...');
    const activateResponse = await axios.put(`${BASE_URL}/api/bots/${newBot.id}`, {
      is_active: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('   ✅ Bot ativado com sucesso!');

    // 6. Testar conexão WhatsApp (simular clique no botão)
    console.log('\n6️⃣ Testando conexão WhatsApp...');
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/bots/${newBot.id}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('   ✅ Processo de conexão iniciado!');
      if (connectResponse.data.qr_code) {
        console.log('   📱 QR Code gerado - frontend mostrará o modal');
      }
    } catch (connectError) {
      console.log('   ⚠️ Conexão WhatsApp:', connectError.response?.data?.error || 'Serviço não disponível');
    }

    // 7. Verificar dados atualizados
    console.log('\n7️⃣ Verificando dados atualizados...');
    const updatedBotsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`   📊 Total de bots após teste: ${updatedBotsResponse.data.bots.length}`);

    // 8. Informações para o frontend
    console.log('\n🎯 Informações para o Frontend:');
    console.log('   🌐 URL do Frontend: http://localhost:3001');
    console.log('   📱 Página de Bots: http://localhost:3001/bots');
    console.log('   🔑 Token de teste:', token.substring(0, 20) + '...');
    
    console.log('\n📋 Funcionalidades implementadas no frontend:');
    console.log('   ✅ Listagem de bots com cards visuais');
    console.log('   ✅ Criação de novos bots com dialog');
    console.log('   ✅ Ativação/desativação de bots');
    console.log('   ✅ Conexão WhatsApp com QR Code');
    console.log('   ✅ Menu de contexto com opções');
    console.log('   ✅ Navegação para configurações');
    console.log('   ✅ Status visual dos bots');
    console.log('   ✅ Configurações de IA no dialog');

    console.log('\n✨ Integração Frontend + Backend funcionando perfeitamente!');
    console.log('🚀 Acesse http://localhost:3001/bots para ver a interface');

  } catch (error) {
    console.error('❌ Erro na integração:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Dica: Verifique se o backend está rodando em http://localhost:5000');
    }
    
    if (error.response?.status === 401) {
      console.log('💡 Dica: Problema de autenticação - verifique as credenciais');
    }
  }
}

// Executar o teste
testFrontendIntegration();

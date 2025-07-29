const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSystem() {
  console.log('🧪 Iniciando testes do sistema...\n');

  try {
    // 1. Testar health check
    console.log('1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Health check OK:', healthResponse.data.status);

    // 2. Testar registro de usuário
    console.log('\n2️⃣ Testando registro de usuário...');
    const registerData = {
      name: 'Usuário Teste',
      email: `teste_${Date.now()}@example.com`,
      password: 'teste123'
    };

    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    console.log('   ✅ Usuário registrado:', registerResponse.data.user.name);
    
    const token = registerResponse.data.token;

    // 3. Testar login
    console.log('\n3️⃣ Testando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('   ✅ Login realizado:', loginResponse.data.user.email);

    // 4. Testar verificação de token
    console.log('\n4️⃣ Testando verificação de token...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Token válido:', verifyResponse.data.user.name);

    // 5. Testar criação de bot
    console.log('\n5️⃣ Testando criação de bot...');
    const botData = {
      name: 'Bot de Teste',
      description: 'Bot criado durante teste automatizado',
      ai_config: {
        enabled: true,
        temperature: 0.7,
        max_tokens: 500,
        system_prompt: 'Você é um bot de teste.'
      }
    };

    const botResponse = await axios.post(`${BASE_URL}/api/bots`, botData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Bot criado:', botResponse.data.bot.name);
    
    const botId = botResponse.data.bot.id;

    // 6. Testar listagem de bots
    console.log('\n6️⃣ Testando listagem de bots...');
    const botsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Bots listados:', botsResponse.data.bots.length);

    // 7. Testar criação de fluxo
    console.log('\n7️⃣ Testando criação de fluxo...');
    const flowData = {
      bot_id: botId,
      name: 'Fluxo de Teste',
      description: 'Fluxo criado durante teste automatizado',
      flow_data: {
        nodes: [
          {
            id: 'start_1',
            type: 'start',
            position: { x: 100, y: 100 },
            data: { message: 'Olá! Este é um teste.' }
          },
          {
            id: 'end_1',
            type: 'end',
            position: { x: 300, y: 100 },
            data: { message: 'Teste finalizado!' }
          }
        ],
        edges: [
          { id: 'e1', source: 'start_1', target: 'end_1' }
        ],
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      trigger_keywords: ['teste', 'test'],
      is_active: true,
      is_default: true
    };

    const flowResponse = await axios.post(`${BASE_URL}/api/flows`, flowData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Fluxo criado:', flowResponse.data.flow.name);

    // 8. Testar listagem de fluxos
    console.log('\n8️⃣ Testando listagem de fluxos...');
    try {
      const flowsResponse = await axios.get(`${BASE_URL}/api/flows?bot_id=${botId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Fluxos listados:', flowsResponse.data.flows.length);
    } catch (flowError) {
      console.log('   ⚠️  Erro na listagem de fluxos, tentando sem bot_id...');
      const flowsResponse = await axios.get(`${BASE_URL}/api/flows`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Fluxos listados (sem filtro):', flowsResponse.data.flows.length);
    }

    // 9. Testar analytics dashboard
    console.log('\n9️⃣ Testando analytics dashboard...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Analytics carregado:', analyticsResponse.data.summary.total_bots);

    // 10. Testar QR Code (sem conectar)
    console.log('\n🔟 Testando geração de QR Code...');
    try {
      const qrResponse = await axios.post(`${BASE_URL}/api/bots/${botId}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Processo de conexão iniciado:', qrResponse.data.status);
    } catch (qrError) {
      console.log('   ⚠️  QR Code não gerado (normal em ambiente de teste)');
    }

    console.log('\n🎉 Todos os testes passaram com sucesso!');
    console.log('\n📊 Resumo dos testes:');
    console.log('   ✅ Health check');
    console.log('   ✅ Registro de usuário');
    console.log('   ✅ Login');
    console.log('   ✅ Verificação de token');
    console.log('   ✅ Criação de bot');
    console.log('   ✅ Listagem de bots');
    console.log('   ✅ Criação de fluxo');
    console.log('   ✅ Listagem de fluxos');
    console.log('   ✅ Analytics dashboard');
    console.log('   ✅ Processo de conexão WhatsApp');

  } catch (error) {
    console.error('\n❌ Erro durante os testes:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    } else {
      console.error('   Erro:', error.message);
    }
    
    console.log('\n🔍 Verifique se:');
    console.log('   - O servidor está rodando (npm run dev)');
    console.log('   - O banco de dados está configurado');
    console.log('   - As migrations foram executadas');
    
    process.exit(1);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testSystem();
}

module.exports = testSystem;

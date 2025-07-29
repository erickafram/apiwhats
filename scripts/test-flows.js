const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testFlows() {
  console.log('🔄 Testando funcionalidades de fluxos...\n');

  try {
    // Setup: criar usuário e bot
    console.log('🔧 Setup: criando usuário e bot...');
    const email = `flow_test_${Date.now()}@test.com`;
    
    const register = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Flow Test User',
      email: email,
      password: 'test123'
    });
    const token = register.data.token;
    console.log('   ✅ Usuário criado');

    const bot = await axios.post(`${BASE_URL}/api/bots`, {
      name: 'Flow Test Bot',
      description: 'Bot para testar fluxos'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const botId = bot.data.bot.id;
    console.log('   ✅ Bot criado:', botId);

    // 1. Testar listagem de fluxos (vazia)
    console.log('\n1️⃣ Testando listagem de fluxos vazia...');
    const emptyFlows = await axios.get(`${BASE_URL}/api/flows`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Fluxos listados (vazio):', emptyFlows.data.flows.length);

    // 2. Criar fluxo
    console.log('\n2️⃣ Criando fluxo...');
    const flowData = {
      bot_id: botId,
      name: 'Fluxo de Teste',
      description: 'Fluxo criado durante teste',
      flow_data: {
        nodes: [
          {
            id: 'start_1',
            type: 'start',
            position: { x: 100, y: 100 },
            data: { message: 'Olá! Este é um teste.' }
          }
        ],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      trigger_keywords: ['teste'],
      is_active: true,
      is_default: true
    };

    const flow = await axios.post(`${BASE_URL}/api/flows`, flowData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const flowId = flow.data.flow.id;
    console.log('   ✅ Fluxo criado:', flowId);

    // 3. Listar fluxos (com dados)
    console.log('\n3️⃣ Listando fluxos com dados...');
    const flows = await axios.get(`${BASE_URL}/api/flows`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Fluxos encontrados:', flows.data.flows.length);
    console.log('   📊 Primeiro fluxo:', flows.data.flows[0]?.name);

    // 4. Buscar fluxo por ID
    console.log('\n4️⃣ Buscando fluxo por ID...');
    const flowDetail = await axios.get(`${BASE_URL}/api/flows/${flowId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Fluxo encontrado:', flowDetail.data.name);
    console.log('   🤖 Bot associado:', flowDetail.data.bot?.name);

    // 5. Listar fluxos filtrado por bot
    console.log('\n5️⃣ Listando fluxos por bot...');
    const botFlows = await axios.get(`${BASE_URL}/api/flows?bot_id=${botId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Fluxos do bot:', botFlows.data.flows.length);

    // 6. Atualizar fluxo
    console.log('\n6️⃣ Atualizando fluxo...');
    const updateFlow = await axios.put(`${BASE_URL}/api/flows/${flowId}`, {
      description: 'Fluxo atualizado durante teste'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Fluxo atualizado:', updateFlow.data.flow.description);

    console.log('\n🎉 Todos os testes de fluxos passaram!');
    console.log('\n📊 Resumo:');
    console.log('   ✅ Listagem vazia');
    console.log('   ✅ Criação de fluxo');
    console.log('   ✅ Listagem com dados');
    console.log('   ✅ Busca por ID');
    console.log('   ✅ Filtro por bot');
    console.log('   ✅ Atualização');

  } catch (error) {
    console.error('\n❌ Erro no teste de fluxos:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   URL:', error.config.url);
      console.error('   Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Erro:', error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  testFlows();
}

module.exports = testFlows;

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function createBotFlow() {
  try {
    console.log('🔄 Demonstração: Criar Fluxo para o Bot...\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@exemplo.com',
      password: 'senha123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');

    // 2. Buscar bot disponível
    console.log('\n2️⃣ Buscando bot disponível...');
    const listResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (listResponse.data.bots.length === 0) {
      console.log('   ❌ Nenhum bot encontrado. Execute create-user-and-bot.js primeiro.');
      return;
    }

    const bot = listResponse.data.bots[0];
    console.log(`   📋 Bot encontrado: ${bot.name} (ID: ${bot.id})`);

    // 3. Criar fluxo de boas-vindas
    console.log('\n3️⃣ Criando fluxo de boas-vindas...');
    const flowData = {
      bot_id: bot.id,
      name: 'Fluxo de Boas-vindas',
      description: 'Fluxo inicial para receber novos usuários',
      flow_data: {
        nodes: [
          {
            id: 'start',
            type: 'start',
            position: { x: 100, y: 100 },
            data: {
              label: 'Início',
              message: 'Olá! Bem-vindo ao nosso atendimento! 👋'
            }
          },
          {
            id: 'menu',
            type: 'menu',
            position: { x: 300, y: 100 },
            data: {
              label: 'Menu Principal',
              message: 'Como posso ajudá-lo hoje?',
              options: [
                { id: '1', text: '📞 Suporte Técnico', value: 'suporte' },
                { id: '2', text: '💰 Vendas', value: 'vendas' },
                { id: '3', text: 'ℹ️ Informações', value: 'info' },
                { id: '4', text: '👤 Falar com Humano', value: 'humano' }
              ]
            }
          },
          {
            id: 'suporte',
            type: 'message',
            position: { x: 100, y: 300 },
            data: {
              label: 'Suporte Técnico',
              message: 'Você foi direcionado para o suporte técnico. Em breve um especialista entrará em contato! 🔧'
            }
          },
          {
            id: 'vendas',
            type: 'message',
            position: { x: 300, y: 300 },
            data: {
              label: 'Vendas',
              message: 'Ótimo! Nossa equipe de vendas está pronta para ajudá-lo. Aguarde um momento! 💼'
            }
          },
          {
            id: 'info',
            type: 'message',
            position: { x: 500, y: 300 },
            data: {
              label: 'Informações',
              message: 'Aqui estão nossas informações:\n📍 Endereço: Rua Example, 123\n📞 Telefone: (11) 99999-9999\n🌐 Site: www.exemplo.com'
            }
          },
          {
            id: 'humano',
            type: 'transfer',
            position: { x: 700, y: 300 },
            data: {
              label: 'Transferir para Humano',
              message: 'Transferindo você para um atendente humano. Aguarde um momento! 👨‍💼'
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'menu' },
          { id: 'e2', source: 'menu', target: 'suporte', condition: { option: 'suporte' } },
          { id: 'e3', source: 'menu', target: 'vendas', condition: { option: 'vendas' } },
          { id: 'e4', source: 'menu', target: 'info', condition: { option: 'info' } },
          { id: 'e5', source: 'menu', target: 'humano', condition: { option: 'humano' } }
        ],
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      trigger_keywords: ['oi', 'olá', 'hello', 'início', 'começar', 'menu'],
      trigger_conditions: {
        is_first_message: true,
        time_based: false
      },
      priority: 10,
      is_active: true,
      is_default: true
    };

    const flowResponse = await axios.post(`${BASE_URL}/api/flows`, flowData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const newFlow = flowResponse.data.flow;
    console.log('   ✅ Fluxo criado com sucesso!');
    console.log('   📋 Detalhes do fluxo:');
    console.log(`      🆔 ID: ${newFlow.id}`);
    console.log(`      📝 Nome: ${newFlow.name}`);
    console.log(`      📄 Descrição: ${newFlow.description}`);
    console.log(`      🎯 Prioridade: ${newFlow.priority}`);
    console.log(`      ⚡ Ativo: ${newFlow.is_active ? '🟢 Sim' : '🔴 Não'}`);
    console.log(`      🏠 Padrão: ${newFlow.is_default ? '🟢 Sim' : '🔴 Não'}`);
    console.log(`      🔗 Palavras-chave: ${newFlow.trigger_keywords.join(', ')}`);
    console.log(`      📊 Nós no fluxo: ${newFlow.flow_data.nodes.length}`);

    // 4. Criar fluxo de FAQ
    console.log('\n4️⃣ Criando fluxo de FAQ...');
    const faqFlowData = {
      bot_id: bot.id,
      name: 'FAQ - Perguntas Frequentes',
      description: 'Fluxo para responder perguntas frequentes',
      flow_data: {
        nodes: [
          {
            id: 'faq_start',
            type: 'start',
            position: { x: 100, y: 100 },
            data: {
              label: 'FAQ Início',
              message: 'Aqui estão as perguntas mais frequentes:'
            }
          },
          {
            id: 'faq_menu',
            type: 'menu',
            position: { x: 300, y: 100 },
            data: {
              label: 'Menu FAQ',
              message: 'Escolha uma categoria:',
              options: [
                { id: '1', text: '⏰ Horário de Funcionamento', value: 'horario' },
                { id: '2', text: '💳 Formas de Pagamento', value: 'pagamento' },
                { id: '3', text: '🚚 Entrega', value: 'entrega' },
                { id: '4', text: '🔄 Trocas e Devoluções', value: 'trocas' }
              ]
            }
          }
        ],
        edges: [
          { id: 'faq_e1', source: 'faq_start', target: 'faq_menu' }
        ],
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      trigger_keywords: ['faq', 'dúvidas', 'perguntas', 'ajuda', 'help'],
      priority: 5,
      is_active: true
    };

    const faqFlowResponse = await axios.post(`${BASE_URL}/api/flows`, faqFlowData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('   ✅ Fluxo FAQ criado com sucesso!');
    console.log(`   🆔 ID: ${faqFlowResponse.data.flow.id}`);

    // 5. Listar todos os fluxos do bot
    console.log('\n5️⃣ Listando todos os fluxos do bot...');
    const flowsResponse = await axios.get(`${BASE_URL}/api/flows?bot_id=${bot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`   📋 Total de fluxos: ${flowsResponse.data.flows.length}`);
    flowsResponse.data.flows.forEach((flow, index) => {
      console.log(`   ${index + 1}. ${flow.name} (ID: ${flow.id}) - ${flow.is_active ? '🟢 Ativo' : '🔴 Inativo'} ${flow.is_default ? '🏠' : ''}`);
    });

    // 6. Verificar bot atualizado com fluxos
    console.log('\n6️⃣ Verificando bot com fluxos...');
    const updatedBotResponse = await axios.get(`${BASE_URL}/api/bots/${bot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`   📊 Bot agora possui ${updatedBotResponse.data.flows.length} fluxo(s) associado(s)`);

    console.log('\n🎯 Funcionalidades dos fluxos:');
    console.log('   📝 Testar fluxo:');
    console.log(`      POST ${BASE_URL}/api/flows/${newFlow.id}/test`);
    console.log('   ⚙️ Editar fluxo:');
    console.log(`      PUT ${BASE_URL}/api/flows/${newFlow.id}`);
    console.log('   📊 Analytics do fluxo:');
    console.log(`      GET ${BASE_URL}/api/analytics/flows/${newFlow.id}`);

    console.log('\n✨ Fluxos criados e configurados com sucesso!');
    console.log('🤖 Seu bot agora está pronto para atender com fluxos inteligentes!');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar a demonstração
createBotFlow();

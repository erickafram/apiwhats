const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testPhase4() {
  console.log('🚀 Testando Fase 4: Recursos Avançados...\n');

  try {
    // Setup: criar usuário e bot
    console.log('🔧 Setup: criando usuário e bot...');
    const email = `phase4_test_${Date.now()}@test.com`;
    
    const register = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Phase 4 Test User',
      email: email,
      password: 'test123'
    });
    const token = register.data.token;
    console.log('   ✅ Usuário criado');

    const bot = await axios.post(`${BASE_URL}/api/bots`, {
      name: 'Phase 4 Test Bot',
      description: 'Bot para testar recursos avançados'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const botId = bot.data.bot.id;
    console.log('   ✅ Bot criado:', botId);

    // 1. Testar Templates
    console.log('\n1️⃣ Testando Templates de Fluxos...');
    
    // Listar templates
    const templates = await axios.get(`${BASE_URL}/api/templates`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Templates listados:', templates.data.templates.length);
    console.log('   📋 Categorias:', templates.data.categories);

    // Buscar template específico
    const templateId = 'customer_service';
    const template = await axios.get(`${BASE_URL}/api/templates/${templateId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Template encontrado:', template.data.name);

    // Preview do template
    const preview = await axios.post(`${BASE_URL}/api/templates/${templateId}/preview`, {
      customizations: {
        name: 'Atendimento Personalizado',
        variables: {
          company_name: 'Minha Empresa'
        }
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Preview gerado:', preview.data.preview.name);

    // Criar fluxo a partir do template
    const flowFromTemplate = await axios.post(`${BASE_URL}/api/templates/${templateId}/create-flow`, {
      bot_id: botId,
      customizations: {
        name: 'Fluxo de Atendimento Criado do Template',
        description: 'Fluxo criado automaticamente a partir do template'
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Fluxo criado do template:', flowFromTemplate.data.flow.name);

    // 2. Testar Sistema de Filas
    console.log('\n2️⃣ Testando Sistema de Filas...');

    // Status das filas
    const queueStatus = await axios.get(`${BASE_URL}/api/queue/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Status das filas:', Object.keys(queueStatus.data.queues));

    // Registrar agente
    const agent = await axios.post(`${BASE_URL}/api/queue/agents/register`, {
      name: 'Agente Teste',
      email: 'agente@test.com',
      departments: ['support', 'general'],
      max_concurrent: 2
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Agente registrado:', agent.data.agent.name);

    // Listar agentes
    const agents = await axios.get(`${BASE_URL}/api/queue/agents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Agentes listados:', agents.data.agents.length);

    // Criar conversa para testar fila
    const conversation = await axios.post(`${BASE_URL}/api/conversations`, {
      bot_id: botId,
      user_phone: '5511999999999',
      user_name: 'Usuário Teste'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const conversationId = conversation.data.conversation.id;
    console.log('   ✅ Conversa criada:', conversationId);

    // Adicionar à fila
    const queueAdd = await axios.post(`${BASE_URL}/api/queue/add`, {
      conversation_id: conversationId,
      department: 'support',
      priority: 1,
      metadata: {
        issue_type: 'technical_problem',
        urgency: 'high'
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Conversa adicionada à fila:', queueAdd.data.queue_item.queue_position);

    // Atribuir a agente
    const assignment = await axios.post(`${BASE_URL}/api/queue/assign`, {
      conversation_id: conversationId,
      agent_id: agent.data.agent.id,
      department: 'support'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Conversa atribuída ao agente:', assignment.data.assignment.agent_id);

    // Liberar do agente
    const release = await axios.post(`${BASE_URL}/api/queue/release`, {
      conversation_id: conversationId,
      reason: 'completed'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Conversa liberada do agente');

    // 3. Testar Webhooks (simulação)
    console.log('\n3️⃣ Testando Sistema de Webhooks...');
    
    // Criar fluxo com webhook
    const webhookFlow = await axios.post(`${BASE_URL}/api/flows`, {
      bot_id: botId,
      name: 'Fluxo com Webhook',
      description: 'Fluxo para testar webhooks',
      flow_data: {
        nodes: [
          {
            id: 'start_webhook',
            type: 'start',
            position: { x: 100, y: 100 },
            data: { message: 'Iniciando teste de webhook...' }
          },
          {
            id: 'webhook_test',
            type: 'webhook',
            position: { x: 300, y: 100 },
            data: {
              url: 'https://httpbin.org/post',
              method: 'POST',
              payload_template: {
                user_phone: '{{user_phone}}',
                message: '{{message_content}}',
                timestamp: '{{timestamp}}'
              },
              on_success_message: 'Webhook executado com sucesso!',
              on_error_message: 'Erro no webhook.'
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'start_webhook', target: 'webhook_test' }
        ],
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      is_active: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Fluxo com webhook criado:', webhookFlow.data.flow.name);

    // 4. Testar Analytics Avançados
    console.log('\n4️⃣ Testando Analytics Avançados...');
    
    const analytics = await axios.get(`${BASE_URL}/api/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Dashboard analytics:', analytics.data.summary.total_bots);

    // Stats dos templates
    const templateStats = await axios.get(`${BASE_URL}/api/templates/meta/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Estatísticas de templates:', templateStats.data.total_templates);

    console.log('\n🎉 Fase 4 testada com sucesso!');
    console.log('\n📊 Resumo dos testes:');
    console.log('   ✅ Templates de fluxos');
    console.log('   ✅ Sistema de filas');
    console.log('   ✅ Webhooks robustos');
    console.log('   ✅ Analytics avançados');
    console.log('\n🚀 Recursos avançados funcionando perfeitamente!');

  } catch (error) {
    console.error('\n❌ Erro no teste da Fase 4:');
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
  testPhase4();
}

module.exports = testPhase4;

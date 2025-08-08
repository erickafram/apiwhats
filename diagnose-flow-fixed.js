#!/usr/bin/env node

const { Sequelize } = require('sequelize');

async function diagnoseFlowFixed() {
  console.log('🔍 DIAGNÓSTICO: Fluxo de Passagens (Senha Corrigida)');
  console.log('==================================================');

  try {
    // Usar as configurações corretas do .env
    const sequelize = new Sequelize({
      dialect: 'mysql',
      host: 'localhost',
      username: 'chatbot',
      password: '@@2025@@Ekb',
      database: 'chatbot',
      logging: false
    });

    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados com sucesso!');

    // 1. Verificar fluxos relacionados a passagens
    console.log('\n1️⃣ Verificando fluxos de passagens...');
    const [flows] = await sequelize.query(`
      SELECT id, name, trigger_type, trigger_value, flow_data, is_active 
      FROM flows 
      WHERE trigger_value LIKE '%passagem%' OR name LIKE '%passagem%' OR flow_data LIKE '%passagem%'
      ORDER BY id DESC
      LIMIT 5
    `);

    console.log(`📊 Fluxos encontrados: ${flows.length}`);
    if (flows.length > 0) {
      flows.forEach(flow => {
        console.log(`  - ID: ${flow.id}, Nome: ${flow.name}`);
        console.log(`    Trigger: ${flow.trigger_type} = "${flow.trigger_value}"`);
        console.log(`    Ativo: ${flow.is_active ? 'Sim' : 'Não'}`);
        
        try {
          const flowData = JSON.parse(flow.flow_data);
          console.log(`    Nós: ${flowData.nodes ? flowData.nodes.length : 'N/A'}`);
          
          // Verificar se tem nós específicos
          if (flowData.nodes) {
            const nodeTypes = flowData.nodes.map(n => n.type);
            console.log(`    Tipos de nós: ${nodeTypes.join(', ')}`);
          }
        } catch (e) {
          console.log(`    Dados: ${flow.flow_data.substring(0, 100)}...`);
        }
        console.log('');
      });
    } else {
      console.log('❌ Nenhum fluxo de passagens encontrado!');
    }

    // 2. Verificar todos os fluxos ativos
    console.log('2️⃣ Verificando TODOS os fluxos ativos...');
    const [allFlows] = await sequelize.query(`
      SELECT id, name, trigger_type, trigger_value, is_active, bot_id
      FROM flows 
      WHERE is_active = 1
      ORDER BY priority DESC, id DESC
    `);

    console.log(`📊 Total de fluxos ativos: ${allFlows.length}`);
    allFlows.forEach(flow => {
      console.log(`  - ID: ${flow.id}, Bot: ${flow.bot_id}, Nome: ${flow.name}`);
      console.log(`    Trigger: ${flow.trigger_type} = "${flow.trigger_value}"`);
    });

    // 3. Verificar conversa do usuário
    console.log('\n3️⃣ Verificando conversa do usuário...');
    const [conversations] = await sequelize.query(`
      SELECT c.id, c.user_phone, c.current_flow_id, c.current_node_id, c.status,
             c.last_activity_at, LENGTH(c.flow_state) as flow_state_size
      FROM conversations c 
      WHERE c.user_phone = '556392410056'
      ORDER BY c.last_activity_at DESC 
      LIMIT 3
    `);

    console.log(`📊 Conversas do usuário: ${conversations.length}`);
    conversations.forEach(conv => {
      console.log(`  - ID: ${conv.id}, Status: ${conv.status}`);
      console.log(`    Fluxo atual: ${conv.current_flow_id}, Nó: ${conv.current_node_id}`);
      console.log(`    Última atividade: ${conv.last_activity_at}`);
      console.log(`    Estado salvo: ${conv.flow_state_size || 0} bytes`);
    });

    // 4. Verificar mensagens recentes
    console.log('\n4️⃣ Últimas 10 mensagens...');
    const [messages] = await sequelize.query(`
      SELECT m.content, m.direction, m.created_at, m.processed
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.user_phone = '556392410056'
      ORDER BY m.created_at DESC 
      LIMIT 10
    `);

    messages.forEach(msg => {
      const direction = msg.direction === 'incoming' ? '👤→' : '🤖→';
      const processed = msg.processed ? '✅' : '⏳';
      const time = new Date(msg.created_at).toLocaleTimeString();
      console.log(`  ${direction} ${msg.content} ${processed} (${time})`);
    });

    // 5. Criar fluxo se necessário
    if (flows.length === 0) {
      console.log('\n5️⃣ Criando fluxo de passagens...');
      
      const fluxoSimples = {
        nodes: [
          {
            id: "inicio",
            type: "message",
            data: {
              message: "🚌 BEM-VINDO AO SISTEMA DE PASSAGENS\n\nEscolha uma opção:\n\n1️⃣ Comprar Passagem\n2️⃣ Horários e Destinos\n3️⃣ Informações da Empresa\n\nDigite o número da opção desejada:"
            }
          },
          {
            id: "comprar",
            type: "message",
            data: {
              message: "🏃‍♂️ Vamos comprar sua passagem!\n\n📍 Primeiro, digite a cidade de ORIGEM:"
            }
          }
        ]
      };

      const insertQuery = `
        INSERT INTO flows (bot_id, name, trigger_type, trigger_value, flow_data, is_active, priority, created_at, updated_at)
        VALUES (1, 'Sistema de Passagens', 'keyword', 'comprar passagem', ?, 1, 100, NOW(), NOW())
      `;

      await sequelize.query(insertQuery, {
        replacements: [JSON.stringify(fluxoSimples)]
      });

      console.log('✅ Fluxo criado com sucesso!');
    }

    await sequelize.close();

    console.log('\n🎯 RESULTADO DO DIAGNÓSTICO:');
    console.log(`- Fluxos de passagens: ${flows.length}`);
    console.log(`- Fluxos ativos total: ${allFlows.length}`);
    console.log(`- Conversas do usuário: ${conversations.length}`);
    console.log('');

    if (flows.length > 0) {
      console.log('✅ Fluxos encontrados! O problema pode ser na lógica de processamento.');
    } else {
      console.log('⚠️ Nenhum fluxo específico de passagens. Criando um novo...');
    }

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error.message);
    
    if (error.message.includes('Access denied')) {
      console.log('\n💡 DICA: Verifique as credenciais do banco:');
      console.log('- DB_USER=chatbot');
      console.log('- DB_PASSWORD=@@2025@@Ekb');
      console.log('- DB_NAME=chatbot');
    }
  }
}

// Executar
diagnoseFlowFixed().catch(console.error);

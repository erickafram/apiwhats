#!/usr/bin/env node

const { Sequelize } = require('sequelize');

async function diagnoseFlowPassagens() {
  console.log('🔍 DIAGNÓSTICO: Fluxo de Passagens não continua');
  console.log('===============================================');

  try {
    // Conectar ao banco
    const sequelize = new Sequelize({
      dialect: 'mysql',
      host: 'localhost',
      username: 'chatbotwhats',
      password: process.env.DB_PASSWORD || 'SUA_SENHA_MYSQL_AQUI',
      database: 'chatbotwhats_db',
      logging: false
    });

    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // 1. Verificar fluxos relacionados a passagens
    console.log('\n1️⃣ Verificando fluxos de passagens...');
    const [flows] = await sequelize.query(`
      SELECT id, name, trigger_type, trigger_value, flow_data, is_active 
      FROM flows 
      WHERE trigger_value LIKE '%passagem%' OR name LIKE '%passagem%' OR flow_data LIKE '%passagem%'
    `);

    console.log(`📊 Fluxos encontrados: ${flows.length}`);
    flows.forEach(flow => {
      console.log(`  - ID: ${flow.id}, Nome: ${flow.name}`);
      console.log(`    Trigger: ${flow.trigger_type} = "${flow.trigger_value}"`);
      console.log(`    Ativo: ${flow.is_active ? 'Sim' : 'Não'}`);
      
      try {
        const flowData = JSON.parse(flow.flow_data);
        console.log(`    Nós: ${flowData.nodes ? flowData.nodes.length : 'N/A'}`);
      } catch (e) {
        console.log(`    Dados: ${flow.flow_data.substring(0, 100)}...`);
      }
      console.log('');
    });

    // 2. Verificar conversas recentes
    console.log('2️⃣ Verificando conversas recentes...');
    const [conversations] = await sequelize.query(`
      SELECT c.id, c.user_phone, c.current_flow_id, c.current_node_id, c.status,
             c.last_activity_at, c.flow_state
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
      if (conv.flow_state) {
        console.log(`    Estado: ${conv.flow_state.substring(0, 100)}...`);
      }
      console.log('');
    });

    // 3. Verificar mensagens recentes
    console.log('3️⃣ Verificando mensagens recentes...');
    const [messages] = await sequelize.query(`
      SELECT m.id, m.content, m.direction, m.message_type, m.created_at, m.processed,
             c.user_phone
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.user_phone = '556392410056'
      ORDER BY m.created_at DESC 
      LIMIT 10
    `);

    console.log(`📊 Mensagens recentes: ${messages.length}`);
    messages.forEach(msg => {
      const direction = msg.direction === 'incoming' ? '👤' : '🤖';
      const processed = msg.processed ? '✅' : '⏳';
      console.log(`  ${direction} ${msg.content} ${processed}`);
      console.log(`    ${msg.created_at}`);
    });

    // 4. Criar fluxo completo de passagens se não existir
    if (flows.length === 0) {
      console.log('\n4️⃣ Criando fluxo completo de passagens...');
      
      const fluxoCompleto = {
        nodes: [
          {
            id: "start",
            type: "message",
            data: {
              message: "🚌 BEM-VINDO AO SISTEMA DE PASSAGENS\n\nEscolha uma opção:\n\n1️⃣ Comprar Passagem\n2️⃣ Horários e Destinos\n3️⃣ Informações da Empresa\n\nDigite o número da opção desejada:"
            },
            next: ["opcao_menu"]
          },
          {
            id: "opcao_menu",
            type: "input",
            data: {
              variable_name: "opcao_escolhida",
              input_type: "text",
              validation: {
                type: "regex",
                pattern: "^[123]$"
              }
            },
            next: ["processar_opcao"]
          },
          {
            id: "processar_opcao",
            type: "condition",
            data: {
              conditions: [
                {
                  variable: "opcao_escolhida",
                  operator: "equals",
                  value: "1",
                  next_node: "comprar_origem"
                },
                {
                  variable: "opcao_escolhida", 
                  operator: "equals",
                  value: "2",
                  next_node: "horarios"
                },
                {
                  variable: "opcao_escolhida",
                  operator: "equals", 
                  value: "3",
                  next_node: "informacoes"
                }
              ]
            }
          },
          {
            id: "comprar_origem",
            type: "message",
            data: {
              message: "🏃‍♂️ Vamos comprar sua passagem!\n\n📍 Primeiro, digite a cidade de ORIGEM:"
            },
            next: ["input_origem"]
          },
          {
            id: "input_origem",
            type: "input",
            data: {
              variable_name: "cidade_origem",
              input_type: "text"
            },
            next: ["comprar_destino"]
          },
          {
            id: "comprar_destino",
            type: "message",
            data: {
              message: "🎯 Agora digite a cidade de DESTINO:"
            },
            next: ["input_destino"]
          },
          {
            id: "input_destino",
            type: "input",
            data: {
              variable_name: "cidade_destino",
              input_type: "text"
            },
            next: ["comprar_data"]
          },
          {
            id: "comprar_data",
            type: "message",
            data: {
              message: "📅 Digite a data da viagem:\n\nFormato: DD/MM/AAAA\nExemplo: 15/08/2024"
            },
            next: ["input_data"]
          },
          {
            id: "input_data",
            type: "input",
            data: {
              variable_name: "data_viagem",
              input_type: "text"
            },
            next: ["finalizar_compra"]
          },
          {
            id: "finalizar_compra",
            type: "message",
            data: {
              message: "✅ Dados coletados!\n\n🚌 Origem: {{cidade_origem}}\n🎯 Destino: {{cidade_destino}}\n📅 Data: {{data_viagem}}\n\n💳 Para finalizar a compra, entre em contato:\n📞 WhatsApp: (63) 99999-9999\n🌐 Site: www.empresa.com.br"
            }
          },
          {
            id: "horarios",
            type: "message", 
            data: {
              message: "🕐 HORÁRIOS E DESTINOS\n\n📍 Principais rotas:\n• Palmas ↔ Brasília: 06h, 14h, 22h\n• Palmas ↔ Goiânia: 08h, 16h\n• Palmas ↔ Araguaína: 07h, 15h, 19h\n\n💡 Para horários específicos, consulte nosso site."
            }
          },
          {
            id: "informacoes",
            type: "message",
            data: {
              message: "ℹ️ INFORMAÇÕES DA EMPRESA\n\n🚌 Empresa de Transportes\n📞 Telefone: (63) 3000-0000\n📱 WhatsApp: (63) 99999-9999\n🌐 Site: www.empresa.com.br\n📧 Email: contato@empresa.com.br\n\n✅ Licenciada pela ANTT\n🛡️ Seguro total para passageiros"
            }
          }
        ],
        edges: [
          { source: "start", target: "opcao_menu" },
          { source: "opcao_menu", target: "processar_opcao" },
          { source: "processar_opcao", target: "comprar_origem" },
          { source: "processar_opcao", target: "horarios" },
          { source: "processar_opcao", target: "informacoes" },
          { source: "comprar_origem", target: "input_origem" },
          { source: "input_origem", target: "comprar_destino" },
          { source: "comprar_destino", target: "input_destino" },
          { source: "input_destino", target: "comprar_data" },
          { source: "comprar_data", target: "input_data" },
          { source: "input_data", target: "finalizar_compra" }
        ]
      };

      const insertQuery = `
        INSERT INTO flows (bot_id, name, trigger_type, trigger_value, flow_data, is_active, priority, created_at, updated_at)
        VALUES (1, 'Sistema de Passagens Completo', 'keyword', 'comprar passagem', ?, 1, 10, NOW(), NOW())
      `;

      await sequelize.query(insertQuery, {
        replacements: [JSON.stringify(fluxoCompleto)]
      });

      console.log('✅ Fluxo completo de passagens criado!');
    }

    await sequelize.close();

    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('1. Execute: pm2 restart chatbot-whats-api');
    console.log('2. Teste novamente: "comprar passagem"');
    console.log('3. Selecione "1" e veja se continua');

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error.message);
  }
}

// Executar
diagnoseFlowPassagens().catch(console.error);

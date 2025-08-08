#!/usr/bin/env node

const { Sequelize } = require('sequelize');

async function fixCorruptedFlow() {
  console.log('🔧 CORREÇÃO: JSON corrompido do fluxo de passagens');
  console.log('===============================================');

  try {
    const sequelize = new Sequelize({
      dialect: 'mysql',
      host: 'localhost',
      username: 'chatbot',
      password: '@@2025@@Ekb',
      database: 'chatbot',
      logging: false
    });

    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados!');

    // 1. Verificar o JSON atual
    console.log('\n1️⃣ Verificando JSON atual do fluxo 5...');
    const [currentFlow] = await sequelize.query('SELECT flow_data FROM flows WHERE id = 5');
    
    if (currentFlow.length > 0) {
      console.log('📊 Tipo do flow_data:', typeof currentFlow[0].flow_data);
      console.log('📊 Conteúdo (primeiros 200 chars):', 
        JSON.stringify(currentFlow[0].flow_data).substring(0, 200) + '...');
    }

    // 2. Criar fluxo funcional simplificado
    console.log('\n2️⃣ Criando fluxo funcional simplificado...');
    
    const fluxoCorrigido = {
      nodes: [
        {
          id: "start",
          type: "start",
          next: "welcome",
          position: { x: 100, y: 100 }
        },
        {
          id: "welcome",
          type: "message",
          content: "🚌 *BEM-VINDO AO SISTEMA DE PASSAGENS*\n\nEscolha uma opção:\n\n1️⃣ Comprar Passagem\n2️⃣ Horários e Destinos\n3️⃣ Informações da Empresa\n\nDigite o número da opção desejada:",
          next: "menu_input",
          position: { x: 100, y: 200 }
        },
        {
          id: "menu_input",
          type: "input",
          variable: "menu_option",
          next: "menu_condition",
          position: { x: 100, y: 300 }
        },
        {
          id: "menu_condition",
          type: "condition",
          conditions: [
            {
              variable: "menu_option",
              operator: "equals",
              value: "1",
              next: "consultar_origem"
            },
            {
              variable: "menu_option", 
              operator: "equals",
              value: "2",
              next: "horarios_destinos"
            },
            {
              variable: "menu_option",
              operator: "equals",
              value: "3", 
              next: "info_empresa"
            }
          ],
          position: { x: 100, y: 400 }
        },
        {
          id: "consultar_origem",
          type: "message",
          content: "🏃‍♂️ Vamos comprar sua passagem!\n\n📍 Primeiro, digite a cidade de ORIGEM:",
          next: "input_origem",
          position: { x: 300, y: 300 }
        },
        {
          id: "input_origem",
          type: "input", 
          variable: "cidade_origem",
          next: "consultar_destino",
          position: { x: 300, y: 400 }
        },
        {
          id: "consultar_destino",
          type: "message",
          content: "🎯 Agora digite a cidade de DESTINO:",
          next: "input_destino",
          position: { x: 300, y: 500 }
        },
        {
          id: "input_destino",
          type: "input",
          variable: "cidade_destino", 
          next: "consultar_data",
          position: { x: 300, y: 600 }
        },
        {
          id: "consultar_data",
          type: "message",
          content: "📅 Digite a data da viagem:\n\nFormato: DD/MM/AAAA\nExemplo: 15/08/2025",
          next: "input_data",
          position: { x: 300, y: 700 }
        },
        {
          id: "input_data",
          type: "input",
          variable: "data_viagem",
          next: "finalizar_compra",
          position: { x: 300, y: 800 }
        },
        {
          id: "finalizar_compra",
          type: "message",
          content: "✅ Dados coletados!\n\n🚌 Origem: {{cidade_origem}}\n🎯 Destino: {{cidade_destino}}\n📅 Data: {{data_viagem}}\n\n💳 Para finalizar a compra, entre em contato:\n📞 WhatsApp: (63) 99999-9999\n🌐 Site: www.empresa.com.br",
          next: "end",
          position: { x: 300, y: 900 }
        },
        {
          id: "horarios_destinos",
          type: "message",
          content: "🕐 *HORÁRIOS E DESTINOS*\n\n📍 Principais rotas:\n• Palmas ↔ Brasília: 06h, 14h, 22h\n• Palmas ↔ Goiânia: 08h, 16h\n• Palmas ↔ Araguaína: 07h, 15h, 19h\n\n💡 Para horários específicos, consulte nosso site.",
          next: "end",
          position: { x: 500, y: 300 }
        },
        {
          id: "info_empresa",
          type: "message", 
          content: "ℹ️ *INFORMAÇÕES DA EMPRESA*\n\n🚌 Empresa de Transportes\n📞 Telefone: (63) 3000-0000\n📱 WhatsApp: (63) 99999-9999\n🌐 Site: www.empresa.com.br\n📧 Email: contato@empresa.com.br\n\n✅ Licenciada pela ANTT\n🛡️ Seguro total para passageiros",
          next: "end",
          position: { x: 700, y: 300 }
        },
        {
          id: "end",
          type: "end",
          position: { x: 100, y: 1000 }
        }
      ],
      edges: [
        { source: "start", target: "welcome" },
        { source: "welcome", target: "menu_input" },
        { source: "menu_input", target: "menu_condition" },
        { source: "menu_condition", target: "consultar_origem" },
        { source: "menu_condition", target: "horarios_destinos" },
        { source: "menu_condition", target: "info_empresa" },
        { source: "consultar_origem", target: "input_origem" },
        { source: "input_origem", target: "consultar_destino" },
        { source: "consultar_destino", target: "input_destino" },
        { source: "input_destino", target: "consultar_data" },
        { source: "consultar_data", target: "input_data" },
        { source: "input_data", target: "finalizar_compra" },
        { source: "finalizar_compra", target: "end" },
        { source: "horarios_destinos", target: "end" },
        { source: "info_empresa", target: "end" }
      ],
      viewport: { x: 0, y: 0, zoom: 1 }
    };

    // 3. Atualizar o fluxo no banco
    console.log('\n3️⃣ Atualizando fluxo no banco de dados...');
    
    const updateQuery = `
      UPDATE flows 
      SET flow_data = ?, 
          updated_at = NOW()
      WHERE id = 5
    `;

    await sequelize.query(updateQuery, {
      replacements: [JSON.stringify(fluxoCorrigido)]
    });

    console.log('✅ Fluxo atualizado com sucesso!');

    // 4. Verificar se a atualização funcionou
    console.log('\n4️⃣ Verificando fluxo atualizado...');
    const [updatedFlow] = await sequelize.query('SELECT flow_data FROM flows WHERE id = 5');
    
    try {
      const parsedFlow = JSON.parse(updatedFlow[0].flow_data);
      console.log(`✅ JSON válido! Nós: ${parsedFlow.nodes.length}, Conexões: ${parsedFlow.edges.length}`);
      
      // Verificar nó crítico
      const menuCondition = parsedFlow.nodes.find(n => n.id === 'menu_condition');
      if (menuCondition) {
        console.log(`✅ Nó menu_condition encontrado com ${menuCondition.conditions.length} condições`);
        menuCondition.conditions.forEach(cond => {
          console.log(`  - Opção "${cond.value}" → ${cond.next}`);
        });
      }
    } catch (e) {
      console.log('❌ Ainda há erro no JSON:', e.message);
    }

    await sequelize.close();

    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('\n📱 TESTE AGORA:');
    console.log('1. Digite "menu" no WhatsApp');
    console.log('2. Digite "1" quando aparecer o menu');
    console.log('3. Deve aparecer: "digite a cidade de ORIGEM"');
    console.log('\nSe funcionar, o problema era o JSON corrompido! 🎯');

  } catch (error) {
    console.error('❌ Erro na correção:', error.message);
  }
}

// Executar
fixCorruptedFlow().catch(console.error);

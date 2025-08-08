#!/usr/bin/env node

const { Sequelize } = require('sequelize');

async function analyzeRealDatabase() {
  console.log('🔍 ANÁLISE: Estrutura real do banco de dados');
  console.log('==========================================');

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

    // 1. Verificar estrutura da tabela flows
    console.log('\n1️⃣ Analisando estrutura da tabela flows...');
    const [flowColumns] = await sequelize.query('DESCRIBE flows');
    console.log('📊 Colunas da tabela flows:');
    flowColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // 2. Verificar fluxos existentes
    console.log('\n2️⃣ Verificando fluxos existentes...');
    const [flows] = await sequelize.query(`
      SELECT id, name, description, is_active, is_default, priority, bot_id
      FROM flows 
      ORDER BY priority DESC, id DESC
    `);

    console.log(`📊 Fluxos encontrados: ${flows.length}`);
    flows.forEach(flow => {
      console.log(`  - ID: ${flow.id}, Bot: ${flow.bot_id}, Nome: ${flow.name}`);
      console.log(`    Ativo: ${flow.is_active ? 'Sim' : 'Não'}, Padrão: ${flow.is_default ? 'Sim' : 'Não'}, Prioridade: ${flow.priority}`);
    });

    // 3. Analisar fluxo de passagens (ID 5)
    console.log('\n3️⃣ Analisando fluxo de passagens (ID 5)...');
    const [passagensFlow] = await sequelize.query(`
      SELECT flow_data FROM flows WHERE id = 5
    `);

    if (passagensFlow.length > 0) {
      try {
        const flowData = JSON.parse(passagensFlow[0].flow_data);
        console.log('📋 Estrutura do fluxo:');
        console.log(`  - Nós: ${flowData.nodes ? flowData.nodes.length : 'N/A'}`);
        console.log(`  - Conexões: ${flowData.edges ? flowData.edges.length : 'N/A'}`);
        
        // Verificar nós específicos
        if (flowData.nodes) {
          console.log('\n📍 Nós importantes:');
          const importantNodes = flowData.nodes.filter(n => 
            n.id.includes('menu') || n.id.includes('condition') || n.id.includes('consultar')
          );
          
          importantNodes.forEach(node => {
            console.log(`  - ${node.id}: ${node.type}`);
            if (node.conditions && node.conditions.length > 0) {
              console.log(`    Condições: ${node.conditions.length}`);
              node.conditions.forEach(cond => {
                console.log(`      * ${cond.variable} ${cond.operator} "${cond.value}" → ${cond.next}`);
              });
            }
          });
        }
      } catch (e) {
        console.log('❌ Erro ao analisar dados do fluxo:', e.message);
      }
    } else {
      console.log('❌ Fluxo de passagens não encontrado!');
    }

    // 4. Verificar keywords/triggers
    console.log('\n4️⃣ Verificando keywords dos fluxos...');
    const [keywords] = await sequelize.query(`
      SELECT id, name, trigger_keywords FROM flows WHERE is_active = 1
    `);

    keywords.forEach(flow => {
      console.log(`  - Fluxo ${flow.id}: ${flow.name}`);
      if (flow.trigger_keywords) {
        try {
          const kw = JSON.parse(flow.trigger_keywords);
          console.log(`    Keywords: ${kw.join(', ')}`);
        } catch (e) {
          console.log(`    Keywords: ${flow.trigger_keywords}`);
        }
      } else {
        console.log(`    Keywords: Nenhuma`);
      }
    });

    // 5. Verificar conversas recentes
    console.log('\n5️⃣ Verificando conversas do usuário 556392410056...');
    const [conversations] = await sequelize.query(`
      SELECT id, user_phone, current_flow_id, current_node, status, last_activity_at
      FROM conversations 
      WHERE user_phone = '556392410056'
      ORDER BY last_activity_at DESC 
      LIMIT 3
    `);

    console.log(`📊 Conversas: ${conversations.length}`);
    conversations.forEach(conv => {
      console.log(`  - ID: ${conv.id}, Status: ${conv.status}`);
      console.log(`    Fluxo: ${conv.current_flow_id}, Nó: ${conv.current_node}`);
      console.log(`    Última atividade: ${conv.last_activity_at}`);
    });

    // 6. Verificar mensagens recentes
    console.log('\n6️⃣ Últimas mensagens...');
    const [messages] = await sequelize.query(`
      SELECT m.content, m.direction, m.created_at, m.processed
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.user_phone = '556392410056'
      ORDER BY m.created_at DESC 
      LIMIT 8
    `);

    messages.forEach(msg => {
      const direction = msg.direction === 'incoming' ? '👤→' : '🤖→';
      const processed = msg.processed ? '✅' : '⏳';
      const time = new Date(msg.created_at).toLocaleTimeString();
      console.log(`  ${direction} ${msg.content.substring(0, 50)}... ${processed} (${time})`);
    });

    await sequelize.close();

    console.log('\n🎯 RESUMO DO PROBLEMA:');
    console.log('1. Fluxo de passagens existe (ID 5)');
    console.log('2. É ativado por keywords como "oi", "menu", "passagem"');
    console.log('3. Tem nós condicionais para processar opções 1, 2, 3');
    console.log('4. Problema pode estar na lógica de processamento das condições');

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Testar keyword "oi" ou "menu" no WhatsApp');
    console.log('2. Verificar se o menu aparece');
    console.log('3. Digitar "1" e ver se passa pela condição correta');
    console.log('4. Verificar logs para ver onde para o processamento');

  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
  }
}

// Executar
analyzeRealDatabase().catch(console.error);

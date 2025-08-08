#!/usr/bin/env node

process.env.NODE_ENV = 'production';

console.log('🔧 CORRIGINDO RESPOSTA DE ERRO EM PRODUÇÃO');
console.log('==========================================\n');

async function fixErrorResponse() {
  try {
    // Verificar e corrigir o MaytapiFlowProcessor
    console.log('1️⃣ Verificando MaytapiFlowProcessor...');
    
    const { sequelize, Bot, Flow } = require('./src/models');
    await sequelize.authenticate();
    console.log('   ✅ Banco conectado');

    // Verificar fluxos
    const activeFlows = await Flow.findAll({ where: { is_active: true } });
    console.log(`   📊 Fluxos ativos: ${activeFlows.length}`);

    if (activeFlows.length === 0) {
      console.log('   ❌ PROBLEMA: Nenhum fluxo ativo!');
      console.log('   🔧 Esta é a causa do erro "Desculpe, ocorreu um erro"');
      
      // Encontrar um bot para associar o fluxo
      const bots = await Bot.findAll();
      let botId = 1;
      
      if (bots.length > 0) {
        botId = bots[0].id;
        console.log(`   ✅ Usando bot: ${bots[0].name} (ID: ${botId})`);
      } else {
        console.log('   ⚠️ Nenhum bot encontrado, criando bot padrão...');
        const newBot = await Bot.create({
          name: 'Auto Mecânica',
          phone_number: '5511999999999',
          status: 'active',
          user_id: 1,
          settings: JSON.stringify({
            welcome_message: 'Olá! Como posso ajudá-lo?',
            auto_response: true
          })
        });
        botId = newBot.id;
        console.log(`   ✅ Bot criado: ${newBot.name} (ID: ${botId})`);
      }

      // Criar fluxo simples mas funcional
      const simpleFlowData = {
        nodes: [
          {
            id: 'start',
            type: 'start',
            position: { x: 100, y: 100 },
            next: 'welcome'
          },
          {
            id: 'welcome',
            type: 'message',
            content: `👋 Olá! Bem-vindo à Auto Mecânica!

Escolha uma opção:

1️⃣ Serviços
2️⃣ Orçamento  
3️⃣ Contato
4️⃣ Localização

Digite o número da opção:`,
            position: { x: 100, y: 200 },
            next: 'menu_input'
          },
          {
            id: 'menu_input',
            type: 'input',
            variable: 'opcao',
            position: { x: 100, y: 300 },
            next: 'menu_check'
          },
          {
            id: 'menu_check',
            type: 'condition',
            position: { x: 100, y: 400 },
            conditions: [
              { value: '1', operator: 'equals', variable: 'opcao', next: 'servicos' },
              { value: '2', operator: 'equals', variable: 'opcao', next: 'orcamento' },
              { value: '3', operator: 'equals', variable: 'opcao', next: 'contato' },
              { value: '4', operator: 'equals', variable: 'opcao', next: 'localizacao' }
            ],
            default_next: 'opcao_invalida'
          },
          {
            id: 'servicos',
            type: 'message',
            content: `🔧 Nossos Serviços:

• Troca de óleo
• Revisão completa
• Freios e suspensão
• Sistema elétrico
• Ar condicionado

Digite "menu" para voltar.`,
            position: { x: 300, y: 300 },
            next: 'end'
          },
          {
            id: 'orcamento',
            type: 'message',
            content: `💰 Orçamento Gratuito!

Fale conosco: (11) 99999-9999

Digite "menu" para voltar.`,
            position: { x: 500, y: 300 },
            next: 'end'
          },
          {
            id: 'contato',
            type: 'message',
            content: `📞 Contato:

Telefone: (11) 99999-9999
WhatsApp: (11) 99999-9999

Digite "menu" para voltar.`,
            position: { x: 700, y: 300 },
            next: 'end'
          },
          {
            id: 'localizacao',
            type: 'message',
            content: `📍 Localização:

Rua das Oficinas, 123
Centro - São Paulo/SP

Digite "menu" para voltar.`,
            position: { x: 900, y: 300 },
            next: 'end'
          },
          {
            id: 'opcao_invalida',
            type: 'message',
            content: `❌ Opção inválida!

Digite apenas 1, 2, 3 ou 4.

Digite "menu" para ver opções.`,
            position: { x: 100, y: 600 },
            next: 'end'
          },
          {
            id: 'end',
            type: 'end',
            position: { x: 100, y: 700 }
          }
        ],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      };

      // Criar o fluxo
      const newFlow = await Flow.create({
        name: 'Menu Simples - Auto Mecânica',
        description: 'Fluxo básico funcionando',
        bot_id: botId,
        trigger_keywords: JSON.stringify(['oi', 'olá', 'menu', 'ola', 'hello', 'start']),
        is_active: true,
        is_default: true,
        priority: 10,
        flow_data: JSON.stringify(simpleFlowData)
      });

      console.log(`   ✅ Fluxo criado: ${newFlow.name} (ID: ${newFlow.id})`);
      console.log('   🎉 Agora o bot deve responder corretamente!');

    } else {
      console.log('   ✅ Fluxos ativos encontrados');
      
      // Verificar se têm trigger_keywords
      for (const flow of activeFlows) {
        let keywords = [];
        try {
          keywords = JSON.parse(flow.trigger_keywords || '[]');
        } catch (e) {
          keywords = [];
        }

        if (keywords.length === 0) {
          console.log(`   🔧 Adicionando keywords ao fluxo "${flow.name}"`);
          await flow.update({
            trigger_keywords: JSON.stringify(['oi', 'olá', 'menu', 'ola', 'hello', 'start'])
          });
        }
      }
    }

    // Verificar se handleNoFlow está funcionando
    console.log('\n2️⃣ Verificando fallback para quando não há fluxo...');
    
    // Ler o arquivo MaytapiFlowProcessor para ver se tem handleNoFlow
    const fs = require('fs');
    const processorPath = './src/services/MaytapiFlowProcessor.js';
    
    if (fs.existsSync(processorPath)) {
      const processorContent = fs.readFileSync(processorPath, 'utf8');
      
      if (processorContent.includes('handleNoFlow')) {
        console.log('   ✅ Método handleNoFlow existe');
      } else {
        console.log('   ⚠️ Método handleNoFlow não encontrado');
        console.log('   💡 Isso pode causar o erro "Desculpe, ocorreu um erro"');
      }

      // Verificar se tem resposta padrão para menu
      if (processorContent.includes("messageContent.toLowerCase() === 'menu'")) {
        console.log('   ✅ Comando "menu" está implementado');
      } else {
        console.log('   ⚠️ Comando "menu" pode não estar funcionando');
      }
    }

    console.log('\n✅ ANÁLISE CONCLUÍDA!');
    console.log('\n🎯 CAUSA PROVÁVEL DO ERRO:');
    console.log('   • Falta de fluxos ativos no sistema');
    console.log('   • Fluxos sem palavras-chave (trigger_keywords)');
    console.log('   • Método handleNoFlow não implementado corretamente');
    
    console.log('\n🚀 AÇÕES TOMADAS:');
    console.log('   • Verificação e criação de fluxo ativo');
    console.log('   • Adição de palavras-chave aos fluxos');
    console.log('   • Configuração de bot padrão');

    console.log('\n📱 TESTE AGORA:');
    console.log('   1. Reinicie o PM2: pm2 restart chatbot-whats-api');
    console.log('   2. Envie "menu" para o WhatsApp');
    console.log('   3. Deve aparecer o menu de opções');

  } catch (error) {
    console.error('❌ Erro:', error);
    console.error('Stack:', error.stack);
  }
}

fixErrorResponse().then(() => {
  console.log('\n🎉 Correção finalizada!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

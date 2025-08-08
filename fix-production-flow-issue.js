#!/usr/bin/env node

const path = require('path');
process.env.NODE_ENV = 'production';

console.log('🔧 CORRIGINDO PROBLEMA DE FLUXOS EM PRODUÇÃO');
console.log('============================================\n');

async function fixFlowIssue() {
  try {
    const { sequelize, Bot, Flow, Conversation } = require('./src/models');
    
    // 1. Verificar conexão com banco
    console.log('1️⃣ Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('   ✅ Conexão estabelecida');

    // 2. Verificar bots existentes
    console.log('\n2️⃣ Verificando bots...');
    const bots = await Bot.findAll();
    if (bots.length === 0) {
      console.log('   ❌ Nenhum bot encontrado. Criando bot padrão...');
      
      const defaultBot = await Bot.create({
        name: 'Auto Mecânica',
        phone_number: '5511999999999',
        status: 'active',
        user_id: 1,
        settings: JSON.stringify({
          welcome_message: 'Olá! Como posso ajudá-lo?',
          business_hours: '08:00-18:00',
          auto_response: true
        })
      });
      
      console.log(`   ✅ Bot criado: ${defaultBot.name} (ID: ${defaultBot.id})`);
      bots.push(defaultBot);
    } else {
      console.log(`   ✅ ${bots.length} bot(s) encontrado(s)`);
      for (const bot of bots) {
        console.log(`      - ${bot.name} (ID: ${bot.id}, Status: ${bot.status})`);
      }
    }

    // 3. Verificar fluxos ativos
    console.log('\n3️⃣ Verificando fluxos ativos...');
    const activeFlows = await Flow.findAll({
      where: { is_active: true }
    });

    if (activeFlows.length === 0) {
      console.log('   ❌ PROBLEMA IDENTIFICADO: Nenhum fluxo ativo!');
      console.log('   🔧 Criando fluxo padrão...');

      // Criar fluxo padrão funcional
      const defaultFlowData = {
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

Como posso ajudá-lo hoje?

1️⃣ Serviços disponíveis
2️⃣ Orçamento
3️⃣ Agendamento
4️⃣ Contato
5️⃣ Localização

Digite o número da opção desejada:`,
            position: { x: 100, y: 200 },
            next: 'menu_input'
          },
          {
            id: 'menu_input',
            type: 'input',
            variable: 'menu_option',
            position: { x: 100, y: 300 },
            next: 'menu_condition'
          },
          {
            id: 'menu_condition',
            type: 'condition',
            position: { x: 100, y: 400 },
            conditions: [
              {
                value: '1',
                operator: 'equals',
                variable: 'menu_option',
                next: 'servicos'
              },
              {
                value: '2',
                operator: 'equals',
                variable: 'menu_option',
                next: 'orcamento'
              },
              {
                value: '3',
                operator: 'equals',
                variable: 'menu_option',
                next: 'agendamento'
              },
              {
                value: '4',
                operator: 'equals',
                variable: 'menu_option',
                next: 'contato'
              },
              {
                value: '5',
                operator: 'equals',
                variable: 'menu_option',
                next: 'localizacao'
              }
            ],
            default_next: 'opcao_invalida'
          },
          {
            id: 'servicos',
            type: 'message',
            content: `🔧 Nossos Serviços:

• Troca de óleo e filtros
• Revisão completa
• Freios e suspensão
• Sistema elétrico
• Ar condicionado
• Diagnóstico computadorizado

Digite "menu" para voltar ao menu principal.`,
            position: { x: 300, y: 300 },
            next: 'end'
          },
          {
            id: 'orcamento',
            type: 'message',
            content: `💰 Orçamento Gratuito!

Para um orçamento personalizado, preciso de algumas informações:

• Modelo do veículo
• Ano
• Problema/serviço desejado

Fale com nosso atendente: (11) 99999-9999

Digite "menu" para voltar ao menu principal.`,
            position: { x: 500, y: 300 },
            next: 'end'
          },
          {
            id: 'agendamento',
            type: 'message',
            content: `📅 Agendamento

Horário de funcionamento:
Segunda a Sexta: 8h às 18h
Sábado: 8h às 12h

Para agendar, ligue: (11) 99999-9999
Ou envie WhatsApp: (11) 99999-9999

Digite "menu" para voltar ao menu principal.`,
            position: { x: 700, y: 300 },
            next: 'end'
          },
          {
            id: 'contato',
            type: 'message',
            content: `📞 Nossos Contatos:

Telefone: (11) 99999-9999
WhatsApp: (11) 99999-9999
Email: contato@automecanica.com

Horário de atendimento:
Segunda a Sexta: 8h às 18h
Sábado: 8h às 12h

Digite "menu" para voltar ao menu principal.`,
            position: { x: 900, y: 300 },
            next: 'end'
          },
          {
            id: 'localizacao',
            type: 'message',
            content: `📍 Nossa Localização:

Auto Mecânica Silva
Rua das Oficinas, 123
Centro - São Paulo/SP
CEP: 01234-567

🚗 Estacionamento gratuito
🚌 Próximo ao metrô

Digite "menu" para voltar ao menu principal.`,
            position: { x: 1100, y: 300 },
            next: 'end'
          },
          {
            id: 'opcao_invalida',
            type: 'message',
            content: `❌ Opção inválida!

Por favor, digite apenas o número da opção desejada (1 a 5).

Digite "menu" para ver as opções novamente.`,
            position: { x: 100, y: 600 },
            next: 'end'
          },
          {
            id: 'end',
            type: 'end',
            position: { x: 100, y: 700 }
          }
        ],
        edges: [
          { source: 'start', target: 'welcome' },
          { source: 'welcome', target: 'menu_input' },
          { source: 'menu_input', target: 'menu_condition' },
          { source: 'menu_condition', target: 'servicos' },
          { source: 'menu_condition', target: 'orcamento' },
          { source: 'menu_condition', target: 'agendamento' },
          { source: 'menu_condition', target: 'contato' },
          { source: 'menu_condition', target: 'localizacao' },
          { source: 'menu_condition', target: 'opcao_invalida' },
          { source: 'servicos', target: 'end' },
          { source: 'orcamento', target: 'end' },
          { source: 'agendamento', target: 'end' },
          { source: 'contato', target: 'end' },
          { source: 'localizacao', target: 'end' },
          { source: 'opcao_invalida', target: 'end' }
        ],
        viewport: { x: 0, y: 0, zoom: 1 }
      };

      const defaultFlow = await Flow.create({
        name: 'Menu Principal - Auto Mecânica',
        description: 'Fluxo principal com menu de opções para auto mecânica',
        bot_id: bots[0].id,
        trigger_keywords: JSON.stringify(['oi', 'olá', 'menu', 'início', 'start', 'ola', 'hello']),
        is_active: true,
        is_default: true,
        priority: 10,
        flow_data: JSON.stringify(defaultFlowData)
      });

      console.log(`   ✅ Fluxo padrão criado: ${defaultFlow.name} (ID: ${defaultFlow.id})`);

    } else {
      console.log(`   ✅ ${activeFlows.length} fluxo(s) ativo(s) encontrado(s)`);
      
      // Verificar se os fluxos têm trigger_keywords
      for (const flow of activeFlows) {
        let triggerKeywords = [];
        try {
          triggerKeywords = JSON.parse(flow.trigger_keywords || '[]');
        } catch (e) {
          triggerKeywords = [];
        }

        if (triggerKeywords.length === 0) {
          console.log(`   ⚠️ Fluxo "${flow.name}" sem palavras-chave. Adicionando...`);
          await flow.update({
            trigger_keywords: JSON.stringify(['oi', 'olá', 'menu', 'início', 'start', 'ola'])
          });
          console.log(`   ✅ Palavras-chave adicionadas ao fluxo "${flow.name}"`);
        }
      }
    }

    // 4. Verificar e corrigir configuração do bot
    console.log('\n4️⃣ Verificando configuração dos bots...');
    for (const bot of bots) {
      if (bot.status !== 'active') {
        console.log(`   🔧 Ativando bot "${bot.name}"...`);
        await bot.update({ status: 'active' });
      }

      // Verificar se tem configurações básicas
      let settings = {};
      try {
        settings = JSON.parse(bot.settings || '{}');
      } catch (e) {
        settings = {};
      }

      if (!settings.welcome_message) {
        settings.welcome_message = 'Olá! Como posso ajudá-lo?';
        settings.auto_response = true;
        settings.business_hours = '08:00-18:00';
        
        await bot.update({
          settings: JSON.stringify(settings)
        });
        
        console.log(`   ✅ Configurações básicas adicionadas ao bot "${bot.name}"`);
      }
    }

    // 5. Testar processamento
    console.log('\n5️⃣ Testando processamento de mensagem...');
    try {
      const MaytapiFlowProcessor = require('./src/services/MaytapiFlowProcessor');
      const MaytapiService = require('./src/services/MaytapiService');
      
      const maytapiService = new MaytapiService();
      console.log('   ✅ MaytapiService inicializado');

      // Simular processamento
      const testResult = await maytapiService.flowProcessor.processMessage(
        bots[0].id,
        '5511999999999',
        'menu',
        'text'
      );

      if (testResult && testResult.success) {
        console.log('   ✅ Teste de processamento bem-sucedido');
      } else {
        console.log('   ⚠️ Teste de processamento com problemas:', testResult?.error || 'Erro desconhecido');
      }

    } catch (testError) {
      console.log(`   ❌ Erro no teste: ${testError.message}`);
    }

    console.log('\n✅ CORREÇÃO CONCLUÍDA!');
    console.log('\n📋 Resumo das ações:');
    console.log('   • Verificação de bots e fluxos');
    console.log('   • Criação de fluxo padrão (se necessário)');
    console.log('   • Configuração de palavras-chave');
    console.log('   • Ativação de bots');
    console.log('   • Teste de processamento');
    
    console.log('\n🚀 Próximos passos:');
    console.log('   1. Reinicie o PM2: pm2 restart chatbot-whats-api');
    console.log('   2. Teste enviando "menu" para o WhatsApp');
    console.log('   3. Verifique os logs: pm2 logs chatbot-whats-api');

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Executar correção
fixFlowIssue().then(() => {
  console.log('\n🎉 Correção finalizada com sucesso!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

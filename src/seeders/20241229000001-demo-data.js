'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar usuário admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    const userPassword = await bcrypt.hash('user123', 12);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        name: 'Administrador',
        email: 'admin@whatsapp-bot.com',
        password: adminPassword,
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Usuário Demo',
        email: 'demo@whatsapp-bot.com',
        password: userPassword,
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Criar bot demo
    await queryInterface.bulkInsert('bots', [
      {
        id: 1,
        user_id: 2,
        name: 'Bot de Atendimento Demo',
        description: 'Bot demonstrativo para atendimento ao cliente',
        ai_config: JSON.stringify({
          enabled: true,
          model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
          temperature: 0.7,
          max_tokens: 1000,
          system_prompt: 'Você é um assistente virtual de atendimento ao cliente. Seja sempre educado, prestativo e profissional. Responda em português brasileiro.'
        }),
        is_active: true,
        is_connected: false,
        connection_status: 'disconnected',
        settings: JSON.stringify({
          auto_reply: true,
          typing_delay: 1500,
          read_receipts: true,
          group_support: false,
          business_hours: {
            enabled: false,
            timezone: 'America/Sao_Paulo',
            schedule: {
              monday: { start: '09:00', end: '18:00', enabled: true },
              tuesday: { start: '09:00', end: '18:00', enabled: true },
              wednesday: { start: '09:00', end: '18:00', enabled: true },
              thursday: { start: '09:00', end: '18:00', enabled: true },
              friday: { start: '09:00', end: '18:00', enabled: true },
              saturday: { start: '09:00', end: '12:00', enabled: false },
              sunday: { start: '09:00', end: '12:00', enabled: false }
            }
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Criar fluxo demo
    const demoFlowData = {
      nodes: [
        {
          id: 'start_1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: {
            message: '👋 Olá! Bem-vindo ao nosso atendimento!\n\nComo posso ajudá-lo hoje?\n\n1️⃣ Informações sobre produtos\n2️⃣ Suporte técnico\n3️⃣ Falar com atendente\n4️⃣ Outras dúvidas'
          }
        },
        {
          id: 'condition_1',
          type: 'condition',
          position: { x: 100, y: 250 },
          data: {
            conditions: [
              {
                field: 'message_content',
                operator: 'contains',
                value: '1'
              }
            ],
            operator: 'OR'
          }
        },
        {
          id: 'products_info',
          type: 'fixed_response',
          position: { x: 300, y: 200 },
          data: {
            message: '📦 Informações sobre Produtos\n\nTemos uma ampla gama de produtos disponíveis:\n\n• Categoria A\n• Categoria B\n• Categoria C\n\nGostaria de saber mais sobre alguma categoria específica?',
            delay: 1000
          }
        },
        {
          id: 'support_check',
          type: 'condition',
          position: { x: 100, y: 400 },
          data: {
            conditions: [
              {
                field: 'message_content',
                operator: 'contains',
                value: '2'
              }
            ],
            operator: 'OR'
          }
        },
        {
          id: 'technical_support',
          type: 'ai_response',
          position: { x: 300, y: 350 },
          data: {
            system_prompt: 'Você é um especialista em suporte técnico. Ajude o usuário com problemas técnicos de forma clara e didática.',
            temperature: 0.5,
            max_tokens: 500
          }
        },
        {
          id: 'human_check',
          type: 'condition',
          position: { x: 100, y: 550 },
          data: {
            conditions: [
              {
                field: 'message_content',
                operator: 'contains',
                value: '3'
              }
            ],
            operator: 'OR'
          }
        },
        {
          id: 'transfer_human',
          type: 'transfer_human',
          position: { x: 300, y: 500 },
          data: {
            message: '👨‍💼 Transferindo você para um de nossos atendentes...\n\nEm breve alguém entrará em contato!',
            department: 'support'
          }
        },
        {
          id: 'ai_general',
          type: 'ai_response',
          position: { x: 100, y: 700 },
          data: {
            system_prompt: 'Você é um assistente de atendimento ao cliente. Responda de forma útil e educada sobre dúvidas gerais.',
            temperature: 0.7,
            max_tokens: 800
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'start_1', target: 'condition_1' },
        { id: 'e2', source: 'condition_1', target: 'products_info', sourceHandle: 'true' },
        { id: 'e3', source: 'condition_1', target: 'support_check', sourceHandle: 'false' },
        { id: 'e4', source: 'support_check', target: 'technical_support', sourceHandle: 'true' },
        { id: 'e5', source: 'support_check', target: 'human_check', sourceHandle: 'false' },
        { id: 'e6', source: 'human_check', target: 'transfer_human', sourceHandle: 'true' },
        { id: 'e7', source: 'human_check', target: 'ai_general', sourceHandle: 'false' }
      ],
      viewport: { x: 0, y: 0, zoom: 1 }
    };

    await queryInterface.bulkInsert('flows', [
      {
        id: 1,
        bot_id: 1,
        name: 'Fluxo de Atendimento Principal',
        description: 'Fluxo principal para atendimento ao cliente com opções de produtos, suporte e transferência humana',
        flow_data: JSON.stringify(demoFlowData),
        version: '1.0.0',
        is_active: true,
        is_default: true,
        trigger_keywords: JSON.stringify(['oi', 'olá', 'hello', 'help', 'ajuda', 'início']),
        trigger_conditions: JSON.stringify({
          type: 'any',
          keywords: ['oi', 'olá', 'hello', 'help', 'ajuda'],
          intents: [],
          time_conditions: null,
          custom_conditions: null
        }),
        priority: 1,
        statistics: JSON.stringify({
          total_executions: 0,
          successful_completions: 0,
          average_completion_time: 0,
          last_execution: null
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Criar fluxo FAQ
    const faqFlowData = {
      nodes: [
        {
          id: 'start_faq',
          type: 'start',
          position: { x: 100, y: 100 },
          data: {
            message: '❓ FAQ - Perguntas Frequentes\n\nEscolha uma categoria:\n\n1️⃣ Horário de funcionamento\n2️⃣ Formas de pagamento\n3️⃣ Política de devolução\n4️⃣ Entrega e frete'
          }
        },
        {
          id: 'faq_condition',
          type: 'condition',
          position: { x: 100, y: 250 },
          data: {
            conditions: [
              { field: 'message_content', operator: 'contains', value: '1' }
            ]
          }
        },
        {
          id: 'hours_info',
          type: 'fixed_response',
          position: { x: 300, y: 200 },
          data: {
            message: '🕒 Horário de Funcionamento\n\nSegunda a Sexta: 9h às 18h\nSábado: 9h às 12h\nDomingo: Fechado\n\nAtendimento online 24h via chatbot!'
          }
        },
        {
          id: 'end_faq',
          type: 'end',
          position: { x: 500, y: 300 },
          data: {
            message: 'Espero ter ajudado! 😊\n\nSe tiver outras dúvidas, digite "menu" para voltar ao início.'
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'start_faq', target: 'faq_condition' },
        { id: 'e2', source: 'faq_condition', target: 'hours_info' },
        { id: 'e3', source: 'hours_info', target: 'end_faq' }
      ],
      viewport: { x: 0, y: 0, zoom: 1 }
    };

    await queryInterface.bulkInsert('flows', [
      {
        id: 2,
        bot_id: 1,
        name: 'FAQ - Perguntas Frequentes',
        description: 'Fluxo para responder perguntas frequentes dos clientes',
        flow_data: JSON.stringify(faqFlowData),
        version: '1.0.0',
        is_active: true,
        is_default: false,
        trigger_keywords: JSON.stringify(['faq', 'dúvidas', 'perguntas', 'frequentes', 'horário', 'funcionamento']),
        trigger_conditions: JSON.stringify({
          type: 'keyword',
          keywords: ['faq', 'dúvidas', 'perguntas'],
          intents: [],
          time_conditions: null,
          custom_conditions: null
        }),
        priority: 2,
        statistics: JSON.stringify({
          total_executions: 0,
          successful_completions: 0,
          average_completion_time: 0,
          last_execution: null
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('✅ Dados demo criados com sucesso!');
    console.log('📧 Admin: admin@whatsapp-bot.com / admin123');
    console.log('📧 Demo: demo@whatsapp-bot.com / user123');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('flows', null, {});
    await queryInterface.bulkDelete('bots', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};

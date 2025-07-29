class FlowTemplateService {
  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    // Template: Atendimento ao Cliente
    this.templates.set('customer_service', {
      id: 'customer_service',
      name: 'Atendimento ao Cliente',
      description: 'Fluxo completo para atendimento ao cliente com opções de produtos, suporte e transferência',
      category: 'atendimento',
      tags: ['atendimento', 'suporte', 'produtos'],
      flow_data: {
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
            id: 'menu_condition',
            type: 'condition',
            position: { x: 100, y: 250 },
            data: {
              conditions: [
                { field: 'message_content', operator: 'contains', value: '1' }
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
            id: 'support_condition',
            type: 'condition',
            position: { x: 100, y: 400 },
            data: {
              conditions: [
                { field: 'message_content', operator: 'contains', value: '2' }
              ]
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
            id: 'human_condition',
            type: 'condition',
            position: { x: 100, y: 550 },
            data: {
              conditions: [
                { field: 'message_content', operator: 'contains', value: '3' }
              ]
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
          { id: 'e1', source: 'start_1', target: 'menu_condition' },
          { id: 'e2', source: 'menu_condition', target: 'products_info', sourceHandle: 'true' },
          { id: 'e3', source: 'menu_condition', target: 'support_condition', sourceHandle: 'false' },
          { id: 'e4', source: 'support_condition', target: 'technical_support', sourceHandle: 'true' },
          { id: 'e5', source: 'support_condition', target: 'human_condition', sourceHandle: 'false' },
          { id: 'e6', source: 'human_condition', target: 'transfer_human', sourceHandle: 'true' },
          { id: 'e7', source: 'human_condition', target: 'ai_general', sourceHandle: 'false' }
        ],
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      trigger_keywords: ['oi', 'olá', 'hello', 'help', 'ajuda', 'início'],
      variables: [
        { name: 'user_name', type: 'string', description: 'Nome do usuário' },
        { name: 'user_email', type: 'email', description: 'Email do usuário' },
        { name: 'issue_type', type: 'string', description: 'Tipo do problema' }
      ]
    });

    // Template: Lead Qualification
    this.templates.set('lead_qualification', {
      id: 'lead_qualification',
      name: 'Qualificação de Leads',
      description: 'Fluxo para qualificar leads e coletar informações importantes',
      category: 'vendas',
      tags: ['vendas', 'leads', 'qualificação'],
      flow_data: {
        nodes: [
          {
            id: 'start_lead',
            type: 'start',
            position: { x: 100, y: 100 },
            data: {
              message: '🎯 Olá! Que bom ter você aqui!\n\nPara oferecer a melhor solução, preciso conhecer um pouco sobre você.\n\nQual é o seu nome?'
            }
          },
          {
            id: 'capture_name',
            type: 'input_capture',
            position: { x: 100, y: 250 },
            data: {
              variable_name: 'user_name',
              input_type: 'text',
              validation: { required: true, min_length: 2 },
              retry_message: 'Por favor, digite seu nome completo.'
            }
          },
          {
            id: 'ask_company',
            type: 'fixed_response',
            position: { x: 100, y: 400 },
            data: {
              message: 'Prazer em conhecê-lo, {{user_name}}! 😊\n\nEm qual empresa você trabalha?'
            }
          },
          {
            id: 'capture_company',
            type: 'input_capture',
            position: { x: 100, y: 550 },
            data: {
              variable_name: 'company',
              input_type: 'text',
              validation: { required: true, min_length: 2 }
            }
          },
          {
            id: 'ask_role',
            type: 'fixed_response',
            position: { x: 100, y: 700 },
            data: {
              message: 'Perfeito! E qual é o seu cargo na {{company}}?'
            }
          },
          {
            id: 'capture_role',
            type: 'input_capture',
            position: { x: 100, y: 850 },
            data: {
              variable_name: 'role',
              input_type: 'text',
              validation: { required: true }
            }
          },
          {
            id: 'qualification_complete',
            type: 'fixed_response',
            position: { x: 100, y: 1000 },
            data: {
              message: 'Excelente, {{user_name}}! 🎉\n\nAgora que conheço seu perfil, posso apresentar as melhores soluções para a {{company}}.\n\nUm especialista entrará em contato em breve!'
            }
          },
          {
            id: 'send_to_crm',
            type: 'webhook',
            position: { x: 300, y: 1000 },
            data: {
              url: 'https://api.crm.com/leads',
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: {
                name: '{{user_name}}',
                company: '{{company}}',
                role: '{{role}}',
                source: 'whatsapp_bot'
              }
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'start_lead', target: 'capture_name' },
          { id: 'e2', source: 'capture_name', target: 'ask_company' },
          { id: 'e3', source: 'ask_company', target: 'capture_company' },
          { id: 'e4', source: 'capture_company', target: 'ask_role' },
          { id: 'e5', source: 'ask_role', target: 'capture_role' },
          { id: 'e6', source: 'capture_role', target: 'qualification_complete' },
          { id: 'e7', source: 'qualification_complete', target: 'send_to_crm' }
        ],
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      trigger_keywords: ['vendas', 'produto', 'solução', 'orçamento'],
      variables: [
        { name: 'user_name', type: 'string', description: 'Nome completo do lead' },
        { name: 'company', type: 'string', description: 'Empresa do lead' },
        { name: 'role', type: 'string', description: 'Cargo do lead' },
        { name: 'phone', type: 'phone', description: 'Telefone do lead' }
      ]
    });

    // Template: FAQ Automático
    this.templates.set('faq_bot', {
      id: 'faq_bot',
      name: 'FAQ Automático',
      description: 'Bot para responder perguntas frequentes automaticamente',
      category: 'suporte',
      tags: ['faq', 'perguntas', 'automático'],
      flow_data: {
        nodes: [
          {
            id: 'faq_start',
            type: 'start',
            position: { x: 100, y: 100 },
            data: {
              message: '❓ Central de Perguntas Frequentes\n\nEscolha uma categoria:\n\n1️⃣ Horário de funcionamento\n2️⃣ Formas de pagamento\n3️⃣ Política de devolução\n4️⃣ Entrega e frete\n5️⃣ Falar com atendente'
            }
          },
          {
            id: 'faq_router',
            type: 'condition',
            position: { x: 100, y: 250 },
            data: {
              conditions: [
                { field: 'message_content', operator: 'contains', value: '1' },
                { field: 'message_content', operator: 'contains', value: 'horário' },
                { field: 'message_content', operator: 'contains', value: 'funcionamento' }
              ],
              operator: 'OR'
            }
          },
          {
            id: 'hours_info',
            type: 'fixed_response',
            position: { x: 300, y: 200 },
            data: {
              message: '🕒 Horário de Funcionamento\n\n📅 Segunda a Sexta: 9h às 18h\n📅 Sábado: 9h às 12h\n📅 Domingo: Fechado\n\n🤖 Atendimento online 24h via chatbot!\n\nPrecisa de mais alguma coisa?'
            }
          },
          {
            id: 'payment_condition',
            type: 'condition',
            position: { x: 100, y: 400 },
            data: {
              conditions: [
                { field: 'message_content', operator: 'contains', value: '2' },
                { field: 'message_content', operator: 'contains', value: 'pagamento' }
              ],
              operator: 'OR'
            }
          },
          {
            id: 'payment_info',
            type: 'fixed_response',
            position: { x: 300, y: 350 },
            data: {
              message: '💳 Formas de Pagamento\n\n✅ Cartão de crédito (até 12x)\n✅ Cartão de débito\n✅ PIX (5% desconto)\n✅ Boleto bancário\n✅ Transferência bancária\n\nTodas as transações são seguras e criptografadas! 🔒'
            }
          },
          {
            id: 'ai_fallback',
            type: 'ai_response',
            position: { x: 100, y: 600 },
            data: {
              system_prompt: 'Você é um assistente de FAQ. Responda perguntas sobre horários, pagamentos, devoluções e entregas de forma clara e objetiva.',
              temperature: 0.3,
              max_tokens: 300
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'faq_start', target: 'faq_router' },
          { id: 'e2', source: 'faq_router', target: 'hours_info', sourceHandle: 'true' },
          { id: 'e3', source: 'faq_router', target: 'payment_condition', sourceHandle: 'false' },
          { id: 'e4', source: 'payment_condition', target: 'payment_info', sourceHandle: 'true' },
          { id: 'e5', source: 'payment_condition', target: 'ai_fallback', sourceHandle: 'false' }
        ],
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      trigger_keywords: ['faq', 'dúvidas', 'perguntas', 'horário', 'pagamento'],
      variables: []
    });

    console.log(`✅ ${this.templates.size} templates de fluxo carregados`);
  }

  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category) {
    return Array.from(this.templates.values()).filter(template => 
      template.category === category
    );
  }

  getTemplateById(id) {
    return this.templates.get(id);
  }

  searchTemplates(query) {
    const searchTerm = query.toLowerCase();
    return Array.from(this.templates.values()).filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  createFlowFromTemplate(templateId, customizations = {}) {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} não encontrado`);
    }

    // Clonar template
    const flowData = JSON.parse(JSON.stringify(template.flow_data));
    
    // Aplicar customizações
    if (customizations.name) {
      // Personalizar nome nos nós se necessário
    }

    if (customizations.variables) {
      // Substituir variáveis nos nós
      this.replaceVariables(flowData, customizations.variables);
    }

    return {
      name: customizations.name || template.name,
      description: customizations.description || template.description,
      flow_data: flowData,
      trigger_keywords: customizations.trigger_keywords || template.trigger_keywords,
      is_active: customizations.is_active !== undefined ? customizations.is_active : true,
      is_default: customizations.is_default || false,
      template_id: templateId
    };
  }

  replaceVariables(flowData, variables) {
    const replaceInString = (str) => {
      let result = str;
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, variables[key]);
      });
      return result;
    };

    // Substituir variáveis em todos os nós
    flowData.nodes.forEach(node => {
      if (node.data && node.data.message) {
        node.data.message = replaceInString(node.data.message);
      }
      if (node.data && node.data.system_prompt) {
        node.data.system_prompt = replaceInString(node.data.system_prompt);
      }
    });
  }

  getCategories() {
    const categories = new Set();
    this.templates.forEach(template => {
      categories.add(template.category);
    });
    return Array.from(categories);
  }

  getAllTags() {
    const tags = new Set();
    this.templates.forEach(template => {
      template.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }
}

module.exports = FlowTemplateService;

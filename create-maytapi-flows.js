const { Bot, Flow } = require('./src/models');

async function createMaytapiFlows() {
  console.log('🔄 CRIANDO FLUXOS PARA MAYTAPI');
  console.log('==============================');
  console.log('');

  try {
    // 1. Buscar bots existentes
    console.log('1️⃣ Buscando bots...');
    const bots = await Bot.findAll({ where: { is_active: true } });
    
    if (bots.length === 0) {
      console.log('⚠️ Nenhum bot ativo encontrado. Criando bot de exemplo...');
      
      const newBot = await Bot.create({
        name: 'Bot Maytapi',
        description: 'Bot com fluxos integrados à Maytapi',
        is_active: true,
        ai_config: {
          enabled: true,
          model: 'deepseek-ai/DeepSeek-V3',
          temperature: 0.7
        }
      });
      
      bots.push(newBot);
      console.log(`✅ Bot criado: ${newBot.name} (ID: ${newBot.id})`);
    }

    console.log(`📋 Encontrados ${bots.length} bots ativos`);
    console.log('');

    // 2. Criar fluxos para cada bot
    for (const bot of bots) {
      console.log(`🤖 Criando fluxos para bot: ${bot.name} (ID: ${bot.id})`);
      
      // Fluxo 1: Menu Principal
      const menuFlow = await createMenuFlow(bot.id);
      console.log(`   ✅ Fluxo criado: ${menuFlow.name}`);
      
      // Fluxo 2: Cadastro de Cliente
      const cadastroFlow = await createCadastroFlow(bot.id);
      console.log(`   ✅ Fluxo criado: ${cadastroFlow.name}`);
      
      // Fluxo 3: Suporte Técnico
      const suporteFlow = await createSuporteFlow(bot.id);
      console.log(`   ✅ Fluxo criado: ${suporteFlow.name}`);
      
      // Fluxo 4: Vendas
      const vendasFlow = await createVendasFlow(bot.id);
      console.log(`   ✅ Fluxo criado: ${vendasFlow.name}`);
      
      console.log('');
    }

    console.log('🎉 FLUXOS CRIADOS COM SUCESSO!');
    console.log('');
    console.log('📱 COMO TESTAR:');
    console.log('1. Envie mensagem para: 556392901378');
    console.log('2. Digite: "oi", "menu", "ajuda"');
    console.log('3. Siga as opções do menu');
    console.log('');
    console.log('🎯 PALAVRAS-CHAVE DISPONÍVEIS:');
    console.log('- "oi", "olá", "menu" → Menu Principal');
    console.log('- "cadastro", "registrar" → Cadastro');
    console.log('- "suporte", "problema" → Suporte');
    console.log('- "vendas", "comprar" → Vendas');

  } catch (error) {
    console.error('❌ Erro ao criar fluxos:', error);
  }
}

async function createMenuFlow(botId) {
  return await Flow.create({
    bot_id: botId,
    name: 'Menu Principal',
    description: 'Menu principal de navegação',
    is_active: true,
    is_default: true,
    priority: 100,
    trigger_keywords: ['oi', 'olá', 'menu', 'ajuda', 'start'],
    flow_data: {
      nodes: [
        {
          id: 'start',
          type: 'start',
          content: null,
          next: 'welcome'
        },
        {
          id: 'welcome',
          type: 'message',
          content: '👋 Olá! Bem-vindo ao nosso atendimento!\n\nEscolha uma opção:\n\n1️⃣ Informações\n2️⃣ Cadastro\n3️⃣ Suporte\n4️⃣ Vendas\n5️⃣ Falar com IA\n\nDigite o número da opção desejada:',
          next: 'menu_input'
        },
        {
          id: 'menu_input',
          type: 'input',
          content: null,
          variable: 'menu_option',
          next: 'menu_condition'
        },
        {
          id: 'menu_condition',
          type: 'condition',
          conditions: [
            {
              variable: 'menu_option',
              operator: 'equals',
              value: '1',
              next: 'info'
            },
            {
              variable: 'menu_option',
              operator: 'equals',
              value: '2',
              next: 'redirect_cadastro'
            },
            {
              variable: 'menu_option',
              operator: 'equals',
              value: '3',
              next: 'redirect_suporte'
            },
            {
              variable: 'menu_option',
              operator: 'equals',
              value: '4',
              next: 'redirect_vendas'
            },
            {
              variable: 'menu_option',
              operator: 'equals',
              value: '5',
              next: 'ai_mode'
            }
          ],
          fallback: 'invalid_option'
        },
        {
          id: 'info',
          type: 'message',
          content: '📋 *INFORMAÇÕES DA EMPRESA*\n\n🕒 *Horário:* Segunda a Sexta, 8h às 18h\n📍 *Endereço:* Rua Example, 123 - Centro\n📞 *Telefone:* (11) 99999-9999\n📧 *Email:* contato@empresa.com\n🌐 *Site:* www.empresa.com\n\nDigite "menu" para voltar ao menu principal.',
          next: 'end'
        },
        {
          id: 'redirect_cadastro',
          type: 'message',
          content: '📝 Redirecionando para cadastro...\n\nDigite "cadastro" para iniciar seu cadastro.',
          next: 'end'
        },
        {
          id: 'redirect_suporte',
          type: 'message',
          content: '🛠️ Redirecionando para suporte...\n\nDigite "suporte" para falar com nossa equipe técnica.',
          next: 'end'
        },
        {
          id: 'redirect_vendas',
          type: 'message',
          content: '💰 Redirecionando para vendas...\n\nDigite "vendas" para conhecer nossos produtos.',
          next: 'end'
        },
        {
          id: 'ai_mode',
          type: 'ai',
          prompt: 'Você é um assistente virtual prestativo da empresa. Responda de forma amigável e profissional. Se não souber algo específico, oriente o usuário a usar o menu ou falar com um atendente.',
          fallbackMessage: 'Desculpe, não consegui processar sua solicitação. Digite "menu" para ver as opções disponíveis.',
          next: 'end'
        },
        {
          id: 'invalid_option',
          type: 'message',
          content: '❌ Opção inválida!\n\nPor favor, digite um número de 1 a 5.\n\nDigite "menu" para ver as opções novamente.',
          next: 'end'
        },
        {
          id: 'end',
          type: 'end',
          content: null
        }
      ]
    }
  });
}

async function createCadastroFlow(botId) {
  return await Flow.create({
    bot_id: botId,
    name: 'Cadastro de Cliente',
    description: 'Fluxo para cadastro de novos clientes',
    is_active: true,
    is_default: false,
    priority: 80,
    trigger_keywords: ['cadastro', 'registrar', 'registro'],
    flow_data: {
      nodes: [
        {
          id: 'start',
          type: 'start',
          next: 'welcome'
        },
        {
          id: 'welcome',
          type: 'message',
          content: '📝 *CADASTRO DE CLIENTE*\n\nVamos fazer seu cadastro!\n\nPrimeiro, qual é o seu nome completo?',
          next: 'get_name'
        },
        {
          id: 'get_name',
          type: 'input',
          variable: 'customer_name',
          validation: { type: 'required' },
          errorMessage: 'Por favor, digite seu nome completo.',
          next: 'get_email'
        },
        {
          id: 'get_email',
          type: 'message',
          content: 'Obrigado, {{customer_name}}! 😊\n\nAgora, qual é o seu e-mail?',
          next: 'input_email'
        },
        {
          id: 'input_email',
          type: 'input',
          variable: 'customer_email',
          validation: { type: 'email' },
          errorMessage: 'Por favor, digite um e-mail válido (exemplo: nome@email.com).',
          next: 'get_phone'
        },
        {
          id: 'get_phone',
          type: 'message',
          content: 'Perfeito!\n\nAgora digite seu telefone (apenas números):',
          next: 'input_phone'
        },
        {
          id: 'input_phone',
          type: 'input',
          variable: 'customer_phone',
          validation: { type: 'phone' },
          errorMessage: 'Por favor, digite um telefone válido (10 ou 11 dígitos).',
          next: 'confirm'
        },
        {
          id: 'confirm',
          type: 'message',
          content: '✅ *CADASTRO REALIZADO COM SUCESSO!*\n\n👤 *Nome:* {{customer_name}}\n📧 *E-mail:* {{customer_email}}\n📞 *Telefone:* {{customer_phone}}\n\nSeus dados foram salvos em nosso sistema.\n\nObrigado por se cadastrar! 🎉',
          next: 'save_data'
        },
        {
          id: 'save_data',
          type: 'action',
          action: { type: 'save_data' },
          next: 'end'
        },
        {
          id: 'end',
          type: 'end',
          content: 'Digite "menu" para voltar ao menu principal.'
        }
      ]
    }
  });
}

async function createSuporteFlow(botId) {
  return await Flow.create({
    bot_id: botId,
    name: 'Suporte Técnico',
    description: 'Fluxo para atendimento de suporte',
    is_active: true,
    is_default: false,
    priority: 70,
    trigger_keywords: ['suporte', 'problema', 'ajuda técnica', 'erro'],
    flow_data: {
      nodes: [
        {
          id: 'start',
          type: 'start',
          next: 'welcome'
        },
        {
          id: 'welcome',
          type: 'message',
          content: '🛠️ *SUPORTE TÉCNICO*\n\nOlá! Estou aqui para ajudá-lo.\n\nQual tipo de problema você está enfrentando?\n\n1️⃣ Problema com login\n2️⃣ Erro no sistema\n3️⃣ Dúvida sobre funcionalidade\n4️⃣ Outro problema\n\nDigite o número da opção:',
          next: 'problem_input'
        },
        {
          id: 'problem_input',
          type: 'input',
          variable: 'problem_type',
          next: 'problem_condition'
        },
        {
          id: 'problem_condition',
          type: 'condition',
          conditions: [
            {
              variable: 'problem_type',
              operator: 'equals',
              value: '1',
              next: 'login_help'
            },
            {
              variable: 'problem_type',
              operator: 'equals',
              value: '2',
              next: 'system_error'
            },
            {
              variable: 'problem_type',
              operator: 'equals',
              value: '3',
              next: 'functionality_help'
            },
            {
              variable: 'problem_type',
              operator: 'equals',
              value: '4',
              next: 'other_problem'
            }
          ],
          fallback: 'ai_support'
        },
        {
          id: 'login_help',
          type: 'message',
          content: '🔐 *PROBLEMA COM LOGIN*\n\nVamos resolver isso!\n\n1. Verifique se está usando o e-mail correto\n2. Tente redefinir sua senha\n3. Limpe o cache do navegador\n\nSe o problema persistir, nossa IA pode ajudar mais. Digite sua dúvida específica:',
          next: 'ai_support'
        },
        {
          id: 'system_error',
          type: 'message',
          content: '⚠️ *ERRO NO SISTEMA*\n\nPor favor, descreva detalhadamente o erro que está ocorrendo:\n\n- Quando acontece?\n- Qual mensagem aparece?\n- Em que tela/funcionalidade?\n\nNossa IA irá analisar e ajudar:',
          next: 'ai_support'
        },
        {
          id: 'functionality_help',
          type: 'message',
          content: '❓ *DÚVIDA SOBRE FUNCIONALIDADE*\n\nFique à vontade para perguntar!\n\nDescreva sua dúvida e nossa IA especializada irá ajudá-lo:',
          next: 'ai_support'
        },
        {
          id: 'other_problem',
          type: 'message',
          content: '🔧 *OUTRO PROBLEMA*\n\nDescreva seu problema detalhadamente.\n\nNossa IA irá analisar e fornecer a melhor solução:',
          next: 'ai_support'
        },
        {
          id: 'ai_support',
          type: 'ai',
          prompt: 'Você é um especialista em suporte técnico. Analise o problema descrito pelo usuário e forneça uma solução clara e passo a passo. Se não conseguir resolver, oriente sobre como entrar em contato com suporte humano.',
          fallbackMessage: 'Para problemas complexos, entre em contato com nosso suporte: suporte@empresa.com ou (11) 99999-9999',
          next: 'end'
        },
        {
          id: 'end',
          type: 'end',
          content: 'Espero ter ajudado! Digite "menu" para voltar ao menu principal.'
        }
      ]
    }
  });
}

async function createVendasFlow(botId) {
  return await Flow.create({
    bot_id: botId,
    name: 'Vendas',
    description: 'Fluxo para vendas e informações de produtos',
    is_active: true,
    is_default: false,
    priority: 60,
    trigger_keywords: ['vendas', 'comprar', 'produto', 'preço'],
    flow_data: {
      nodes: [
        {
          id: 'start',
          type: 'start',
          next: 'welcome'
        },
        {
          id: 'welcome',
          type: 'message',
          content: '💰 *VENDAS*\n\nOlá! Que bom que tem interesse em nossos produtos!\n\nO que você gostaria de saber?\n\n1️⃣ Ver produtos\n2️⃣ Consultar preços\n3️⃣ Fazer pedido\n4️⃣ Falar com vendedor\n\nDigite o número da opção:',
          next: 'sales_input'
        },
        {
          id: 'sales_input',
          type: 'input',
          variable: 'sales_option',
          next: 'sales_condition'
        },
        {
          id: 'sales_condition',
          type: 'condition',
          conditions: [
            {
              variable: 'sales_option',
              operator: 'equals',
              value: '1',
              next: 'show_products'
            },
            {
              variable: 'sales_option',
              operator: 'equals',
              value: '2',
              next: 'show_prices'
            },
            {
              variable: 'sales_option',
              operator: 'equals',
              value: '3',
              next: 'make_order'
            },
            {
              variable: 'sales_option',
              operator: 'equals',
              value: '4',
              next: 'human_sales'
            }
          ],
          fallback: 'ai_sales'
        },
        {
          id: 'show_products',
          type: 'message',
          content: '📦 *NOSSOS PRODUTOS*\n\n🔹 Produto A - Solução completa\n🔹 Produto B - Versão básica\n🔹 Produto C - Versão premium\n\nPara mais detalhes sobre qualquer produto, nossa IA pode ajudar. Digite o nome do produto:',
          next: 'ai_sales'
        },
        {
          id: 'show_prices',
          type: 'message',
          content: '💲 *TABELA DE PREÇOS*\n\n🔹 Produto A: R$ 99,90/mês\n🔹 Produto B: R$ 49,90/mês\n🔹 Produto C: R$ 199,90/mês\n\n*Condições especiais disponíveis!*\n\nPara mais informações, nossa IA pode ajudar:',
          next: 'ai_sales'
        },
        {
          id: 'make_order',
          type: 'message',
          content: '🛒 *FAZER PEDIDO*\n\nQual produto você gostaria de adquirir?\n\nNossa IA irá ajudá-lo com o processo de compra:',
          next: 'ai_sales'
        },
        {
          id: 'human_sales',
          type: 'message',
          content: '👨‍💼 *FALAR COM VENDEDOR*\n\nVou transferir você para nossa equipe de vendas!\n\n📞 Contato direto:\n- WhatsApp: (11) 99999-9999\n- E-mail: vendas@empresa.com\n\nOu continue aqui e nossa IA pode ajudar:',
          next: 'ai_sales'
        },
        {
          id: 'ai_sales',
          type: 'ai',
          prompt: 'Você é um consultor de vendas especializado. Ajude o cliente com informações sobre produtos, preços, condições de pagamento e processo de compra. Seja persuasivo mas honesto.',
          fallbackMessage: 'Para finalizar sua compra, entre em contato: vendas@empresa.com ou (11) 99999-9999',
          next: 'end'
        },
        {
          id: 'end',
          type: 'end',
          content: 'Obrigado pelo interesse! Digite "menu" para voltar ao menu principal.'
        }
      ]
    }
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  createMaytapiFlows().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Erro:', error);
    process.exit(1);
  });
}

module.exports = { createMaytapiFlows };

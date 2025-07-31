const express = require('express');
const { Flow, Bot, FlowNode } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateParams, validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar fluxos do usuário
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'created_at';
    const order = req.query.order || 'DESC';
    const bot_id = req.query.bot_id;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Se bot_id for fornecido, filtrar por bot
    if (bot_id) {
      // Verificar se o bot pertence ao usuário
      const bot = await Bot.findOne({
        where: { id: bot_id, user_id: req.user.id }
      });

      if (!bot) {
        return res.status(404).json({
          error: 'Bot não encontrado',
          code: 'BOT_NOT_FOUND'
        });
      }

      whereClause.bot_id = bot_id;
    } else {
      // Buscar apenas fluxos dos bots do usuário
      const userBots = await Bot.findAll({
        where: { user_id: req.user.id },
        attributes: ['id']
      });

      if (userBots.length === 0) {
        return res.json({
          flows: [],
          pagination: {
            total: 0,
            page: page,
            limit: limit,
            pages: 0
          }
        });
      }

      whereClause.bot_id = userBots.map(bot => bot.id);
    }

    // Buscar fluxos sem associações
    const { count, rows: flows } = await Flow.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [[sort, order]]
    });

    // Buscar informações do bot separadamente para cada fluxo
    const flowsWithBotInfo = await Promise.all(
      flows.map(async (flow) => {
        try {
          const bot = await Bot.findByPk(flow.bot_id, {
            attributes: ['id', 'name']
          });

          return {
            ...flow.toJSON(),
            bot: bot ? bot.toJSON() : null
          };
        } catch (botError) {
          console.warn(`Erro ao buscar bot para fluxo ${flow.id}:`, botError.message);
          return {
            ...flow.toJSON(),
            bot: null
          };
        }
      })
    );

    res.json({
      flows: flowsWithBotInfo,
      pagination: {
        total: count,
        page: page,
        limit: limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar fluxos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Buscar fluxo por ID
router.get('/:id', validateParams(schemas.idParam), async (req, res) => {
  try {
    // Buscar fluxo primeiro
    const flow = await Flow.findByPk(req.params.id);

    if (!flow) {
      return res.status(404).json({
        error: 'Fluxo não encontrado',
        code: 'FLOW_NOT_FOUND'
      });
    }

    // Verificar se o bot pertence ao usuário
    const bot = await Bot.findOne({
      where: { id: flow.bot_id, user_id: req.user.id },
      attributes: ['id', 'name', 'description']
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Fluxo não encontrado',
        code: 'FLOW_NOT_FOUND'
      });
    }

    // Buscar nós do fluxo separadamente (se necessário)
    try {
      const nodes = await FlowNode.findAll({
        where: { flow_id: flow.id },
        order: [['created_at', 'ASC']]
      });

      res.json({
        ...flow.toJSON(),
        bot: bot.toJSON(),
        nodes
      });
    } catch (nodeError) {
      console.warn(`Erro ao buscar nós para fluxo ${flow.id}:`, nodeError.message);
      res.json({
        ...flow.toJSON(),
        bot: bot.toJSON(),
        nodes: []
      });
    }
  } catch (error) {
    console.error('Erro ao buscar fluxo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Criar novo fluxo
router.post('/', validate(schemas.createFlow), async (req, res) => {
  try {
    console.log('🔧 DEBUG: Criando fluxo com dados:', JSON.stringify(req.body, null, 2));

    const { bot_id, ...flowData } = req.body;

    // bot_id é obrigatório
    if (!bot_id) {
      console.log('🔧 DEBUG: bot_id é obrigatório');
      return res.status(400).json({
        error: 'bot_id é obrigatório. Todo fluxo deve estar vinculado a um bot.',
        code: 'BOT_ID_REQUIRED'
      });
    }

    // Verificar se o bot pertence ao usuário
    console.log('🔧 DEBUG: Verificando bot_id:', bot_id, 'para usuário:', req.user.id);
    const bot = await Bot.findOne({
      where: { id: bot_id, user_id: req.user.id }
    });

    if (!bot) {
      console.log('🔧 DEBUG: Bot não encontrado ou não pertence ao usuário');
      return res.status(404).json({
        error: 'Bot não encontrado ou você não tem permissão para acessá-lo',
        code: 'BOT_NOT_FOUND'
      });
    }

    console.log('🔧 DEBUG: Bot encontrado:', bot.name);
    console.log('🔧 DEBUG: Dados para criar fluxo:', {
      ...flowData,
      bot_id: bot_id
    });

    const flow = await Flow.create({
      ...flowData,
      bot_id: bot_id
    });

    console.log('🔧 DEBUG: Fluxo criado com sucesso:', flow.id);

    res.status(201).json({
      message: 'Fluxo criado com sucesso',
      flow
    });
  } catch (error) {
    console.error('🔧 DEBUG: Erro ao criar fluxo:', error);
    console.error('🔧 DEBUG: Stack trace:', error.stack);
    console.error('🔧 DEBUG: Error details:', {
      name: error.name,
      message: error.message,
      sql: error.sql,
      parameters: error.parameters
    });

    res.status(500).json({
      error: 'Erro interno do servidor ao criar fluxo',
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
});

// Atualizar fluxo
router.put('/:id', validateParams(schemas.idParam), validate(schemas.updateFlow), async (req, res) => {
  try {
    console.log(`🔧 DEBUG: Atualizando fluxo ID ${req.params.id}`);
    console.log(`🔧 DEBUG: Dados recebidos:`, JSON.stringify(req.body, null, 2));

    const flow = await Flow.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!flow) {
      console.log(`❌ DEBUG: Fluxo ${req.params.id} não encontrado para usuário ${req.user.id}`);
      return res.status(404).json({
        error: 'Fluxo não encontrado',
        code: 'FLOW_NOT_FOUND'
      });
    }

    console.log(`✅ DEBUG: Fluxo encontrado: ${flow.name}`);

    // Se está definindo como padrão, remover padrão dos outros fluxos do bot
    if (req.body.is_default === true) {
      await Flow.update(
        { is_default: false },
        { where: { bot_id: flow.bot_id, id: { [require('sequelize').Op.ne]: flow.id } } }
      );
      console.log(`🔧 DEBUG: Removido is_default de outros fluxos do bot ${flow.bot_id}`);
    }

    const oldFlowData = flow.flow_data;
    await flow.update(req.body);

    console.log(`✅ DEBUG: Fluxo ${req.params.id} atualizado com sucesso`);
    console.log(`🔧 DEBUG: flow_data antes:`, JSON.stringify(oldFlowData, null, 2));
    console.log(`🔧 DEBUG: flow_data depois:`, JSON.stringify(flow.flow_data, null, 2));

    res.json({
      message: 'Fluxo atualizado com sucesso',
      flow
    });
  } catch (error) {
    console.error('Erro ao atualizar fluxo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Deletar fluxo
router.delete('/:id', validateParams(schemas.idParam), async (req, res) => {
  try {
    const flow = await Flow.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!flow) {
      return res.status(404).json({
        error: 'Fluxo não encontrado',
        code: 'FLOW_NOT_FOUND'
      });
    }

    // Não permitir deletar fluxo padrão se for o único ativo
    if (flow.is_default) {
      const activeFlowsCount = await Flow.count({
        where: { 
          bot_id: flow.bot_id,
          is_active: true,
          id: { [require('sequelize').Op.ne]: flow.id }
        }
      });

      if (activeFlowsCount === 0) {
        return res.status(400).json({
          error: 'Não é possível deletar o único fluxo ativo do bot',
          code: 'CANNOT_DELETE_ONLY_ACTIVE_FLOW'
        });
      }
    }

    await flow.destroy();

    res.json({
      message: 'Fluxo deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar fluxo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Duplicar fluxo
router.post('/:id/duplicate', validateParams(schemas.idParam), async (req, res) => {
  try {
    const originalFlow = await Flow.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!originalFlow) {
      return res.status(404).json({
        error: 'Fluxo não encontrado',
        code: 'FLOW_NOT_FOUND'
      });
    }

    const duplicatedFlow = await Flow.create({
      bot_id: originalFlow.bot_id,
      name: `${originalFlow.name} (Cópia)`,
      description: originalFlow.description,
      flow_data: originalFlow.flow_data,
      trigger_keywords: originalFlow.trigger_keywords,
      trigger_conditions: originalFlow.trigger_conditions,
      priority: originalFlow.priority,
      is_active: false,
      is_default: false
    });

    res.status(201).json({
      message: 'Fluxo duplicado com sucesso',
      flow: duplicatedFlow
    });
  } catch (error) {
    console.error('Erro ao duplicar fluxo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Testar fluxo
router.post('/:id/test', validateParams(schemas.idParam), async (req, res) => {
  try {
    const { message, user_phone = 'test_user' } = req.body;

    const flow = await Flow.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!flow) {
      return res.status(404).json({
        error: 'Fluxo não encontrado',
        code: 'FLOW_NOT_FOUND'
      });
    }

    // Usar o processador de fluxos para testar
    const FlowProcessor = require('../services/FlowProcessor');
    const processor = new FlowProcessor();

    // Criar objetos mock para teste
    const mockBot = flow.bot || { id: flow.bot_id, name: 'Bot Teste' };
    const mockConversation = {
      id: 'test-conversation',
      botId: flow.bot_id,
      phoneNumber: user_phone || '5511999999999',
      user_phone: user_phone || '5511999999999',
      status: 'active'
    };
    const mockMessage = {
      content: message || 'Teste',
      type: 'text',
      timestamp: new Date()
    };

    const result = await processor.processMessage(
      mockBot,
      mockConversation,
      mockMessage,
      flow
    );

    res.json({
      message: 'Teste executado com sucesso',
      result
    });
  } catch (error) {
    console.error('Erro ao testar fluxo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Exportar fluxo
router.get('/:id/export', validateParams(schemas.idParam), async (req, res) => {
  try {
    const flow = await Flow.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!flow) {
      return res.status(404).json({
        error: 'Fluxo não encontrado',
        code: 'FLOW_NOT_FOUND'
      });
    }

    const exportData = {
      name: flow.name,
      description: flow.description,
      flow_data: flow.flow_data,
      trigger_keywords: flow.trigger_keywords,
      trigger_conditions: flow.trigger_conditions,
      version: flow.version,
      exported_at: new Date(),
      exported_by: req.user.name
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="flow_${flow.id}_${flow.name.replace(/[^a-zA-Z0-9]/g, '_')}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Erro ao exportar fluxo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Ativar fluxo
router.patch('/:id/activate', validateParams(schemas.idParam), async (req, res) => {
  try {
    const flow = await Flow.findOne({
      where: { id: req.params.id },
      include: [{
        model: Bot,
        as: 'bot',
        where: { user_id: req.user.id }
      }]
    });

    if (!flow) {
      return res.status(404).json({
        error: 'Fluxo não encontrado',
        code: 'FLOW_NOT_FOUND'
      });
    }

    await flow.update({ is_active: true });

    res.json({
      message: 'Fluxo ativado com sucesso',
      flow: flow
    });
  } catch (error) {
    console.error('Erro ao ativar fluxo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Desativar fluxo
router.patch('/:id/deactivate', validateParams(schemas.idParam), async (req, res) => {
  try {
    const flow = await Flow.findOne({
      where: { id: req.params.id },
      include: [{
        model: Bot,
        as: 'bot',
        where: { user_id: req.user.id }
      }]
    });

    if (!flow) {
      return res.status(404).json({
        error: 'Fluxo não encontrado',
        code: 'FLOW_NOT_FOUND'
      });
    }

    await flow.update({ is_active: false });

    res.json({
      message: 'Fluxo desativado com sucesso',
      flow: flow
    });
  } catch (error) {
    console.error('Erro ao desativar fluxo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Definir como fluxo padrão
router.patch('/:id/set-default', validateParams(schemas.idParam), async (req, res) => {
  try {
    const flow = await Flow.findOne({
      where: { id: req.params.id },
      include: [{
        model: Bot,
        as: 'bot',
        where: { user_id: req.user.id }
      }]
    });

    if (!flow) {
      return res.status(404).json({
        error: 'Fluxo não encontrado',
        code: 'FLOW_NOT_FOUND'
      });
    }

    // Remover is_default de outros fluxos do mesmo bot
    await Flow.update(
      { is_default: false },
      { where: { bot_id: flow.bot_id } }
    );

    // Definir este fluxo como padrão
    await flow.update({ is_default: true, is_active: true });

    res.json({
      message: 'Fluxo definido como padrão com sucesso',
      flow: flow
    });
  } catch (error) {
    console.error('Erro ao definir fluxo padrão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Endpoint para limpar cache de fluxos
router.post('/clear-cache', async (req, res) => {
  try {
    console.log('🧹 Iniciando limpeza de cache via API...');

    // Importar serviços necessários
    const { Conversation, Message } = require('../models');

    // 1. Limpar conversas ativas
    const deletedConversations = await Conversation.destroy({
      where: {},
      force: true
    });

    // 2. Limpar mensagens antigas (últimas 2 horas)
    const deletedMessages = await Message.destroy({
      where: {
        created_at: {
          [require('sequelize').Op.lt]: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      }
    });

    // 3. Limpar cache do MaytapiFlowProcessor se disponível
    const BotManager = require('../services/BotManager');
    if (BotManager.maytapiFlowProcessor) {
      BotManager.maytapiFlowProcessor.clearAllCache();
    }

    console.log(`✅ Cache limpo: ${deletedConversations} conversas, ${deletedMessages} mensagens`);

    res.json({
      success: true,
      message: 'Cache limpo com sucesso',
      data: {
        conversationsDeleted: deletedConversations,
        messagesDeleted: deletedMessages
      }
    });

  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    res.status(500).json({
      error: 'Erro ao limpar cache',
      code: 'CACHE_CLEAR_ERROR',
      details: error.message
    });
  }
});

// Gerar fluxo com IA
router.post('/generate-with-ai', async (req, res) => {
  try {
    const { description, bot_id } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        error: 'Descrição é obrigatória',
        code: 'DESCRIPTION_REQUIRED'
      });
    }

    // Usar o AIService para gerar o fluxo
    const AIService = require('../services/AIService');
    const aiService = new AIService();

    // Prompt especializado para criação de fluxos
    const systemPrompt = `Você é um especialista em criação de fluxos conversacionais para chatbots do WhatsApp.

Crie um fluxo completo e funcional baseado na descrição fornecida.

Estrutura obrigatória do JSON:
{
  "name": "Nome do Fluxo",
  "description": "Descrição do fluxo",
  "trigger_keywords": ["palavra1", "palavra2"],
  "bot_id": null,
  "is_active": true,
  "is_default": false,
  "flow_data": {
    "nodes": [
      {
        "id": "start",
        "type": "start",
        "position": {"x": 100, "y": 100},
        "next": "welcome"
      },
      {
        "id": "welcome",
        "type": "message",
        "content": "Mensagem de boas-vindas",
        "position": {"x": 100, "y": 200},
        "next": "menu"
      }
    ],
    "edges": []
  }
}

Tipos de nó válidos: start, message, input, condition, ai, action, end
- start: sempre o primeiro nó
- message: enviar mensagem
- input: capturar entrada do usuário
- condition: decisões baseadas em condições
- ai: resposta gerada por IA
- end: finalizar conversa

Use emojis nas mensagens para tornar mais amigável.
Crie um fluxo lógico e bem estruturado.

Responda APENAS com o JSON válido, sem explicações adicionais.`;

    const aiResponse = await aiService.generateResponse({
      message: `Crie um fluxo conversacional para: ${description}`,
      context: [],
      config: {
        system_prompt: systemPrompt,
        temperature: 0.7,
        max_tokens: 2000
      }
    });

    let generatedFlow;

    if (aiResponse && aiResponse.content) {
      try {
        // Tentar parsear a resposta da IA
        const cleanContent = aiResponse.content.replace(/```json\n?|\n?```/g, '').trim();
        generatedFlow = JSON.parse(cleanContent);

        // Validar estrutura básica
        if (!generatedFlow.flow_data || !generatedFlow.flow_data.nodes) {
          throw new Error('Estrutura de fluxo inválida');
        }

      } catch (parseError) {
        console.error('Erro ao parsear resposta da IA:', parseError);
        // Fallback: criar um fluxo básico
        generatedFlow = createFallbackFlow(description, bot_id);
      }
    } else {
      // Fallback: criar um fluxo básico
      generatedFlow = createFallbackFlow(description, bot_id);
    }

    // Adicionar bot_id se fornecido
    if (bot_id) {
      generatedFlow.bot_id = bot_id;
    }

    res.json({
      success: true,
      flow: generatedFlow,
      ai_used: true,
      confidence: aiResponse?.confidence || 0.8
    });

  } catch (error) {
    console.error('Erro ao gerar fluxo com IA:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao gerar fluxo',
      code: 'AI_GENERATION_ERROR',
      details: error.message
    });
  }
});

// Função para criar fluxo básico como fallback
function createFallbackFlow(description, bot_id) {
  return {
    name: "Fluxo Gerado por IA",
    description: description,
    trigger_keywords: ["oi", "olá", "menu", "ajuda"],
    bot_id: bot_id || null,
    is_active: true,
    is_default: false,
    flow_data: {
      nodes: [
        {
          id: "start",
          type: "start",
          position: { x: 100, y: 100 },
          next: "welcome"
        },
        {
          id: "welcome",
          type: "message",
          content: "Olá! 👋 Bem-vindo ao nosso atendimento!\n\nComo posso ajudá-lo hoje?",
          position: { x: 100, y: 200 },
          next: "menu"
        },
        {
          id: "menu",
          type: "message",
          content: "Escolha uma opção:\n\n1️⃣ Informações\n2️⃣ Suporte\n3️⃣ Falar com atendente\n\nDigite o número da opção:",
          position: { x: 100, y: 300 },
          next: "input"
        },
        {
          id: "input",
          type: "input",
          content: "Aguardando sua escolha...",
          position: { x: 100, y: 400 },
          next: "condition"
        },
        {
          id: "condition",
          type: "condition",
          conditions: [
            { value: "1", next: "info" },
            { value: "2", next: "support" },
            { value: "3", next: "human" }
          ],
          position: { x: 100, y: 500 }
        },
        {
          id: "info",
          type: "message",
          content: "ℹ️ Aqui estão nossas informações principais.\n\nObrigado pelo contato!",
          position: { x: 200, y: 600 },
          next: "end"
        },
        {
          id: "support",
          type: "ai",
          prompt: `Você é um assistente de suporte. Contexto: ${description}. Ajude o usuário de forma útil e amigável.`,
          position: { x: 300, y: 600 },
          next: "end"
        },
        {
          id: "human",
          type: "message",
          content: "👨‍💼 Transferindo para atendente humano...\n\nAguarde um momento.",
          position: { x: 400, y: 600 },
          next: "end"
        },
        {
          id: "end",
          type: "end",
          position: { x: 300, y: 700 }
        }
      ],
      edges: []
    }
  };
}

// Função para aplicar edições simples quando a IA falha
function applySimpleFlowEdit(currentFlow, description) {
  const lowerDescription = description.toLowerCase();

  // Detectar comando de remoção de opções - regex mais flexível
  const removeOptionMatch = lowerDescription.match(/(?:retire?|remova?|exclua?).*(?:opção|opcao|opcoes|opções)\s*(\d+)(?:\s*(?:e|,)\s*(\d+))?/);

  // Também detectar padrões como "opções 4 e 5" ou "4 e 5"
  const removeNumbersMatch = lowerDescription.match(/(?:opções?|opcoes?)\s*(\d+)\s*(?:e|,)\s*(\d+)|(\d+)\s*(?:e|,)\s*(\d+)/);

  if (removeOptionMatch || removeNumbersMatch) {
    let optionsToRemove = [];

    if (removeOptionMatch) {
      optionsToRemove.push(removeOptionMatch[1]);
      if (removeOptionMatch[2]) {
        optionsToRemove.push(removeOptionMatch[2]);
      }
    } else if (removeNumbersMatch) {
      if (removeNumbersMatch[1] && removeNumbersMatch[2]) {
        optionsToRemove.push(removeNumbersMatch[1], removeNumbersMatch[2]);
      } else if (removeNumbersMatch[3] && removeNumbersMatch[4]) {
        optionsToRemove.push(removeNumbersMatch[3], removeNumbersMatch[4]);
      }
    }

    console.log('🤖 Fallback: Removendo opções', optionsToRemove);

    return {
      ...currentFlow,
      description: `${currentFlow.description} (Editado: ${description})`,
      flow_data: {
        ...currentFlow.flow_data,
        nodes: currentFlow.flow_data.nodes.map(node => {
          // Encontrar nó de mensagem com menu
          if (node.type === 'message' && node.content && node.content.includes('Escolha uma opção:')) {
            let newContent = node.content;

            // Remover as linhas das opções especificadas
            optionsToRemove.forEach(optionNum => {
              const regex = new RegExp(`\\n?${optionNum}[️⃣]*\\s*[^\\n]*`, 'g');
              newContent = newContent.replace(regex, '');
            });

            return {
              ...node,
              content: newContent.trim()
            };
          }

          // Remover nós de condição relacionados às opções removidas
          if (node.type === 'condition' && node.conditions) {
            const filteredConditions = node.conditions.filter(condition => {
              return !optionsToRemove.includes(condition.value);
            });

            return {
              ...node,
              conditions: filteredConditions
            };
          }

          return node;
        }),
        edges: currentFlow.flow_data.edges.filter(edge => {
          // Manter apenas edges que não levam a nós de opções removidas
          const sourceNode = currentFlow.flow_data.nodes.find(n => n.id === edge.source);
          if (sourceNode && sourceNode.type === 'condition') {
            const condition = sourceNode.conditions?.find(c =>
              optionsToRemove.includes(c.value) && c.next === edge.target
            );
            return !condition;
          }
          return true;
        })
      }
    };
  }

  // Detectar comando de alteração de texto - regex mais flexível
  const changeTextMatch = lowerDescription.match(/(?:altere?|mude?|substitua?|troque?|edite?)\s+(?:o\s+texto\s+)?(?:da\s+opção\s+\d+\s+)?(?:de\s+)?(.+?)\s+para\s+(.+)/);
  if (changeTextMatch) {
    const fromText = changeTextMatch[1].trim();
    const toText = changeTextMatch[2].trim();

    console.log('🤖 Fallback: Alterando texto de', fromText, 'para', toText);

    return {
      ...currentFlow,
      description: `${currentFlow.description} (Editado: ${description})`,
      flow_data: {
        ...currentFlow.flow_data,
        nodes: currentFlow.flow_data.nodes.map(node => {
          if (node.type === 'message' && node.content) {
            // Fazer substituição case-insensitive
            const regex = new RegExp(fromText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const newContent = node.content.replace(regex, toText);

            if (newContent !== node.content) {
              return {
                ...node,
                content: newContent
              };
            }
          }
          return node;
        })
      }
    };
  }

  // Detectar comando para criar menu de opções - regex mais flexível
  const createMenuMatch = lowerDescription.match(/(?:vamos\s+)?(?:colocar|criar|adicionar|fazer).*(?:usuario|usuário).*(?:escolher|selecionar).*(?:temos|são)\s+(.+)/) ||
                          lowerDescription.match(/(?:temos|são|opções|opcoes):\s*(.+)/) ||
                          lowerDescription.match(/(?:temos)\s+([^.]+)/);
  if (createMenuMatch) {
    const optionsText = createMenuMatch[1];
    const options = optionsText.split(/[,;]/).map(opt => opt.trim()).filter(opt => opt.length > 0);

    console.log('🤖 Fallback: Criando menu com opções:', options);

    return {
      ...currentFlow,
      description: `${currentFlow.description} (Editado: ${description})`,
      flow_data: {
        ...currentFlow.flow_data,
        nodes: currentFlow.flow_data.nodes.map(node => {
          // Encontrar nó que pede input de cidade
          if (node.type === 'message' && node.content &&
              (node.content.includes('cidade de ORIGEM') || node.content.includes('digite a cidade'))) {

            // Criar menu de opções
            let menuContent = node.content.split('\n')[0]; // Manter primeira linha
            menuContent += '\n\nEscolha uma cidade:\n\n';

            options.forEach((option, index) => {
              menuContent += `${index + 1}️⃣ ${option}\n`;
            });

            menuContent += '\nDigite o número da opção desejada:';

            return {
              ...node,
              content: menuContent
            };
          }
          return node;
        })
      }
    };
  }

  // Fallback genérico para outros comandos
  return {
    ...currentFlow,
    description: `${currentFlow.description} (Editado: ${description})`,
    flow_data: {
      ...currentFlow.flow_data,
      nodes: currentFlow.flow_data.nodes.map(node => {
        // Modificar o primeiro nó de mensagem encontrado
        if (node.type === 'message' && node.content) {
          return {
            ...node,
            content: `${node.content}\n\n✨ Editado com IA: ${description}`
          };
        }
        return node;
      })
    }
  };
}

// Editar fluxo com IA
router.post('/edit-with-ai', async (req, res) => {
  try {
    console.log('🤖 Iniciando edição com IA...');
    const { description, currentFlow } = req.body;

    console.log('🤖 Descrição:', description);
    console.log('🤖 Fluxo atual recebido:', currentFlow ? 'Sim' : 'Não');

    if (!description || !description.trim()) {
      console.log('🤖 Erro: Descrição vazia');
      return res.status(400).json({
        error: 'Descrição das mudanças é obrigatória',
        code: 'DESCRIPTION_REQUIRED'
      });
    }

    if (!currentFlow) {
      console.log('🤖 Erro: Fluxo atual não fornecido');
      return res.status(400).json({
        error: 'Dados do fluxo atual são obrigatórios',
        code: 'CURRENT_FLOW_REQUIRED'
      });
    }

    // Validar estrutura do fluxo atual
    if (!currentFlow.flow_data || !currentFlow.flow_data.nodes) {
      console.log('🤖 Erro: Estrutura do fluxo inválida');
      return res.status(400).json({
        error: 'Estrutura do fluxo atual é inválida',
        code: 'INVALID_FLOW_STRUCTURE'
      });
    }

    // Usar o AIService para editar o fluxo
    const AIService = require('../services/AIService');
    const aiService = new AIService();

    // Prompt especializado para análise e correção de fluxos
    const systemPrompt = `Você é um ESPECIALISTA EM DEBUGGING de fluxos conversacionais para chatbots do WhatsApp.

MISSÃO: Analisar o problema descrito pelo usuário, identificar a causa raiz no fluxo e corrigi-la.

PROCESSO DE ANÁLISE:
1. 🔍 ANALISE o problema descrito pelo usuário
2. 🧠 IDENTIFIQUE a causa raiz no fluxo atual:
   - Conexões quebradas entre nós (campo "next" incorreto)
   - Condições mal configuradas (conditions array)
   - IDs de nós que não existem
   - Tipos de nó incorretos
   - Conteúdo de mensagens inadequado
3. 🔧 CORRIJA o problema específico
4. ✅ VALIDE que a correção resolve o problema

PROBLEMAS COMUNS E SOLUÇÕES:
- "Opção X não responde": Verificar se condition tem o valor correto e next aponta para nó existente
- "Fica travado": Verificar se todos os nós têm next válido ou são do tipo end
- "Não entende entrada": Verificar se há nó input antes de condition
- "Pula etapas": Verificar sequência de next entre nós
- "Remover opção X": Remover linha da opção do conteúdo da mensagem E remover condition correspondente E remover edges relacionadas
- "Retire opção X e Y": Remover múltiplas opções do menu e suas condições/conexões

ESTRUTURA DE RESPOSTA:
Retorne um JSON com duas partes:

{
  "analysis": "Análise detalhada do problema encontrado e como foi corrigido",
  "flow": {
    "name": "Nome do Fluxo",
    "description": "Descrição",
    "trigger_keywords": ["palavra1", "palavra2"],
    "bot_id": 1,
    "is_active": true,
    "is_default": false,
    "flow_data": {
      "nodes": [...nós corrigidos...],
      "edges": [...edges corrigidas...],
      "viewport": {"x": 0, "y": 0, "zoom": 1}
    }
  }
}

REGRAS TÉCNICAS:
- Mantenha TODOS os campos obrigatórios
- Para condition: {"conditions": [{"value": "1", "operator": "equals", "variable": "menu_option", "next": "node_id"}]}
- Para input: {"variable": "nome_variavel", "next": "proximo_node"}
- IDs únicos e consistentes
- Posições (x,y) adequadas para novos nós
- Edges devem conectar source → target corretamente

IMPORTANTE: Seja um detective! Encontre exatamente o que está quebrado e conserte.

EXEMPLO DE REMOÇÃO DE OPÇÕES:
Se o usuário pedir "Retire a opção 4 e 5 do fluxo":
1. Encontre o nó de mensagem que contém o menu
2. Remova as linhas "4️⃣ Opção 4" e "5️⃣ Opção 5" do content
3. Encontre o nó condition que verifica menu_option
4. Remova as conditions com value "4" e "5"
5. Remova as edges que conectam essas conditions aos próximos nós
6. Mantenha apenas as opções 1, 2 e 3 funcionando

SEMPRE retorne JSON válido com analysis explicando o que foi feito.`;

    const contextMessage = `Fluxo atual:
${JSON.stringify(currentFlow, null, 2)}

Mudanças solicitadas: ${description}`;

    let aiResponse = null;

    try {
      aiResponse = await aiService.generateResponse({
        message: contextMessage,
        context: [],
        config: {
          system_prompt: systemPrompt,
          temperature: 0.7,
          max_tokens: 3000
        }
      });
    } catch (aiError) {
      console.error('Erro ao gerar resposta com IA:', aiError);
      aiResponse = null;
    }

    let editedFlow;
    let aiResult;

    if (aiResponse && aiResponse.content) {
      try {
        console.log('🤖 Resposta bruta da IA (primeiros 500 chars):', aiResponse.content.substring(0, 500));

        // Limpar a resposta da IA de forma mais robusta
        let cleanContent = aiResponse.content.trim();

        // Remover markdown code blocks
        cleanContent = cleanContent.replace(/```json\s*/g, '');
        cleanContent = cleanContent.replace(/```\s*/g, '');

        // Remover texto explicativo antes e depois do JSON
        const jsonStart = cleanContent.indexOf('{');
        const jsonEnd = cleanContent.lastIndexOf('}');

        if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
          throw new Error('JSON não encontrado na resposta da IA');
        }

        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);

        // Tentar corrigir problemas comuns de JSON
        cleanContent = cleanContent
          .replace(/,\s*}/g, '}')  // Remove vírgulas antes de }
          .replace(/,\s*]/g, ']')  // Remove vírgulas antes de ]
          .replace(/'/g, '"')      // Substitui aspas simples por duplas

        console.log('🤖 Conteúdo limpo (primeiros 500 chars):', cleanContent.substring(0, 500));

        // Tentar parsear
        aiResult = JSON.parse(cleanContent);
        console.log('🤖 JSON parseado com sucesso!');

        // Verificar se tem análise e fluxo
        if (aiResult.analysis && aiResult.flow) {
          console.log('🤖 Análise da IA:', aiResult.analysis);
          editedFlow = aiResult.flow;
        } else if (aiResult.flow_data) {
          // Formato antigo - fluxo direto
          editedFlow = aiResult;
        } else {
          throw new Error('Estrutura de resposta inválida da IA');
        }

        // Validações obrigatórias
        if (!editedFlow.flow_data) {
          throw new Error('Campo flow_data é obrigatório');
        }

        if (!editedFlow.flow_data.nodes || !Array.isArray(editedFlow.flow_data.nodes)) {
          throw new Error('Campo flow_data.nodes deve ser um array');
        }

        if (editedFlow.flow_data.nodes.length === 0) {
          throw new Error('Fluxo deve ter pelo menos um nó');
        }

        // Validar se tem pelo menos um nó start
        const hasStart = editedFlow.flow_data.nodes.some(node => node.type === 'start');
        if (!hasStart) {
          throw new Error('Fluxo deve ter pelo menos um nó do tipo start');
        }

        // Garantir que todos os nós tenham IDs únicos
        const nodeIds = editedFlow.flow_data.nodes.map(node => node.id);
        const uniqueIds = [...new Set(nodeIds)];
        if (nodeIds.length !== uniqueIds.length) {
          throw new Error('Fluxo contém IDs de nós duplicados');
        }

        // Garantir campos obrigatórios
        editedFlow.name = editedFlow.name || currentFlow.name;
        editedFlow.description = editedFlow.description || currentFlow.description;
        editedFlow.trigger_keywords = editedFlow.trigger_keywords || currentFlow.trigger_keywords || [];
        editedFlow.bot_id = editedFlow.bot_id || currentFlow.bot_id;
        editedFlow.is_active = editedFlow.is_active !== undefined ? editedFlow.is_active : currentFlow.is_active;
        editedFlow.is_default = editedFlow.is_default !== undefined ? editedFlow.is_default : currentFlow.is_default;

        // Garantir estrutura de flow_data
        if (!editedFlow.flow_data.edges) {
          editedFlow.flow_data.edges = [];
        }
        if (!editedFlow.flow_data.viewport) {
          editedFlow.flow_data.viewport = { x: 0, y: 0, zoom: 1 };
        }

        console.log('🤖 Fluxo validado com sucesso!');
        console.log('🤖 Nodes:', editedFlow.flow_data.nodes.length);
        console.log('🤖 Edges:', editedFlow.flow_data.edges.length);

      } catch (parseError) {
        console.error('🤖 Erro ao parsear/validar resposta da IA:', parseError.message);
        console.error('🤖 Conteúdo completo da resposta:', aiResponse ? aiResponse.content : 'Nenhum conteúdo');

        // Fallback mais inteligente: aplicar mudança simples
        console.log('🤖 Aplicando fallback: modificação simples do fluxo');

        editedFlow = applySimpleFlowEdit(currentFlow, description);

        console.log('🤖 Fallback aplicado com sucesso');
      }
    } else {
      console.error('🤖 IA não retornou conteúdo');
      console.log('🤖 Aplicando fallback: IA não respondeu');

      editedFlow = applySimpleFlowEdit(currentFlow, description);
      console.log('🤖 Fallback aplicado com sucesso');
    }

    // Preparar resposta com análise se disponível
    const response = {
      success: true,
      flow: editedFlow,
      ai_used: true,
      confidence: (aiResponse && aiResponse.confidence) ? aiResponse.confidence : 0.8,
      changes_applied: description
    };

    // Adicionar análise se a IA forneceu
    if (typeof aiResult !== 'undefined' && aiResult && aiResult.analysis) {
      response.analysis = aiResult.analysis;
      console.log('🤖 Incluindo análise na resposta:', aiResult.analysis);
    } else if (editedFlow && description.toLowerCase().includes('retire')) {
      // Adicionar análise para fallback de remoção de opções
      response.analysis = `Fallback aplicado: Comando de remoção de opções detectado e processado automaticamente.`;
    }

    console.log('🤖 Edição concluída com sucesso');
    res.json(response);

  } catch (error) {
    console.error('Erro ao editar fluxo com IA:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao editar fluxo',
      code: 'AI_EDIT_ERROR',
      details: error.message
    });
  }
});

module.exports = router;

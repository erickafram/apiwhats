const express = require('express');
const { Flow, Bot, FlowNode } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateParams, validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// Função para sanitizar Unicode problemático no JSON
function sanitizeUnicodeForJSON(data) {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(sanitizeUnicodeForJSON(parsed));
    } catch {
      // Se não for JSON válido, sanitizar a string diretamente
      return data
        .replace(/[\u200D]/g, '') // Remove Zero Width Joiner (ZWJ)
        .replace(/[\uD800-\uDFFF]/g, '') // Remove surrogate pairs órfãos
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
        .replace(/[\uFEFF]/g, ''); // Remove BOM
    }
  } else if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeUnicodeForJSON(item));
    } else {
      const result = {};
      for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = typeof key === 'string' ? 
          key.replace(/[\u200D]/g, '').replace(/[\uD800-\uDFFF]/g, '') : key;
        result[sanitizedKey] = sanitizeUnicodeForJSON(value);
      }
      return result;
    }
  }
  return data;
}

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

    // Sanitizar flow_data antes de salvar
    if (flowData.flow_data) {
      flowData.flow_data = sanitizeUnicodeForJSON(flowData.flow_data);
      console.log('🔧 DEBUG: flow_data sanitizado para criação');
    }

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
    
    // Sanitizar flow_data antes de atualizar
    if (req.body.flow_data) {
      req.body.flow_data = sanitizeUnicodeForJSON(req.body.flow_data);
      console.log('🔧 DEBUG: flow_data sanitizado para atualização');
    }
    
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
    
    // Se for erro de JSON inválido, tentar sanitizar
    if (error.name === 'SequelizeDatabaseError' && error.original?.code === 'ER_INVALID_JSON_TEXT') {
      console.log('🔧 Detectado erro de JSON inválido - tentando sanitizar...');
      
      try {
        // Sanitizar o flow_data
        const sanitizedData = sanitizeUnicodeForJSON(req.body.flow_data);
        req.body.flow_data = sanitizedData;
        
        console.log('🔧 JSON sanitizado - tentando salvar novamente...');
        await flow.update(req.body);
        
        console.log('✅ Fluxo salvo com sucesso após sanitização!');
        return res.json({
          message: 'Fluxo atualizado com sucesso (com sanitização)',
          flow
        });
      } catch (sanitizeError) {
        console.error('❌ Erro mesmo após sanitização:', sanitizeError);
      }
    }
    
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
    const { description, flowData, bot_id } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        error: 'Descrição é obrigatória',
        code: 'DESCRIPTION_REQUIRED'
      });
    }

    // Usar o AIService para gerar o fluxo
    const AIService = require('../services/AIService');
    const aiService = new AIService();

    // Prompt especializado e melhorado para criação de fluxos
    const systemPrompt = buildEnhancedFlowPrompt(flowData);

    const aiResponse = await aiService.generateResponse({
      message: `Crie um fluxo conversacional com base nestas especificações:\n\n${description}`,
      context: [],
      config: {
        system_prompt: systemPrompt,
        temperature: 0.7,
        max_tokens: 3000
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

        // Aprimorar o fluxo com dados específicos
        generatedFlow = enhanceFlowWithData(generatedFlow, flowData);

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

// Obter templates de fluxos
router.get('/templates', async (req, res) => {
  try {
    console.log('🎨 Buscando templates de fluxos...');
    
    const FlowTemplateService = require('../services/FlowTemplateService');
    const templateService = new FlowTemplateService();
    
    const { category, search } = req.query;
    
    let templates;
    
    if (category) {
      templates = templateService.getTemplatesByCategory(category);
    } else if (search) {
      templates = templateService.searchTemplates(search);
    } else {
      templates = templateService.getAllTemplates();
    }
    
    res.json({
      message: 'Templates obtidos com sucesso',
      templates: templates,
      categories: templateService.getCategories(),
      total: templates.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter templates:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao obter templates',
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
});

// Criar fluxo a partir de template
router.post('/from-template/:templateId', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const { customizations } = req.body;
    
    console.log('🎨 Criando fluxo a partir do template:', templateId);
    console.log('🎨 Customizações:', customizations);
    
    const FlowTemplateService = require('../services/FlowTemplateService');
    const templateService = new FlowTemplateService();
    
    // Verificar se o template existe
    const template = templateService.getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({
        error: 'Template não encontrado',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }
    
    // Verificar se o bot pertence ao usuário
    if (customizations.bot_id) {
      const bot = await Bot.findOne({
        where: { 
          id: customizations.bot_id, 
          user_id: req.user.id 
        }
      });
      
      if (!bot) {
        return res.status(404).json({
          error: 'Bot não encontrado ou você não tem permissão para acessá-lo',
          code: 'BOT_NOT_FOUND'
        });
      }
    }
    
    // Criar fluxo a partir do template
    const flowData = templateService.createFlowFromTemplate(templateId, {
      ...customizations,
      user_id: req.user.id
    });
    
    // Salvar no banco
    const flow = await Flow.create({
      ...flowData,
      user_id: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('✅ Fluxo criado a partir do template:', flow.id);
    
    res.status(201).json({
      message: 'Fluxo criado com sucesso a partir do template',
      flow: flow,
      template: {
        id: templateId,
        name: template.name
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar fluxo a partir do template:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao criar fluxo',
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
});

// Função para criar prompt melhorado baseado nos dados estruturados
function buildEnhancedFlowPrompt(flowData = {}) {
  const { flowType, businessType, objectives, hasOperatorTransfer, menuOptions } = flowData;
  
  let prompt = `Você é um ESPECIALISTA EM CRIAÇÃO DE FLUXOS CONVERSACIONAIS para chatbots do WhatsApp.

MISSÃO: Criar um fluxo COMPLETO, FUNCIONAL e PROFISSIONAL baseado nas especificações fornecidas.

CONTEXTO ESPECÍFICO:
- Tipo de Fluxo: ${flowType || 'atendimento'}
- Tipo de Negócio: ${businessType || 'negócio genérico'}
- Objetivos: ${objectives?.join(', ') || 'atendimento geral'}
- Transferência para Operador: ${hasOperatorTransfer ? 'SIM - obrigatório incluir' : 'NÃO'}
- Opções do Menu: ${menuOptions?.join(', ') || 'opções padrão'}

ESTRUTURA OBRIGATÓRIA DO JSON:
{
  "name": "Nome Específico do Fluxo",
  "description": "Descrição detalhada",
  "trigger_keywords": ["palavras", "relacionadas", "ao", "negócio"],
  "bot_id": null,
  "is_active": true,
  "is_default": false,
  "flow_data": {
    "nodes": [
      // Nós detalhados aqui
    ],
    "edges": [
      // Conexões visuais aqui
    ],
    "viewport": {"x": 0, "y": 0, "zoom": 1}
  }
}

TIPOS DE NÓS E ESTRUTURAS:

🎯 START NODE:
{
  "id": "start",
  "type": "start",
  "position": {"x": 100, "y": 100},
  "next": "welcome"
}

📝 MESSAGE NODE:
{
  "id": "welcome",
  "type": "message",
  "position": {"x": 100, "y": 200},
  "next": "menu",
  "content": "Mensagem personalizada com emojis relacionados ao negócio 🎉"
}

📥 INPUT NODE:
{
  "id": "input_opcao",
  "type": "input",
  "position": {"x": 100, "y": 300},
  "next": "condition_opcao",
  "content": "Digite sua escolha:",
  "variable": "opcao_escolhida"
}

⚡ CONDITION NODE:
{
  "id": "condition_opcao",
  "type": "condition",
  "position": {"x": 100, "y": 400},
  "conditions": [
    {"value": "1", "operator": "equals", "variable": "opcao_escolhida", "next": "opcao_1"},
    {"value": "2", "operator": "equals", "variable": "opcao_escolhida", "next": "opcao_2"}
  ],
  "fallback": "opcao_invalida"
}

🤖 AI_RESPONSE NODE:
{
  "id": "ai_atendimento",
  "type": "ai_response",
  "position": {"x": 100, "y": 500},
  "next": "menu",
  "data": {
    "system_prompt": "Você é um assistente especializado em ${businessType}. Responda perguntas sobre ${objectives?.join(', ')}.",
    "temperature": 0.7,
    "max_tokens": 500,
    "fallback_message": "Desculpe, não consegui processar. Que tal falar com um atendente?"
  }
}`;

  if (hasOperatorTransfer) {
    prompt += `

👨‍💼 TRANSFERIR PARA OPERADOR (2 nós OBRIGATÓRIOS):
// 1. Mensagem informativa
{
  "id": "transferir_operador",
  "type": "message",
  "position": {"x": 400, "y": 600},
  "next": "acao_transferir",
  "content": "👨‍💼 **TRANSFERINDO PARA ATENDENTE**\\n\\n✅ Conectando você com nossa equipe especializada em ${businessType}!\\n\\n⏱️ **Horário de atendimento:**\\n🕕 Segunda a Sexta: 08:00 às 18:00\\n🕘 Sábados: 08:00 às 12:00\\n\\n📞 **Aguarde um momento...**"
}

// 2. Ação de transferência
{
  "id": "acao_transferir",
  "type": "action",
  "position": {"x": 400, "y": 750},
  "next": "end",
  "content": "",
  "action": "transfer_to_human"
}`;
  }

  prompt += `

REGRAS ESPECÍFICAS PARA ESTE FLUXO:
✅ Criar fluxo específico para ${businessType}
✅ Incluir todas as opções: ${menuOptions?.join(', ')}
✅ Focar nos objetivos: ${objectives?.join(', ')}
✅ Usar linguagem adequada ao tipo de negócio
✅ Incluir emojis relacionados ao segmento
✅ Posições escalonadas (x: 100, 300, 500 / y: 100, 200, 300...)
✅ IDs descritivos e únicos
✅ Fluxo completo do início ao fim
${hasOperatorTransfer ? '✅ OBRIGATÓRIO: Incluir opção para transferir para operador' : ''}

IMPORTANTE: Crie um fluxo REAL e ÚTIL para ${businessType}, não genérico!

Responda APENAS com o JSON válido, sem explicações adicionais.`;

  return prompt;
}

// Função para aprimorar o fluxo com dados específicos
function enhanceFlowWithData(flow, flowData) {
  if (!flowData) return flow;
  
  // Atualizar nome se for genérico
  if (flow.name === "Fluxo Gerado por IA" && flowData.businessType) {
    flow.name = `Fluxo de ${flowData.flowType} - ${flowData.businessType}`;
  }
  
  // Adicionar palavras-chave específicas
  if (flowData.businessType) {
    const businessKeywords = flowData.businessType.toLowerCase().split(' ');
    flow.trigger_keywords = [...(flow.trigger_keywords || []), ...businessKeywords];
  }
  
  // Remover duplicatas das palavras-chave
  flow.trigger_keywords = [...new Set(flow.trigger_keywords)];
  
  return flow;
}

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
          content: "Escolha uma opção:\n\n1️⃣ Informações\n2️⃣ Suporte com IA\n3️⃣ Falar com atendente\n\nDigite o número da opção:",
          position: { x: 100, y: 300 },
          next: "input_opcao"
        },
        {
          id: "input_opcao",
          type: "input",
          content: "Aguardando sua escolha...",
          position: { x: 100, y: 400 },
          next: "condition_opcao",
          variable: "opcao_menu"
        },
        {
          id: "condition_opcao",
          type: "condition",
          conditions: [
            { value: "1", operator: "equals", variable: "opcao_menu", next: "info" },
            { value: "2", operator: "equals", variable: "opcao_menu", next: "support_ai" },
            { value: "3", operator: "equals", variable: "opcao_menu", next: "transferir_operador" }
          ],
          position: { x: 100, y: 500 },
          fallback: "opcao_invalida"
        },
        {
          id: "info",
          type: "message",
          content: `ℹ️ **Informações sobre ${description}**\n\nAqui estão nossas informações principais.\n\n✅ Estamos disponíveis para ajudá-lo!\n📞 Entre em contato conosco sempre que precisar.\n\nObrigado pelo contato! 😊`,
          position: { x: 200, y: 600 },
          next: "end"
        },
        {
          id: "support_ai",
          type: "ai_response",
          position: { x: 300, y: 600 },
          next: "menu",
          data: {
            system_prompt: `Você é um assistente de suporte especializado em ${description}. Ajude o usuário de forma útil, profissional e amigável. Se não conseguir resolver, sugira falar com um atendente humano.`,
            temperature: 0.7,
            max_tokens: 500,
            fallback_message: "Desculpe, não consegui processar sua mensagem. Que tal falar com um de nossos atendentes? Digite 3 no menu principal."
          }
        },
        {
          id: "transferir_operador",
          type: "message",
          content: "👨‍💼 **TRANSFERINDO PARA ATENDENTE**\n\n✅ Você será conectado com nossa equipe especializada!\n\n⏱️ **Horário de atendimento:**\n🕕 Segunda a Sexta: 08:00 às 18:00\n🕘 Sábados: 08:00 às 12:00\n\n📞 **O que nosso atendente pode fazer:**\n• Resolver questões complexas\n• Dar suporte personalizado\n• Finalizar negociações\n• Tirar dúvidas específicas\n\n🔄 **Conectando... aguarde um momento**",
          position: { x: 400, y: 600 },
          next: "acao_transferir"
        },
        {
          id: "acao_transferir",
          type: "action",
          position: { x: 400, y: 750 },
          next: "end",
          content: "",
          action: "transfer_to_human"
        },
        {
          id: "opcao_invalida",
          type: "message",
          content: "❌ **Opção inválida!**\n\n🔍 Por favor, digite apenas:\n• **1** = Informações\n• **2** = Suporte com IA\n• **3** = Falar com atendente\n\n🔄 Voltando ao menu...",
          position: { x: 500, y: 600 },
          next: "menu"
        },
        {
          id: "end",
          type: "end",
          position: { x: 300, y: 900 },
          content: "Obrigado pelo contato! 😊\n\nVolte sempre que precisar de ajuda!"
        }
      ],
      edges: [
        { id: "e1", source: "start", target: "welcome" },
        { id: "e2", source: "welcome", target: "menu" },
        { id: "e3", source: "menu", target: "input_opcao" },
        { id: "e4", source: "input_opcao", target: "condition_opcao" },
        { id: "e5", source: "condition_opcao", target: "info" },
        { id: "e6", source: "condition_opcao", target: "support_ai" },
        { id: "e7", source: "condition_opcao", target: "transferir_operador" },
        { id: "e8", source: "condition_opcao", target: "opcao_invalida" },
        { id: "e9", source: "info", target: "end" },
        { id: "e10", source: "support_ai", target: "menu" },
        { id: "e11", source: "transferir_operador", target: "acao_transferir" },
        { id: "e12", source: "acao_transferir", target: "end" },
        { id: "e13", source: "opcao_invalida", target: "menu" }
      ],
      viewport: { x: 0, y: 0, zoom: 1 }
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
    
    const { description, editData, currentFlow } = req.body;

    // Validação básica
    if (!description || !description.trim()) {
      return res.status(400).json({
        error: 'Descrição das mudanças é obrigatória',
        code: 'DESCRIPTION_REQUIRED'
      });
    }

    if (!currentFlow || !currentFlow.flow_data || !currentFlow.flow_data.nodes) {
      return res.status(400).json({
        error: 'Fluxo atual inválido',
        code: 'INVALID_CURRENT_FLOW'
      });
    }

    console.log(`🤖 Editando fluxo ID: ${currentFlow.id}, Nome: ${currentFlow.name}`);
    console.log(`🤖 Número de nós no fluxo atual: ${currentFlow.flow_data.nodes.length}`);

    // Usar o AIService para editar o fluxo
    const AIService = require('../services/AIService');
    const aiService = new AIService();

    // Prompt especializado e melhorado para edição de fluxos
    const systemPrompt = buildEnhancedEditPrompt(editData, currentFlow);

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
          max_tokens: 4000
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
        if (!aiResult || !aiResult.flow) {
          throw new Error('Estrutura de resposta inválida da IA');
        }

        editedFlow = aiResult.flow;
        console.log('🤖 Fluxo editado extraído com sucesso');

        // Aplicar melhorias baseadas nos dados estruturados
        editedFlow = enhanceEditedFlow(editedFlow, editData, currentFlow);

      } catch (parseError) {
        console.error('🤖 Erro ao parsear resposta da IA:', parseError);
        console.log('🤖 Conteúdo que causou erro:', aiResponse.content);
        
        // Fallback: aplicar edição simples
        editedFlow = applySimpleFlowEdit(currentFlow, description);
        aiResult = { analysis: 'Falha no processamento da IA. Aplicando edição básica.' };
      }
    } else {
      console.log('🤖 IA não retornou resposta válida, usando fallback...');
      // Fallback: aplicar edição simples
      editedFlow = applySimpleFlowEdit(currentFlow, description);
      aiResult = { analysis: 'IA indisponível. Aplicando edição básica.' };
    }

    // Garantir que o fluxo editado tem estrutura válida
    if (!editedFlow || !editedFlow.flow_data || !editedFlow.flow_data.nodes) {
      console.error('🤖 Fluxo editado inválido, usando original');
      editedFlow = currentFlow;
      aiResult = { analysis: 'Não foi possível aplicar as mudanças. Fluxo mantido inalterado.' };
    }

    console.log('🤖 Edição concluída com sucesso');
    
    res.json({
      success: true,
      flow: editedFlow,
      analysis: aiResult?.analysis || 'Mudanças aplicadas com sucesso.',
      ai_used: true,
      confidence: aiResponse?.confidence || 0.7
    });

  } catch (error) {
    console.error('Erro ao editar fluxo com IA:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao editar fluxo',
      code: 'AI_EDIT_ERROR',
      details: error.message
    });
  }
});

// Função para criar prompt melhorado para edição baseado nos dados estruturados
function buildEnhancedEditPrompt(editData = {}, currentFlow = {}) {
  const { changeType, targetArea, specificRequest, addTransferOption, menuChanges } = editData;
  
  let prompt = `Você é um ESPECIALISTA EM DEBUGGING E EDIÇÃO de fluxos conversacionais para chatbots do WhatsApp.

MISSÃO: Analisar o fluxo atual e aplicar as mudanças específicas solicitadas com PRECISÃO ABSOLUTA.

CONTEXTO DA EDIÇÃO:
- Tipo de Alteração: ${changeType || 'modificar'}
- Área do Fluxo: ${targetArea || 'geral'}
- Solicitação: ${specificRequest || 'mudança geral'}
- Adicionar Transferência: ${addTransferOption ? 'SIM - obrigatório' : 'NÃO'}
- Mudanças no Menu: ${menuChanges?.join(', ') || 'nenhuma'}
- Fluxo Atual: ${currentFlow.name || 'sem nome'} (${currentFlow.flow_data?.nodes?.length || 0} nós)

PROCESSO DE EDIÇÃO:
1. 🔍 ANALISE o fluxo atual detalhadamente
2. 🎯 IDENTIFIQUE exatamente onde aplicar as mudanças
3. 🔧 APLIQUE as mudanças ESPECÍFICAS solicitadas
4. ✅ VALIDE que o fluxo permanece funcional

ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
{
  "analysis": "Análise detalhada do que foi identificado e alterado",
  "flow": {
    "id": ${currentFlow.id || 'null'},
    "name": "${currentFlow.name || 'Fluxo Editado'}",
    "description": "${currentFlow.description || ''}",
    "trigger_keywords": ${JSON.stringify(currentFlow.trigger_keywords || [])},
    "bot_id": ${currentFlow.bot_id || 'null'},
    "is_active": ${currentFlow.is_active !== undefined ? currentFlow.is_active : true},
    "is_default": ${currentFlow.is_default !== undefined ? currentFlow.is_default : false},
    "flow_data": {
      "nodes": [...nós atualizados...],
      "edges": [...conexões atualizadas...],
      "viewport": {"x": 0, "y": 0, "zoom": 1}
    }
  }
}`;

  // Instruções específicas baseadas no tipo de alteração
  if (changeType === 'adicionar' && targetArea === 'menu') {
    prompt += `

INSTRUÇÃO ESPECÍFICA - ADICIONAR AO MENU:
1. Encontre o nó de mensagem que contém o menu principal
2. Adicione as novas opções: ${menuChanges?.join(', ')}
3. Atualize o nó condition para incluir as novas condições
4. Crie novos nós para as opções adicionadas
5. Conecte tudo com edges apropriadas`;
  }

  if (changeType === 'remover' && targetArea === 'menu') {
    prompt += `

INSTRUÇÃO ESPECÍFICA - REMOVER DO MENU:
1. Encontre o nó de mensagem que contém o menu
2. Remova as opções especificadas: ${menuChanges?.join(', ')}
3. Remova as conditions correspondentes
4. Remova os nós relacionados às opções removidas
5. Atualize as edges`;
  }

  if (changeType === 'corrigir' && targetArea === 'operador') {
    prompt += `

INSTRUÇÃO ESPECÍFICA - CORRIGIR TRANSFERÊNCIA:
1. Identifique onde deveria ter transferência para operador
2. Crie 2 nós obrigatórios:
   - Nó message informativo sobre transferência
   - Nó action com "action": "transfer_to_human"
3. Conecte adequadamente ao fluxo`;
  }

  if (addTransferOption) {
    prompt += `

OBRIGATÓRIO - ADICIONAR TRANSFERÊNCIA:
Criar 2 nós para transferência ao operador:
{
  "id": "transferir_operador",
  "type": "message",
  "position": {"x": 400, "y": 600},
  "next": "acao_transferir",
  "content": "👨‍💼 **TRANSFERINDO PARA ATENDENTE**\\n\\n✅ Conectando você com nossa equipe!\\n\\n📞 **Aguarde um momento...**"
}
{
  "id": "acao_transferir", 
  "type": "action",
  "position": {"x": 400, "y": 750},
  "next": "end",
  "content": "",
  "action": "transfer_to_human"
}`;
  }

  prompt += `

REGRAS IMPORTANTES:
✅ Mantenha TODA a estrutura original intacta, exceto onde especificado
✅ IDs únicos para novos nós
✅ Posições adequadas (x,y) para novos elementos
✅ Edges conectando source → target corretamente
✅ Conditions com formato: {"value": "X", "operator": "equals", "variable": "Y", "next": "Z"}
✅ Para action: {"action": "transfer_to_human"}
✅ Para ai_response: {"data": {"system_prompt": "...", "temperature": 0.7, "max_tokens": 500}}

CRÍTICO: Aplique EXATAMENTE as mudanças solicitadas, nem mais nem menos!

Responda APENAS com o JSON válido, sem explicações adicionais.`;

  return prompt;
}

// Função para aprimorar o fluxo editado com dados específicos
function enhanceEditedFlow(flow, editData, originalFlow) {
  if (!editData || !flow) return flow;
  
  // Preservar IDs e metadados importantes
  flow.id = originalFlow.id;
  flow.bot_id = originalFlow.bot_id;
  
  // Se adicionou transferência, garantir que está configurada corretamente
  if (editData.addTransferOption && flow.flow_data && flow.flow_data.nodes) {
    const hasTransferNode = flow.flow_data.nodes.some(node => 
      node.type === 'action' && node.action === 'transfer_to_human'
    );
    
    if (!hasTransferNode) {
      // Adicionar nós de transferência se não existirem
      const transferNodes = [
        {
          id: "transferir_operador",
          type: "message",
          position: { x: 400, y: 600 },
          next: "acao_transferir",
          content: "👨‍💼 **TRANSFERINDO PARA ATENDENTE**\n\n✅ Conectando você com nossa equipe!\n\n📞 **Aguarde um momento...**"
        },
        {
          id: "acao_transferir",
          type: "action", 
          position: { x: 400, y: 750 },
          next: "end",
          content: "",
          action: "transfer_to_human"
        }
      ];
      
      flow.flow_data.nodes.push(...transferNodes);
      
      // Adicionar edges se não existirem
      if (!flow.flow_data.edges) flow.flow_data.edges = [];
      flow.flow_data.edges.push(
        { id: "e_transfer1", source: "transferir_operador", target: "acao_transferir" },
        { id: "e_transfer2", source: "acao_transferir", target: "end" }
      );
    }
  }
  
  return flow;
}

module.exports = router;

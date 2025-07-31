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
    const { bot_id, ...flowData } = req.body;

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

    const flow = await Flow.create({
      ...flowData,
      bot_id
    });

    res.status(201).json({
      message: 'Fluxo criado com sucesso',
      flow
    });
  } catch (error) {
    console.error('Erro ao criar fluxo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atualizar fluxo
router.put('/:id', validateParams(schemas.idParam), validate(schemas.updateFlow), async (req, res) => {
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

    // Se está definindo como padrão, remover padrão dos outros fluxos do bot
    if (req.body.is_default === true) {
      await Flow.update(
        { is_default: false },
        { where: { bot_id: flow.bot_id, id: { [require('sequelize').Op.ne]: flow.id } } }
      );
    }

    await flow.update(req.body);

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

module.exports = router;

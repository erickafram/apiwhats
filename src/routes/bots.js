const express = require('express');
const { Bot, Flow, Conversation, Analytics } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateParams, validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar bots do usuário
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'created_at';
    const order = req.query.order || 'DESC';
    const offset = (page - 1) * limit;

    // Buscar bots sem associações para evitar erros
    const { count, rows: bots } = await Bot.findAndCountAll({
      where: { user_id: req.user.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]]
    });

    // Buscar flows separadamente para cada bot (se necessário)
    const botsWithFlows = await Promise.all(
      bots.map(async (bot) => {
        try {
          const flowCount = await Flow.count({
            where: { bot_id: bot.id, is_active: true }
          });

          return {
            ...bot.toJSON(),
            flow_count: flowCount
          };
        } catch (flowError) {
          console.warn(`Erro ao buscar flows para bot ${bot.id}:`, flowError.message);
          return {
            ...bot.toJSON(),
            flow_count: 0
          };
        }
      })
    );

    res.json({
      bots: botsWithFlows,
      pagination: {
        total: count,
        page: page,
        limit: limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar bots:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Buscar bot por ID
router.get('/:id', validateParams(schemas.idParam), async (req, res) => {
  try {
    const bot = await Bot.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        code: 'BOT_NOT_FOUND'
      });
    }

    // Buscar flows separadamente
    try {
      const flows = await Flow.findAll({
        where: { bot_id: bot.id },
        attributes: ['id', 'name', 'description', 'is_active', 'is_default', 'created_at'],
        order: [['created_at', 'DESC']]
      });

      res.json({
        ...bot.toJSON(),
        flows
      });
    } catch (flowError) {
      console.warn(`Erro ao buscar flows para bot ${bot.id}:`, flowError.message);
      res.json({
        ...bot.toJSON(),
        flows: []
      });
    }
  } catch (error) {
    console.error('Erro ao buscar bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Criar novo bot
router.post('/', validate(schemas.createBot), async (req, res) => {
  try {
    const botData = {
      ...req.body,
      user_id: req.user.id
    };

    const bot = await Bot.create(botData);

    res.status(201).json({
      message: 'Bot criado com sucesso',
      bot
    });
  } catch (error) {
    console.error('Erro ao criar bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atualizar bot
router.put('/:id', validateParams(schemas.idParam), validate(schemas.updateBot), async (req, res) => {
  try {
    const bot = await Bot.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        code: 'BOT_NOT_FOUND'
      });
    }

    await bot.update(req.body);

    res.json({
      message: 'Bot atualizado com sucesso',
      bot
    });
  } catch (error) {
    console.error('Erro ao atualizar bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Deletar bot
router.delete('/:id', validateParams(schemas.idParam), async (req, res) => {
  try {
    const bot = await Bot.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        code: 'BOT_NOT_FOUND'
      });
    }

    // Verificar se há conversas ativas
    const activeConversations = await Conversation.count({
      where: { 
        bot_id: bot.id,
        status: 'active'
      }
    });

    if (activeConversations > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar bot com conversas ativas',
        code: 'BOT_HAS_ACTIVE_CONVERSATIONS',
        active_conversations: activeConversations
      });
    }

    await bot.destroy();

    res.json({
      message: 'Bot deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Conectar bot ao WhatsApp
router.post('/:id/connect', validateParams(schemas.idParam), async (req, res) => {
  try {
    const bot = await Bot.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        code: 'BOT_NOT_FOUND'
      });
    }

    // Usar o serviço global do WhatsApp
    const result = await global.whatsappService.connectBot(bot.id);

    res.json({
      message: result.message || 'Processo de conexão iniciado',
      qrCode: result.qrCode || null,
      status: result.status,
      phone: result.phone || null
    });
  } catch (error) {
    console.error('Erro ao conectar bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Desconectar bot do WhatsApp
router.post('/:id/disconnect', validateParams(schemas.idParam), async (req, res) => {
  try {
    const bot = await Bot.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        code: 'BOT_NOT_FOUND'
      });
    }

    await global.whatsappService.disconnectBot(bot.id);

    res.json({
      message: 'Bot desconectado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desconectar bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Limpar sessão do bot
router.post('/:id/clear-session', validateParams(schemas.idParam), async (req, res) => {
  try {
    const bot = await Bot.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        code: 'BOT_NOT_FOUND'
      });
    }

    const result = await global.whatsappService.clearBotSession(bot.id);

    res.json({
      message: 'Sessão limpa com sucesso',
      result
    });
  } catch (error) {
    console.error('Erro ao limpar sessão do bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Obter QR Code do bot
router.get('/:id/qr-code', validateParams(schemas.idParam), async (req, res) => {
  try {
    const bot = await Bot.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        code: 'BOT_NOT_FOUND'
      });
    }

    if (!bot.qr_code) {
      return res.status(404).json({
        error: 'QR Code não disponível',
        code: 'QR_CODE_NOT_AVAILABLE'
      });
    }

    res.json({
      qr_code: bot.qr_code,
      connection_status: bot.connection_status
    });
  } catch (error) {
    console.error('Erro ao obter QR Code:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Obter estatísticas do bot
router.get('/:id/stats', validateParams(schemas.idParam), validateQuery(schemas.dateRange), async (req, res) => {
  try {
    const bot = await Bot.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        code: 'BOT_NOT_FOUND'
      });
    }

    const { start_date, end_date } = req.query;
    const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end_date ? new Date(end_date) : new Date();

    const stats = await Analytics.getDashboardMetrics(bot.id, startDate, endDate);

    res.json({
      bot_id: bot.id,
      period: {
        start_date: startDate,
        end_date: endDate
      },
      stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

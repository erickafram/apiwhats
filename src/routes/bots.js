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

    // Buscar flows e status de conexão para cada bot
    const botsWithFlows = await Promise.all(
      bots.map(async (bot) => {
        try {
          const flowCount = await Flow.count({
            where: { bot_id: bot.id, is_active: true }
          });

          // Verificar status de conexão real
          let connectionInfo = { 
            connected: bot.is_connected, 
            status: bot.connection_status,
            service: 'unknown'
          };

          // Verificar status nos serviços ativos
          if (global.ultraMsgService && process.env.USE_ULTRAMSG === 'true') {
            connectionInfo = global.ultraMsgService.getConnectionInfo(bot.id);
            connectionInfo.service = 'UltraMsg';
            
            // Se não tem conexão salva, verificar status da instância
            if (!connectionInfo.connected) {
              try {
                const instanceStatus = await global.ultraMsgService.getInstanceStatus();
                if (instanceStatus.status === 'authenticated') {
                  connectionInfo.connected = true;
                  connectionInfo.status = 'authenticated';
                  connectionInfo.phoneNumber = instanceStatus.phoneNumber;
                  
                  // Atualizar no banco
                  await bot.update({
                    is_connected: true,
                    connection_status: 'authenticated',
                    phone_number: instanceStatus.phoneNumber
                  });
                }
              } catch (error) {
                // Ignorar erro silenciosamente para não atrapalhar a listagem
              }
            }
          } else if (global.whapiService && process.env.USE_WHAPI === 'true') {
            connectionInfo = global.whapiService.getConnectionInfo ? 
              global.whapiService.getConnectionInfo(bot.id) : connectionInfo;
            connectionInfo.service = 'Whapi';
          } else if (global.maytapiService && process.env.USE_MAYTAPI === 'true') {
            connectionInfo = global.maytapiService.getConnectionInfo ? 
              global.maytapiService.getConnectionInfo(bot.id) : connectionInfo;
            connectionInfo.service = 'Maytapi';
          }

          return {
            ...bot.toJSON(),
            flow_count: flowCount,
            connection_info: {
              connected: connectionInfo.connected,
              status: connectionInfo.status,
              service: connectionInfo.service,
              phoneNumber: connectionInfo.phoneNumber || bot.phone_number,
              instanceId: connectionInfo.instanceId || null
            }
          };
        } catch (flowError) {
          console.warn(`Erro ao buscar dados para bot ${bot.id}:`, flowError.message);
          return {
            ...bot.toJSON(),
            flow_count: 0,
            connection_info: {
              connected: bot.is_connected,
              status: bot.connection_status,
              service: 'unknown',
              phoneNumber: bot.phone_number,
              instanceId: null
            }
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

    // Verificar qual serviço está ativo e conectar
    let result;
    let serviceUsed = 'unknown';

    if (global.ultraMsgService && process.env.USE_ULTRAMSG === 'true') {
      console.log(`🚀 Conectando bot ${bot.id} via UltraMsg`);
      result = await global.ultraMsgService.connectBot(bot.id);
      serviceUsed = 'UltraMsg';
    } else if (global.whapiService && process.env.USE_WHAPI === 'true') {
      console.log(`🚀 Conectando bot ${bot.id} via Whapi`);
      result = await global.whapiService.connectBot(bot.id);
      serviceUsed = 'Whapi';
    } else if (global.maytapiService && process.env.USE_MAYTAPI === 'true') {
      console.log(`🚀 Conectando bot ${bot.id} via Maytapi`);
      result = await global.maytapiService.connectBot(bot.id);
      serviceUsed = 'Maytapi';
    } else if (global.whatsappService) {
      console.log(`🚀 Conectando bot ${bot.id} via serviço padrão`);
      result = await global.whatsappService.connectBot(bot.id);
      serviceUsed = 'WhatsApp';
    } else {
      throw new Error('Nenhum serviço WhatsApp disponível');
    }

    // Atualizar bot no banco com as informações de conexão
    await bot.update({
      is_connected: result.connected || false,
      connection_status: result.status || 'connecting',
      phone_number: result.phoneNumber || null,
      qr_code: result.qrCode || null,
      last_seen: new Date()
    });

    res.json({
      message: `Conectando via ${serviceUsed}`,
      service: serviceUsed,
      connected: result.connected || false,
      qrCode: result.qrCode || null,
      status: result.status || 'connecting',
      phoneNumber: result.phoneNumber || null,
      instanceId: result.instanceId || null
    });
  } catch (error) {
    console.error('Erro ao conectar bot:', error);
    res.status(500).json({
      error: error.message || 'Erro interno do servidor',
      code: 'CONNECTION_ERROR'
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

// Verificar status de conexão do bot
router.get('/:id/connection-status', validateParams(schemas.idParam), async (req, res) => {
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

    // Verificar status nos diferentes serviços
    let connectionInfo = { connected: false, status: 'disconnected', service: 'none' };

    if (global.ultraMsgService && process.env.USE_ULTRAMSG === 'true') {
      console.log(`🔍 Verificando status via UltraMsg para bot ${bot.id}`);
      connectionInfo = global.ultraMsgService.getConnectionInfo(bot.id);
      connectionInfo.service = 'UltraMsg';
      
      // Verificar status real da instância UltraMsg
      try {
        const instanceStatus = await global.ultraMsgService.getInstanceStatus();
        if (instanceStatus.status === 'authenticated') {
          connectionInfo.connected = true;
          connectionInfo.status = 'authenticated';
          connectionInfo.phoneNumber = instanceStatus.phoneNumber;
        }
      } catch (error) {
        console.warn('Erro ao verificar status da instância UltraMsg:', error.message);
      }
    } else if (global.whapiService && process.env.USE_WHAPI === 'true') {
      connectionInfo = global.whapiService.getConnectionInfo(bot.id);
      connectionInfo.service = 'Whapi';
    } else if (global.maytapiService && process.env.USE_MAYTAPI === 'true') {
      connectionInfo = global.maytapiService.getConnectionInfo(bot.id);
      connectionInfo.service = 'Maytapi';
    } else if (global.whatsappService && global.whatsappService.getConnectionInfo) {
      connectionInfo = global.whatsappService.getConnectionInfo(bot.id);
      connectionInfo.service = 'WhatsApp';
    }

    // Atualizar status no banco de dados
    await bot.update({
      is_connected: connectionInfo.connected,
      connection_status: connectionInfo.status || 'unknown',
      phone_number: connectionInfo.phoneNumber || bot.phone_number,
      last_seen: new Date()
    });

    res.json({
      botId: bot.id,
      connected: connectionInfo.connected,
      status: connectionInfo.status || 'unknown',
      service: connectionInfo.service,
      phoneNumber: connectionInfo.phoneNumber || null,
      instanceId: connectionInfo.instanceId || null,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao verificar status de conexão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

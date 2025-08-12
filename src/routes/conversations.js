const express = require('express');
const { Op } = require('sequelize');
const { Conversation, Bot, Message, Flow, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateParams, validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar conversas
router.get('/', validateQuery(schemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'last_activity_at', order = 'DESC', bot_id, status } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const whereClause = {};
    
    // Determinar usuário principal (owner dos bots)
    let mainUserId = req.user.id;
    if (req.user.role === 'operator' && req.user.parent_user_id) {
      mainUserId = req.user.parent_user_id;
    }
    
    // Filtrar por bot se fornecido
    if (bot_id) {
      const bot = await Bot.findOne({
        where: { id: bot_id, user_id: mainUserId }
      });
      
      if (!bot) {
        return res.status(404).json({
          error: 'Bot não encontrado',
          code: 'BOT_NOT_FOUND'
        });
      }
      
      whereClause.bot_id = bot_id;
    } else {
      // Buscar apenas conversas dos bots do usuário principal
      const userBots = await Bot.findAll({
        where: { user_id: mainUserId },
        attributes: ['id']
      });
      
      whereClause.bot_id = userBots.map(bot => bot.id);
    }

    // Filtrar por status se fornecido
    if (status) {
      whereClause.status = status;
    }

    // Controle de acesso para operadores
    if (req.user.role === 'operator') {
      // Operadores só veem conversas atribuídas a eles ou não atribuídas (disponíveis)
      whereClause[Op.or] = [
        { assigned_operator_id: req.user.id },
        { assigned_operator_id: null, status: 'transferred' } // Conversas aguardando atribuição
      ];
    } else if (req.user.role === 'user') {
      // Usuários principais veem todas as conversas dos seus bots
      // Nenhum filtro adicional necessário
    }
    // Admins veem tudo (sem filtros adicionais)

    const { count, rows: conversations } = await Conversation.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset: offset,
      order: [[sort, order]],
      include: [
        {
          model: Bot,
          as: 'bot',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Flow,
          as: 'current_flow',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Message,
          as: 'messages',
          attributes: ['id', 'content', 'direction', 'timestamp'],
          limit: 1,
          order: [['timestamp', 'DESC']],
          required: false
        },
        {
          model: User,
          as: 'assigned_operator',
          attributes: ['id', 'name', 'operator_name'],
          required: false
        }
      ]
    });

    res.json({
      conversations,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Erro ao listar conversas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Buscar conversa por ID
router.get('/:id', validateParams(schemas.idParam), async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id },
          attributes: ['id', 'name', 'description']
        },
        {
          model: Flow,
          as: 'current_flow',
          attributes: ['id', 'name', 'description'],
          required: false
        },
        {
          model: Message,
          as: 'messages',
          order: [['timestamp', 'ASC']],
          limit: 100,
          required: false
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Buscar mensagens de uma conversa
router.get('/:id/messages', validateParams(schemas.idParam), validateQuery(schemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Verificar se a conversa pertence ao usuário
    const conversation = await Conversation.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id },
          attributes: ['id']
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    const { count, rows: messages } = await Message.findAndCountAll({
      where: { conversation_id: req.params.id },
      limit: limitNum,
      offset: offset,
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: Message,
          as: 'quoted_message',
          required: false,
          attributes: ['id', 'content', 'direction']
        }
      ]
    });

    res.json({
      messages: messages.reverse(), // Reverter para ordem cronológica
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Enviar mensagem manual
router.post('/:id/send-message', validateParams(schemas.idParam), async (req, res) => {
  try {
    const { content, media_type = 'text' } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Conteúdo da mensagem é obrigatório',
        code: 'CONTENT_REQUIRED'
      });
    }

    // Verificar se a conversa pertence ao usuário
    const conversation = await Conversation.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    // Criar mensagem
    const message = await Message.create({
      conversation_id: conversation.id,
      bot_id: conversation.bot_id,
      sender_phone: conversation.user_phone,
      direction: 'outgoing',
      content,
      message_type: media_type,
      metadata: {
        manual_message: true,
        sent_by_operator: true
      }
    });

    // Enviar via UltraMsg
    try {
      // Importar o UltraMsgService
      const UltraMsgService = require('../services/UltraMsgService');
      const ultraMsgService = new UltraMsgService();
      
      await ultraMsgService.sendMessage(conversation.bot_id, conversation.user_phone, content, media_type);
      
      await message.update({ 
        status: 'sent',
        timestamp: new Date()
      });
    } catch (whatsappError) {
      console.error('Erro ao enviar mensagem via WhatsApp:', whatsappError);
      await message.update({ 
        status: 'failed',
        error_message: whatsappError.message 
      });
    }

    // Atualizar atividade da conversa
    await conversation.update({ last_activity_at: new Date() });

    res.json({
      message: 'Mensagem enviada com sucesso',
      data: message
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atualizar status da conversa
router.put('/:id/status', validateParams(schemas.idParam), async (req, res) => {
  try {
    const { status, tags } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status é obrigatório',
        code: 'STATUS_REQUIRED'
      });
    }

    const validStatuses = ['active', 'waiting', 'completed', 'abandoned', 'transferred'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Status inválido',
        code: 'INVALID_STATUS',
        valid_statuses: validStatuses
      });
    }

    // Verificar se a conversa pertence ao usuário
    const conversation = await Conversation.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    const updateData = { status };
    
    if (tags !== undefined) {
      updateData.tags = tags;
    }

    if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    await conversation.update(updateData);

    res.json({
      message: 'Status da conversa atualizado com sucesso',
      conversation
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Transferir conversa para humano
router.post('/:id/transfer', validateParams(schemas.idParam), async (req, res) => {
  try {
    const { department = 'support', message } = req.body;

    // Verificar se a conversa pertence ao usuário
    const conversation = await Conversation.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    // Atualizar status da conversa
    await conversation.update({
      status: 'transferred',
      metadata: {
        ...conversation.metadata,
        transferred_to: department,
        transferred_at: new Date(),
        transferred_by: req.user.id
      }
    });

    // Enviar mensagem de transferência se fornecida
    if (message) {
      await Message.create({
        conversation_id: conversation.id,
        direction: 'out',
        content: message,
        media_type: 'text',
        status: 'sent',
        processed: true,
        metadata: {
          system_message: true,
          transfer_message: true
        }
      });
    }

    res.json({
      message: 'Conversa transferida com sucesso',
      conversation
    });
  } catch (error) {
    console.error('Erro ao transferir conversa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atualizar conversa completa (para operadores)
router.put('/:id', validateParams(schemas.idParam), async (req, res) => {
  try {
    const updateData = req.body;

    // Verificar se a conversa pertence ao usuário
    const conversation = await Conversation.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    // Atualizar campos permitidos
    const allowedFields = ['status', 'priority', 'tags', 'metadata'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Se está marcando como completed, adicionar timestamp
    if (filteredData.status === 'completed') {
      filteredData.completed_at = new Date();
    }

    // Atualizar atividade
    filteredData.last_activity_at = new Date();

    await conversation.update(filteredData);

    res.json({
      message: 'Conversa atualizada com sucesso',
      conversation: await conversation.reload()
    });
  } catch (error) {
    console.error('Erro ao atualizar conversa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atribuir conversa a operador
router.post('/:id/assign-operator', validateParams(schemas.idParam), async (req, res) => {
  try {
    const { operator_id } = req.body;
    const conversationId = req.params.id;

    // Determinar usuário principal
    let mainUserId = req.user.id;
    if (req.user.role === 'operator' && req.user.parent_user_id) {
      mainUserId = req.user.parent_user_id;
    }

    // Buscar a conversa
    const conversation = await Conversation.findOne({
      where: { id: conversationId },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: mainUserId }
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    // Verificar se o operador existe e pertence à conta
    if (operator_id) {
      const operator = await User.findOne({
        where: {
          id: operator_id,
          role: 'operator',
          parent_user_id: mainUserId,
          is_active: true
        }
      });

      if (!operator) {
        return res.status(404).json({
          error: 'Operador não encontrado ou inativo',
          code: 'OPERATOR_NOT_FOUND'
        });
      }
    }

    // Verificar se é um operador tentando assumir a conversa
    if (req.user.role === 'operator') {
      // Operador só pode assumir conversas não atribuídas ou suas próprias
      if (conversation.assigned_operator_id && conversation.assigned_operator_id !== req.user.id) {
        return res.status(403).json({
          error: 'Esta conversa já está atribuída a outro operador',
          code: 'CONVERSATION_ALREADY_ASSIGNED'
        });
      }
      
      // Auto-atribuição
      await conversation.update({
        assigned_operator_id: req.user.id,
        status: 'active',
        metadata: {
          ...conversation.metadata,
          operator_assigned: true,
          operator_assigned_at: new Date(),
          assigned_by: req.user.id
        }
      });
    } else {
      // Admin ou usuário principal pode atribuir a qualquer operador
      await conversation.update({
        assigned_operator_id: operator_id || null,
        status: operator_id ? 'active' : 'transferred',
        metadata: {
          ...conversation.metadata,
          operator_assigned: !!operator_id,
          operator_assigned_at: operator_id ? new Date() : null,
          assigned_by: req.user.id
        }
      });
    }

    // Buscar conversa atualizada com operador
    const updatedConversation = await Conversation.findByPk(conversationId, {
      include: [
        {
          model: User,
          as: 'assigned_operator',
          attributes: ['id', 'name', 'operator_name']
        }
      ]
    });

    res.json({
      message: operator_id ? 'Conversa atribuída ao operador com sucesso' : 'Atribuição removida com sucesso',
      conversation: updatedConversation
    });
  } catch (error) {
    console.error('Erro ao atribuir operador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

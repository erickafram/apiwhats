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

    // Determinar usuário principal (owner dos bots)
    let mainUserId = req.user.id;
    if (req.user.role === 'operator' && req.user.parent_user_id) {
      mainUserId = req.user.parent_user_id;
    }

    // Verificar se a conversa pertence ao usuário principal
    const conversation = await Conversation.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: mainUserId },
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

    // Verificação adicional para operadores - só podem ver conversas atribuídas a eles
    if (req.user.role === 'operator') {
      if (conversation.assigned_operator_id !== req.user.id && conversation.status !== 'transferred') {
        return res.status(403).json({
          error: 'Acesso negado a esta conversa',
          code: 'ACCESS_DENIED'
        });
      }
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

    // Determinar usuário principal (owner dos bots)
    let mainUserId = req.user.id;
    if (req.user.role === 'operator' && req.user.parent_user_id) {
      mainUserId = req.user.parent_user_id;
    }

    // Verificar se a conversa pertence ao usuário principal
    const conversation = await Conversation.findOne({
      where: { id: req.params.id },
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

    // Verificação adicional para operadores - só podem enviar em conversas atribuídas a eles
    if (req.user.role === 'operator') {
      if (conversation.assigned_operator_id !== req.user.id) {
        return res.status(403).json({
          error: 'Acesso negado a esta conversa',
          code: 'ACCESS_DENIED'
        });
      }
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
          assigned_by: req.user.id,
          assignment_history: [
            ...(conversation.metadata?.assignment_history || []),
            {
              operator_id: req.user.id,
              operator_name: req.user.operator_name || req.user.name,
              assigned_at: new Date(),
              assigned_by: req.user.id,
              action: 'assumed'
            }
          ]
        }
      });

      // Enviar mensagem automática de boas-vindas
      const operatorName = req.user.operator_name || req.user.name;
      const welcomeMessage = `Olá! Meu nome é ${operatorName} e vou continuar a conversa com você. Como posso ajudá-lo?`;
      
      // Criar mensagem de boas-vindas
      const welcomeMsg = await Message.create({
        conversation_id: conversation.id,
        bot_id: conversation.bot_id,
        sender_phone: conversation.user_phone,
        direction: 'outgoing',
        content: welcomeMessage,
        message_type: 'text',
        metadata: {
          welcome_message: true,
          operator_message: true,
          sent_by_operator: true,
          operator_id: req.user.id,
          operator_name: operatorName
        }
      });

      // Enviar via WhatsApp
      try {
        const UltraMsgService = require('../services/UltraMsgService');
        const ultraMsgService = new UltraMsgService();
        await ultraMsgService.sendMessage(conversation.bot_id, conversation.user_phone, welcomeMessage, 'text');
        
        await welcomeMsg.update({ 
          status: 'sent',
          timestamp: new Date()
        });
      } catch (whatsappError) {
        console.error('Erro ao enviar mensagem de boas-vindas via WhatsApp:', whatsappError);
        await welcomeMsg.update({ 
          status: 'failed',
          error_message: whatsappError.message 
        });
      }
    } else {
      // Admin ou usuário principal pode atribuir a qualquer operador
      await conversation.update({
        assigned_operator_id: operator_id || null,
        status: operator_id ? 'active' : 'transferred',
        metadata: {
          ...conversation.metadata,
          operator_assigned: !!operator_id,
          operator_assigned_at: operator_id ? new Date() : null,
          assigned_by: req.user.id,
          assignment_history: [
            ...(conversation.metadata?.assignment_history || []),
            {
              operator_id: operator_id,
              operator_name: operator_id ? 'Admin Assignment' : null,
              assigned_at: new Date(),
              assigned_by: req.user.id,
              action: operator_id ? 'assigned_by_admin' : 'unassigned'
            }
          ]
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

// Transferir conversa para outro operador
router.post('/:id/transfer-to-operator', validateParams(schemas.idParam), async (req, res) => {
  try {
    const { target_operator_id, message } = req.body;
    const conversationId = req.params.id;

    if (!target_operator_id) {
      return res.status(400).json({
        error: 'ID do operador de destino é obrigatório',
        code: 'TARGET_OPERATOR_REQUIRED'
      });
    }

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
        },
        {
          model: User,
          as: 'assigned_operator',
          attributes: ['id', 'name', 'operator_name']
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    // Verificar permissões
    if (req.user.role === 'operator') {
      // Operador só pode transferir conversas atribuídas a ele
      if (conversation.assigned_operator_id !== req.user.id) {
        return res.status(403).json({
          error: 'Você só pode transferir conversas atribuídas a você',
          code: 'TRANSFER_NOT_ALLOWED'
        });
      }
    }

    // Verificar se o operador de destino existe e está ativo
    const targetOperator = await User.findOne({
      where: {
        id: target_operator_id,
        role: 'operator',
        parent_user_id: mainUserId,
        is_active: true
      }
    });

    if (!targetOperator) {
      return res.status(404).json({
        error: 'Operador de destino não encontrado ou inativo',
        code: 'TARGET_OPERATOR_NOT_FOUND'
      });
    }

    // Não permitir transferir para si mesmo
    if (target_operator_id === req.user.id) {
      return res.status(400).json({
        error: 'Não é possível transferir a conversa para você mesmo',
        code: 'SELF_TRANSFER_NOT_ALLOWED'
      });
    }

    // Atualizar conversa
    const currentOperatorName = req.user.operator_name || req.user.name;
    const targetOperatorName = targetOperator.operator_name || targetOperator.name;

    await conversation.update({
      assigned_operator_id: target_operator_id,
      status: 'active',
      metadata: {
        ...conversation.metadata,
        operator_assigned: true,
        operator_assigned_at: new Date(),
        assigned_by: req.user.id,
        transfer_reason: message || `Transferido por ${currentOperatorName}`,
        assignment_history: [
          ...(conversation.metadata?.assignment_history || []),
          {
            operator_id: target_operator_id,
            operator_name: targetOperatorName,
            assigned_at: new Date(),
            assigned_by: req.user.id,
            assigned_by_name: currentOperatorName,
            action: 'transferred_by_operator',
            transfer_reason: message || 'Transferência entre operadores'
          }
        ]
      }
    });

    // Criar mensagem de transferência
    const transferMessage = message 
      ? `Conversa transferida por ${currentOperatorName} para ${targetOperatorName}. Motivo: ${message}`
      : `Conversa transferida por ${currentOperatorName} para ${targetOperatorName}.`;

    const transferMsg = await Message.create({
      conversation_id: conversation.id,
      bot_id: conversation.bot_id,
      sender_phone: conversation.user_phone,
      direction: 'outgoing',
      content: transferMessage,
      message_type: 'text',
      metadata: {
        system_message: true,
        transfer_message: true,
        transferred_by: req.user.id,
        transferred_to: target_operator_id,
        transfer_reason: message
      }
    });

    // Enviar mensagem de transferência via WhatsApp
    try {
      const UltraMsgService = require('../services/UltraMsgService');
      const ultraMsgService = new UltraMsgService();
      await ultraMsgService.sendMessage(conversation.bot_id, conversation.user_phone, transferMessage, 'text');
      
      await transferMsg.update({ 
        status: 'sent',
        timestamp: new Date()
      });
    } catch (whatsappError) {
      console.error('Erro ao enviar mensagem de transferência via WhatsApp:', whatsappError);
      await transferMsg.update({ 
        status: 'failed',
        error_message: whatsappError.message 
      });
    }

    // Criar mensagem de boas-vindas do novo operador
    const newWelcomeMessage = `Olá! Meu nome é ${targetOperatorName} e agora vou continuar nossa conversa. Como posso ajudá-lo?`;
    
    const newWelcomeMsg = await Message.create({
      conversation_id: conversation.id,
      bot_id: conversation.bot_id,
      sender_phone: conversation.user_phone,
      direction: 'outgoing',
      content: newWelcomeMessage,
      message_type: 'text',
      metadata: {
        welcome_message: true,
        operator_message: true,
        sent_by_operator: true,
        operator_id: target_operator_id,
        operator_name: targetOperatorName,
        transfer_welcome: true
      }
    });

    // Enviar mensagem de boas-vindas via WhatsApp
    try {
      const UltraMsgService = require('../services/UltraMsgService');
      const ultraMsgService = new UltraMsgService();
      await ultraMsgService.sendMessage(conversation.bot_id, conversation.user_phone, newWelcomeMessage, 'text');
      
      await newWelcomeMsg.update({ 
        status: 'sent',
        timestamp: new Date()
      });
    } catch (whatsappError) {
      console.error('Erro ao enviar mensagem de boas-vindas via WhatsApp:', whatsappError);
      await newWelcomeMsg.update({ 
        status: 'failed',
        error_message: whatsappError.message 
      });
    }

    // Buscar conversa atualizada
    const updatedConversation = await Conversation.findByPk(conversationId, {
      include: [
        {
          model: User,
          as: 'assigned_operator',
          attributes: ['id', 'name', 'operator_name']
        }
      ]
    });

    // Emitir evento via WebSocket se disponível
    if (global.io) {
      global.io.emit('conversation_transferred', {
        conversation_id: conversationId,
        from_operator: req.user.id,
        to_operator: target_operator_id,
        transfer_reason: message
      });
    }

    res.json({
      message: `Conversa transferida com sucesso para ${targetOperatorName}`,
      conversation: updatedConversation
    });
  } catch (error) {
    console.error('Erro ao transferir conversa para operador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Buscar histórico de auditoria de uma conversa (apenas para admins)
router.get('/:id/audit-trail', validateParams(schemas.idParam), async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Determinar usuário principal
    let mainUserId = req.user.id;
    if (req.user.role === 'operator' && req.user.parent_user_id) {
      mainUserId = req.user.parent_user_id;
    }

    // Verificar se é admin ou usuário principal
    if (req.user.role === 'operator') {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem ver o histórico completo.',
        code: 'ACCESS_DENIED'
      });
    }

    // Buscar a conversa com histórico completo
    const conversation = await Conversation.findOne({
      where: { id: conversationId },
      include: [
        {
          model: Bot,
          as: 'bot',
          where: { user_id: mainUserId },
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assigned_operator',
          attributes: ['id', 'name', 'operator_name'],
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

    // Buscar todas as mensagens relacionadas a transferências e atribuições
    const auditMessages = await Message.findAll({
      where: {
        conversation_id: conversationId,
        [Op.or]: [
          { 'metadata.system_message': true },
          { 'metadata.transfer_message': true },
          { 'metadata.welcome_message': true },
          { 'metadata.operator_message': true }
        ]
      },
      order: [['timestamp', 'ASC']],
      attributes: ['id', 'content', 'timestamp', 'metadata', 'status']
    });

    // Extrair histórico de atribuições do metadata
    const assignmentHistory = conversation.metadata?.assignment_history || [];

    // Buscar informações dos operadores mencionados no histórico
    const operatorIds = [
      ...new Set([
        ...assignmentHistory.map(h => h.operator_id).filter(Boolean),
        ...assignmentHistory.map(h => h.assigned_by).filter(Boolean)
      ])
    ];

    const operators = await User.findAll({
      where: {
        id: operatorIds,
        role: { [Op.in]: ['operator', 'user', 'admin'] }
      },
      attributes: ['id', 'name', 'operator_name', 'role']
    });

    const operatorMap = operators.reduce((acc, op) => {
      acc[op.id] = {
        name: op.operator_name || op.name,
        role: op.role
      };
      return acc;
    }, {});

    // Enriquecer histórico com nomes dos operadores
    const enrichedHistory = assignmentHistory.map(entry => ({
      ...entry,
      operator_display_name: operatorMap[entry.operator_id]?.name || 'Operador Desconhecido',
      assigned_by_display_name: operatorMap[entry.assigned_by]?.name || 'Sistema',
      assigned_by_role: operatorMap[entry.assigned_by]?.role || 'system'
    }));

    res.json({
      conversation: {
        id: conversation.id,
        user_phone: conversation.user_phone,
        user_name: conversation.user_name,
        status: conversation.status,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        bot: conversation.bot,
        assigned_operator: conversation.assigned_operator
      },
      assignment_history: enrichedHistory,
      audit_messages: auditMessages,
      summary: {
        total_assignments: assignmentHistory.length,
        total_transfers: assignmentHistory.filter(h => h.action.includes('transfer')).length,
        current_operator: conversation.assigned_operator?.operator_name || conversation.assigned_operator?.name,
        last_activity: conversation.updated_at
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de auditoria:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Listar operadores disponíveis para transferência
router.get('/operators/available', async (req, res) => {
  try {
    // Determinar usuário principal
    let mainUserId = req.user.id;
    if (req.user.role === 'operator' && req.user.parent_user_id) {
      mainUserId = req.user.parent_user_id;
    }

    // Buscar operadores ativos da conta
    const operators = await User.findAll({
      where: {
        role: 'operator',
        parent_user_id: mainUserId,
        is_active: true,
        id: { [Op.ne]: req.user.id } // Excluir o próprio usuário
      },
      attributes: ['id', 'name', 'operator_name', 'email', 'created_at'],
      order: [['operator_name', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      operators: operators.map(op => ({
        id: op.id,
        name: op.operator_name || op.name,
        email: op.email,
        created_at: op.created_at
      }))
    });
  } catch (error) {
    console.error('Erro ao listar operadores:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

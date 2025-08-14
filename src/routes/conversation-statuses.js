const express = require('express');
const { Op } = require('sequelize');
const { ConversationStatus, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateParams, validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar status customizados
router.get('/', validateQuery(schemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 50, sort = 'order_index', order = 'ASC', active } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;

    // Determinar usuário principal (owner dos bots)
    let mainUserId = req.user.id;
    if (req.user.role === 'operator' && req.user.parent_user_id) {
      mainUserId = req.user.parent_user_id;
    }

    const whereClause = {
      user_id: mainUserId
    };

    // Filtrar por status ativo se especificado
    if (active !== undefined) {
      whereClause.is_active = active === 'true';
    }

    const { count, rows: statuses } = await ConversationStatus.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset: offset,
      order: [[sort, order]]
    });

    res.json({
      statuses,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Erro ao listar status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Buscar status por ID
router.get('/:id', validateParams(schemas.idParam), async (req, res) => {
  try {
    // Determinar usuário principal
    let mainUserId = req.user.id;
    if (req.user.role === 'operator' && req.user.parent_user_id) {
      mainUserId = req.user.parent_user_id;
    }

    const status = await ConversationStatus.findOne({
      where: {
        id: req.params.id,
        user_id: mainUserId
      }
    });

    if (!status) {
      return res.status(404).json({
        error: 'Status não encontrado',
        code: 'STATUS_NOT_FOUND'
      });
    }

    res.json(status);
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Criar novo status (apenas administradores)
router.post('/', async (req, res) => {
  try {
    // Verificar se é administrador
    if (req.user.role === 'operator') {
      return res.status(403).json({
        error: 'Apenas administradores podem criar status',
        code: 'ACCESS_DENIED'
      });
    }

    const { name, description, color = '#2196f3', icon, is_final = false } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Nome do status é obrigatório',
        code: 'NAME_REQUIRED'
      });
    }

    // Verificar se já existe um status com o mesmo nome
    const existingStatus = await ConversationStatus.findOne({
      where: {
        user_id: req.user.id,
        name: name.trim()
      }
    });

    if (existingStatus) {
      return res.status(409).json({
        error: 'Já existe um status com este nome',
        code: 'STATUS_NAME_EXISTS'
      });
    }

    // Buscar próximo order_index
    const maxOrder = await ConversationStatus.max('order_index', {
      where: { user_id: req.user.id }
    });

    const status = await ConversationStatus.create({
      user_id: req.user.id,
      name: name.trim(),
      description: description?.trim(),
      color: color.trim(),
      icon: icon?.trim(),
      is_final,
      order_index: (maxOrder || 0) + 1
    });

    res.status(201).json({
      message: 'Status criado com sucesso',
      status
    });
  } catch (error) {
    console.error('Erro ao criar status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atualizar status (apenas administradores)
router.put('/:id', validateParams(schemas.idParam), async (req, res) => {
  try {
    // Verificar se é administrador
    if (req.user.role === 'operator') {
      return res.status(403).json({
        error: 'Apenas administradores podem editar status',
        code: 'ACCESS_DENIED'
      });
    }

    const status = await ConversationStatus.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!status) {
      return res.status(404).json({
        error: 'Status não encontrado',
        code: 'STATUS_NOT_FOUND'
      });
    }

    const { name, description, color, icon, is_active, is_final, order_index } = req.body;

    // Verificar se o nome já existe em outro status
    if (name && name.trim() !== status.name) {
      const existingStatus = await ConversationStatus.findOne({
        where: {
          user_id: req.user.id,
          name: name.trim(),
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingStatus) {
        return res.status(409).json({
          error: 'Já existe um status com este nome',
          code: 'STATUS_NAME_EXISTS'
        });
      }
    }

    // Atualizar campos
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (color !== undefined) updateData.color = color.trim();
    if (icon !== undefined) updateData.icon = icon?.trim();
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_final !== undefined) updateData.is_final = is_final;
    if (order_index !== undefined) updateData.order_index = order_index;

    await status.update(updateData);

    res.json({
      message: 'Status atualizado com sucesso',
      status: await status.reload()
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Deletar status (apenas administradores)
router.delete('/:id', validateParams(schemas.idParam), async (req, res) => {
  try {
    // Verificar se é administrador
    if (req.user.role === 'operator') {
      return res.status(403).json({
        error: 'Apenas administradores podem deletar status',
        code: 'ACCESS_DENIED'
      });
    }

    const status = await ConversationStatus.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!status) {
      return res.status(404).json({
        error: 'Status não encontrado',
        code: 'STATUS_NOT_FOUND'
      });
    }

    // Verificar se há conversas usando este status
    const { Conversation } = require('../models');
    const conversationsCount = await Conversation.count({
      where: { custom_status_id: req.params.id }
    });

    if (conversationsCount > 0) {
      return res.status(409).json({
        error: `Não é possível deletar o status. Existem ${conversationsCount} conversa(s) usando este status.`,
        code: 'STATUS_IN_USE',
        conversations_count: conversationsCount
      });
    }

    await status.destroy();

    res.json({
      message: 'Status deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Reordenar status (apenas administradores)
router.post('/reorder', async (req, res) => {
  try {
    // Verificar se é administrador
    if (req.user.role === 'operator') {
      return res.status(403).json({
        error: 'Apenas administradores podem reordenar status',
        code: 'ACCESS_DENIED'
      });
    }

    const { status_ids } = req.body;

    if (!Array.isArray(status_ids) || status_ids.length === 0) {
      return res.status(400).json({
        error: 'Lista de IDs de status é obrigatória',
        code: 'STATUS_IDS_REQUIRED'
      });
    }

    // Verificar se todos os status pertencem ao usuário
    const statuses = await ConversationStatus.findAll({
      where: {
        id: status_ids,
        user_id: req.user.id
      }
    });

    if (statuses.length !== status_ids.length) {
      return res.status(404).json({
        error: 'Um ou mais status não foram encontrados',
        code: 'STATUS_NOT_FOUND'
      });
    }

    // Atualizar ordem
    for (let i = 0; i < status_ids.length; i++) {
      await ConversationStatus.update(
        { order_index: i + 1 },
        { where: { id: status_ids[i], user_id: req.user.id } }
      );
    }

    res.json({
      message: 'Ordem dos status atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao reordenar status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Criar status padrão para novos usuários
router.post('/create-defaults', async (req, res) => {
  try {
    // Verificar se é administrador
    if (req.user.role === 'operator') {
      return res.status(403).json({
        error: 'Apenas administradores podem criar status padrão',
        code: 'ACCESS_DENIED'
      });
    }

    // Verificar se já existem status
    const existingCount = await ConversationStatus.count({
      where: { user_id: req.user.id }
    });

    if (existingCount > 0) {
      return res.status(409).json({
        error: 'Já existem status customizados para esta conta',
        code: 'STATUSES_ALREADY_EXIST'
      });
    }

    // Criar status padrão
    const defaultStatuses = [
      {
        name: 'Novo',
        description: 'Conversa recém iniciada',
        color: '#2196f3',
        icon: 'FiberNew',
        order_index: 1,
        is_final: false
      },
      {
        name: 'Em Andamento',
        description: 'Conversa sendo atendida',
        color: '#ff9800',
        icon: 'Schedule',
        order_index: 2,
        is_final: false
      },
      {
        name: 'Aguardando Pagamento',
        description: 'Aguardando confirmação de pagamento',
        color: '#f44336',
        icon: 'Payment',
        order_index: 3,
        is_final: false
      },
      {
        name: 'Pago',
        description: 'Pagamento confirmado',
        color: '#4caf50',
        icon: 'CheckCircle',
        order_index: 4,
        is_final: false
      },
      {
        name: 'Resolvido',
        description: 'Problema resolvido',
        color: '#4caf50',
        icon: 'TaskAlt',
        order_index: 5,
        is_final: true
      },
      {
        name: 'Cancelado',
        description: 'Conversa cancelada',
        color: '#9e9e9e',
        icon: 'Cancel',
        order_index: 6,
        is_final: true
      }
    ];

    const createdStatuses = await ConversationStatus.bulkCreate(
      defaultStatuses.map(status => ({
        ...status,
        user_id: req.user.id
      }))
    );

    res.status(201).json({
      message: 'Status padrão criados com sucesso',
      statuses: createdStatuses
    });
  } catch (error) {
    console.error('Erro ao criar status padrão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

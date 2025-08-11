const express = require('express');
const router = express.Router();
const { QuickMessage } = require('../models');
const auth = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

// Middleware de validação de erros
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/quick-messages - Listar mensagens prontas do usuário
router.get('/', auth, [
  query('category').optional().isIn(['geral', 'saudacoes', 'despedidas', 'informacoes', 'suporte', 'vendas', 'agendamento', 'pagamento', 'outros']),
  query('search').optional().isLength({ min: 1, max: 100 }),
  query('is_active').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], handleValidationErrors, async (req, res) => {
  try {
    const { category, search, is_active, limit = 50, offset = 0 } = req.query;
    
    const where = {
      user_id: req.user.id
    };

    if (category) {
      where.category = category;
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const quickMessages = await QuickMessage.findAndCountAll({
      where,
      order: [['sort_order', 'ASC'], ['usage_count', 'DESC'], ['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        quick_messages: quickMessages.rows,
        total: quickMessages.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Erro ao listar mensagens prontas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/quick-messages/categories - Listar categorias disponíveis
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = QuickMessage.getCategories();
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/quick-messages/:id - Obter mensagem pronta específica
router.get('/:id', auth, [
  param('id').isInt({ min: 1 })
], handleValidationErrors, async (req, res) => {
  try {
    const quickMessage = await QuickMessage.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!quickMessage) {
      return res.status(404).json({
        error: 'Mensagem pronta não encontrada'
      });
    }

    res.json({
      success: true,
      data: { quick_message: quickMessage }
    });
  } catch (error) {
    console.error('Erro ao obter mensagem pronta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/quick-messages - Criar nova mensagem pronta
router.post('/', auth, [
  body('title').notEmpty().isLength({ min: 2, max: 100 }).withMessage('Título deve ter entre 2 e 100 caracteres'),
  body('content').notEmpty().isLength({ min: 1, max: 4000 }).withMessage('Conteúdo deve ter entre 1 e 4000 caracteres'),
  body('category').optional().isIn(['geral', 'saudacoes', 'despedidas', 'informacoes', 'suporte', 'vendas', 'agendamento', 'pagamento', 'outros']),
  body('tags').optional().isArray(),
  body('sort_order').optional().isInt({ min: 0 })
], handleValidationErrors, async (req, res) => {
  try {
    const { title, content, category = 'geral', tags = [], sort_order = 0 } = req.body;

    const quickMessage = await QuickMessage.create({
      user_id: req.user.id,
      title,
      content,
      category,
      tags,
      sort_order
    });

    res.status(201).json({
      success: true,
      message: 'Mensagem pronta criada com sucesso',
      data: { quick_message: quickMessage }
    });
  } catch (error) {
    console.error('Erro ao criar mensagem pronta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/quick-messages/:id - Atualizar mensagem pronta
router.put('/:id', auth, [
  param('id').isInt({ min: 1 }),
  body('title').optional().isLength({ min: 2, max: 100 }),
  body('content').optional().isLength({ min: 1, max: 4000 }),
  body('category').optional().isIn(['geral', 'saudacoes', 'despedidas', 'informacoes', 'suporte', 'vendas', 'agendamento', 'pagamento', 'outros']),
  body('tags').optional().isArray(),
  body('is_active').optional().isBoolean(),
  body('sort_order').optional().isInt({ min: 0 })
], handleValidationErrors, async (req, res) => {
  try {
    const quickMessage = await QuickMessage.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!quickMessage) {
      return res.status(404).json({
        error: 'Mensagem pronta não encontrada'
      });
    }

    const { title, content, category, tags, is_active, sort_order } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    await quickMessage.update(updateData);

    res.json({
      success: true,
      message: 'Mensagem pronta atualizada com sucesso',
      data: { quick_message: quickMessage }
    });
  } catch (error) {
    console.error('Erro ao atualizar mensagem pronta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/quick-messages/:id - Deletar mensagem pronta
router.delete('/:id', auth, [
  param('id').isInt({ min: 1 })
], handleValidationErrors, async (req, res) => {
  try {
    const quickMessage = await QuickMessage.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!quickMessage) {
      return res.status(404).json({
        error: 'Mensagem pronta não encontrada'
      });
    }

    await quickMessage.destroy();

    res.json({
      success: true,
      message: 'Mensagem pronta deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar mensagem pronta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/quick-messages/:id/use - Marcar mensagem como usada (incrementar contador)
router.post('/:id/use', auth, [
  param('id').isInt({ min: 1 })
], handleValidationErrors, async (req, res) => {
  try {
    const quickMessage = await QuickMessage.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
        is_active: true
      }
    });

    if (!quickMessage) {
      return res.status(404).json({
        error: 'Mensagem pronta não encontrada ou inativa'
      });
    }

    await quickMessage.incrementUsage();

    res.json({
      success: true,
      message: 'Uso registrado com sucesso',
      data: { 
        quick_message: quickMessage,
        usage_count: quickMessage.usage_count + 1
      }
    });
  } catch (error) {
    console.error('Erro ao registrar uso da mensagem pronta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

module.exports = router; 
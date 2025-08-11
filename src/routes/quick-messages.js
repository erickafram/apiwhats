const express = require('express');
const router = express.Router();
const { QuickMessage } = require('../models');
const { authenticateToken: auth } = require('../middleware/auth');

// Função simples de validação
const validateQuickMessage = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 2 || data.title.length > 100) {
      errors.push({ field: 'title', message: 'Título deve ter entre 2 e 100 caracteres' });
    }
  }
  
  if (!isUpdate || data.content !== undefined) {
    if (!data.content || typeof data.content !== 'string' || data.content.trim().length < 1 || data.content.length > 4000) {
      errors.push({ field: 'content', message: 'Conteúdo deve ter entre 1 e 4000 caracteres' });
    }
  }
  
  if (data.category !== undefined) {
    const validCategories = ['geral', 'saudacoes', 'despedidas', 'informacoes', 'suporte', 'vendas', 'agendamento', 'pagamento', 'outros'];
    if (!validCategories.includes(data.category)) {
      errors.push({ field: 'category', message: 'Categoria inválida' });
    }
  }
  
  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push({ field: 'tags', message: 'Tags deve ser um array' });
  }
  
  if (data.sort_order !== undefined && (isNaN(data.sort_order) || data.sort_order < 0)) {
    errors.push({ field: 'sort_order', message: 'Ordem deve ser um número positivo' });
  }
  
  return errors;
};

// GET /api/quick-messages - Listar mensagens prontas do usuário
router.get('/', auth, async (req, res) => {
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
router.get('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
      return res.status(400).json({
        error: 'ID inválido'
      });
    }

    const quickMessage = await QuickMessage.findOne({
      where: {
        id: id,
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
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category = 'geral', tags = [], sort_order = 0 } = req.body;
    
    // Validar dados
    const validationErrors = validateQuickMessage(req.body);
    if (validationErrors.length > 0) {
      return res.status(422).json({
        error: 'Dados inválidos',
        errors: validationErrors
      });
    }

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
router.put('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
      return res.status(400).json({
        error: 'ID inválido'
      });
    }

    // Validar dados
    const validationErrors = validateQuickMessage(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(422).json({
        error: 'Dados inválidos',
        errors: validationErrors
      });
    }

    const quickMessage = await QuickMessage.findOne({
      where: {
        id: id,
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
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
      return res.status(400).json({
        error: 'ID inválido'
      });
    }

    const quickMessage = await QuickMessage.findOne({
      where: {
        id: id,
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
router.post('/:id/use', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
      return res.status(400).json({
        error: 'ID inválido'
      });
    }

    const quickMessage = await QuickMessage.findOne({
      where: {
        id: id,
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
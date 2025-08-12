const express = require('express');
const { User, Conversation, Bot } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateParams, validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Middleware para verificar se o usuário pode gerenciar operadores
const canManageOperators = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Admin pode gerenciar qualquer coisa
    if (user.role === 'admin') {
      return next();
    }
    
    // Usuário principal pode gerenciar seus operadores
    if (user.role === 'user' && !user.parent_user_id) {
      return next();
    }
    
    return res.status(403).json({
      error: 'Permissão insuficiente para gerenciar operadores',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  } catch (error) {
    console.error('Erro na verificação de permissões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Listar operadores da conta
router.get('/', canManageOperators, async (req, res) => {
  try {
    const user = req.user;
    let whereClause = {};
    
    if (user.role === 'admin') {
      // Admin vê todos os operadores
      whereClause = { role: 'operator' };
    } else {
      // Usuário vê apenas seus operadores
      whereClause = {
        role: 'operator',
        parent_user_id: user.id
      };
    }

    const operators = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'operator_name', 'is_active', 'last_login', 'created_at'],
      include: [
        {
          model: User,
          as: 'parent_user',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: Conversation,
          as: 'assigned_conversations',
          attributes: ['id', 'status'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calcular estatísticas para cada operador
    const operatorsWithStats = operators.map(operator => {
      const conversations = operator.assigned_conversations || [];
      const activeConversations = conversations.filter(conv => conv.status === 'active').length;
      const totalConversations = conversations.length;
      
      return {
        ...operator.toJSON(),
        stats: {
          active_conversations: activeConversations,
          total_conversations: totalConversations
        }
      };
    });

    res.json({
      operators: operatorsWithStats,
      total: operators.length
    });
  } catch (error) {
    console.error('Erro ao listar operadores:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Criar novo operador
router.post('/', canManageOperators, async (req, res) => {
  try {
    const { name, email, password, operator_name } = req.body;
    const user = req.user;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Nome, email e senha são obrigatórios',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Verificar se o email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email já está em uso',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Determinar parent_user_id
    let parentUserId = user.id;
    if (user.role === 'admin' && req.body.parent_user_id) {
      parentUserId = req.body.parent_user_id;
    }

    // Criar operador
    const operator = await User.create({
      name,
      email,
      password,
      operator_name: operator_name || name,
      role: 'operator',
      parent_user_id: parentUserId
    });

    res.status(201).json({
      message: 'Operador criado com sucesso',
      operator: operator.toJSON()
    });
  } catch (error) {
    console.error('Erro ao criar operador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Buscar operador por ID
router.get('/:id', canManageOperators, async (req, res) => {
  try {
    const user = req.user;
    const operatorId = req.params.id;

    let whereClause = { id: operatorId, role: 'operator' };
    
    // Se não for admin, só pode ver seus próprios operadores
    if (user.role !== 'admin') {
      whereClause.parent_user_id = user.id;
    }

    const operator = await User.findOne({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'operator_name', 'is_active', 'last_login', 'created_at'],
      include: [
        {
          model: User,
          as: 'parent_user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Conversation,
          as: 'assigned_conversations',
          include: [
            {
              model: Bot,
              as: 'bot',
              attributes: ['id', 'name']
            }
          ],
          order: [['updated_at', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!operator) {
      return res.status(404).json({
        error: 'Operador não encontrado',
        code: 'OPERATOR_NOT_FOUND'
      });
    }

    res.json(operator);
  } catch (error) {
    console.error('Erro ao buscar operador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atualizar operador
router.put('/:id', canManageOperators, async (req, res) => {
  try {
    const user = req.user;
    const operatorId = req.params.id;
    const { name, operator_name, is_active } = req.body;

    let whereClause = { id: operatorId, role: 'operator' };
    
    // Se não for admin, só pode editar seus próprios operadores
    if (user.role !== 'admin') {
      whereClause.parent_user_id = user.id;
    }

    const operator = await User.findOne({ where: whereClause });

    if (!operator) {
      return res.status(404).json({
        error: 'Operador não encontrado',
        code: 'OPERATOR_NOT_FOUND'
      });
    }

    // Atualizar campos permitidos
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (operator_name !== undefined) updateData.operator_name = operator_name;
    if (is_active !== undefined) updateData.is_active = is_active;

    await operator.update(updateData);

    res.json({
      message: 'Operador atualizado com sucesso',
      operator: operator.toJSON()
    });
  } catch (error) {
    console.error('Erro ao atualizar operador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Alterar senha do operador
router.put('/:id/password', canManageOperators, async (req, res) => {
  try {
    const user = req.user;
    const operatorId = req.params.id;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        error: 'Nova senha deve ter pelo menos 6 caracteres',
        code: 'INVALID_PASSWORD'
      });
    }

    let whereClause = { id: operatorId, role: 'operator' };
    
    // Se não for admin, só pode alterar senha dos seus operadores
    if (user.role !== 'admin') {
      whereClause.parent_user_id = user.id;
    }

    const operator = await User.findOne({ where: whereClause });

    if (!operator) {
      return res.status(404).json({
        error: 'Operador não encontrado',
        code: 'OPERATOR_NOT_FOUND'
      });
    }

    await operator.update({ password: new_password });

    res.json({
      message: 'Senha do operador alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha do operador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Remover operador
router.delete('/:id', canManageOperators, async (req, res) => {
  try {
    const user = req.user;
    const operatorId = req.params.id;

    let whereClause = { id: operatorId, role: 'operator' };
    
    // Se não for admin, só pode remover seus próprios operadores
    if (user.role !== 'admin') {
      whereClause.parent_user_id = user.id;
    }

    const operator = await User.findOne({ where: whereClause });

    if (!operator) {
      return res.status(404).json({
        error: 'Operador não encontrado',
        code: 'OPERATOR_NOT_FOUND'
      });
    }

    // Verificar se o operador tem conversas ativas
    const activeConversations = await Conversation.count({
      where: {
        assigned_operator_id: operatorId,
        status: 'active'
      }
    });

    if (activeConversations > 0) {
      return res.status(400).json({
        error: 'Não é possível remover operador com conversas ativas',
        code: 'HAS_ACTIVE_CONVERSATIONS',
        active_conversations: activeConversations
      });
    }

    // Limpar atribuições de conversas
    await Conversation.update(
      { assigned_operator_id: null },
      { where: { assigned_operator_id: operatorId } }
    );

    // Remover operador
    await operator.destroy();

    res.json({
      message: 'Operador removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover operador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

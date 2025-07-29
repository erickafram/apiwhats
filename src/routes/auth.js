const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Registrar novo usuário
router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar se o email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email já está em uso',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Login
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar se o usuário está ativo
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Conta desativada',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Verificar senha
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Atualizar último login
    await user.update({ last_login: new Date() });

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Verificar token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    res.json({
      message: 'Token válido',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Gerar novo token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Token renovado com sucesso',
      token
    });
  } catch (error) {
    console.error('Erro no refresh:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Logout (opcional - pode ser feito apenas no frontend)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Em uma implementação mais robusta, você poderia adicionar o token a uma blacklist
    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Alterar senha
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Senha atual e nova senha são obrigatórias',
        code: 'MISSING_PASSWORDS'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'Nova senha deve ter pelo menos 6 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    const user = req.user;

    // Verificar senha atual
    const isValidPassword = await user.validatePassword(current_password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Senha atual incorreta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Atualizar senha
    await user.update({ password: new_password });

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro na alteração de senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

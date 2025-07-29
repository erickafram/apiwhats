const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acesso requerido',
        code: 'TOKEN_REQUIRED'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou inativo',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    const hasRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ 
        error: 'Permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: requiredRoles,
        user_roles: userRoles
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};

const winston = require('winston');
const path = require('path');

// Configurar formato de log
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configurar transports
const transports = [
  // Console transport para desenvolvimento
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// File transport para produção
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Adicionar métodos de conveniência
logger.logRequest = (req, res, responseTime) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id || null
  });
};

logger.logWhatsAppEvent = (event, botId, data = {}) => {
  logger.info('WhatsApp Event', {
    event,
    botId,
    ...data
  });
};

logger.logAIRequest = (botId, model, tokens, responseTime) => {
  logger.info('AI Request', {
    botId,
    model,
    tokens,
    responseTime: `${responseTime}ms`
  });
};

logger.logFlowExecution = (botId, flowId, nodeId, success, duration) => {
  logger.info('Flow Execution', {
    botId,
    flowId,
    nodeId,
    success,
    duration: `${duration}ms`
  });
};

module.exports = logger;

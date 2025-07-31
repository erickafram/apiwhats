const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    console.log(`🔧 DEBUG Validação: Validando dados para ${req.method} ${req.path}`);
    console.log(`🔧 DEBUG Validação: Dados recebidos:`, JSON.stringify(req.body, null, 2));

    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      console.log(`❌ DEBUG Validação: Erro de validação:`, errors);
      return res.status(400).json({
        error: 'Dados de entrada inválidos',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    console.log(`✅ DEBUG Validação: Dados válidos, prosseguindo...`);
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { 
      abortEarly: false 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        error: 'Parâmetros inválidos',
        code: 'PARAMS_VALIDATION_ERROR',
        details: errors
      });
    }

    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        error: 'Query parameters inválidos',
        code: 'QUERY_VALIDATION_ERROR',
        details: errors
      });
    }

    next();
  };
};

// Schemas de validação comuns
const schemas = {
  // Autenticação
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().valid('admin', 'user').default('user')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Bot
  createBot: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).allow(''),
    ai_config: Joi.object({
      enabled: Joi.boolean().default(true),
      model: Joi.string().default('meta-llama/Llama-3.3-70B-Instruct-Turbo'),
      temperature: Joi.number().min(0).max(2).default(0.7),
      max_tokens: Joi.number().min(1).max(4000).default(1000),
      system_prompt: Joi.string().max(2000).default('Você é um assistente virtual útil e amigável.')
    }).default(),
    webhook_url: Joi.string().uri().allow(''),
    settings: Joi.object().default()
  }),

  updateBot: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().max(500).allow(''),
    ai_config: Joi.object({
      enabled: Joi.boolean(),
      model: Joi.string(),
      temperature: Joi.number().min(0).max(2),
      max_tokens: Joi.number().min(1).max(4000),
      system_prompt: Joi.string().max(2000)
    }),
    webhook_url: Joi.string().uri().allow(''),
    is_active: Joi.boolean(),
    settings: Joi.object()
  }),

  // Flow
  createFlow: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).allow(''),
    bot_id: Joi.number().integer().required(), // Obrigatório
    flow_data: Joi.object({
      nodes: Joi.array().default([]),
      edges: Joi.array().default([]),
      viewport: Joi.object({
        x: Joi.number().default(0),
        y: Joi.number().default(0),
        zoom: Joi.number().default(1)
      }).default()
    }).default(),
    trigger_keywords: Joi.array().items(Joi.string()).default([]),
    trigger_conditions: Joi.object().default(),
    priority: Joi.number().integer().min(0).default(0),
    is_active: Joi.boolean().default(true),
    is_default: Joi.boolean().default(false)
  }),

  updateFlow: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().max(500).allow(''),
    flow_data: Joi.object({
      nodes: Joi.array(),
      edges: Joi.array(),
      viewport: Joi.object({
        x: Joi.number(),
        y: Joi.number(),
        zoom: Joi.number()
      })
    }),
    trigger_keywords: Joi.array().items(Joi.string()),
    trigger_conditions: Joi.object(),
    priority: Joi.number().integer().min(0),
    is_active: Joi.boolean(),
    is_default: Joi.boolean()
  }),

  // Parâmetros
  idParam: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // Query parameters
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().default('created_at'),
    order: Joi.string().valid('ASC', 'DESC').default('DESC')
  }),

  dateRange: Joi.object({
    start_date: Joi.date().iso(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')),
    timezone: Joi.string().default('America/Sao_Paulo')
  })
};

module.exports = {
  validate,
  validateParams,
  validateQuery,
  schemas
};

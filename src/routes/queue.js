const express = require('express');
const { Conversation, Bot } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateParams, validateQuery, validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Status de todas as filas
router.get('/status', async (req, res) => {
  try {
    if (!global.queueService) {
      return res.status(503).json({
        error: 'Serviço de filas não disponível',
        code: 'QUEUE_SERVICE_UNAVAILABLE'
      });
    }

    const status = global.queueService.getAllQueuesStatus();
    res.json({ queues: status });
  } catch (error) {
    console.error('Erro ao buscar status das filas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Status de uma fila específica
router.get('/:department/status', async (req, res) => {
  try {
    if (!global.queueService) {
      return res.status(503).json({
        error: 'Serviço de filas não disponível',
        code: 'QUEUE_SERVICE_UNAVAILABLE'
      });
    }

    const status = global.queueService.getQueueStatus(req.params.department);
    
    if (!status) {
      return res.status(404).json({
        error: 'Fila não encontrada',
        code: 'QUEUE_NOT_FOUND'
      });
    }

    res.json(status);
  } catch (error) {
    console.error('Erro ao buscar status da fila:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Adicionar conversa à fila
router.post('/add', async (req, res) => {
  try {
    const { conversation_id, department = 'general', priority = 0, metadata = {} } = req.body;

    if (!conversation_id) {
      return res.status(400).json({
        error: 'conversation_id é obrigatório',
        code: 'CONVERSATION_ID_REQUIRED'
      });
    }

    if (!global.queueService) {
      return res.status(503).json({
        error: 'Serviço de filas não disponível',
        code: 'QUEUE_SERVICE_UNAVAILABLE'
      });
    }

    // Verificar se a conversa pertence ao usuário
    const conversation = await Conversation.findOne({
      where: { id: conversation_id },
      include: [{
        model: Bot,
        as: 'bot',
        where: { user_id: req.user.id }
      }]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    const queueItem = await global.queueService.addToQueue(
      conversation_id,
      department,
      priority,
      metadata
    );

    if (!queueItem) {
      return res.status(400).json({
        error: 'Não foi possível adicionar à fila (fora do horário de funcionamento)',
        code: 'OUT_OF_BUSINESS_HOURS'
      });
    }

    res.status(201).json({
      message: 'Conversa adicionada à fila com sucesso',
      queue_item: queueItem,
      queue_status: global.queueService.getQueueStatus(department)
    });
  } catch (error) {
    console.error('Erro ao adicionar à fila:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atribuir conversa a agente
router.post('/assign', async (req, res) => {
  try {
    const { conversation_id, agent_id, department } = req.body;

    if (!conversation_id || !agent_id || !department) {
      return res.status(400).json({
        error: 'conversation_id, agent_id e department são obrigatórios',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (!global.queueService) {
      return res.status(503).json({
        error: 'Serviço de filas não disponível',
        code: 'QUEUE_SERVICE_UNAVAILABLE'
      });
    }

    // Verificar se a conversa pertence ao usuário
    const conversation = await Conversation.findOne({
      where: { id: conversation_id },
      include: [{
        model: Bot,
        as: 'bot',
        where: { user_id: req.user.id }
      }]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    const assignment = await global.queueService.assignToAgent(
      conversation_id,
      agent_id,
      department
    );

    res.json({
      message: 'Conversa atribuída ao agente com sucesso',
      assignment,
      queue_status: global.queueService.getQueueStatus(department)
    });
  } catch (error) {
    console.error('Erro ao atribuir agente:', error);
    
    if (error.message.includes('não encontrado') || error.message.includes('não está disponível')) {
      return res.status(400).json({
        error: error.message,
        code: 'ASSIGNMENT_ERROR'
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Liberar conversa do agente
router.post('/release', async (req, res) => {
  try {
    const { conversation_id, reason = 'completed' } = req.body;

    if (!conversation_id) {
      return res.status(400).json({
        error: 'conversation_id é obrigatório',
        code: 'CONVERSATION_ID_REQUIRED'
      });
    }

    if (!global.queueService) {
      return res.status(503).json({
        error: 'Serviço de filas não disponível',
        code: 'QUEUE_SERVICE_UNAVAILABLE'
      });
    }

    // Verificar se a conversa pertence ao usuário
    const conversation = await Conversation.findOne({
      where: { id: conversation_id },
      include: [{
        model: Bot,
        as: 'bot',
        where: { user_id: req.user.id }
      }]
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    await global.queueService.releaseFromAgent(conversation_id, reason);

    res.json({
      message: 'Conversa liberada do agente com sucesso'
    });
  } catch (error) {
    console.error('Erro ao liberar conversa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Registrar agente
router.post('/agents/register', async (req, res) => {
  try {
    const agentData = {
      id: req.body.id || `agent_${Date.now()}`,
      name: req.body.name,
      email: req.body.email,
      departments: req.body.departments || ['general'],
      max_concurrent: req.body.max_concurrent || 3,
      skills: req.body.skills || []
    };

    if (!agentData.name || !agentData.email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (!global.queueService) {
      return res.status(503).json({
        error: 'Serviço de filas não disponível',
        code: 'QUEUE_SERVICE_UNAVAILABLE'
      });
    }

    const agent = global.queueService.registerAgent(agentData);

    res.status(201).json({
      message: 'Agente registrado com sucesso',
      agent
    });
  } catch (error) {
    console.error('Erro ao registrar agente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Desregistrar agente
router.delete('/agents/:agentId', async (req, res) => {
  try {
    if (!global.queueService) {
      return res.status(503).json({
        error: 'Serviço de filas não disponível',
        code: 'QUEUE_SERVICE_UNAVAILABLE'
      });
    }

    global.queueService.unregisterAgent(req.params.agentId);

    res.json({
      message: 'Agente desregistrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desregistrar agente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Listar agentes
router.get('/agents', async (req, res) => {
  try {
    if (!global.queueService) {
      return res.status(503).json({
        error: 'Serviço de filas não disponível',
        code: 'QUEUE_SERVICE_UNAVAILABLE'
      });
    }

    const agents = global.queueService.getAllAgentsStatus();
    res.json({ agents });
  } catch (error) {
    console.error('Erro ao listar agentes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Status de um agente específico
router.get('/agents/:agentId', async (req, res) => {
  try {
    if (!global.queueService) {
      return res.status(503).json({
        error: 'Serviço de filas não disponível',
        code: 'QUEUE_SERVICE_UNAVAILABLE'
      });
    }

    const agent = global.queueService.getAgentStatus(req.params.agentId);
    
    if (!agent) {
      return res.status(404).json({
        error: 'Agente não encontrado',
        code: 'AGENT_NOT_FOUND'
      });
    }

    res.json(agent);
  } catch (error) {
    console.error('Erro ao buscar status do agente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

const express = require('express');
const { Bot, Flow } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateParams, validateQuery, validate, schemas } = require('../middleware/validation');
const FlowTemplateService = require('../services/FlowTemplateService');

const router = express.Router();
const templateService = new FlowTemplateService();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar todos os templates
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let templates;
    
    if (search) {
      templates = templateService.searchTemplates(search);
    } else if (category) {
      templates = templateService.getTemplatesByCategory(category);
    } else {
      templates = templateService.getAllTemplates();
    }

    res.json({
      templates,
      categories: templateService.getCategories(),
      tags: templateService.getAllTags(),
      total: templates.length
    });
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Buscar template por ID
router.get('/:id', async (req, res) => {
  try {
    const template = templateService.getTemplateById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        error: 'Template não encontrado',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }

    res.json(template);
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Criar fluxo a partir de template
router.post('/:id/create-flow', async (req, res) => {
  try {
    const { bot_id, customizations = {} } = req.body;

    if (!bot_id) {
      return res.status(400).json({
        error: 'bot_id é obrigatório',
        code: 'BOT_ID_REQUIRED'
      });
    }

    // Verificar se o bot pertence ao usuário
    const bot = await Bot.findOne({
      where: { id: bot_id, user_id: req.user.id }
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        code: 'BOT_NOT_FOUND'
      });
    }

    // Criar fluxo a partir do template
    const flowData = templateService.createFlowFromTemplate(req.params.id, customizations);
    
    // Adicionar bot_id
    flowData.bot_id = bot_id;

    // Criar fluxo no banco
    const flow = await Flow.create(flowData);

    res.status(201).json({
      message: 'Fluxo criado a partir do template com sucesso',
      flow,
      template_id: req.params.id
    });
  } catch (error) {
    console.error('Erro ao criar fluxo a partir do template:', error);
    
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        error: error.message,
        code: 'TEMPLATE_NOT_FOUND'
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Preview do template (sem salvar)
router.post('/:id/preview', async (req, res) => {
  try {
    const { customizations = {} } = req.body;

    const flowData = templateService.createFlowFromTemplate(req.params.id, customizations);

    res.json({
      preview: flowData,
      template_id: req.params.id
    });
  } catch (error) {
    console.error('Erro ao gerar preview do template:', error);
    
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        error: error.message,
        code: 'TEMPLATE_NOT_FOUND'
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Listar categorias
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = templateService.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Listar tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = templateService.getAllTags();
    res.json({ tags });
  } catch (error) {
    console.error('Erro ao listar tags:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Estatísticas de uso dos templates
router.get('/meta/stats', async (req, res) => {
  try {
    // Contar fluxos criados a partir de templates
    const templateStats = {};
    
    const flows = await Flow.findAll({
      where: { 
        template_id: { [require('sequelize').Op.not]: null }
      },
      attributes: ['template_id'],
      include: [{
        model: Bot,
        as: 'bot',
        where: { user_id: req.user.id },
        attributes: []
      }]
    });

    flows.forEach(flow => {
      const templateId = flow.template_id;
      if (!templateStats[templateId]) {
        templateStats[templateId] = 0;
      }
      templateStats[templateId]++;
    });

    // Adicionar informações dos templates
    const statsWithTemplateInfo = Object.keys(templateStats).map(templateId => {
      const template = templateService.getTemplateById(templateId);
      return {
        template_id: templateId,
        template_name: template?.name || 'Template não encontrado',
        usage_count: templateStats[templateId]
      };
    });

    res.json({
      total_templates: templateService.getAllTemplates().length,
      used_templates: Object.keys(templateStats).length,
      total_flows_from_templates: flows.length,
      usage_by_template: statsWithTemplateInfo
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

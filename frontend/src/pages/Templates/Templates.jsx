import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton
} from '@mui/material'
import {
  Add as AddIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  Store as StoreIcon,
  Business as BusinessIcon,
  Support as SupportIcon,
  SmartToy as AIIcon,
  QuestionAnswer as QAIcon,
  Restaurant as RestaurantIcon,
  FitnessCenter as FitnessIcon,
  Dashboard as TemplateIcon
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import { flowsAPI, botsAPI } from '../../services/api'
import FlowBuilder from '../../components/FlowBuilder/FlowBuilder'

// Templates categorizados por tipo de negócio
const TEMPLATE_CATEGORIES = [
  {
    id: 'atendimento',
    name: 'Atendimento ao Cliente',
    icon: <SupportIcon />,
    description: 'Templates para atendimento, suporte e FAQ'
  },
  {
    id: 'vendas',
    name: 'Vendas & Marketing',
    icon: <StoreIcon />,
    description: 'Captação de leads, vendas e marketing'
  },
  {
    id: 'negocios',
    name: 'Tipos de Negócio',
    icon: <BusinessIcon />,
    description: 'Templates específicos para diferentes segmentos'
  }
]

const FLOW_TEMPLATES = [
  // CATEGORIA: ATENDIMENTO
  {
    id: 'basic_support',
    name: 'Atendimento Básico',
    description: 'Fluxo simples com menu de opções e transferência para humano',
    category: 'atendimento',
    tags: ['básico', 'suporte', 'menu'],
    icon: '🎧',
    difficulty: 'Iniciante',
    estimatedTime: '5 min',
    preview: {
      steps: ['Boas-vindas', 'Menu de opções', 'Informações', 'Transferir para humano'],
      messages: 3,
      interactions: 2
    },
    blocks: [
      { type: 'welcome', content: '👋 Olá! Bem-vindo ao nosso atendimento!\n\nComo posso ajudá-lo hoje?' },
      { 
        type: 'menu', 
        content: 'Escolha uma das opções:',
        options: [
          { id: '1', text: 'Informações sobre produtos' },
          { id: '2', text: 'Suporte técnico' },
          { id: '3', text: 'Falar com atendente' }
        ]
      },
      { type: 'human_transfer', content: '👨‍💼 Transferindo para nosso atendente...\n\nAguarde um momento!' }
    ]
  },
  {
    id: 'ai_support',
    name: 'Suporte com IA',
    description: 'Atendimento inteligente que usa IA para responder dúvidas',
    category: 'atendimento',
    tags: ['IA', 'inteligente', 'automático'],
    icon: '🤖',
    difficulty: 'Intermediário',
    estimatedTime: '8 min',
    preview: {
      steps: ['Boas-vindas', 'Resposta com IA', 'Escalação humana'],
      messages: 2,
      interactions: 1
    },
    blocks: [
      { type: 'welcome', content: '🤖 Olá! Sou seu assistente inteligente!\n\nFaça sua pergunta que tentarei responder.' },
      { 
        type: 'ai_response', 
        prompt: 'Você é um assistente de atendimento prestativo e educado. Responda perguntas sobre produtos, serviços e suporte técnico de forma clara e objetiva. Se não souber algo, seja honesto e ofereça para transferir para um humano.' 
      },
      { type: 'human_transfer', content: 'Precisa de mais ajuda? Vou transferir para um atendente humano!' }
    ]
  },
  {
    id: 'faq_complete',
    name: 'FAQ Completo',
    description: 'Central de perguntas frequentes com categorias organizadas',
    category: 'atendimento',
    tags: ['FAQ', 'perguntas', 'categorias'],
    icon: '❓',
    difficulty: 'Avançado',
    estimatedTime: '15 min',
    preview: {
      steps: ['Menu principal', 'Categorias FAQ', 'Respostas detalhadas', 'Voltar ao menu'],
      messages: 8,
      interactions: 4
    },
    blocks: [
      { type: 'welcome', content: '❓ Central de Perguntas Frequentes\n\nEscolha uma categoria:' },
      { 
        type: 'menu', 
        content: 'Qual sua dúvida?',
        options: [
          { id: '1', text: '⏰ Horário de funcionamento' },
          { id: '2', text: '💳 Formas de pagamento' },
          { id: '3', text: '🚚 Entrega e frete' },
          { id: '4', text: '🔄 Trocas e devoluções' },
          { id: '5', text: '👨‍💼 Falar com atendente' }
        ]
      }
    ]
  },

  // CATEGORIA: VENDAS
  {
    id: 'lead_capture',
    name: 'Captura de Leads',
    description: 'Qualifica e captura informações de leads interessados',
    category: 'vendas',
    tags: ['leads', 'qualificação', 'vendas'],
    icon: '🎯',
    difficulty: 'Iniciante',
    estimatedTime: '7 min',
    preview: {
      steps: ['Boas-vindas', 'Capturar nome', 'Capturar contato', 'Qualificar interesse'],
      messages: 4,
      interactions: 3
    },
    blocks: [
      { type: 'welcome', content: '🎯 Olá! Que bom ter você aqui!\n\nVamos conhecer você melhor?' },
      { type: 'question', content: '😊 Qual é o seu nome?', variable: 'lead_name' },
      { type: 'question', content: 'Ótimo, {{lead_name}}! Qual seu WhatsApp para contato?', variable: 'lead_phone' },
      { type: 'question', content: 'Em que podemos ajudá-lo? Conte-nos sobre seu interesse!', variable: 'lead_interest' },
      { type: 'message', content: 'Perfeito! Suas informações foram registradas.\n\nEm breve um especialista entrará em contato! 🚀' }
    ]
  },
  {
    id: 'product_catalog',
    name: 'Catálogo de Produtos',
    description: 'Apresenta produtos com opções de compra e informações',
    category: 'vendas',
    tags: ['produtos', 'catálogo', 'compra'],
    icon: '🛍️',
    difficulty: 'Intermediário',
    estimatedTime: '12 min',
    preview: {
      steps: ['Menu de categorias', 'Mostrar produtos', 'Detalhes', 'Processo de compra'],
      messages: 6,
      interactions: 3
    },
    blocks: [
      { type: 'welcome', content: '🛍️ Bem-vindo à nossa loja!\n\nConfira nossos produtos:' },
      { 
        type: 'menu', 
        content: 'Qual categoria te interessa?',
        options: [
          { id: '1', text: '👕 Roupas' },
          { id: '2', text: '👟 Calçados' },
          { id: '3', text: '🎒 Acessórios' },
          { id: '4', text: '💬 Falar com vendedor' }
        ]
      }
    ]
  },

  // CATEGORIA: NEGÓCIOS ESPECÍFICOS
  {
    id: 'restaurant_orders',
    name: 'Pedidos Restaurante',
    description: 'Sistema completo para pedidos de comida com cardápio',
    category: 'negocios',
    tags: ['restaurante', 'pedidos', 'cardápio'],
    icon: '🍕',
    difficulty: 'Avançado',
    estimatedTime: '20 min',
    preview: {
      steps: ['Cardápio', 'Escolher itens', 'Dados entrega', 'Confirmar pedido'],
      messages: 10,
      interactions: 5
    },
    blocks: [
      { type: 'welcome', content: '🍕 Bem-vindo ao nosso restaurante!\n\nVamos fazer seu pedido?' },
      { 
        type: 'menu', 
        content: 'Nosso cardápio:',
        options: [
          { id: '1', text: '🍕 Pizzas' },
          { id: '2', text: '🍔 Hambúrgueres' },
          { id: '3', text: '🥗 Saladas' },
          { id: '4', text: '🥤 Bebidas' }
        ]
      }
    ]
  },
  {
    id: 'appointment_booking',
    name: 'Agendamento de Consultas',
    description: 'Sistema para agendar horários e consultas',
    category: 'negocios',
    tags: ['agendamento', 'consulta', 'horário'],
    icon: '📅',
    difficulty: 'Intermediário',
    estimatedTime: '15 min',
    preview: {
      steps: ['Escolher serviço', 'Data disponível', 'Horário', 'Dados pessoais', 'Confirmar'],
      messages: 7,
      interactions: 4
    },
    blocks: [
      { type: 'welcome', content: '📅 Sistema de Agendamento\n\nVamos agendar seu atendimento?' },
      { 
        type: 'menu', 
        content: 'Qual serviço deseja agendar?',
        options: [
          { id: '1', text: '👨‍⚕️ Consulta médica' },
          { id: '2', text: '💄 Estética' },
          { id: '3', text: '✂️ Cabelo' },
          { id: '4', text: '📞 Outros' }
        ]
      }
    ]
  },
  {
    id: 'fitness_registration',
    name: 'Academia - Matrícula',
    description: 'Fluxo para matrícula e informações sobre academia',
    category: 'negocios',
    tags: ['academia', 'fitness', 'matrícula'],
    icon: '💪',
    difficulty: 'Intermediário',
    estimatedTime: '12 min',
    preview: {
      steps: ['Info planos', 'Dados pessoais', 'Avaliação física', 'Matrícula'],
      messages: 6,
      interactions: 3
    },
    blocks: [
      { type: 'welcome', content: '💪 Bem-vindo à nossa academia!\n\nVamos começar sua jornada fitness?' },
      { 
        type: 'menu', 
        content: 'O que você gostaria de saber?',
        options: [
          { id: '1', text: '💰 Planos e preços' },
          { id: '2', text: '🏋️ Modalidades' },
          { id: '3', text: '📝 Fazer matrícula' },
          { id: '4', text: '📍 Localização' }
        ]
      }
    ]
  }
]

const Templates = () => {
  const [selectedCategory, setSelectedCategory] = useState('atendimento')
  const [searchTerm, setSearchTerm] = useState('')
  const [previewDialog, setPreviewDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [useTemplateDialog, setUseTemplateDialog] = useState(false)
  const [flowBuilderOpen, setFlowBuilderOpen] = useState(false)
  const [bots, setBots] = useState([])
  const [selectedBot, setSelectedBot] = useState('')
  const [customizations, setCustomizations] = useState({
    name: '',
    description: '',
    businessName: '',
    businessType: ''
  })

  useEffect(() => {
    loadBots()
  }, [])

  const loadBots = async () => {
    try {
      const response = await botsAPI.getAll()
      setBots(response.data.bots || response.data || [])
    } catch (error) {
      console.error('Erro ao carregar bots:', error)
    }
  }

  const filteredTemplates = FLOW_TEMPLATES.filter(template => {
    const matchesCategory = template.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const handlePreview = (template) => {
    setSelectedTemplate(template)
    setPreviewDialog(true)
  }

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template)
    setCustomizations({
      name: template.name,
      description: template.description,
      businessName: '',
      businessType: ''
    })
    setUseTemplateDialog(true)
  }

  const createFlowFromTemplate = async () => {
    if (!selectedBot) {
      toast.error('Selecione um bot')
      return
    }

    if (!customizations.name.trim()) {
      toast.error('Nome do fluxo é obrigatório')
      return
    }

    try {
      // Personalizar template com dados do usuário
      const personalizedBlocks = selectedTemplate.blocks.map(block => {
        let content = block.content || ''
        
        // Substituir placeholders
        if (customizations.businessName) {
          content = content.replace(/nosso atendimento|nossa loja|nosso restaurante|nossa academia/g, 
                                   customizations.businessName)
        }
        
        return { ...block, content }
      })

      // Converter para formato de fluxo
      const flowData = convertBlocksToFlow(personalizedBlocks)
      
      const payload = {
        name: customizations.name,
        description: customizations.description,
        bot_id: selectedBot,
        flow_data: flowData,
        trigger_keywords: selectedTemplate.tags,
        is_active: true,
        is_default: false,
        template_id: selectedTemplate.id
      }

      await flowsAPI.create(payload)
      
      toast.success('Fluxo criado com sucesso!')
      setUseTemplateDialog(false)
      
    } catch (error) {
      console.error('Erro ao criar fluxo:', error)
      toast.error('Erro ao criar fluxo: ' + (error.response?.data?.error || error.message))
    }
  }

  // Função auxiliar para converter blocos em fluxo (simplificada)
  const convertBlocksToFlow = (blocks) => {
    const nodes = []
    const edges = []

    // Nó de início
    nodes.push({
      id: 'start',
      type: 'start', 
      position: { x: 100, y: 100 },
      next: blocks.length > 0 ? 'block_0' : null
    })

    // Converter blocos
    blocks.forEach((block, index) => {
      const nodeId = `block_${index}`
      const nextId = index < blocks.length - 1 ? `block_${index + 1}` : 'end'
      const yPos = 200 + (index * 150)

      switch (block.type) {
        case 'welcome':
        case 'message':
          nodes.push({
            id: nodeId,
            type: 'message',
            position: { x: 100, y: yPos },
            content: block.content,
            next: nextId
          })
          break

        case 'question':
          nodes.push({
            id: nodeId,
            type: 'message',
            position: { x: 100, y: yPos },
            content: block.content,
            next: `${nodeId}_input`
          })
          nodes.push({
            id: `${nodeId}_input`,
            type: 'input',
            position: { x: 100, y: yPos + 50 },
            variable: block.variable,
            next: nextId
          })
          break

        case 'menu':
          nodes.push({
            id: nodeId,
            type: 'message',
            position: { x: 100, y: yPos },
            content: `${block.content}\n\n${block.options?.map(opt => `${opt.id}️⃣ ${opt.text}`).join('\n')}`,
            next: nextId
          })
          break

        case 'ai_response':
          nodes.push({
            id: nodeId,
            type: 'ai_response',
            position: { x: 100, y: yPos },
            data: {
              system_prompt: block.prompt,
              temperature: 0.7,
              max_tokens: 500
            },
            next: nextId
          })
          break

        case 'human_transfer':
          nodes.push({
            id: nodeId,
            type: 'message',
            position: { x: 100, y: yPos },
            content: block.content,
            next: `${nodeId}_transfer`
          })
          nodes.push({
            id: `${nodeId}_transfer`,
            type: 'action',
            position: { x: 100, y: yPos + 50 },
            action: 'transfer_to_human',
            next: 'end'
          })
          break
      }
    })

    // Nó final
    nodes.push({
      id: 'end',
      type: 'message',
      position: { x: 100, y: 200 + (blocks.length * 150) },
      content: 'Obrigado por usar nosso atendimento! 😊',
      next: null
    })

    return { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return 'success'
      case 'Intermediário': return 'warning' 
      case 'Avançado': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          📚 Galeria de Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFlowBuilderOpen(true)}
        >
          Criar do Zero
        </Button>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Escolha um template pronto para seu tipo de negócio e personalize conforme sua necessidade.
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Tabs 
              value={selectedCategory} 
              onChange={(e, value) => setSelectedCategory(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {TEMPLATE_CATEGORIES.map((category) => (
                <Tab
                  key={category.id}
                  value={category.id}
                  label={category.name}
                  icon={category.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Grid de Templates */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h4">{template.icon}</Typography>
                  <Box>
                    <Typography variant="h6" component="h3">
                      {template.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip 
                        label={template.difficulty}
                        size="small"
                        color={getDifficultyColor(template.difficulty)}
                      />
                      <Chip 
                        label={template.estimatedTime}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {template.preview.messages} mensagens • {template.preview.interactions} interações
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {template.tags.slice(0, 3).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                  {template.tags.length > 3 && (
                    <Chip label={`+${template.tags.length - 3}`} size="small" variant="outlined" />
                  )}
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<PreviewIcon />}
                  onClick={() => handlePreview(template)}
                >
                  Visualizar
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleUseTemplate(template)}
                >
                  Usar Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTemplates.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum template encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tente mudar a categoria ou termo de busca
          </Typography>
        </Box>
      )}

      {/* Dialog de Preview */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate?.icon} Preview: {selectedTemplate?.name}
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedTemplate.description}
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Dificuldade:</strong> {selectedTemplate.difficulty} • 
                <strong> Tempo estimado:</strong> {selectedTemplate.estimatedTime}
              </Alert>

              <Typography variant="h6" gutterBottom>
                Fluxo do Template:
              </Typography>

              <List>
                {selectedTemplate.preview.steps.map((step, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Chip label={index + 1} size="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedTemplate.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>
            Fechar
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setPreviewDialog(false)
              handleUseTemplate(selectedTemplate)
            }}
          >
            Usar Este Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Personalização */}
      <Dialog open={useTemplateDialog} onClose={() => setUseTemplateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Personalizar Template: {selectedTemplate?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Selecionar Bot</InputLabel>
              <Select
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value)}
                required
              >
                {bots.map((bot) => (
                  <MenuItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Nome do Fluxo"
              value={customizations.name}
              onChange={(e) => setCustomizations(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Descrição"
              value={customizations.description}
              onChange={(e) => setCustomizations(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Nome do seu Negócio"
              value={customizations.businessName}
              onChange={(e) => setCustomizations(prev => ({ ...prev, businessName: e.target.value }))}
              helperText="Será usado para personalizar as mensagens"
              sx={{ mb: 2 }}
            />

            <Alert severity="info">
              <Typography variant="body2">
                Este template será personalizado com suas informações e criado como um novo fluxo.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUseTemplateDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={createFlowFromTemplate}
            disabled={!selectedBot || !customizations.name.trim()}
          >
            Criar Fluxo
          </Button>
        </DialogActions>
      </Dialog>

      {/* FlowBuilder para criar do zero */}
      <FlowBuilder
        open={flowBuilderOpen}
        onClose={() => setFlowBuilderOpen(false)}
        selectedBot={selectedBot}
        onFlowCreated={() => {
          setFlowBuilderOpen(false)
          toast.success('Fluxo criado com sucesso!')
        }}
      />
    </Box>
  )
}

export default Templates

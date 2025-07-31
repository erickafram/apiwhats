import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Paper
} from '@mui/material'
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  AccountTree as FlowIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  SmartToy as AIIcon,
  Message as MessageIcon,
  Input as InputIcon,
  CallSplit as ConditionIcon,
  Stop as EndIcon,
  Code as CodeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Send as SendIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { flowsAPI, botsAPI } from '../../services/api'
import CodeFlowCreator from '../../components/CodeFlowCreator'

const Flows = () => {
  const [flows, setFlows] = useState([])
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBot, setSelectedBot] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    bot_id: '',
    trigger_keywords: [],
    is_active: true,
    is_default: false
  })
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedFlow, setSelectedFlow] = useState(null)

  // Estados para criação com IA
  const [aiCreateDialogOpen, setAiCreateDialogOpen] = useState(false)
  const [aiDescription, setAiDescription] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [generatedFlow, setGeneratedFlow] = useState(null)
  const [aiStep, setAiStep] = useState('input') // 'input', 'generating', 'preview'

  const navigate = useNavigate()

  useEffect(() => {
    loadFlows()
    loadBots()
  }, [selectedBot])

  const loadFlows = async () => {
    try {
      const params = selectedBot !== 'all' ? { bot_id: selectedBot } : {}
      const response = await flowsAPI.getAll(params)
      setFlows(response.data.flows || response.data || [])
    } catch (error) {
      console.error('Erro ao carregar fluxos:', error)
      toast.error('Erro ao carregar fluxos')
    } finally {
      setLoading(false)
    }
  }

  const loadBots = async () => {
    try {
      const response = await botsAPI.getAll()
      setBots(response.data.bots || response.data || [])
    } catch (error) {
      console.error('Erro ao carregar bots:', error)
    }
  }

  const handleCreateFlow = async () => {
    try {
      if (!newFlow.name || !newFlow.bot_id) {
        toast.error('Nome e Bot são obrigatórios')
        return
      }

      await flowsAPI.create(newFlow)
      toast.success('Fluxo criado com sucesso!')
      setCreateDialogOpen(false)
      setNewFlow({
        name: '',
        description: '',
        bot_id: '',
        trigger_keywords: [],
        is_active: true,
        is_default: false
      })
      loadFlows()
    } catch (error) {
      console.error('Erro ao criar fluxo:', error)
      toast.error('Erro ao criar fluxo')
    }
  }

  const handleToggleFlow = async (flow) => {
    try {
      if (flow.is_active) {
        await flowsAPI.deactivate(flow.id)
        toast.success('Fluxo desativado!')
      } else {
        await flowsAPI.activate(flow.id)
        toast.success('Fluxo ativado!')
      }
      loadFlows()
    } catch (error) {
      console.error('Erro ao alterar status do fluxo:', error)
      toast.error('Erro ao alterar status do fluxo')
    }
  }

  const handleSetDefault = async (flow) => {
    try {
      await flowsAPI.setDefault(flow.id)
      toast.success('Fluxo definido como padrão!')
      loadFlows()
    } catch (error) {
      console.error('Erro ao definir fluxo padrão:', error)
      toast.error('Erro ao definir fluxo padrão')
    }
  }

  const handleDuplicateFlow = async (flow) => {
    try {
      await flowsAPI.duplicate(flow.id)
      toast.success('Fluxo duplicado com sucesso!')
      loadFlows()
    } catch (error) {
      console.error('Erro ao duplicar fluxo:', error)
      toast.error('Erro ao duplicar fluxo')
    }
  }

  const handleDeleteFlow = async (flow) => {
    if (window.confirm(`Tem certeza que deseja excluir o fluxo "${flow.name}"?`)) {
      try {
        await flowsAPI.delete(flow.id)
        toast.success('Fluxo excluído com sucesso!')
        loadFlows()
      } catch (error) {
        console.error('Erro ao excluir fluxo:', error)
        toast.error('Erro ao excluir fluxo')
      }
    }
  }

  const handleMenuClick = (event, flow) => {
    setAnchorEl(event.currentTarget)
    setSelectedFlow(flow)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedFlow(null)
  }

  // Funções para criação com IA
  const generateFlowWithAI = async () => {
    if (!aiDescription.trim()) {
      toast.error('Por favor, descreva o fluxo que deseja criar')
      return
    }

    setAiGenerating(true)
    setAiStep('generating')

    try {
      console.log('🤖 Gerando fluxo com IA:', aiDescription)

      // Determinar o bot_id para a geração
      let botId = null
      if (selectedBot !== 'all') {
        botId = parseInt(selectedBot)
      } else if (bots.length > 0) {
        botId = bots[0].id
      }

      const response = await fetch('/api/flows/generate-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          description: aiDescription,
          bot_id: botId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar fluxo com IA')
      }

      const data = await response.json()
      console.log('🤖 Fluxo gerado:', data)

      setGeneratedFlow(data.flow)
      setAiStep('preview')
      toast.success('Fluxo gerado com sucesso pela IA!')

    } catch (error) {
      console.error('🤖 Erro ao gerar fluxo com IA:', error)
      toast.error('Erro ao gerar fluxo: ' + error.message)
      setAiStep('input')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSaveAIFlow = async () => {
    if (!generatedFlow) {
      toast.error('Nenhum fluxo foi gerado para salvar')
      return
    }

    try {
      console.log('💾 Salvando fluxo gerado pela IA:', generatedFlow)

      // Determinar o bot_id correto
      let botId = null

      if (selectedBot !== 'all') {
        // Se um bot específico foi selecionado, usar ele
        botId = parseInt(selectedBot)
      } else if (bots.length > 0) {
        // Se não há bot selecionado, usar o primeiro bot do usuário
        botId = bots[0].id
      }

      if (!botId) {
        toast.error('É necessário ter pelo menos um bot para criar fluxos. Crie um bot primeiro.')
        return
      }

      const flowToSave = {
        ...generatedFlow,
        bot_id: botId
      }

      console.log('💾 Dados do fluxo a salvar:', flowToSave)

      const response = await flowsAPI.create(flowToSave)
      console.log('💾 Fluxo salvo com sucesso:', response.data)

      toast.success('Fluxo criado e salvo com sucesso!')

      // Resetar estado
      resetAIDialog()

      // Recarregar lista de fluxos
      await loadFlows()

      // Navegar para o editor do fluxo criado
      navigate(`/flows/${response.data.flow.id}/edit`)

    } catch (error) {
      console.error('💾 Erro ao salvar fluxo:', error)
      toast.error('Erro ao salvar fluxo: ' + (error.response?.data?.error || error.message))
    }
  }

  const resetAIDialog = () => {
    setAiCreateDialogOpen(false)
    setAiDescription('')
    setGeneratedFlow(null)
    setAiStep('input')
    setAiGenerating(false)
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  const handleFlowCreated = () => {
    loadFlows()
    setCurrentTab(0) // Voltar para a aba de listagem
  }

  const getStatusColor = (flow) => {
    if (flow.is_active) return 'success'
    return 'default'
  }

  const getStatusText = (flow) => {
    if (flow.is_active) return 'Ativo'
    return 'Inativo'
  }

  const getBotName = (botId) => {
    const bot = bots.find(b => b.id === botId)
    return bot ? bot.name : 'Bot não encontrado'
  }

  const getNodeIcon = (nodeType) => {
    switch (nodeType) {
      case 'ai': return <AIIcon />
      case 'message': return <MessageIcon />
      case 'input': return <InputIcon />
      case 'condition': return <ConditionIcon />
      case 'end': return <EndIcon />
      default: return <FlowIcon />
    }
  }

  const renderFlowNodes = (flow) => {
    const nodes = flow.flow_data?.nodes || []
    if (nodes.length === 0) return null

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">
            Ver Estrutura ({nodes.length} nós)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {nodes.slice(0, 5).map((node, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {getNodeIcon(node.type)}
                </ListItemIcon>
                <ListItemText
                  primary={node.id}
                  secondary={node.type}
                />
              </ListItem>
            ))}
            {nodes.length > 5 && (
              <ListItem>
                <ListItemText
                  primary={`... e mais ${nodes.length - 5} nós`}
                  sx={{ fontStyle: 'italic' }}
                />
              </ListItem>
            )}
          </List>
        </AccordionDetails>
      </Accordion>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fluxos Conversacionais
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setAiCreateDialogOpen(true)}
            sx={{
              background: 'linear-gradient(45deg, #e91e63 30%, #f06292 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #c2185b 30%, #e91e63 90%)',
              }
            }}
          >
            Criar com IA
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Novo Fluxo
          </Button>
        </Box>
      </Box>

      {/* Abas */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Meus Fluxos" icon={<FlowIcon />} />
          <Tab label="Criar por Código" icon={<CodeIcon />} />
        </Tabs>
      </Paper>

      {/* Conteúdo das Abas */}
      {currentTab === 0 && (
        <>
          {/* Filtro por Bot */}
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Bot</InputLabel>
              <Select
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value)}
                label="Filtrar por Bot"
              >
                <MenuItem value="all">Todos os Bots</MenuItem>
                {bots.map((bot) => (
                  <MenuItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

      {flows.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <FlowIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nenhum fluxo encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedBot !== 'all'
                ? 'Este bot não possui fluxos configurados.'
                : 'Crie seu primeiro fluxo conversacional para automatizar o atendimento.'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Criar Primeiro Fluxo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {flows.map((flow) => (
            <Grid item xs={12} md={6} lg={4} key={flow.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {flow.name}
                        {flow.is_default && (
                          <StarIcon sx={{ ml: 1, color: 'warning.main', fontSize: 20 }} />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Bot: {getBotName(flow.bot_id)}
                      </Typography>
                      {flow.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {flow.description}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, flow)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={getStatusText(flow)}
                      color={getStatusColor(flow)}
                      size="small"
                    />
                    {flow.is_default && (
                      <Chip label="Padrão" color="warning" size="small" />
                    )}
                    {flow.trigger_keywords && flow.trigger_keywords.length > 0 && (
                      <Chip
                        label={`${flow.trigger_keywords.length} palavras-chave`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {flow.trigger_keywords && flow.trigger_keywords.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Palavras-chave:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        {flow.trigger_keywords.slice(0, 3).map((keyword, index) => (
                          <Chip
                            key={index}
                            label={keyword}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                        {flow.trigger_keywords.length > 3 && (
                          <Chip
                            label={`+${flow.trigger_keywords.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {renderFlowNodes(flow)}

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Criado em: {new Date(flow.created_at).toLocaleDateString('pt-BR')}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Tooltip title={flow.is_active ? 'Desativar' : 'Ativar'}>
                    <IconButton
                      onClick={() => handleToggleFlow(flow)}
                      color={flow.is_active ? 'error' : 'success'}
                    >
                      {flow.is_active ? <StopIcon /> : <PlayIcon />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Visualizar">
                    <IconButton
                      onClick={() => navigate(`/flows/${flow.id}`)}
                      color="info"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => navigate(`/flows/${flow.id}/edit`)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  {!flow.is_default && (
                    <Tooltip title="Definir como padrão">
                      <IconButton
                        onClick={() => handleSetDefault(flow)}
                        color="warning"
                      >
                        <StarBorderIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
        </>
      )}

      {/* Aba de Criação por Código */}
      {currentTab === 1 && (
        <CodeFlowCreator
          bots={bots}
          onFlowCreated={handleFlowCreated}
        />
      )}

      {/* Menu de contexto */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/flows/${selectedFlow?.id}`)
          handleMenuClose()
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          Visualizar
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/flows/${selectedFlow?.id}/edit`)
          handleMenuClose()
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => {
          handleDuplicateFlow(selectedFlow)
          handleMenuClose()
        }}>
          <CopyIcon sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        {!selectedFlow?.is_default && (
          <MenuItem onClick={() => {
            handleSetDefault(selectedFlow)
            handleMenuClose()
          }}>
            <StarIcon sx={{ mr: 1 }} />
            Definir como Padrão
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleDeleteFlow(selectedFlow)
            handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialog de criação */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Novo Fluxo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Fluxo"
            fullWidth
            variant="outlined"
            value={newFlow.name}
            onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newFlow.description}
            onChange={(e) => setNewFlow({ ...newFlow, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Bot</InputLabel>
            <Select
              value={newFlow.bot_id}
              onChange={(e) => setNewFlow({ ...newFlow, bot_id: e.target.value })}
              label="Bot"
            >
              {bots.map((bot) => (
                <MenuItem key={bot.id} value={bot.id}>
                  {bot.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Palavras-chave (separadas por vírgula)"
            fullWidth
            variant="outlined"
            placeholder="oi, olá, menu, ajuda"
            onChange={(e) => {
              const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k)
              setNewFlow({ ...newFlow, trigger_keywords: keywords })
            }}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={newFlow.is_active}
                onChange={(e) => setNewFlow({ ...newFlow, is_active: e.target.checked })}
              />
            }
            label="Ativar fluxo"
          />

          <FormControlLabel
            control={
              <Switch
                checked={newFlow.is_default}
                onChange={(e) => setNewFlow({ ...newFlow, is_default: e.target.checked })}
              />
            }
            label="Definir como fluxo padrão"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateFlow} variant="contained">
            Criar Fluxo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de criação com IA */}
      <Dialog
        open={aiCreateDialogOpen}
        onClose={resetAIDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(45deg, #e91e63 30%, #f06292 90%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <AutoAwesomeIcon />
          Criar Fluxo com Inteligência Artificial
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {aiStep === 'input' && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                🤖 Descreva o fluxo que você quer criar
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                Seja específico sobre o que o bot deve fazer. Exemplo: "Criar um fluxo de atendimento para uma pizzaria com opções de cardápio, pedidos e entrega"
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                label="Descreva seu fluxo..."
                placeholder="Ex: Quero um fluxo para atendimento de uma loja de roupas. O bot deve cumprimentar o cliente, mostrar categorias (masculino, feminino, infantil), permitir consulta de produtos, informar preços e horário de funcionamento, e no final dar opção de falar com atendente humano."
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'white'
                  }
                }}
              />
            </Box>
          )}

          {aiStep === 'generating' && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ color: '#e91e63', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                🧠 IA está criando seu fluxo...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analisando sua descrição e gerando o fluxo conversacional
              </Typography>
            </Box>
          )}

          {aiStep === 'preview' && generatedFlow && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                ✨ Fluxo gerado com sucesso!
              </Typography>

              <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
                <Typography variant="body2">
                  <strong>📋 {generatedFlow.name}</strong><br />
                  {generatedFlow.description}
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {generatedFlow.trigger_keywords?.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                🔗 Estrutura do Fluxo: {generatedFlow.flow_data?.nodes?.length || 0} nós criados
              </Typography>

              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                <Typography variant="body2">
                  💡 Você pode editar este fluxo após salvá-lo usando o editor visual ou por código.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={resetAIDialog} color="inherit">
            Cancelar
          </Button>

          {aiStep === 'input' && (
            <Button
              onClick={generateFlowWithAI}
              variant="contained"
              disabled={!aiDescription.trim() || aiGenerating}
              startIcon={<SendIcon />}
              sx={{
                background: 'linear-gradient(45deg, #e91e63 30%, #f06292 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #c2185b 30%, #e91e63 90%)',
                }
              }}
            >
              Gerar com IA
            </Button>
          )}

          {aiStep === 'preview' && (
            <>
              <Button
                onClick={() => setAiStep('input')}
                variant="outlined"
                startIcon={<EditIcon />}
              >
                Editar Descrição
              </Button>
              <Button
                onClick={handleSaveAIFlow}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                  }
                }}
              >
                Criar Fluxo
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Flows

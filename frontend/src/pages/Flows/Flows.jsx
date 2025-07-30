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
  Code as CodeIcon
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Novo Fluxo
        </Button>
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
    </Box>
  )
}

export default Flows

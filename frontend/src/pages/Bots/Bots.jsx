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
  MenuItem
} from '@mui/material'
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  SmartToy as BotIcon,
  WhatsApp as WhatsAppIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { botsAPI } from '../../services/api'
import QRCodeDialog from '../../components/Common/QRCodeDialog'

const Bots = () => {
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newBot, setNewBot] = useState({
    name: '',
    description: '',
    ai_config: {
      enabled: true,
      temperature: 0.7,
      max_tokens: 1000,
      system_prompt: 'Você é um assistente virtual útil e amigável.'
    }
  })
  const [creating, setCreating] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedBot, setSelectedBot] = useState(null)
  const [qrCodeDialog, setQrCodeDialog] = useState({ open: false, qrCode: null, botName: '' })
  const navigate = useNavigate()

  useEffect(() => {
    loadBots()
  }, [])

  const loadBots = async () => {
    try {
      setLoading(true)
      const response = await botsAPI.getAll()
      setBots(response.data.bots || [])
    } catch (error) {
      console.error('Erro ao carregar bots:', error)
      toast.error('Erro ao carregar bots')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBot = async () => {
    try {
      setCreating(true)
      const response = await botsAPI.create(newBot)
      toast.success('Bot criado com sucesso!')
      setCreateDialogOpen(false)
      setNewBot({
        name: '',
        description: '',
        ai_config: {
          enabled: true,
          temperature: 0.7,
          max_tokens: 1000,
          system_prompt: 'Você é um assistente virtual útil e amigável.'
        }
      })
      loadBots()
    } catch (error) {
      console.error('Erro ao criar bot:', error)
      toast.error(error.response?.data?.error || 'Erro ao criar bot')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleBot = async (bot) => {
    try {
      await botsAPI.update(bot.id, { is_active: !bot.is_active })
      toast.success(`Bot ${!bot.is_active ? 'ativado' : 'desativado'} com sucesso!`)
      loadBots()
    } catch (error) {
      console.error('Erro ao alterar status do bot:', error)
      toast.error('Erro ao alterar status do bot')
    }
  }

  const handleConnectBot = async (bot) => {
    try {
      const response = await botsAPI.connect(bot.id)
      toast.success('Processo de conexão iniciado!')
      if (response.data.qrCode) {
        setQrCodeDialog({
          open: true,
          qrCode: response.data.qrCode,
          botName: bot.name
        })
      }
      loadBots()
    } catch (error) {
      console.error('Erro ao conectar bot:', error)
      toast.error(error.response?.data?.error || 'Erro ao conectar bot')
    }
  }

  const handleDeleteBot = async (bot) => {
    if (window.confirm(`Tem certeza que deseja deletar o bot "${bot.name}"?`)) {
      try {
        await botsAPI.delete(bot.id)
        toast.success('Bot deletado com sucesso!')
        loadBots()
      } catch (error) {
        console.error('Erro ao deletar bot:', error)
        toast.error(error.response?.data?.error || 'Erro ao deletar bot')
      }
    }
  }

  const handleMenuClick = (event, bot) => {
    setAnchorEl(event.currentTarget)
    setSelectedBot(bot)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedBot(null)
  }

  const getStatusColor = (bot) => {
    if (bot.is_connected) return 'success'
    if (bot.is_active) return 'warning'
    return 'default'
  }

  const getStatusText = (bot) => {
    if (bot.is_connected) return 'Conectado'
    if (bot.is_active) return 'Ativo'
    return 'Inativo'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Meus Bots
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Novo Bot
        </Button>
      </Box>

      {bots.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <BotIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nenhum bot encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crie seu primeiro bot para começar a automatizar conversas no WhatsApp
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Criar Primeiro Bot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {bots.map((bot) => (
            <Grid item xs={12} md={6} lg={4} key={bot.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {bot.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {bot.description || 'Sem descrição'}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, bot)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={getStatusText(bot)}
                      color={getStatusColor(bot)}
                      size="small"
                    />
                    {bot.ai_config?.enabled && (
                      <Chip label="IA Ativa" color="info" size="small" />
                    )}
                    {bot.phone_number && (
                      <Chip label={bot.phone_number} size="small" />
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Criado em: {new Date(bot.created_at).toLocaleDateString('pt-BR')}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Tooltip title={bot.is_active ? 'Desativar' : 'Ativar'}>
                    <IconButton
                      onClick={() => handleToggleBot(bot)}
                      color={bot.is_active ? 'error' : 'success'}
                    >
                      {bot.is_active ? <StopIcon /> : <PlayIcon />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Conectar WhatsApp">
                    <IconButton
                      onClick={() => handleConnectBot(bot)}
                      color="success"
                      disabled={!bot.is_active}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Configurações">
                    <IconButton
                      onClick={() => navigate(`/bots/${bot.id}`)}
                      color="primary"
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Analytics">
                    <IconButton
                      onClick={() => navigate(`/analytics/bots/${bot.id}`)}
                      color="info"
                    >
                      <AnalyticsIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menu de contexto */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/bots/${selectedBot?.id}`)
          handleMenuClose()
        }}>
          <SettingsIcon sx={{ mr: 1 }} />
          Configurações
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/flows?bot_id=${selectedBot?.id}`)
          handleMenuClose()
        }}>
          Gerenciar Fluxos
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/conversations?bot_id=${selectedBot?.id}`)
          handleMenuClose()
        }}>
          Ver Conversas
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteBot(selectedBot)
            handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Deletar
        </MenuItem>
      </Menu>

      {/* Dialog de criação de bot */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Criar Novo Bot</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nome do Bot"
              value={newBot.name}
              onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
              margin="normal"
              required
              helperText="Nome que identificará seu bot (2-100 caracteres)"
            />

            <TextField
              fullWidth
              label="Descrição"
              value={newBot.description}
              onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              helperText="Descrição opcional do seu bot (até 500 caracteres)"
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Configurações de IA
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={newBot.ai_config.enabled}
                  onChange={(e) => setNewBot({
                    ...newBot,
                    ai_config: { ...newBot.ai_config, enabled: e.target.checked }
                  })}
                />
              }
              label="Habilitar IA"
              sx={{ mb: 2 }}
            />

            {newBot.ai_config.enabled && (
              <>
                <TextField
                  fullWidth
                  label="Temperature"
                  type="number"
                  value={newBot.ai_config.temperature}
                  onChange={(e) => setNewBot({
                    ...newBot,
                    ai_config: { ...newBot.ai_config, temperature: parseFloat(e.target.value) }
                  })}
                  margin="normal"
                  inputProps={{ min: 0, max: 2, step: 0.1 }}
                  helperText="Controla a criatividade das respostas (0.0 = conservador, 2.0 = criativo)"
                />

                <TextField
                  fullWidth
                  label="Máximo de Tokens"
                  type="number"
                  value={newBot.ai_config.max_tokens}
                  onChange={(e) => setNewBot({
                    ...newBot,
                    ai_config: { ...newBot.ai_config, max_tokens: parseInt(e.target.value) }
                  })}
                  margin="normal"
                  inputProps={{ min: 1, max: 4000 }}
                  helperText="Tamanho máximo das respostas (1-4000 tokens)"
                />

                <TextField
                  fullWidth
                  label="Prompt do Sistema"
                  value={newBot.ai_config.system_prompt}
                  onChange={(e) => setNewBot({
                    ...newBot,
                    ai_config: { ...newBot.ai_config, system_prompt: e.target.value }
                  })}
                  margin="normal"
                  multiline
                  rows={4}
                  helperText="Instruções que definem o comportamento e personalidade do bot"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateBot}
            variant="contained"
            disabled={creating || !newBot.name.trim()}
            startIcon={creating ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {creating ? 'Criando...' : 'Criar Bot'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog QR Code */}
      <QRCodeDialog
        open={qrCodeDialog.open}
        onClose={() => setQrCodeDialog({ open: false, qrCode: null, botName: '' })}
        qrCode={qrCodeDialog.qrCode}
        botName={qrCodeDialog.botName}
      />
    </Box>
  )
}

export default Bots

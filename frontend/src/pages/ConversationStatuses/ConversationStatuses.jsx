import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  DragIndicator,
  Visibility,
  VisibilityOff,
  Settings,
  Payment,
  CheckCircle,
  Schedule,
  FiberNew,
  TaskAlt,
  Warning
} from '@mui/icons-material'
import { conversationStatusesAPI } from '../../services/api'
import toast from 'react-hot-toast'

// Ícones disponíveis para os status
const availableIcons = {
  'FiberNew': { icon: FiberNew, name: 'Novo' },
  'Schedule': { icon: Schedule, name: 'Em Andamento' },
  'Payment': { icon: Payment, name: 'Pagamento' },
  'CheckCircle': { icon: CheckCircle, name: 'Sucesso' },
  'TaskAlt': { icon: TaskAlt, name: 'Concluído' },
  'Cancel': { icon: Cancel, name: 'Cancelado' },
  'Warning': { icon: Warning, name: 'Atenção' },
  'Settings': { icon: Settings, name: 'Configuração' }
}

const ConversationStatuses = () => {
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusToDelete, setStatusToDelete] = useState(null)

  // Campos do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#2196f3',
    icon: 'FiberNew',
    is_final: false
  })

  const loadStatuses = async () => {
    try {
      setLoading(true)
      const response = await conversationStatusesAPI.getAll()
      setStatuses(response.data.statuses || [])
    } catch (error) {
      console.error('Erro ao carregar status:', error)
      toast.error('Erro ao carregar status')
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingStatus(null)
    setFormData({
      name: '',
      description: '',
      color: '#2196f3',
      icon: 'FiberNew',
      is_final: false
    })
    setDialogOpen(true)
  }

  const openEditDialog = (status) => {
    setEditingStatus(status)
    setFormData({
      name: status.name,
      description: status.description || '',
      color: status.color,
      icon: status.icon || 'FiberNew',
      is_final: status.is_final
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingStatus(null)
    setFormData({
      name: '',
      description: '',
      color: '#2196f3',
      icon: 'FiberNew',
      is_final: false
    })
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    try {
      if (editingStatus) {
        await conversationStatusesAPI.update(editingStatus.id, formData)
        toast.success('Status atualizado com sucesso!')
      } else {
        await conversationStatusesAPI.create(formData)
        toast.success('Status criado com sucesso!')
      }
      
      closeDialog()
      loadStatuses()
    } catch (error) {
      console.error('Erro ao salvar status:', error)
      if (error.response?.status === 409) {
        toast.error('Já existe um status com este nome')
      } else {
        toast.error('Erro ao salvar status')
      }
    }
  }

  const handleDelete = async () => {
    if (!statusToDelete) return

    try {
      await conversationStatusesAPI.delete(statusToDelete.id)
      toast.success('Status deletado com sucesso!')
      setDeleteDialogOpen(false)
      setStatusToDelete(null)
      loadStatuses()
    } catch (error) {
      console.error('Erro ao deletar status:', error)
      if (error.response?.status === 409) {
        toast.error('Não é possível deletar este status pois existem conversas usando-o')
      } else {
        toast.error('Erro ao deletar status')
      }
    }
  }

  const openDeleteDialog = (status) => {
    setStatusToDelete(status)
    setDeleteDialogOpen(true)
  }

  const toggleStatusActive = async (status) => {
    try {
      await conversationStatusesAPI.update(status.id, {
        is_active: !status.is_active
      })
      loadStatuses()
      toast.success(`Status ${status.is_active ? 'desativado' : 'ativado'} com sucesso!`)
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status')
    }
  }

  const createDefaultStatuses = async () => {
    try {
      await conversationStatusesAPI.createDefaults()
      toast.success('Status padrão criados com sucesso!')
      loadStatuses()
    } catch (error) {
      console.error('Erro ao criar status padrão:', error)
      if (error.response?.status === 409) {
        toast.error('Já existem status customizados para esta conta')
      } else {
        toast.error('Erro ao criar status padrão')
      }
    }
  }

  const getIconComponent = (iconName) => {
    const iconData = availableIcons[iconName] || availableIcons['FiberNew']
    const IconComponent = iconData.icon
    return <IconComponent />
  }

  useEffect(() => {
    loadStatuses()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Carregando status...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          🏷️ Status de Conversas
        </Typography>
        <Stack direction="row" spacing={2}>
          {statuses.length === 0 && (
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={createDefaultStatuses}
            >
              Criar Status Padrão
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreateDialog}
          >
            Novo Status
          </Button>
        </Stack>
      </Box>

      {statuses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Settings sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum status customizado criado
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Crie status personalizados para organizar melhor suas conversas
          </Typography>
          <Button
            variant="contained"
            startIcon={<Settings />}
            onClick={createDefaultStatuses}
            sx={{ mr: 2 }}
          >
            Criar Status Padrão
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={openCreateDialog}
          >
            Criar Primeiro Status
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {statuses.map((status) => (
            <Grid item xs={12} md={6} lg={4} key={status.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  opacity: status.is_active ? 1 : 0.6,
                  border: status.is_final ? '2px solid #4caf50' : 'none'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ bgcolor: status.color, width: 40, height: 40 }}>
                        {getIconComponent(status.icon)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {status.name}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={status.is_active ? 'Ativo' : 'Inativo'}
                            color={status.is_active ? 'success' : 'default'}
                            size="small"
                          />
                          {status.is_final && (
                            <Chip 
                              label="Final"
                              color="success"
                              size="small"
                            />
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  </Box>

                  {status.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {status.description}
                    </Typography>
                  )}

                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Cor: {status.color} • Ordem: {status.order_index}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions>
                  <Tooltip title={status.is_active ? "Desativar" : "Ativar"}>
                    <IconButton
                      onClick={() => toggleStatusActive(status)}
                      color={status.is_active ? "default" : "success"}
                    >
                      {status.is_active ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => openEditDialog(status)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Deletar">
                    <IconButton
                      onClick={() => openDeleteDialog(status)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para criar/editar status */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingStatus ? 'Editar Status' : 'Novo Status'}
        </DialogTitle>
        
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Nome do Status"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Descrição (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              margin="normal"
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Cor"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Ícone</InputLabel>
                  <Select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    label="Ícone"
                  >
                    {Object.entries(availableIcons).map(([key, iconData]) => (
                      <MenuItem key={key} value={key}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <iconData.icon />
                          {iconData.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_final}
                  onChange={(e) => setFormData({ ...formData, is_final: e.target.checked })}
                />
              }
              label="Status Final (marca conversa como concluída)"
              sx={{ mt: 2 }}
            />

            {formData.is_final && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Status finais marcam automaticamente a conversa como "completed" quando aplicados.
              </Alert>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            {editingStatus ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de delete */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar o status "{statusToDelete?.name}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita. Se existirem conversas usando este status, a exclusão será bloqueada.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ConversationStatuses

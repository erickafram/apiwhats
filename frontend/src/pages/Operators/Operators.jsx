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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Fab,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material'
import {
  Person,
  Add,
  Edit,
  Delete,
  MoreVert,
  PersonAdd,
  Security,
  Chat,
  AdminPanelSettings,
  Support
} from '@mui/icons-material'
import { operatorsAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth.jsx'
import toast from 'react-hot-toast'

const Operators = () => {
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOperator, setEditingOperator] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    operator_name: ''
  })
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedOperator, setSelectedOperator] = useState(null)
  const { user } = useAuth()

  const loadOperators = async () => {
    try {
      setLoading(true)
      const response = await operatorsAPI.getAll()
      setOperators(response.data.operators || [])
    } catch (error) {
      console.error('Erro ao carregar operadores:', error)
      toast.error('Erro ao carregar operadores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast.error('Nome e email são obrigatórios')
        return
      }

      if (!editingOperator && !formData.password) {
        toast.error('Senha é obrigatória para novos operadores')
        return
      }

      if (editingOperator) {
        // Atualizar operador
        await operatorsAPI.update(editingOperator.id, {
          name: formData.name,
          operator_name: formData.operator_name || formData.name,
          is_active: formData.is_active
        })
        toast.success('Operador atualizado com sucesso!')
      } else {
        // Criar novo operador
        await operatorsAPI.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          operator_name: formData.operator_name || formData.name
        })
        toast.success('Operador criado com sucesso!')
      }

      setDialogOpen(false)
      setEditingOperator(null)
      setFormData({ name: '', email: '', password: '', operator_name: '' })
      loadOperators()
    } catch (error) {
      console.error('Erro ao salvar operador:', error)
      toast.error('Erro ao salvar operador')
    }
  }

  const handleEdit = (operator) => {
    setEditingOperator(operator)
    setFormData({
      name: operator.name,
      email: operator.email,
      password: '',
      operator_name: operator.operator_name || '',
      is_active: operator.is_active
    })
    setDialogOpen(true)
    setMenuAnchor(null)
  }

  const handleDelete = async (operator) => {
    if (window.confirm(`Tem certeza que deseja remover o operador ${operator.name}?`)) {
      try {
        await operatorsAPI.delete(operator.id)
        toast.success('Operador removido com sucesso!')
        loadOperators()
      } catch (error) {
        console.error('Erro ao remover operador:', error)
        if (error.response?.data?.code === 'HAS_ACTIVE_CONVERSATIONS') {
          toast.error('Não é possível remover operador com conversas ativas')
        } else {
          toast.error('Erro ao remover operador')
        }
      }
    }
    setMenuAnchor(null)
  }

  const handleToggleActive = async (operator) => {
    try {
      await operatorsAPI.update(operator.id, {
        is_active: !operator.is_active
      })
      toast.success(`Operador ${!operator.is_active ? 'ativado' : 'desativado'} com sucesso!`)
      loadOperators()
    } catch (error) {
      console.error('Erro ao alterar status do operador:', error)
      toast.error('Erro ao alterar status do operador')
    }
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default'
  }

  const getStatusText = (isActive) => {
    return isActive ? 'Ativo' : 'Inativo'
  }

  const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'Nunca'
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  useEffect(() => {
    loadOperators()
  }, [])

  // Verificar se o usuário pode gerenciar operadores
  const canManageOperators = user?.role === 'admin' || (user?.role === 'user' && !user?.parent_user_id)

  if (!canManageOperators) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Security sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Acesso Negado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Você não tem permissão para gerenciar operadores
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Carregando operadores...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            👥 Gerenciar Operadores
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie os operadores da sua conta
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => {
            setEditingOperator(null)
            setFormData({ name: '', email: '', password: '', operator_name: '' })
            setDialogOpen(true)
          }}
        >
          Novo Operador
        </Button>
      </Box>

      {operators.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Support sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum operador cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crie operadores para gerenciar conversas de forma distribuída
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Operador</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Conversas Ativas</TableCell>
                <TableCell>Último Acesso</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {operators.map((operator) => (
                <TableRow key={operator.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {operator.operator_name || operator.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {operator.name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{operator.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(operator.is_active)}
                      color={getStatusColor(operator.is_active)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chat sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {operator.stats?.active_conversations || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatLastLogin(operator.last_login)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={operator.is_active}
                          onChange={() => handleToggleActive(operator)}
                          size="small"
                        />
                      }
                      label=""
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setSelectedOperator(operator)
                        setMenuAnchor(e.currentTarget)
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Menu de ações */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleEdit(selectedOperator)}>
          <Edit sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedOperator)}>
          <Delete sx={{ mr: 1 }} />
          Remover
        </MenuItem>
      </Menu>

      {/* Dialog para criar/editar operador */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingOperator ? 'Editar Operador' : 'Novo Operador'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nome Completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Nome do Operador"
              value={formData.operator_name}
              onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
              margin="normal"
              helperText="Nome de exibição para identificação (opcional)"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
              disabled={!!editingOperator}
            />
            {!editingOperator && (
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
                helperText="Mínimo 6 caracteres"
              />
            )}
            {editingOperator && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Operador Ativo"
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingOperator ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Operators

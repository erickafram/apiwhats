import React, { useState, useEffect, useRef } from 'react'
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
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
  AppBar,
  Toolbar,
  Snackbar,
  Menu,
  MenuItem,
  Fab,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  Chat,
  Person,
  Schedule,
  PriorityHigh,
  Send,
  Refresh,
  Phone,
  WhatsApp,
  Support,
  Close,
  MoreVert,
  Notifications,
  CheckCircle,
  Warning,
  SwapHoriz,
  PersonAdd,
  History
} from '@mui/icons-material'
import { conversationsAPI } from '../../services/api'
import { useConversations } from '../../hooks/useConversations.jsx'
import toast from 'react-hot-toast'

// Adicionar estilos CSS para animação
const pulseAnimation = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`

const Conversations = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [lastConversationCount, setLastConversationCount] = useState(0)
  const [newConversationAlert, setNewConversationAlert] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [availableOperators, setAvailableOperators] = useState([])
  const [selectedOperator, setSelectedOperator] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [auditData, setAuditData] = useState(null)

  // Usar o hook global de conversas
  const { refreshConversations, transferredCount: globalTransferredCount, unattendedCount: globalUnattendedCount } = useConversations()

  // Função para scroll automático
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      })
    } else if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }

  const loadConversations = async () => {
    try {
      setLoading(true)
      // Buscar conversas transferidas, ativas (com operador) e completadas
      const [transferredResponse, activeResponse, completedResponse] = await Promise.all([
        conversationsAPI.getAll({
          status: 'transferred',
          sort: 'priority',
          order: 'DESC',
          limit: 50
        }),
        conversationsAPI.getAll({
          status: 'active',
          sort: 'updated_at',
          order: 'DESC',
          limit: 50
        }),
        conversationsAPI.getAll({
          status: 'completed',
          sort: 'updated_at',
          order: 'DESC',
          limit: 100 // Aumentar para mostrar mais conversas completadas
        })
      ])
      
      const response = {
        data: {
          conversations: [
            ...transferredResponse.data.conversations,
            ...activeResponse.data.conversations.filter(conv => 
              conv.metadata?.operator_assigned // Apenas conversas com operador
            ),
            ...completedResponse.data.conversations
          ]
        }
      }
      // Remover duplicatas (caso uma conversa apareça em múltiplas consultas)
      const uniqueConversations = response.data.conversations.reduce((acc, conv) => {
        const existing = acc.find(c => c.id === conv.id)
        if (!existing) {
          acc.push(conv)
        }
        return acc
      }, [])
      
      // Ordenar por prioridade e status: transferidas primeiro, depois ativas, depois completadas
      const sortedConversations = uniqueConversations.sort((a, b) => {
        // Prioridade por status
        const statusPriority = { 'transferred': 3, 'active': 2, 'completed': 1 }
        const statusDiff = (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0)
        
        if (statusDiff !== 0) return statusDiff
        
        // Dentro do mesmo status, ordenar por prioridade e depois por atualização
        if (a.priority !== b.priority) {
          return (b.priority || 0) - (a.priority || 0)
        }
        
        return new Date(b.updated_at) - new Date(a.updated_at)
      })
      
      const transferredConvs = sortedConversations.filter(conv => conv.status === 'transferred')
      
      // Detectar novas conversas
      if (lastConversationCount > 0 && transferredConvs.length > lastConversationCount) {
        setNewConversationAlert(true)
        // Som de notificação (se o navegador permitir)
        try {
          const audio = new Audio('./notification.wav') // Som simples
          audio.volume = 0.3
          audio.load() // Carregar explicitamente
          audio.play().catch(err => {
            console.warn('Não foi possível tocar o som de notificação:', err)
          })
        } catch (e) {
          console.warn('Erro ao criar áudio de notificação:', e)
        }
      }
      
      setLastConversationCount(transferredConvs.length)
      setConversations(sortedConversations)
      
      // Mostrar alerta se há conversas não atendidas
      if (globalUnattendedCount > 0 && !alertOpen) {
        setAlertOpen(true)
      }
      
      // Refresh global state
      refreshConversations()
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId, isInitialLoad = false) => {
    try {
      const response = await conversationsAPI.getMessages(conversationId)
      const newMessages = response.data.messages || []
      
      // Detectar se há novas mensagens
      const hasNewMessages = newMessages.length > lastMessageCount
      
      setMessages(newMessages)
      setLastMessageCount(newMessages.length)
      
      // Rolar para baixo após carregar mensagens
      setTimeout(() => {
        scrollToBottom(!isInitialLoad) // Scroll instantâneo no primeiro carregamento
      }, 100)
      
      // Se há novas mensagens e não é o carregamento inicial, fazer scroll suave
      if (hasNewMessages && !isInitialLoad) {
        setTimeout(() => {
          scrollToBottom(true)
        }, 200)
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const takeOverConversation = async (conversation) => {
    try {
      // Usar nova rota de atribuição de operador
      await conversationsAPI.assignOperator(conversation.id)
      
      setSelectedConversation(conversation)
      setDialogOpen(true)
      setLastMessageCount(0) // Reset contador para novo chat
      loadMessages(conversation.id, true) // true = carregamento inicial
      loadConversations() // Refresh list
    } catch (error) {
      console.error('Erro ao assumir conversa:', error)
      // Fallback para método antigo se a nova API não existir
      try {
        await conversationsAPI.update(conversation.id, {
          status: 'active',
          metadata: {
            ...conversation.metadata,
            operator_assigned: true,
            operator_assigned_at: new Date(),
            awaiting_human: false
          }
        })
        setSelectedConversation(conversation)
        setDialogOpen(true)
        setLastMessageCount(0)
        loadMessages(conversation.id, true)
        loadConversations()
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError)
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    try {
      setSending(true)
      await conversationsAPI.sendMessage(selectedConversation.id, {
        content: newMessage,
        message_type: 'text'
      })
      setNewMessage('')
      await loadMessages(selectedConversation.id)
      
      // Rolar para baixo após enviar mensagem
      setTimeout(() => {
        scrollToBottom(true)
      }, 200)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
    }
  }

  const endConversation = async () => {
    if (!selectedConversation) return
    
    try {
      await conversationsAPI.update(selectedConversation.id, {
        status: 'completed',
        metadata: {
          ...selectedConversation.metadata,
          completed_by_operator: true,
          completed_at: new Date()
        }
      })
      setDialogOpen(false)
      setSelectedConversation(null)
      loadConversations()
    } catch (error) {
      console.error('Erro ao encerrar conversa:', error)
    }
  }

  const reopenConversation = async (conversation) => {
    try {
      await conversationsAPI.update(conversation.id, {
        status: 'active',
        metadata: {
          ...conversation.metadata,
          reopened_by_operator: true,
          reopened_at: new Date()
        }
      })
      setSelectedConversation(conversation)
      setDialogOpen(true)
      setLastMessageCount(0) // Reset contador para chat reaberto
      loadMessages(conversation.id, true) // true = carregamento inicial
      loadConversations()
    } catch (error) {
      console.error('Erro ao reabrir conversa:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'transferred': return 'warning'
      case 'active': return 'success'
      case 'waiting': return 'info'
      case 'completed': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'transferred': return 'Aguardando Operador'
      case 'active': return 'Ativo'
      case 'waiting': return 'Aguardando'
      case 'completed': return 'Finalizado'
      default: return status
    }
  }

  const loadAvailableOperators = async () => {
    try {
      const response = await conversationsAPI.getAvailableOperators()
      setAvailableOperators(response.data.operators || [])
    } catch (error) {
      console.error('Erro ao carregar operadores:', error)
    }
  }

  const openTransferDialog = () => {
    loadAvailableOperators()
    setTransferDialogOpen(true)
  }

  const transferToOperator = async () => {
    if (!selectedOperator || !selectedConversation) return
    
    try {
      await conversationsAPI.transferToOperator(selectedConversation.id, {
        target_operator_id: selectedOperator,
        message: transferReason
      })
      
      setTransferDialogOpen(false)
      setDialogOpen(false)
      setSelectedOperator('')
      setTransferReason('')
      loadConversations()
      
      toast.success('Conversa transferida com sucesso!')
    } catch (error) {
      console.error('Erro ao transferir conversa:', error)
      toast.error('Erro ao transferir conversa')
    }
  }

  const loadAuditTrail = async () => {
    if (!selectedConversation) return
    
    try {
      const response = await conversationsAPI.getAuditTrail(selectedConversation.id)
      setAuditData(response.data)
      setAuditDialogOpen(true)
    } catch (error) {
      console.error('Erro ao carregar histórico de auditoria:', error)
      if (error.response?.status === 403) {
        toast.error('Acesso negado. Apenas administradores podem ver o histórico completo.')
      } else {
        toast.error('Erro ao carregar histórico de auditoria')
      }
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  useEffect(() => {
    loadConversations()
    // Atualizar a cada 10 segundos para conversas, mas sem piscar
    const interval = setInterval(() => {
      if (!dialogOpen) { // Só atualiza se o chat não estiver aberto
        loadConversations()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [dialogOpen])

  // Auto-refresh para mensagens quando chat está aberto
  useEffect(() => {
    if (dialogOpen && selectedConversation) {
      const messageInterval = setInterval(() => {
        loadMessages(selectedConversation.id)
      }, 3000) // Atualiza mensagens a cada 3 segundos
      return () => clearInterval(messageInterval)
    }
  }, [dialogOpen, selectedConversation])

  // Scroll automático quando as mensagens mudarem
  useEffect(() => {
    if (messages.length > 0 && dialogOpen) {
      setTimeout(() => {
        scrollToBottom(true)
      }, 100)
    }
  }, [messages.length, dialogOpen])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Carregando conversas...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <style>{pulseAnimation}</style>
      {/* Alerta de conversas não atendidas */}
      <Snackbar
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity="warning" 
          onClose={() => setAlertOpen(false)}
          action={
            <Button color="inherit" size="small" onClick={() => setAlertOpen(false)}>
              OK
            </Button>
          }
        >
          🚨 {globalUnattendedCount} conversa(s) aguardando atendimento há mais de 5 minutos!
        </Alert>
      </Snackbar>

      {/* Alerta de nova conversa */}
      <Snackbar
        open={newConversationAlert}
        onClose={() => setNewConversationAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
      >
        <Alert 
          severity="info" 
          onClose={() => setNewConversationAlert(false)}
          action={
            <Button color="inherit" size="small" onClick={() => {
              setNewConversationAlert(false)
              loadConversations()
            }}>
              VER
            </Button>
          }
        >
          🔔 Nova conversa transferida para atendimento!
        </Alert>
      </Snackbar>

      {/* Botão flutuante de notificação */}
      {globalUnattendedCount > 0 && (
        <Fab
          color="warning"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            animation: 'pulse 2s infinite'
          }}
          onClick={() => setAlertOpen(true)}
        >
          <Badge badgeContent={globalUnattendedCount} color="error">
            <Notifications />
          </Badge>
        </Fab>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            💬 Central de Atendimento
          </Typography>
          {globalUnattendedCount > 0 && (
            <Chip
              icon={<Warning />}
              label={`${globalUnattendedCount} não atendida(s)`}
              color="warning"
              size="small"
              sx={{ animation: 'pulse 2s infinite' }}
            />
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadConversations}
          disabled={loading}
        >
          Atualizar
        </Button>
      </Box>

      {conversations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Support sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhuma conversa disponível
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aqui aparecerão todas as conversas: transferidas, ativas com operador e finalizadas
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {conversations.map((conversation) => (
            <Grid item xs={12} md={6} lg={4} key={conversation.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: conversation.priority > 0 ? '2px solid #f57c00' : 'none'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <WhatsApp />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {conversation.user_name || conversation.user_phone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {conversation.user_phone}
                        </Typography>
                      </Box>
                    </Box>
                    {conversation.priority > 0 && (
                      <Tooltip title="Alta Prioridade">
                        <PriorityHigh color="warning" />
                      </Tooltip>
                    )}
                  </Box>

                  <Chip 
                    label={getStatusText(conversation.status)}
                    color={getStatusColor(conversation.status)}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Bot:</strong> {conversation.bot?.name || 'N/A'}
                  </Typography>

                  {conversation.assigned_operator && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Operador:</strong> {conversation.assigned_operator.operator_name || conversation.assigned_operator.name}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Transferido em:</strong><br />
                    {formatTimestamp(conversation.metadata?.transfer_timestamp || conversation.updated_at)}
                  </Typography>

                  {conversation.metadata?.transfer_reason && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Motivo:</strong> {conversation.metadata.transfer_reason}
                    </Typography>
                  )}

                  {conversation.messages && conversation.messages.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Última mensagem:</strong>
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {conversation.messages[0].content}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  {conversation.status === 'transferred' ? (
                    <Button
                      variant="contained"
                      startIcon={<Chat />}
                      onClick={() => takeOverConversation(conversation)}
                      fullWidth
                      color={conversation.assigned_operator ? 'secondary' : 'primary'}
                    >
                      {conversation.assigned_operator ? 'Conversa Atribuída' : 'Assumir Conversa'}
                    </Button>
                  ) : conversation.status === 'completed' ? (
                    <Button
                      variant="outlined"
                      startIcon={<Chat />}
                      onClick={() => reopenConversation(conversation)}
                      fullWidth
                      color="success"
                    >
                      Reabrir Conversa
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Chat />}
                      onClick={() => takeOverConversation(conversation)}
                      fullWidth
                    >
                      Entrar na Conversa
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para chat */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle>
          {selectedConversation && (
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar>
                  <WhatsApp />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedConversation.user_name || selectedConversation.user_phone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <Chip 
                      label={getStatusText(selectedConversation.status)} 
                      color={getStatusColor(selectedConversation.status)} 
                      size="small" 
                    />
                    • {selectedConversation.bot?.name}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <IconButton
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                >
                  <MenuItem onClick={() => {
                    openTransferDialog()
                    setMenuAnchor(null)
                  }}>
                    <SwapHoriz sx={{ mr: 1 }} />
                    Transferir para Operador
                  </MenuItem>
                  <MenuItem onClick={() => {
                    loadAuditTrail()
                    setMenuAnchor(null)
                  }}>
                    <History sx={{ mr: 1 }} />
                    Ver Histórico de Transferências
                  </MenuItem>
                  <MenuItem onClick={() => {
                    endConversation()
                    setMenuAnchor(null)
                  }}>
                    <CheckCircle sx={{ mr: 1 }} />
                    Encerrar Conversa
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          )}
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box 
            ref={messagesContainerRef}
            sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}
          >
            {messages.length === 0 ? (
              <Alert severity="info">Carregando histórico da conversa...</Alert>
            ) : (
              <List>
                {messages.map((message, index) => (
                  <React.Fragment key={message.id}>
                    <ListItem
                      sx={{
                        justifyContent: message.direction === 'outgoing' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          bgcolor: message.direction === 'outgoing' ? 'primary.main' : 'grey.100',
                          color: message.direction === 'outgoing' ? 'white' : 'text.primary'
                        }}
                      >
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.8,
                            display: 'block',
                            textAlign: 'right',
                            mt: 1
                          }}
                        >
                          {formatTimestamp(message.timestamp)}
                        </Typography>
                      </Paper>
                    </ListItem>
                    {index < messages.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {/* Elemento para rolagem automática */}
                <div ref={messagesEndRef} />
              </List>
            )}
          </Box>

          <Stack direction="row" spacing={1} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              onFocus={() => {
                // Scroll suave quando o usuário focar no campo de texto
                setTimeout(() => scrollToBottom(true), 100)
              }}
            />
            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              size="large"
            >
              <Send />
            </IconButton>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)}
            color="inherit"
          >
            Fechar Chat
          </Button>
          <Button 
            onClick={endConversation}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
          >
            Encerrar Conversa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para transferir conversa para operador */}
      <Dialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <SwapHoriz color="primary" />
            <Typography variant="h6">
              Transferir Conversa para Operador
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box mt={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Selecionar Operador</InputLabel>
              <Select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                label="Selecionar Operador"
              >
                {availableOperators.map((operator) => (
                  <MenuItem key={operator.id} value={operator.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonAdd />
                      <Box>
                        <Typography variant="body1">{operator.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {operator.email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Motivo da Transferência (opcional)"
              placeholder="Ex: Cliente precisa de suporte técnico especializado"
              multiline
              rows={3}
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
            />
            
            {availableOperators.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Nenhum operador disponível para transferência no momento.
              </Alert>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setTransferDialogOpen(false)}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button 
            onClick={transferToOperator}
            variant="contained"
            disabled={!selectedOperator || availableOperators.length === 0}
            startIcon={<SwapHoriz />}
          >
            Transferir Conversa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para histórico de auditoria */}
      <Dialog
        open={auditDialogOpen}
        onClose={() => setAuditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <History color="primary" />
            <Typography variant="h6">
              Histórico de Transferências e Atribuições
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {auditData && (
            <Box>
              {/* Resumo */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 Resumo da Conversa
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">Cliente</Typography>
                      <Typography variant="body1">
                        {auditData.conversation.user_name || auditData.conversation.user_phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">Total de Atribuições</Typography>
                      <Typography variant="body1" color="primary">
                        {auditData.summary.total_assignments}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">Total de Transferências</Typography>
                      <Typography variant="body1" color="warning.main">
                        {auditData.summary.total_transfers}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">Operador Atual</Typography>
                      <Typography variant="body1">
                        {auditData.summary.current_operator || 'Nenhum'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Histórico de Atribuições */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                📋 Histórico de Atribuições
              </Typography>
              
              {auditData.assignment_history.length > 0 ? (
                <List>
                  {auditData.assignment_history.map((entry, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: entry.action.includes('transfer') ? 'warning.main' : 'success.main' 
                          }}>
                            {entry.action.includes('transfer') ? <SwapHoriz /> : <PersonAdd />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="body1">
                                {entry.action === 'assumed' && `${entry.operator_display_name} assumiu a conversa`}
                                {entry.action === 'assigned_by_admin' && `Atribuído para ${entry.operator_display_name} pelo admin`}
                                {entry.action === 'transferred_by_operator' && 
                                  `Transferido para ${entry.operator_display_name} por ${entry.assigned_by_display_name}`}
                              </Typography>
                              {entry.transfer_reason && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  <strong>Motivo:</strong> {entry.transfer_reason}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(entry.assigned_at)} • 
                              Por: {entry.assigned_by_display_name} ({entry.assigned_by_role})
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < auditData.assignment_history.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  Nenhuma atribuição registrada para esta conversa.
                </Alert>
              )}

              {/* Mensagens do Sistema */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                💬 Mensagens do Sistema
              </Typography>
              
              {auditData.audit_messages.length > 0 ? (
                <List>
                  {auditData.audit_messages.map((message, index) => (
                    <React.Fragment key={message.id}>
                      <ListItem>
                        <ListItemText
                          primary={message.content}
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(message.timestamp)} • 
                                Status: {message.status} • 
                                Tipo: {
                                  message.metadata?.welcome_message ? 'Boas-vindas' :
                                  message.metadata?.transfer_message ? 'Transferência' :
                                  message.metadata?.system_message ? 'Sistema' : 'Operador'
                                }
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < auditData.audit_messages.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  Nenhuma mensagem do sistema registrada.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setAuditDialogOpen(false)}
            color="inherit"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Conversations

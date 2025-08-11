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
  Fab
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
  Warning
} from '@mui/icons-material'
import { conversationsAPI } from '../../services/api'
import { useConversations } from '../../hooks/useConversations.jsx'

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
  const [messagesEndRef, setMessagesEndRef] = useState(null)
  const [lastConversationCount, setLastConversationCount] = useState(0)
  const [newConversationAlert, setNewConversationAlert] = useState(false)

  // Usar o hook global de conversas
  const { refreshConversations, transferredCount: globalTransferredCount, unattendedCount: globalUnattendedCount } = useConversations()

  const loadConversations = async () => {
    try {
      setLoading(true)
      // Buscar conversas transferidas e também as completadas recentemente
      const [transferredResponse, completedResponse] = await Promise.all([
        conversationsAPI.getAll({
          status: 'transferred',
          sort: 'priority',
          order: 'DESC',
          limit: 50
        }),
        conversationsAPI.getAll({
          status: 'completed',
          sort: 'updated_at',
          order: 'DESC',
          limit: 10
        })
      ])
      
      const response = {
        data: {
          conversations: [
            ...transferredResponse.data.conversations,
            ...completedResponse.data.conversations
          ]
        }
      }
      const convs = response.data.conversations
      const transferredConvs = convs.filter(conv => conv.status === 'transferred')
      
      // Detectar novas conversas
      if (lastConversationCount > 0 && transferredConvs.length > lastConversationCount) {
        setNewConversationAlert(true)
        // Som de notificação (se o navegador permitir)
        try {
          const audio = new Audio('/notification.wav') // Som simples
          audio.volume = 0.3
          audio.play()
        } catch (e) {
          // Ignorar se não conseguir tocar o som
        }
      }
      
      setLastConversationCount(transferredConvs.length)
      setConversations(convs)
      
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

  const loadMessages = async (conversationId) => {
    try {
      const response = await conversationsAPI.getMessages(conversationId)
      setMessages(response.data.messages || [])
      
      // Rolar para baixo após carregar mensagens
      setTimeout(() => {
        if (messagesEndRef) {
          messagesEndRef.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const takeOverConversation = async (conversation) => {
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
      loadMessages(conversation.id)
      loadConversations() // Refresh list
    } catch (error) {
      console.error('Erro ao assumir conversa:', error)
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
        if (messagesEndRef) {
          messagesEndRef.scrollIntoView({ behavior: 'smooth' })
        }
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
      loadMessages(conversation.id)
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
            Nenhuma conversa aguardando atendimento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            As conversas transferidas pelos bots aparecerão aqui
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
                      color={conversation.metadata?.operator_assigned ? 'secondary' : 'primary'}
                    >
                      {conversation.metadata?.operator_assigned ? 'Continuar Conversa' : 'Assumir Conversa'}
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
          <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
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
                <div ref={setMessagesEndRef} />
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
    </Box>
  )
}

export default Conversations

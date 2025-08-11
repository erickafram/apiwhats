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
  Tooltip
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
  Support
} from '@mui/icons-material'
import { conversationsAPI } from '../../services/api'

const Conversations = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await conversationsAPI.getAll({
        status: 'transferred',
        sort: 'priority',
        order: 'DESC',
        limit: 50
      })
      setConversations(response.data.conversations)
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
      loadMessages(selectedConversation.id)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
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
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadConversations, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Carregando conversas...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          💬 Central de Atendimento
        </Typography>
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
                  <Button
                    variant="contained"
                    startIcon={<Chat />}
                    onClick={() => takeOverConversation(conversation)}
                    fullWidth
                  >
                    Assumir Conversa
                  </Button>
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
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar>
                <WhatsApp />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {selectedConversation.user_name || selectedConversation.user_phone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Conversa assumida • {selectedConversation.bot?.name}
                </Typography>
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
          <Button onClick={() => setDialogOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Conversations

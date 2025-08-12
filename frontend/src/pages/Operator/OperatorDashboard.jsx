import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material'
import {
  Chat,
  Schedule,
  CheckCircle,
  Assignment,
  Notifications,
  WhatsApp
} from '@mui/icons-material'
import { conversationsAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useConversations } from '../../hooks/useConversations.jsx'

const OperatorDashboard = () => {
  const [myConversations, setMyConversations] = useState([])
  const [availableConversations, setAvailableConversations] = useState([])
  const [stats, setStats] = useState({
    active: 0,
    completed_today: 0,
    waiting: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { transferredCount } = useConversations()
  const navigate = useNavigate()

  const loadOperatorData = async () => {
    try {
      setLoading(true)
      
      // Buscar conversas do operador
      const [myConvsResponse, availableConvsResponse] = await Promise.all([
        conversationsAPI.getAll({ 
          assigned_operator_id: user.id,
          limit: 10,
          sort: 'updated_at',
          order: 'DESC'
        }),
        conversationsAPI.getAll({ 
          status: 'transferred',
          limit: 5,
          sort: 'priority',
          order: 'DESC'
        })
      ])

      const myConvs = myConvsResponse.data.conversations || []
      const availableConvs = availableConvsResponse.data.conversations || []

      setMyConversations(myConvs)
      setAvailableConversations(availableConvs.filter(conv => !conv.assigned_operator_id))

      // Calcular estatísticas
      const activeConvs = myConvs.filter(conv => conv.status === 'active').length
      const today = new Date().toDateString()
      const completedToday = myConvs.filter(conv => 
        conv.status === 'completed' && 
        new Date(conv.updated_at).toDateString() === today
      ).length

      setStats({
        active: activeConvs,
        completed_today: completedToday,
        waiting: availableConvs.length
      })

    } catch (error) {
      console.error('Erro ao carregar dados do operador:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'transferred': return 'warning'
      case 'active': return 'success'
      case 'completed': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'transferred': return 'Aguardando'
      case 'active': return 'Ativo'
      case 'completed': return 'Finalizado'
      default: return status
    }
  }

  useEffect(() => {
    loadOperatorData()
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadOperatorData, 30000)
    return () => clearInterval(interval)
  }, [user.id])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Carregando painel do operador...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          👋 Olá, {user.operator_name || user.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Painel do Operador - {new Date().toLocaleDateString('pt-BR')}
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Chat />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conversas Ativas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.completed_today}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Finalizadas Hoje
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.waiting}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aguardando Atendimento
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {transferredCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total na Fila
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ações Rápidas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Chat />}
            onClick={() => navigate('/conversations')}
            fullWidth
            sx={{ py: 2 }}
          >
            Ver Todas as Conversas
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Notifications />}
            onClick={() => navigate('/conversations')}
            fullWidth
            sx={{ py: 2 }}
            disabled={stats.waiting === 0}
          >
            {stats.waiting > 0 ? `${stats.waiting} Aguardando Você!` : 'Nenhuma Aguardando'}
          </Button>
        </Grid>
      </Grid>

      {/* Conversas em Andamento */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 Suas Conversas Ativas
            </Typography>
            {myConversations.filter(conv => conv.status === 'active').length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhuma conversa ativa no momento
              </Typography>
            ) : (
              <List>
                {myConversations
                  .filter(conv => conv.status === 'active')
                  .slice(0, 5)
                  .map((conversation, index) => (
                  <React.Fragment key={conversation.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <WhatsApp />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={conversation.user_name || conversation.user_phone}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {conversation.user_phone}
                            </Typography>
                            <Chip 
                              label={getStatusText(conversation.status)}
                              color={getStatusColor(conversation.status)}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(conversation.updated_at)}
                      </Typography>
                    </ListItem>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🔔 Conversas Disponíveis
            </Typography>
            {availableConversations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhuma conversa aguardando atendimento
              </Typography>
            ) : (
              <List>
                {availableConversations.slice(0, 5).map((conversation, index) => (
                  <React.Fragment key={conversation.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <WhatsApp />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={conversation.user_name || conversation.user_phone}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {conversation.user_phone}
                            </Typography>
                            <Chip 
                              label="Aguardando"
                              color="warning"
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(conversation.updated_at)}
                      </Typography>
                    </ListItem>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OperatorDashboard

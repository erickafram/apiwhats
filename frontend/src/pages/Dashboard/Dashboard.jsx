import React from 'react'
import { useQuery } from 'react-query'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
} from '@mui/material'
import {
  SmartToy as BotIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'

import { analyticsAPI, botsAPI } from '../../services/api'

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', loading = false }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {loading ? '-' : value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          <Icon />
        </Avatar>
      </Box>
      {loading && <LinearProgress sx={{ mt: 2 }} />}
    </CardContent>
  </Card>
)

const BotCard = ({ bot }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="div">
          {bot.name}
        </Typography>
        <Chip
          label={bot.is_connected ? 'Conectado' : 'Desconectado'}
          color={bot.is_connected ? 'success' : 'default'}
          size="small"
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {bot.description}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Status: {bot.connection_status}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Fluxos: {bot.flow_count || 0}
        </Typography>
      </Box>
    </CardContent>
  </Card>
)

const Dashboard = () => {
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery(
    'dashboard-analytics',
    () => analyticsAPI.getDashboard(),
    {
      refetchInterval: 30000, // Atualizar a cada 30 segundos
    }
  )

  const { data: bots, isLoading: botsLoading, refetch: refetchBots } = useQuery(
    'dashboard-bots',
    () => botsAPI.getAll({ limit: 6 }),
    {
      refetchInterval: 30000,
    }
  )

  const handleRefresh = () => {
    refetchAnalytics()
    refetchBots()
  }

  const summary = analytics?.data?.summary || {}
  const botsList = bots?.data?.bots || []

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <IconButton onClick={handleRefresh} disabled={analyticsLoading || botsLoading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Bots"
            value={summary.total_bots || 0}
            subtitle={`${summary.active_bots || 0} ativos`}
            icon={BotIcon}
            color="primary"
            loading={analyticsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversas"
            value={summary.total_conversations || 0}
            subtitle={`${summary.active_conversations || 0} ativas`}
            icon={ChatIcon}
            color="secondary"
            loading={analyticsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Mensagens"
            value={summary.total_messages || 0}
            subtitle="Total enviadas"
            icon={TrendingUpIcon}
            color="success"
            loading={analyticsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tempo Médio"
            value={`${Math.round(summary.avg_response_time || 0)}s`}
            subtitle="Resposta"
            icon={ScheduleIcon}
            color="warning"
            loading={analyticsLoading}
          />
        </Grid>
      </Grid>

      {/* Bots Grid */}
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Seus Bots
      </Typography>
      
      {botsLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                <CardContent>
                  <LinearProgress />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : botsList.length > 0 ? (
        <Grid container spacing={2}>
          {botsList.map((bot) => (
            <Grid item xs={12} sm={6} md={4} key={bot.id}>
              <BotCard bot={bot} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <BotIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum bot encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie seu primeiro bot para começar
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default Dashboard

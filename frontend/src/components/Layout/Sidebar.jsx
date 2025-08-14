import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  Badge,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  SmartToy as BotIcon,
  AccountTree as FlowIcon,
  ViewModule as TemplateIcon,
  Chat as ConversationIcon,
  Queue as QueueIcon,
  People as OperatorsIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  WhatsApp as WhatsAppIcon,
  Label as StatusIcon,
  AutoAwesome,
  Speed,
  TrendingUp,
  GroupWork,
} from '@mui/icons-material'

import { useConversations } from '../../hooks/useConversations.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'

const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: Speed,
    roles: ['admin', 'user'] // Operadores não precisam de dashboard
  },
  {
    title: 'Bots',
    path: '/bots',
    icon: BotIcon,
    roles: ['admin', 'user'] // Operadores não gerenciam bots
  },
  {
    title: 'Fluxos',
    path: '/flows',
    icon: FlowIcon,
    roles: ['admin', 'user'] // Operadores não gerenciam fluxos
  },
  {
    title: 'Templates',
    path: '/templates',
    icon: AutoAwesome,
    badge: 'Pro',
    roles: ['admin', 'user'] // Operadores não usam templates
  },
  {
    title: 'Conversas',
    path: '/conversations',
    icon: ConversationIcon,
    // Disponível para todos (admin, user, operator)
  },
  {
    title: 'Status de Conversas',
    path: '/conversation-statuses',
    icon: StatusIcon,
    roles: ['admin', 'user'] // Apenas admins e usuários principais podem gerenciar status
  },
  {
    title: 'Fila de Atendimento',
    path: '/queue',
    icon: QueueIcon,
    badge: 'Novo',
    roles: ['admin', 'user'] // Operadores não gerenciam filas
  },
  {
    title: 'Operadores',
    path: '/operators',
    icon: GroupWork,
    roles: ['admin', 'user'] // Apenas admins e usuários principais
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: TrendingUp,
    roles: ['admin', 'user'] // Operadores não precisam de analytics
  },
  {
    title: 'Configurações',
    path: '/settings',
    icon: SettingsIcon,
    roles: ['admin', 'user'] // Operadores não alteram configurações
  },
]

const Sidebar = ({ onItemClick }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { transferredCount, unattendedCount } = useConversations()
  const { user } = useAuth()

  // Filtrar itens de menu baseado no role do usuário
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true // Item disponível para todos
    
    if (user?.role === 'admin') return true // Admin vê tudo
    
    if (user?.role === 'user' && !user?.parent_user_id) {
      return item.roles.includes('user') // Usuário principal
    }
    
    if (user?.role === 'operator') {
      return item.roles.includes('operator') // Operador
    }
    
    return item.roles.includes(user?.role)
  })

  const handleItemClick = (path) => {
    navigate(path)
    if (onItemClick) {
      onItemClick()
    }
  }

  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(148, 163, 184, 0.1)',
        position: 'relative',
        boxShadow: '2px 0 20px rgba(0, 0, 0, 0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(148, 163, 184, 0.03) 0%, rgba(203, 213, 225, 0.02) 100%)',
          borderRadius: 0,
          zIndex: -1
        }
      }}
    >
      {/* Logo */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          background: 'rgba(148, 163, 184, 0.05)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '0 0 12px 12px',
          margin: '0 8px 12px 8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box 
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '8px',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 20, color: '#ffffff' }} />
        </Box>
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              lineHeight: 1,
              color: '#f1f5f9',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              fontSize: '0.9rem'
            }}
          >
            ChatBot Pro
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#94a3b8',
              fontSize: '0.65rem',
              fontWeight: 500
            }}
          >
            Sistema Avançado
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 2, py: 1 }}>
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || 
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleItemClick(item.path)}
                sx={{
                  borderRadius: '12px',
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.1) 100%)'
                    : 'transparent',
                  color: isActive ? '#f1f5f9' : '#94a3b8',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
                  '&:hover': {
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.15) 100%)'
                      : 'rgba(148, 163, 184, 0.08)',
                    color: isActive ? '#ffffff' : '#e2e8f0',
                    transform: 'translateX(2px)',
                    boxShadow: isActive ? '0 6px 16px rgba(59, 130, 246, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: '0 3px 3px 0'
                  } : {},
                  py: 1,
                  px: 1.5,
                  minHeight: 'auto'
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#ffffff' : '#64748b',
                    minWidth: 36,
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(29, 78, 216, 0.2) 100%)'
                      : 'rgba(148, 163, 184, 0.1)',
                    borderRadius: '8px',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 1,
                    boxShadow: isActive ? '0 4px 8px rgba(59, 130, 246, 0.2)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Badge especial para Conversas */}
                  {item.path === '/conversations' && transferredCount > 0 ? (
                    <Badge 
                      badgeContent={transferredCount} 
                      color={unattendedCount > 0 ? "error" : "warning"}
                      max={99}
                      sx={{
                        '& .MuiBadge-badge': {
                          animation: unattendedCount > 0 ? 'pulse 2s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.3)' },
                            '100%': { transform: 'scale(1)' }
                          },
                          background: unattendedCount > 0 ? '#ff4444' : '#ff9800',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }
                      }}
                                          >
                        <Icon sx={{ fontSize: 16 }} />
                      </Badge>
                    ) : (
                      <Icon sx={{ fontSize: 16 }} />
                    )}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#f1f5f9' : '#94a3b8',
                    textShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none'
                  }}
                />
                {/* Badge estático original */}
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                      color: 'white',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                      '& .MuiChip-label': {
                        padding: '0 6px'
                      }
                    }}
                  />
                )}
                {/* Badge dinâmico para conversas */}
                {item.path === '/conversations' && transferredCount > 0 && (
                  <Chip
                    label={`${transferredCount}${unattendedCount > 0 ? '!' : ''}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      background: unattendedCount > 0 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: unattendedCount > 0 
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid rgba(245, 158, 11, 0.3)',
                      boxShadow: unattendedCount > 0 
                        ? '0 2px 6px rgba(239, 68, 68, 0.4)'
                        : '0 2px 6px rgba(245, 158, 11, 0.3)',
                      animation: unattendedCount > 0 ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' }
                      },
                      '& .MuiChip-label': {
                        padding: '0 6px'
                      }
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* Footer */}
      <Box 
        sx={{ 
          p: 1.5,
          background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '12px 12px 0 0',
          margin: '12px 8px 0 8px'
        }}
      >
        <Box 
          sx={{ 
            textAlign: 'center',
            background: 'rgba(148, 163, 184, 0.05)',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#e2e8f0',
              display: 'block',
              fontWeight: 600,
              fontSize: '0.65rem'
            }}
          >
            🚀 ChatBot Pro v2.0
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#94a3b8',
              display: 'block',
              fontSize: '0.6rem',
              mt: 0.3
            }}
          >
            by erickdev.online ✨
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Sidebar

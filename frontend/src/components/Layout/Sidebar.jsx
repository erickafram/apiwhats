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
} from '@mui/icons-material'

import { useConversations } from '../../hooks/useConversations.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'

const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon,
  },
  {
    title: 'Bots',
    path: '/bots',
    icon: BotIcon,
  },
  {
    title: 'Fluxos',
    path: '/flows',
    icon: FlowIcon,
  },
  {
    title: 'Templates',
    path: '/templates',
    icon: TemplateIcon,
    badge: 'Novo',
  },
  {
    title: 'Conversas',
    path: '/conversations',
    icon: ConversationIcon,
  },
  {
    title: 'Fila de Atendimento',
    path: '/queue',
    icon: QueueIcon,
    badge: 'Novo',
  },
  {
    title: 'Operadores',
    path: '/operators',
    icon: OperatorsIcon,
    roles: ['admin', 'user'] // Apenas admins e usuários principais
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: AnalyticsIcon,
  },
  {
    title: 'Configurações',
    path: '/settings',
    icon: SettingsIcon,
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <WhatsAppIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1 }}>
            ChatBot
          </Typography>
          <Typography variant="caption" color="text.secondary">
            System
          </Typography>
        </Box>
      </Box>

      <Divider />

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
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 40,
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
                          }
                        }
                      }}
                    >
                      <Icon />
                    </Badge>
                  ) : (
                    <Icon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
                {/* Badge estático original */}
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'secondary.main',
                      color: isActive ? 'white' : 'white',
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
                      fontSize: '0.75rem',
                      bgcolor: unattendedCount > 0 
                        ? (isActive ? 'rgba(255,0,0,0.8)' : 'error.main')
                        : (isActive ? 'rgba(255,255,255,0.2)' : 'warning.main'),
                      color: 'white',
                      animation: unattendedCount > 0 ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' }
                      }
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          WhatsApp Chatbot System v1.0
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Desenvolvido por erickdev.online
        </Typography>
      </Box>
    </Box>
  )
}

export default Sidebar

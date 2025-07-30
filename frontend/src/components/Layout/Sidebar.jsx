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
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  SmartToy as BotIcon,
  AccountTree as FlowIcon,
  ViewModule as TemplateIcon,
  Chat as ConversationIcon,
  Queue as QueueIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material'

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
        {menuItems.map((item) => {
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
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
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

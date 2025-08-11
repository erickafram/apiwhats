import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Typography,
  Divider,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Send,
  Search,
  Star,
  Close,
  Add,
  Edit
} from '@mui/icons-material'
import { quickMessagesAPI } from '../services/api'
import toast from 'react-hot-toast'

const QuickMessageSelector = ({ 
  open, 
  onClose, 
  onSelectMessage, 
  onManageMessages 
}) => {
  const [quickMessages, setQuickMessages] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [filteredMessages, setFilteredMessages] = useState([])

  // Carregar mensagens prontas
  const loadQuickMessages = async () => {
    try {
      setLoading(true)
      const [messagesResponse, categoriesResponse] = await Promise.all([
        quickMessagesAPI.getAll({ is_active: true }),
        quickMessagesAPI.getCategories()
      ])
      
      setQuickMessages(messagesResponse.data.quick_messages || [])
      setCategories([
        { value: 'all', label: 'Todas' },
        ...categoriesResponse.data.categories
      ])
    } catch (error) {
      console.error('Erro ao carregar mensagens prontas:', error)
      toast.error('Erro ao carregar mensagens prontas')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar mensagens
  useEffect(() => {
    let filtered = quickMessages

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(msg => msg.category === selectedCategory)
    }

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(msg => 
        msg.title.toLowerCase().includes(query) ||
        msg.content.toLowerCase().includes(query) ||
        (msg.tags && msg.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }

    setFilteredMessages(filtered)
  }, [quickMessages, selectedCategory, searchQuery])

  // Carregar mensagens quando abrir o dialog
  useEffect(() => {
    if (open) {
      loadQuickMessages()
      setSearchQuery('')
      setSelectedCategory('all')
    }
  }, [open])

  const handleSelectMessage = async (message) => {
    try {
      // Marcar como usada
      await quickMessagesAPI.markAsUsed(message.id)
      
      // Chamar callback com a mensagem
      onSelectMessage(message.content)
      
      // Fechar dialog
      onClose()
      
      toast.success('Mensagem selecionada!')
    } catch (error) {
      console.error('Erro ao selecionar mensagem:', error)
      // Mesmo com erro, ainda permite usar a mensagem
      onSelectMessage(message.content)
      onClose()
    }
  }

  const handleTabChange = (event, newValue) => {
    setSelectedCategory(newValue)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { height: '70vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            💬 Mensagens Prontas
          </Typography>
          <Box>
            <Tooltip title="Gerenciar mensagens">
              <IconButton onClick={() => {
                onClose()
                onManageMessages && onManageMessages()
              }}>
                <Edit />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Barra de pesquisa */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar mensagens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>

        {/* Tabs de categorias */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedCategory}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {categories.map((category) => (
              <Tab
                key={category.value}
                label={category.label}
                value={category.value}
              />
            ))}
          </Tabs>
        </Box>

        {/* Lista de mensagens */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredMessages.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography color="text.secondary">
                {quickMessages.length === 0 
                  ? 'Nenhuma mensagem pronta cadastrada'
                  : 'Nenhuma mensagem encontrada com os filtros atuais'
                }
              </Typography>
              {quickMessages.length === 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    onClose()
                    onManageMessages && onManageMessages()
                  }}
                  sx={{ mt: 2 }}
                >
                  Criar primeira mensagem
                </Button>
              )}
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredMessages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemButton
                      onClick={() => handleSelectMessage(message)}
                      sx={{ 
                        p: 2,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {message.title}
                            </Typography>
                            {message.usage_count > 0 && (
                              <Chip
                                size="small"
                                icon={<Star />}
                                label={`${message.usage_count} usos`}
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {message.content.length > 150 
                                ? `${message.content.substring(0, 150)}...`
                                : message.content
                              }
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              <Chip
                                size="small"
                                label={categories.find(c => c.value === message.category)?.label || message.category}
                                color="secondary"
                                variant="outlined"
                              />
                              {message.tags && message.tags.map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  size="small"
                                  label={tag}
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        }
                      />
                      <Box sx={{ ml: 2 }}>
                        <Tooltip title="Usar esta mensagem">
                          <IconButton
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectMessage(message)
                            }}
                          >
                            <Send />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < filteredMessages.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => {
            onClose()
            onManageMessages && onManageMessages()
          }}
        >
          Gerenciar Mensagens
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuickMessageSelector 
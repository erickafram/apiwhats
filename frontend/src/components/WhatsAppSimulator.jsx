import React, { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  Divider,
  Chip
} from '@mui/material'
import {
  Send as SendIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  VideoCall as VideoCallIcon,
  MoreVert as MoreVertIcon,
  SmartToy as BotIcon
} from '@mui/icons-material'

const WhatsAppSimulator = ({ open, onClose, flow, botName = 'ChatBot' }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [currentNode, setCurrentNode] = useState(null)
  const [sessionData, setSessionData] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Inicializar conversa quando abrir
  useEffect(() => {
    if (open && flow) {
      resetConversation()
    }
  }, [open, flow])

  const resetConversation = () => {
    setMessages([])
    setSessionData({})
    setInputMessage('')
    setIsTyping(false)
    
    // Encontrar nó start
    const startNode = flow?.flow_data?.nodes?.find(node => node.type === 'start')
    if (startNode) {
      setCurrentNode(startNode)
      processNode(startNode)
    }
  }

  const processNode = async (node) => {
    if (!node) return

    console.log('🤖 Processando nó:', node.id, node.type)

    switch (node.type) {
      case 'start':
        // Ir para o próximo nó
        const nextNode = findNodeById(node.next)
        if (nextNode) {
          setTimeout(() => processNode(nextNode), 500)
        }
        break

      case 'message':
        // Simular digitação
        setIsTyping(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsTyping(false)
        
        // Adicionar mensagem do bot
        addBotMessage(node.content || 'Mensagem não definida')
        
        // Ir para próximo nó
        const nextMessageNode = findNodeById(node.next)
        if (nextMessageNode && nextMessageNode.type !== 'input') {
          setTimeout(() => processNode(nextMessageNode), 1000)
        } else if (nextMessageNode) {
          setCurrentNode(nextMessageNode)
        }
        break

      case 'input':
        // Aguardar entrada do usuário
        setCurrentNode(node)
        break

      case 'condition':
        // Processar condição automaticamente se não precisar de input
        handleCondition(node)
        break

      case 'ai':
        // Simular resposta de IA
        setIsTyping(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsTyping(false)
        
        addBotMessage('🤖 Esta seria uma resposta gerada por IA baseada na sua mensagem.')
        
        const nextAiNode = findNodeById(node.next)
        if (nextAiNode) {
          setTimeout(() => processNode(nextAiNode), 1000)
        }
        break

      case 'action':
        // Simular ação
        addBotMessage(`⚙️ Ação executada: ${node.content || 'Ação do sistema'}`)
        
        const nextActionNode = findNodeById(node.next)
        if (nextActionNode) {
          setTimeout(() => processNode(nextActionNode), 1000)
        }
        break

      case 'end':
        // Fim da conversa
        addBotMessage('✅ Conversa finalizada. Digite "reiniciar" para começar novamente.')
        setCurrentNode(null)
        break

      default:
        console.warn('Tipo de nó não reconhecido:', node.type)
    }
  }

  const findNodeById = (nodeId) => {
    return flow?.flow_data?.nodes?.find(node => node.id === nodeId)
  }

  const addBotMessage = (content) => {
    const message = {
      id: Date.now(),
      content: content,
      sender: 'bot',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  const addUserMessage = (content) => {
    const message = {
      id: Date.now(),
      content: content,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage = inputMessage.trim()
    addUserMessage(userMessage)
    setInputMessage('')

    // Verificar comandos especiais
    if (userMessage.toLowerCase() === 'reiniciar') {
      setTimeout(() => resetConversation(), 500)
      return
    }

    // Processar baseado no nó atual
    if (currentNode) {
      if (currentNode.type === 'input') {
        // Salvar dados da sessão
        if (currentNode.variable) {
          setSessionData(prev => ({
            ...prev,
            [currentNode.variable]: userMessage
          }))
        }

        // Ir para próximo nó
        const nextNode = findNodeById(currentNode.next)
        if (nextNode) {
          setTimeout(() => processNode(nextNode), 500)
        }
      } else if (currentNode.type === 'condition') {
        handleConditionWithInput(currentNode, userMessage)
      }
    }
  }

  const handleCondition = (node) => {
    // Se não tem condições definidas, ir para próximo
    if (!node.conditions || node.conditions.length === 0) {
      const nextNode = findNodeById(node.next)
      if (nextNode) {
        processNode(nextNode)
      }
      return
    }

    // Usar primeira condição como padrão se não há input
    const firstCondition = node.conditions[0]
    const nextNode = findNodeById(firstCondition.next)
    if (nextNode) {
      processNode(nextNode)
    }
  }

  const handleConditionWithInput = (node, userInput) => {
    if (!node.conditions) return

    // Procurar condição que corresponde ao input
    const matchingCondition = node.conditions.find(condition => {
      return condition.value === userInput || 
             condition.value.toLowerCase() === userInput.toLowerCase()
    })

    if (matchingCondition) {
      const nextNode = findNodeById(matchingCondition.next)
      if (nextNode) {
        setTimeout(() => processNode(nextNode), 500)
      }
    } else {
      // Condição padrão ou erro
      addBotMessage('❌ Opção inválida. Tente novamente.')
      setCurrentNode(node) // Manter no mesmo nó
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!flow) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px',
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header do WhatsApp */}
      <Box sx={{
        background: '#075e54',
        color: 'white',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar sx={{ bgcolor: '#25d366' }}>
          <BotIcon />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            {botName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {isTyping ? 'digitando...' : 'online'}
          </Typography>
        </Box>
        <IconButton sx={{ color: 'white' }}>
          <PhoneIcon />
        </IconButton>
        <IconButton sx={{ color: 'white' }}>
          <VideoCallIcon />
        </IconButton>
        <IconButton sx={{ color: 'white' }}>
          <MoreVertIcon />
        </IconButton>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Área de mensagens */}
      <DialogContent sx={{
        p: 0,
        background: '#e5ddd5',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="whatsapp-bg" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Cpath d="M0 0h100v100H0z" fill="%23e5ddd5"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23whatsapp-bg)"/%3E%3C/svg%3E")',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Mensagens */}
        <Box sx={{ flex: 1, p: 1, overflowY: 'auto' }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  bgcolor: message.sender === 'user' ? '#dcf8c6' : 'white',
                  borderRadius: message.sender === 'user' 
                    ? '18px 18px 4px 18px' 
                    : '18px 18px 18px 4px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <Typography variant="body2" sx={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {message.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.5,
                    opacity: 0.7,
                    fontSize: '0.7rem'
                  }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Paper>
            </Box>
          ))}
          
          {/* Indicador de digitação */}
          {isTyping && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Paper sx={{
                p: 1.5,
                bgcolor: 'white',
                borderRadius: '18px 18px 18px 4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                  {botName} está digitando...
                </Typography>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Input de mensagem */}
        <Box sx={{
          p: 1,
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Digite uma mensagem..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                bgcolor: 'white'
              }
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            sx={{
              bgcolor: '#25d366',
              color: 'white',
              '&:hover': {
                bgcolor: '#128c7e'
              },
              '&:disabled': {
                bgcolor: '#ccc'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>

        {/* Info do nó atual */}
        {currentNode && (
          <Box sx={{ p: 1, bgcolor: '#fff3cd', borderTop: '1px solid #ffeaa7' }}>
            <Chip
              size="small"
              label={`Nó atual: ${currentNode.id} (${currentNode.type})`}
              color="warning"
              variant="outlined"
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default WhatsAppSimulator

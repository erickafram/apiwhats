import { useState, useEffect, useContext, createContext } from 'react'
import { conversationsAPI } from '../services/api'
import io from 'socket.io-client'
import toast from 'react-hot-toast'

// Context para compartilhar estado das conversas
const ConversationsContext = createContext()

export const ConversationsProvider = ({ children }) => {
  const [transferredCount, setTransferredCount] = useState(0)
  const [unattendedCount, setUnattendedCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [socket, setSocket] = useState(null)
  const [newConversationAlert, setNewConversationAlert] = useState(false)

  const loadConversationCounts = async () => {
    try {
      const response = await conversationsAPI.getAll({
        status: 'transferred',
        limit: 100
      })
      
      const conversations = response.data.conversations || []
      setTransferredCount(conversations.length)
      
      // Contar conversas não atendidas (transferidas há mais de 5 minutos)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const unattended = conversations.filter(conv => {
        const transferTime = new Date(conv.metadata?.transfer_timestamp || conv.updated_at)
        return transferTime < fiveMinutesAgo && !conv.metadata?.operator_assigned
      })
      
      setUnattendedCount(unattended.length)
      setLastUpdate(Date.now())
      
    } catch (error) {
      console.error('Erro ao carregar contadores de conversas:', error)
    }
  }

  const refreshConversations = () => {
    loadConversationCounts()
  }

  // ✅ NOVA: Configurar WebSocket listeners
  useEffect(() => {
    // Conectar ao WebSocket
    const isProduction = window.location.hostname !== 'localhost'
    const apiUrl = isProduction 
      ? window.location.origin 
      : (import.meta.env.VITE_API_URL || 'http://localhost:5000')
    
    console.log('🔗 Conectando WebSocket para:', apiUrl)
    const socketConnection = io(apiUrl, {
      transports: ['websocket', 'polling'], // Fallback para polling se WebSocket falhar
      timeout: 10000,
      forceNew: true
    })
    setSocket(socketConnection)

    // Event listeners para conexão
    socketConnection.on('connect', () => {
      console.log('✅ WebSocket conectado com sucesso:', socketConnection.id)
    })
    
    socketConnection.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error)
    })
    
    socketConnection.on('disconnect', (reason) => {
      console.warn('⚠️ WebSocket desconectado:', reason)
    })

    // Listener para novas conversas
    socketConnection.on('new_conversation', (data) => {
      console.log('🔔 Nova conversa recebida:', data)
      
      // Mostrar notificação
      toast.success('🔔 Nova conversa iniciada!', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#4caf50',
          color: 'white',
        }
      })
      
      // Tocar som se possível
      try {
        const audio = new Audio('./notification.wav')
        audio.volume = 0.3
        audio.load()
        audio.play().catch(err => {
          console.warn('Não foi possível tocar o som de notificação:', err)
        })
      } catch (e) {
        console.warn('Erro ao criar áudio de notificação:', e)
      }
      
      // Atualizar contadores
      loadConversationCounts()
      setNewConversationAlert(true)
      
      // Esconder alerta após 5 segundos
      setTimeout(() => setNewConversationAlert(false), 5000)
    })

    // Listener para conversas transferidas
    socketConnection.on('conversation_transferred', (data) => {
      console.log('🔔 Conversa transferida para operador:', data)
      
      // Mostrar notificação mais chamativa
      toast.error('🚨 Nova conversa aguardando atendimento!', {
        duration: 6000,
        position: 'top-right',
        style: {
          background: '#f44336',
          color: 'white',
          fontWeight: 'bold'
        }
      })
      
      // Tocar som mais alto
      try {
        const audio = new Audio('./notification.wav')
        audio.volume = 0.6
        audio.load()
        audio.play().catch(err => {
          console.warn('Não foi possível tocar o som de notificação:', err)
        })
      } catch (e) {
        console.warn('Erro ao criar áudio de notificação:', e)
      }
      
      // Atualizar contadores imediatamente
      loadConversationCounts()
      setNewConversationAlert(true)
      
      // Esconder alerta após 8 segundos
      setTimeout(() => setNewConversationAlert(false), 8000)
    })

    // Listener para novas mensagens em conversas transferidas
    socketConnection.on('operator_new_message', (data) => {
      console.log('💬 Nova mensagem em conversa transferida:', data)
      
      // Notificação mais sutil
      toast('💬 Nova mensagem na conversa', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#2196f3',
          color: 'white',
        }
      })
      
      // Atualizar contadores
      loadConversationCounts()
    })

    // Cleanup ao desmontar
    return () => {
      socketConnection.disconnect()
    }
  }, [])

  // Atualizar a cada 30 segundos (reduzido porque WebSocket é mais eficiente)
  useEffect(() => {
    loadConversationCounts()
    const interval = setInterval(loadConversationCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <ConversationsContext.Provider value={{
      transferredCount,
      unattendedCount,
      refreshConversations,
      lastUpdate,
      newConversationAlert,
      socket
    }}>
      {children}
    </ConversationsContext.Provider>
  )
}

export const useConversations = () => {
  const context = useContext(ConversationsContext)
  if (!context) {
    throw new Error('useConversations deve ser usado dentro de ConversationsProvider')
  }
  return context
} 
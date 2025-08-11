import { useState, useEffect, useContext, createContext } from 'react'
import { conversationsAPI } from '../services/api'

// Context para compartilhar estado das conversas
const ConversationsContext = createContext()

export const ConversationsProvider = ({ children }) => {
  const [transferredCount, setTransferredCount] = useState(0)
  const [unattendedCount, setUnattendedCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

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

  // Atualizar a cada 10 segundos
  useEffect(() => {
    loadConversationCounts()
    const interval = setInterval(loadConversationCounts, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <ConversationsContext.Provider value={{
      transferredCount,
      unattendedCount,
      refreshConversations,
      lastUpdate
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
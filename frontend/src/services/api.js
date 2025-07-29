import axios from 'axios'
import toast from 'react-hot-toast'

// Criar instância do axios
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Adicionar token se existir
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Tratar erros globalmente
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Token inválido ou expirado
          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']
          if (window.location.pathname !== '/login') {
            toast.error('Sessão expirada. Faça login novamente.')
            window.location.href = '/login'
          }
          break

        case 403:
          toast.error('Acesso negado')
          break

        case 404:
          toast.error('Recurso não encontrado')
          break

        case 422:
          // Erros de validação
          if (data.errors) {
            Object.values(data.errors).forEach(error => {
              toast.error(error[0])
            })
          } else {
            toast.error(data.error || 'Dados inválidos')
          }
          break

        case 429:
          toast.error('Muitas tentativas. Tente novamente mais tarde.')
          break

        case 500:
          toast.error('Erro interno do servidor')
          break

        default:
          toast.error(data.error || 'Erro inesperado')
      }
    } else if (error.request) {
      // Erro de rede
      toast.error('Erro de conexão. Verifique sua internet.')
    } else {
      // Outro erro
      toast.error('Erro inesperado')
    }

    return Promise.reject(error)
  }
)

// Métodos de conveniência
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  verify: () => api.get('/auth/verify'),
  refresh: () => api.post('/auth/refresh'),
}

export const botsAPI = {
  getAll: (params = {}) => api.get('/bots', { params }),
  getById: (id) => api.get(`/bots/${id}`),
  create: (data) => api.post('/bots', data),
  update: (id, data) => api.put(`/bots/${id}`, data),
  delete: (id) => api.delete(`/bots/${id}`),
  connect: (id) => api.post(`/bots/${id}/connect`),
  disconnect: (id) => api.post(`/bots/${id}/disconnect`),
  getQRCode: (id) => api.get(`/bots/${id}/qr-code`),
}

export const flowsAPI = {
  getAll: (params = {}) => api.get('/flows', { params }),
  getById: (id) => api.get(`/flows/${id}`),
  create: (data) => api.post('/flows', data),
  update: (id, data) => api.put(`/flows/${id}`, data),
  delete: (id) => api.delete(`/flows/${id}`),
  duplicate: (id) => api.post(`/flows/${id}/duplicate`),
  test: (id, data) => api.post(`/flows/${id}/test`, data),
}

export const templatesAPI = {
  getAll: (params = {}) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`),
  createFlow: (id, data) => api.post(`/templates/${id}/create-flow`, data),
  preview: (id, data) => api.post(`/templates/${id}/preview`, data),
  getCategories: () => api.get('/templates/meta/categories'),
  getTags: () => api.get('/templates/meta/tags'),
  getStats: () => api.get('/templates/meta/stats'),
}

export const conversationsAPI = {
  getAll: (params = {}) => api.get('/conversations', { params }),
  getById: (id) => api.get(`/conversations/${id}`),
  getMessages: (id, params = {}) => api.get(`/conversations/${id}/messages`, { params }),
  sendMessage: (id, data) => api.post(`/conversations/${id}/send-message`, data),
  update: (id, data) => api.put(`/conversations/${id}`, data),
}

export const queueAPI = {
  getStatus: () => api.get('/queue/status'),
  getQueueStatus: (department) => api.get(`/queue/${department}/status`),
  addToQueue: (data) => api.post('/queue/add', data),
  assign: (data) => api.post('/queue/assign', data),
  release: (data) => api.post('/queue/release', data),
  getAgents: () => api.get('/queue/agents'),
  getAgent: (id) => api.get(`/queue/agents/${id}`),
  registerAgent: (data) => api.post('/queue/agents/register', data),
  unregisterAgent: (id) => api.delete(`/queue/agents/${id}`),
}

export const analyticsAPI = {
  getDashboard: (params = {}) => api.get('/analytics/dashboard', { params }),
  getBotAnalytics: (id, params = {}) => api.get(`/analytics/bot/${id}`, { params }),
  getFlowAnalytics: (id, params = {}) => api.get(`/analytics/flow/${id}`, { params }),
}

export default api

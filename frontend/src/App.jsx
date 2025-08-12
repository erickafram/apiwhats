import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

// Hooks
import { useAuth } from './hooks/useAuth.jsx'
import { ConversationsProvider } from './hooks/useConversations.jsx'

// Components
import Layout from './components/Layout/Layout'
import LoadingScreen from './components/Common/LoadingScreen'

// Pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import Bots from './pages/Bots/Bots'
import BotDetail from './pages/Bots/BotDetail'
import Flows from './pages/Flows/Flows'
import FlowEditor from './pages/Flows/FlowEditor'
import Templates from './pages/Templates/Templates'
import Conversations from './pages/Conversations/Conversations'
import ConversationDetail from './pages/Conversations/ConversationDetail'
import Queue from './pages/Queue/Queue'
import Operators from './pages/Operators/Operators'
import OperatorDashboard from './pages/Operator/OperatorDashboard'
import Analytics from './pages/Analytics/Analytics'
import Settings from './pages/Settings/Settings'
import LandingPage from './pages/Landing/LandingPage'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Operator Route Component (redirect operators to conversations)
const OperatorRoute = ({ children }) => {
  const { user } = useAuth()
  
  if (user?.role === 'operator') {
    return <Navigate to="/conversations" replace />
  }
  
  return children
}

// Dashboard Route Component (diferentes dashboards por role)
const DashboardRoute = () => {
  const { user } = useAuth()
  
  if (user?.role === 'operator') {
    return <OperatorDashboard />
  }
  
  return <Dashboard />
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <Box sx={{ display: '', minHeight: '100vh' }}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <ConversationsProvider>
                <Layout>
                  <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardRoute />} />
                  
                  {/* Bots */}
                  <Route path="/bots" element={<OperatorRoute><Bots /></OperatorRoute>} />
                  <Route path="/bots/:id" element={<OperatorRoute><BotDetail /></OperatorRoute>} />
                  
                  {/* Flows */}
                  <Route path="/flows" element={<OperatorRoute><Flows /></OperatorRoute>} />
                  <Route path="/flows/:id/edit" element={<OperatorRoute><FlowEditor /></OperatorRoute>} />
                  <Route path="/flows/new" element={<OperatorRoute><FlowEditor /></OperatorRoute>} />
                  
                  {/* Templates */}
                  <Route path="/templates" element={<OperatorRoute><Templates /></OperatorRoute>} />
                  
                  {/* Conversations - Acessível para todos */}
                  <Route path="/conversations" element={<Conversations />} />
                  <Route path="/conversations/:id" element={<ConversationDetail />} />
                  
                  {/* Queue */}
                  <Route path="/queue" element={<OperatorRoute><Queue /></OperatorRoute>} />
                  
                  {/* Operators */}
                  <Route path="/operators" element={<OperatorRoute><Operators /></OperatorRoute>} />
                  
                  {/* Analytics */}
                  <Route path="/analytics" element={<OperatorRoute><Analytics /></OperatorRoute>} />
                  
                  {/* Settings */}
                  <Route path="/settings" element={<OperatorRoute><Settings /></OperatorRoute>} />
                  
                  {/* 404 - Redireciona operadores para conversas */}
                  <Route path="*" element={<OperatorRoute><Navigate to="/dashboard" replace /></OperatorRoute>} />
                </Routes>
              </Layout>
            </ConversationsProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Box>
  )
}

export default App

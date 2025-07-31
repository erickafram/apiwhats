import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Toolbar,
  Divider,
  Badge,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material'
import {
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Message as MessageIcon,
  Input as InputIcon,
  SmartToy as AIIcon,
  CallSplit as ConditionIcon,
  Stop as EndIcon,
  Start as StartIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
  AccountTree as FlowIcon,
  AutoAwesome as AutoAwesomeIcon,
  Send as SendIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel
} from 'reactflow'
import 'reactflow/dist/style.css'
import toast from 'react-hot-toast'
import { flowsAPI } from '../../services/api'
import WhatsAppSimulator from '../../components/WhatsAppSimulator'

// Tipos de nós disponíveis
const nodeTypes = [
  { type: 'start', label: 'Início', icon: <StartIcon />, color: '#4caf50' },
  { type: 'message', label: 'Mensagem', icon: <MessageIcon />, color: '#2196f3' },
  { type: 'input', label: 'Entrada', icon: <InputIcon />, color: '#ff9800' },
  { type: 'condition', label: 'Condição', icon: <ConditionIcon />, color: '#9c27b0' },
  { type: 'ai', label: 'IA', icon: <AIIcon />, color: '#e91e63' },
  { type: 'action', label: 'Ação', icon: <SettingsIcon />, color: '#607d8b' },
  { type: 'end', label: 'Fim', icon: <EndIcon />, color: '#f44336' }
]

const FlowEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Estados do fluxo
  const [flow, setFlow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Estados do editor
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)

  // Estados para edição com IA
  const [aiEditDialogOpen, setAiEditDialogOpen] = useState(false)
  const [aiEditDescription, setAiEditDescription] = useState('')
  const [aiEditGenerating, setAiEditGenerating] = useState(false)
  const [aiEditStep, setAiEditStep] = useState('input')
  const [aiAnalysis, setAiAnalysis] = useState('')

  // Estado para o simulador do WhatsApp
  const [whatsappSimulatorOpen, setWhatsappSimulatorOpen] = useState(false)

  // Estados para edição por código
  const [codeEditorOpen, setCodeEditorOpen] = useState(false)
  const [flowCode, setFlowCode] = useState('')
  const [codeValidationError, setCodeValidationError] = useState('')

  // Estados do nó sendo editado
  const [editingNode, setEditingNode] = useState({
    id: '',
    type: 'message',
    data: {
      label: '',
      content: '',
      variable: '',
      conditions: [],
      validation: null,
      prompt: '',
      action: null
    }
  })

  useEffect(() => {
    if (id) {
      loadFlow()
    }
  }, [id])

  // Auto-save quando nodes ou edges mudarem
  useEffect(() => {
    if (flow && autoSaveEnabled && (nodes.length > 0 || edges.length > 0)) {
      setHasUnsavedChanges(true)

      const autoSaveTimer = setTimeout(async () => {
        if (hasUnsavedChanges) {
          await saveFlow(false) // Salvar sem mostrar toast
          setHasUnsavedChanges(false)
          // Mostrar notificação discreta de auto-save
          toast.success('💾 Auto-save realizado', {
            duration: 2000,
            position: 'bottom-right',
            style: {
              background: '#4caf50',
              color: 'white',
              fontSize: '0.875rem'
            }
          })
        }
      }, 2000) // Auto-save após 2 segundos de inatividade

      return () => clearTimeout(autoSaveTimer)
    }
  }, [nodes, edges, autoSaveEnabled, flow])

  // Detectar mudanças para mostrar indicador
  useEffect(() => {
    if (flow) {
      setHasUnsavedChanges(true)
    }
  }, [nodes, edges])

  const loadFlow = async () => {
    try {
      const response = await flowsAPI.getById(id)
      const flowData = response.data
      setFlow(flowData)

      // Converter dados do fluxo para ReactFlow
      if (flowData.flow_data && flowData.flow_data.nodes) {
        const reactFlowNodes = flowData.flow_data.nodes.map((node, index) => ({
          id: node.id,
          type: 'default',
          position: node.position || getAutoPosition(node, index, flowData.flow_data.nodes),
          data: {
            label: getNodeLabel(node, index),
            nodeType: node.type,
            content: node.content,
            stepNumber: getStepNumber(node, index),
            ...node
          },
          style: {
            background: `linear-gradient(135deg, ${getNodeColor(node.type)}, ${getNodeColor(node.type)}dd)`,
            color: 'white',
            border: `2px solid ${getNodeColor(node.type)}`,
            borderRadius: '12px',
            width: 200,
            minHeight: 80,
            fontSize: 11,
            fontWeight: 600,
            textAlign: 'center',
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
          }
        }))

        const reactFlowEdges = generateEdgesFromNodes(flowData.flow_data.nodes)

        setNodes(reactFlowNodes)
        setEdges(reactFlowEdges)
      }
    } catch (error) {
      console.error('Erro ao carregar fluxo:', error)
      toast.error('Erro ao carregar fluxo')
    } finally {
      setLoading(false)
    }
  }

  const getNodeLabel = (node, index) => {
    const nodeType = nodeTypes.find(nt => nt.type === node.type)
    const typeLabel = nodeType ? nodeType.label : node.type

    // Determinar o ícone e número do passo
    let stepIcon = ''
    let stepNumber = ''

    if (node.type === 'start') {
      stepIcon = '🚀'
      stepNumber = 'INÍCIO'
    } else if (node.type === 'end') {
      stepIcon = '🏁'
      stepNumber = 'FIM'
    } else if (node.type === 'condition') {
      stepIcon = '🔀'
      stepNumber = 'DECISÃO'
    } else if (node.type === 'ai') {
      stepIcon = '🤖'
      stepNumber = 'IA'
    } else {
      stepIcon = '📝'
      stepNumber = `PASSO ${index + 1}`
    }

    // Criar label mais limpo e legível
    let content = ''
    if (node.content && node.content.length > 25) {
      content = node.content.substring(0, 25) + '...'
    } else if (node.content) {
      content = node.content
    } else {
      content = typeLabel
    }

    return `${stepIcon} ${stepNumber}\n${content}`
  }

  const getNodeColor = (type) => {
    const colors = {
      'start': '#4caf50',      // Verde - Início
      'message': '#2196f3',    // Azul - Mensagem
      'input': '#ff9800',      // Laranja - Input
      'condition': '#9c27b0',  // Roxo - Condição
      'ai': '#e91e63',         // Rosa - IA
      'end': '#f44336',        // Vermelho - Fim
      'action': '#607d8b',     // Cinza azulado - Ação
      'delay': '#795548'       // Marrom - Delay
    }

    return colors[type] || '#666'
  }

  const getStepNumber = (node, index) => {
    if (node.type === 'start') return '🚀'
    if (node.type === 'end') return '🏁'
    if (node.type === 'condition') return '🔀'
    if (node.type === 'ai') return '🤖'
    return `${index + 1}`
  }

  const getAutoPosition = (node, index, allNodes) => {
    // Configurações de layout
    const nodeWidth = 220
    const nodeHeight = 100
    const horizontalSpacing = 280
    const verticalSpacing = 150
    const startX = 100
    const startY = 100

    // Organizar em fluxo vertical com ramificações
    if (node.type === 'start') {
      return { x: startX, y: startY }
    }

    // Para outros nós, calcular posição baseada no índice
    const row = Math.floor(index / 3) // 3 nós por linha
    const col = index % 3

    return {
      x: startX + (col * horizontalSpacing),
      y: startY + (row * verticalSpacing)
    }
  }

  const autoLayoutNodes = () => {
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: getAutoPosition(node.data, index, nodes)
    }))

    setNodes(updatedNodes)
    toast.success('Layout reorganizado automaticamente!')
  }

  // Funções para edição com IA
  const editFlowWithAI = async () => {
    if (!aiEditDescription.trim()) {
      toast.error('Por favor, descreva as mudanças que deseja fazer')
      return
    }

    setAiEditGenerating(true)
    setAiEditStep('generating')

    try {
      console.log('🤖 Editando fluxo com IA:', aiEditDescription)

      // Preparar dados do fluxo atual de forma mais robusta
      const currentFlowData = {
        id: flow?.id,
        name: flow?.name || '',
        description: flow?.description || '',
        trigger_keywords: flow?.trigger_keywords || [],
        bot_id: flow?.bot_id,
        is_active: flow?.is_active !== undefined ? flow.is_active : true,
        is_default: flow?.is_default !== undefined ? flow.is_default : false,
        flow_data: {
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.data.nodeType || 'message',
            content: node.data.content || '',
            position: node.position || { x: 0, y: 0 },
            next: node.data.next || null,
            conditions: node.data.conditions || [],
            variable: node.data.variable || null,
            action: node.data.action || null
          })),
          edges: edges || [],
          viewport: { x: 0, y: 0, zoom: 1 }
        }
      }

      console.log('🤖 Dados preparados para IA:')
      console.log('🤖 - ID:', currentFlowData.id)
      console.log('🤖 - Nome:', currentFlowData.name)
      console.log('🤖 - Bot ID:', currentFlowData.bot_id)
      console.log('🤖 - Nodes:', currentFlowData.flow_data.nodes.length)

      const response = await fetch('/api/flows/edit-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          description: aiEditDescription,
          currentFlow: currentFlowData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('🤖 Erro da API:', errorData)
        throw new Error(errorData.error || 'Erro ao editar fluxo com IA')
      }

      const data = await response.json()
      console.log('🤖 Resposta da API:', data)

      if (!data.success || !data.flow) {
        throw new Error('Resposta inválida da API de edição')
      }

      // Mostrar análise da IA se disponível
      if (data.analysis) {
        console.log('🤖 Análise da IA:', data.analysis)
        setAiAnalysis(data.analysis)
        setAiEditStep('completed')
        toast.success('IA analisou e corrigiu o problema!', {
          duration: 5000
        })
      } else {
        setAiEditStep('completed')
        toast.success('Fluxo editado com sucesso!')
      }

      // Aplicar as mudanças
      if (data.flow && data.flow.flow_data && data.flow.flow_data.nodes) {
        console.log('🤖 Aplicando mudanças ao fluxo...')

        try {
          const reactFlowNodes = data.flow.flow_data.nodes.map((node, index) => ({
            id: node.id,
            type: 'default',
            position: node.position || getAutoPosition(node, index, data.flow.flow_data.nodes),
            data: {
              label: getNodeLabel(node, index),
              nodeType: node.type,
              content: node.content,
              stepNumber: getStepNumber(node, index),
              ...node
            },
            style: {
              background: `linear-gradient(135deg, ${getNodeColor(node.type)}, ${getNodeColor(node.type)}dd)`,
              color: 'white',
              border: `2px solid ${getNodeColor(node.type)}`,
              borderRadius: '12px',
              width: 200,
              minHeight: 80,
              fontSize: 11,
              fontWeight: 600,
              textAlign: 'center',
              padding: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }
          }))

          // Gerar edges se não existirem
          let reactFlowEdges = []
          if (data.flow.flow_data.edges && data.flow.flow_data.edges.length > 0) {
            reactFlowEdges = data.flow.flow_data.edges
          } else {
            reactFlowEdges = generateEdgesFromNodes(data.flow.flow_data.nodes)
          }

          console.log('🤖 Atualizando nodes:', reactFlowNodes.length)
          console.log('🤖 Atualizando edges:', reactFlowEdges.length)

          setNodes(reactFlowNodes)
          setEdges(reactFlowEdges)

          // Atualizar dados do fluxo
          setFlow({ ...flow, ...data.flow })

          console.log('🤖 Fluxo atualizado com sucesso!')

        } catch (updateError) {
          console.error('🤖 Erro ao aplicar mudanças:', updateError)
          throw new Error('Erro ao aplicar as mudanças no fluxo visual')
        }
      } else {
        throw new Error('Dados do fluxo editado são inválidos')
      }

      setAiEditStep('success')
      toast.success('Fluxo editado com sucesso pela IA!')

    } catch (error) {
      console.error('🤖 Erro ao editar fluxo com IA:', error)
      toast.error('Erro ao editar fluxo: ' + error.message)
      setAiEditStep('input')
    } finally {
      setAiEditGenerating(false)
    }
  }

  const resetAIEditDialog = () => {
    setAiEditDialogOpen(false)
    setAiEditDescription('')
    setAiEditStep('input')
    setAiEditGenerating(false)
    setAiAnalysis('')
  }

  const generateEdgesFromNodes = (flowNodes) => {
    const edges = []

    flowNodes.forEach(node => {
      if (node.next) {
        edges.push({
          id: `${node.id}-${node.next}`,
          source: node.id,
          target: node.next,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#2196f3',
            strokeWidth: 3,
            strokeDasharray: '5,5'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#2196f3'
          }
        })
      }

      if (node.conditions) {
        node.conditions.forEach((condition, index) => {
          if (condition.next) {
            edges.push({
              id: `${node.id}-${condition.next}-${index}`,
              source: node.id,
              target: condition.next,
              type: 'smoothstep',
              animated: true,
              label: condition.value || `Condição ${index + 1}`,
              style: {
                stroke: '#9c27b0',
                strokeWidth: 3
              },
              labelStyle: {
                fill: '#9c27b0',
                fontWeight: 600,
                fontSize: 12,
                backgroundColor: 'white',
                padding: '2px 6px',
                borderRadius: '4px'
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#9c27b0'
              }
            })
          }
        })
      }
    })

    return edges
  }

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = (event, node) => {
    setSelectedNode(node)
    setEditingNode({
      id: node.id,
      type: node.data.nodeType || 'message',
      data: {
        label: node.data.label,
        content: node.data.content || '',
        variable: node.data.variable || '',
        conditions: node.data.conditions || [],
        validation: node.data.validation || null,
        prompt: node.data.prompt || '',
        action: node.data.action || null
      }
    })
    setNodeDialogOpen(true)
  }

  const addNewNode = (nodeType) => {
    const newNodeId = `node_${Date.now()}`
    const newNode = {
      id: newNodeId,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: `${nodeTypes.find(nt => nt.type === nodeType)?.label}: ${newNodeId}`,
        nodeType: nodeType,
        content: ''
      },
      style: {
        background: getNodeColor(nodeType),
        color: 'white',
        border: '1px solid #222138',
        width: 180,
        fontSize: 12
      }
    }

    setNodes((nds) => nds.concat(newNode))
    setSelectedNode(newNode)
    setEditingNode({
      id: newNodeId,
      type: nodeType,
      data: {
        label: '',
        content: '',
        variable: '',
        conditions: [],
        validation: null,
        prompt: '',
        action: null
      }
    })
    setNodeDialogOpen(true)
  }

  const updateNode = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === editingNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: getNodeLabel({
                id: editingNode.id,
                type: editingNode.type,
                content: editingNode.data.content
              }),
              content: editingNode.data.content,
              variable: editingNode.data.variable,
              conditions: editingNode.data.conditions,
              validation: editingNode.data.validation,
              prompt: editingNode.data.prompt,
              action: editingNode.data.action,
              nodeType: editingNode.type
            }
          }
        }
        return node
      })
    )
    setNodeDialogOpen(false)
  }

  const deleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
  }

  const saveFlow = async (showToast = true) => {
    try {
      setSaving(true)

      // Converter ReactFlow nodes de volta para formato do fluxo
      const flowNodes = nodes.map(node => ({
        id: node.id,
        type: node.data.nodeType,
        content: node.data.content,
        variable: node.data.variable,
        conditions: node.data.conditions,
        validation: node.data.validation,
        prompt: node.data.prompt,
        action: node.data.action,
        position: node.position,
        next: getNodeNext(node.id)
      }))

      const updatedFlowData = {
        ...flow,
        flow_data: {
          nodes: flowNodes,
          edges: edges,
          viewport: { x: 0, y: 0, zoom: 1 }
        }
      }

      await flowsAPI.update(id, updatedFlowData)

      // Limpar cache do backend para aplicar mudanças imediatamente
      try {
        await fetch('/api/flows/clear-cache', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('✅ Cache do backend limpo')
      } catch (cacheError) {
        console.warn('⚠️ Não foi possível limpar cache:', cacheError)
      }

      if (showToast) {
        toast.success('Fluxo salvo e aplicado no WhatsApp!')
      }

    } catch (error) {
      console.error('Erro ao salvar fluxo:', error)
      if (showToast) {
        toast.error('Erro ao salvar fluxo')
      }
    } finally {
      setSaving(false)
    }
  }

  const getNodeNext = (nodeId) => {
    const outgoingEdge = edges.find(edge => edge.source === nodeId)
    return outgoingEdge ? outgoingEdge.target : null
  }



  // Funções para edição por código
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
    if (newValue === 1) {
      // Ao abrir a aba de código, carregar o JSON atual
      const currentFlowData = {
        name: flow?.name || '',
        description: flow?.description || '',
        trigger_keywords: flow?.trigger_keywords || [],
        is_active: flow?.is_active || false,
        is_default: flow?.is_default || false,
        priority: flow?.priority || 0,
        flow_data: {
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.data.nodeType || 'message',
            position: node.position,
            data: node.data
          })),
          edges: edges,
          viewport: { x: 0, y: 0, zoom: 1 }
        }
      }
      setFlowCode(JSON.stringify(currentFlowData, null, 2))
    }
  }

  const validateFlowCode = (code) => {
    try {
      const parsed = JSON.parse(code)

      if (!parsed.flow_data || !parsed.flow_data.nodes) {
        throw new Error('Campo "flow_data.nodes" é obrigatório')
      }

      if (!Array.isArray(parsed.flow_data.nodes) || parsed.flow_data.nodes.length === 0) {
        throw new Error('Deve haver pelo menos um nó no fluxo')
      }

      setCodeValidationError('')
      return true
    } catch (error) {
      setCodeValidationError(error.message)
      return false
    }
  }

  const handleCodeChange = (event) => {
    const newCode = event.target.value
    setFlowCode(newCode)

    if (newCode.trim()) {
      validateFlowCode(newCode)
    } else {
      setCodeValidationError('')
    }
  }

  const applyCodeChanges = async () => {
    console.log('🚀 DEBUG Frontend: applyCodeChanges CHAMADA!')
    console.log('🔧 DEBUG Frontend: flowCode:', flowCode)
    console.log('🔧 DEBUG Frontend: validateFlowCode result:', validateFlowCode(flowCode))

    if (!validateFlowCode(flowCode)) {
      console.log('❌ DEBUG Frontend: Código JSON inválido')
      toast.error('Código JSON inválido')
      return
    }

    try {
      const parsedFlow = JSON.parse(flowCode)

      console.log('🔧 DEBUG Frontend: Iniciando applyCodeChanges')
      console.log('🔧 DEBUG Frontend: Flow ID:', id)
      console.log('🔧 DEBUG Frontend: Dados a enviar:', parsedFlow)

      // Atualizar o fluxo no backend
      console.log('🔧 DEBUG Frontend: Chamando flowsAPI.update...')
      const response = await flowsAPI.update(id, parsedFlow)
      console.log('🔧 DEBUG Frontend: Resposta da API:', response)

      // Atualizar o estado local
      setFlow({ ...flow, ...parsedFlow })

      // Converter para ReactFlow
      if (parsedFlow.flow_data && parsedFlow.flow_data.nodes) {
        const reactFlowNodes = parsedFlow.flow_data.nodes.map(node => ({
          id: node.id,
          type: 'default',
          position: node.position || { x: Math.random() * 400, y: Math.random() * 400 },
          data: {
            label: getNodeLabel(node),
            nodeType: node.type,
            content: node.content,
            ...node.data
          },
          style: {
            background: getNodeColor(node.type),
            color: 'white',
            border: '1px solid #222138',
            width: 180,
            fontSize: 12
          }
        }))

        const reactFlowEdges = parsedFlow.flow_data.edges || []

        setNodes(reactFlowNodes)
        setEdges(reactFlowEdges)
      }

      toast.success('Fluxo atualizado com sucesso!')
      setCurrentTab(0) // Voltar para a aba visual
    } catch (error) {
      console.error('🔧 DEBUG Frontend: Erro ao aplicar mudanças:', error)
      console.error('🔧 DEBUG Frontend: Error response:', error.response)
      console.error('🔧 DEBUG Frontend: Error data:', error.response?.data)
      toast.error('Erro ao aplicar mudanças: ' + (error.response?.data?.error || error.message))
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Carregando editor...</Typography>
      </Box>
    )
  }

  if (!flow) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Fluxo não encontrado
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar Melhorado */}
      <Paper elevation={2} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar sx={{ minHeight: '64px !important', px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              {flow.name}
            </Typography>

            {/* Indicador de Status */}
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              {hasUnsavedChanges && !saving && (
                <Chip
                  label="Não salvo"
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
              {saving && (
                <Chip
                  label="Salvando..."
                  size="small"
                  color="info"
                  icon={<CircularProgress size={12} />}
                />
              )}
              {!hasUnsavedChanges && !saving && (
                <Chip
                  label="Salvo"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {/* Controles */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Auto-save Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  size="small"
                />
              }
              label="Auto-save"
              sx={{ mr: 2, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
            />

            <Button
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewDialogOpen(true)}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            >
              Visualizar
            </Button>



            <Button
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setAiEditDialogOpen(true)}
              variant="outlined"
              size="small"
              sx={{
                mr: 1,
                color: '#e91e63',
                borderColor: '#e91e63',
                '&:hover': {
                  backgroundColor: '#e91e63',
                  color: 'white'
                }
              }}
            >
              Editar com IA
            </Button>

            <Button
              startIcon={<SettingsIcon />}
              onClick={autoLayoutNodes}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            >
              Auto Layout
            </Button>

            <Button
              startIcon={<PlayIcon />}
              onClick={() => setWhatsappSimulatorOpen(true)}
              variant="contained"
              color="success"
              size="small"
              sx={{
                mr: 1,
                background: 'linear-gradient(45deg, #25d366 30%, #128c7e 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #128c7e 30%, #075e54 90%)',
                }
              }}
            >
              💬 Testar
            </Button>

            <Button
              onClick={() => navigate('/flows')}
              color="inherit"
              size="small"
            >
              Voltar
            </Button>
          </Box>
        </Toolbar>
      </Paper>

      {/* Abas Melhoradas */}
      <Paper elevation={1} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              minHeight: '48px',
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500
            }
          }}
        >
          <Tab
            label="Editor Visual"
            icon={<SettingsIcon />}
            iconPosition="start"
            sx={{ px: 3 }}
          />
          <Tab
            label="Editar por Código"
            icon={<CodeIcon />}
            iconPosition="start"
            sx={{ px: 3 }}
          />
        </Tabs>
      </Paper>

      {/* Legenda dos tipos de nós */}
      {currentTab === 0 && (
        <Paper sx={{ mx: 2, mt: 1, p: 2, backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1976d2' }}>
            📋 Legenda dos Nós do Fluxo:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip size="small" sx={{ backgroundColor: '#4caf50', color: 'white', fontWeight: 600 }} label="🚀 Início" />
            <Chip size="small" sx={{ backgroundColor: '#2196f3', color: 'white', fontWeight: 600 }} label="💬 Mensagem" />
            <Chip size="small" sx={{ backgroundColor: '#ff9800', color: 'white', fontWeight: 600 }} label="📝 Input" />
            <Chip size="small" sx={{ backgroundColor: '#9c27b0', color: 'white', fontWeight: 600 }} label="🔀 Condição" />
            <Chip size="small" sx={{ backgroundColor: '#e91e63', color: 'white', fontWeight: 600 }} label="🤖 IA" />
            <Chip size="small" sx={{ backgroundColor: '#f44336', color: 'white', fontWeight: 600 }} label="🏁 Fim" />
          </Box>
        </Paper>
      )}

      {/* Conteúdo das Abas */}
      {currentTab === 0 && (
        <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Melhorada */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: 320,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 320,
              boxSizing: 'border-box',
              position: 'relative',
              borderRight: '1px solid #e0e0e0',
              background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)'
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                🧩 Componentes
              </Typography>
              <IconButton
                onClick={() => setDrawerOpen(false)}
                size="small"
                sx={{
                  bgcolor: '#f5f5f5',
                  '&:hover': { bgcolor: '#e0e0e0' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Arraste ou clique para adicionar componentes ao fluxo
            </Typography>

            <List sx={{ p: 0 }}>
              {nodeTypes.map((nodeType) => (
                <ListItem
                  key={nodeType.type}
                  button
                  onClick={() => addNewNode(nodeType.type)}
                  sx={{
                    border: '2px solid transparent',
                    borderRadius: 2,
                    mb: 1.5,
                    p: 1.5,
                    background: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: nodeType.color,
                      backgroundColor: nodeType.color + '08',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <ListItemIcon sx={{
                    color: nodeType.color,
                    minWidth: 40,
                    '& svg': { fontSize: '1.5rem' }
                  }}>
                    {nodeType.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={nodeType.label}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Informações do Fluxo
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nós: {nodes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conexões: {edges.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {flow.is_active ? 'Ativo' : 'Inativo'}
              </Typography>
            </Box>

            {flow.trigger_keywords && flow.trigger_keywords.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Palavras-chave
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {flow.trigger_keywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* Área Principal do Editor Melhorada */}
        <Box sx={{
          flex: 1,
          position: 'relative',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: drawerOpen ? '0' : '8px 0 0 0'
        }}>
          {!drawerOpen && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 1000,
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <AddIcon />
            </IconButton>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{
              padding: 0.2,
              minZoom: 0.5,
              maxZoom: 1.5
            }}
            attributionPosition="bottom-left"
            style={{
              background: 'transparent',
              borderRadius: drawerOpen ? '0' : '8px 0 0 0'
            }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#1976d2',
              },
              style: {
                strokeWidth: 2,
                stroke: '#1976d2',
              },
            }}
          >
            <Controls
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <MiniMap
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              nodeColor="#1976d2"
              maskColor="rgba(25, 118, 210, 0.1)"
            />
            <Background
              variant="dots"
              gap={20}
              size={1.5}
              color="#e0e0e0"
            />

            <Panel position="top-right">
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                {selectedNode && (
                  <>
                    <Button
                      startIcon={<SettingsIcon />}
                      onClick={() => setNodeDialogOpen(true)}
                      variant="contained"
                      size="small"
                      sx={{
                        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteNode(selectedNode.id)}
                      color="error"
                      variant="outlined"
                      size="small"
                      sx={{
                        bgcolor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      Excluir
                    </Button>
                  </>
                )}
              </Box>
            </Panel>
          </ReactFlow>
        </Box>
      </Box>
      )}

      {/* Aba de Edição por Código */}
      {currentTab === 1 && (
        <Box sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Editar Fluxo por Código
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Edite o fluxo diretamente através do código JSON. Tenha cuidado ao fazer alterações.
          </Typography>

          {/* Editor de Código */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Código JSON do Fluxo:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={25}
              value={flowCode}
              onChange={handleCodeChange}
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
            />
          </Paper>

          {/* Validação */}
          {codeValidationError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Erro de validação:</strong> {codeValidationError}
              </Typography>
            </Alert>
          )}

          {flowCode && !codeValidationError && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>✅ JSON válido!</strong> Pronto para aplicar as mudanças.
              </Typography>
            </Alert>
          )}

          {/* Botões de Ação */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={applyCodeChanges}
              disabled={!flowCode || !!codeValidationError}
              startIcon={<SaveIcon />}
            >
              Aplicar Mudanças
            </Button>

            <Button
              variant="outlined"
              onClick={() => setCurrentTab(0)}
            >
              Voltar ao Editor Visual
            </Button>
          </Box>
        </Box>
      )}

      {/* Dialog de edição de nó */}
      <Dialog
        open={nodeDialogOpen}
        onClose={() => setNodeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Editar Nó: {nodeTypes.find(nt => nt.type === editingNode.type)?.label}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="ID do Nó"
              value={editingNode.id}
              disabled
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo do Nó</InputLabel>
              <Select
                value={editingNode.type}
                onChange={(e) => setEditingNode({
                  ...editingNode,
                  type: e.target.value
                })}
                label="Tipo do Nó"
              >
                {nodeTypes.map((nodeType) => (
                  <MenuItem key={nodeType.type} value={nodeType.type}>
                    {nodeType.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Campos específicos por tipo de nó */}
            {(editingNode.type === 'message' || editingNode.type === 'start') && (
              <TextField
                fullWidth
                label="Conteúdo da Mensagem"
                multiline
                rows={4}
                value={editingNode.data.content}
                onChange={(e) => setEditingNode({
                  ...editingNode,
                  data: { ...editingNode.data, content: e.target.value }
                })}
                placeholder="Digite a mensagem que será enviada..."
                sx={{ mb: 2 }}
              />
            )}

            {editingNode.type === 'input' && (
              <>
                <TextField
                  fullWidth
                  label="Pergunta/Prompt"
                  multiline
                  rows={3}
                  value={editingNode.data.content}
                  onChange={(e) => setEditingNode({
                    ...editingNode,
                    data: { ...editingNode.data, content: e.target.value }
                  })}
                  placeholder="Qual pergunta fazer ao usuário?"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Variável para salvar resposta"
                  value={editingNode.data.variable}
                  onChange={(e) => setEditingNode({
                    ...editingNode,
                    data: { ...editingNode.data, variable: e.target.value }
                  })}
                  placeholder="nome_da_variavel"
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {editingNode.type === 'ai' && (
              <>
                <TextField
                  fullWidth
                  label="Prompt para IA"
                  multiline
                  rows={4}
                  value={editingNode.data.prompt}
                  onChange={(e) => setEditingNode({
                    ...editingNode,
                    data: { ...editingNode.data, prompt: e.target.value }
                  })}
                  placeholder="Instruções para a IA sobre como responder..."
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Mensagem de Fallback"
                  value={editingNode.data.content}
                  onChange={(e) => setEditingNode({
                    ...editingNode,
                    data: { ...editingNode.data, content: e.target.value }
                  })}
                  placeholder="Mensagem caso a IA falhe"
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {editingNode.type === 'end' && (
              <TextField
                fullWidth
                label="Mensagem Final (opcional)"
                multiline
                rows={2}
                value={editingNode.data.content}
                onChange={(e) => setEditingNode({
                  ...editingNode,
                  data: { ...editingNode.data, content: e.target.value }
                })}
                placeholder="Mensagem de despedida..."
                sx={{ mb: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={updateNode} variant="contained">
            Salvar Nó
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de preview */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Preview do Fluxo</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {flow.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {flow.description}
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Estrutura:
            </Typography>
            <Typography variant="body2">
              • {nodes.length} nós
            </Typography>
            <Typography variant="body2">
              • {edges.length} conexões
            </Typography>

            {flow.trigger_keywords && flow.trigger_keywords.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
                  Palavras-chave:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {flow.trigger_keywords.map((keyword, index) => (
                    <Chip key={index} label={keyword} size="small" />
                  ))}
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de edição com IA */}
      <Dialog
        open={aiEditDialogOpen}
        onClose={resetAIEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(45deg, #e91e63 30%, #f06292 90%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <AutoAwesomeIcon />
          Editar Fluxo com Inteligência Artificial
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {aiEditStep === 'input' && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                🤖 Descreva as mudanças que você quer fazer no fluxo
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                Exemplo: "Adicionar uma opção de horário de funcionamento", "Incluir um menu de produtos", "Melhorar as mensagens de boas-vindas"
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Descreva as mudanças..."
                placeholder="Ex: Quero adicionar uma nova opção no menu principal para 'Promoções' que mostre os produtos em oferta e depois redirecione para o atendente."
                value={aiEditDescription}
                onChange={(e) => setAiEditDescription(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'white'
                  }
                }}
              />
            </Box>
          )}

          {aiEditStep === 'generating' && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ color: '#e91e63', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                🧠 IA está editando seu fluxo...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analisando o fluxo atual e aplicando as mudanças solicitadas
              </Typography>
            </Box>
          )}

          {aiEditStep === 'completed' && (
            <Box sx={{ py: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#4caf50', display: 'flex', alignItems: 'center', gap: 1 }}>
                ✅ Fluxo analisado e corrigido!
              </Typography>

              {aiAnalysis && (
                <Box sx={{
                  bgcolor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '12px',
                  p: 3,
                  mb: 2
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2', fontWeight: 600 }}>
                    🔍 Análise da IA:
                  </Typography>
                  <Typography variant="body2" sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    color: '#333'
                  }}>
                    {aiAnalysis}
                  </Typography>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary">
                As correções foram aplicadas ao seu fluxo. Você pode testar o fluxo ou continuar editando.
              </Typography>
            </Box>
          )}

          {aiEditStep === 'success' && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#4caf50' }}>
                ✅ Fluxo editado com sucesso!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                As mudanças foram aplicadas ao seu fluxo. Você pode continuar editando ou salvar as alterações.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={resetAIEditDialog} color="inherit">
            {aiEditStep === 'success' ? 'Fechar' : 'Cancelar'}
          </Button>

          {aiEditStep === 'input' && (
            <Button
              onClick={editFlowWithAI}
              variant="contained"
              disabled={!aiEditDescription.trim() || aiEditGenerating}
              startIcon={<SendIcon />}
              sx={{
                background: 'linear-gradient(45deg, #e91e63 30%, #f06292 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #c2185b 30%, #e91e63 90%)',
                }
              }}
            >
              Aplicar Mudanças com IA
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Simulador do WhatsApp */}
      <WhatsAppSimulator
        open={whatsappSimulatorOpen}
        onClose={() => setWhatsappSimulatorOpen(false)}
        flow={flow}
        botName={flow?.name || 'ChatBot'}
      />
    </Box>
  )
}

export default FlowEditor

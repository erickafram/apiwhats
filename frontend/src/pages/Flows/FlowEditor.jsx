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
  AccountTree as FlowIcon
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

  // Estados do editor
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)

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

  const loadFlow = async () => {
    try {
      const response = await flowsAPI.getById(id)
      const flowData = response.data
      setFlow(flowData)

      // Converter dados do fluxo para ReactFlow
      if (flowData.flow_data && flowData.flow_data.nodes) {
        const reactFlowNodes = flowData.flow_data.nodes.map(node => ({
          id: node.id,
          type: 'default',
          position: node.position || { x: Math.random() * 400, y: Math.random() * 400 },
          data: {
            label: getNodeLabel(node),
            nodeType: node.type,
            content: node.content,
            ...node
          },
          style: {
            background: getNodeColor(node.type),
            color: 'white',
            border: '1px solid #222138',
            width: 180,
            fontSize: 12
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

  const getNodeLabel = (node) => {
    const nodeType = nodeTypes.find(nt => nt.type === node.type)
    const typeLabel = nodeType ? nodeType.label : node.type

    if (node.content && node.content.length > 20) {
      return `${typeLabel}: ${node.content.substring(0, 20)}...`
    }

    return `${typeLabel}: ${node.id}`
  }

  const getNodeColor = (type) => {
    const nodeType = nodeTypes.find(nt => nt.type === type)
    return nodeType ? nodeType.color : '#666'
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
          markerEnd: {
            type: MarkerType.ArrowClosed,
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
              label: condition.value || `Condição ${index + 1}`,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
              style: { stroke: '#9c27b0' }
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

  const saveFlow = async () => {
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
      toast.success('Fluxo salvo com sucesso!')

    } catch (error) {
      console.error('Erro ao salvar fluxo:', error)
      toast.error('Erro ao salvar fluxo')
    } finally {
      setSaving(false)
    }
  }

  const getNodeNext = (nodeId) => {
    const outgoingEdge = edges.find(edge => edge.source === nodeId)
    return outgoingEdge ? outgoingEdge.target : null
  }

  const testFlow = async () => {
    try {
      await flowsAPI.test(id, { message: 'Teste do editor' })
      toast.success('Teste do fluxo executado!')
    } catch (error) {
      console.error('Erro ao testar fluxo:', error)
      toast.error('Erro ao testar fluxo')
    }
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
    if (!validateFlowCode(flowCode)) {
      toast.error('Código JSON inválido')
      return
    }

    try {
      const parsedFlow = JSON.parse(flowCode)

      // Atualizar o fluxo no backend
      await flowsAPI.update(id, parsedFlow)

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
      console.error('Erro ao aplicar mudanças:', error)
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
      {/* Toolbar */}
      <Paper elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Editor: {flow.name}
          </Typography>

          <Button
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Visualizar
          </Button>

          <Button
            startIcon={<PlayIcon />}
            onClick={testFlow}
            color="success"
            sx={{ mr: 1 }}
          >
            Testar
          </Button>

          <Button
            startIcon={<SaveIcon />}
            onClick={saveFlow}
            variant="contained"
            disabled={saving}
            sx={{ mr: 1 }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>

          <Button
            onClick={() => navigate('/flows')}
            color="inherit"
          >
            Voltar
          </Button>
        </Toolbar>
      </Paper>

      {/* Abas */}
      <Paper elevation={1}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Editor Visual" icon={<FlowIcon />} />
          <Tab label="Editar por Código" icon={<CodeIcon />} />
        </Tabs>
      </Paper>

      {/* Conteúdo das Abas */}
      {currentTab === 0 && (
        <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar com tipos de nós */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              position: 'relative'
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Componentes</Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <List>
              {nodeTypes.map((nodeType) => (
                <ListItem
                  key={nodeType.type}
                  button
                  onClick={() => addNewNode(nodeType.type)}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: nodeType.color + '20'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: nodeType.color }}>
                    {nodeType.icon}
                  </ListItemIcon>
                  <ListItemText primary={nodeType.label} />
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

        {/* Área principal do editor */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {!drawerOpen && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 1000,
                backgroundColor: 'background.paper'
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
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />

            <Panel position="top-right">
              <Box sx={{ display: 'flex', gap: 1 }}>
                {selectedNode && (
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => deleteNode(selectedNode.id)}
                    color="error"
                    variant="outlined"
                    size="small"
                  >
                    Excluir Nó
                  </Button>
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
    </Box>
  )
}

export default FlowEditor

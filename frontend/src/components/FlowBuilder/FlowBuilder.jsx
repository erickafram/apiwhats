import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
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
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Fab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Add as AddIcon,
  Message as MessageIcon,
  QuestionAnswer as QuestionIcon,
  SmartToy as AIIcon,
  CallSplit as ConditionIcon,
  Person as PersonIcon,
  PlayArrow as StartIcon,
  Stop as EndIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  AutoAwesome as MagicIcon
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import { flowsAPI } from '../../services/api'

// Tipos de blocos disponíveis para arrastar e soltar
const BLOCK_TYPES = [
  {
    id: 'welcome',
    name: 'Mensagem de Boas-vindas',
    icon: <MessageIcon />,
    color: '#4CAF50',
    description: 'Mensagem inicial para recepcionar o usuário',
    template: {
      type: 'message',
      content: '👋 Olá! Bem-vindo ao nosso atendimento!\n\nComo posso ajudá-lo hoje?'
    }
  },
  {
    id: 'menu',
    name: 'Menu de Opções',
    icon: <QuestionIcon />,
    color: '#2196F3',
    description: 'Menu com opções numeradas para o usuário escolher',
    template: {
      type: 'menu',
      content: 'Escolha uma das opções abaixo:',
      options: [
        { id: '1', text: 'Opção 1', description: 'Descrição da opção 1' },
        { id: '2', text: 'Opção 2', description: 'Descrição da opção 2' }
      ]
    }
  },
  {
    id: 'question',
    name: 'Capturar Informação',
    icon: <QuestionIcon />,
    color: '#FF9800',
    description: 'Fazer uma pergunta e capturar a resposta do usuário',
    template: {
      type: 'question',
      content: 'Qual é o seu nome?',
      variable: 'user_name',
      validation: 'required'
    }
  },
  {
    id: 'ai_response',
    name: 'Resposta com IA',
    icon: <AIIcon />,
    color: '#E91E63',
    description: 'Usar inteligência artificial para responder',
    template: {
      type: 'ai_response',
      content: 'A IA irá responder baseada no contexto da conversa',
      prompt: 'Você é um assistente prestativo. Responda de forma clara e objetiva.'
    }
  },
  {
    id: 'human_transfer',
    name: 'Transferir para Humano',
    icon: <PersonIcon />,
    color: '#9C27B0',
    description: 'Transferir conversa para um atendente humano',
    template: {
      type: 'transfer_human',
      content: '👨‍💼 Transferindo você para um de nossos atendentes...\n\nAguarde um momento!'
    }
  }
]

// Templates prontos para diferentes tipos de negócio
const BUSINESS_TEMPLATES = [
  {
    id: 'simple_support',
    name: 'Atendimento Simples',
    description: 'Fluxo básico de atendimento com menu e transferência para humano',
    icon: '🎧',
    blocks: [
      { type: 'welcome', content: '👋 Olá! Bem-vindo ao nosso atendimento!' },
      { 
        type: 'menu', 
        content: 'Como posso ajudá-lo?',
        options: [
          { id: '1', text: 'Informações sobre produtos' },
          { id: '2', text: 'Suporte técnico' },
          { id: '3', text: 'Falar com atendente' }
        ]
      },
      { type: 'human_transfer', content: 'Transferindo para atendente...' }
    ]
  },
  {
    id: 'lead_capture',
    name: 'Captura de Leads',
    description: 'Fluxo para capturar informações de leads interessados',
    icon: '🎯',
    blocks: [
      { type: 'welcome', content: '🎯 Olá! Que bom ter você aqui!' },
      { type: 'question', content: 'Qual é o seu nome?', variable: 'name' },
      { type: 'question', content: 'Qual é o seu WhatsApp?', variable: 'phone' },
      { type: 'question', content: 'Em que posso ajudá-lo?', variable: 'interest' },
      { type: 'message', content: 'Obrigado! Em breve entraremos em contato.' }
    ]
  },
  {
    id: 'ai_assistant',
    name: 'Assistente com IA',
    description: 'Chatbot inteligente que usa IA para responder perguntas',
    icon: '🤖',
    blocks: [
      { type: 'welcome', content: '🤖 Olá! Sou seu assistente inteligente!' },
      { type: 'ai_response', prompt: 'Você é um assistente prestativo. Responda perguntas de forma clara e educada.' },
      { type: 'human_transfer', content: 'Precisa falar com um humano? Transferindo...' }
    ]
  }
]

const FlowBuilder = ({ open, onClose, selectedBot, onFlowCreated, bots = [], editingFlow = null, isEditing = false }) => {
  const [step, setStep] = useState(0) // 0: template, 1: build, 2: config, 3: save
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [flowBlocks, setFlowBlocks] = useState([])
  const [flowConfig, setFlowConfig] = useState({
    name: '',
    description: '',
    trigger_keywords: [],
    is_active: true,
    is_default: false
  })
  const [editingBlock, setEditingBlock] = useState(null)
  const [editDialog, setEditDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [internalSelectedBot, setInternalSelectedBot] = useState(selectedBot || null)

  const steps = [
    'Escolher Template',
    'Construir Fluxo', 
    'Configurar Detalhes',
    'Salvar Fluxo'
  ]

  // Atualizar bot interno quando prop mudar
  useEffect(() => {
    if (selectedBot) {
      setInternalSelectedBot(selectedBot)
    }
  }, [selectedBot])

  // Carregar fluxo existente quando em modo de edição
  useEffect(() => {
    if (isEditing && editingFlow && open) {
      console.log('🔧 Carregando fluxo para edição:', editingFlow)
      
      // Pular para o passo de construção
      setStep(1)
      
      // Configurar dados do fluxo
      setFlowConfig({
        name: editingFlow.name || '',
        description: editingFlow.description || '',
        trigger_keywords: editingFlow.trigger_keywords || [],
        is_active: editingFlow.is_active !== undefined ? editingFlow.is_active : true,
        is_default: editingFlow.is_default !== undefined ? editingFlow.is_default : false
      })
      
      // Configurar bot
      if (editingFlow.bot_id) {
        setInternalSelectedBot(editingFlow.bot_id)
      }
      
      // Converter nós do fluxo para blocos visuais
      if (editingFlow.flow_data && editingFlow.flow_data.nodes) {
        const convertedBlocks = convertFlowNodesToBlocks(editingFlow.flow_data.nodes)
        setFlowBlocks(convertedBlocks)
      }
    }
  }, [isEditing, editingFlow, open])

  // Converter nós do fluxo para blocos visuais
  const convertFlowNodesToBlocks = (nodes) => {
    const blocks = []
    const processedNodes = new Set() // Evitar processar o mesmo nó duas vezes
    
    console.log('🔧 Iniciando conversão de', nodes.length, 'nós para blocos visuais')
    
    // Analisar o fluxo para identificar padrões de interação
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      
      // Pular nós já processados
      if (processedNodes.has(node.id)) continue
      
      // Pular nós que não são relevantes para blocos visuais
      if (node.type === 'start' || node.type === 'end') {
        processedNodes.add(node.id)
        continue
      }
      
      // Pular nós auxiliares que fazem parte de outros blocos
      if (node.id.includes('_input') || node.id.includes('_condition') || node.id.includes('_transfer')) {
        processedNodes.add(node.id)
        continue
      }
      
      let block = {
        id: `block_${blocks.length}`,
        position: blocks.length
      }
      
      console.log(`🔍 Processando nó: ${node.id} (${node.type})`)
      
      switch (node.type) {
        case 'message':
          // Verificar se tem nó de input relacionado
          const inputNode = nodes.find(n => n.id === `${node.id}_input`)
          const hasInputAfter = inputNode || (node.next && nodes.find(n => n.id === node.next && n.type === 'input'))
          
          // Verificar se contém opções numeradas (menu)
          const hasMenuOptions = node.content && 
            (/[1-9]️⃣|1\.|2\.|3\.|4\.|5\./.test(node.content) || 
             /opção|escolha|digite/i.test(node.content))
          
          if (hasInputAfter && !hasMenuOptions) {
            // É uma pergunta que captura informação
            block.type = 'question'
            block.content = node.content || ''
            block.variable = inputNode?.variable || node.next?.replace('_input', '') || 'user_response'
            
            // Marcar nós relacionados como processados
            processedNodes.add(node.id)
            if (inputNode) processedNodes.add(inputNode.id)
            
            console.log(`✅ Criado bloco QUESTION: ${block.content.substring(0, 30)}...`)
            
          } else if (hasMenuOptions) {
            // É um menu de opções
            block.type = 'menu'
            
            // Separar o texto principal das opções
            const fullContent = node.content || ''
            const optionPattern = /([1-9]️⃣|[1-9]\.)/
            const optionStart = fullContent.search(optionPattern)
            
            // Extrair apenas o texto principal (antes das opções)
            if (optionStart > 0) {
              block.content = fullContent.substring(0, optionStart).trim()
            } else {
              block.content = fullContent
            }
            
            // Remover texto comum que pode estar grudado no final
            block.content = block.content
              .replace(/\*Digite.*$/i, '')
              .replace(/\*Voltando.*$/i, '') 
              .replace(/\*Responda.*$/i, '')
              .trim()
            
            // Extrair opções do texto - funciona mesmo quando tudo está numa linha
            const options = []
            
            // Usar regex global para encontrar todas as opções no texto, mesmo se estiverem na mesma linha
            const globalOptionMatches = fullContent.matchAll(/([1-9])️⃣\s*([^1-9]*?)(?=[1-9]️⃣|\*|$)/g)
            
            for (const match of globalOptionMatches) {
              const optionId = match[1]
              let optionText = match[2].trim()
              
              // Limpar texto da opção (remover asteriscos, etc.)
              optionText = optionText.replace(/^\*|\*$/g, '').trim()
              
              if (optionText && optionText !== 'Opção') {
                options.push({
                  id: optionId,
                  text: optionText
                })
              }
            }
            
            // Se não encontrou opções com emoji, tentar com pontos (1. 2. 3.)
            if (options.length === 0) {
              const dotOptionMatches = fullContent.matchAll(/([1-9])\.\s*([^1-9\.]+?)(?=[1-9]\.|$)/g)
              
              for (const match of dotOptionMatches) {
                const optionId = match[1]
                let optionText = match[2].trim()
                
                optionText = optionText.replace(/^\*|\*$/g, '').trim()
                
                if (optionText && optionText !== 'Opção') {
                  options.push({
                    id: optionId,
                    text: optionText
                  })
                }
              }
            }
            
            // Se ainda não encontrou nada, usar as opções padrão
            block.options = options.length > 0 ? options : [
              { id: '1', text: 'Opção 1' },
              { id: '2', text: 'Opção 2' }
            ]
            
            // Marcar nós relacionados como processados
            processedNodes.add(node.id)
            const relatedInput = nodes.find(n => n.id === `${node.id}_input`)
            const relatedCondition = nodes.find(n => n.id === `${node.id}_condition`)
            if (relatedInput) processedNodes.add(relatedInput.id)
            if (relatedCondition) processedNodes.add(relatedCondition.id)
            
            console.log(`✅ Criado bloco MENU: ${block.options.map(o => `"${o.text}"`).join(', ')}`)
            
          } else {
            // Mensagem simples
            block.type = 'message'
            block.content = node.content || ''
            processedNodes.add(node.id)
            
            console.log(`✅ Criado bloco MESSAGE: ${block.content.substring(0, 30)}...`)
          }
          break
          
        case 'ai_response':
          block.type = 'ai_response'
          block.content = 'Resposta gerada por IA'
          block.prompt = node.data?.system_prompt || 'Você é um assistente prestativo.'
          processedNodes.add(node.id)
          
          console.log(`✅ Criado bloco AI_RESPONSE`)
          break
          
        case 'action':
          if (node.action === 'transfer_to_human') {
            block.type = 'human_transfer'
            block.content = node.content || 'Transferindo para atendente...'
          } else {
            block.type = 'message'
            block.content = node.content || `Ação: ${node.action}`
          }
          processedNodes.add(node.id)
          
          console.log(`✅ Criado bloco ACTION/TRANSFER`)
          break
          
        case 'input':
          // Input isolado - verificar se não faz parte de uma mensagem anterior
          const parentMessage = nodes.find(n => n.next === node.id && n.type === 'message')
          if (!parentMessage || processedNodes.has(parentMessage.id)) {
            block.type = 'question'
            block.content = 'Digite sua resposta:'
            block.variable = node.variable || 'user_input'
            processedNodes.add(node.id)
            
            console.log(`✅ Criado bloco INPUT isolado`)
          } else {
            // Pular - será processado junto com a mensagem pai
            processedNodes.add(node.id)
            continue
          }
          break
          
        case 'condition':
          // Condições geralmente fazem parte de menus - pular se não for independente
          processedNodes.add(node.id)
          console.log(`⏭️ Pulando CONDITION (faz parte de menu)`)
          continue
          
        default:
          // Para outros tipos, criar como mensagem genérica
          block.type = 'message'
          block.content = node.content || `Nó ${node.type}`
          processedNodes.add(node.id)
          
          console.log(`✅ Criado bloco DEFAULT: ${node.type}`)
      }
      
      if (block.type) {
        blocks.push(block)
      }
    }
    
    console.log(`🎉 Conversão finalizada: ${nodes.length} nós → ${blocks.length} blocos`)
    console.log('🔄 Blocos convertidos:', blocks.map(b => `${b.type}: ${b.content?.substring(0, 20)}...`))
    return blocks
  }

  // Aplicar template selecionado
  const applyTemplate = (template) => {
    setSelectedTemplate(template)
    setFlowBlocks(template.blocks.map((block, index) => ({
      id: `block_${index}`,
      ...block,
      position: index
    })))
    setFlowConfig(prev => ({
      ...prev,
      name: template.name,
      description: template.description
    }))
    setStep(1)
  }

  // Adicionar novo bloco
  const addBlock = (blockType) => {
    const template = BLOCK_TYPES.find(t => t.id === blockType)
    if (!template) return

    const newBlock = {
      id: `block_${Date.now()}`,
      position: flowBlocks.length,
      ...template.template
    }
    setFlowBlocks([...flowBlocks, newBlock])
  }

  // Editar bloco
  const editBlock = (block) => {
    setEditingBlock({ ...block })
    setEditDialog(true)
  }

  // Salvar edição do bloco
  const saveBlockEdit = () => {
    setFlowBlocks(prev => prev.map(block => 
      block.id === editingBlock.id ? editingBlock : block
    ))
    setEditDialog(false)
    setEditingBlock(null)
  }

  // Remover bloco
  const removeBlock = (blockId) => {
    setFlowBlocks(prev => prev.filter(block => block.id !== blockId))
  }

  // Mover bloco para cima/baixo
  const moveBlock = (blockId, direction) => {
    const currentIndex = flowBlocks.findIndex(b => b.id === blockId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= flowBlocks.length) return

    const newBlocks = [...flowBlocks]
    const [removed] = newBlocks.splice(currentIndex, 1)
    newBlocks.splice(newIndex, 0, removed)
    
    // Atualizar posições
    newBlocks.forEach((block, index) => {
      block.position = index
    })
    
    setFlowBlocks(newBlocks)
  }

  // Adicionar palavra-chave
  const addKeyword = () => {
    if (newKeyword.trim() && !flowConfig.trigger_keywords.includes(newKeyword.trim())) {
      setFlowConfig(prev => ({
        ...prev,
        trigger_keywords: [...prev.trigger_keywords, newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  // Remover palavra-chave
  const removeKeyword = (keyword) => {
    setFlowConfig(prev => ({
      ...prev,
      trigger_keywords: prev.trigger_keywords.filter(k => k !== keyword)
    }))
  }

  // Converter blocos para formato de fluxo
  const convertBlocksToFlow = () => {
    const nodes = []
    const edges = []

    // Nó de início
    nodes.push({
      id: 'start',
      type: 'start',
      position: { x: 100, y: 100 },
      next: flowBlocks.length > 0 ? flowBlocks[0].id : null
    })

    // Converter cada bloco
    flowBlocks.forEach((block, index) => {
      const yPosition = 200 + (index * 150)
      const nextBlockId = index < flowBlocks.length - 1 ? flowBlocks[index + 1].id : null

      switch (block.type) {
        case 'message':
          nodes.push({
            id: block.id,
            type: 'message',
            position: { x: 100, y: yPosition },
            content: block.content,
            next: nextBlockId
          })
          break

        case 'menu':
          // Extrair apenas o texto principal do menu (sem as opções)
          let menuContent = block.content.trim()
          
          // Se o conteúdo já contém opções, extrair apenas a parte antes das opções
          const optionPattern = /([1-9]️⃣|[1-9]\.)/
          const optionStart = menuContent.search(optionPattern)
          if (optionStart > 0) {
            menuContent = menuContent.substring(0, optionStart).trim()
          }
          
          // Garantir que o texto principal tenha formatação adequada
          if (!menuContent.includes('\n\n')) {
            // Adicionar quebra de linha após o título se não existir
            menuContent = menuContent.replace(/(\*[^*]+\*)([^*])/, '$1\n\n$2')
          }
          
          // Construir o menu completo com opções formatadas e quebras de linha
          const formattedOptions = block.options.map((opt, i) => `${opt.id}️⃣ ${opt.text}`).join('\n')
          const fullMenuContent = `${menuContent}\n\n${formattedOptions}\n\n*Digite o número da opção:*`
          
          // Nó de mensagem do menu
          nodes.push({
            id: block.id,
            type: 'message',
            position: { x: 100, y: yPosition },
            content: fullMenuContent,
            next: `${block.id}_input`
          })

          // Nó de captura de entrada
          nodes.push({
            id: `${block.id}_input`,
            type: 'input',
            position: { x: 100, y: yPosition + 50 },
            variable: `${block.id}_choice`,
            next: `${block.id}_condition`
          })

          // Nó de condição
          const conditions = block.options.map(opt => ({
            variable: `${block.id}_choice`,
            operator: 'equals',
            value: opt.id,
            next: nextBlockId || 'end'
          }))

          nodes.push({
            id: `${block.id}_condition`,
            type: 'condition',
            position: { x: 100, y: yPosition + 100 },
            conditions: conditions,
            fallback: nextBlockId || 'end'
          })
          break

        case 'input':
        case 'question':
          nodes.push({
            id: block.id,
            type: 'message',
            position: { x: 100, y: yPosition },
            content: block.content,
            next: `${block.id}_input`
          })

          nodes.push({
            id: `${block.id}_input`,
            type: 'input',
            position: { x: 100, y: yPosition + 50 },
            variable: block.variable || 'user_input',
            validation: block.validation,
            next: nextBlockId
          })
          break

        case 'ai_response':
          nodes.push({
            id: block.id,
            type: 'ai_response',
            position: { x: 100, y: yPosition },
            data: {
              system_prompt: block.prompt,
              temperature: 0.7,
              max_tokens: 500,
              fallback_message: 'Desculpe, não consegui processar sua mensagem.'
            },
            next: nextBlockId
          })
          break

        case 'transfer_human':
          nodes.push({
            id: block.id,
            type: 'message',
            position: { x: 100, y: yPosition },
            content: block.content,
            next: `${block.id}_transfer`
          })

          nodes.push({
            id: `${block.id}_transfer`,
            type: 'action',
            position: { x: 100, y: yPosition + 50 },
            action: 'transfer_to_human',
            next: nextBlockId
          })
          break

        default:
          nodes.push({
            id: block.id,
            type: 'message',
            position: { x: 100, y: yPosition },
            content: block.content || 'Mensagem não configurada',
            next: nextBlockId
          })
      }
    })

    // Nó de fim se necessário
    if (flowBlocks.length > 0) {
      const lastBlock = flowBlocks[flowBlocks.length - 1]
      if (lastBlock.type !== 'transfer_human') {
        nodes.push({
          id: 'end',
          type: 'message',
          position: { x: 100, y: 200 + (flowBlocks.length * 150) },
          content: 'Obrigado por usar nosso atendimento! 😊',
          next: null
        })
      }
    }

    // Criar edges baseados nos nós
    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i]
      if (currentNode.next) {
        edges.push({
          id: `${currentNode.id}-${currentNode.next}`,
          source: currentNode.id,
          target: currentNode.next,
          type: 'smoothstep'
        })
      }
    }

    return {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 }
    }
  }

  // Salvar fluxo
  const saveFlow = async () => {
    if (!flowConfig.name.trim()) {
      toast.error('Nome do fluxo é obrigatório')
      return
    }

    if (!internalSelectedBot) {
      toast.error('Selecione um bot')
      return
    }

    if (flowBlocks.length === 0) {
      toast.error('Adicione pelo menos um bloco ao fluxo')
      return
    }

    setSaving(true)
    try {
      const flowData = convertBlocksToFlow()
      
      const payload = {
        ...flowConfig,
        bot_id: internalSelectedBot,
        flow_data: flowData
      }

      console.log('💾 Salvando fluxo:', payload)

      if (isEditing && editingFlow) {
        // Atualizar fluxo existente
        await flowsAPI.update(editingFlow.id, payload)
      } else {
        // Criar novo fluxo
        await flowsAPI.create(payload)
      }
      
      toast.success(isEditing ? 'Fluxo atualizado com sucesso!' : 'Fluxo criado com sucesso!')
      onFlowCreated?.()
      handleClose()
    } catch (error) {
      console.error('Erro ao salvar fluxo:', error)
      toast.error('Erro ao salvar fluxo: ' + (error.response?.data?.error || error.message))
    } finally {
      setSaving(false)
    }
  }

  // Fechar e resetar
  const handleClose = () => {
    setStep(0)
    setSelectedTemplate(null)
    setFlowBlocks([])
    setFlowConfig({
      name: '',
      description: '',
      trigger_keywords: [],
      is_active: true,
      is_default: false
    })
    setEditingBlock(null)
    setEditDialog(false)
    setInternalSelectedBot(selectedBot || null)
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MagicIcon color="primary" />
            <Typography variant="h6">
              {isEditing ? 'Editar Fluxo com Construtor Visual' : 'Construtor de Fluxos Intuitivo'}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Stepper activeStep={step} orientation="horizontal" sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* PASSO 1: Escolher Template */}
            {step === 0 && !isEditing && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Escolha um template para começar:
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {BUSINESS_TEMPLATES.map((template) => (
                    <Grid item xs={12} sm={6} md={4} key={template.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 4 },
                          border: selectedTemplate?.id === template.id ? 2 : 0,
                          borderColor: 'primary.main'
                        }}
                        onClick={() => applyTemplate(template)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h4">{template.icon}</Typography>
                            <Typography variant="h6">{template.name}</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {template.description}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {template.blocks.length} blocos
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedTemplate({ name: 'Fluxo Personalizado', blocks: [] })
                    setStep(1)
                  }}
                  fullWidth
                >
                  Criar do Zero (Avançado)
                </Button>
              </Box>
            )}

            {/* PASSO 2: Construir Fluxo */}
            {step === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Construir seu fluxo:
                </Typography>

                <Grid container spacing={3}>
                  {/* Paleta de Blocos */}
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        🧩 Blocos Disponíveis
                      </Typography>
                      
                      <List dense>
                        {BLOCK_TYPES.map((blockType) => (
                          <ListItem
                            key={blockType.id}
                            button
                            onClick={() => addBlock(blockType.id)}
                            sx={{ 
                              border: 1, 
                              borderColor: 'divider', 
                              borderRadius: 1, 
                              mb: 1,
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            <ListItemIcon sx={{ color: blockType.color }}>
                              {blockType.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={blockType.name}
                              secondary={blockType.description}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>

                  {/* Canvas do Fluxo */}
                  <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, minHeight: 400 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        🔄 Seu Fluxo ({flowBlocks.length} blocos)
                      </Typography>

                      {flowBlocks.length === 0 ? (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          height: 200,
                          border: 2,
                          borderStyle: 'dashed',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}>
                          <Typography color="text.secondary">
                            Arraste blocos da paleta para começar
                          </Typography>
                        </Box>
                      ) : (
                        <List>
                          {flowBlocks.map((block, index) => (
                            <Paper key={block.id} sx={{ p: 2, mb: 1, backgroundColor: 'grey.50' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <DragIcon color="action" />
                                  <Typography variant="subtitle2">
                                    {index + 1}. {BLOCK_TYPES.find(t => t.template.type === block.type)?.name || block.type}
                                  </Typography>
                                </Box>

                                <Box>
                                  <IconButton size="small" onClick={() => editBlock(block)}>
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => removeBlock(block.id)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              </Box>

                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
                                {block.content?.substring(0, 100)}
                                {block.content?.length > 100 ? '...' : ''}
                              </Typography>
                            </Paper>
                          ))}
                        </List>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* PASSO 3: Configurar Detalhes */}
            {step === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Configurar detalhes do fluxo:
                </Typography>

                {bots.length === 0 && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Nenhum bot encontrado. Você precisa criar um bot primeiro para poder criar fluxos.
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Selecionar Bot *</InputLabel>
                      <Select
                        value={internalSelectedBot || ''}
                        onChange={(e) => setInternalSelectedBot(e.target.value)}
                        label="Selecionar Bot *"
                        required
                      >
                        {bots.map((bot) => (
                          <MenuItem key={bot.id} value={bot.id}>
                            {bot.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Nome do Fluxo"
                      value={flowConfig.name}
                      onChange={(e) => setFlowConfig(prev => ({ ...prev, name: e.target.value }))}
                      required
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="Descrição"
                      value={flowConfig.description}
                      onChange={(e) => setFlowConfig(prev => ({ ...prev, description: e.target.value }))}
                      multiline
                      rows={3}
                      sx={{ mb: 2 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch 
                          checked={flowConfig.is_active}
                          onChange={(e) => setFlowConfig(prev => ({ ...prev, is_active: e.target.checked }))}
                        />
                      }
                      label="Fluxo Ativo"
                      sx={{ mb: 2 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch 
                          checked={flowConfig.is_default}
                          onChange={(e) => setFlowConfig(prev => ({ ...prev, is_default: e.target.checked }))}
                        />
                      }
                      label="Fluxo Padrão"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Palavras-chave para ativar o fluxo:
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Nova palavra-chave"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      />
                      <Button variant="outlined" onClick={addKeyword}>
                        Adicionar
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {flowConfig.trigger_keywords.map((keyword) => (
                        <Chip
                          key={keyword}
                          label={keyword}
                          onDelete={() => removeKeyword(keyword)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    {flowConfig.trigger_keywords.length === 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Adicione palavras-chave para que o usuário possa ativar este fluxo
                      </Alert>
                    )}

                    {!internalSelectedBot && bots.length > 0 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Selecione um bot para poder salvar o fluxo
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* PASSO 4: Resumo e Salvar */}
            {step === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Resumo do seu fluxo:
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        📋 Informações Gerais
                      </Typography>
                      <Typography><strong>Bot:</strong> {bots.find(b => b.id === internalSelectedBot)?.name || 'Nenhum selecionado'}</Typography>
                      <Typography><strong>Nome:</strong> {flowConfig.name}</Typography>
                      <Typography><strong>Descrição:</strong> {flowConfig.description}</Typography>
                      <Typography><strong>Status:</strong> {flowConfig.is_active ? 'Ativo' : 'Inativo'}</Typography>
                      <Typography><strong>Padrão:</strong> {flowConfig.is_default ? 'Sim' : 'Não'}</Typography>
                      <Typography><strong>Palavras-chave:</strong> {flowConfig.trigger_keywords.join(', ') || 'Nenhuma'}</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        🔄 Estrutura do Fluxo
                      </Typography>
                      <Typography><strong>Total de blocos:</strong> {flowBlocks.length}</Typography>
                      <List dense>
                        {flowBlocks.map((block, index) => (
                          <ListItem key={block.id}>
                            <Typography variant="body2">
                              {index + 1}. {BLOCK_TYPES.find(t => t.template.type === block.type)?.name || block.type}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                </Grid>

                <Alert severity="success" sx={{ mt: 2 }}>
                  {isEditing 
                    ? 'Suas alterações estão prontas! Clique em "Atualizar Fluxo" para salvar.' 
                    : 'Seu fluxo está pronto para ser salvo! Clique em "Salvar Fluxo" para criar.'
                  }
                </Alert>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleClose}>
            Cancelar
          </Button>
          
          {step > 0 && (
            <Button onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          )}
          
          {step < 3 && (
            <Button 
              variant="contained" 
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !selectedTemplate}
            >
              Próximo
            </Button>
          )}
          
          {step === 3 && (
            <Button 
              variant="contained" 
              onClick={saveFlow}
              disabled={saving || !internalSelectedBot || !flowConfig.name.trim()}
              startIcon={saving ? <></> : <SaveIcon />}
            >
              {saving 
                ? (isEditing ? 'Atualizando...' : 'Salvando...') 
                : (isEditing ? 'Atualizar Fluxo' : 'Salvar Fluxo')
              }
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog de Edição de Bloco */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Editar Bloco: {BLOCK_TYPES.find(t => t.template.type === editingBlock?.type)?.name}
        </DialogTitle>
        <DialogContent>
          {editingBlock && (
            <Box sx={{ pt: 2 }}>
              {editingBlock.type === 'message' && (
                <TextField
                  fullWidth
                  label="Conteúdo da Mensagem"
                  value={editingBlock.content || ''}
                  onChange={(e) => setEditingBlock(prev => ({ ...prev, content: e.target.value }))}
                  multiline
                  rows={4}
                />
              )}

              {(editingBlock.type === 'input' || editingBlock.type === 'question') && (
                <Box>
                  <TextField
                    fullWidth
                    label="Pergunta"
                    value={editingBlock.content || ''}
                    onChange={(e) => setEditingBlock(prev => ({ ...prev, content: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Nome da Variável"
                    value={editingBlock.variable || ''}
                    onChange={(e) => setEditingBlock(prev => ({ ...prev, variable: e.target.value }))}
                    helperText="Nome para armazenar a resposta (ex: user_name, phone)"
                  />
                </Box>
              )}

              {editingBlock.type === 'ai_response' && (
                <TextField
                  fullWidth
                  label="Prompt para a IA"
                  value={editingBlock.prompt || ''}
                  onChange={(e) => setEditingBlock(prev => ({ ...prev, prompt: e.target.value }))}
                  multiline
                  rows={4}
                  helperText="Instrução para a IA sobre como responder"
                />
              )}

              {editingBlock.type === 'menu' && (
                <Box>
                  <TextField
                    fullWidth
                    label="Texto do Menu"
                    value={editingBlock.content || ''}
                    onChange={(e) => setEditingBlock(prev => ({ ...prev, content: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Opções do Menu:
                  </Typography>
                  
                  {editingBlock.options?.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        label="ID"
                        value={option.id}
                        onChange={(e) => {
                          const newOptions = [...editingBlock.options]
                          newOptions[index].id = e.target.value
                          setEditingBlock(prev => ({ ...prev, options: newOptions }))
                        }}
                        sx={{ width: 80 }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Texto da Opção"
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...editingBlock.options]
                          newOptions[index].text = e.target.value
                          setEditingBlock(prev => ({ ...prev, options: newOptions }))
                        }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          const newOptions = editingBlock.options.filter((_, i) => i !== index)
                          setEditingBlock(prev => ({ ...prev, options: newOptions }))
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const newOptions = [...(editingBlock.options || []), { id: '', text: '' }]
                      setEditingBlock(prev => ({ ...prev, options: newOptions }))
                    }}
                  >
                    Adicionar Opção
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveBlockEdit}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default FlowBuilder 
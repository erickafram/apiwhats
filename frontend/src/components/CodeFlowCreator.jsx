import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  Save as SaveIcon,
  Code as CodeIcon
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import { flowsAPI } from '../services/api'

const CodeFlowCreator = ({ bots, onFlowCreated }) => {
  const [code, setCode] = useState('')
  const [selectedBot, setSelectedBot] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [parsedFlow, setParsedFlow] = useState(null)

  // Exemplo de fluxo para venda de passagens
  const exampleFlow = {
    name: "Venda Rápida de Passagens",
    description: "Fluxo super otimizado para venda rápida de passagens de ônibus - resposta em segundos",
    trigger_keywords: ["passagem", "viagem", "ônibus", "onibus", "goiania", "goiânia", "brasilia", "brasília"],
    is_active: true,
    is_default: false,
    priority: 100,
    flow_data: {
      nodes: [
        {
          id: "start",
          type: "start",
          position: { x: 100, y: 100 },
          data: { label: "Início" }
        },
        {
          id: "quick_check",
          type: "message",
          position: { x: 100, y: 200 },
          data: {
            label: "Verificação Rápida",
            content: "🚌 *PASSAGENS DISPONÍVEIS*\n\nPara qual cidade você precisa?\n\n✅ *DESTINOS COM PASSAGENS:*\n• Goiânia - R$ 65,00\n• Brasília - R$ 85,00\n• São Paulo - R$ 120,00\n• Rio de Janeiro - R$ 150,00\n\n❌ *SEM PASSAGENS:* Outras cidades\n\nDigite o nome da cidade:"
          }
        },
        {
          id: "get_destination",
          type: "input",
          position: { x: 100, y: 300 },
          data: {
            label: "Capturar Destino",
            variable: "destination",
            validation: { type: "required" },
            errorMessage: "Por favor, digite o destino desejado."
          }
        },
        {
          id: "check_destination",
          type: "condition",
          position: { x: 100, y: 400 },
          data: {
            label: "Verificar Destino",
            conditions: [
              {
                variable: "destination",
                operator: "contains_any",
                value: ["goiania", "goiânia", "brasilia", "brasília"],
                next: "show_options"
              }
            ],
            defaultNext: "destination_not_available"
          }
        },
        {
          id: "destination_not_available",
          type: "message",
          position: { x: 300, y: 400 },
          data: {
            label: "Destino Indisponível",
            content: "😔 Infelizmente não temos passagens para este destino.\n\n✅ Atendemos apenas:\n• Goiânia - R$ 65,00\n• Brasília - R$ 85,00\n\nDigite uma dessas cidades ou 'sair':"
          }
        },
        {
          id: "show_options",
          type: "message",
          position: { x: 100, y: 500 },
          data: {
            label: "Mostrar Opções",
            content: "🎫 *PASSAGENS PARA {{destination}}*\n\n💰 Opções disponíveis HOJE:\n\n1️⃣ Convencional - R$ 65,00\n   Saída: 08:00 | Chegada: 14:00\n\n2️⃣ Executivo - R$ 85,00\n   Saída: 14:00 | Chegada: 20:00\n\n3️⃣ Falar com vendedor\n\nDigite o número da opção:"
          }
        },
        {
          id: "get_option",
          type: "input",
          position: { x: 100, y: 600 },
          data: {
            label: "Capturar Opção",
            variable: "ticket_option",
            validation: { type: "required" }
          }
        },
        {
          id: "process_option",
          type: "condition",
          position: { x: 100, y: 700 },
          data: {
            label: "Processar Opção",
            conditions: [
              {
                variable: "ticket_option",
                operator: "equals",
                value: "3",
                next: "transfer_human"
              }
            ],
            defaultNext: "confirm_purchase"
          }
        },
        {
          id: "confirm_purchase",
          type: "message",
          position: { x: 100, y: 800 },
          data: {
            label: "Confirmar Compra",
            content: "✅ *RESERVA CONFIRMADA!*\n\nDestino: {{destination}}\nOpção: {{ticket_option}}\n\n🎫 Passagem reservada por 15 minutos!\n\nNosso vendedor entrará em contato para finalizar.\n\n⏰ Aguarde..."
          }
        },
        {
          id: "transfer_human",
          type: "action",
          position: { x: 200, y: 800 },
          data: {
            label: "Transferir para Vendedor",
            action: "transfer_to_human",
            department: "vendas"
          }
        }
      ],
      edges: [
        { id: "e1", source: "start", target: "quick_check" },
        { id: "e2", source: "quick_check", target: "get_destination" },
        { id: "e3", source: "get_destination", target: "check_destination" },
        { id: "e4", source: "check_destination", target: "show_options" },
        { id: "e5", source: "check_destination", target: "destination_not_available" },
        { id: "e6", source: "destination_not_available", target: "get_destination" },
        { id: "e7", source: "show_options", target: "get_option" },
        { id: "e8", source: "get_option", target: "process_option" },
        { id: "e9", source: "process_option", target: "confirm_purchase" },
        { id: "e10", source: "process_option", target: "transfer_human" },
        { id: "e11", source: "confirm_purchase", target: "transfer_human" }
      ],
      viewport: { x: 0, y: 0, zoom: 1 }
    }
  }

  const validateJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      
      // Validações básicas
      if (!parsed.name) {
        throw new Error('Campo "name" é obrigatório')
      }
      
      if (!parsed.flow_data || !parsed.flow_data.nodes) {
        throw new Error('Campo "flow_data.nodes" é obrigatório')
      }

      if (!Array.isArray(parsed.flow_data.nodes) || parsed.flow_data.nodes.length === 0) {
        throw new Error('Deve haver pelo menos um nó no fluxo')
      }

      // Verificar se há nó de início
      const hasStartNode = parsed.flow_data.nodes.some(node => node.type === 'start')
      if (!hasStartNode) {
        throw new Error('Deve haver pelo menos um nó do tipo "start"')
      }

      setParsedFlow(parsed)
      setValidationError('')
      return true
    } catch (error) {
      setValidationError(error.message)
      setParsedFlow(null)
      return false
    }
  }

  const handleCodeChange = (event) => {
    const newCode = event.target.value
    setCode(newCode)
    
    if (newCode.trim()) {
      validateJSON(newCode)
    } else {
      setValidationError('')
      setParsedFlow(null)
    }
  }

  const handleCreateFlow = async () => {
    if (!selectedBot) {
      toast.error('Selecione um bot')
      return
    }

    if (!validateJSON(code)) {
      toast.error('Código JSON inválido')
      return
    }

    setLoading(true)
    try {
      const flowData = {
        ...parsedFlow,
        bot_id: selectedBot
      }

      await flowsAPI.create(flowData)
      toast.success('Fluxo criado com sucesso!')
      setCode('')
      setParsedFlow(null)
      setSelectedBot('')
      onFlowCreated()
    } catch (error) {
      console.error('Erro ao criar fluxo:', error)
      toast.error('Erro ao criar fluxo: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    setCode(JSON.stringify(exampleFlow, null, 2))
    validateJSON(JSON.stringify(exampleFlow, null, 2))
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Criar Fluxo por Código
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Crie fluxos complexos usando código JSON. Ideal para fluxos avançados e reutilização.
      </Typography>

      {/* Seleção do Bot */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Selecionar Bot</InputLabel>
        <Select
          value={selectedBot}
          onChange={(e) => setSelectedBot(e.target.value)}
          label="Selecionar Bot"
        >
          {bots.map((bot) => (
            <MenuItem key={bot.id} value={bot.id}>
              {bot.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Exemplo */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            📋 Exemplo: Fluxo de Venda de Passagens
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Este exemplo mostra um fluxo otimizado para venda rápida de passagens de ônibus.
            Clique no botão abaixo para carregar o exemplo no editor.
          </Typography>
          <Button
            variant="outlined"
            onClick={loadExample}
            startIcon={<PlayIcon />}
          >
            Carregar Exemplo
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Editor de Código */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Código JSON do Fluxo:
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={20}
          value={code}
          onChange={handleCodeChange}
          placeholder="Cole ou digite o código JSON do fluxo aqui..."
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
      {validationError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Erro de validação:</strong> {validationError}
          </Typography>
        </Alert>
      )}

      {parsedFlow && !validationError && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>✅ JSON válido!</strong> Fluxo "{parsedFlow.name}" com {parsedFlow.flow_data.nodes.length} nós detectado.
          </Typography>
        </Alert>
      )}

      {/* Botões de Ação */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleCreateFlow}
          disabled={!parsedFlow || !selectedBot || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Criando...' : 'Criar Fluxo'}
        </Button>
      </Box>
    </Box>
  )
}

export default CodeFlowCreator

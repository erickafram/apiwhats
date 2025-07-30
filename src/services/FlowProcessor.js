const { Message, Analytics } = require('../models');

class FlowProcessor {
  constructor() {
    this.nodeProcessors = {
      'start': this.processStartNode.bind(this),
      'ai_response': this.processAIResponseNode.bind(this),
      'fixed_response': this.processFixedResponseNode.bind(this),
      'condition': this.processConditionNode.bind(this),
      'input_capture': this.processInputCaptureNode.bind(this),
      'action': this.processActionNode.bind(this),
      'end': this.processEndNode.bind(this),
      'delay': this.processDelayNode.bind(this),
      'webhook': this.processWebhookNode.bind(this),
      'transfer_human': this.processTransferHumanNode.bind(this)
    };
  }

  async processMessage({ bot, flow, conversation, message, aiService }) {
    try {
      // Validar parâmetros
      if (!bot || !conversation || !flow) {
        console.error('❌ Parâmetros inválidos para processMessage:', {
          bot: !!bot,
          conversation: !!conversation,
          flow: !!flow
        });
        return { success: false, error: 'Parâmetros inválidos' };
      }

      // Registrar execução do fluxo
      try {
        await Analytics.recordMetric({
          botId: bot.id,
          type: 'flow_executed',
          flowId: flow.id,
          conversationId: conversation.id,
          userPhone: conversation.user_phone || conversation.phoneNumber
        });
      } catch (analyticsError) {
        console.log('⚠️ Erro ao registrar métrica (continuando):', analyticsError.message);
      }

      // Determinar nó atual
      let currentNodeId = conversation.current_node;
      
      // Se não há nó atual, começar pelo nó start
      if (!currentNodeId) {
        const startNode = flow.getStartNode();
        if (!startNode) {
          throw new Error('Fluxo não possui nó de início');
        }
        currentNodeId = startNode.id;
      }

      // Processar nó atual
      const result = await this.processNode({
        bot,
        flow,
        conversation,
        message,
        nodeId: currentNodeId,
        aiService
      });

      // Atualizar conversa com próximo nó
      if (result.nextNodeId) {
        await conversation.update({
          current_flow_id: flow.id,
          current_node: result.nextNodeId
        });
        
        conversation.addToFlowHistory(currentNodeId, result.nodeType);
        await conversation.save();
      }

      // Se o fluxo terminou, limpar estado
      if (result.completed) {
        await conversation.update({
          current_flow_id: null,
          current_node: null,
          status: 'completed',
          completed_at: new Date()
        });

        await Analytics.recordMetric({
          botId: bot.id,
          type: 'conversation_completed',
          flowId: flow.id,
          conversationId: conversation.id,
          userPhone: conversation.user_phone
        });
      }

      return result;

    } catch (error) {
      console.error('Erro no processamento do fluxo:', error);
      throw error;
    }
  }

  async processNode({ bot, flow, conversation, message, nodeId, aiService }) {
    try {
      const node = flow.getNodeById(nodeId);
      
      if (!node) {
        throw new Error(`Nó ${nodeId} não encontrado no fluxo`);
      }

      // Registrar execução do nó
      await Analytics.recordMetric({
        botId: bot.id,
        type: 'node_executed',
        flowId: flow.id,
        nodeId: nodeId,
        conversationId: conversation.id,
        userPhone: conversation.user_phone,
        metadata: {
          node_type: node.type
        }
      });

      const processor = this.nodeProcessors[node.type];
      
      if (!processor) {
        throw new Error(`Processador não encontrado para tipo de nó: ${node.type}`);
      }

      const result = await processor({
        bot,
        flow,
        conversation,
        message,
        node,
        aiService
      });

      return {
        ...result,
        nodeType: node.type,
        nodeId: nodeId
      };

    } catch (error) {
      console.error(`Erro ao processar nó ${nodeId}:`, error);
      throw error;
    }
  }

  async processStartNode({ bot, flow, conversation, message, node }) {
    const config = node.data || {};
    const startMessage = config.message || 'Olá! Como posso ajudá-lo?';
    
    // Enviar mensagem de início se configurada
    if (startMessage && !conversation.current_node) {
      await this.sendMessage(bot.id, conversation.user_phone, startMessage);
      
      await Message.create({
        conversation_id: conversation.id,
        direction: 'out',
        content: startMessage,
        media_type: 'text',
        status: 'sent',
        processed: true,
        node_id: node.id
      });
    }

    // Buscar próximo nó
    const nextNodes = flow.getNextNodes(node.id);
    const nextNodeId = nextNodes.length > 0 ? nextNodes[0].id : null;

    return {
      success: true,
      nextNodeId,
      completed: !nextNodeId
    };
  }

  async processFixedResponseNode({ bot, flow, conversation, message, node }) {
    const config = node.data || {};
    const responseMessage = config.message || 'Resposta automática';
    const delay = config.delay || 1000;
    const typingIndicator = config.typing_indicator !== false;

    // Simular digitação se configurado
    if (typingIndicator && delay > 0) {
      await this.sleep(delay);
    }

    // Enviar resposta
    await this.sendMessage(bot.id, conversation.user_phone, responseMessage);
    
    await Message.create({
      conversation_id: conversation.id,
      direction: 'out',
      content: responseMessage,
      media_type: 'text',
      status: 'sent',
      processed: true,
      node_id: node.id
    });

    // Buscar próximo nó
    const nextNodes = flow.getNextNodes(node.id);
    const nextNodeId = nextNodes.length > 0 ? nextNodes[0].id : null;

    return {
      success: true,
      nextNodeId,
      completed: !nextNodeId
    };
  }

  async processAIResponseNode({ bot, flow, conversation, message, node, aiService }) {
    const config = node.data || {};
    const systemPrompt = config.system_prompt || '';
    const temperature = config.temperature || 0.7;
    const maxTokens = config.max_tokens || 500;
    const fallbackMessage = config.fallback_message || 'Desculpe, não consegui processar sua mensagem.';

    try {
      // Preparar contexto
      const context = conversation.getContext();
      
      // Configuração da IA para este nó
      const aiConfig = {
        ...bot.ai_config,
        system_prompt: systemPrompt || bot.ai_config.system_prompt,
        temperature,
        max_tokens: maxTokens
      };

      // Gerar resposta com IA
      const aiResponse = await aiService.generateResponse({
        message: message.content,
        context,
        config: aiConfig,
        userPhone: conversation.user_phone
      });

      let responseContent = fallbackMessage;
      let aiGenerated = false;

      if (aiResponse && aiResponse.content) {
        responseContent = aiResponse.content;
        aiGenerated = true;
      }

      // Enviar resposta
      await this.sendMessage(bot.id, conversation.user_phone, responseContent);
      
      await Message.create({
        conversation_id: conversation.id,
        direction: 'out',
        content: responseContent,
        media_type: 'text',
        status: 'sent',
        processed: true,
        node_id: node.id,
        metadata: {
          ai_generated: aiGenerated,
          confidence_score: aiResponse?.confidence || null,
          model: aiConfig.model
        }
      });

      // Adicionar ao contexto
      conversation.addToContext(message.content, 'user');
      conversation.addToContext(responseContent, 'assistant');
      await conversation.save();

      // Registrar métrica de IA
      await Analytics.recordMetric({
        botId: bot.id,
        type: 'ai_request',
        flowId: flow.id,
        nodeId: node.id,
        conversationId: conversation.id,
        userPhone: conversation.user_phone,
        metadata: {
          model: aiConfig.model,
          confidence: aiResponse?.confidence || 0,
          success: aiGenerated
        }
      });

    } catch (error) {
      console.error('Erro na resposta de IA:', error);
      
      // Enviar mensagem de fallback
      await this.sendMessage(bot.id, conversation.user_phone, fallbackMessage);
      
      await Message.create({
        conversation_id: conversation.id,
        direction: 'out',
        content: fallbackMessage,
        media_type: 'text',
        status: 'sent',
        processed: true,
        node_id: node.id,
        metadata: {
          ai_generated: false,
          error: error.message
        }
      });
    }

    // Buscar próximo nó
    const nextNodes = flow.getNextNodes(node.id);
    const nextNodeId = nextNodes.length > 0 ? nextNodes[0].id : null;

    return {
      success: true,
      nextNodeId,
      completed: !nextNodeId
    };
  }

  async processConditionNode({ bot, flow, conversation, message, node }) {
    const config = node.data || {};
    const conditions = config.conditions || [];
    const operator = config.operator || 'AND';
    const fallbackPath = config.fallback_path;

    let conditionMet = false;

    try {
      // Avaliar condições
      const results = await Promise.all(
        conditions.map(condition => this.evaluateCondition(condition, message, conversation))
      );

      // Aplicar operador lógico
      if (operator === 'AND') {
        conditionMet = results.every(result => result);
      } else if (operator === 'OR') {
        conditionMet = results.some(result => result);
      }

    } catch (error) {
      console.error('Erro ao avaliar condições:', error);
      conditionMet = false;
    }

    // Determinar próximo nó baseado na condição
    const nextNodes = flow.getNextNodes(node.id);
    let nextNodeId = null;

    if (conditionMet && nextNodes.length > 0) {
      // Usar primeira saída (true path)
      nextNodeId = nextNodes[0].id;
    } else if (!conditionMet && nextNodes.length > 1) {
      // Usar segunda saída (false path)
      nextNodeId = nextNodes[1].id;
    } else if (fallbackPath) {
      // Usar caminho de fallback
      nextNodeId = fallbackPath;
    }

    return {
      success: true,
      nextNodeId,
      completed: !nextNodeId,
      conditionResult: conditionMet
    };
  }

  async evaluateCondition(condition, message, conversation) {
    const { type, field, operator, value } = condition;

    let fieldValue;

    switch (field) {
      case 'message_content':
        fieldValue = message.content.toLowerCase();
        break;
      case 'message_type':
        fieldValue = message.media_type;
        break;
      case 'user_phone':
        fieldValue = conversation.user_phone;
        break;
      case 'variable':
        fieldValue = conversation.getVariable(condition.variable_name);
        break;
      default:
        return false;
    }

    // Avaliar operador
    switch (operator) {
      case 'contains':
        return fieldValue && fieldValue.includes(value.toLowerCase());
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'starts_with':
        return fieldValue && fieldValue.startsWith(value.toLowerCase());
      case 'ends_with':
        return fieldValue && fieldValue.endsWith(value.toLowerCase());
      case 'regex':
        try {
          const regex = new RegExp(value, 'i');
          return regex.test(fieldValue);
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  async processInputCaptureNode({ bot, flow, conversation, message, node }) {
    const config = node.data || {};
    const variableName = config.variable_name;
    const inputType = config.input_type || 'text';
    const validation = config.validation || {};
    const retryMessage = config.retry_message || 'Por favor, digite uma resposta válida.';
    const maxRetries = config.max_retries || 3;

    // Validar entrada
    const isValid = this.validateInput(message.content, inputType, validation);

    if (!isValid) {
      // Incrementar contador de tentativas
      const retryCount = conversation.getVariable(`${variableName}_retry_count`) || 0;
      
      if (retryCount >= maxRetries) {
        // Máximo de tentativas atingido, prosseguir ou usar fallback
        const nextNodes = flow.getNextNodes(node.id);
        const nextNodeId = nextNodes.length > 1 ? nextNodes[1].id : (nextNodes.length > 0 ? nextNodes[0].id : null);
        
        return {
          success: false,
          nextNodeId,
          completed: !nextNodeId,
          error: 'Máximo de tentativas atingido'
        };
      }

      // Incrementar contador e solicitar nova entrada
      conversation.setVariable(`${variableName}_retry_count`, retryCount + 1);
      await conversation.save();

      // Enviar mensagem de retry
      await this.sendMessage(bot.id, conversation.user_phone, retryMessage);
      
      await Message.create({
        conversation_id: conversation.id,
        direction: 'out',
        content: retryMessage,
        media_type: 'text',
        status: 'sent',
        processed: true,
        node_id: node.id
      });

      // Permanecer no mesmo nó
      return {
        success: false,
        nextNodeId: node.id,
        completed: false,
        validation_error: true
      };
    }

    // Entrada válida, salvar variável
    if (variableName) {
      conversation.setVariable(variableName, message.content);
      conversation.setVariable(`${variableName}_retry_count`, 0); // Reset contador
      await conversation.save();
    }

    // Buscar próximo nó
    const nextNodes = flow.getNextNodes(node.id);
    const nextNodeId = nextNodes.length > 0 ? nextNodes[0].id : null;

    return {
      success: true,
      nextNodeId,
      completed: !nextNodeId,
      captured_value: message.content
    };
  }

  validateInput(input, type, validation) {
    if (validation.required && (!input || input.trim() === '')) {
      return false;
    }

    if (validation.min_length && input.length < validation.min_length) {
      return false;
    }

    if (validation.max_length && input.length > validation.max_length) {
      return false;
    }

    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
      
      case 'phone':
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(input);
      
      case 'number':
        return !isNaN(parseFloat(input));
      
      case 'text':
      default:
        return true;
    }
  }

  async processEndNode({ bot, flow, conversation, message, node }) {
    const config = node.data || {};
    const endMessage = config.message;
    const resetSession = config.reset_session || false;

    // Enviar mensagem de finalização se configurada
    if (endMessage) {
      await this.sendMessage(bot.id, conversation.user_phone, endMessage);
      
      await Message.create({
        conversation_id: conversation.id,
        direction: 'out',
        content: endMessage,
        media_type: 'text',
        status: 'sent',
        processed: true,
        node_id: node.id
      });
    }

    // Reset da sessão se configurado
    if (resetSession) {
      conversation.session_data = {
        variables: {},
        context: [],
        user_inputs: {},
        flow_history: [],
        ai_context: []
      };
      await conversation.save();
    }

    return {
      success: true,
      nextNodeId: null,
      completed: true
    };
  }

  async processDelayNode({ bot, flow, conversation, message, node }) {
    const config = node.data || {};
    const duration = config.duration || 2000;
    const typingIndicator = config.typing_indicator !== false;

    // Simular delay
    await this.sleep(duration);

    // Buscar próximo nó
    const nextNodes = flow.getNextNodes(node.id);
    const nextNodeId = nextNodes.length > 0 ? nextNodes[0].id : null;

    return {
      success: true,
      nextNodeId,
      completed: !nextNodeId
    };
  }

  async processActionNode({ bot, flow, conversation, message, node }) {
    // Implementação básica - pode ser expandida
    const nextNodes = flow.getNextNodes(node.id);
    const nextNodeId = nextNodes.length > 0 ? nextNodes[0].id : null;

    return {
      success: true,
      nextNodeId,
      completed: !nextNodeId
    };
  }

  async processWebhookNode({ bot, flow, conversation, message, node }) {
    const config = node.data || {};
    const {
      url,
      method = 'POST',
      headers = {},
      authentication = null,
      payload_template = {},
      retry_config = {},
      on_success_message = null,
      on_error_message = 'Ocorreu um erro ao processar sua solicitação.'
    } = config;

    if (!url) {
      console.error('URL do webhook não configurada');
      return {
        success: false,
        nextNodeId: null,
        completed: true,
        error: 'Webhook não configurado'
      };
    }

    try {
      // Preparar dados do webhook
      const webhookData = this.prepareWebhookData(payload_template, {
        conversation,
        message,
        bot,
        flow,
        node
      });

      // Executar webhook
      const WebhookService = require('./WebhookService');
      const webhookService = new WebhookService();

      const result = await webhookService.executeWebhook({
        url,
        method,
        headers,
        authentication,
        retry_config
      }, webhookData, {
        bot_id: bot.id,
        conversation_id: conversation.id,
        flow_id: flow.id,
        node_id: node.id,
        user_phone: conversation.user_phone,
        event_type: 'flow_webhook'
      });

      // Enviar mensagem de sucesso se configurada
      if (on_success_message) {
        await this.sendMessage(bot.id, conversation.user_phone, on_success_message);

        await Message.create({
          conversation_id: conversation.id,
          direction: 'out',
          content: on_success_message,
          media_type: 'text',
          status: 'sent',
          processed: true,
          node_id: node.id,
          metadata: {
            webhook_response: true,
            webhook_request_id: result.request_id
          }
        });
      }

      // Salvar resposta do webhook na sessão se necessário
      if (config.save_response_to_variable) {
        conversation.setVariable(config.save_response_to_variable, result.response_data);
        await conversation.save();
      }

      // Buscar próximo nó
      const nextNodes = flow.getNextNodes(node.id);
      const nextNodeId = nextNodes.length > 0 ? nextNodes[0].id : null;

      return {
        success: true,
        nextNodeId,
        completed: !nextNodeId,
        webhook_result: result
      };

    } catch (error) {
      console.error('Erro no webhook:', error);

      // Enviar mensagem de erro
      if (on_error_message) {
        await this.sendMessage(bot.id, conversation.user_phone, on_error_message);

        await Message.create({
          conversation_id: conversation.id,
          direction: 'out',
          content: on_error_message,
          media_type: 'text',
          status: 'sent',
          processed: true,
          node_id: node.id,
          metadata: {
            webhook_error: true,
            error_message: error.message
          }
        });
      }

      // Buscar próximo nó (caminho de erro se existir)
      const nextNodes = flow.getNextNodes(node.id);
      const nextNodeId = nextNodes.length > 1 ? nextNodes[1].id : (nextNodes.length > 0 ? nextNodes[0].id : null);

      return {
        success: false,
        nextNodeId,
        completed: !nextNodeId,
        error: error.message
      };
    }
  }

  prepareWebhookData(template, context) {
    const { conversation, message, bot, flow, node } = context;

    // Template padrão se não fornecido
    const defaultTemplate = {
      user_phone: '{{user_phone}}',
      user_name: '{{user_name}}',
      message_content: '{{message_content}}',
      conversation_id: '{{conversation_id}}',
      bot_id: '{{bot_id}}',
      timestamp: '{{timestamp}}'
    };

    const finalTemplate = { ...defaultTemplate, ...template };

    // Substituir variáveis
    const data = {};
    Object.keys(finalTemplate).forEach(key => {
      let value = finalTemplate[key];

      if (typeof value === 'string') {
        // Substituir variáveis do sistema
        value = value.replace(/{{user_phone}}/g, conversation.user_phone);
        value = value.replace(/{{user_name}}/g, conversation.user_name || conversation.user_phone);
        value = value.replace(/{{message_content}}/g, message.content);
        value = value.replace(/{{conversation_id}}/g, conversation.id);
        value = value.replace(/{{bot_id}}/g, bot.id);
        value = value.replace(/{{timestamp}}/g, new Date().toISOString());

        // Substituir variáveis da sessão
        const sessionVariables = conversation.getVariables();
        Object.keys(sessionVariables).forEach(varName => {
          const regex = new RegExp(`{{${varName}}}`, 'g');
          value = value.replace(regex, sessionVariables[varName]);
        });
      }

      data[key] = value;
    });

    return data;
  }

  async processTransferHumanNode({ bot, flow, conversation, message, node }) {
    const config = node.data || {};
    const transferMessage = config.message || 'Transferindo para um atendente humano...';
    const department = config.department || 'general';
    const priority = config.priority || 0;

    try {
      // Enviar mensagem de transferência
      await this.sendMessage(bot.id, conversation.user_phone, transferMessage);

      await Message.create({
        conversation_id: conversation.id,
        direction: 'out',
        content: transferMessage,
        media_type: 'text',
        status: 'sent',
        processed: true,
        node_id: node.id
      });

      // Adicionar à fila se o serviço estiver disponível
      if (global.queueService) {
        try {
          const queueItem = await global.queueService.addToQueue(
            conversation.id,
            department,
            priority,
            {
              transfer_reason: config.transfer_reason || 'user_request',
              flow_id: flow.id,
              node_id: node.id,
              original_message: message.content
            }
          );

          if (queueItem) {
            console.log(`Conversa ${conversation.id} adicionada à fila ${department}`);
          }
        } catch (queueError) {
          console.error('Erro ao adicionar à fila:', queueError);
          // Continuar mesmo se a fila falhar
        }
      } else {
        // Fallback: apenas atualizar status da conversa
        await conversation.update({
          status: 'transferred',
          metadata: {
            ...conversation.metadata,
            transfer_department: department,
            transfer_priority: priority,
            transferred_at: new Date(),
            transfer_node: node.id
          }
        });
      }

      return {
        success: true,
        nextNodeId: null,
        completed: true,
        transferred: true,
        department
      };

    } catch (error) {
      console.error('Erro na transferência humana:', error);

      // Enviar mensagem de erro
      const errorMessage = 'Desculpe, não foi possível transferir para um atendente no momento. Tente novamente mais tarde.';
      await this.sendMessage(bot.id, conversation.user_phone, errorMessage);

      await Message.create({
        conversation_id: conversation.id,
        direction: 'out',
        content: errorMessage,
        media_type: 'text',
        status: 'sent',
        processed: true,
        node_id: node.id,
        metadata: {
          transfer_error: true,
          error_message: error.message
        }
      });

      return {
        success: false,
        nextNodeId: null,
        completed: true,
        error: error.message
      };
    }
  }

  async sendMessage(botId, userPhone, content, mediaType = 'text') {
    try {
      await global.whatsappService.sendMessage(botId, userPhone, content, mediaType);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = FlowProcessor;

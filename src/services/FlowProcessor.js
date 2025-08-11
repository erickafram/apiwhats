const { Message, Analytics } = require('../models');

class FlowProcessor {
  constructor() {
    this.nodeProcessors = {
      'start': this.processStartNode.bind(this),
      'ai_response': this.processAIResponseNode.bind(this),
      'fixed_response': this.processFixedResponseNode.bind(this),
      'message': this.processMessageNode.bind(this), // Alias para fixed_response
      'condition': this.processConditionNode.bind(this),
      'input_capture': this.processInputCaptureNode.bind(this),
      'input': this.processInputCaptureNode.bind(this), // Alias para input_capture
      'action': this.processActionNode.bind(this),
      'end': this.processEndNode.bind(this),
      'delay': this.processDelayNode.bind(this),
      'webhook': this.processWebhookNode.bind(this),
      'transfer_human': this.processTransferHumanNode.bind(this),
      'ai': this.processAIResponseNode.bind(this), // Alias para ai_response
      'interactive_buttons': this.processInteractiveButtonsNode.bind(this) // Novo tipo de nó
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

      // Processar nó atual e continuar automaticamente se necessário
      let result = await this.processNode({
        bot,
        flow,
        conversation,
        message,
        nodeId: currentNodeId,
        aiService
      });

      // ✅ CORREÇÃO: Continuar automaticamente para nós que não esperam input do usuário
      // NOTA: 'input', 'input_capture' e 'interactive_buttons' NÃO devem estar aqui - eles esperam resposta do usuário
      const autoProcessTypes = ['start', 'message', 'fixed_response', 'action', 'ai_response', 'condition'];
      
      while (result.nextNodeId && autoProcessTypes.includes(result.nodeType)) {
        console.log(`🔄 Continuando automaticamente para nó: ${result.nextNodeId}`);
        
        // Atualizar conversa com próximo nó
        await conversation.update({
          current_flow_id: flow.id,
          current_node: result.nextNodeId
        });
        
        conversation.addToFlowHistory(currentNodeId, result.nodeType);
        await conversation.save();
        
        // Processar próximo nó automaticamente
        currentNodeId = result.nextNodeId;
        result = await this.processNode({
          bot,
          flow,
          conversation,
          message,
          nodeId: currentNodeId,
          aiService
        });
      }

      // Atualizar conversa com próximo nó final
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
    const startMessage = config.message || node.content;
    
    // ✅ CORREÇÃO: Só enviar mensagem se houver conteúdo configurado
    if (startMessage && startMessage.trim()) {
      await this.sendMessage(bot.id, conversation.user_phone, startMessage);
      
      await Message.create({
        bot_id: bot.id,
        conversation_id: conversation.id,
        sender_phone: conversation.user_phone,
        direction: 'outgoing',
        content: startMessage,
        message_type: 'text',
        metadata: {
          node_id: node.id,
          system_message: true
        }
      });
    }

    // Buscar próximo nó
    const nextNodes = flow.getNextNodes(node.id);
    const nextNodeId = nextNodes.length > 0 ? nextNodes[0].id : null;

    console.log(`🚀 DEBUG processStartNode: nodeId=${node.id}, nextNodeId=${nextNodeId}`);

    return {
      success: true,
      nextNodeId,
      completed: !nextNodeId
    };
  }

  async processFixedResponseNode({ bot, flow, conversation, message, node }) {
    const config = node.data || {};
    let responseMessage = config.message || 'Resposta automática';
    const delay = config.delay || 1000;
    const typingIndicator = config.typing_indicator !== false;

    // ✅ Interpolação de variáveis na mensagem
    responseMessage = this.interpolateVariables(responseMessage, conversation);

    // Simular digitação se configurado
    if (typingIndicator && delay > 0) {
      await this.sleep(delay);
    }

    // Enviar resposta
    await this.sendMessage(bot.id, conversation.user_phone, responseMessage);
    
    await Message.create({
      bot_id: bot.id,
      conversation_id: conversation.id,
      sender_phone: conversation.user_phone,
      direction: 'outgoing',
      content: responseMessage,
      message_type: 'text',
      metadata: {
        node_id: node.id,
        system_message: true
      }
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

  // Alias para processFixedResponseNode - compatibilidade com fluxos antigos
  async processMessageNode({ bot, flow, conversation, message, node }) {
    // Adaptar estrutura do nó legacy 'message' para formato esperado
    let messageContent = node.content || node.data?.content || node.data?.message || 'Resposta automática';
    
    // ✅ Interpolação de variáveis para nós do tipo 'message'
    messageContent = this.interpolateVariables(messageContent, conversation);
    
    const adaptedNode = {
      ...node,
      data: {
        message: messageContent,
        delay: node.data?.delay || 1000,
        typing_indicator: node.data?.typing_indicator !== false
      }
    };

    return await this.processFixedResponseNode({ bot, flow, conversation, message, node: adaptedNode });
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
        bot_id: bot.id,
        conversation_id: conversation.id,
        sender_phone: conversation.user_phone,
        direction: 'outgoing',
        content: responseContent,
        message_type: 'text',
        metadata: {
          node_id: node.id,
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
        bot_id: bot.id,
        conversation_id: conversation.id,
        sender_phone: conversation.user_phone,
        direction: 'outgoing',
        content: fallbackMessage,
        message_type: 'text',
        metadata: {
          node_id: node.id,
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
    let conditions = config.conditions || [];
    
    // ✅ CORREÇÃO: Suporte para condições diretas no nó (como no fluxo de passagens)
    if (!conditions.length && node.conditions) {
      conditions = node.conditions;
    }
    
    const operator = config.operator || 'AND';
    const fallbackPath = config.fallback_path;

    console.log(`🔧 DEBUG processConditionNode: node.id=${node.id}, conditions:`, conditions);

    try {
      // ✅ NOVO: Processar condições com destinos específicos (fluxo de passagens)
      for (const condition of conditions) {
        if (condition.next && condition.variable && condition.operator) {
          const variableValue = conversation.getVariable ? conversation.getVariable(condition.variable) : null;
          let messageContent = message.content.trim();
          
          // ✅ NOVO: Verificar se é resposta de botão interativo
          if (message.message_type === 'interactive' && message.metadata?.button_reply) {
            // Se for resposta de botão, usar o ID ou título do botão
            messageContent = message.metadata.button_reply.id || message.metadata.button_reply.title;
            console.log(`🔘 Resposta de botão detectada: ${messageContent}`);
          }
          
          console.log(`🔧 Verificando condição: ${condition.variable}=${variableValue} ${condition.operator} ${condition.value}, mensagem="${messageContent}"`);
          
          let matches = false;
          
          // Avaliar condição específica
          switch (condition.operator) {
            case 'equals':
              matches = (variableValue === condition.value) || (messageContent === condition.value);
              break;
            case 'contains':
              matches = messageContent.toLowerCase().includes(condition.value.toLowerCase());
              break;
            case 'button_id': // ✅ NOVO: Operador específico para botões
              matches = messageContent === condition.value;
              break;
            case 'default':
              // Usar como fallback se nenhuma outra condição for atendida
              break;
            default:
              matches = this.evaluateCondition(condition, message, conversation);
          }
          
          if (matches) {
            console.log(`✅ Condição atendida, indo para: ${condition.next}`);
            return {
              success: true,
              nextNodeId: condition.next,
              completed: false,
              conditionResult: true
            };
          }
        }
      }

      // ✅ Usar condição default se disponível
      const defaultCondition = conditions.find(c => c.operator === 'default');
      if (defaultCondition && defaultCondition.next) {
        console.log(`⚠️ Usando condição default, indo para: ${defaultCondition.next}`);
        return {
          success: true,
          nextNodeId: defaultCondition.next,
          completed: false,
          conditionResult: false
        };
      }

      // ✅ FALLBACK: Lógica original para condições simples
      const results = await Promise.all(
        conditions.map(condition => this.evaluateCondition(condition, message, conversation))
      );

      let conditionMet = false;
      if (operator === 'AND') {
        conditionMet = results.every(result => result);
      } else if (operator === 'OR') {
        conditionMet = results.some(result => result);
      }

      // Determinar próximo nó baseado na condição
      const nextNodes = flow.getNextNodes(node.id);
      let nextNodeId = null;

      if (conditionMet && nextNodes.length > 0) {
        nextNodeId = nextNodes[0].id;
      } else if (!conditionMet && nextNodes.length > 1) {
        nextNodeId = nextNodes[1].id;
      } else if (fallbackPath) {
        nextNodeId = fallbackPath;
      }

      return {
        success: true,
        nextNodeId,
        completed: !nextNodeId,
        conditionResult: conditionMet
      };

    } catch (error) {
      console.error('❌ Erro ao avaliar condições:', error);
      
      // Usar default como fallback em caso de erro
      const defaultCondition = conditions.find(c => c.operator === 'default');
      if (defaultCondition && defaultCondition.next) {
        return {
          success: true,
          nextNodeId: defaultCondition.next,
          completed: false,
          conditionResult: false
        };
      }
      
      return {
        success: false,
        nextNodeId: null,
        completed: true,
        error: error.message
      };
    }
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
    // ✅ CORREÇÃO: Suporte para ambos os formatos de variável
    const variableName = config.variable_name || node.variable || config.variable;
    const inputType = config.input_type || 'text';
    const validation = config.validation || {};
    const retryMessage = config.retry_message || 'Por favor, digite uma resposta válida.';
    const maxRetries = config.max_retries || 3;

    console.log(`🔧 DEBUG processInputCaptureNode: nodeId=${node.id}, variableName=${variableName}, messageContent="${message.content}"`);
    console.log(`🔧 DEBUG node properties:`, { 
      nodeVariable: node.variable, 
      configVariable: config.variable, 
      configVariableName: config.variable_name,
      nodeKeys: Object.keys(node)
    });

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
        bot_id: bot.id,
        conversation_id: conversation.id,
        sender_phone: conversation.user_phone,
        direction: 'outgoing',
        content: retryMessage,
        message_type: 'text',
        metadata: {
          node_id: node.id,
          retry_message: true
        }
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
        bot_id: bot.id,
        conversation_id: conversation.id,
        sender_phone: conversation.user_phone,
        direction: 'outgoing',
        content: endMessage,
        message_type: 'text',
        metadata: {
          node_id: node.id,
          end_message: true
        }
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
    const config = node.data || {};
    const action = config.action || node.action;
    
    console.log(`🎬 DEBUG processActionNode: nodeId=${node.id}, action=${JSON.stringify(action)}`);
    
    // Verificar se é uma transferência para operador
    if (action?.type === 'transfer_to_human' || node.id.includes('transferir') || node.id.includes('atendente')) {
      console.log('👨‍💼 Transferindo para operador humano...');
      
      // Alterar status da conversa para 'transferred'
      await conversation.update({
        status: 'transferred',
        priority: 1, // Alta prioridade para transferências
        metadata: {
          ...conversation.metadata,
          transfer_reason: action?.reason || 'Solicitação do cliente',
          transfer_timestamp: new Date(),
          transfer_from_node: node.id,
          awaiting_human: true
        }
      });
      
      // Registrar no histórico que foi transferida
      conversation.addToFlowHistory(node.id, 'action_transfer');
      await conversation.save();
      
      console.log(`✅ Conversa ID ${conversation.id} transferida para operador`);
      
      // ✅ NOVA: Emitir evento de conversa transferida para operadores
      if (global.io) {
        global.io.emit('conversation_transferred', {
          conversation: conversation,
          timestamp: new Date(),
          reason: action?.reason || 'Solicitação do cliente',
          type: 'transfer'
        });
        
        console.log(`🔔 Conversa transferida - Emitindo notificação: ${conversation.id}`);
      }
      
      // Retornar sem próximo nó - operador assumirá daqui
      return {
        success: true,
        nextNodeId: null,
        completed: false,
        transferred: true
      };
    }
    
    // Outras ações podem ser implementadas aqui
    switch (action?.type) {
      case 'save_data':
        console.log('💾 Salvando dados:', conversation.session_data?.variables);
        break;
        
      case 'send_email':
        console.log('📧 Enviando email...');
        break;
        
      case 'webhook':
        console.log('🔗 Chamando webhook...');
        break;
        
      default:
        console.log(`⚠️ Ação padrão ou não reconhecida: ${action?.type || 'nenhuma'}`);
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
          bot_id: bot.id,
          conversation_id: conversation.id,
          sender_phone: conversation.user_phone,
          direction: 'outgoing',
          content: on_success_message,
          message_type: 'text',
          metadata: {
            node_id: node.id,
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
          bot_id: bot.id,
          conversation_id: conversation.id,
          sender_phone: conversation.user_phone,
          direction: 'outgoing',
          content: on_error_message,
          message_type: 'text',
          metadata: {
            node_id: node.id,
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
        bot_id: bot.id,
        conversation_id: conversation.id,
        sender_phone: conversation.user_phone,
        direction: 'outgoing',
        content: transferMessage,
        message_type: 'text',
        metadata: {
          node_id: node.id,
          transfer_message: true
        }
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
        bot_id: bot.id,
        conversation_id: conversation.id,
        sender_phone: conversation.user_phone,
        direction: 'outgoing',
        content: errorMessage,
        message_type: 'text',
        metadata: {
          node_id: node.id,
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
      // Usar o serviço ativo (UltraMsg, Whapi, etc.)
      if (global.ultraMsgService) {
        await global.ultraMsgService.sendMessage(botId, userPhone, content, mediaType);
      } else if (global.whapiService) {
        await global.whapiService.sendMessage(botId, userPhone, content, mediaType);
      } else if (global.whatsappService) {
        await global.whatsappService.sendMessage(botId, userPhone, content, mediaType);
      } else {
        throw new Error('Nenhum serviço WhatsApp disponível');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  // ✅ NOVA FUNÇÃO: Processar nó de botões interativos
  async processInteractiveButtonsNode({ bot, flow, conversation, message, node }) {
    try {
      const config = node.data || {};
      const messageText = this.interpolateVariables(config.content || node.content, conversation);
      const buttons = config.buttons || [];

      if (!messageText) {
        throw new Error('Conteúdo da mensagem é obrigatório para botões interativos');
      }

      if (!buttons.length || buttons.length > 3) {
        throw new Error('Botões interativos devem ter entre 1 e 3 botões');
      }

      // Enviar mensagem com botões interativos
      await this.sendInteractiveMessage(bot.id, conversation.user_phone, {
        text: messageText,
        buttons: buttons.map((btn, index) => ({
          id: btn.id || `button_${index}`,
          title: btn.title || btn.text || `Opção ${index + 1}`
        })),
        footer: config.footer || null
      });

      // Salvar mensagem no banco
      await Message.create({
        bot_id: bot.id,
        conversation_id: conversation.id,
        sender_phone: conversation.user_phone,
        direction: 'outgoing',
        content: messageText,
        message_type: 'text', // Usar 'text' ao invés de 'interactive' por compatibilidade
        media_type: 'text',
        metadata: {
          node_id: node.id,
          buttons: buttons,
          system_message: true,
          interactive: true // Flag para identificar como interativo
        }
      });

      // ✅ NOVO: Definir próximo nó para processar a resposta do usuário
      // Encontrar o próximo nó (geralmente será um nó de condição)
      const nextNodes = flow.getNextNodes ? flow.getNextNodes(node.id) : [];
      const nextNodeId = nextNodes.length > 0 ? nextNodes[0].id : null;

      // Atualizar conversa para aguardar input no próximo nó
      if (nextNodeId) {
        await conversation.update({
          current_flow_id: flow.id,
          current_node: nextNodeId
        });
      }

      // Retornar sem processar próximo nó automaticamente - aguardar resposta do usuário
      return {
        success: true,
        nextNodeId: nextNodeId,
        completed: !nextNodeId,
        awaitingUserInput: true
      };

    } catch (error) {
      console.error('Erro ao processar nó de botões interativos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ NOVA FUNÇÃO: Enviar mensagem com botões interativos
  async sendInteractiveMessage(botId, userPhone, messageData) {
    try {
      // Usar o serviço ativo que suporta botões interativos
      if (global.ultraMsgService && global.ultraMsgService.sendInteractiveMessage) {
        await global.ultraMsgService.sendInteractiveMessage(botId, userPhone, messageData);
      } else if (global.whapiService && global.whapiService.sendInteractiveMessage) {
        await global.whapiService.sendInteractiveMessage(botId, userPhone, messageData);
      } else if (global.whatsappService && global.whatsappService.sendInteractiveMessage) {
        await global.whatsappService.sendInteractiveMessage(botId, userPhone, messageData);
      } else {
        // Fallback: enviar como mensagem de texto normal com opções numeradas
        const fallbackText = this.createFallbackButtonMessage(messageData);
        await this.sendMessage(botId, userPhone, fallbackText);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem interativa:', error);
      throw error;
    }
  }

  // ✅ NOVA FUNÇÃO: Criar mensagem fallback para botões
  createFallbackButtonMessage(messageData) {
    let text = messageData.text + '\n\n';
    
    messageData.buttons.forEach((button, index) => {
      text += `${index + 1}️⃣ ${button.title}\n`;
    });
    
    text += '\n*Digite o número da opção desejada:*';
    
    if (messageData.footer) {
      text += `\n\n_${messageData.footer}_`;
    }
    
    return text;
  }

  // ✅ NOVA FUNÇÃO: Interpolação de variáveis em mensagens
  interpolateVariables(message, conversation) {
    if (!message || typeof message !== 'string') return message;
    
    // Padrão para variáveis: ${nome_variavel}
    return message.replace(/\$\{([^}]+)\}/g, (match, variableName) => {
      const value = conversation.getVariable ? conversation.getVariable(variableName.trim()) : null;
      return value !== null && value !== undefined ? value : match;
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = FlowProcessor;

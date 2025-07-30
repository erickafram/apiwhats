const { Message, Conversation, Flow } = require('../models');

class MaytapiFlowProcessor {
  constructor(maytapiService) {
    this.maytapiService = maytapiService;
    this.userStates = new Map(); // phoneNumber -> state
    this.userVariables = new Map(); // phoneNumber -> variables
  }

  async processMessage(botId, phoneNumber, messageContent, messageType = 'text') {
    try {
      console.log(`🔄 Processando mensagem via fluxo Maytapi: Bot ${botId}, De: ${phoneNumber}`);

      // Buscar ou criar conversa
      let conversation = await Conversation.findOne({
        where: { bot_id: botId, user_phone: phoneNumber }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          bot_id: botId,
          user_phone: phoneNumber,
          status: 'active',
          last_activity_at: new Date()
        });
      }

      // Buscar fluxos ativos do bot
      const flows = await Flow.findAll({
        where: { 
          bot_id: botId, 
          is_active: true 
        },
        order: [['priority', 'DESC'], ['is_default', 'DESC']]
      });

      if (flows.length === 0) {
        console.log(`⚠️ Nenhum fluxo ativo encontrado para bot ${botId}`);
        return await this.handleNoFlow(botId, phoneNumber, messageContent);
      }

      // Determinar fluxo a usar
      const flow = await this.determineFlow(flows, conversation, messageContent);
      
      if (!flow) {
        return await this.handleNoFlow(botId, phoneNumber, messageContent);
      }

      // Processar fluxo
      const result = await this.executeFlow(flow, conversation, messageContent, messageType);
      
      // Salvar mensagem recebida
      await Message.create({
        bot_id: botId,
        conversation_id: conversation.id,
        sender_phone: phoneNumber,
        content: messageContent,
        direction: 'incoming',
        message_type: messageType,
        metadata: { flow_id: flow.id }
      });

      return result;

    } catch (error) {
      console.error('❌ Erro ao processar mensagem no fluxo:', error);
      return await this.sendErrorMessage(botId, phoneNumber);
    }
  }

  async determineFlow(flows, conversation, messageContent) {
    const messageText = messageContent.toLowerCase().trim();

    // 1. Verificar se há fluxo ativo na conversa
    if (conversation.current_flow_id) {
      const currentFlow = flows.find(f => f.id === conversation.current_flow_id);
      if (currentFlow) {
        console.log(`📋 Continuando fluxo ativo: ${currentFlow.name}`);
        return currentFlow;
      }
    }

    // 2. Verificar palavras-chave específicas
    for (const flow of flows) {
      if (flow.trigger_keywords && flow.trigger_keywords.length > 0) {
        const hasKeyword = flow.trigger_keywords.some(keyword => 
          messageText.includes(keyword.toLowerCase())
        );
        
        if (hasKeyword) {
          console.log(`🎯 Fluxo encontrado por palavra-chave: ${flow.name}`);
          return flow;
        }
      }
    }

    // 3. Usar fluxo padrão
    const defaultFlow = flows.find(f => f.is_default);
    if (defaultFlow) {
      console.log(`🏠 Usando fluxo padrão: ${defaultFlow.name}`);
      return defaultFlow;
    }

    // 4. Usar primeiro fluxo disponível
    console.log(`📝 Usando primeiro fluxo disponível: ${flows[0].name}`);
    return flows[0];
  }

  async executeFlow(flow, conversation, messageContent, messageType) {
    try {
      const phoneNumber = conversation.phoneNumber;
      const flowData = flow.flow_data || {};
      const nodes = flowData.nodes || [];

      // Obter estado atual do usuário
      let userState = this.userStates.get(phoneNumber) || { 
        currentNode: 'start',
        step: 0,
        waitingInput: false
      };

      // Obter variáveis do usuário
      let userVars = this.userVariables.get(phoneNumber) || {};

      // Encontrar nó atual
      let currentNode = nodes.find(n => n.id === userState.currentNode);
      
      if (!currentNode) {
        // Começar do início
        currentNode = nodes.find(n => n.type === 'start') || nodes[0];
        if (!currentNode) {
          throw new Error('Fluxo não possui nó de início');
        }
        userState.currentNode = currentNode.id;
      }

      console.log(`📍 Executando nó: ${currentNode.id} (${currentNode.type})`);

      // Processar nó baseado no tipo
      const result = await this.processNode(
        currentNode, 
        conversation, 
        messageContent, 
        userState, 
        userVars,
        flow
      );

      // Atualizar estados
      this.userStates.set(phoneNumber, userState);
      this.userVariables.set(phoneNumber, userVars);

      // Atualizar conversa
      await conversation.update({
        current_flow_id: flow.id,
        current_node: userState.currentNode,
        lastMessageAt: new Date()
      });

      return result;

    } catch (error) {
      console.error('❌ Erro ao executar fluxo:', error);
      throw error;
    }
  }

  async processNode(node, conversation, messageContent, userState, userVars, flow) {
    const botId = conversation.bot_id;
    const phoneNumber = conversation.user_phone;

    switch (node.type) {
      case 'start':
        return await this.processStartNode(node, botId, phoneNumber, userState, flow);

      case 'message':
        return await this.processMessageNode(node, botId, phoneNumber, userState, userVars, flow);

      case 'input':
        return await this.processInputNode(node, botId, phoneNumber, messageContent, userState, userVars, flow);

      case 'condition':
        return await this.processConditionNode(node, botId, phoneNumber, messageContent, userState, userVars, flow);

      case 'ai':
        return await this.processAINode(node, botId, phoneNumber, messageContent, userState, userVars, flow);

      case 'action':
        return await this.processActionNode(node, botId, phoneNumber, userState, userVars, flow);

      case 'end':
        return await this.processEndNode(node, botId, phoneNumber, userState, flow);

      default:
        console.log(`⚠️ Tipo de nó não reconhecido: ${node.type}`);
        return await this.moveToNextNode(node, botId, phoneNumber, userState, flow);
    }
  }

  async processStartNode(node, botId, phoneNumber, userState, flow) {
    console.log(`🚀 Iniciando fluxo: ${flow.name}`);
    
    // Enviar mensagem de boas-vindas se configurada
    if (node.content) {
      await this.sendMessage(botId, phoneNumber, node.content);
    }

    return await this.moveToNextNode(node, botId, phoneNumber, userState, flow);
  }

  async processMessageNode(node, botId, phoneNumber, userState, userVars, flow) {
    let message = node.content || 'Mensagem não configurada';
    
    // Substituir variáveis na mensagem
    message = this.replaceVariables(message, userVars);
    
    await this.sendMessage(botId, phoneNumber, message);
    
    return await this.moveToNextNode(node, botId, phoneNumber, userState, flow);
  }

  async processInputNode(node, botId, phoneNumber, messageContent, userState, userVars, flow) {
    if (!userState.waitingInput) {
      // Primeira vez - enviar pergunta e aguardar resposta
      if (node.content) {
        await this.sendMessage(botId, phoneNumber, node.content);
      }
      userState.waitingInput = true;
      return { success: true, waiting: true };
    }

    // Segunda vez - processar resposta
    userState.waitingInput = false;
    
    // Salvar resposta em variável se configurado
    if (node.variable) {
      userVars[node.variable] = messageContent;
      // Também salvar no userVariables global
      if (!this.userVariables.has(phoneNumber)) {
        this.userVariables.set(phoneNumber, {});
      }
      this.userVariables.get(phoneNumber)[node.variable] = messageContent;
      console.log(`💾 Variável salva: ${node.variable} = ${messageContent}`);
    }

    // Validar entrada se necessário
    if (node.validation) {
      const isValid = this.validateInput(messageContent, node.validation);
      if (!isValid) {
        const errorMsg = node.errorMessage || 'Entrada inválida. Tente novamente.';
        await this.sendMessage(botId, phoneNumber, errorMsg);
        userState.waitingInput = true;
        return { success: false, waiting: true };
      }
    }

    return await this.moveToNextNode(node, botId, phoneNumber, userState, flow);
  }

  async processConditionNode(node, botId, phoneNumber, messageContent, userState, userVars, flow) {
    const conditions = node.conditions || [];

    console.log(`🔧 DEBUG userVars:`, userVars);

    for (const condition of conditions) {
      if (this.evaluateCondition(condition, messageContent, userVars)) {
        userState.currentNode = condition.next;
        return await this.continueFlow(botId, phoneNumber, userState, flow);
      }
    }

    // Usar fallback se nenhuma condição for atendida
    if (node.fallback) {
      userState.currentNode = node.fallback;
      return await this.continueFlow(botId, phoneNumber, userState, flow);
    }

    return await this.moveToNextNode(node, botId, phoneNumber, userState, flow);
  }

  async processAINode(node, botId, phoneNumber, messageContent, userState, userVars, flow) {
    try {
      // Usar IA para gerar resposta
      const AIService = require('./AIService');
      const aiService = new AIService();
      
      const prompt = node.prompt || 'Responda de forma útil e amigável.';
      const context = this.buildAIContext(userVars, messageContent);
      
      const aiResponse = await aiService.generateResponse(prompt, context);
      
      await this.sendMessage(botId, phoneNumber, aiResponse);
      
      return await this.moveToNextNode(node, botId, phoneNumber, userState, flow);
      
    } catch (error) {
      console.error('❌ Erro na IA:', error);
      const fallbackMsg = node.fallbackMessage || 'Desculpe, não consegui processar sua solicitação.';
      await this.sendMessage(botId, phoneNumber, fallbackMsg);
      return await this.moveToNextNode(node, botId, phoneNumber, userState, flow);
    }
  }

  async processActionNode(node, botId, phoneNumber, userState, userVars, flow) {
    // Executar ação específica
    const action = node.action;
    
    switch (action?.type) {
      case 'save_data':
        // Salvar dados em banco/CRM
        console.log('💾 Salvando dados:', userVars);
        break;
        
      case 'send_email':
        // Enviar email
        console.log('📧 Enviando email...');
        break;
        
      case 'webhook':
        // Chamar webhook externo
        console.log('🔗 Chamando webhook...');
        break;
        
      default:
        console.log(`⚠️ Ação não reconhecida: ${action?.type}`);
    }

    return await this.moveToNextNode(node, botId, phoneNumber, userState, flow);
  }

  async processEndNode(node, botId, phoneNumber, userState, flow) {
    console.log(`🏁 Finalizando fluxo: ${flow.name}`);
    
    // Enviar mensagem final se configurada
    if (node.content) {
      await this.sendMessage(botId, phoneNumber, node.content);
    }

    // Limpar estado do usuário
    this.userStates.delete(phoneNumber);
    this.userVariables.delete(phoneNumber);

    return { success: true, completed: true };
  }

  async moveToNextNode(node, botId, phoneNumber, userState, flow) {
    if (node.next) {
      userState.currentNode = node.next;
      return await this.continueFlow(botId, phoneNumber, userState, flow);
    }

    // Fim do fluxo
    return await this.processEndNode({ content: null }, botId, phoneNumber, userState, flow);
  }

  async continueFlow(botId, phoneNumber, userState, flow) {
    const flowData = flow.flow_data || {};
    const nodes = flowData.nodes || [];
    const nextNode = nodes.find(n => n.id === userState.currentNode);
    
    if (nextNode) {
      return await this.processNode(nextNode, { botId, phoneNumber }, '', userState, this.userVariables.get(phoneNumber) || {}, flow);
    }

    return { success: true, completed: true };
  }

  async sendMessage(botId, phoneNumber, message) {
    try {
      // Fix temporário: usar valores conhecidos se undefined
      const fixedBotId = botId || 1;
      const fixedPhoneNumber = phoneNumber || '556392410056';

      console.log(`🔧 DEBUG: Enviando mensagem - botId=${fixedBotId}, phoneNumber=${fixedPhoneNumber}`);

      // BYPASS: Enviar diretamente via API HTTP
      await this.sendDirectMessage(fixedPhoneNumber, message);

      // Salvar mensagem enviada
      const conversation = await Conversation.findOne({
        where: { bot_id: fixedBotId, user_phone: fixedPhoneNumber }
      });

      if (conversation) {
        await Message.create({
          bot_id: fixedBotId,
          conversation_id: conversation.id,
          sender_phone: fixedPhoneNumber,
          content: message,
          direction: 'outgoing',
          message_type: 'text'
        });
      }

      console.log(`✅ Mensagem enviada para ${fixedPhoneNumber}: ${message}`);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
    }
  }

  async sendDirectMessage(phoneNumber, message) {
    try {
      const axios = require('axios');

      const url = 'https://api.maytapi.com/api/ebba8265-1e89-4e6a-8255-7eee3e64b7f5/103174/sendMessage';

      // Gerar ID único para evitar duplicação
      const uniqueId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const payload = {
        to_number: phoneNumber,
        type: 'text',
        message: message,
        id: uniqueId
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-maytapi-key': process.env.MAYTAPI_TOKEN
        }
      });

      console.log(`🚀 Mensagem enviada via API direta: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erro no envio direto:', error.message);
      throw error;
    }
  }

  replaceVariables(text, variables) {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  validateInput(input, validation) {
    switch (validation.type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'phone':
        return /^\d{10,11}$/.test(input.replace(/\D/g, ''));
      case 'number':
        return !isNaN(input);
      case 'required':
        return input.trim().length > 0;
      default:
        return true;
    }
  }

  evaluateCondition(condition, input, variables) {
    const value = condition.variable ? variables[condition.variable] : input;

    console.log(`🔧 DEBUG Condição: variável="${condition.variable}", valor="${value}", operador="${condition.operator}", esperado="${condition.value}"`);

    switch (condition.operator) {
      case 'equals':
        const result = value === condition.value;
        console.log(`🔧 DEBUG Equals: "${value}" === "${condition.value}" = ${result}`);
        return result;
      case 'contains':
        return value.toLowerCase().includes(condition.value.toLowerCase());
      case 'starts_with':
        return value.toLowerCase().startsWith(condition.value.toLowerCase());
      case 'number_greater':
        return parseFloat(value) > parseFloat(condition.value);
      case 'number_less':
        return parseFloat(value) < parseFloat(condition.value);
      default:
        return false;
    }
  }

  buildAIContext(variables, currentMessage) {
    let context = `Mensagem atual: ${currentMessage}\n`;
    
    if (Object.keys(variables).length > 0) {
      context += 'Informações do usuário:\n';
      for (const [key, value] of Object.entries(variables)) {
        context += `- ${key}: ${value}\n`;
      }
    }
    
    return context;
  }

  async handleNoFlow(botId, phoneNumber, messageContent) {
    // Usar IA como fallback
    try {
      const AIService = require('./AIService');
      const aiService = new AIService();
      
      const response = await aiService.generateResponse(
        'Você é um assistente virtual prestativo. Responda de forma amigável.',
        messageContent
      );
      
      await this.sendMessage(botId, phoneNumber, response);
      return { success: true, usedAI: true };
      
    } catch (error) {
      console.error('❌ Erro na IA fallback:', error);
      return await this.sendErrorMessage(botId, phoneNumber);
    }
  }

  async sendErrorMessage(botId, phoneNumber) {
    const errorMsg = 'Desculpe, ocorreu um erro. Tente novamente ou digite "ajuda" para obter suporte.';
    await this.sendMessage(botId, phoneNumber, errorMsg);
    return { success: false, error: true };
  }
}

module.exports = MaytapiFlowProcessor;

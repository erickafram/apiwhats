const { Bot, Flow, Conversation, Message, Analytics } = require('../models');
const FlowProcessor = require('./FlowProcessor');
const AIService = require('./AIService');

class BotManager {
  constructor(io) {
    this.io = io;
    this.flowProcessor = new FlowProcessor();
    this.aiService = new AIService();
    this.activeBots = new Map(); // botId -> bot config
  }

  async initialize() {
    try {
      // Carregar bots ativos
      const activeBots = await Bot.findAll({
        where: { is_active: true },
        include: [
          {
            model: Flow,
            as: 'flows',
            where: { is_active: true },
            required: false
          }
        ]
      });

      for (const bot of activeBots) {
        this.activeBots.set(bot.id, {
          bot,
          flows: bot.flows || [],
          lastActivity: new Date()
        });

        // Conectar bot automaticamente se usar UltraMsg
        if (global.ultraMsgService && process.env.USE_ULTRAMSG === 'true') {
          try {
            await global.ultraMsgService.connectBot(bot.id);
          } catch (error) {
            console.error(`❌ Erro ao conectar bot ${bot.id} automaticamente via UltraMsg:`, error.message);
          }
        }
        // Conectar bot automaticamente se usar Maytapi
        else if (global.maytapiService && process.env.USE_MAYTAPI === 'true') {
          try {
            await global.maytapiService.connectBot(bot.id);
          } catch (error) {
            console.error(`❌ Erro ao conectar bot ${bot.id} automaticamente:`, error.message);
          }
        }
      }

      console.log(`BotManager inicializado com ${activeBots.length} bots ativos`);
    } catch (error) {
      console.error('Erro ao inicializar BotManager:', error);
    }
  }

  async processMessage(botId, conversation, message) {
    try {
      const startTime = Date.now();
      
      // Verificar se o bot está ativo
      if (!this.activeBots.has(botId)) {
        await this.loadBot(botId);
      }

      const botConfig = this.activeBots.get(botId);
      if (!botConfig) {
        console.error(`Bot ${botId} não encontrado`);
        return;
      }

      // Registrar métrica de mensagem recebida
      await Analytics.recordMetric({
        botId,
        type: 'message_received',
        conversationId: conversation.id,
        userPhone: conversation.user_phone
      });

      // Determinar fluxo a ser executado
      const flow = await this.determineFlow(botConfig, conversation, message);
      
      if (!flow) {
        console.log('❌ Nenhum fluxo encontrado - enviando mensagem padrão');
        // Se não há fluxo, enviar mensagem padrão (sem IA para evitar duplicação)
        await this.sendDefaultMessage(botConfig.bot.id, conversation);
        return;
      }

      console.log(`✅ Fluxo selecionado: ${flow.name} (ID: ${flow.id})`);

      // Processar através do fluxo
      const result = await this.flowProcessor.processMessage({
        bot: botConfig.bot,
        flow,
        conversation,
        message,
        aiService: this.aiService
      });

      // Registrar tempo de processamento
      const processingTime = Date.now() - startTime;
      await message.update({ 
        processed: true,
        processing_time: processingTime 
      });

      // Registrar métrica de tempo de resposta
      await Analytics.recordMetric({
        botId,
        type: 'response_time',
        value: processingTime,
        conversationId: conversation.id,
        flowId: flow.id,
        userPhone: conversation.user_phone
      });

      // Atualizar última atividade do bot
      botConfig.lastActivity = new Date();

    } catch (error) {
      console.error(`Erro ao processar mensagem para bot ${botId}:`, error);
      
      // Registrar erro
      await Analytics.recordMetric({
        botId,
        type: 'error_occurred',
        conversationId: conversation.id,
        userPhone: conversation.user_phone,
        metadata: {
          error: error.message,
          stack: error.stack
        }
      });

      // Enviar mensagem de erro genérica
      await this.sendErrorMessage(botId, conversation);
    }
  }

  async determineFlow(botConfig, conversation, message) {
    try {
      const { flows } = botConfig;
      
      console.log('🔍 DEBUG determineFlow:', {
        botId: botConfig.bot.id,
        messageContent: message.content,
        flowsCount: flows ? flows.length : 0,
        conversationFlowId: conversation.current_flow_id
      });
      
      if (!flows || flows.length === 0) {
        console.log('❌ Nenhum fluxo encontrado para o bot');
        return null;
      }

      // Log dos fluxos disponíveis
      flows.forEach(flow => {
        console.log(`📋 Fluxo disponível: ID=${flow.id}, Nome="${flow.name}", Ativo=${flow.is_active}, Padrão=${flow.is_default}, Keywords=${JSON.stringify(flow.trigger_keywords)}`);
      });

      // ✅ CORREÇÃO: Verificar primeiro se há keywords de reinício
      const messageText = message.content.toLowerCase();
      console.log(`🔍 Buscando fluxo para mensagem: "${messageText}"`);
      
      // Verificar se alguma keyword de reinício foi detectada
      let restartFlow = null;
      for (const flow of flows) {
        if (flow.trigger_keywords && flow.trigger_keywords.length > 0) {
          console.log(`🔍 Verificando keywords do fluxo "${flow.name}":`, flow.trigger_keywords);
          const hasKeyword = flow.trigger_keywords.some(keyword => {
            const match = messageText.includes(keyword.toLowerCase());
            console.log(`  - "${keyword}" em "${messageText}": ${match}`);
            return match;
          });
          
          if (hasKeyword) {
            console.log(`✅ Fluxo encontrado por keyword: ${flow.name}`);
            restartFlow = flow;
            break;
          }
        }
      }

      // Se uma keyword foi detectada, reiniciar o fluxo
      if (restartFlow) {
        console.log(`🔄 Reiniciando fluxo devido a keyword: ${restartFlow.name}`);
        // Limpar estado atual para reiniciar do início
        await conversation.update({
          current_flow_id: restartFlow.id,
          current_node: null,
          session_data: {
            ...conversation.session_data,
            variables: {},
            flow_history: []
          }
        });
        return restartFlow;
      }

      // Se a conversa já tem um fluxo ativo e não há keyword de reinício, continuar
      if (conversation.current_flow_id) {
        const currentFlow = flows.find(f => f.id === conversation.current_flow_id);
        if (currentFlow && currentFlow.is_active) {
          console.log(`✅ Continuando fluxo ativo: ${currentFlow.name}`);
          return currentFlow;
        }
      }

      // Usar fluxo padrão se disponível
      const defaultFlow = flows.find(f => f.is_default && f.is_active);
      if (defaultFlow) {
        console.log(`✅ Usando fluxo padrão: ${defaultFlow.name}`);
        return defaultFlow;
      }

      // Usar primeiro fluxo ativo
      const firstActiveFlow = flows.find(f => f.is_active);
      if (firstActiveFlow) {
        console.log(`✅ Usando primeiro fluxo ativo: ${firstActiveFlow.name}`);
        return firstActiveFlow;
      }

      console.log('❌ Nenhum fluxo adequado encontrado');
      return null;

    } catch (error) {
      console.error('Erro ao determinar fluxo:', error);
      return null;
    }
  }

  async handleWithAI(botConfig, conversation, message) {
    try {
      const { bot } = botConfig;
      
      if (!bot.ai_config || !bot.ai_config.enabled) {
        // Se IA não está habilitada, enviar mensagem padrão
        await this.sendDefaultMessage(bot.id, conversation);
        return;
      }

      // Preparar contexto da conversa
      const context = conversation.getContext();
      
      // Gerar resposta com IA
      const aiResponse = await this.aiService.generateResponse({
        message: message.content,
        context,
        config: bot.ai_config,
        userPhone: conversation.user_phone
      });

      if (aiResponse) {
        // Enviar resposta
        // Usar o serviço ativo (UltraMsg, Whapi, etc.)
        if (global.ultraMsgService) {
          await global.ultraMsgService.sendMessage(bot.id, conversation.user_phone, aiResponse.content);
        } else if (global.whapiService) {
          await global.whapiService.sendMessage(bot.id, conversation.user_phone, aiResponse.content);
        } else if (global.whatsappService) {
          await global.whatsappService.sendMessage(bot.id, conversation.user_phone, aiResponse.content);
        } else {
          throw new Error('Nenhum serviço WhatsApp disponível');
        }

        // Salvar mensagem de resposta
        await Message.create({
          conversation_id: conversation.id,
          direction: 'out',
          content: aiResponse.content,
          media_type: 'text',
          status: 'sent',
          processed: true,
          metadata: {
            ai_generated: true,
            confidence_score: aiResponse.confidence,
            model: bot.ai_config.model
          }
        });

        // Adicionar ao contexto
        conversation.addToContext(message.content, 'user');
        conversation.addToContext(aiResponse.content, 'assistant');
        await conversation.save();

        // Registrar métrica de IA
        await Analytics.recordMetric({
          botId: bot.id,
          type: 'ai_request',
          conversationId: conversation.id,
          userPhone: conversation.user_phone,
          metadata: {
            model: bot.ai_config.model,
            confidence: aiResponse.confidence
          }
        });
      }

    } catch (error) {
      console.error('Erro ao processar com IA:', error);
      await this.sendErrorMessage(botConfig.bot.id, conversation);
    }
  }

  async sendDefaultMessage(botId, conversation) {
    try {
      const defaultMessage = '👋 Olá! Digite *menu* para ver as opções disponíveis ou *oi* para começar!';
      
      // Usar o serviço ativo (UltraMsg, Whapi, etc.)
      if (global.ultraMsgService) {
        await global.ultraMsgService.sendMessage(botId, conversation.user_phone, defaultMessage);
      } else if (global.whapiService) {
        await global.whapiService.sendMessage(botId, conversation.user_phone, defaultMessage);
      } else if (global.whatsappService) {
        await global.whatsappService.sendMessage(botId, conversation.user_phone, defaultMessage);
      } else {
        throw new Error('Nenhum serviço WhatsApp disponível');
      }

      await Message.create({
        conversation_id: conversation.id,
        direction: 'out',
        content: defaultMessage,
        media_type: 'text',
        status: 'sent',
        processed: true
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem padrão:', error);
    }
  }

  async sendErrorMessage(botId, conversation) {
    try {
      const errorMessage = 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.';
      
      // Usar o serviço ativo (UltraMsg, Whapi, etc.)
      if (global.ultraMsgService) {
        await global.ultraMsgService.sendMessage(botId, conversation.user_phone, errorMessage);
      } else if (global.whapiService) {
        await global.whapiService.sendMessage(botId, conversation.user_phone, errorMessage);
      } else if (global.whatsappService) {
        await global.whatsappService.sendMessage(botId, conversation.user_phone, errorMessage);
      } else {
        throw new Error('Nenhum serviço WhatsApp disponível');
      }

      await Message.create({
        bot_id: botId,
        conversation_id: conversation.id,
        sender_phone: conversation.user_phone,
        direction: 'outgoing',
        content: errorMessage,
        message_type: 'text',
        metadata: {
          system_message: true,
          error_message: true
        }
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem de erro:', error);
    }
  }

  async loadBot(botId) {
    try {
      const bot = await Bot.findByPk(botId, {
        include: [
          {
            model: Flow,
            as: 'flows',
            where: { is_active: true },
            required: false
          }
        ]
      });

      if (bot && bot.is_active) {
        this.activeBots.set(botId, {
          bot,
          flows: bot.flows || [],
          lastActivity: new Date()
        });
      }

    } catch (error) {
      console.error(`Erro ao carregar bot ${botId}:`, error);
    }
  }

  async reloadBot(botId) {
    this.activeBots.delete(botId);
    await this.loadBot(botId);
  }

  async deactivateBot(botId) {
    this.activeBots.delete(botId);
  }

  getBotStatus(botId) {
    const botConfig = this.activeBots.get(botId);
    
    if (!botConfig) {
      return { status: 'inactive' };
    }

    return {
      status: 'active',
      lastActivity: botConfig.lastActivity,
      flowsCount: botConfig.flows.length
    };
  }

  getAllActiveBots() {
    const activeBots = [];
    
    for (const [botId, config] of this.activeBots.entries()) {
      activeBots.push({
        botId,
        name: config.bot.name,
        lastActivity: config.lastActivity,
        flowsCount: config.flows.length
      });
    }
    
    return activeBots;
  }
}

module.exports = BotManager;

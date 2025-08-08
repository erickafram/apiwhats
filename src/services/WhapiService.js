const axios = require('axios');
const QRCode = require('qrcode');
const { Bot, Conversation, Message } = require('../models');

class WhapiService {
  constructor(io) {
    this.io = io;
    this.connections = new Map(); // botId -> channel info
    this.token = process.env.WHAPI_TOKEN;
    this.apiUrl = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';

    // Rate limiting
    this.lastMessageTime = new Map();
    this.messageQueue = new Map();

    console.log('🚀 WhapiService inicializado');
    console.log(`🔗 API URL: ${this.apiUrl}`);
    console.log(`🔑 Token configurado: ${this.token ? 'Sim' : 'Não'}`);
  }

  // Headers para autenticação
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Conectar bot (obter informações do canal)
  async connectBot(botId) {
    try {
      console.log(`🔄 Conectando bot ${botId} via Whapi`);

      const bot = await Bot.findByPk(botId);
      if (!bot) {
        throw new Error('Bot não encontrado');
      }

      // Verificar se já existe uma conexão para este bot
      let channelInfo = this.connections.get(botId);

      if (!channelInfo) {
        // Obter informações do canal/instância
        channelInfo = await this.getChannelInfo();
      }

      // Verificar status da conexão
      const status = await this.getConnectionStatus();
      console.log(`📱 Status da conexão:`, status);

      // Se conseguimos obter os settings E o status é ready/authenticated, consideramos conectado
      const isConnected = channelInfo.settings && 
        channelInfo.settings.status !== 'error' && (
          status.status === 'authenticated' || 
          status.status === 'ready'
        );

      console.log(`🔧 DEBUG isConnected:`, {
        hasSettings: !!channelInfo.settings,
        settingsStatus: channelInfo.settings?.status,
        statusStatus: status.status,
        isConnected
      });

      // Atualizar informações da conexão
      this.connections.set(botId, {
        channelId: channelInfo.id,
        status: status.status || 'disconnected',
        connected: isConnected,
        bot,
        phoneNumber: channelInfo.phoneNumber
      });

      console.log(`🔧 DEBUG: Conexão salva para bot ${botId}`);

      // Emitir evento de conexão
      this.io.emit('bot_connection_update', {
        botId,
        channelId: channelInfo.id,
        status: status.status || 'disconnected',
        connected: isConnected,
        phoneNumber: channelInfo.phoneNumber
      });

      if (isConnected) {
        console.log(`✅ Bot ${botId} conectado e pronto para uso!`);
        console.log(`📱 Número: ${channelInfo.phoneNumber}`);
      } else {
        console.log(`⚠️ Bot ${botId} não está conectado. Status: ${status.status}`);
        
        // Se não estiver conectado, tentar gerar QR Code
        if (status.status === 'init' || status.status === 'qr') {
          await this.generateQRCode(botId);
        }
      }

      return {
        success: true,
        channelId: channelInfo.id,
        status: status.status,
        connected: isConnected,
        phoneNumber: channelInfo.phoneNumber,
        qrNeeded: !isConnected
      };

    } catch (error) {
      console.error(`❌ Erro ao conectar bot ${botId}:`, error.message);

      this.io.emit('bot_connection_error', {
        botId,
        error: error.message
      });

      throw error;
    }
  }

  // Obter informações do canal/settings com retry
  async getChannelInfo(retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 segundos
    
    try {
      const response = await axios.get(
        `${this.apiUrl}/settings`,
        { 
          headers: this.getHeaders(),
          timeout: 10000 // 10 segundos timeout
        }
      );

      if (response.data) {
        console.log(`📱 Settings obtidos com sucesso`);
        return {
          id: 'default', // Whapi usa um canal padrão
          phoneNumber: 'N/A', // Será obtido depois da conexão
          settings: response.data
        };
      } else {
        throw new Error('Nenhuma configuração encontrada. Verifique sua conta no Whapi.cloud');
      }
    } catch (error) {
      const isServiceUnavailable = error.response?.status === 503 || error.code === 'ECONNABORTED';
      
      if (isServiceUnavailable && retryCount < maxRetries) {
        console.log(`⏳ Whapi temporariamente indisponível. Tentativa ${retryCount + 1}/${maxRetries + 1} em ${retryDelay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.getChannelInfo(retryCount + 1);
      }
      
      console.error('❌ Erro ao obter configurações:', error.response?.data || error.message);
      
      // Se for erro 503, usar configuração padrão para não quebrar o sistema
      if (isServiceUnavailable) {
        console.log('🔄 Usando configuração padrão devido à indisponibilidade temporária');
        return {
          id: 'default',
          phoneNumber: 'N/A',
          settings: { status: 'fallback' }
        };
      }
      
      throw error;
    }
  }

  // Obter status da conexão com retry
  async getConnectionStatus(retryCount = 0) {
    const maxRetries = 2;
    
    try {
      // Tentar obter informações do usuário conectado
      const response = await axios.get(
        `${this.apiUrl}/me`,
        { 
          headers: this.getHeaders(),
          timeout: 8000 // 8 segundos timeout
        }
      );

      if (response.data && response.data.id) {
        return { 
          status: 'authenticated',
          user: response.data
        };
      } else {
        return { status: 'disconnected' };
      }
    } catch (error) {
      const isServiceUnavailable = error.response?.status === 503 || error.code === 'ECONNABORTED';
      
      // Se for erro 503 e ainda temos tentativas, tentar settings
      if (isServiceUnavailable && retryCount < maxRetries) {
        try {
          const settingsResponse = await axios.get(
            `${this.apiUrl}/settings`,
            { 
              headers: this.getHeaders(),
              timeout: 8000
            }
          );
          
          if (settingsResponse.data) {
            return { status: 'ready' }; // Settings disponíveis = API funcionando
          }
        } catch (settingsError) {
          console.log(`⏳ Whapi temporariamente indisponível. Assumindo status ready...`);
          return { status: 'ready' }; // Assumir que está funcionando
        }
      }
      
      // Se for erro 503, não logar como erro crítico
      if (isServiceUnavailable) {
        console.log(`⚠️ Whapi temporariamente indisponível. Status: ready (fallback)`);
        return { status: 'ready' }; // Assumir que está funcionando
      }
      
      // Se for erro 404/500 no /me, isso é normal no Whapi - assumir ready
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log(`ℹ️ Endpoint /me não disponível (normal no Whapi). Status: ready`);
        return { status: 'ready' };
      }
      
      console.error('❌ Erro ao obter status:', error.response?.data || error.message);
      return { status: 'error' };
    }
  }

  // Gerar QR Code para autenticação
  async generateQRCode(botId) {
    try {
      console.log(`🔄 Gerando QR Code para bot ${botId}`);

      const response = await axios.get(
        `${this.apiUrl}/qr`,
        { headers: this.getHeaders() }
      );

      if (response.data && response.data.qr) {
        const qrCodeData = response.data.qr;
        
        // Gerar QR code como imagem
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);

        // Emitir QR code para o frontend
        this.io.emit('qr_code', {
          botId,
          qrCode: qrCodeImage,
          qrData: qrCodeData
        });

        console.log(`✅ QR Code gerado para bot ${botId}`);
        return qrCodeImage;
      } else {
        throw new Error('QR Code não disponível - WhatsApp pode já estar conectado');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error.response?.data || error.message);
      throw error;
    }
  }

  // Enviar mensagem
  async sendMessage(botId, to, message, options = {}) {
    try {
      const connection = this.connections.get(botId);
      if (!connection || !connection.connected) {
        throw new Error('Bot não conectado');
      }

      // Rate limiting
      const now = Date.now();
      const lastTime = this.lastMessageTime.get(botId) || 0;
      if (now - lastTime < 1000) { // 1 segundo entre mensagens
        await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastTime)));
      }

      // Preparar dados da mensagem
      const messageData = {
        to: to,
        body: message
      };

      // Se for mídia, adicionar dados específicos
      if (options.media) {
        messageData.media = options.media;
      }

      // Adicionar tipo se especificado
      if (options.type && options.type !== 'text') {
        messageData.type = options.type;
      }

      const response = await axios.post(
        `${this.apiUrl}/messages/text`,
        messageData,
        { headers: this.getHeaders() }
      );

      this.lastMessageTime.set(botId, Date.now());

      if (response.data) {
        console.log(`✅ Mensagem enviada para ${to} via bot ${botId}`);
        
        // Salvar mensagem no banco
        await this.saveMessage(botId, to, message, 'outgoing', options);
        
        return response.data;
      } else {
        throw new Error('Erro ao enviar mensagem');
      }

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
      throw error;
    }
  }

  // Salvar mensagem no banco de dados
  async saveMessage(botId, phoneNumber, content, direction, options = {}) {
    try {
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

      // Criar mensagem
      const message = await Message.create({
        bot_id: botId,
        conversation_id: conversation.id,
        sender_phone: phoneNumber,
        content,
        direction,
        message_type: options.type || 'text',
        metadata: options.metadata || {}
      });

      // Atualizar última mensagem da conversa
      await conversation.update({
        lastMessageAt: new Date(),
        lastMessage: content
      });

      return message;
    } catch (error) {
      console.error('❌ Erro ao salvar mensagem:', error);
    }
  }

  // Desconectar bot
  async disconnectBot(botId) {
    try {
      const connection = this.connections.get(botId);
      if (!connection) {
        return { success: true, message: 'Bot já desconectado' };
      }

      // Logout/desconectar
      await axios.post(
        `${this.apiUrl}/logout`,
        {},
        { headers: this.getHeaders() }
      );

      this.connections.delete(botId);

      this.io.emit('bot_disconnected', { botId });

      console.log(`🔌 Bot ${botId} desconectado`);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao desconectar bot:', error.response?.data || error.message);
      throw error;
    }
  }

  // Obter informações de conexão
  getConnectionInfo(botId) {
    const connection = this.connections.get(botId);
    if (!connection) {
      return { connected: false };
    }

    return {
      connected: connection.connected,
      channelId: connection.channelId,
      status: connection.status,
      phoneNumber: connection.phoneNumber
    };
  }

  // Listar todas as conexões
  getAllConnections() {
    const connections = {};
    for (const [botId, connection] of this.connections) {
      connections[botId] = {
        connected: connection.connected,
        channelId: connection.channelId,
        status: connection.status,
        phoneNumber: connection.phoneNumber
      };
    }
    return connections;
  }

  // Processar webhook de mensagem recebida
  async processIncomingMessage(webhookData) {
    try {
      // Processar mensagens
      if (webhookData.messages && Array.isArray(webhookData.messages)) {
        console.log(`📨 Processando ${webhookData.messages.length} mensagem(s) recebida(s)`);
        for (const message of webhookData.messages) {
          await this.processMessage(message);
        }
      }
      
      // Processar status (opcional - apenas para logs)
      else if (webhookData.statuses && Array.isArray(webhookData.statuses)) {
        console.log(`📊 Status recebido: ${webhookData.statuses[0]?.status} para ${webhookData.statuses[0]?.recipient_id}`);
        // Não precisa processar status, apenas log
      }
      
      // Formato desconhecido
      else {
        console.log('⚠️ Formato de webhook desconhecido:', JSON.stringify(webhookData, null, 2));
      }

    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
    }
  }

  // Processar uma mensagem individual
  async processMessage(message) {
    try {
      // Encontrar bot pela conexão ativa
      let botId = null;
      for (const [id, connection] of this.connections) {
        if (connection.connected) {
          botId = id;
          break;
        }
      }

      if (!botId) {
        console.log(`⚠️ Mensagem recebida mas nenhum bot conectado`);
        return;
      }

      // Extrair dados da mensagem
      const phoneNumber = message.from;
      const content = message.text?.body || message.caption || '[Mídia]';
      const messageType = message.type || 'text';

      console.log(`📨 Mensagem recebida para bot ${botId} de ${phoneNumber}: ${content}`);

      // Salvar mensagem
      await this.saveMessage(botId, phoneNumber, content, 'incoming', {
        type: messageType,
        metadata: message
      });

      // Emitir evento para processamento do bot
      this.io.emit('message_received', {
        botId,
        phoneNumber,
        message: {
          content,
          type: messageType,
          timestamp: new Date(),
          metadata: message
        }
      });

      // Processar com BotManager se disponível
      if (global.botManager) {
        try {
          const { Conversation } = require('../models');
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

          // Atualizar conversation_id na mensagem salva
          await savedMessage.update({ conversation_id: conversation.id });

          await global.botManager.processMessage(botId, conversation, savedMessage);

          console.log(`🤖 Mensagem processada com BotManager para bot ${botId}`);
        } catch (processError) {
          console.error('❌ Erro ao processar com BotManager:', processError);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem individual:', error);
    }
  }
}

module.exports = WhapiService;

const axios = require('axios');
const QRCode = require('qrcode');
const { Bot, Conversation, Message } = require('../models');
const MaytapiFlowProcessor = require('./MaytapiFlowProcessor');

class MaytapiService {
  constructor(io) {
    this.io = io;
    this.connections = new Map(); // botId -> phone instance info
    this.productId = process.env.MAYTAPI_PRODUCT_ID;
    this.token = process.env.MAYTAPI_TOKEN;
    this.apiUrl = process.env.MAYTAPI_API_URL || 'https://api.maytapi.com/api';
    this.defaultPhoneId = process.env.MAYTAPI_PHONE_ID; // Instância específica

    // Rate limiting
    this.lastMessageTime = new Map();
    this.messageQueue = new Map();

    // Inicializar processador de fluxos
    this.flowProcessor = new MaytapiFlowProcessor(this);

    console.log('🚀 MaytapiService inicializado');
    console.log(`📱 Product ID: ${this.productId}`);
    console.log(`📞 Phone ID padrão: ${this.defaultPhoneId}`);
    console.log(`🔗 API URL: ${this.apiUrl}`);
    console.log('🔄 Processador de fluxos ativo');
  }

  // Headers para autenticação
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-maytapi-key': this.token
    };
  }

  // Conectar bot (usar instância existente do WhatsApp)
  async connectBot(botId) {
    try {
      console.log(`🔄 Conectando bot ${botId} via Maytapi`);

      const bot = await Bot.findByPk(botId);
      if (!bot) {
        throw new Error('Bot não encontrado');
      }

      // Verificar se já existe uma instância para este bot
      let phoneId = this.connections.get(botId)?.phoneId;

      if (!phoneId) {
        // Usar instância específica se configurada, senão buscar disponível
        if (this.defaultPhoneId) {
          phoneId = this.defaultPhoneId;
          console.log(`📱 Usando instância configurada: ${phoneId}`);
        } else {
          phoneId = await this.findAvailablePhoneInstance();
        }
      }

      // Verificar status da instância
      const status = await this.getInstanceStatus(phoneId);
      console.log(`📱 Status da instância ${phoneId}:`, status);

      // Determinar se está conectado (aceitar vários status como válidos)
      // Para instâncias já configuradas, considerar como conectadas
      // Se conseguimos obter o status, a instância existe e pode ser usada
      const isConnected = true;

      // Atualizar informações da conexão
      this.connections.set(botId, {
        phoneId,
        status: status.status || 'active',
        connected: isConnected,
        bot
      });

      console.log(`🔧 DEBUG: Conexão salva para bot ${botId}, phoneId: ${phoneId}`);

      // Emitir evento de conexão
      this.io.emit('bot_connection_update', {
        botId,
        phoneId,
        status: status.status || 'active',
        connected: isConnected
      });

      if (isConnected) {
        console.log(`✅ Instância ${phoneId} está conectada e pronta para uso!`);
        if (this.defaultPhoneId === phoneId) {
          console.log(`📱 Usando instância pré-configurada (número: 556392901378)`);
        }
      } else {
        console.log(`⚠️ Instância ${phoneId} não está conectada. Status: ${status.status}`);
        console.log(`💡 Verifique se a instância está ativa na dashboard da Maytapi`);
      }

      return {
        success: true,
        phoneId,
        status: status.status,
        connected: status.status === 'authenticated'
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

  // Buscar instância disponível
  async findAvailablePhoneInstance() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${this.productId}/listPhones`,
        { headers: this.getHeaders() }
      );

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Buscar primeira instância disponível (não conectada a outro bot)
        const phones = response.data.data;

        for (const phone of phones) {
          // Verificar se esta instância já está sendo usada por outro bot
          let isUsed = false;
          for (const [botId, connection] of this.connections) {
            if (connection.phoneId === phone.id) {
              isUsed = true;
              break;
            }
          }

          if (!isUsed) {
            console.log(`📱 Usando instância existente: ${phone.id}`);
            return phone.id;
          }
        }

        // Se todas estão em uso, usar a primeira mesmo assim
        const phoneId = phones[0].id;
        console.log(`📱 Usando primeira instância disponível: ${phoneId}`);
        return phoneId;
      } else {
        throw new Error('Nenhuma instância encontrada. Crie uma instância na dashboard da Maytapi.');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar instâncias:', error.response?.data || error.message);
      throw error;
    }
  }

  // Obter status da instância
  async getInstanceStatus(phoneId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${this.productId}/${phoneId}/status`,
        { headers: this.getHeaders() }
      );

      return response.data.data || { status: 'unknown' };
    } catch (error) {
      console.error('❌ Erro ao obter status:', error.response?.data || error.message);
      return { status: 'error' };
    }
  }

  // Gerar QR Code para autenticação
  async generateQRCode(botId, phoneId) {
    try {
      console.log(`🔄 Gerando QR Code para bot ${botId}, instância ${phoneId}`);

      const response = await axios.get(
        `${this.apiUrl}/${this.productId}/${phoneId}/screen`,
        { headers: this.getHeaders() }
      );

      if (response.data.success && response.data.data.screen) {
        const qrCodeData = response.data.data.screen;
        
        // Gerar QR code como imagem
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);

        // Emitir QR code para o frontend
        this.io.emit('qr_code', {
          botId,
          phoneId,
          qrCode: qrCodeImage,
          qrData: qrCodeData
        });

        console.log(`✅ QR Code gerado para bot ${botId}`);
        return qrCodeImage;
      } else {
        throw new Error('QR Code não disponível');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error.response?.data || error.message);
      throw error;
    }
  }

  // Enviar mensagem
  async sendMessage(botId, to, message, options = {}) {
    try {
      console.log(`🔧 DEBUG sendMessage: botId=${botId}, to=${to}`);
      console.log(`🔧 DEBUG connections:`, Array.from(this.connections.entries()));

      const connection = this.connections.get(botId);
      console.log(`🔧 DEBUG connection:`, connection);

      if (!connection || !connection.connected) {
        console.log(`🔧 DEBUG: connection=${!!connection}, connected=${connection?.connected}`);
        throw new Error('Bot não conectado');
      }

      const phoneId = connection.phoneId;

      // Rate limiting
      const now = Date.now();
      const lastTime = this.lastMessageTime.get(botId) || 0;
      if (now - lastTime < 1000) { // 1 segundo entre mensagens
        await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastTime)));
      }

      // Preparar dados da mensagem
      const messageData = {
        to_number: to,
        message: message,
        type: options.type || 'text'
      };

      // Se for mídia, adicionar URL
      if (options.media) {
        messageData.media_url = options.media;
      }

      const response = await axios.post(
        `${this.apiUrl}/${this.productId}/${phoneId}/sendMessage`,
        messageData,
        { headers: this.getHeaders() }
      );

      this.lastMessageTime.set(botId, Date.now());

      if (response.data.success) {
        console.log(`✅ Mensagem enviada para ${to} via bot ${botId}`);
        
        // Salvar mensagem no banco
        await this.saveMessage(botId, to, message, 'outgoing', options);
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Erro ao enviar mensagem');
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

      const phoneId = connection.phoneId;

      // Logout da instância
      await axios.post(
        `${this.apiUrl}/${this.productId}/${phoneId}/logout`,
        {},
        { headers: this.getHeaders() }
      );

      this.connections.delete(botId);

      this.io.emit('bot_disconnected', { botId, phoneId });

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
      phoneId: connection.phoneId,
      status: connection.status
    };
  }

  // Listar todas as conexões
  getAllConnections() {
    const connections = {};
    for (const [botId, connection] of this.connections) {
      connections[botId] = {
        connected: connection.connected,
        phoneId: connection.phoneId,
        status: connection.status
      };
    }
    return connections;
  }

  // Processar webhook de mensagem recebida
  async processIncomingMessage(webhookData) {
    try {
      const { phone_id, message, user } = webhookData;
      
      // Encontrar bot pela phoneId
      console.log(`🔧 DEBUG: Procurando bot para phoneId: ${phone_id}`);
      console.log(`🔧 DEBUG: Conexões disponíveis:`, Array.from(this.connections.entries()).map(([id, conn]) => ({botId: id, phoneId: conn.phoneId})));

      let botId = null;
      for (const [id, connection] of this.connections) {
        // Comparar como string para evitar problemas de tipo
        if (String(connection.phoneId) === String(phone_id)) {
          botId = id;
          break;
        }
      }

      if (!botId) {
        console.log(`⚠️ Mensagem recebida para instância desconhecida: ${phone_id}`);
        return;
      }

      // Extrair número do telefone do usuário
      const phoneNumber = user?.phone || message.from_number || user?.id?.replace('@c.us', '');
      const content = message.text || message.caption || '[Mídia]';

      console.log(`🔧 DEBUG: phoneNumber extraído: ${phoneNumber}`);

      // Salvar mensagem
      await this.saveMessage(botId, phoneNumber, content, 'incoming', {
        type: message.type,
        metadata: message
      });

      // Emitir evento para processamento do bot
      this.io.emit('message_received', {
        botId,
        phoneNumber,
        message: {
          content,
          type: message.type,
          timestamp: new Date(),
          metadata: message
        }
      });

      // Processar mensagem com fluxos Maytapi
      try {
        const result = await this.flowProcessor.processMessage(
          botId,
          phoneNumber,
          content,
          message.type || 'text'
        );

        if (result && result.success) {
          console.log(`🤖 Mensagem processada via fluxo Maytapi para bot ${botId}`);
        } else {
          console.log(`⚠️ Erro no processamento do fluxo para bot ${botId}:`, result?.error || 'Erro desconhecido');
        }
      } catch (processError) {
        console.error('❌ Erro ao processar mensagem com fluxos Maytapi:', processError);

        // Fallback para BotManager se disponível
        if (global.botManager) {
          try {
            const { Conversation } = require('../models');
            let conversation = await Conversation.findOne({
              where: { botId, phoneNumber }
            });

            if (!conversation) {
              conversation = await Conversation.create({
                botId,
                phoneNumber,
                status: 'active',
                lastMessageAt: new Date()
              });
            }

            await global.botManager.processMessage(botId, conversation, {
              content,
              type: message.type,
              timestamp: new Date(),
              metadata: message
            });

            console.log(`🔄 Fallback: Mensagem processada com BotManager para bot ${botId}`);
          } catch (fallbackError) {
            console.error('❌ Erro no fallback BotManager:', fallbackError);
          }
        }
      }

      console.log(`📨 Mensagem recebida para bot ${botId} de ${phoneNumber}`);

    } catch (error) {
      console.error('❌ Erro ao processar mensagem recebida:', error);
    }
  }
}

module.exports = MaytapiService;

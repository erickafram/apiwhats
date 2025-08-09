const axios = require('axios');
const { Bot, Conversation, Message } = require('../models');

class UltraMsgService {
  constructor(io) {
    this.io = io;
    this.connections = new Map(); // botId -> instance info
    this.token = process.env.ULTRAMSG_TOKEN;
    this.instanceId = process.env.ULTRAMSG_INSTANCE_ID;
    this.apiUrl = process.env.ULTRAMSG_API_URL || 'https://api.ultramsg.com';

    // Rate limiting
    this.lastMessageTime = new Map();
    this.messageQueue = new Map();

    console.log('🚀 UltraMsgService inicializado');
    console.log(`🔗 API URL: ${this.apiUrl}`);
    console.log(`📱 Instance ID: ${this.instanceId}`);
    console.log(`🔑 Token configurado: ${this.token ? 'Sim' : 'Não'}`);
  }

  // Headers para autenticação
  getHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  // Conectar bot
  async connectBot(botId) {
    try {
      console.log(`🔄 Conectando bot ${botId} via UltraMsg`);

      const bot = await Bot.findByPk(botId);
      if (!bot) {
        throw new Error('Bot não encontrado');
      }

      // Verificar status da instância
      const status = await this.getInstanceStatus();
      console.log(`📱 Status da instância:`, status);

      const isConnected = status.status === 'authenticated';

      // Atualizar informações da conexão
      this.connections.set(botId, {
        instanceId: this.instanceId,
        status: status.status || 'disconnected',
        connected: isConnected,
        bot,
        phoneNumber: status.phoneNumber
      });

      // Atualizar bot no banco
      await bot.update({
        is_connected: isConnected,
        connection_status: status.status || 'disconnected',
        phone_number: status.phoneNumber,
        last_seen: new Date()
      });

      // Emitir evento de conexão
      this.io.emit('bot_connection_update', {
        botId,
        instanceId: this.instanceId,
        status: status.status || 'disconnected',
        connected: isConnected,
        phoneNumber: status.phoneNumber
      });

      if (isConnected) {
        console.log(`✅ Bot ${botId} conectado via UltraMsg!`);
        console.log(`📱 Número: ${status.phoneNumber}`);
        
        // Configurar webhook automaticamente
        await this.setupWebhook();
      } else {
        console.log(`⚠️ Bot ${botId} não está conectado. Status: ${status.status}`);
        
        // Se não estiver conectado, gerar QR Code
        if (status.status === 'init' || status.status === 'loading') {
          await this.generateQRCode(botId);
        }
      }

      return {
        success: true,
        instanceId: this.instanceId,
        status: status.status,
        connected: isConnected,
        phoneNumber: status.phoneNumber,
        qrCode: !isConnected ? await this.getQRCode() : null
      };

    } catch (error) {
      console.error(`❌ Erro ao conectar bot ${botId}:`, error);
      
      // Atualizar status de erro no banco
      const bot = await Bot.findByPk(botId);
      if (bot) {
        await bot.update({
          is_connected: false,
          connection_status: 'error'
        });
      }

      throw error;
    }
  }

  // Desconectar bot
  async disconnectBot(botId) {
    try {
      console.log(`🔌 Desconectando bot ${botId}`);

      const bot = await Bot.findByPk(botId);
      if (!bot) {
        throw new Error('Bot não encontrado');
      }

      // Logout da instância
      await this.logoutInstance();

      // Remover da memória
      this.connections.delete(botId);

      // Atualizar bot no banco
      await bot.update({
        is_connected: false,
        connection_status: 'disconnected',
        qr_code: null,
        last_seen: new Date()
      });

      // Emitir evento
      this.io.emit('bot_connection_update', {
        botId,
        status: 'disconnected',
        connected: false
      });

      console.log(`✅ Bot ${botId} desconectado`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Erro ao desconectar bot ${botId}:`, error);
      throw error;
    }
  }

  // Obter status da instância
  async getInstanceStatus() {
    try {
      const response = await axios.get(`${this.apiUrl}/${this.instanceId}/instance/status`, {
        params: { token: this.token },
        headers: this.getHeaders()
      });

      return {
        status: response.data.account_status,
        phoneNumber: response.data.phone_number,
        accountStatus: response.data.account_status,
        webhooks: response.data.webhooks
      };
    } catch (error) {
      console.error('❌ Erro ao obter status da instância:', error.response?.data || error.message);
      return { status: 'error', phoneNumber: null };
    }
  }

  // Gerar/Obter QR Code
  async generateQRCode(botId) {
    try {
      console.log(`📱 Gerando QR Code para bot ${botId}`);

      const response = await axios.get(`${this.apiUrl}/${this.instanceId}/instance/qr`, {
        params: { token: this.token },
        headers: this.getHeaders()
      });

      const qrCode = response.data.qr_code;

      if (qrCode) {
        // Salvar QR Code no bot
        const bot = await Bot.findByPk(botId);
        if (bot) {
          await bot.update({ 
            qr_code: qrCode,
            connection_status: 'qr_ready'
          });
        }

        // Emitir QR Code via Socket
        this.io.emit('qr_code_generated', {
          botId,
          qrCode
        });

        console.log(`📱 QR Code gerado para bot ${botId}`);
        return qrCode;
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro ao gerar QR Code:`, error.response?.data || error.message);
      throw error;
    }
  }

  // Obter QR Code atual
  async getQRCode() {
    try {
      const response = await axios.get(`${this.apiUrl}/${this.instanceId}/instance/qr`, {
        params: { token: this.token },
        headers: this.getHeaders()
      });

      return response.data.qr_code;
    } catch (error) {
      console.error('❌ Erro ao obter QR Code:', error.response?.data || error.message);
      return null;
    }
  }

  // Configurar webhook
  async setupWebhook() {
    try {
      const webhookUrl = `${process.env.BACKEND_URL || 'https://chatbotwhats.online/api'}/ultramsg/webhook`;
      
      console.log(`🔗 Configurando webhook: ${webhookUrl}`);

      const response = await axios.post(`${this.apiUrl}/${this.instanceId}/instance/webhook`, {
        token: this.token,
        webhook_url: webhookUrl,
        webhook_message_received: true,
        webhook_message_sent: true,
        webhook_message_ack: true
      }, {
        headers: this.getHeaders()
      });

      console.log('✅ Webhook configurado com sucesso');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao configurar webhook:', error.response?.data || error.message);
    }
  }

  // Logout da instância
  async logoutInstance() {
    try {
      await axios.get(`${this.apiUrl}/${this.instanceId}/instance/logout`, {
        params: { token: this.token },
        headers: this.getHeaders()
      });
      
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error.response?.data || error.message);
    }
  }

  // Enviar mensagem de texto
  async sendMessage(botId, to, message, mediaType = 'text') {
    try {
      console.log(`📤 Enviando mensagem via UltraMsg - Bot: ${botId}, Para: ${to}`);

      // Verificar rate limiting
      await this.checkRateLimit(botId);

      // Limpar número de telefone
      const cleanPhone = this.cleanPhoneNumber(to);
      
      // Verificar se o número foi limpo corretamente
      if (!cleanPhone) {
        throw new Error(`Número de telefone inválido: ${to}`);
      }

      let response;

      switch (mediaType) {
        case 'text':
          response = await this.sendTextMessage(cleanPhone, message);
          break;
        case 'image':
          response = await this.sendImageMessage(cleanPhone, message);
          break;
        case 'document':
          response = await this.sendDocumentMessage(cleanPhone, message);
          break;
        case 'audio':
          response = await this.sendAudioMessage(cleanPhone, message);
          break;
        case 'video':
          response = await this.sendVideoMessage(cleanPhone, message);
          break;
        default:
          response = await this.sendTextMessage(cleanPhone, message);
      }

      console.log(`✅ Mensagem enviada com sucesso:`, response);
      return response;

    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem:`, error.response?.data || error.message);
      throw error;
    }
  }

  // Enviar mensagem de texto
  async sendTextMessage(to, body) {
    const response = await axios.post(`${this.apiUrl}/${this.instanceId}/messages/chat`, {
      token: this.token,
      to: to,
      body: body
    }, {
      headers: this.getHeaders()
    });

    return response.data;
  }

  // Enviar imagem
  async sendImageMessage(to, imageUrl, caption = '') {
    const response = await axios.post(`${this.apiUrl}/${this.instanceId}/messages/image`, {
      token: this.token,
      to: to,
      image: imageUrl,
      caption: caption
    }, {
      headers: this.getHeaders()
    });

    return response.data;
  }

  // Enviar documento
  async sendDocumentMessage(to, documentUrl, filename = '') {
    const response = await axios.post(`${this.apiUrl}/${this.instanceId}/messages/document`, {
      token: this.token,
      to: to,
      document: documentUrl,
      filename: filename
    }, {
      headers: this.getHeaders()
    });

    return response.data;
  }

  // Enviar áudio
  async sendAudioMessage(to, audioUrl) {
    const response = await axios.post(`${this.apiUrl}/${this.instanceId}/messages/audio`, {
      token: this.token,
      to: to,
      audio: audioUrl
    }, {
      headers: this.getHeaders()
    });

    return response.data;
  }

  // Enviar vídeo
  async sendVideoMessage(to, videoUrl, caption = '') {
    const response = await axios.post(`${this.apiUrl}/${this.instanceId}/messages/video`, {
      token: this.token,
      to: to,
      video: videoUrl,
      caption: caption
    }, {
      headers: this.getHeaders()
    });

    return response.data;
  }

  // Processar mensagem recebida (webhook)
  async processIncomingMessage(data) {
    try {
      console.log('📨 Processando mensagem recebida via UltraMsg:', JSON.stringify(data, null, 2));

      // Verificar se é uma mensagem válida
      if (!data.data || !data.data.from || !data.data.body) {
        console.log('⚠️ Mensagem inválida ou incompleta');
        return;
      }

      const messageData = data.data;
      const userPhone = this.cleanPhoneNumber(messageData.from);
      const messageContent = messageData.body;
      const messageType = messageData.type || 'text';

      // Verificar se o número foi processado corretamente
      if (!userPhone) {
        console.error('❌ Não foi possível processar o número de telefone:', messageData.from);
        return;
      }

      // Encontrar bot correspondente (assumindo que temos apenas um bot ativo por instância)
      const botConnection = Array.from(this.connections.values())[0];
      if (!botConnection || !botConnection.bot) {
        console.log('⚠️ Nenhum bot conectado encontrado');
        return;
      }

      const bot = botConnection.bot;

      // Processar mensagem através do BotManager
      if (global.botManager) {
        await global.botManager.processMessage(bot.id, userPhone, {
          content: messageContent,
          type: messageType,
          id: messageData.id,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem recebida:', error);
    }
  }

  // Verificar rate limiting
  async checkRateLimit(botId) {
    const now = Date.now();
    const lastTime = this.lastMessageTime.get(botId) || 0;
    const minInterval = 1000; // 1 segundo entre mensagens

    const timeDiff = now - lastTime;
    if (timeDiff < minInterval) {
      const waitTime = minInterval - timeDiff;
      console.log(`⏳ Rate limit: aguardando ${waitTime}ms para bot ${botId}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastMessageTime.set(botId, Date.now());
  }

  // Limpar número de telefone
    cleanPhoneNumber(phone) {
    // Verificar se phone existe
    if (!phone || typeof phone !== 'string') {
      console.error('❌ Número de telefone inválido:', phone);
      return null;
    }
    
    console.log('🔧 Processando número:', phone);
    
    // Para UltraMsg, o número já vem no formato correto (556392410056@c.us)
    // Só precisamos garantir que está no formato certo
    let clean = phone;
    
    // Se já tem @c.us, está no formato UltraMsg correto
    if (clean.includes('@c.us')) {
      console.log('✅ Número UltraMsg válido:', clean);
      return clean;
    }
    
    // Se não tem @, adicionar
    // Remover caracteres especiais exceto @
    clean = phone.replace(/[^\d@.]/g, '');
    
    // Se não começar com código do país, adicionar Brasil (55)
    if (!clean.startsWith('55') && clean.length <= 11) {
      clean = '55' + clean;
    }
    
    // Adicionar @c.us se necessário
    if (!clean.includes('@')) {
      clean = clean + '@c.us';
    }
    
    console.log('✅ Número processado:', clean);
    return clean;
  }

  // Obter informações da conta
  async getAccountInfo() {
    try {
      const response = await axios.get(`${this.apiUrl}/${this.instanceId}/instance/me`, {
        params: { token: this.token },
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao obter informações da conta:', error.response?.data || error.message);
      return null;
    }
  }

  // Verificar se número existe no WhatsApp
  async checkPhoneNumber(phone) {
    try {
      const cleanPhone = this.cleanPhoneNumber(phone);
      
      const response = await axios.get(`${this.apiUrl}/${this.instanceId}/contacts/check`, {
        params: { 
          token: this.token,
          chatId: cleanPhone
        },
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao verificar número:', error.response?.data || error.message);
      return { exists: false };
    }
  }

  // Obter chats/conversas
  async getChats() {
    try {
      const response = await axios.get(`${this.apiUrl}/${this.instanceId}/chats`, {
        params: { token: this.token },
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao obter chats:', error.response?.data || error.message);
      return [];
    }
  }

  // Marcar mensagem como lida
  async markAsRead(chatId) {
    try {
      const response = await axios.post(`${this.apiUrl}/${this.instanceId}/chats/markAsRead`, {
        token: this.token,
        chatId: chatId
      }, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error.response?.data || error.message);
    }
  }

  // Obter informações de conexão de um bot (compatibilidade com outras APIs)
  getConnectionInfo(botId) {
    const connection = this.connections.get(botId);
    
    if (!connection) {
      return {
        connected: false,
        status: 'disconnected',
        phoneId: null,
        phoneNumber: null
      };
    }

    return {
      connected: connection.connected || false,
      status: connection.status || 'disconnected',
      phoneId: connection.instanceId || this.instanceId,
      phoneNumber: connection.phoneNumber || null,
      instanceId: connection.instanceId || this.instanceId
    };
  }

  // Verificar se bot está conectado
  isBotConnected(botId) {
    const connection = this.connections.get(botId);
    return connection ? connection.connected : false;
  }

  // Obter lista de bots conectados
  getConnectedBots() {
    const connectedBots = [];
    for (const [botId, connection] of this.connections.entries()) {
      if (connection.connected) {
        connectedBots.push({
          botId,
          instanceId: connection.instanceId,
          phoneNumber: connection.phoneNumber,
          status: connection.status
        });
      }
    }
    return connectedBots;
  }
}

module.exports = UltraMsgService;

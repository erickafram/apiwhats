const { 
  default: makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState,
  downloadMediaMessage,
  getContentType
} = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { Bot, Conversation, Message } = require('../models');

class WhatsAppService {
  constructor(io) {
    this.io = io;
    this.connections = new Map(); // botId -> socket connection
    this.sessionDir = process.env.WHATSAPP_SESSION_DIR || 'sessions';
    
    // Criar diretório de sessões se não existir
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  async connectBot(botId) {
    try {
      console.log(`Iniciando conexão para bot ${botId}`);
      
      const bot = await Bot.findByPk(botId);
      if (!bot) {
        throw new Error('Bot não encontrado');
      }

      // Se já está conectado, retornar status atual
      if (this.connections.has(botId)) {
        const connection = this.connections.get(botId);
        if (connection.socket && connection.socket.user) {
          return {
            status: 'connected',
            phone: connection.socket.user.id.split(':')[0]
          };
        }
      }

      const sessionPath = path.join(this.sessionDir, `bot_${botId}`);
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

      const socket = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: {
          level: 'silent',
          child: () => ({ level: 'silent' })
        }
      });

      // Armazenar conexão
      this.connections.set(botId, { socket, saveCreds, bot });

      // Event handlers
      socket.ev.on('connection.update', async (update) => {
        await this.handleConnectionUpdate(botId, update);
      });

      socket.ev.on('creds.update', saveCreds);

      socket.ev.on('messages.upsert', async (messageUpdate) => {
        await this.handleIncomingMessages(botId, messageUpdate);
      });

      socket.ev.on('messages.update', async (messageUpdate) => {
        await this.handleMessageStatusUpdate(botId, messageUpdate);
      });

      return {
        status: 'connecting',
        message: 'Processo de conexão iniciado'
      };

    } catch (error) {
      console.error(`Erro ao conectar bot ${botId}:`, error);
      throw error;
    }
  }

  async handleConnectionUpdate(botId, update) {
    try {
      const { connection, lastDisconnect, qr } = update;
      const bot = await Bot.findByPk(botId);
      
      if (!bot) return;

      console.log(`Bot ${botId} - Status de conexão:`, connection);

      if (qr) {
        // Gerar QR Code
        const qrCodeDataURL = await QRCode.toDataURL(qr);
        
        await bot.update({
          qr_code: qrCodeDataURL,
          connection_status: 'connecting'
        });

        // Emitir QR Code via Socket.IO
        this.io.emit('qr-code', {
          botId,
          qrCode: qrCodeDataURL
        });

        console.log(`QR Code gerado para bot ${botId}`);
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        await bot.update({
          is_connected: false,
          connection_status: 'disconnected',
          qr_code: null
        });

        this.connections.delete(botId);

        this.io.emit('bot-disconnected', { botId });

        if (shouldReconnect) {
          console.log(`Reconectando bot ${botId}...`);
          setTimeout(() => {
            this.connectBot(botId);
          }, 5000);
        } else {
          console.log(`Bot ${botId} foi deslogado`);
        }
      }

      if (connection === 'open') {
        const socket = this.connections.get(botId)?.socket;
        
        if (socket && socket.user) {
          const phoneNumber = socket.user.id.split(':')[0];
          
          await bot.update({
            phone_number: phoneNumber,
            is_connected: true,
            connection_status: 'connected',
            qr_code: null,
            last_seen: new Date()
          });

          this.io.emit('bot-connected', {
            botId,
            phoneNumber
          });

          console.log(`Bot ${botId} conectado com sucesso - Número: ${phoneNumber}`);
        }
      }

    } catch (error) {
      console.error(`Erro no handleConnectionUpdate para bot ${botId}:`, error);
    }
  }

  async handleIncomingMessages(botId, messageUpdate) {
    try {
      const { messages } = messageUpdate;
      
      for (const message of messages) {
        // Ignorar mensagens próprias e de status
        if (message.key.fromMe || message.key.remoteJid === 'status@broadcast') {
          continue;
        }

        await this.processIncomingMessage(botId, message);
      }
    } catch (error) {
      console.error(`Erro ao processar mensagens recebidas para bot ${botId}:`, error);
    }
  }

  async processIncomingMessage(botId, message) {
    try {
      const userPhone = message.key.remoteJid.split('@')[0];
      const messageContent = this.extractMessageContent(message);
      
      if (!messageContent) return;

      // Buscar ou criar conversa
      let conversation = await Conversation.findOne({
        where: {
          bot_id: botId,
          user_phone: userPhone
        }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          bot_id: botId,
          user_phone: userPhone,
          user_name: message.pushName || userPhone,
          status: 'active'
        });
      } else {
        // Atualizar atividade
        await conversation.update({
          last_activity_at: new Date(),
          user_name: message.pushName || conversation.user_name
        });
      }

      // Salvar mensagem
      const savedMessage = await Message.create({
        conversation_id: conversation.id,
        whatsapp_message_id: message.key.id,
        direction: 'in',
        content: messageContent.text,
        media_type: messageContent.type,
        media_url: messageContent.mediaUrl,
        timestamp: new Date(message.messageTimestamp * 1000),
        processed: false
      });

      // Emitir evento de nova mensagem
      this.io.emit('new-message', {
        botId,
        conversationId: conversation.id,
        message: savedMessage
      });

      // Processar mensagem através do Bot Manager
      if (global.botManager) {
        await global.botManager.processMessage(botId, conversation, savedMessage);
      }

    } catch (error) {
      console.error('Erro ao processar mensagem recebida:', error);
    }
  }

  extractMessageContent(message) {
    try {
      const messageType = getContentType(message.message);
      
      switch (messageType) {
        case 'conversation':
          return {
            text: message.message.conversation,
            type: 'text'
          };
          
        case 'extendedTextMessage':
          return {
            text: message.message.extendedTextMessage.text,
            type: 'text'
          };
          
        case 'imageMessage':
          return {
            text: message.message.imageMessage.caption || '',
            type: 'image',
            mediaUrl: null // Será processado posteriormente se necessário
          };
          
        case 'audioMessage':
          return {
            text: '',
            type: 'audio',
            mediaUrl: null
          };
          
        case 'videoMessage':
          return {
            text: message.message.videoMessage.caption || '',
            type: 'video',
            mediaUrl: null
          };
          
        case 'documentMessage':
          return {
            text: message.message.documentMessage.caption || '',
            type: 'document',
            mediaUrl: null
          };
          
        case 'stickerMessage':
          return {
            text: '',
            type: 'sticker',
            mediaUrl: null
          };
          
        case 'locationMessage':
          const location = message.message.locationMessage;
          return {
            text: `Localização: ${location.degreesLatitude}, ${location.degreesLongitude}`,
            type: 'location'
          };
          
        default:
          console.log('Tipo de mensagem não suportado:', messageType);
          return null;
      }
    } catch (error) {
      console.error('Erro ao extrair conteúdo da mensagem:', error);
      return null;
    }
  }

  async sendMessage(botId, userPhone, content, mediaType = 'text', options = {}) {
    try {
      const connection = this.connections.get(botId);
      
      if (!connection || !connection.socket) {
        throw new Error('Bot não está conectado');
      }

      const jid = userPhone.includes('@') ? userPhone : `${userPhone}@s.whatsapp.net`;
      
      let messagePayload;
      
      switch (mediaType) {
        case 'text':
          messagePayload = { text: content };
          break;
          
        case 'image':
          messagePayload = {
            image: { url: content },
            caption: options.caption || ''
          };
          break;
          
        case 'audio':
          messagePayload = {
            audio: { url: content },
            mimetype: 'audio/mp4'
          };
          break;
          
        case 'video':
          messagePayload = {
            video: { url: content },
            caption: options.caption || ''
          };
          break;
          
        case 'document':
          messagePayload = {
            document: { url: content },
            fileName: options.fileName || 'document',
            caption: options.caption || ''
          };
          break;
          
        default:
          messagePayload = { text: content };
      }

      const result = await connection.socket.sendMessage(jid, messagePayload);
      
      console.log(`Mensagem enviada para ${userPhone} via bot ${botId}`);
      
      return result;
      
    } catch (error) {
      console.error(`Erro ao enviar mensagem via bot ${botId}:`, error);
      throw error;
    }
  }

  async handleMessageStatusUpdate(botId, messageUpdate) {
    try {
      for (const update of messageUpdate) {
        if (update.update.status) {
          // Atualizar status da mensagem no banco
          await Message.update(
            { status: this.mapWhatsAppStatus(update.update.status) },
            { where: { whatsapp_message_id: update.key.id } }
          );
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status das mensagens:', error);
    }
  }

  mapWhatsAppStatus(status) {
    const statusMap = {
      1: 'sent',
      2: 'delivered',
      3: 'read'
    };
    
    return statusMap[status] || 'pending';
  }

  async disconnectBot(botId) {
    try {
      const connection = this.connections.get(botId);
      
      if (connection && connection.socket) {
        await connection.socket.logout();
        connection.socket.end();
      }
      
      this.connections.delete(botId);
      
      // Atualizar status no banco
      await Bot.update(
        {
          is_connected: false,
          connection_status: 'disconnected',
          qr_code: null
        },
        { where: { id: botId } }
      );
      
      console.log(`Bot ${botId} desconectado`);
      
    } catch (error) {
      console.error(`Erro ao desconectar bot ${botId}:`, error);
      throw error;
    }
  }

  async downloadMedia(message) {
    try {
      const buffer = await downloadMediaMessage(
        message,
        'buffer',
        {},
        {
          logger: { level: 'silent' },
          reuploadRequest: this.connections.get(message.botId)?.socket?.updateMediaMessage
        }
      );
      
      return buffer;
    } catch (error) {
      console.error('Erro ao baixar mídia:', error);
      throw error;
    }
  }

  getBotStatus(botId) {
    const connection = this.connections.get(botId);
    
    if (!connection) {
      return { status: 'disconnected' };
    }
    
    return {
      status: connection.socket?.user ? 'connected' : 'connecting',
      phone: connection.socket?.user?.id?.split(':')[0] || null
    };
  }

  getAllConnectedBots() {
    const connectedBots = [];
    
    for (const [botId, connection] of this.connections.entries()) {
      if (connection.socket && connection.socket.user) {
        connectedBots.push({
          botId,
          phone: connection.socket.user.id.split(':')[0],
          status: 'connected'
        });
      }
    }
    
    return connectedBots;
  }
}

module.exports = WhatsAppService;

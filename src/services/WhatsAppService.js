const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  downloadMediaMessage,
  getContentType,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { Bot, Conversation, Message } = require('../models');

class WhatsAppService {
  constructor(io) {
    this.io = io;
    this.connections = new Map(); // botId -> socket connection
    this.sessionDir = process.env.WHATSAPP_SESSION_DIR || 'whatsapp_sessions';

    // ADICIONAR: Rate limiting
    this.lastMessageTime = new Map(); // botId -> timestamp
    this.messageQueue = new Map(); // botId -> array de mensagens

    // Criar diretório de sessões se não existir
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  async connectBot(botId) {
    try {
      console.log(`🔄 Iniciando conexão ROBUSTA para bot ${botId}`);

      const bot = await Bot.findByPk(botId);
      if (!bot) {
        throw new Error('Bot não encontrado');
      }

      // Limpar conexão existente se houver
      if (this.connections.has(botId)) {
        const connection = this.connections.get(botId);
        if (connection.socket) {
          try {
            connection.socket.end();
          } catch (e) {}
        }
        this.connections.delete(botId);
        console.log(`🧹 Conexão anterior do bot ${botId} removida`);
      }

      // Limpar sessão antiga
      const sessionPath = path.join(this.sessionDir, `bot_${botId}`);
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`🗑️ Sessão antiga do bot ${botId} removida`);
      }

      // Aguardar um pouco para estabilizar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Buscar versão mais recente do Baileys
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`📱 Usando Baileys versão: ${version.join('.')}, Latest: ${isLatest}`);

      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

      // Logger completamente silencioso
      const baileyLogger = {
        level: 'silent',
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        fatal: () => {},
        child: () => ({
          level: 'silent',
          trace: () => {},
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
          fatal: () => {}
        })
      };

      // Aguardar um pouco para estabilizar
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos

      const socket = makeWASocket({
        auth: state,
        browser: ['Chrome', 'Chrome', '110.0.0.0'],
        printQRInTerminal: false,
        logger: baileyLogger,
        getMessage: async () => {
          return {
            conversation: ''
          };
        }
      });

      // Armazenar conexão
      this.connections.set(botId, { socket, saveCreds, bot });

      // Promise para aguardar QR Code ou conexão
      return new Promise((resolve, reject) => {
        let resolved = false;
        let qrGenerated = false;

        // Timeout mais longo
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            if (qrGenerated) {
              resolve({
                status: 'qr_ready',
                message: 'QR Code disponível para escaneamento'
              });
            } else {
              resolve({
                status: 'timeout',
                message: 'Timeout aguardando QR Code'
              });
            }
          }
        }, 60000);

        // Event handlers melhorados
        socket.ev.on('connection.update', async (update) => {
          try {
            // DEBUG COMPLETO
            console.log('=== CONNECTION UPDATE ===');
            console.log(JSON.stringify(update, null, 2));

            if (update.lastDisconnect?.error) {
              console.log('=== ERROR DETAILS ===');
              console.log('Error:', update.lastDisconnect.error.message);
              console.log('Stack:', update.lastDisconnect.error.stack);
            }

            const { connection, lastDisconnect, qr } = update;

            console.log(`🔄 Bot ${botId} - Update: connection=${connection}, qr=${!!qr}`);

            if (qr && !qrGenerated) {
              qrGenerated = true;
              console.log(`📱 QR Code gerado para bot ${botId}`);

              try {
                // Gerar QR Code como base64
                const qrCodeDataURL = await QRCode.toDataURL(qr, {
                  width: 256,
                  margin: 2,
                  color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                  }
                });
                const qrCodeBase64 = qrCodeDataURL.replace('data:image/png;base64,', '');

                // Salvar no banco
                await bot.update({
                  qr_code: qrCodeBase64,
                  connection_status: 'qr_generated'
                });

                if (!resolved) {
                  resolved = true;
                  clearTimeout(timeout);
                  resolve({
                    status: 'qr_generated',
                    message: 'QR Code gerado com sucesso',
                    qrCode: qrCodeBase64
                  });
                }
              } catch (qrError) {
                console.error(`❌ Erro ao gerar QR Code para bot ${botId}:`, qrError);
              }
            }

            if (connection === 'open') {
              console.log(`✅ Bot ${botId} conectado com sucesso!`);

              // Aguardar MAIS tempo antes de qualquer ação
              await new Promise(resolve => setTimeout(resolve, 10000)); // 10 segundos

              await bot.update({
                is_connected: true,
                connection_status: 'connected',
                phone_number: socket.user?.id?.split(':')[0] || null,
                last_seen: new Date()
              });

              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                resolve({
                  status: 'connected',
                  message: 'Bot conectado com sucesso',
                  phone: socket.user?.id?.split(':')[0]
                });
              }
            }

            if (connection === 'close') {
              const statusCode = lastDisconnect?.error?.output?.statusCode;
              console.log(`❌ Bot ${botId} desconectado. Código: ${statusCode}`);

              await bot.update({
                is_connected: false,
                connection_status: 'disconnected',
                qr_code: null
              });

              this.connections.delete(botId);

              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                resolve({
                  status: 'disconnected',
                  message: `Conexão rejeitada pelo WhatsApp (${statusCode})`,
                  error: statusCode
                });
              }
            }

          } catch (error) {
            console.error(`❌ Erro no connection.update do bot ${botId}:`, error);
          }
        });

        socket.ev.on('creds.update', saveCreds);

        // Eventos de mensagem apenas se conectado
        socket.ev.on('messages.upsert', async (messageUpdate) => {
          if (socket.user) {
            await this.handleIncomingMessages(botId, messageUpdate);
          }
        });

        socket.ev.on('messages.update', async (messageUpdate) => {
          if (socket.user) {
            await this.handleMessageStatusUpdate(botId, messageUpdate);
          }
        });
      });

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
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        const isRestartRequired = statusCode === DisconnectReason.restartRequired;
        const isBadSession = statusCode === DisconnectReason.badSession;

        console.log(`Bot ${botId} desconectado. Código: ${statusCode}`);

        await bot.update({
          is_connected: false,
          connection_status: 'disconnected',
          qr_code: null
        });

        this.connections.delete(botId);
        this.io.emit('bot-disconnected', { botId });

        if (isLoggedOut) {
          console.log(`Bot ${botId} foi deslogado pelo WhatsApp`);
        } else if (isBadSession) {
          console.log(`Bot ${botId} - sessão inválida, limpando...`);
          await this.clearBotSession(botId);
        } else if (isRestartRequired) {
          console.log(`Bot ${botId} - restart necessário`);
        } else {
          console.log(`Bot ${botId} - desconexão inesperada (${statusCode})`);
        }

        // NÃO reconectar automaticamente para evitar bloqueios
        console.log(`Bot ${botId} - reconexão manual necessária`);
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

      // ADICIONAR: Simular comportamento humano
      try {
        // Marcar como online
        await connection.socket.sendPresenceUpdate('available');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simular digitação
        await connection.socket.sendPresenceUpdate('composing', jid);

        // Delay baseado no tamanho da mensagem (50-100ms por caractere)
        const typingTime = Math.min(
          content.length * (50 + Math.random() * 50),
          5000 // máximo 5 segundos
        );
        await new Promise(resolve => setTimeout(resolve, typingTime));

        // Parar de digitar
        await connection.socket.sendPresenceUpdate('paused', jid);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        // Continuar mesmo se falhar presença
      }

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

      // ADICIONAR: Pequeno delay após enviar
      await new Promise(resolve => setTimeout(resolve, 100));

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

      if (connection) {
        // ADICIONAR: Limpar intervalo de presença
        if (connection.presenceInterval) {
          clearInterval(connection.presenceInterval);
        }

        if (connection.socket) {
          try {
            await connection.socket.sendPresenceUpdate('unavailable');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await connection.socket.logout();
          } catch (e) {}
          connection.socket.end();
        }
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

  async clearBotSession(botId) {
    try {
      console.log(`Limpando sessão do bot ${botId}`);

      // Desconectar se estiver conectado
      if (this.connections.has(botId)) {
        const connection = this.connections.get(botId);
        if (connection.socket) {
          connection.socket.end();
        }
        this.connections.delete(botId);
      }

      // Limpar arquivos de sessão
      const sessionPath = path.join(this.sessionDir, `bot_${botId}`);
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`Sessão do bot ${botId} removida`);
      }

      // Atualizar status no banco
      const bot = await Bot.findByPk(botId);
      if (bot) {
        await bot.update({
          is_connected: false,
          connection_status: 'disconnected',
          qr_code: null,
          phone_number: null
        });
      }

      return { success: true, message: 'Sessão limpa com sucesso' };
    } catch (error) {
      console.error(`Erro ao limpar sessão do bot ${botId}:`, error);
      throw error;
    }
  }
}

module.exports = WhatsAppService;

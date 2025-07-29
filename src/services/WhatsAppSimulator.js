const { Bot } = require('../models');
const QRCode = require('qrcode');

class WhatsAppSimulator {
  constructor(io) {
    this.io = io;
    this.connections = new Map();
    this.simulatedContacts = new Map();
    this.messageQueue = new Map();
  }

  async connectBot(botId) {
    try {
      console.log(`🤖 SIMULADOR: Conectando bot ${botId}`);
      
      const bot = await Bot.findByPk(botId);
      if (!bot) {
        throw new Error('Bot não encontrado');
      }

      // Simular processo de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Gerar QR Code simulado
      const simulatedQRData = `whatsapp-simulator-${botId}-${Date.now()}`;
      const qrCodeDataURL = await QRCode.toDataURL(simulatedQRData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      const qrCodeBase64 = qrCodeDataURL.replace('data:image/png;base64,', '');

      // Salvar QR Code no banco
      await bot.update({
        qr_code: qrCodeBase64,
        connection_status: 'qr_generated'
      });

      console.log(`📱 SIMULADOR: QR Code gerado para bot ${botId}`);

      // Simular escaneamento automático após 10 segundos
      setTimeout(async () => {
        await this.simulateConnection(botId);
      }, 10000);

      return {
        status: 'qr_generated',
        message: 'QR Code simulado gerado com sucesso',
        qrCode: qrCodeBase64
      };

    } catch (error) {
      console.error(`❌ SIMULADOR: Erro ao conectar bot ${botId}:`, error);
      throw error;
    }
  }

  async simulateConnection(botId) {
    try {
      const bot = await Bot.findByPk(botId);
      if (!bot) return;

      // Simular número de telefone
      const simulatedPhone = `55119${Math.floor(Math.random() * 90000000) + 10000000}`;

      // Atualizar bot como conectado
      await bot.update({
        is_connected: true,
        connection_status: 'connected',
        phone_number: simulatedPhone,
        last_seen: new Date(),
        qr_code: null
      });

      // Armazenar conexão simulada
      this.connections.set(botId, {
        phone: simulatedPhone,
        connected: true,
        connectedAt: new Date()
      });

      console.log(`✅ SIMULADOR: Bot ${botId} conectado com número ${simulatedPhone}`);

      // Emitir evento de conexão
      this.io.emit('bot-connected', { 
        botId, 
        phone: simulatedPhone,
        message: 'Bot conectado ao WhatsApp Simulador'
      });

      // Simular mensagem de boas-vindas
      setTimeout(() => {
        this.simulateIncomingMessage(botId, {
          from: 'sistema',
          message: '🎉 Parabéns! Seu bot está conectado e funcionando perfeitamente no WhatsApp Simulador!'
        });
      }, 2000);

    } catch (error) {
      console.error(`❌ SIMULADOR: Erro na conexão simulada:`, error);
    }
  }

  async simulateIncomingMessage(botId, messageData) {
    try {
      const { from, message, type = 'text' } = messageData;
      
      console.log(`📨 SIMULADOR: Mensagem recebida para bot ${botId} de ${from}: ${message}`);

      // Emitir evento de mensagem recebida
      this.io.emit('message-received', {
        botId,
        from,
        message,
        type,
        timestamp: new Date(),
        simulated: true
      });

      // Simular resposta automática
      setTimeout(() => {
        this.simulateOutgoingMessage(botId, {
          to: from,
          message: `🤖 Olá! Recebi sua mensagem: "${message}". Este é o WhatsApp Simulador funcionando perfeitamente!`
        });
      }, 1000);

    } catch (error) {
      console.error(`❌ SIMULADOR: Erro ao processar mensagem:`, error);
    }
  }

  async simulateOutgoingMessage(botId, messageData) {
    try {
      const { to, message } = messageData;
      
      console.log(`📤 SIMULADOR: Enviando mensagem do bot ${botId} para ${to}: ${message}`);

      // Emitir evento de mensagem enviada
      this.io.emit('message-sent', {
        botId,
        to,
        message,
        timestamp: new Date(),
        simulated: true,
        status: 'delivered'
      });

      return {
        success: true,
        messageId: `sim_${Date.now()}`,
        status: 'sent'
      };

    } catch (error) {
      console.error(`❌ SIMULADOR: Erro ao enviar mensagem:`, error);
      throw error;
    }
  }

  async disconnectBot(botId) {
    try {
      console.log(`🔌 SIMULADOR: Desconectando bot ${botId}`);

      const bot = await Bot.findByPk(botId);
      if (bot) {
        await bot.update({
          is_connected: false,
          connection_status: 'disconnected',
          qr_code: null
        });
      }

      this.connections.delete(botId);

      this.io.emit('bot-disconnected', { botId });

      return { success: true, message: 'Bot desconectado do simulador' };

    } catch (error) {
      console.error(`❌ SIMULADOR: Erro ao desconectar bot:`, error);
      throw error;
    }
  }

  async sendMessage(botId, to, message) {
    try {
      if (!this.connections.has(botId)) {
        throw new Error('Bot não está conectado ao simulador');
      }

      return await this.simulateOutgoingMessage(botId, { to, message });

    } catch (error) {
      console.error(`❌ SIMULADOR: Erro ao enviar mensagem:`, error);
      throw error;
    }
  }

  isConnected(botId) {
    return this.connections.has(botId) && this.connections.get(botId).connected;
  }

  getConnectionInfo(botId) {
    return this.connections.get(botId) || null;
  }

  // Simular contatos para testes
  async createTestContact(botId, name, phone) {
    const contactId = `sim_${phone}`;
    this.simulatedContacts.set(contactId, {
      name,
      phone,
      botId,
      createdAt: new Date()
    });

    console.log(`👤 SIMULADOR: Contato teste criado - ${name} (${phone})`);
    return contactId;
  }

  // Simular mensagem de teste
  async sendTestMessage(botId, contactPhone, message) {
    setTimeout(() => {
      this.simulateIncomingMessage(botId, {
        from: contactPhone,
        message: message
      });
    }, 1000);

    console.log(`🧪 SIMULADOR: Mensagem de teste agendada de ${contactPhone}`);
  }

  // Obter estatísticas do simulador
  getSimulatorStats() {
    return {
      connectedBots: this.connections.size,
      simulatedContacts: this.simulatedContacts.size,
      totalMessages: Array.from(this.messageQueue.values()).reduce((sum, queue) => sum + queue.length, 0),
      uptime: process.uptime()
    };
  }
}

module.exports = WhatsAppSimulator;

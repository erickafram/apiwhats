const express = require('express');
const router = express.Router();

// Webhook para receber mensagens da UltraMsg
router.post('/webhook', async (req, res) => {
  try {
    console.log('📨 Webhook UltraMsg recebido:', JSON.stringify(req.body, null, 2));

    // Verificar se o serviço UltraMsg está disponível
    if (!global.ultraMsgService) {
      console.log('⚠️ UltraMsgService não está disponível');
      return res.status(200).json({ success: false, message: 'Serviço não disponível' });
    }

    // Processar mensagem recebida
    await global.ultraMsgService.processIncomingMessage(req.body);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Erro no webhook UltraMsg:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para conectar bot
router.post('/connect/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!global.ultraMsgService) {
      return res.status(400).json({
        error: 'Serviço UltraMsg não disponível',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    console.log(`🔄 Conectando bot ${botId} via UltraMsg`);
    const result = await global.ultraMsgService.connectBot(parseInt(botId));

    res.json({
      message: 'Bot conectado com sucesso',
      data: result
    });
  } catch (error) {
    console.error(`❌ Erro ao conectar bot:`, error);
    res.status(500).json({
      error: error.message,
      code: 'CONNECTION_ERROR'
    });
  }
});

// Endpoint para desconectar bot
router.post('/disconnect/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!global.ultraMsgService) {
      return res.status(400).json({
        error: 'Serviço UltraMsg não disponível',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    console.log(`🔌 Desconectando bot ${botId}`);
    const result = await global.ultraMsgService.disconnectBot(parseInt(botId));

    res.json({
      message: 'Bot desconectado com sucesso',
      data: result
    });
  } catch (error) {
    console.error(`❌ Erro ao desconectar bot:`, error);
    res.status(500).json({
      error: error.message,
      code: 'DISCONNECTION_ERROR'
    });
  }
});

// Endpoint para obter QR Code
router.get('/qr-code/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!global.ultraMsgService) {
      return res.status(400).json({
        error: 'Serviço UltraMsg não disponível',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const qrCode = await global.ultraMsgService.generateQRCode(parseInt(botId));

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR Code não disponível',
        code: 'QR_NOT_FOUND'
      });
    }

    res.json({
      qrCode: qrCode
    });
  } catch (error) {
    console.error(`❌ Erro ao obter QR Code:`, error);
    res.status(500).json({
      error: error.message,
      code: 'QR_CODE_ERROR'
    });
  }
});

// Endpoint para verificar status da instância
router.get('/status', async (req, res) => {
  try {
    if (!global.ultraMsgService) {
      return res.status(400).json({
        error: 'Serviço UltraMsg não disponível',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const status = await global.ultraMsgService.getInstanceStatus();
    
    res.json({
      status: status
    });
  } catch (error) {
    console.error(`❌ Erro ao obter status:`, error);
    res.status(500).json({
      error: error.message,
      code: 'STATUS_ERROR'
    });
  }
});

// Endpoint para enviar mensagem manual
router.post('/send-message', async (req, res) => {
  try {
    const { botId, to, message, mediaType = 'text' } = req.body;

    if (!global.ultraMsgService) {
      return res.status(400).json({
        error: 'Serviço UltraMsg não disponível',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    if (!botId || !to || !message) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios: botId, to, message',
        code: 'MISSING_PARAMS'
      });
    }

    const result = await global.ultraMsgService.sendMessage(botId, to, message, mediaType);

    res.json({
      message: 'Mensagem enviada com sucesso',
      data: result
    });
  } catch (error) {
    console.error(`❌ Erro ao enviar mensagem:`, error);
    res.status(500).json({
      error: error.message,
      code: 'SEND_ERROR'
    });
  }
});

// Endpoint para verificar número no WhatsApp
router.post('/check-number', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!global.ultraMsgService) {
      return res.status(400).json({
        error: 'Serviço UltraMsg não disponível',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    if (!phone) {
      return res.status(400).json({
        error: 'Número de telefone é obrigatório',
        code: 'PHONE_REQUIRED'
      });
    }

    const result = await global.ultraMsgService.checkPhoneNumber(phone);

    res.json({
      data: result
    });
  } catch (error) {
    console.error(`❌ Erro ao verificar número:`, error);
    res.status(500).json({
      error: error.message,
      code: 'CHECK_ERROR'
    });
  }
});

// Endpoint para obter informações da conta
router.get('/account-info', async (req, res) => {
  try {
    if (!global.ultraMsgService) {
      return res.status(400).json({
        error: 'Serviço UltraMsg não disponível',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const accountInfo = await global.ultraMsgService.getAccountInfo();

    res.json({
      data: accountInfo
    });
  } catch (error) {
    console.error(`❌ Erro ao obter informações da conta:`, error);
    res.status(500).json({
      error: error.message,
      code: 'ACCOUNT_INFO_ERROR'
    });
  }
});

// Endpoint para obter chats
router.get('/chats', async (req, res) => {
  try {
    if (!global.ultraMsgService) {
      return res.status(400).json({
        error: 'Serviço UltraMsg não disponível',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const chats = await global.ultraMsgService.getChats();

    res.json({
      data: chats
    });
  } catch (error) {
    console.error(`❌ Erro ao obter chats:`, error);
    res.status(500).json({
      error: error.message,
      code: 'CHATS_ERROR'
    });
  }
});

// Endpoint para configurar webhook
router.post('/setup-webhook', async (req, res) => {
  try {
    if (!global.ultraMsgService) {
      return res.status(400).json({
        error: 'Serviço UltraMsg não disponível',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const result = await global.ultraMsgService.setupWebhook();

    res.json({
      message: 'Webhook configurado com sucesso',
      data: result
    });
  } catch (error) {
    console.error(`❌ Erro ao configurar webhook:`, error);
    res.status(500).json({
      error: error.message,
      code: 'WEBHOOK_ERROR'
    });
  }
});

// Endpoint para teste
router.get('/test', (req, res) => {
  res.json({
    message: 'UltraMsg API funcionando!',
    timestamp: new Date().toISOString(),
    service: global.ultraMsgService ? 'Ativo' : 'Inativo'
  });
});

module.exports = router;

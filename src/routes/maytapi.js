const express = require('express');
const router = express.Router();

// Webhook para receber mensagens da Maytapi
router.post('/webhook', async (req, res) => {
  try {
    console.log('📨 Webhook Maytapi recebido:', JSON.stringify(req.body, null, 2));
    
    const { type, phone_id, message, user } = req.body;
    
    if (type !== 'message' || !message) {
      return res.status(200).json({ status: 'ignored' });
    }

    // Processar mensagem via MaytapiService global
    if (global.maytapiService) {
      await global.maytapiService.processIncomingMessage(req.body);
    }

    res.status(200).json({ status: 'processed' });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para testar webhook
router.get('/webhook/test', (req, res) => {
  res.json({ 
    message: 'Webhook Maytapi funcionando',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para obter status das conexões
router.get('/connections', (req, res) => {
  try {
    if (!global.maytapiService) {
      return res.status(503).json({ error: 'MaytapiService não inicializado' });
    }

    const connections = global.maytapiService.getAllConnections();
    res.json({ connections });

  } catch (error) {
    console.error('❌ Erro ao obter conexões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para conectar bot específico
router.post('/connect/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!global.maytapiService) {
      return res.status(503).json({ error: 'MaytapiService não inicializado' });
    }

    const result = await global.maytapiService.connectBot(parseInt(botId));
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao conectar bot:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para desconectar bot
router.post('/disconnect/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!global.maytapiService) {
      return res.status(503).json({ error: 'MaytapiService não inicializado' });
    }

    const result = await global.maytapiService.disconnectBot(parseInt(botId));
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao desconectar bot:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obter QR Code
router.get('/qr/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!global.maytapiService) {
      return res.status(503).json({ error: 'MaytapiService não inicializado' });
    }

    const connection = global.maytapiService.getConnectionInfo(parseInt(botId));
    
    if (!connection.phoneId) {
      return res.status(404).json({ error: 'Bot não conectado' });
    }

    // Tentar gerar QR code
    const qrCode = await global.maytapiService.generateQRCode(parseInt(botId), connection.phoneId);
    res.json({ qrCode });

  } catch (error) {
    console.error('❌ Erro ao gerar QR Code:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para enviar mensagem de teste
router.post('/send-test', async (req, res) => {
  try {
    const { botId, to, message } = req.body;

    if (!global.maytapiService) {
      return res.status(503).json({ error: 'MaytapiService não inicializado' });
    }

    const result = await global.maytapiService.sendMessage(botId, to, message);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

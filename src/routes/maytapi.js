const express = require('express');
const router = express.Router();

// Webhook para receber mensagens da Maytapi
router.post('/webhook', async (req, res) => {
  try {
    console.log('📨 Webhook Maytapi recebido:', JSON.stringify(req.body, null, 2));

    const webhookData = req.body;

    // Verificar se é uma mensagem
    if (webhookData.type === 'message' && webhookData.message) {
      // Processar mensagem através do serviço global
      if (global.maytapiService) {
        await global.maytapiService.processIncomingMessage(webhookData);
      } else {
        console.log('⚠️ MaytapiService não inicializado');
      }
    }

    // Responder com sucesso
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Erro no webhook Maytapi:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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

// Endpoint para desconectar bot específico
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

// Endpoint para enviar mensagem de teste
router.post('/send-test', async (req, res) => {
  try {
    const { botId, to, message } = req.body;

    if (!global.maytapiService) {
      return res.status(503).json({ error: 'MaytapiService não inicializado' });
    }

    if (!botId || !to || !message) {
      return res.status(400).json({ error: 'botId, to e message são obrigatórios' });
    }

    const result = await global.maytapiService.sendMessage(botId, to, message);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
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

module.exports = router;

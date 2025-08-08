const express = require('express');
const router = express.Router();

// Webhook para receber mensagens do Whapi
router.post('/webhook', async (req, res) => {
  try {
    console.log('📨 Webhook recebido do Whapi:', JSON.stringify(req.body, null, 2));

    // Verificar se o serviço Whapi está disponível
    if (!global.whapiService) {
      console.log('⚠️ WhapiService não está disponível');
      return res.status(200).json({ success: false, message: 'Serviço não disponível' });
    }

    // Processar mensagem recebida
    await global.whapiService.processIncomingMessage(req.body);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Erro no webhook Whapi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para conectar bot
router.post('/connect/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!global.whapiService) {
      return res.status(400).json({ success: false, message: 'WhapiService não disponível' });
    }

    const result = await global.whapiService.connectBot(botId);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao conectar bot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para desconectar bot
router.post('/disconnect/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!global.whapiService) {
      return res.status(400).json({ success: false, message: 'WhapiService não disponível' });
    }

    const result = await global.whapiService.disconnectBot(botId);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao desconectar bot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para obter status da conexão
router.get('/status/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!global.whapiService) {
      return res.status(400).json({ success: false, message: 'WhapiService não disponível' });
    }

    const info = global.whapiService.getConnectionInfo(botId);
    res.json({ success: true, data: info });
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para gerar QR Code
router.get('/qr/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!global.whapiService) {
      return res.status(400).json({ success: false, message: 'WhapiService não disponível' });
    }

    const qrCode = await global.whapiService.generateQRCode(botId);
    res.json({ success: true, qrCode });
  } catch (error) {
    console.error('❌ Erro ao gerar QR Code:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para enviar mensagem (para testes)
router.post('/send', async (req, res) => {
  try {
    const { botId, to, message, options = {} } = req.body;

    if (!global.whapiService) {
      return res.status(400).json({ success: false, message: 'WhapiService não disponível' });
    }

    const result = await global.whapiService.sendMessage(botId, to, message, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para listar todas as conexões
router.get('/connections', async (req, res) => {
  try {
    if (!global.whapiService) {
      return res.status(400).json({ success: false, message: 'WhapiService não disponível' });
    }

    const connections = global.whapiService.getAllConnections();
    res.json({ success: true, data: connections });
  } catch (error) {
    console.error('❌ Erro ao listar conexões:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

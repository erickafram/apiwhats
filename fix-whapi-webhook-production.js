#!/usr/bin/env node

const axios = require('axios');

// Configurações do Whapi para produção
const WHAPI_TOKEN = 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = 'https://gate.whapi.cloud';
const WEBHOOK_URL = 'https://chatbotwhats.online/api/whapi/webhook';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${WHAPI_TOKEN}`
};

async function fixWhapiWebhook() {
  console.log('🔧 CONFIGURANDO WEBHOOK WHAPI.CLOUD PARA PRODUÇÃO');
  console.log('===============================================');
  console.log('');
  console.log(`🔗 API URL: ${WHAPI_API_URL}`);
  console.log(`🔑 Token: ${WHAPI_TOKEN.substring(0, 10)}...`);
  console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
  console.log('');

  try {
    // 1. Verificar configurações atuais
    console.log('1️⃣ Verificando configurações atuais...');
    const currentSettings = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
    console.log('✅ Configurações atuais:');
    console.log(JSON.stringify(currentSettings.data, null, 2));
    console.log('');

    // 2. Configurar webhook correto
    console.log('2️⃣ Configurando webhook para Whapi...');
    const webhookConfig = {
      webhooks: [
        {
          url: WEBHOOK_URL,
          mode: 'body',
          events: [
            {
              type: 'messages',
              method: 'post'
            },
            {
              type: 'statuses',
              method: 'post'
            }
          ]
        }
      ]
    };

    const webhookResponse = await axios.patch(
      `${WHAPI_API_URL}/settings`,
      webhookConfig,
      { headers }
    );

    console.log('✅ Webhook configurado com sucesso!');
    console.log('📋 Resposta:', JSON.stringify(webhookResponse.data, null, 2));
    console.log('');

    // 3. Verificar se ficou correto
    console.log('3️⃣ Verificando configuração final...');
    const finalSettings = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
    console.log('✅ Configurações finais:');
    console.log(JSON.stringify(finalSettings.data, null, 2));
    console.log('');

    // 4. Testar conexão
    console.log('4️⃣ Testando status da conexão...');
    try {
      const statusResponse = await axios.get(`${WHAPI_API_URL}/me`, { headers });
      console.log('✅ WhatsApp conectado!');
      console.log('👤 Usuário:', JSON.stringify(statusResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ WhatsApp não conectado ainda. Pode precisar escanear QR Code.');
      console.log('📱 Acesse o painel Whapi.cloud para conectar seu WhatsApp.');
    }

    console.log('');
    console.log('🎉 CONFIGURAÇÃO CONCLUÍDA!');
    console.log('');
    console.log('🔥 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Webhook configurado para: ' + WEBHOOK_URL);
    console.log('2. 📱 Se necessário, conecte seu WhatsApp no painel Whapi.cloud');
    console.log('3. 💬 Teste enviando uma mensagem para o bot');
    console.log('4. 📊 Monitore os logs: pm2 logs chatbot-whats-api');
    console.log('');

  } catch (error) {
    console.error('❌ ERRO:', error.response?.data || error.message);
    console.log('');
    console.log('🔧 VERIFICAÇÕES:');
    console.log('- Token está correto?');
    console.log('- Whapi.cloud está acessível?');
    console.log('- URL do webhook está correta?');
  }
}

// Executar
fixWhapiWebhook();

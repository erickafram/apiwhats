const axios = require('axios');
require('dotenv').config();

// Configurações do Whapi
const WHAPI_TOKEN = process.env.WHAPI_TOKEN || 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:5000/api/whapi/webhook';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${WHAPI_TOKEN}`
};

async function setupWhapiWebhook() {
  console.log('🔧 CONFIGURAÇÃO DO WEBHOOK WHAPI.CLOUD');
  console.log('====================================');
  console.log('');

  try {
    console.log('1️⃣ Configurações atuais:');
    console.log(`🔗 API URL: ${WHAPI_API_URL}`);
    console.log(`🔑 Token: ${WHAPI_TOKEN.substring(0, 10)}...`);
    console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
    console.log('');

    // Primeiro, vamos ver as configurações atuais
    console.log('2️⃣ Verificando configurações atuais...');
    try {
      const currentSettings = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
      console.log('✅ Configurações atuais:', JSON.stringify(currentSettings.data, null, 2));
      console.log('');
    } catch (error) {
      console.log('❌ Erro ao obter configurações:', error.response?.data || error.message);
      return;
    }

    // Configurar webhook
    console.log('3️⃣ Configurando webhook...');
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

    try {
      const webhookResponse = await axios.patch(
        `${WHAPI_API_URL}/settings`,
        webhookConfig,
        { headers }
      );

      console.log('✅ Webhook configurado com sucesso!');
      console.log('📋 Resposta:', JSON.stringify(webhookResponse.data, null, 2));
      console.log('');
    } catch (error) {
      console.log('❌ Erro ao configurar webhook:', error.response?.data || error.message);
      console.log('');
    }

    // Verificar configurações finais
    console.log('4️⃣ Verificando configurações finais...');
    try {
      const finalSettings = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
      console.log('✅ Configurações finais:', JSON.stringify(finalSettings.data, null, 2));
      console.log('');
    } catch (error) {
      console.log('❌ Erro ao verificar configurações finais:', error.response?.data || error.message);
    }

    console.log('✅ CONFIGURAÇÃO CONCLUÍDA!');
    console.log('');
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('1. Inicie o servidor: npm start');
    console.log('2. Acesse o frontend: http://localhost:3000/bots');
    console.log('3. Crie um bot e conecte via Whapi');
    console.log('4. Teste enviando mensagens');
    console.log('');

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
    console.log('');
    console.log('🔧 VERIFICAÇÕES:');
    console.log('- Token está correto?');
    console.log('- URL do webhook está acessível?');
    console.log('- Whapi.cloud está funcionando?');
  }
}

// Executar configuração
if (require.main === module) {
  setupWhapiWebhook();
}

module.exports = { setupWhapiWebhook };

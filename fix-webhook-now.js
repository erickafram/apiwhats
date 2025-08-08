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

async function fixWebhookUrgent() {
  console.log('🚨 CORREÇÃO URGENTE: Bot não responde no WhatsApp');
  console.log('================================================');
  console.log('');

  try {
    // 1. Verificar status da API Whapi
    console.log('1️⃣ Testando conexão com Whapi...');
    const statusResponse = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
    console.log('✅ Conexão com Whapi OK');
    console.log('');

    // 2. Verificar configuração atual do webhook
    console.log('2️⃣ Verificando configuração atual...');
    console.log('Webhook atual configurado:', statusResponse.data.webhooks || 'Nenhum');
    console.log('');

    // 3. Configurar webhook correto
    console.log('3️⃣ Configurando webhook CORRETO...');
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

    const updateResponse = await axios.patch(
      `${WHAPI_API_URL}/settings`,
      webhookConfig,
      { headers }
    );

    console.log('✅ Webhook configurado com sucesso!');
    console.log('');

    // 4. Testar se o webhook está funcionando
    console.log('4️⃣ Testando webhook...');
    const testMessage = {
      chatId: '556392410056@s.whatsapp.net',
      text: '🤖 Bot reconfigurado! Digite "menu" para testar.'
    };

    try {
      const sendResponse = await axios.post(
        `${WHAPI_API_URL}/messages/text`,
        testMessage,
        { headers }
      );
      console.log('✅ Mensagem de teste enviada!');
    } catch (sendError) {
      console.log('⚠️ Não foi possível enviar mensagem de teste:', sendError.response?.data || sendError.message);
    }

    console.log('');
    console.log('5️⃣ Verificando configuração final...');
    const finalCheck = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
    console.log('Webhook configurado:', finalCheck.data.webhooks?.[0]?.url || 'Erro');

    console.log('');
    console.log('✅ CORREÇÃO CONCLUÍDA!');
    console.log('');
    console.log('📱 Agora teste no WhatsApp:');
    console.log('1. Envie "menu" para o bot');
    console.log('2. O bot deve responder imediatamente');
    console.log('');
    console.log('Se ainda não funcionar, execute:');
    console.log('pm2 restart chatbot-whats-api');

  } catch (error) {
    console.error('❌ Erro na correção:', error.response?.data || error.message);
    console.log('');
    console.log('🔧 Possíveis soluções:');
    console.log('1. Verificar se o token Whapi está correto');
    console.log('2. Verificar se o domínio está acessível');
    console.log('3. Reiniciar o servidor: pm2 restart chatbot-whats-api');
  }
}

// Executar correção
fixWebhookUrgent().catch(console.error);

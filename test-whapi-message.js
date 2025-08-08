#!/usr/bin/env node

const axios = require('axios');

// Configurações do Whapi para produção
const WHAPI_TOKEN = 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = 'https://gate.whapi.cloud';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${WHAPI_TOKEN}`
};

async function testWhapiMessage() {
  console.log('📱 TESTE DE MENSAGEM WHAPI.CLOUD');
  console.log('===============================');
  console.log('');

  try {
    // 1. Verificar status atual
    console.log('1️⃣ Verificando status da conexão...');
    try {
      const statusResponse = await axios.get(`${WHAPI_API_URL}/me`, { headers });
      console.log('✅ WhatsApp conectado!');
      console.log('👤 Usuário:', statusResponse.data.name || statusResponse.data.pushname);
      console.log('📞 Número:', statusResponse.data.id);
    } catch (error) {
      console.log('⚠️ Erro ao verificar status:', error.response?.data || error.message);
    }
    console.log('');

    // 2. Enviar mensagem de teste
    console.log('2️⃣ Enviando mensagem de teste...');
    const testMessage = {
      to: '556392410056', // Seu número
      body: '🤖 Teste do bot via Whapi.cloud!\n\nSe você recebeu esta mensagem, o sistema está funcionando perfeitamente! 🎉'
    };

    try {
      const messageResponse = await axios.post(
        `${WHAPI_API_URL}/messages/text`,
        testMessage,
        { headers }
      );

      console.log('✅ Mensagem enviada com sucesso!');
      console.log('📋 ID da mensagem:', messageResponse.data.id);
      console.log('📊 Status:', messageResponse.data.status);
    } catch (error) {
      console.log('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
    }
    console.log('');

    // 3. Verificar webhook configurado
    console.log('3️⃣ Verificando webhook...');
    try {
      const settingsResponse = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
      const webhooks = settingsResponse.data.webhooks || [];
      
      console.log('📋 Webhooks configurados:');
      webhooks.forEach((webhook, index) => {
        console.log(`  ${index + 1}. ${webhook.url}`);
        console.log(`     Eventos: ${webhook.events.map(e => e.type).join(', ')}`);
      });
    } catch (error) {
      console.log('❌ Erro ao verificar webhooks:', error.response?.data || error.message);
    }

    console.log('');
    console.log('🎯 PRÓXIMO PASSO:');
    console.log('📱 Envie uma mensagem para o WhatsApp conectado');
    console.log('📊 Monitore os logs: pm2 logs chatbot-whats-api');
    console.log('✅ Deve aparecer: "📨 Processando X mensagem(s) recebida(s)"');

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }
}

// Executar
testWhapiMessage();

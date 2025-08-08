#!/usr/bin/env node

const axios = require('axios');

// Configurações
const WHAPI_TOKEN = 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = 'https://gate.whapi.cloud';
const USER_PHONE = '556392410056@s.whatsapp.net';

async function sendManualResponse() {
  console.log('🤖 TESTE: Enviando resposta manual para o usuário');
  console.log('================================================');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WHAPI_TOKEN}`
  };

  const messages = [
    '🎯 Olá! Seu bot está funcionando!',
    '📋 Menu Principal:\n\n1️⃣ Informações\n2️⃣ Cadastro\n3️⃣ Suporte\n4️⃣ Vendas\n\nDigite o número da opção:',
    '✅ Sistema reconfigurado com sucesso!'
  ];

  try {
    for (let i = 0; i < messages.length; i++) {
      const message = {
        to: USER_PHONE,
        body: messages[i]
      };

      console.log(`📨 Enviando mensagem ${i + 1}/${messages.length}...`);
      
      const response = await axios.post(
        `${WHAPI_API_URL}/messages/text`,
        message,
        { headers }
      );

      if (response.data) {
        console.log(`✅ Mensagem ${i + 1} enviada com sucesso!`);
      }

      // Delay entre mensagens
      if (i < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 Todas as mensagens foram enviadas!');
    console.log('\n📱 Agora teste respondendo "menu" no WhatsApp');
    console.log('Se o bot responder automaticamente, o problema foi resolvido!');

  } catch (error) {
    console.error('❌ Erro ao enviar mensagens:', error.response?.data || error.message);
  }
}

// Executar
sendManualResponse().catch(console.error);

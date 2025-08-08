#!/usr/bin/env node

const axios = require('axios');

async function debugMenuFlow() {
  console.log('🔍 DEBUG: Fluxo do Menu de Passagens');
  console.log('====================================');

  try {
    // 1. Simular webhook de "menu"
    console.log('1️⃣ Simulando recebimento de "menu"...');
    const menuWebhook = {
      messages: [
        {
          id: "debug-menu-123",
          from_me: false,
          type: "text",
          chat_id: "556392410056@s.whatsapp.net",
          timestamp: Math.floor(Date.now() / 1000),
          text: { body: "menu" },
          from: "556392410056",
          from_name: "Erick Vinicius"
        }
      ],
      event: {
        type: "messages",
        event: "post"
      }
    };

    const menuResponse = await axios.post('http://localhost:5000/api/whapi/webhook', menuWebhook, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Webhook "menu" enviado');

    // Aguardar processamento
    await delay(3000);

    // 2. Simular webhook da opção "1"
    console.log('\n2️⃣ Simulando recebimento de "1"...');
    const opcao1Webhook = {
      messages: [
        {
          id: "debug-opcao1-456",
          from_me: false,
          type: "text",
          chat_id: "556392410056@s.whatsapp.net",
          timestamp: Math.floor(Date.now() / 1000),
          text: { body: "1" },
          from: "556392410056",
          from_name: "Erick Vinicius"
        }
      ],
      event: {
        type: "messages",
        event: "post"
      }
    };

    const opcao1Response = await axios.post('http://localhost:5000/api/whapi/webhook', opcao1Webhook, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Webhook "1" enviado');

    // Aguardar processamento
    await delay(3000);

    // 3. Verificar se houve resposta
    console.log('\n3️⃣ Verificando se o bot respondeu...');
    console.log('Verifique seus logs do PM2 para ver se apareceu:');
    console.log('- "📨 Mensagem recebida para bot 1 de 556392410056: menu"');
    console.log('- "📨 Mensagem recebida para bot 1 de 556392410056: 1"');
    console.log('- "✅ Mensagem enviada para 556392410056 via bot 1"');

    // 4. Testar resposta manual
    console.log('\n4️⃣ Enviando resposta manual como fallback...');
    
    const WHAPI_TOKEN = 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
    const manualMessage = {
      to: '556392410056@s.whatsapp.net',
      body: '🏃‍♂️ DEBUG: Você escolheu a opção 1!\n\n📍 Digite a cidade de ORIGEM:'
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WHAPI_TOKEN}`
    };

    await axios.post('https://gate.whapi.cloud/messages/text', manualMessage, { headers });
    console.log('✅ Resposta manual enviada!');

    console.log('\n🎯 TESTE CONCLUÍDO!');
    console.log('\nSe você recebeu a mensagem "Digite a cidade de ORIGEM:", significa que:');
    console.log('- O webhook funciona ✅');
    console.log('- O envio via Whapi funciona ✅');
    console.log('- O problema está no processamento do fluxo ❌');
    console.log('\nMonitore: pm2 logs chatbot-whats-api --lines 0');

  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
    if (error.response) {
      console.error('Resposta do servidor:', error.response.data);
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar
debugMenuFlow().catch(console.error);

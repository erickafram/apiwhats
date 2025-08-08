#!/usr/bin/env node

const axios = require('axios');

// Configurações
const WHAPI_TOKEN = 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = 'https://gate.whapi.cloud';
const USER_PHONE = '556392410056@s.whatsapp.net';

async function testFlowStepByStep() {
  console.log('🔍 TESTE: Fluxo de Passagens Passo a Passo');
  console.log('==========================================');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WHAPI_TOKEN}`
  };

  try {
    // Passo 1: Simular início do fluxo
    console.log('1️⃣ Simulando: "comprar passagem"');
    await sendMessage('🚌 Iniciando fluxo de compra...');
    await delay(2000);

    // Passo 2: Simular menu
    console.log('2️⃣ Enviando menu de opções...');
    await sendMessage(`🚌 BEM-VINDO AO SISTEMA DE PASSAGENS

Escolha uma opção:

1️⃣ Comprar Passagem
2️⃣ Horários e Destinos  
3️⃣ Informações da Empresa

Digite o número da opção desejada:`);
    await delay(3000);

    // Passo 3: Simular escolha da opção 1
    console.log('3️⃣ Simulando seleção da opção 1...');
    await sendMessage('🏃‍♂️ Vamos comprar sua passagem!\n\n📍 Primeiro, digite a cidade de ORIGEM:');
    await delay(2000);

    // Passo 4: Aguardar resposta do usuário
    console.log('4️⃣ Aguardando usuário digitar cidade de origem...');
    console.log('   (Digite uma cidade quando aparecer a mensagem acima)');
    await delay(10000); // 10 segundos para o usuário responder

    // Passo 5: Continuar com destino
    console.log('5️⃣ Enviando próximo passo (destino)...');
    await sendMessage('🎯 Agora digite a cidade de DESTINO:');
    await delay(2000);

    console.log('\n✅ TESTE CONCLUÍDO!');
    console.log('\n📱 Agora teste no WhatsApp:');
    console.log('1. Digite "comprar passagem"');
    console.log('2. Digite "1" quando aparecer o menu');
    console.log('3. Veja se aparece "digite a cidade de ORIGEM"');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }

  async function sendMessage(text) {
    try {
      const message = { to: USER_PHONE, body: text };
      const response = await axios.post(`${WHAPI_API_URL}/messages/text`, message, { headers });
      console.log(`✅ Enviado: ${text.substring(0, 50)}...`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao enviar: ${error.response?.data || error.message}`);
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar
testFlowStepByStep().catch(console.error);

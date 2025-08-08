#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

const WHAPI_TOKEN = process.env.WHAPI_TOKEN || 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${WHAPI_TOKEN}`
};

async function testWhapiSend() {
  console.log('📤 TESTANDO ENVIO DE MENSAGEM WHAPI');
  console.log('===================================');
  console.log('');

  try {
    // 1. Verificar configurações
    console.log('1️⃣ Verificando configurações...');
    try {
      const response = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
      console.log('   ✅ Configurações OK');
      console.log('   📋 Webhooks:', response.data.webhooks?.length || 0, 'configurados');
    } catch (error) {
      console.log('   ❌ Erro nas configurações:', error.message);
      return false;
    }

    // 2. Tentar enviar mensagem de teste (use seu próprio número)
    console.log('\n2️⃣ Testando envio de mensagem...');
    
    // IMPORTANTE: Substitua pelo seu número de WhatsApp para teste
    const testNumber = '556392410056'; // Número que está nos logs
    
    const messageData = {
      to: testNumber,
      body: '🤖 Teste de conexão do bot - ' + new Date().toLocaleTimeString()
    };

    try {
      const response = await axios.post(`${WHAPI_API_URL}/messages/text`, messageData, { headers });
      console.log('   ✅ Mensagem enviada com sucesso!');
      console.log('   📱 Resposta:', JSON.stringify(response.data, null, 2));
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ❌ Token inválido (401 Unauthorized)');
        console.log('   🔧 Verifique o token do Whapi');
      } else if (error.response?.status === 404) {
        console.log('   ❌ Endpoint não encontrado (404)');
        console.log('   🔧 WhatsApp pode não estar conectado');
      } else {
        console.log('   ❌ Erro no envio:', error.response?.status, error.response?.data || error.message);
      }
      return false;
    }

  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error.message);
    return false;
  }
}

if (require.main === module) {
  testWhapiSend().then(success => {
    if (success) {
      console.log('\n🎉 SUCESSO!');
      console.log('   A conexão Whapi está funcionando.');
      console.log('   O bot pode enviar mensagens normalmente.');
    } else {
      console.log('\n❌ FALHA!');
      console.log('   Verifique:');
      console.log('   1. Token do Whapi válido');
      console.log('   2. WhatsApp conectado na instância');
      console.log('   3. Número de destino válido');
    }
  });
}

module.exports = testWhapiSend;

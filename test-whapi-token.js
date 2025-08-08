#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

// Configurações do Whapi
const WHAPI_TOKEN = process.env.WHAPI_TOKEN || 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${WHAPI_TOKEN}`
};

async function testWhapiToken() {
  console.log('🔧 TESTE DO TOKEN WHAPI');
  console.log('======================');
  console.log('');
  console.log(`🔗 API URL: ${WHAPI_API_URL}`);
  console.log(`🔑 Token: ${WHAPI_TOKEN.substring(0, 15)}...`);
  console.log('');

  try {
    // 1. Testar autenticação básica
    console.log('1️⃣ Testando autenticação básica...');
    try {
      const response = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
      console.log('   ✅ Token válido! Configurações obtidas.');
      console.log('   📋 Settings:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ❌ Token inválido ou expirado (401 Unauthorized)');
        console.log('   🔧 Resposta:', error.response?.data);
        return false;
      } else {
        console.log('   ❌ Erro na API:', error.message);
        return false;
      }
    }

    // 2. Testar status da instância
    console.log('\n2️⃣ Testando status da instância...');
    try {
      const response = await axios.get(`${WHAPI_API_URL}/status`, { headers });
      console.log('   ✅ Status obtido:', response.data);
    } catch (error) {
      console.log('   ⚠️ Erro ao obter status:', error.response?.data || error.message);
    }

    // 3. Testar endpoint /me
    console.log('\n3️⃣ Testando endpoint /me...');
    try {
      const response = await axios.get(`${WHAPI_API_URL}/me`, { headers });
      console.log('   ✅ Informações da conta:', response.data);
    } catch (error) {
      console.log('   ⚠️ Endpoint /me não disponível (normal no Whapi)');
    }

    // 4. Verificar webhooks configurados
    console.log('\n4️⃣ Verificando webhooks...');
    try {
      const response = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
      if (response.data.webhooks) {
        console.log('   ✅ Webhooks configurados:', response.data.webhooks);
      } else {
        console.log('   ⚠️ Nenhum webhook configurado');
      }
    } catch (error) {
      console.log('   ❌ Erro ao verificar webhooks:', error.message);
    }

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('   O token está válido e funcionando.');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    return false;
  }
}

if (require.main === module) {
  testWhapiToken().then(success => {
    if (!success) {
      console.log('\n🔧 AÇÕES NECESSÁRIAS:');
      console.log('   1. Verificar se o token está correto no .env');
      console.log('   2. Renovar o token no painel do Whapi.cloud');
      console.log('   3. Atualizar a variável WHAPI_TOKEN');
    }
    process.exit(success ? 0 : 1);
  });
}

module.exports = testWhapiToken;

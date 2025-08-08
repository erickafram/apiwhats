#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

const WHAPI_TOKEN = process.env.WHAPI_TOKEN || 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${WHAPI_TOKEN}`
};

async function generateQRCode() {
  console.log('📱 GERANDO QR CODE WHAPI');
  console.log('========================');
  console.log('');

  try {
    // 1. Verificar status atual
    console.log('1️⃣ Verificando status atual...');
    const statusResponse = await axios.get(`${WHAPI_API_URL}/status`, { headers });
    console.log('   📊 Status:', statusResponse.data);
    console.log('');

    // 2. Tentar diferentes endpoints para QR
    const qrEndpoints = [
      { path: '/qr', method: 'GET' },
      { path: '/qr', method: 'POST' },
      { path: '/auth/qr', method: 'GET' },
      { path: '/auth/qr', method: 'POST' },
      { path: '/channels/qr', method: 'GET' },
      { path: '/channels/qr', method: 'POST' }
    ];

    console.log('2️⃣ Tentando gerar QR Code...');
    
    for (const endpoint of qrEndpoints) {
      try {
        console.log(`   Testando ${endpoint.method} ${endpoint.path}...`);
        
        let response;
        if (endpoint.method === 'GET') {
          response = await axios.get(`${WHAPI_API_URL}${endpoint.path}`, { headers });
        } else {
          response = await axios.post(`${WHAPI_API_URL}${endpoint.path}`, {}, { headers });
        }
        
        console.log('   ✅ QR Code obtido!');
        console.log('   📱 Dados:', JSON.stringify(response.data, null, 2));
        return response.data;
        
      } catch (error) {
        console.log(`   ❌ ${endpoint.method} ${endpoint.path} falhou: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
      }
    }

    // 3. Se não conseguiu, tentar verificar se já está conectado
    console.log('\n3️⃣ Verificando se já está conectado...');
    try {
      const meResponse = await axios.get(`${WHAPI_API_URL}/me`, { headers });
      console.log('   ✅ WhatsApp já está conectado!');
      console.log('   👤 Info da conta:', meResponse.data);
      return { connected: true, data: meResponse.data };
    } catch (error) {
      console.log('   ⚠️ /me não disponível ou não conectado');
    }

    // 4. Tentar resetar/reativar
    console.log('\n4️⃣ Tentando reativar instância...');
    try {
      const resetResponse = await axios.post(`${WHAPI_API_URL}/reboot`, {}, { headers });
      console.log('   ✅ Instância reiniciada:', resetResponse.data);
      
      // Aguardar um pouco e tentar QR novamente
      console.log('   ⏳ Aguardando 10 segundos...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const qrResponse = await axios.get(`${WHAPI_API_URL}/qr`, { headers });
      console.log('   ✅ QR Code após reinicialização:', qrResponse.data);
      return qrResponse.data;
      
    } catch (error) {
      console.log('   ❌ Erro ao reativar:', error.response?.data || error.message);
    }

    console.log('\n❌ Não foi possível gerar QR Code');
    return null;

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    return null;
  }
}

if (require.main === module) {
  generateQRCode().then(result => {
    if (result) {
      console.log('\n🎉 SUCESSO!');
      if (result.connected) {
        console.log('   WhatsApp já está conectado e funcionando.');
      } else {
        console.log('   QR Code gerado. Escaneie com WhatsApp para conectar.');
      }
    } else {
      console.log('\n💡 DICAS:');
      console.log('   1. Verifique se a instância do Whapi está ativa');
      console.log('   2. Tente acessar o painel web do Whapi.cloud');
      console.log('   3. O WhatsApp pode já estar conectado');
    }
  });
}

module.exports = generateQRCode;

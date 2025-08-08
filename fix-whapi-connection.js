#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

// Configurações do Whapi
const WHAPI_TOKEN = process.env.WHAPI_TOKEN || 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://chatbotwhats.online/api/whapi/webhook';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${WHAPI_TOKEN}`
};

async function fixWhapiConnection() {
  console.log('🔧 CORRIGINDO CONEXÃO WHAPI');
  console.log('============================');
  console.log('');

  try {
    // 1. Testar diferentes endpoints
    console.log('1️⃣ Testando conectividade...');
    
    const endpoints = [
      '/settings',
      '/status', 
      '/health',
      '/'
    ];

    let workingEndpoint = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`   Testando ${endpoint}...`);
        const response = await axios.get(`${WHAPI_API_URL}${endpoint}`, { 
          headers,
          timeout: 10000
        });
        console.log(`   ✅ ${endpoint} funcionando! Status: ${response.status}`);
        workingEndpoint = endpoint;
        break;
      } catch (error) {
        console.log(`   ❌ ${endpoint} falhou: ${error.response?.status || error.message}`);
      }
    }

    if (!workingEndpoint) {
      console.log('\n❌ NENHUM ENDPOINT FUNCIONANDO');
      console.log('   A API do Whapi pode estar fora do ar');
      console.log('   Tentando soluções alternativas...\n');
      
      // 2. Tentar com diferentes URLs
      console.log('2️⃣ Testando URLs alternativas...');
      const alternativeUrls = [
        'https://api.whapi.cloud',
        'https://gate.whapi.cloud',
        'https://whapi.cloud/api'
      ];
      
      for (const url of alternativeUrls) {
        try {
          console.log(`   Testando ${url}...`);
          const response = await axios.get(`${url}/settings`, { 
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${WHAPI_TOKEN}`
            },
            timeout: 10000
          });
          console.log(`   ✅ ${url} funcionando!`);
          console.log(`   📝 Atualize WHAPI_API_URL=${url} no .env`);
          return true;
        } catch (error) {
          console.log(`   ❌ ${url} falhou: ${error.response?.status || error.message}`);
        }
      }
    }

    // 3. Se funcionou, configurar webhook
    if (workingEndpoint) {
      console.log('\n3️⃣ Configurando webhook...');
      try {
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

        const response = await axios.patch(`${WHAPI_API_URL}/settings`, webhookConfig, { 
          headers,
          timeout: 15000
        });
        
        console.log('   ✅ Webhook configurado com sucesso!');
        console.log('   📋 Resposta:', JSON.stringify(response.data, null, 2));
        
      } catch (error) {
        console.log('   ⚠️ Erro ao configurar webhook:', error.response?.data || error.message);
      }
    }

    // 4. Verificar status atual
    console.log('\n4️⃣ Verificando status atual...');
    try {
      const response = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
      console.log('   ✅ Configurações atuais:');
      console.log(JSON.stringify(response.data, null, 2));
      
      return true;
    } catch (error) {
      console.log('   ❌ Erro ao verificar status:', error.message);
      return false;
    }

  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error.message);
    return false;
  }
}

async function generateNewQR() {
  console.log('\n5️⃣ Tentando gerar novo QR Code...');
  try {
    const response = await axios.post(`${WHAPI_API_URL}/screen`, {}, { headers });
    console.log('   ✅ QR Code gerado:', response.data);
  } catch (error) {
    console.log('   ❌ Erro ao gerar QR:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  fixWhapiConnection().then(async (success) => {
    if (success) {
      await generateNewQR();
      console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
      console.log('   Reinicie o servidor: pm2 restart chatbot-whats-api');
    } else {
      console.log('\n❌ CORREÇÃO FALHOU');
      console.log('   Verifique:');
      console.log('   1. Conexão com internet');
      console.log('   2. Token do Whapi válido'); 
      console.log('   3. Status do serviço Whapi.cloud');
    }
  });
}

module.exports = fixWhapiConnection;

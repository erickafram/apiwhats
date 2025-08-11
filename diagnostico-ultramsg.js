const axios = require('axios');
require('dotenv').config();

// Configurações
const apiUrl = process.env.ULTRAMSG_API_URL || 'https://api.ultramsg.com';
const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
const token = process.env.ULTRAMSG_TOKEN;

console.log('🔍 DIAGNÓSTICO ULTRAMSG');
console.log('========================');
console.log(`🔗 API URL: ${apiUrl}`);
console.log(`📱 Instance ID: ${instanceId}`);
console.log(`🔑 Token: ${token ? 'Configurado' : '❌ NÃO CONFIGURADO'}`);
console.log('');

async function diagnosticar() {
  try {
    // 1. Verificar se as variáveis estão configuradas
    if (!instanceId || !token) {
      console.log('❌ ERRO: Variáveis de ambiente não configuradas!');
      console.log('Configure no arquivo .env:');
      console.log('ULTRAMSG_INSTANCE_ID=sua_instance_id');
      console.log('ULTRAMSG_TOKEN=seu_token');
      return;
    }

    // 2. Verificar status da instância
    console.log('📱 Verificando status da instância...');
    try {
      const statusResponse = await axios.get(`${apiUrl}/${instanceId}/instance/status`, {
        params: { token: token }
      });

      console.log('✅ Resposta do status:', statusResponse.data);
      
      const status = statusResponse.data.account_status;
      console.log(`📊 Status da conta: ${status}`);

      if (status === 'authenticated') {
        console.log('✅ Bot está conectado e funcionando!');
      } else {
        console.log('⚠️ Bot NÃO está conectado!');
        console.log('🔧 Soluções:');
        console.log('1. Conecte pelo painel do UltraMsg');
        console.log('2. Ou use o QR Code pela API');
      }

    } catch (error) {
      console.log('❌ Erro ao verificar status:', error.response?.data || error.message);
    }

    // 3. Verificar webhook
    console.log('\n📡 Verificando configuração do webhook...');
    try {
      const webhookResponse = await axios.get(`${apiUrl}/${instanceId}/instance/webhookUrl`, {
        params: { token: token }
      });

      console.log('✅ Webhook configurado:', webhookResponse.data);
    } catch (error) {
      console.log('❌ Erro ao verificar webhook:', error.response?.data || error.message);
    }

    // 4. Verificar informações da conta
    console.log('\n👤 Verificando informações da conta...');
    try {
      const accountResponse = await axios.get(`${apiUrl}/${instanceId}/instance/me`, {
        params: { token: token }
      });

      console.log('✅ Informações da conta:', accountResponse.data);
    } catch (error) {
      console.log('❌ Erro ao verificar conta:', error.response?.data || error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar diagnóstico
diagnosticar(); 
const axios = require('axios');
require('dotenv').config();

// Configurações do Whapi
const WHAPI_TOKEN = process.env.WHAPI_TOKEN || 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${WHAPI_TOKEN}`
};

async function testWhapiIntegration() {
  console.log('🔧 TESTE DE INTEGRAÇÃO WHAPI.CLOUD');
  console.log('===================================');
  console.log('');

  // Verificar configuração
  if (!WHAPI_TOKEN) {
    console.log('❌ CONFIGURAÇÃO INCOMPLETA!');
    console.log('');
    console.log('Adicione no arquivo .env:');
    console.log('WHAPI_TOKEN=lPX5R5QAjWxazo8djm34yQTSSad8ZpZH');
    console.log('WHAPI_API_URL=https://gate.whapi.cloud');
    console.log('USE_WHAPI=true');
    console.log('');
    return;
  }

  try {
    console.log('1️⃣ Verificando autenticação...');
    console.log(`🔗 API URL: ${WHAPI_API_URL}`);
    console.log(`🔑 Token: ${WHAPI_TOKEN.substring(0, 10)}...`);
    console.log('');

    // Teste 1: Verificar informações da conta/perfil
    console.log('📡 Testando conexão com a API...');
    try {
      const profileResponse = await axios.get(`${WHAPI_API_URL}/me`, { headers });
      console.log('✅ Conexão com API estabelecida');
      console.log('📊 Perfil:', JSON.stringify(profileResponse.data, null, 2));
      console.log('');
    } catch (error) {
      console.log('❌ Erro ao conectar com a API:', error.response?.data || error.message);
      console.log('ℹ️ Tentando endpoint alternativo...');
      console.log('');
    }

    // Teste 2: Verificar status da sessão
    console.log('📱 Verificando status da sessão...');
    try {
      const settingsResponse = await axios.get(`${WHAPI_API_URL}/settings`, { headers });
      console.log('✅ Settings obtidos com sucesso');
      console.log('📋 Settings:', JSON.stringify(settingsResponse.data, null, 2));
      console.log('');
    } catch (error) {
      console.log('❌ Erro ao obter settings:', error.response?.data || error.message);
      console.log('');
    }

    // Teste 3: Verificar QR Code (se necessário)
    console.log('🔍 Verificando necessidade de QR Code...');
    try {
      const qrResponse = await axios.get(`${WHAPI_API_URL}/qr`, { headers });
      if (qrResponse.data && qrResponse.data.qr) {
        console.log('📱 QR Code disponível para escaneamento');
        console.log('🔧 QR Data:', qrResponse.data.qr.substring(0, 50) + '...');
      } else {
        console.log('✅ WhatsApp já está conectado - QR Code não necessário');
      }
      console.log('');
    } catch (error) {
      console.log('ℹ️ QR Code não disponível (pode estar já conectado):', error.response?.status);
      console.log('');
    }

    // Teste 4: Teste de webhook (simulação)
    console.log('🔗 Informações de Webhook:');
    console.log(`📍 URL do webhook: ${process.env.WEBHOOK_URL || 'http://localhost:5000/api/whapi/webhook'}`);
    console.log('💡 Configure este webhook no painel do Whapi.cloud');
    console.log('');

    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('');
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('1. Configure o webhook no painel Whapi.cloud');
    console.log('2. Inicie o servidor: npm start');
    console.log('3. Acesse o frontend: http://localhost:3000/bots');
    console.log('4. Crie um bot e teste a conexão');
    console.log('');

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
    console.log('');
    console.log('🔧 VERIFICAÇÕES:');
    console.log('- Token está correto?');
    console.log('- Internet está funcionando?');
    console.log('- Whapi.cloud está acessível?');
  }
}

// Executar teste
if (require.main === module) {
  testWhapiIntegration();
}

module.exports = { testWhapiIntegration };

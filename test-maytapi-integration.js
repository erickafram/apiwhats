const axios = require('axios');
require('dotenv').config();

// Configurações da Maytapi
const PRODUCT_ID = process.env.MAYTAPI_PRODUCT_ID;
const TOKEN = process.env.MAYTAPI_TOKEN;
const API_URL = process.env.MAYTAPI_API_URL || 'https://api.maytapi.com/api';

const headers = {
  'Content-Type': 'application/json',
  'x-maytapi-key': TOKEN
};

async function testMaytapiConnection() {
  console.log('🧪 Testando conexão com Maytapi...');
  console.log(`📱 Product ID: ${PRODUCT_ID}`);
  console.log(`🔗 API URL: ${API_URL}`);
  console.log('');

  try {
    // 1. Testar autenticação listando telefones
    console.log('1️⃣ Testando autenticação...');
    const phonesResponse = await axios.get(
      `${API_URL}/${PRODUCT_ID}/listPhones`,
      { headers }
    );

    console.log('✅ Autenticação bem-sucedida!');
    console.log('📱 Telefones existentes:', phonesResponse.data.data?.length || 0);
    
    if (phonesResponse.data.data && phonesResponse.data.data.length > 0) {
      console.log('📋 Lista de telefones:');
      phonesResponse.data.data.forEach((phone, index) => {
        console.log(`   ${index + 1}. ID: ${phone.id}, Status: ${phone.status}, Número: ${phone.number || 'N/A'}`);
      });
    }
    console.log('');

    // 2. Verificar instâncias existentes
    console.log('2️⃣ Verificando instâncias existentes...');
    if (phonesResponse.data.data && phonesResponse.data.data.length > 0) {
      const phoneId = phonesResponse.data.data[0].id;
      console.log(`✅ Usando instância existente: ${phoneId}`);
      console.log('');

      // 3. Verificar status da instância
      console.log('3️⃣ Verificando status da instância...');
      const statusResponse = await axios.get(
        `${API_URL}/${PRODUCT_ID}/${phoneId}/status`,
        { headers }
      );

      console.log('📊 Status da instância:', statusResponse.data.data);
      console.log('');

      // 4. Tentar obter QR Code (se disponível)
      console.log('4️⃣ Tentando obter QR Code...');
      try {
        const qrResponse = await axios.get(
          `${API_URL}/${PRODUCT_ID}/${phoneId}/screen`,
          { headers }
        );

        if (qrResponse.data.success && qrResponse.data.data.screen) {
          console.log('✅ QR Code obtido com sucesso!');
          console.log('📱 Para conectar, escaneie o QR Code que será exibido no frontend');
          console.log('🔗 QR Data length:', qrResponse.data.data.screen.length);
        } else {
          console.log('⚠️ QR Code não disponível no momento');
        }
      } catch (qrError) {
        console.log('⚠️ QR Code não disponível:', qrError.response?.data?.message || qrError.message);
      }
      console.log('');

      // 5. Testar configuração de webhook
      console.log('5️⃣ Informações sobre webhook...');
      console.log('📡 Para receber mensagens, configure o webhook na Maytapi:');
      console.log(`   URL: http://seu-dominio.com/api/maytapi/webhook`);
      console.log(`   Método: POST`);
      console.log(`   Eventos: message, status`);
      console.log('');

    } else {
      console.log('⚠️ Nenhuma instância encontrada!');
      console.log('💡 Crie uma instância na dashboard da Maytapi:');
      console.log('   1. Acesse: https://console.maytapi.com/');
      console.log('   2. Vá em "Phones" > "Add Phone"');
      console.log('   3. Crie uma nova instância');
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('');
      console.log('🔑 Erro de autenticação. Verifique:');
      console.log('   - MAYTAPI_PRODUCT_ID está correto');
      console.log('   - MAYTAPI_TOKEN está correto');
      console.log('   - As credenciais estão ativas na Maytapi');
    }
  }
}

async function testLocalServer() {
  console.log('🧪 Testando servidor local...');
  
  try {
    // Testar se o servidor está rodando
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Servidor local está rodando');
    
    // Testar endpoint de conexões Maytapi
    try {
      const connectionsResponse = await axios.get('http://localhost:5000/api/maytapi/connections');
      console.log('✅ Endpoint Maytapi está funcionando');
      console.log('📱 Conexões ativas:', Object.keys(connectionsResponse.data.connections).length);
    } catch (maytapiError) {
      console.log('⚠️ Endpoint Maytapi não está disponível:', maytapiError.message);
    }
    
  } catch (error) {
    console.log('❌ Servidor local não está rodando');
    console.log('💡 Execute: npm start');
  }
  
  console.log('');
}

async function main() {
  console.log('🚀 TESTE DE INTEGRAÇÃO MAYTAPI');
  console.log('================================');
  console.log('');

  // Verificar variáveis de ambiente
  if (!PRODUCT_ID || !TOKEN) {
    console.log('❌ Configuração incompleta!');
    console.log('');
    console.log('Verifique se as seguintes variáveis estão definidas no .env:');
    console.log('- MAYTAPI_PRODUCT_ID');
    console.log('- MAYTAPI_TOKEN');
    console.log('');
    return;
  }

  await testMaytapiConnection();
  await testLocalServer();

  console.log('🎉 TESTE CONCLUÍDO!');
  console.log('');
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Inicie o servidor: npm start');
  console.log('2. Acesse: http://localhost:3000/bots');
  console.log('3. Crie um bot e conecte via Maytapi');
  console.log('4. Configure o webhook na dashboard da Maytapi');
  console.log('5. Teste enviando mensagens!');
}

main().catch(console.error);

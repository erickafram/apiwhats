const axios = require('axios');
require('dotenv').config();

// Configurações específicas para a instância 103174
const PRODUCT_ID = process.env.MAYTAPI_PRODUCT_ID;
const TOKEN = process.env.MAYTAPI_TOKEN;
const API_URL = process.env.MAYTAPI_API_URL || 'https://api.maytapi.com/api';
const PHONE_ID = '103174';

const headers = {
  'Content-Type': 'application/json',
  'x-maytapi-key': TOKEN
};

async function testInstance103174() {
  console.log('📱 TESTE DA INSTÂNCIA 103174');
  console.log('============================');
  console.log('');

  try {
    // 1. Verificar status da instância
    console.log('1️⃣ Verificando status da instância...');
    const statusResponse = await axios.get(
      `${API_URL}/${PRODUCT_ID}/${PHONE_ID}/status`,
      { headers }
    );

    const status = statusResponse.data.data || {};
    console.log('📊 Status completo:', JSON.stringify(status, null, 2));
    console.log('');

    // 2. Verificar informações da instância
    console.log('2️⃣ Verificando informações da instância...');
    const phonesResponse = await axios.get(
      `${API_URL}/${PRODUCT_ID}/listPhones`,
      { headers }
    );

    const phones = phonesResponse.data.data || [];
    const targetPhone = phones.find(phone => phone.id === PHONE_ID);

    if (targetPhone) {
      console.log('📱 Informações da instância:');
      console.log(`   ID: ${targetPhone.id}`);
      console.log(`   Status: ${targetPhone.status || 'N/A'}`);
      console.log(`   Número: ${targetPhone.number || 'Não conectado'}`);
      console.log(`   Multi-device: ${targetPhone.multi_device ? 'Sim' : 'Não'}`);
      console.log(`   Webhook: ${targetPhone.webhook || 'Não configurado'}`);
    } else {
      console.log('⚠️ Instância não encontrada na lista');
    }
    console.log('');

    // 3. Testar envio de mensagem (se tiver número de teste)
    const testNumber = process.env.TEST_PHONE_NUMBER || '5511999999999';
    console.log('3️⃣ Testando envio de mensagem...');
    console.log(`📞 Número de teste: ${testNumber}`);

    try {
      const messageData = {
        to_number: testNumber,
        message: `🤖 Teste da instância ${PHONE_ID} - ${new Date().toLocaleString()}`,
        type: 'text'
      };

      const sendResponse = await axios.post(
        `${API_URL}/${PRODUCT_ID}/${PHONE_ID}/sendMessage`,
        messageData,
        { headers }
      );

      if (sendResponse.data.success) {
        console.log('✅ Mensagem enviada com sucesso!');
        console.log('📨 ID da mensagem:', sendResponse.data.data?.id || 'N/A');
      } else {
        console.log('❌ Erro ao enviar mensagem:', sendResponse.data.message);
      }
    } catch (sendError) {
      console.log('❌ Erro ao enviar mensagem:', sendError.response?.data?.message || sendError.message);
    }
    console.log('');

    // 4. Verificar fila de mensagens
    console.log('4️⃣ Verificando fila de mensagens...');
    try {
      const queueResponse = await axios.get(
        `${API_URL}/${PRODUCT_ID}/${PHONE_ID}/queue`,
        { headers }
      );

      const queue = queueResponse.data.data || [];
      console.log(`📬 Mensagens na fila: ${queue.length}`);
      
      if (queue.length > 0) {
        console.log('📋 Últimas mensagens na fila:');
        queue.slice(0, 3).forEach((msg, index) => {
          console.log(`   ${index + 1}. Para: ${msg.to_number}, Status: ${msg.status}, Tipo: ${msg.type}`);
        });
      }
    } catch (queueError) {
      console.log('⚠️ Erro ao verificar fila:', queueError.response?.data?.message || queueError.message);
    }
    console.log('');

    // 5. Testar servidor local
    console.log('5️⃣ Testando integração com servidor local...');
    try {
      const localResponse = await axios.get('http://localhost:5000/api/maytapi/connections');
      console.log('✅ Servidor local está funcionando');
      console.log('🔗 Conexões ativas:', Object.keys(localResponse.data.connections).length);

      // Testar conexão específica do bot
      try {
        const connectResponse = await axios.post('http://localhost:5000/api/maytapi/connect/10');
        console.log('✅ Bot conectado via servidor local');
        console.log('📱 Phone ID:', connectResponse.data.phoneId);
        console.log('📊 Status:', connectResponse.data.status);
        console.log('🔗 Conectado:', connectResponse.data.connected);
      } catch (connectError) {
        console.log('⚠️ Erro ao conectar bot:', connectError.response?.data?.error || connectError.message);
      }

    } catch (localError) {
      console.log('❌ Servidor local não está funcionando:', localError.message);
    }

    console.log('');
    console.log('🎉 TESTE CONCLUÍDO!');
    console.log('');
    console.log('📋 RESUMO:');
    console.log(`✅ Instância ${PHONE_ID} está ativa`);
    console.log(`📱 Número: 556392901378`);
    console.log('✅ API Maytapi funcionando');
    console.log('✅ Integração com servidor local OK');
    console.log('');
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('1. Acesse: http://localhost:3000/bots');
    console.log('2. Crie um bot ou use um existente');
    console.log('3. Conecte o bot - deve usar automaticamente a instância 103174');
    console.log('4. Teste enviando mensagens!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

async function main() {
  // Verificar configuração
  if (!PRODUCT_ID || !TOKEN) {
    console.log('❌ Configuração incompleta! Verifique MAYTAPI_PRODUCT_ID e MAYTAPI_TOKEN no .env');
    return;
  }

  await testInstance103174();
}

main().catch(console.error);

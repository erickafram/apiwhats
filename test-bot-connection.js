#!/usr/bin/env node

const axios = require('axios');

async function testBotConnection() {
  console.log('🤖 TESTE DE CONEXÃO DO BOT');
  console.log('=========================');
  console.log('');

  try {
    // 1. Testar conexão do bot
    console.log('1️⃣ Tentando conectar bot 1...');
    const connectResponse = await axios.post('http://localhost:5000/api/whapi/connect/1');
    
    console.log('✅ Resposta da conexão:');
    console.log(JSON.stringify(connectResponse.data, null, 2));
    console.log('');

    // 2. Verificar status
    console.log('2️⃣ Verificando status do bot...');
    const statusResponse = await axios.get('http://localhost:5000/api/whapi/status/1');
    
    console.log('📊 Status do bot:');
    console.log(JSON.stringify(statusResponse.data, null, 2));
    console.log('');

    // 3. Listar conexões
    console.log('3️⃣ Listando todas as conexões...');
    const connectionsResponse = await axios.get('http://localhost:5000/api/whapi/connections');
    
    console.log('🔗 Conexões ativas:');
    console.log(JSON.stringify(connectionsResponse.data, null, 2));
    console.log('');

    console.log('🎯 TESTE CONCLUÍDO!');
    console.log('');
    console.log('📱 PRÓXIMO PASSO:');
    console.log('Envie uma mensagem para o WhatsApp e verifique se o bot responde.');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar
testBotConnection();
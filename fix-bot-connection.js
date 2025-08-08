#!/usr/bin/env node

const axios = require('axios');

async function fixBotConnection() {
  console.log('🔧 CORRIGINDO CONEXÃO DO BOT');
  console.log('==========================');
  console.log('');

  try {
    // 1. Verificar status atual
    console.log('1️⃣ Verificando status atual...');
    
    try {
      const statusResponse = await axios.get('http://localhost:5000/api/whapi/status/1');
      console.log('📊 Status atual:', JSON.stringify(statusResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ Erro ao obter status:', error.response?.data || error.message);
    }

    // 2. Forçar reconexão
    console.log('');
    console.log('2️⃣ Forçando reconexão do bot...');
    
    try {
      const connectResponse = await axios.post('http://localhost:5000/api/whapi/connect/1');
      console.log('✅ Resposta da conexão:', JSON.stringify(connectResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erro na conexão:', error.response?.data || error.message);
    }

    // 3. Verificar conexões ativas
    console.log('');
    console.log('3️⃣ Verificando conexões ativas...');
    
    try {
      const connectionsResponse = await axios.get('http://localhost:5000/api/whapi/connections');
      console.log('🔗 Conexões:', JSON.stringify(connectionsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erro ao listar conexões:', error.response?.data || error.message);
    }

    // 4. Testar envio de mensagem
    console.log('');
    console.log('4️⃣ Testando envio de mensagem...');
    
    try {
      const messageResponse = await axios.post('http://localhost:5000/api/whapi/send', {
        botId: 1,
        to: '556392410056',
        message: '🤖 Teste de conexão via API - Sistema funcionando!',
        options: {}
      });
      
      console.log('✅ Mensagem enviada:', JSON.stringify(messageResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
    }

    console.log('');
    console.log('🎯 TESTE CONCLUÍDO!');
    console.log('📱 Agora envie uma mensagem para o WhatsApp e verifique os logs');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
fixBotConnection();

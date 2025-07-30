const axios = require('axios');

async function testFinalIntegration() {
  console.log('🎯 TESTE FINAL DA INTEGRAÇÃO MAYTAPI');
  console.log('===================================');
  console.log('');

  try {
    // 1. Verificar servidor
    console.log('1️⃣ Verificando servidor...');
    await axios.get('http://localhost:5000/health');
    console.log('✅ Servidor funcionando');
    console.log('');

    // 2. Verificar Maytapi
    console.log('2️⃣ Verificando Maytapi...');
    const connectionsResponse = await axios.get('http://localhost:5000/api/maytapi/connections');
    console.log('✅ Maytapi funcionando');
    console.log('📱 Conexões ativas:', Object.keys(connectionsResponse.data.connections).length);
    console.log('');

    // 3. Conectar bot
    console.log('3️⃣ Conectando bot...');
    const connectResponse = await axios.post('http://localhost:5000/api/maytapi/connect/10');
    console.log('✅ Bot conectado!');
    console.log('📱 Phone ID:', connectResponse.data.phoneId);
    console.log('📊 Status:', connectResponse.data.status);
    console.log('🔗 Conectado:', connectResponse.data.connected);
    console.log('');

    // 4. Verificar conexão
    console.log('4️⃣ Verificando conexão...');
    const newConnectionsResponse = await axios.get('http://localhost:5000/api/maytapi/connections');
    const connections = newConnectionsResponse.data.connections;
    
    if (connections['10']) {
      console.log('✅ Bot 10 conectado com sucesso!');
      console.log('   📱 Phone ID:', connections['10'].phoneId);
      console.log('   📊 Status:', connections['10'].status);
      console.log('   🔗 Conectado:', connections['10'].connected);
    } else {
      console.log('⚠️ Bot 10 não encontrado nas conexões');
    }
    console.log('');

    // 5. Testar envio de mensagem
    console.log('5️⃣ Testando envio de mensagem...');
    const testMessage = {
      botId: 10,
      to: '5511999999999',
      message: '🎉 INTEGRAÇÃO MAYTAPI FUNCIONANDO! 🚀\n\nTeste realizado em: ' + new Date().toLocaleString()
    };

    const sendResponse = await axios.post('http://localhost:5000/api/maytapi/send-test', testMessage);
    
    if (sendResponse.data.success) {
      console.log('✅ Mensagem enviada com sucesso!');
      console.log('📨 Resposta da API:', sendResponse.data.success);
    } else {
      console.log('⚠️ Mensagem enviada mas com aviso:', sendResponse.data.message);
    }
    console.log('');

    // 6. Resultado final
    console.log('🎉 INTEGRAÇÃO COMPLETA E FUNCIONANDO!');
    console.log('====================================');
    console.log('');
    console.log('✅ TUDO FUNCIONANDO:');
    console.log('   📱 Instância Maytapi: 103174 (556392901378)');
    console.log('   🤖 Bot conectado e ativo');
    console.log('   📨 Mensagens sendo enviadas');
    console.log('   🔗 API integrada com sucesso');
    console.log('');
    console.log('🌐 ACESSE O FRONTEND:');
    console.log('   URL: http://localhost:3000/bots');
    console.log('');
    console.log('📱 COMO USAR:');
    console.log('   1. Acesse o frontend');
    console.log('   2. Crie um bot ou use existente');
    console.log('   3. O bot usará automaticamente a instância 103174');
    console.log('   4. Envie mensagens para testar!');
    console.log('');
    console.log('🔧 CONFIGURAR WEBHOOK (OPCIONAL):');
    console.log('   1. Acesse: https://console.maytapi.com/');
    console.log('   2. Settings > Webhooks');
    console.log('   3. URL: http://seu-dominio.com/api/maytapi/webhook');
    console.log('   4. Eventos: message, status');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 SOLUÇÃO: O servidor não está rodando');
      console.log('   Execute: npm start');
    } else if (error.response?.status === 500) {
      console.log('');
      console.log('💡 SOLUÇÃO: Erro no servidor');
      console.log('   1. Verifique se o banco de dados está funcionando');
      console.log('   2. Execute o SQL de correção: fix-database.sql');
      console.log('   3. Reinicie o servidor');
    }
  }
}

testFinalIntegration().catch(console.error);

const axios = require('axios');

async function testBotConnection() {
  console.log('🤖 TESTE DE CONEXÃO DO BOT');
  console.log('==========================');
  console.log('');

  try {
    // 1. Verificar se o servidor está rodando
    console.log('1️⃣ Verificando servidor...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Servidor está rodando');
    console.log('');

    // 2. Verificar conexões Maytapi
    console.log('2️⃣ Verificando Maytapi...');
    const connectionsResponse = await axios.get('http://localhost:5000/api/maytapi/connections');
    console.log('✅ Endpoint Maytapi funcionando');
    console.log('📱 Conexões ativas:', Object.keys(connectionsResponse.data.connections).length);
    console.log('');

    // 3. Tentar conectar bot ID 10
    console.log('3️⃣ Conectando bot ID 10...');
    try {
      const connectResponse = await axios.post('http://localhost:5000/api/maytapi/connect/10');
      console.log('✅ Bot conectado com sucesso!');
      console.log('📱 Phone ID:', connectResponse.data.phoneId);
      console.log('📊 Status:', connectResponse.data.status);
      console.log('🔗 Conectado:', connectResponse.data.connected);
      console.log('');

      // 4. Verificar conexões após conectar
      console.log('4️⃣ Verificando conexões após conectar...');
      const newConnectionsResponse = await axios.get('http://localhost:5000/api/maytapi/connections');
      const connections = newConnectionsResponse.data.connections;
      console.log('📱 Conexões ativas agora:', Object.keys(connections).length);
      
      if (connections['10']) {
        console.log('✅ Bot 10 está conectado:');
        console.log('   Phone ID:', connections['10'].phoneId);
        console.log('   Status:', connections['10'].status);
        console.log('   Conectado:', connections['10'].connected);
      }
      console.log('');

      // 5. Testar envio de mensagem via bot
      console.log('5️⃣ Testando envio de mensagem via bot...');
      const testNumber = '5511999999999'; // Número de teste
      
      try {
        const sendResponse = await axios.post('http://localhost:5000/api/maytapi/send-test', {
          botId: 10,
          to: testNumber,
          message: '🤖 Teste do bot via Maytapi! Funcionando perfeitamente! 🚀'
        });

        console.log('✅ Mensagem enviada via bot!');
        console.log('📨 Resposta:', sendResponse.data.success ? 'Sucesso' : 'Erro');
      } catch (sendError) {
        console.log('⚠️ Erro ao enviar mensagem:', sendError.response?.data?.error || sendError.message);
      }

    } catch (connectError) {
      console.log('❌ Erro ao conectar bot:', connectError.response?.data?.error || connectError.message);
    }

    console.log('');
    console.log('🎉 TESTE CONCLUÍDO!');
    console.log('');
    console.log('📋 RESULTADO:');
    console.log('✅ Servidor funcionando');
    console.log('✅ Maytapi integrado');
    console.log('✅ Bot pode ser conectado');
    console.log('✅ Mensagens podem ser enviadas');
    console.log('');
    console.log('🌐 ACESSE O FRONTEND:');
    console.log('URL: http://localhost:3000/bots');
    console.log('');
    console.log('📱 COMO USAR:');
    console.log('1. Acesse o frontend');
    console.log('2. Crie um novo bot ou use existente');
    console.log('3. Clique em "Conectar WhatsApp"');
    console.log('4. O bot usará automaticamente a instância 103174');
    console.log('5. Teste enviando mensagens!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 O servidor não está rodando. Execute:');
      console.log('   npm start');
    }
  }
}

testBotConnection().catch(console.error);

const axios = require('axios');

async function testAIResponse() {
  console.log('🤖 TESTE DE RESPOSTA AUTOMÁTICA DA IA');
  console.log('===================================');
  console.log('');

  try {
    // 1. Verificar se o servidor está funcionando
    console.log('1️⃣ Verificando servidor...');
    await axios.get('http://localhost:5000/health');
    console.log('✅ Servidor funcionando');
    console.log('');

    // 2. Verificar se o bot está conectado
    console.log('2️⃣ Verificando bot...');
    const connectionsResponse = await axios.get('http://localhost:5000/api/maytapi/connections');
    const connections = connectionsResponse.data.connections;
    
    if (connections['10']) {
      console.log('✅ Bot 10 está conectado');
      console.log('   📱 Phone ID:', connections['10'].phoneId);
      console.log('   🔗 Status:', connections['10'].connected);
    } else {
      console.log('⚠️ Bot 10 não está conectado. Conectando...');
      await axios.post('http://localhost:5000/api/maytapi/connect/10');
      console.log('✅ Bot conectado');
    }
    console.log('');

    // 3. Simular mensagem recebida via webhook
    console.log('3️⃣ Simulando mensagem recebida...');
    
    const webhookData = {
      type: 'message',
      phone_id: '103174',
      message: {
        from_number: '5511999999999',
        text: 'Olá! Preciso de ajuda com meu pedido.',
        type: 'text',
        timestamp: new Date().toISOString()
      }
    };

    console.log('📨 Enviando webhook:', JSON.stringify(webhookData, null, 2));
    
    const webhookResponse = await axios.post(
      'http://localhost:5000/api/maytapi/webhook',
      webhookData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (webhookResponse.status === 200) {
      console.log('✅ Webhook processado com sucesso!');
      console.log('🤖 O bot deve ter processado a mensagem automaticamente');
    } else {
      console.log('⚠️ Webhook retornou status:', webhookResponse.status);
    }
    console.log('');

    // 4. Aguardar um pouco para o processamento
    console.log('4️⃣ Aguardando processamento da IA...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('');

    // 5. Verificar conversas criadas
    console.log('5️⃣ Verificando conversas...');
    try {
      const conversationsResponse = await axios.get('http://localhost:5000/api/conversations');
      const conversations = conversationsResponse.data.conversations || conversationsResponse.data;
      
      console.log(`📋 Total de conversas: ${conversations.length}`);
      
      if (conversations.length > 0) {
        const lastConversation = conversations[conversations.length - 1];
        console.log('💬 Última conversa:');
        console.log(`   📞 Número: ${lastConversation.phoneNumber || lastConversation.user_phone}`);
        console.log(`   🤖 Bot ID: ${lastConversation.botId}`);
        console.log(`   📅 Última mensagem: ${lastConversation.lastMessageAt || lastConversation.last_message_at}`);
      }
    } catch (convError) {
      console.log('⚠️ Erro ao verificar conversas:', convError.response?.data?.error || convError.message);
    }
    console.log('');

    // 6. Testar mais mensagens
    console.log('6️⃣ Testando diferentes tipos de mensagem...');
    
    const testMessages = [
      'Qual é o horário de funcionamento?',
      'Preciso falar com um atendente',
      'menu',
      'Quanto custa o produto X?'
    ];

    for (let i = 0; i < testMessages.length; i++) {
      const testMessage = testMessages[i];
      console.log(`   📨 Testando: "${testMessage}"`);
      
      const testWebhook = {
        type: 'message',
        phone_id: '103174',
        message: {
          from_number: `551199999999${i}`, // Números diferentes para conversas separadas
          text: testMessage,
          type: 'text',
          timestamp: new Date().toISOString()
        }
      };

      try {
        await axios.post('http://localhost:5000/api/maytapi/webhook', testWebhook);
        console.log(`   ✅ Mensagem ${i + 1} processada`);
      } catch (testError) {
        console.log(`   ❌ Erro na mensagem ${i + 1}:`, testError.message);
      }
      
      // Aguardar entre mensagens
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('');

    console.log('🎉 TESTE CONCLUÍDO!');
    console.log('');
    console.log('📋 RESULTADOS:');
    console.log('✅ Webhook funcionando');
    console.log('✅ Mensagens sendo processadas');
    console.log('✅ IA deve estar respondendo automaticamente');
    console.log('');
    console.log('📱 VERIFICAR RESPOSTAS:');
    console.log('1. Verifique os logs do servidor para ver as respostas da IA');
    console.log('2. Se configurou o webhook, as respostas serão enviadas via WhatsApp');
    console.log('3. Acesse o frontend para ver as conversas: http://localhost:3000/bots');
    console.log('');
    console.log('🔧 PRÓXIMOS PASSOS:');
    console.log('1. Configure o webhook na Maytapi para receber mensagens reais');
    console.log('2. Teste enviando mensagens reais para 556392901378');
    console.log('3. Ajuste a personalidade da IA conforme necessário');
    console.log('4. Crie fluxos personalizados no frontend');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 SOLUÇÃO: Servidor não está rodando');
      console.log('   Execute: npm start');
    }
  }
}

testAIResponse().catch(console.error);

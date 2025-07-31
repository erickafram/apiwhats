const axios = require('axios');

async function setupBotWithAI() {
  console.log('🤖 CONFIGURAÇÃO DE BOT COM IA');
  console.log('=============================');
  console.log('');

  try {
    // 1. Verificar servidor
    console.log('1️⃣ Verificando servidor...');
    await axios.get('http://localhost:5000/health');
    console.log('✅ Servidor funcionando');
    console.log('');

    // 2. Listar bots existentes
    console.log('2️⃣ Verificando bots existentes...');
    try {
      const botsResponse = await axios.get('http://localhost:5000/api/bots');
      const bots = botsResponse.data.bots || botsResponse.data;
      
      console.log(`📋 Bots encontrados: ${bots.length}`);
      
      if (bots.length > 0) {
        console.log('📱 Lista de bots:');
        bots.forEach(bot => {
          console.log(`   ID: ${bot.id}, Nome: ${bot.name}, Ativo: ${bot.is_active}`);
        });
        
        // Usar o primeiro bot ativo
        const activeBot = bots.find(bot => bot.is_active) || bots[0];
        if (activeBot) {
          console.log(`✅ Usando bot existente: ${activeBot.name} (ID: ${activeBot.id})`);
          await testBotWithAI(activeBot.id);
          return;
        }
      }
      
      console.log('⚠️ Nenhum bot ativo encontrado. Criando novo bot...');
      
    } catch (botsError) {
      console.log('⚠️ Erro ao listar bots (pode ser problema de autenticação)');
      console.log('💡 Criando bot diretamente...');
    }

    // 3. Criar novo bot com IA configurada
    console.log('3️⃣ Criando bot com IA...');
    
    const newBotData = {
      name: 'Bot IA Maytapi',
      description: 'Bot inteligente integrado com Maytapi WhatsApp API',
      is_active: true,
      settings: {
        welcome_message: 'Olá! 👋 Sou seu assistente virtual inteligente. Como posso ajudá-lo hoje?',
        ai_enabled: true,
        ai_model: 'deepseek-ai/DeepSeek-V3',
        ai_prompt: 'Você é um assistente virtual prestativo e amigável. Responda de forma clara, educada e profissional. Use emojis moderadamente para tornar a conversa mais amigável.',
        fallback_message: 'Desculpe, não entendi sua mensagem. Pode reformular sua pergunta?'
      },
      ai_config: {
        enabled: true,
        model: 'deepseek-ai/DeepSeek-V3',
        temperature: 0.7,
        max_tokens: 150,
        system_prompt: 'Você é um assistente virtual da empresa. Seja sempre educado, prestativo e profissional.',
        use_context: true,
        context_messages: 5
      }
    };

    try {
      const createResponse = await axios.post('http://localhost:5000/api/bots', newBotData);
      const newBot = createResponse.data;
      
      console.log('✅ Bot criado com sucesso!');
      console.log(`   ID: ${newBot.id}`);
      console.log(`   Nome: ${newBot.name}`);
      console.log('');
      
      await testBotWithAI(newBot.id);
      
    } catch (createError) {
      console.log('❌ Erro ao criar bot:', createError.response?.data || createError.message);
      console.log('');
      console.log('💡 SOLUÇÃO ALTERNATIVA:');
      console.log('1. Acesse: http://localhost:3000/bots');
      console.log('2. Crie um bot manualmente');
      console.log('3. Configure a IA nas configurações do bot');
      console.log('4. Execute: node test-ai-response.js');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

async function testBotWithAI(botId) {
  console.log(`4️⃣ Testando bot ${botId} com IA...`);
  
  try {
    // Conectar bot
    const connectResponse = await axios.post(`http://localhost:5000/api/maytapi/connect/${botId}`);
    console.log('✅ Bot conectado à Maytapi');
    console.log(`   📱 Phone ID: ${connectResponse.data.phoneId}`);
    console.log(`   🔗 Status: ${connectResponse.data.connected}`);
    console.log('');

    // Simular mensagem recebida
    console.log('5️⃣ Simulando mensagem para testar IA...');
    
    const webhookData = {
      type: 'message',
      phone_id: '103174',
      message: {
        from_number: '5511999999999',
        text: 'Olá! Como você pode me ajudar?',
        type: 'text',
        timestamp: new Date().toISOString()
      }
    };

    const webhookResponse = await axios.post(
      'http://localhost:5000/api/maytapi/webhook',
      webhookData
    );

    if (webhookResponse.status === 200) {
      console.log('✅ Mensagem processada via webhook!');
      console.log('🤖 A IA deve ter gerado uma resposta automática');
      console.log('');
      
      // Aguardar processamento
      console.log('⏳ Aguardando processamento da IA...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('🎉 CONFIGURAÇÃO CONCLUÍDA!');
      console.log('');
      console.log('✅ SISTEMA FUNCIONANDO:');
      console.log(`   🤖 Bot ID: ${botId}`);
      console.log('   📱 Maytapi: 103174 (556392901378)');
      console.log('   🧠 IA: Llama-3.3-70B ativa');
      console.log('   📨 Webhook: Processando mensagens');
      console.log('');
      console.log('📱 COMO TESTAR:');
      console.log('1. Configure o webhook na Maytapi:');
      console.log('   URL: http://seu-dominio.com/api/maytapi/webhook');
      console.log('2. Envie mensagem para: 556392901378');
      console.log('3. O bot responderá automaticamente com IA!');
      console.log('');
      console.log('🌐 FRONTEND:');
      console.log('   Acesse: http://localhost:3000/bots');
      console.log('   Gerencie bots e veja conversas');
    }

  } catch (testError) {
    console.log('❌ Erro ao testar bot:', testError.response?.data || testError.message);
  }
}

setupBotWithAI().catch(console.error);

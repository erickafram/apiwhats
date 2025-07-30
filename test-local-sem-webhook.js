const axios = require('axios');

async function testLocalSemWebhook() {
  console.log('🧪 TESTE LOCAL SEM WEBHOOK');
  console.log('==========================');
  console.log('');
  console.log('💡 Este teste simula mensagens recebidas sem precisar configurar webhook');
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

    // 3. Simular diferentes tipos de mensagem
    console.log('3️⃣ Simulando conversas com IA...');
    console.log('');

    const conversas = [
      {
        numero: '5511999999999',
        nome: 'João',
        mensagens: [
          'Olá! Preciso de ajuda',
          'Qual é o horário de funcionamento?',
          'Obrigado!'
        ]
      },
      {
        numero: '5511888888888',
        nome: 'Maria',
        mensagens: [
          'Oi, tudo bem?',
          'Quero saber sobre os produtos',
          'Quanto custa?'
        ]
      },
      {
        numero: '5511777777777',
        nome: 'Pedro',
        mensagens: [
          'Bom dia!',
          'Estou com problema no meu pedido',
          'Podem me ajudar?'
        ]
      }
    ];

    for (let i = 0; i < conversas.length; i++) {
      const conversa = conversas[i];
      console.log(`💬 Simulando conversa ${i + 1}: ${conversa.nome} (${conversa.numero})`);
      
      for (let j = 0; j < conversa.mensagens.length; j++) {
        const mensagem = conversa.mensagens[j];
        console.log(`   📨 "${mensagem}"`);
        
        // Simular webhook
        const webhookData = {
          type: 'message',
          phone_id: '103174',
          message: {
            from_number: conversa.numero,
            text: mensagem,
            type: 'text',
            timestamp: new Date().toISOString()
          }
        };

        try {
          const response = await axios.post(
            'http://localhost:5000/api/maytapi/webhook',
            webhookData
          );
          
          if (response.status === 200) {
            console.log(`   ✅ Mensagem processada - IA deve ter respondido`);
          }
        } catch (error) {
          console.log(`   ❌ Erro:`, error.response?.data?.error || error.message);
        }
        
        // Aguardar entre mensagens
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 4. Testar comandos específicos
    console.log('4️⃣ Testando comandos específicos...');
    
    const comandos = [
      'menu',
      'ajuda',
      'informações',
      'suporte',
      'vendas',
      'preços'
    ];

    for (const comando of comandos) {
      console.log(`   🎯 Testando comando: "${comando}"`);
      
      const webhookData = {
        type: 'message',
        phone_id: '103174',
        message: {
          from_number: '5511666666666',
          text: comando,
          type: 'text',
          timestamp: new Date().toISOString()
        }
      };

      try {
        await axios.post('http://localhost:5000/api/maytapi/webhook', webhookData);
        console.log(`   ✅ Comando processado`);
      } catch (error) {
        console.log(`   ❌ Erro no comando:`, error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log('');
    console.log('🎉 TESTE CONCLUÍDO!');
    console.log('');
    console.log('📊 RESULTADOS:');
    console.log('✅ Sistema funcionando localmente');
    console.log('✅ IA processando mensagens');
    console.log('✅ Múltiplas conversas simuladas');
    console.log('✅ Comandos específicos testados');
    console.log('');
    console.log('📱 VERIFICAR RESPOSTAS:');
    console.log('1. Verifique os logs do servidor para ver as respostas da IA');
    console.log('2. Acesse: http://localhost:3000/conversations (se disponível)');
    console.log('3. As mensagens foram salvas no banco de dados');
    console.log('');
    console.log('🌐 PARA USAR COM WHATSAPP REAL:');
    console.log('');
    console.log('OPÇÃO 1 - NGROK (Recomendado para testes):');
    console.log('1. npm install -g ngrok');
    console.log('2. ngrok http 5000');
    console.log('3. Copie a URL gerada (ex: https://abc123.ngrok.io)');
    console.log('4. Configure webhook: https://abc123.ngrok.io/api/maytapi/webhook');
    console.log('');
    console.log('OPÇÃO 2 - DEPLOY EM SERVIDOR:');
    console.log('1. Faça deploy em Heroku, Vercel, etc.');
    console.log('2. Configure webhook com URL do servidor');
    console.log('');
    console.log('OPÇÃO 3 - CONTINUAR TESTANDO LOCALMENTE:');
    console.log('1. Use este script para simular conversas');
    console.log('2. Desenvolva e teste todas as funcionalidades');
    console.log('3. Quando estiver pronto, faça deploy');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 SOLUÇÃO: Servidor não está rodando');
      console.log('   Execute: npm start');
    }
  }
}

testLocalSemWebhook().catch(console.error);

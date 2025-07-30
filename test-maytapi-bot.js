const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

async function testMaytapiBot() {
  console.log('🤖 TESTE COMPLETO DO BOT COM MAYTAPI');
  console.log('===================================');
  console.log('');

  try {
    // 1. Verificar se o servidor está rodando
    console.log('1️⃣ Verificando servidor...');
    await axios.get('http://localhost:5000/health');
    console.log('✅ Servidor está rodando');
    console.log('');

    // 2. Verificar conexões Maytapi
    console.log('2️⃣ Verificando Maytapi...');
    const connectionsResponse = await axios.get(`${API_BASE}/maytapi/connections`);
    console.log('✅ Maytapi está funcionando');
    console.log('📱 Conexões ativas:', Object.keys(connectionsResponse.data.connections).length);
    console.log('');

    // 3. Listar bots existentes
    console.log('3️⃣ Listando bots...');
    const botsResponse = await axios.get(`${API_BASE}/bots`);
    const bots = botsResponse.data.bots || botsResponse.data;
    
    if (!bots || bots.length === 0) {
      console.log('⚠️ Nenhum bot encontrado. Criando bot de teste...');
      
      // Criar bot de teste
      const newBot = await axios.post(`${API_BASE}/bots`, {
        name: 'Bot Teste Maytapi',
        description: 'Bot para testar integração com Maytapi',
        is_active: true,
        settings: {
          welcome_message: 'Olá! Sou um bot conectado via Maytapi!',
          ai_enabled: true
        }
      });
      
      console.log('✅ Bot criado:', newBot.data.name);
      console.log('🆔 Bot ID:', newBot.data.id);
      
      // Usar o bot recém-criado
      const testBot = newBot.data;
      await testBotConnection(testBot);
      
    } else {
      console.log(`✅ Encontrados ${bots.length} bots`);
      
      // Usar o primeiro bot para teste
      const testBot = bots[0];
      console.log(`🤖 Testando com bot: ${testBot.name} (ID: ${testBot.id})`);
      console.log('');
      
      await testBotConnection(testBot);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 O servidor não está rodando. Execute:');
      console.log('   npm start');
    }
  }
}

async function testBotConnection(bot) {
  try {
    console.log('4️⃣ Conectando bot via Maytapi...');
    
    // Conectar bot
    const connectResponse = await axios.post(`${API_BASE}/maytapi/connect/${bot.id}`);
    console.log('✅ Bot conectado via Maytapi');
    console.log('📱 Phone ID:', connectResponse.data.phoneId);
    console.log('📊 Status:', connectResponse.data.status);
    console.log('');

    if (connectResponse.data.status !== 'authenticated') {
      console.log('5️⃣ Gerando QR Code...');
      
      try {
        const qrResponse = await axios.get(`${API_BASE}/maytapi/qr/${bot.id}`);
        console.log('✅ QR Code gerado!');
        console.log('📱 Escaneie o QR Code no frontend para conectar');
        console.log('🔗 URL: http://localhost:3000/bots');
        console.log('');
      } catch (qrError) {
        console.log('⚠️ QR Code não disponível:', qrError.response?.data?.error || qrError.message);
      }
    }

    // 6. Testar envio de mensagem (se tiver número de teste)
    const testNumber = process.env.TEST_PHONE_NUMBER;
    if (testNumber) {
      console.log('6️⃣ Testando envio de mensagem...');
      
      try {
        const sendResponse = await axios.post(`${API_BASE}/maytapi/send-test`, {
          botId: bot.id,
          to: testNumber,
          message: 'Teste de mensagem via Maytapi! 🚀'
        });
        
        console.log('✅ Mensagem enviada com sucesso!');
        console.log('📱 Para:', testNumber);
      } catch (sendError) {
        console.log('⚠️ Erro ao enviar mensagem:', sendError.response?.data?.error || sendError.message);
        console.log('💡 Certifique-se de que o bot está autenticado');
      }
    } else {
      console.log('6️⃣ Pular teste de envio (TEST_PHONE_NUMBER não definido)');
    }

    console.log('');
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. Acesse: http://localhost:3000/bots');
    console.log('2. Escaneie o QR Code para conectar o WhatsApp');
    console.log('3. Configure o webhook na dashboard da Maytapi:');
    console.log('   URL: http://seu-dominio.com/api/maytapi/webhook');
    console.log('4. Teste enviando mensagens para o bot!');
    console.log('');
    console.log('🔧 CONFIGURAÇÃO DO WEBHOOK:');
    console.log('- Acesse: https://maytapi.com/dashboard');
    console.log('- Vá em Settings > Webhooks');
    console.log('- Adicione a URL do webhook');
    console.log('- Selecione eventos: message, status');

  } catch (error) {
    console.error('❌ Erro ao conectar bot:', error.response?.data || error.message);
  }
}

// Função para mostrar informações de configuração
function showConfiguration() {
  console.log('⚙️ CONFIGURAÇÃO ATUAL:');
  console.log('=====================');
  console.log('');
  console.log('📱 Maytapi:');
  console.log(`   Product ID: ${process.env.MAYTAPI_PRODUCT_ID || 'NÃO DEFINIDO'}`);
  console.log(`   Token: ${process.env.MAYTAPI_TOKEN ? '***' + process.env.MAYTAPI_TOKEN.slice(-4) : 'NÃO DEFINIDO'}`);
  console.log(`   Usar Maytapi: ${process.env.USE_MAYTAPI || 'false'}`);
  console.log('');
  console.log('🌐 Servidor:');
  console.log(`   Porta: ${process.env.PORT || '5000'}`);
  console.log(`   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log('');
  console.log('🧪 Teste:');
  console.log(`   Número de teste: ${process.env.TEST_PHONE_NUMBER || 'NÃO DEFINIDO'}`);
  console.log('');
}

async function main() {
  showConfiguration();
  
  // Verificar configuração mínima
  if (!process.env.MAYTAPI_PRODUCT_ID || !process.env.MAYTAPI_TOKEN) {
    console.log('❌ CONFIGURAÇÃO INCOMPLETA!');
    console.log('');
    console.log('Adicione no arquivo .env:');
    console.log('MAYTAPI_PRODUCT_ID=ebba8265-1e89-4e6a-8255-7eee3e64b7f5');
    console.log('MAYTAPI_TOKEN=af87a53c-3b0f-4188-b5de-2f7ed0acddda');
    console.log('USE_MAYTAPI=true');
    console.log('TEST_PHONE_NUMBER=5511999999999 # Opcional para teste');
    console.log('');
    return;
  }

  await testMaytapiBot();
}

main().catch(console.error);

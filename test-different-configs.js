const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testDifferentConfigs() {
  try {
    console.log('🔧 Testando Diferentes Configurações WhatsApp...\n');

    // Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@whatsapp-bot.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');

    // Buscar bot
    const botsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const bot = botsResponse.data.bots[0];
    console.log(`📋 Bot: ${bot.name} (ID: ${bot.id})`);

    // Limpar sessão
    console.log('\n🧹 Limpando sessão...');
    try {
      await axios.post(`${BASE_URL}/api/bots/${bot.id}/clear-session`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Sessão limpa');
    } catch (error) {
      console.log('⚠️ Erro ao limpar:', error.response?.data?.error);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Tentar conexão
    console.log('\n📱 Tentando conexão com configuração Ubuntu Chrome...');
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/bots/${bot.id}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 65000
      });

      console.log('✅ Resposta recebida!');
      console.log('📋 Status:', connectResponse.data.status);
      
      if (connectResponse.data.qrCode) {
        console.log('🎉 QR CODE GERADO!');
        console.log('📏 Tamanho:', connectResponse.data.qrCode.length, 'caracteres');
        
        console.log('\n📱 TESTE AGORA:');
        console.log('1. 🌐 Acesse: http://localhost:3000/bots');
        console.log('2. 📱 Clique no botão WhatsApp');
        console.log('3. 📷 Escaneie com seu celular');
        console.log('4. ⚠️ Se der erro, vou criar outras configurações');
        
        // Aguardar teste
        console.log('\n⏳ Aguardando 60 segundos para você testar...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
      } else {
        console.log('⚠️ QR Code não gerado');
      }

    } catch (connectError) {
      console.log('❌ Erro:', connectError.response?.data?.error || connectError.message);
    }

    // Verificar resultado
    console.log('\n📊 Verificando resultado...');
    const finalResponse = await axios.get(`${BASE_URL}/api/bots/${bot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const finalBot = finalResponse.data;
    console.log(`🔗 Conectado: ${finalBot.is_connected ? '🟢 SIM!' : '🔴 Não'}`);
    console.log(`📊 Status: ${finalBot.connection_status}`);
    console.log(`📱 Número: ${finalBot.phone_number || 'Não definido'}`);

    if (!finalBot.is_connected) {
      console.log('\n🔧 VAMOS TENTAR OUTRAS CONFIGURAÇÕES:');
      console.log('O problema pode estar na configuração do browser no Baileys.');
      console.log('Vou criar versões alternativas para testar:');
      console.log('1. WhatsApp Web oficial');
      console.log('2. Chrome Windows');
      console.log('3. Firefox');
      console.log('4. Edge');
      console.log('5. Safari');
      
      console.log('\n💡 CONFIGURAÇÕES TESTADAS:');
      console.log('✅ Ubuntu Chrome 20.0.04');
      console.log('❌ Chrome Linux (falhou antes)');
      
      console.log('\n🎯 PRÓXIMA AÇÃO:');
      console.log('Vou modificar o arquivo WhatsAppService.js');
      console.log('para usar configurações mais compatíveis.');
    } else {
      console.log('\n🎉 SUCESSO! Configuração funcionou!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar teste
testDifferentConfigs();

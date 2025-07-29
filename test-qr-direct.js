const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testQRDirect() {
  try {
    console.log('🔍 Testando QR Code diretamente...\n');

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

    // Verificar QR Code atual
    console.log('\n1️⃣ Verificando QR Code atual...');
    const currentResponse = await axios.get(`${BASE_URL}/api/bots/${bot.id}/qr-code`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Status atual:', currentResponse.data.connection_status);
    if (currentResponse.data.qr_code) {
      console.log('✅ QR Code encontrado!');
      console.log('📏 Tamanho:', currentResponse.data.qr_code.length, 'caracteres');
      console.log('🎯 ACESSE: http://localhost:3000/bots');
      console.log('📱 Clique no botão WhatsApp e escaneie!');
    } else {
      console.log('❌ QR Code não encontrado');
      
      // Tentar gerar novo QR Code
      console.log('\n2️⃣ Tentando gerar novo QR Code...');
      try {
        const connectResponse = await axios.post(`${BASE_URL}/api/bots/${bot.id}/connect`, {}, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        });

        console.log('✅ Resposta recebida!');
        console.log('📋 Status:', connectResponse.data.status);
        console.log('💬 Mensagem:', connectResponse.data.message);
        
        if (connectResponse.data.qrCode) {
          console.log('🎉 QR CODE GERADO NA RESPOSTA!');
          console.log('📏 Tamanho:', connectResponse.data.qrCode.length, 'caracteres');
          console.log('\n🎯 AGORA FUNCIONA:');
          console.log('1. 🌐 Acesse: http://localhost:3000/bots');
          console.log('2. 📱 Clique no botão WhatsApp');
          console.log('3. 📷 Escaneie o QR Code');
          console.log('4. ✅ Deve conectar seu número real!');
        } else {
          console.log('⚠️ QR Code não retornado na resposta');
          console.log('🔍 Resposta completa:', JSON.stringify(connectResponse.data, null, 2));
        }

      } catch (connectError) {
        console.log('❌ Erro ao conectar:', connectError.response?.data?.error || connectError.message);
      }
    }

    // Verificar novamente após tentativa
    console.log('\n3️⃣ Verificação final...');
    const finalResponse = await axios.get(`${BASE_URL}/api/bots/${bot.id}/qr-code`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Status final:', finalResponse.data.connection_status);
    if (finalResponse.data.qr_code) {
      console.log('✅ QR Code disponível!');
      console.log('📏 Tamanho:', finalResponse.data.qr_code.length, 'caracteres');
      
      console.log('\n🚀 PRONTO PARA CONECTAR:');
      console.log('🌐 http://localhost:3000/bots');
      console.log('📱 Clique no botão WhatsApp e escaneie!');
      
      console.log('\n💡 DICAS:');
      console.log('• Use WhatsApp atualizado');
      console.log('• WiFi estável');
      console.log('• Escaneie rapidamente');
      console.log('• Se der erro, use WhatsApp Business');
      
    } else {
      console.log('❌ QR Code ainda não disponível');
      console.log('🔧 Possíveis problemas:');
      console.log('• Número bloqueado pelo WhatsApp');
      console.log('• Configuração do browser incompatível');
      console.log('• Sessão corrompida');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar teste
testQRDirect();

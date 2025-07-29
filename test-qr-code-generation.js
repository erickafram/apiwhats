const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testQRCodeGeneration() {
  try {
    console.log('📱 Testando Geração de QR Code...\n');

    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@exemplo.com',
      password: 'senha123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');

    // 2. Listar bots
    console.log('\n2️⃣ Listando bots...');
    const botsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const activeBot = botsResponse.data.bots.find(bot => bot.is_active);
    if (!activeBot) {
      console.log('   ❌ Nenhum bot ativo encontrado');
      return;
    }

    console.log(`   📋 Bot selecionado: ${activeBot.name} (ID: ${activeBot.id})`);

    // 3. Tentar conectar e aguardar QR Code
    console.log('\n3️⃣ Conectando bot e aguardando QR Code...');
    console.log('   ⏳ Isso pode levar até 30 segundos...');
    
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/bots/${activeBot.id}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 35000 // 35 segundos
      });

      console.log('   ✅ Resposta recebida!');
      console.log('   📋 Status:', connectResponse.data.status);
      console.log('   💬 Mensagem:', connectResponse.data.message);
      
      if (connectResponse.data.qr_code) {
        console.log('   🎉 QR CODE GERADO COM SUCESSO!');
        console.log('   📏 Tamanho do QR Code:', connectResponse.data.qr_code.length, 'caracteres');
        console.log('   🔗 Primeiros 50 caracteres:', connectResponse.data.qr_code.substring(0, 50) + '...');
        
        console.log('\n📱 COMO USAR O QR CODE:');
        console.log('   1. Acesse: http://localhost:3000/bots');
        console.log('   2. Clique no botão WhatsApp do seu bot');
        console.log('   3. O QR Code aparecerá no modal');
        console.log('   4. Escaneie com seu WhatsApp');
        
      } else {
        console.log('   ⚠️ QR Code não foi gerado');
        console.log('   💡 Possíveis motivos:');
        console.log('      - Bot já está conectado');
        console.log('      - Timeout na geração');
        console.log('      - Erro no serviço WhatsApp');
      }

      if (connectResponse.data.phone) {
        console.log('   📱 Telefone conectado:', connectResponse.data.phone);
      }

    } catch (connectError) {
      if (connectError.code === 'ECONNABORTED') {
        console.log('   ⏰ Timeout - QR Code pode estar sendo gerado');
        console.log('   💡 Tente acessar a interface web');
      } else {
        console.log('   ❌ Erro na conexão:', connectError.response?.data?.error || connectError.message);
      }
    }

    // 4. Verificar status final
    console.log('\n4️⃣ Verificando status final...');
    const finalBotResponse = await axios.get(`${BASE_URL}/api/bots/${activeBot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const finalBot = finalBotResponse.data;
    console.log('   📊 Status final:');
    console.log(`   🔗 Conectado: ${finalBot.is_connected ? '🟢 Sim' : '🔴 Não'}`);
    console.log(`   📊 Status: ${finalBot.connection_status}`);
    console.log(`   📱 Número: ${finalBot.phone_number || 'Não definido'}`);
    
    if (finalBot.qr_code) {
      console.log('   📱 QR Code salvo no banco: ✅');
    } else {
      console.log('   📱 QR Code no banco: ❌');
    }

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   1. Acesse a interface: http://localhost:3000/bots');
    console.log('   2. Clique no botão WhatsApp do bot');
    console.log('   3. Se o QR Code não aparecer, tente novamente');
    console.log('   4. Verifique os logs do backend para mais detalhes');

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar teste
testQRCodeGeneration();

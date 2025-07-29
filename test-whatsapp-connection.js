const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testWhatsAppConnection() {
  try {
    console.log('📱 Testando Conexão WhatsApp - Passo a Passo...\n');

    // 1. Verificar se o backend está funcionando
    console.log('1️⃣ Verificando backend...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('   ✅ Backend funcionando:', healthResponse.data.status);
    } catch (error) {
      console.log('   ❌ Backend não está rodando!');
      console.log('   💡 Execute: npm run dev');
      return;
    }

    // 2. Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@exemplo.com',
      password: 'senha123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');

    // 3. Listar bots disponíveis
    console.log('\n3️⃣ Listando bots disponíveis...');
    const botsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (botsResponse.data.bots.length === 0) {
      console.log('   ❌ Nenhum bot encontrado!');
      console.log('   💡 Crie um bot primeiro através da interface ou API');
      return;
    }

    // Pegar o primeiro bot ativo
    const activeBot = botsResponse.data.bots.find(bot => bot.is_active);
    if (!activeBot) {
      console.log('   ⚠️ Nenhum bot ativo encontrado!');
      console.log('   💡 Ative um bot primeiro');
      
      // Ativar o primeiro bot
      const firstBot = botsResponse.data.bots[0];
      console.log(`   🔄 Ativando bot: ${firstBot.name}...`);
      
      await axios.put(`${BASE_URL}/api/bots/${firstBot.id}`, {
        is_active: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('   ✅ Bot ativado com sucesso!');
      
      // Usar este bot
      var botToConnect = firstBot;
    } else {
      var botToConnect = activeBot;
    }

    console.log(`   📋 Bot selecionado: ${botToConnect.name} (ID: ${botToConnect.id})`);
    console.log(`   ⚡ Status: ${botToConnect.is_active ? '🟢 Ativo' : '🔴 Inativo'}`);
    console.log(`   🔗 Conectado: ${botToConnect.is_connected ? '🟢 Sim' : '🔴 Não'}`);

    // 4. Tentar conectar ao WhatsApp
    console.log('\n4️⃣ Iniciando conexão com WhatsApp...');
    console.log('   ⏳ Enviando solicitação de conexão...');
    
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/bots/${botToConnect.id}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 segundos de timeout
      });

      console.log('   ✅ Solicitação enviada com sucesso!');
      console.log('   📋 Resposta:', connectResponse.data.message);
      
      if (connectResponse.data.qr_code) {
        console.log('   📱 QR Code gerado!');
        console.log('   🔗 Status:', connectResponse.data.status);
        
        console.log('\n📱 INSTRUÇÕES PARA CONECTAR:');
        console.log('   1. Abra o WhatsApp no seu celular');
        console.log('   2. Vá em Configurações (⚙️)');
        console.log('   3. Toque em "Aparelhos conectados"');
        console.log('   4. Toque em "Conectar um aparelho"');
        console.log('   5. Escaneie o QR Code que aparecerá na interface web');
        console.log('   6. Aguarde a confirmação de conexão');
        
        console.log('\n🌐 ONDE VER O QR CODE:');
        console.log('   • Interface Web: http://localhost:3001/bots');
        console.log('   • Clique no botão WhatsApp (📱) do seu bot');
        console.log('   • O QR Code aparecerá em um modal');
        
      } else {
        console.log('   ⚠️ QR Code não foi gerado');
        console.log('   💡 Isso pode acontecer se o bot já estiver conectado');
      }

    } catch (connectError) {
      console.log('   ❌ Erro na conexão:', connectError.response?.data?.error || connectError.message);
      
      if (connectError.code === 'ECONNREFUSED') {
        console.log('   💡 O serviço WhatsApp pode não estar inicializado');
        console.log('   🔄 Tente reiniciar o backend: npm run dev');
      }
      
      if (connectError.response?.status === 500) {
        console.log('   💡 Erro interno do servidor - verifique os logs');
      }
    }

    // 5. Verificar status após tentativa
    console.log('\n5️⃣ Verificando status após conexão...');
    const updatedBotResponse = await axios.get(`${BASE_URL}/api/bots/${botToConnect.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const updatedBot = updatedBotResponse.data;
    console.log('   📊 Status atualizado:');
    console.log(`   🆔 ID: ${updatedBot.id}`);
    console.log(`   📝 Nome: ${updatedBot.name}`);
    console.log(`   ⚡ Ativo: ${updatedBot.is_active ? '🟢 Sim' : '🔴 Não'}`);
    console.log(`   🔗 Conectado: ${updatedBot.is_connected ? '🟢 Sim' : '🔴 Não'}`);
    console.log(`   📊 Status Conexão: ${updatedBot.connection_status}`);
    console.log(`   📱 Número: ${updatedBot.phone_number || 'Não definido'}`);

    // 6. Próximos passos
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   1. 🌐 Acesse: http://localhost:3001/bots');
    console.log('   2. 📱 Clique no botão WhatsApp do seu bot');
    console.log('   3. 📷 Escaneie o QR Code com seu celular');
    console.log('   4. ✅ Aguarde a confirmação de conexão');
    console.log('   5. 💬 Teste enviando uma mensagem para o bot');

    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   • Se o QR Code não aparecer, recarregue a página');
    console.log('   • Se der erro de conexão, reinicie o backend');
    console.log('   • Se o bot não responder, verifique se está ativo');
    console.log('   • Para logs detalhados, veja o console do backend');

    console.log('\n✨ Teste concluído! Acesse a interface para conectar.');

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Problema de autenticação - verifique as credenciais');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend não está rodando - execute: npm run dev');
    }
  }
}

// Executar o teste
testWhatsAppConnection();

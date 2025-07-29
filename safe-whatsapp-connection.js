const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function safeWhatsAppConnection() {
  try {
    console.log('🛡️ Conexão Segura WhatsApp - Estratégia Anti-Bloqueio...\n');

    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@exemplo.com',
      password: 'senha123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');

    // 2. Listar bots
    console.log('\n2️⃣ Verificando bots...');
    const botsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const activeBot = botsResponse.data.bots.find(bot => bot.is_active);
    if (!activeBot) {
      console.log('   ❌ Nenhum bot ativo encontrado');
      return;
    }

    console.log(`   📋 Bot: ${activeBot.name} (ID: ${activeBot.id})`);
    console.log(`   📊 Status: ${activeBot.connection_status}`);
    console.log(`   🔗 Conectado: ${activeBot.is_connected ? 'Sim' : 'Não'}`);

    // 3. Limpar sessão completamente
    console.log('\n3️⃣ Limpando sessão completamente...');
    try {
      await axios.post(`${BASE_URL}/api/bots/${activeBot.id}/clear-session`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Sessão limpa');
    } catch (error) {
      console.log('   ⚠️ Erro ao limpar:', error.response?.data?.error);
    }

    // 4. Aguardar mais tempo
    console.log('\n4️⃣ Aguardando 10 segundos para estabilizar...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 5. Tentar conexão única
    console.log('\n5️⃣ Tentando conexão única (sem reconexão automática)...');
    console.log('   ⏳ Aguardando QR Code...');
    
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/bots/${activeBot.id}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 45000 // 45 segundos
      });

      console.log('   ✅ Resposta recebida!');
      console.log('   📋 Status:', connectResponse.data.status);
      
      if (connectResponse.data.qr_code) {
        console.log('   🎉 QR CODE GERADO!');
        
        console.log('\n📱 INSTRUÇÕES CRÍTICAS:');
        console.log('   🚨 ATENÇÃO: Você tem APENAS UMA CHANCE!');
        console.log('   1. 🌐 Acesse IMEDIATAMENTE: http://localhost:3000/bots');
        console.log('   2. 📱 Clique no botão WhatsApp');
        console.log('   3. 📷 Escaneie RAPIDAMENTE (30 segundos)');
        console.log('   4. ⚠️ Use um número NUNCA usado com bots');
        console.log('   5. 🔄 Se falhar, aguarde 24h antes de tentar novamente');
        
        console.log('\n💡 DICAS IMPORTANTES:');
        console.log('   • WhatsApp deve estar na versão mais recente');
        console.log('   • Use WiFi estável (não dados móveis)');
        console.log('   • Não feche o navegador durante o processo');
        console.log('   • Se der "não é possível conectar", pare e aguarde 24h');
        
        // Aguardar um tempo para o usuário escanear
        console.log('\n⏳ Aguardando 60 segundos para você escanear...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
      } else {
        console.log('   ⚠️ QR Code não gerado');
      }

    } catch (connectError) {
      console.log('   ❌ Erro na conexão:', connectError.response?.data?.error || connectError.message);
      
      if (connectError.response?.data?.error?.includes('deslogado')) {
        console.log('\n🚨 BLOQUEIO DETECTADO!');
        console.log('   O WhatsApp está rejeitando a conexão.');
        console.log('   Isso pode acontecer por:');
        console.log('   • Muitas tentativas de conexão');
        console.log('   • Número já usado com outros bots');
        console.log('   • Políticas de segurança do WhatsApp');
        console.log('\n💡 SOLUÇÃO:');
        console.log('   1. Aguarde 24-48 horas');
        console.log('   2. Use um número completamente diferente');
        console.log('   3. Certifique-se que nunca foi usado com bots');
      }
    }

    // 6. Verificar resultado final
    console.log('\n6️⃣ Verificando resultado...');
    const finalResponse = await axios.get(`${BASE_URL}/api/bots/${activeBot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const finalBot = finalResponse.data;
    console.log('   📊 Resultado final:');
    console.log(`   🔗 Conectado: ${finalBot.is_connected ? '🟢 SIM!' : '🔴 Não'}`);
    console.log(`   📊 Status: ${finalBot.connection_status}`);
    console.log(`   📱 Número: ${finalBot.phone_number || 'Não definido'}`);

    if (finalBot.is_connected) {
      console.log('\n🎉 SUCESSO! Bot conectado ao WhatsApp!');
      console.log('   ✅ Agora você pode:');
      console.log('   • Enviar mensagem para o número conectado');
      console.log('   • O bot responderá automaticamente');
      console.log('   • Monitorar conversas na interface');
    } else {
      console.log('\n❌ Conexão não estabelecida');
      console.log('   💡 Possíveis motivos:');
      console.log('   • QR Code não foi escaneado a tempo');
      console.log('   • Número já usado com bots');
      console.log('   • WhatsApp rejeitou a conexão');
      console.log('   • Problemas de rede');
      
      console.log('\n🔄 PRÓXIMAS AÇÕES:');
      console.log('   1. Se não escaneou: tente novamente em 1 hora');
      console.log('   2. Se deu erro: aguarde 24h e use número diferente');
      console.log('   3. Se continuar falhando: use WhatsApp Business');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar conexão segura
safeWhatsAppConnection();

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function fixWhatsAppConnection() {
  try {
    console.log('🔧 Corrigindo Problemas de Conexão WhatsApp...\n');

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
    console.log(`   📊 Status atual: ${activeBot.connection_status}`);

    // 3. Limpar sessão antiga
    console.log('\n3️⃣ Limpando sessão antiga...');
    try {
      const clearResponse = await axios.post(`${BASE_URL}/api/bots/${activeBot.id}/clear-session`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Sessão limpa:', clearResponse.data.message);
    } catch (clearError) {
      console.log('   ⚠️ Erro ao limpar sessão:', clearError.response?.data?.error || clearError.message);
    }

    // 4. Aguardar um pouco
    console.log('\n4️⃣ Aguardando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Tentar nova conexão
    console.log('\n5️⃣ Tentando nova conexão...');
    console.log('   ⏳ Aguardando QR Code (até 30 segundos)...');
    
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/bots/${activeBot.id}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 35000
      });

      console.log('   ✅ Resposta recebida!');
      console.log('   📋 Status:', connectResponse.data.status);
      console.log('   💬 Mensagem:', connectResponse.data.message);
      
      if (connectResponse.data.qr_code) {
        console.log('   🎉 NOVO QR CODE GERADO!');
        console.log('   📏 Tamanho:', connectResponse.data.qr_code.length, 'caracteres');
        
        console.log('\n📱 INSTRUÇÕES PARA CONECTAR:');
        console.log('   1. 🌐 Acesse: http://localhost:3000/bots');
        console.log('   2. 📱 Clique no botão WhatsApp do bot');
        console.log('   3. 📷 Escaneie o NOVO QR Code');
        console.log('   4. ⚠️ IMPORTANTE: Use um número que NUNCA foi usado com bots antes');
        console.log('   5. ✅ Aguarde a confirmação');
        
        console.log('\n💡 DICAS PARA SUCESSO:');
        console.log('   • Use um número diferente se já tentou antes');
        console.log('   • Certifique-se que o WhatsApp está atualizado');
        console.log('   • Escaneie rapidamente (QR Code expira)');
        console.log('   • Não use WhatsApp Business se já tentou com normal');
        
      } else {
        console.log('   ⚠️ QR Code não foi gerado');
        console.log('   💡 Tente novamente em alguns minutos');
      }

    } catch (connectError) {
      if (connectError.code === 'ECONNABORTED') {
        console.log('   ⏰ Timeout - mas QR Code pode ter sido gerado');
        console.log('   💡 Verifique a interface web');
      } else {
        console.log('   ❌ Erro na conexão:', connectError.response?.data?.error || connectError.message);
      }
    }

    // 6. Verificar status final
    console.log('\n6️⃣ Verificando status final...');
    const finalBotResponse = await axios.get(`${BASE_URL}/api/bots/${activeBot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const finalBot = finalBotResponse.data;
    console.log('   📊 Status final:');
    console.log(`   🔗 Conectado: ${finalBot.is_connected ? '🟢 Sim' : '🔴 Não'}`);
    console.log(`   📊 Status: ${finalBot.connection_status}`);
    console.log(`   📱 Número: ${finalBot.phone_number || 'Não definido'}`);

    // 7. Dicas adicionais
    console.log('\n🔧 TROUBLESHOOTING AVANÇADO:');
    console.log('   ❌ Se continuar dando erro "não é possível conectar":');
    console.log('      1. Use um número de WhatsApp DIFERENTE');
    console.log('      2. Certifique-se que nunca foi usado com bots');
    console.log('      3. Tente com WhatsApp Business se usou normal');
    console.log('      4. Aguarde 24h se já tentou muitas vezes');
    console.log('      5. Verifique se o WhatsApp está na versão mais recente');
    
    console.log('\n   ✅ Se der certo:');
    console.log('      1. O status mudará para "connected"');
    console.log('      2. Aparecerá o número do telefone');
    console.log('      3. Você pode testar enviando mensagem para o bot');

    console.log('\n🎯 PRÓXIMO PASSO:');
    console.log('   🌐 Acesse: http://localhost:3000/bots');
    console.log('   📱 Clique no botão WhatsApp e escaneie o QR Code');

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar correção
fixWhatsAppConnection();

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testRobustConnection() {
  try {
    console.log('🛡️ Testando Conexão ROBUSTA WhatsApp...\n');

    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@whatsapp-bot.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');

    // 2. Listar bots
    console.log('\n2️⃣ Listando bots...');
    const botsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (botsResponse.data.bots.length === 0) {
      console.log('   ❌ Nenhum bot encontrado');
      return;
    }

    const bot = botsResponse.data.bots[0]; // Pegar o primeiro bot
    console.log(`   📋 Bot selecionado: ${bot.name} (ID: ${bot.id})`);

    // 3. Limpar sessão completamente
    console.log('\n3️⃣ Limpando sessão...');
    try {
      await axios.post(`${BASE_URL}/api/bots/${bot.id}/clear-session`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Sessão limpa');
    } catch (error) {
      console.log('   ⚠️ Erro ao limpar:', error.response?.data?.error);
    }

    // 4. Aguardar estabilização
    console.log('\n4️⃣ Aguardando 5 segundos para estabilizar...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 5. Tentar conexão robusta
    console.log('\n5️⃣ Iniciando conexão ROBUSTA...');
    console.log('   🔄 Nova implementação com Baileys atualizado');
    console.log('   ⏳ Aguardando até 60 segundos...');
    
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/bots/${bot.id}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 65000 // 65 segundos
      });

      console.log('\n   ✅ RESPOSTA RECEBIDA!');
      console.log('   📋 Status:', connectResponse.data.status);
      console.log('   💬 Mensagem:', connectResponse.data.message);
      
      if (connectResponse.data.qrCode) {
        console.log('   🎉 QR CODE GERADO COM SUCESSO!');
        console.log('   📏 Tamanho:', connectResponse.data.qrCode.length, 'caracteres');
        
        console.log('\n📱 INSTRUÇÕES PARA CONECTAR:');
        console.log('   🚨 IMPORTANTE: Esta é uma implementação ROBUSTA!');
        console.log('   1. 🌐 Acesse IMEDIATAMENTE: http://localhost:3000/bots');
        console.log('   2. 📱 Clique no botão WhatsApp do bot');
        console.log('   3. 📷 Escaneie o QR Code rapidamente');
        console.log('   4. ✅ Use seu número principal do WhatsApp');
        console.log('   5. 🔄 Aguarde a confirmação automática');
        
        console.log('\n💡 MELHORIAS IMPLEMENTADAS:');
        console.log('   • ✅ Versão mais recente do Baileys');
        console.log('   • ✅ Limpeza automática de sessões');
        console.log('   • ✅ Timeout estendido (60s)');
        console.log('   • ✅ Tratamento robusto de erros');
        console.log('   • ✅ Logger completamente silencioso');
        console.log('   • ✅ Configurações otimizadas');
        
      } else if (connectResponse.data.status === 'connected') {
        console.log('   🎉 BOT JÁ CONECTADO!');
        console.log('   📱 Número:', connectResponse.data.phone);
        
      } else {
        console.log('   ⚠️ Status:', connectResponse.data.status);
        console.log('   💬 Mensagem:', connectResponse.data.message);
      }

    } catch (connectError) {
      if (connectError.code === 'ECONNABORTED') {
        console.log('   ⏰ Timeout - mas pode ter funcionado');
        console.log('   💡 Verifique a interface web');
      } else {
        console.log('   ❌ Erro:', connectError.response?.data?.error || connectError.message);
        
        if (connectError.response?.data?.error?.includes('401')) {
          console.log('\n🚨 AINDA RECEBENDO ERRO 401:');
          console.log('   Isso indica que o WhatsApp está bloqueando seu IP/número');
          console.log('   💡 SOLUÇÕES:');
          console.log('   1. Use um número COMPLETAMENTE diferente');
          console.log('   2. Aguarde 24-48 horas');
          console.log('   3. Use WhatsApp Business');
          console.log('   4. Tente de outro computador/rede');
        }
      }
    }

    // 6. Verificar status final
    console.log('\n6️⃣ Verificando status final...');
    const finalResponse = await axios.get(`${BASE_URL}/api/bots/${bot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const finalBot = finalResponse.data;
    console.log('   📊 Status final:');
    console.log(`   🔗 Conectado: ${finalBot.is_connected ? '🟢 SIM!' : '🔴 Não'}`);
    console.log(`   📊 Status: ${finalBot.connection_status}`);
    console.log(`   📱 Número: ${finalBot.phone_number || 'Não definido'}`);
    console.log(`   📅 Última atividade: ${finalBot.last_seen ? new Date(finalBot.last_seen).toLocaleString('pt-BR') : 'Nunca'}`);

    if (finalBot.qr_code) {
      console.log('   📱 QR Code disponível: ✅');
    }

    if (finalBot.is_connected) {
      console.log('\n🎉 SUCESSO TOTAL!');
      console.log('   ✅ Bot conectado ao WhatsApp');
      console.log('   ✅ Número registrado no sistema');
      console.log('   ✅ Pronto para receber mensagens');
      
      console.log('\n🧪 TESTE O BOT:');
      console.log(`   📱 Envie uma mensagem para: ${finalBot.phone_number}`);
      console.log('   💬 O bot deve responder automaticamente');
      
    } else {
      console.log('\n🔄 PRÓXIMOS PASSOS:');
      console.log('   1. Acesse: http://localhost:3000/bots');
      console.log('   2. Clique no botão WhatsApp');
      console.log('   3. Escaneie o QR Code se disponível');
      console.log('   4. Se não funcionar, aguarde 24h e tente com número diferente');
    }

    console.log('\n🛡️ IMPLEMENTAÇÃO ROBUSTA CONCLUÍDA!');

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar teste robusto
testRobustConnection();

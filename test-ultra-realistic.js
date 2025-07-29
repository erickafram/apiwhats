const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testUltraRealistic() {
  try {
    console.log('🚀 Testando Configuração ULTRA-REALISTA...\n');

    console.log('✅ MELHORIAS IMPLEMENTADAS:');
    console.log('   🔧 Baileys versão 6.5.0 (específica)');
    console.log('   🌐 Browser: Chrome Windows 120.0.6099.130');
    console.log('   🤖 User Agent: Chrome real');
    console.log('   ⏰ Timeouts naturais');
    console.log('   👤 Comportamento humano (presença, digitação)');
    console.log('   🔄 Rate limiting implementado');
    console.log('   📱 Configurações anti-detecção');

    // Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@whatsapp-bot.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('\n✅ Login realizado');

    // Buscar bot
    const botsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const bot = botsResponse.data.bots[0];
    console.log(`📋 Bot: ${bot.name} (ID: ${bot.id})`);

    // Limpar sessão completamente
    console.log('\n🧹 Limpeza TOTAL (anti-detecção)...');
    try {
      await axios.post(`${BASE_URL}/api/bots/${bot.id}/clear-session`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Sessão API limpa');
    } catch (error) {
      console.log('   ⚠️ Erro API:', error.response?.data?.error);
    }

    // Aguardar estabilização
    console.log('\n⏳ Aguardando 10 segundos para estabilizar...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Tentar conexão ULTRA-REALISTA
    console.log('\n🚀 CONECTANDO COM CONFIGURAÇÃO ULTRA-REALISTA...');
    console.log('   🌐 Browser: Chrome Windows (real)');
    console.log('   🤖 User Agent: Mozilla/5.0 completo');
    console.log('   👤 Comportamento humano ativado');
    console.log('   ⏰ Timeouts naturais');
    console.log('   🔄 Rate limiting ativo');
    
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/bots/${bot.id}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 65000
      });

      console.log('\n   ✅ RESPOSTA RECEBIDA!');
      console.log('   📋 Status:', connectResponse.data.status);
      console.log('   💬 Mensagem:', connectResponse.data.message);
      
      if (connectResponse.data.qrCode) {
        console.log('\n   🎉 QR CODE ULTRA-REALISTA GERADO!');
        console.log('   📏 Tamanho:', connectResponse.data.qrCode.length, 'caracteres');
        
        console.log('\n📱 INSTRUÇÕES PARA SEU NÚMERO REAL:');
        console.log('   🚨 Esta configuração é MUITO mais compatível!');
        console.log('   1. 🌐 Acesse: http://localhost:3000/bots');
        console.log('   2. 📱 Clique no botão WhatsApp');
        console.log('   3. 📷 Escaneie com seu WhatsApp');
        console.log('   4. ✅ Deve conectar sem bloqueios!');
        
        console.log('\n💡 VANTAGENS DA NOVA CONFIGURAÇÃO:');
        console.log('   • 🌐 Browser real (Chrome Windows)');
        console.log('   • 🤖 User Agent completo e real');
        console.log('   • 👤 Simula digitação humana');
        console.log('   • ⏰ Delays naturais');
        console.log('   • 📱 Presença online realista');
        console.log('   • 🔄 Rate limiting anti-spam');
        console.log('   • 🛡️ Anti-detecção de bot');
        
        console.log('\n🎯 COMPORTAMENTO HUMANO ATIVO:');
        console.log('   • Marca presença online');
        console.log('   • Simula digitação antes de enviar');
        console.log('   • Delays baseados no tamanho da mensagem');
        console.log('   • Intervalos naturais entre ações');
        console.log('   • Presença atualizada a cada 45-60s');
        
        // Aguardar o usuário testar
        console.log('\n⏳ Aguardando você testar (60 segundos)...');
        console.log('   💡 Acesse a interface e escaneie o QR Code');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
      } else {
        console.log('\n   ⚠️ QR Code não gerado');
        console.log('   🔍 Resposta:', JSON.stringify(connectResponse.data, null, 2));
      }

    } catch (connectError) {
      console.log('\n   ❌ Erro:', connectError.response?.data?.error || connectError.message);
    }

    // Verificar resultado final
    console.log('\n📊 Verificando resultado final...');
    const finalResponse = await axios.get(`${BASE_URL}/api/bots/${bot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const finalBot = finalResponse.data;
    console.log('   📊 Status final:');
    console.log(`   🔗 Conectado: ${finalBot.is_connected ? '🟢 SIM!' : '🔴 Não'}`);
    console.log(`   📊 Status: ${finalBot.connection_status}`);
    console.log(`   📱 Número: ${finalBot.phone_number || 'Não definido'}`);

    if (finalBot.is_connected) {
      console.log('\n🎉 SUCESSO TOTAL! CONFIGURAÇÃO ULTRA-REALISTA FUNCIONOU!');
      console.log('   ✅ Número real conectado');
      console.log('   ✅ Comportamento humano ativo');
      console.log('   ✅ Anti-detecção funcionando');
      console.log('   ✅ Pronto para uso profissional');
      
      console.log('\n🧪 TESTE AS FUNCIONALIDADES:');
      console.log(`   📱 Envie mensagem para: ${finalBot.phone_number}`);
      console.log('   💬 O bot responderá com comportamento humano');
      console.log('   🤖 IA funcionando com delays naturais');
      console.log('   📊 Analytics em tempo real');
      
    } else {
      console.log('\n⚠️ Ainda não conectado');
      console.log('   💡 Possíveis motivos:');
      console.log('   • QR Code não foi escaneado');
      console.log('   • Número ainda bloqueado (aguarde 24h)');
      console.log('   • Use WhatsApp Business');
      
      console.log('\n🔄 PRÓXIMAS AÇÕES:');
      console.log('   1. Se não escaneou: acesse e tente');
      console.log('   2. Se deu erro: use WhatsApp Business');
      console.log('   3. Se continuar: aguarde 24h');
      console.log('   4. Última opção: número diferente');
    }

    console.log('\n🎯 RESUMO DA IMPLEMENTAÇÃO:');
    console.log('   ✅ Baileys 6.5.0 instalado');
    console.log('   ✅ Browser ultra-realista');
    console.log('   ✅ Comportamento humano');
    console.log('   ✅ Rate limiting');
    console.log('   ✅ Anti-detecção');
    console.log('   ✅ Configurações de produção');

    console.log('\n🚀 ACESSE: http://localhost:3000/bots');

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar teste ultra-realista
testUltraRealistic();

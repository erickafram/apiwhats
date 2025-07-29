const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function connectRealWhatsApp() {
  try {
    console.log('📱 CONECTANDO NÚMERO REAL DO WHATSAPP...\n');

    console.log('🚨 ESTRATÉGIA ANTI-BLOQUEIO:');
    console.log('   ✅ Configuração ultra-compatível');
    console.log('   ✅ Browser Chrome Linux (mais aceito)');
    console.log('   ✅ Timeouts estendidos (120s)');
    console.log('   ✅ Retry mínimo para evitar spam');
    console.log('   ✅ Sync desabilitado (menos suspeito)');

    // 1. Login
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@whatsapp-bot.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');

    // 2. Listar bots
    console.log('\n2️⃣ Preparando bot...');
    const botsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (botsResponse.data.bots.length === 0) {
      console.log('   ❌ Nenhum bot encontrado');
      return;
    }

    const bot = botsResponse.data.bots[0];
    console.log(`   📋 Bot: ${bot.name} (ID: ${bot.id})`);

    // 3. Limpar TUDO completamente
    console.log('\n3️⃣ Limpeza TOTAL (anti-bloqueio)...');
    
    // Limpar via API
    try {
      await axios.post(`${BASE_URL}/api/bots/${bot.id}/clear-session`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Sessão API limpa');
    } catch (error) {
      console.log('   ⚠️ Erro API:', error.response?.data?.error);
    }

    // Limpar arquivos locais
    const sessionsDir = path.join(__dirname, 'sessions');
    if (fs.existsSync(sessionsDir)) {
      try {
        fs.rmSync(sessionsDir, { recursive: true, force: true });
        console.log('   ✅ Diretório sessions removido');
      } catch (error) {
        console.log('   ⚠️ Erro ao remover sessions:', error.message);
      }
    }

    // Aguardar estabilização
    console.log('\n4️⃣ Aguardando 10 segundos para estabilizar...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 5. Tentar conexão REAL
    console.log('\n5️⃣ CONECTANDO WHATSAPP REAL...');
    console.log('   📱 Configuração ultra-compatível ativada');
    console.log('   ⏳ Aguardando até 120 segundos...');
    console.log('   🔄 Timeout estendido para evitar bloqueios');
    
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/bots/${bot.id}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 125000 // 125 segundos
      });

      console.log('\n   ✅ RESPOSTA RECEBIDA!');
      console.log('   📋 Status:', connectResponse.data.status);
      console.log('   💬 Mensagem:', connectResponse.data.message);
      
      if (connectResponse.data.qrCode) {
        console.log('\n   🎉 QR CODE REAL GERADO!');
        console.log('   📏 Tamanho:', connectResponse.data.qrCode.length, 'caracteres');
        
        console.log('\n📱 INSTRUÇÕES CRÍTICAS PARA SEU NÚMERO REAL:');
        console.log('   🚨 ATENÇÃO: Siga EXATAMENTE estas instruções!');
        console.log('   1. 🌐 Acesse IMEDIATAMENTE: http://localhost:3000/bots');
        console.log('   2. 📱 Clique no botão WhatsApp do bot');
        console.log('   3. 📷 Escaneie RAPIDAMENTE com SEU WhatsApp');
        console.log('   4. ⚠️ Você tem 120 segundos (2 minutos)');
        console.log('   5. 🔄 Se falhar, aguarde 24h antes de tentar novamente');
        
        console.log('\n💡 DICAS PARA SUCESSO COM NÚMERO REAL:');
        console.log('   • 📱 WhatsApp deve estar na VERSÃO MAIS RECENTE');
        console.log('   • 📶 Use WiFi ESTÁVEL (não dados móveis)');
        console.log('   • 🔋 Celular com bateria boa');
        console.log('   • 🚫 NÃO feche o navegador durante o processo');
        console.log('   • ⚡ Escaneie IMEDIATAMENTE quando aparecer');
        
        console.log('\n🎯 SE DER "NÃO É POSSÍVEL CONECTAR":');
        console.log('   • Seu número pode estar temporariamente bloqueado');
        console.log('   • Aguarde 24-48 horas');
        console.log('   • Ou use WhatsApp Business com mesmo número');
        console.log('   • Ou use número completamente diferente');
        
        // Aguardar o usuário escanear
        console.log('\n⏳ Aguardando você escanear o QR Code...');
        console.log('   💡 Você tem 2 minutos para escanear');
        await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutos
        
      } else if (connectResponse.data.status === 'connected') {
        console.log('\n   🎉 JÁ CONECTADO!');
        console.log('   📱 Número:', connectResponse.data.phone);
        
      } else {
        console.log('\n   ⚠️ Status inesperado:', connectResponse.data.status);
      }

    } catch (connectError) {
      if (connectError.code === 'ECONNABORTED') {
        console.log('\n   ⏰ Timeout - mas pode ter funcionado');
        console.log('   💡 Verifique a interface web');
      } else {
        console.log('\n   ❌ Erro:', connectError.response?.data?.error || connectError.message);
        
        if (connectError.response?.data?.error?.includes('401') || 
            connectError.response?.data?.error?.includes('deslogado')) {
          console.log('\n🚨 NÚMERO BLOQUEADO PELO WHATSAPP!');
          console.log('   Seu número está temporariamente bloqueado.');
          console.log('   💡 SOLUÇÕES:');
          console.log('   1. 📱 Instale WhatsApp Business');
          console.log('   2. ⏰ Aguarde 24-48 horas');
          console.log('   3. 🔄 Use número completamente diferente');
          console.log('   4. 🌐 Tente de outro computador/rede');
        }
      }
    }

    // 6. Verificar resultado final
    console.log('\n6️⃣ Verificando resultado final...');
    const finalResponse = await axios.get(`${BASE_URL}/api/bots/${bot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const finalBot = finalResponse.data;
    console.log('   📊 Status final:');
    console.log(`   🔗 Conectado: ${finalBot.is_connected ? '🟢 SIM!' : '🔴 Não'}`);
    console.log(`   📊 Status: ${finalBot.connection_status}`);
    console.log(`   📱 Número: ${finalBot.phone_number || 'Não definido'}`);

    if (finalBot.is_connected) {
      console.log('\n🎉 SUCESSO! SEU NÚMERO REAL ESTÁ CONECTADO!');
      console.log('   ✅ WhatsApp real funcionando');
      console.log('   ✅ Número registrado no sistema');
      console.log('   ✅ Pronto para receber mensagens reais');
      
      console.log('\n🧪 TESTE SEU BOT REAL:');
      console.log(`   📱 Envie mensagem para: ${finalBot.phone_number}`);
      console.log('   💬 O bot responderá automaticamente');
      console.log('   🤖 IA funcionando com mensagens reais');
      
    } else {
      console.log('\n❌ Não conectado ainda');
      console.log('   💡 Possíveis motivos:');
      console.log('   • QR Code não foi escaneado a tempo');
      console.log('   • WhatsApp rejeitou a conexão');
      console.log('   • Número temporariamente bloqueado');
      
      console.log('\n🔄 PRÓXIMAS AÇÕES:');
      console.log('   1. Se não escaneou: acesse a interface e tente');
      console.log('   2. Se deu erro: aguarde 24h');
      console.log('   3. Se continuar: use WhatsApp Business');
      console.log('   4. Última opção: número diferente');
    }

    console.log('\n🎯 ACESSE A INTERFACE:');
    console.log('   🌐 http://localhost:3000/bots');
    console.log('   📱 Clique no botão WhatsApp se QR Code disponível');

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar conexão real
connectRealWhatsApp();

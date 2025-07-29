const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function cleanAllSessions() {
  try {
    console.log('🧹 Limpando TODAS as sessões antigas...\n');

    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@exemplo.com',
      password: 'senha123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');

    // 2. Listar todos os bots
    console.log('\n2️⃣ Listando todos os bots...');
    const botsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`   📋 Encontrados ${botsResponse.data.bots.length} bots`);

    // 3. Limpar sessão de cada bot
    console.log('\n3️⃣ Limpando sessões de todos os bots...');
    for (const bot of botsResponse.data.bots) {
      console.log(`   🧹 Limpando bot: ${bot.name} (ID: ${bot.id})`);
      
      try {
        await axios.post(`${BASE_URL}/api/bots/${bot.id}/clear-session`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`      ✅ Sessão do bot ${bot.id} limpa`);
      } catch (error) {
        console.log(`      ⚠️ Erro ao limpar bot ${bot.id}:`, error.response?.data?.error || error.message);
      }
    }

    // 4. Limpar diretório de sessões manualmente
    console.log('\n4️⃣ Limpando diretório de sessões...');
    const sessionsDir = path.join(__dirname, 'sessions');
    
    if (fs.existsSync(sessionsDir)) {
      try {
        const files = fs.readdirSync(sessionsDir);
        console.log(`   📁 Encontrados ${files.length} arquivos/pastas de sessão`);
        
        for (const file of files) {
          const filePath = path.join(sessionsDir, file);
          if (fs.statSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
            console.log(`   🗑️ Removido diretório: ${file}`);
          } else {
            fs.unlinkSync(filePath);
            console.log(`   🗑️ Removido arquivo: ${file}`);
          }
        }
        console.log('   ✅ Diretório de sessões limpo');
      } catch (error) {
        console.log('   ⚠️ Erro ao limpar diretório:', error.message);
      }
    } else {
      console.log('   ℹ️ Diretório de sessões não existe');
    }

    // 5. Verificar status final
    console.log('\n5️⃣ Verificando status final dos bots...');
    const finalBotsResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    finalBotsResponse.data.bots.forEach((bot, index) => {
      console.log(`   ${index + 1}. ${bot.name}:`);
      console.log(`      🔗 Conectado: ${bot.is_connected ? '🟢 Sim' : '🔴 Não'}`);
      console.log(`      📊 Status: ${bot.connection_status}`);
      console.log(`      📱 Número: ${bot.phone_number || 'Nenhum'}`);
    });

    console.log('\n✅ LIMPEZA COMPLETA REALIZADA!');
    console.log('\n🎯 AGORA VOCÊ PODE:');
    console.log('   1. 🌐 Acessar: http://localhost:3000/bots');
    console.log('   2. 📱 Clicar no botão WhatsApp de qualquer bot');
    console.log('   3. 📷 Escanear o QR Code com SEU WhatsApp');
    console.log('   4. ✅ Conectar pela primeira vez sem problemas');
    
    console.log('\n💡 DICAS PARA SUCESSO:');
    console.log('   • Use seu número principal do WhatsApp');
    console.log('   • Certifique-se que está na versão mais recente');
    console.log('   • Use WiFi estável');
    console.log('   • Escaneie rapidamente quando o QR aparecer');

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar limpeza
cleanAllSessions();

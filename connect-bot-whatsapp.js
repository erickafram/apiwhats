const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function connectBotToWhatsApp() {
  try {
    console.log('📱 Demonstração: Conectar Bot ao WhatsApp...\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@exemplo.com',
      password: 'senha123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');

    // 2. Listar bots disponíveis
    console.log('\n2️⃣ Listando bots disponíveis...');
    const listResponse = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (listResponse.data.bots.length === 0) {
      console.log('   ❌ Nenhum bot encontrado. Execute create-user-and-bot.js primeiro.');
      return;
    }

    const bot = listResponse.data.bots[0]; // Pegar o primeiro bot
    console.log(`   📋 Bot selecionado: ${bot.name} (ID: ${bot.id})`);
    console.log(`   ⚡ Status atual: ${bot.is_active ? '🟢 Ativo' : '🔴 Inativo'}`);
    console.log(`   🔗 Conectado: ${bot.is_connected ? 'Sim' : 'Não'}`);

    // 3. Conectar bot ao WhatsApp
    console.log('\n3️⃣ Iniciando conexão com WhatsApp...');
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/bots/${bot.id}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('   ✅ Processo de conexão iniciado!');
      console.log('   📋 Resposta:', connectResponse.data.message);
      
      if (connectResponse.data.qr_code) {
        console.log('   📱 QR Code gerado para escaneamento');
        console.log('   🔗 Status:', connectResponse.data.status);
        console.log('\n   📋 Instruções:');
        console.log('   1. Abra o WhatsApp no seu celular');
        console.log('   2. Vá em Configurações > Aparelhos conectados');
        console.log('   3. Toque em "Conectar um aparelho"');
        console.log('   4. Escaneie o QR Code que aparecerá na interface web');
      }

    } catch (connectError) {
      console.log('   ⚠️ Erro na conexão:', connectError.response?.data?.error || connectError.message);
      if (connectError.response?.data?.code === 'WHATSAPP_SERVICE_NOT_AVAILABLE') {
        console.log('   💡 O serviço WhatsApp pode não estar totalmente configurado ainda.');
      }
    }

    // 4. Verificar status do bot após tentativa de conexão
    console.log('\n4️⃣ Verificando status atualizado do bot...');
    const updatedBotResponse = await axios.get(`${BASE_URL}/api/bots/${bot.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const updatedBot = updatedBotResponse.data;
    console.log('   📋 Status atualizado:');
    console.log(`   🆔 ID: ${updatedBot.id}`);
    console.log(`   📝 Nome: ${updatedBot.name}`);
    console.log(`   ⚡ Ativo: ${updatedBot.is_active ? '🟢 Sim' : '🔴 Não'}`);
    console.log(`   🔗 Conectado: ${updatedBot.is_connected ? '🟢 Sim' : '🔴 Não'}`);
    console.log(`   📊 Status de Conexão: ${updatedBot.connection_status}`);
    console.log(`   📱 Número: ${updatedBot.phone_number || 'Não definido'}`);
    console.log(`   👁️ Última atividade: ${updatedBot.last_seen ? new Date(updatedBot.last_seen).toLocaleString('pt-BR') : 'Nunca'}`);

    // 5. Demonstrar outras funcionalidades
    console.log('\n🎯 Próximos passos após conexão:');
    console.log('   📝 Criar fluxos de conversa:');
    console.log(`      POST ${BASE_URL}/api/flows`);
    console.log('   💬 Monitorar conversas:');
    console.log(`      GET ${BASE_URL}/api/conversations?bot_id=${bot.id}`);
    console.log('   📊 Ver métricas:');
    console.log(`      GET ${BASE_URL}/api/analytics/bots/${bot.id}`);
    console.log('   🔄 Desconectar (se necessário):');
    console.log(`      POST ${BASE_URL}/api/bots/${bot.id}/disconnect`);

    console.log('\n✨ Processo de conexão demonstrado com sucesso!');
    console.log('🌐 Acesse o frontend para uma interface visual: http://localhost:3000');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar a demonstração
connectBotToWhatsApp();

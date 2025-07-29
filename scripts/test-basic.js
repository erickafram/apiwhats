const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBasicSystem() {
  console.log('🧪 Testando funcionalidades básicas do sistema...\n');

  try {
    // 1. Testar health check
    console.log('1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Health check OK:', healthResponse.data.status);

    // 2. Testar registro de usuário
    console.log('\n2️⃣ Testando registro de usuário...');
    const registerData = {
      name: 'Usuário Teste Básico',
      email: `teste_basico_${Date.now()}@example.com`,
      password: 'teste123'
    };

    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    console.log('   ✅ Usuário registrado:', registerResponse.data.user.name);
    
    const token = registerResponse.data.token;

    // 3. Testar login
    console.log('\n3️⃣ Testando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('   ✅ Login realizado:', loginResponse.data.user.email);

    // 4. Testar verificação de token
    console.log('\n4️⃣ Testando verificação de token...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Token válido:', verifyResponse.data.user.name);

    // 5. Testar criação de bot (sem includes complexos)
    console.log('\n5️⃣ Testando criação de bot...');
    const botData = {
      name: 'Bot de Teste Básico',
      description: 'Bot criado durante teste básico',
      ai_config: {
        enabled: true,
        temperature: 0.7,
        max_tokens: 500,
        system_prompt: 'Você é um bot de teste.'
      }
    };

    const botResponse = await axios.post(`${BASE_URL}/api/bots`, botData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Bot criado:', botResponse.data.bot.name);
    
    const botId = botResponse.data.bot.id;

    // 6. Testar busca de bot específico
    console.log('\n6️⃣ Testando busca de bot específico...');
    const botDetailResponse = await axios.get(`${BASE_URL}/api/bots/${botId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Bot encontrado:', botDetailResponse.data.name);

    // 7. Testar atualização de bot
    console.log('\n7️⃣ Testando atualização de bot...');
    const updateResponse = await axios.put(`${BASE_URL}/api/bots/${botId}`, {
      description: 'Bot atualizado durante teste'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Bot atualizado:', updateResponse.data.bot.description);

    // 8. Testar listagem simples de bots
    console.log('\n8️⃣ Testando listagem de bots...');
    const botsResponse = await axios.get(`${BASE_URL}/api/bots?limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Bots listados:', botsResponse.data.bots.length);

    console.log('\n🎉 Testes básicos passaram com sucesso!');
    console.log('\n📊 Resumo dos testes básicos:');
    console.log('   ✅ Health check');
    console.log('   ✅ Registro de usuário');
    console.log('   ✅ Login');
    console.log('   ✅ Verificação de token');
    console.log('   ✅ Criação de bot');
    console.log('   ✅ Busca de bot específico');
    console.log('   ✅ Atualização de bot');
    console.log('   ✅ Listagem de bots');

    console.log('\n✨ Sistema básico funcionando corretamente!');
    console.log('💡 Agora você pode testar o sistema completo com: npm run test:system');

  } catch (error) {
    console.error('\n❌ Erro durante os testes básicos:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
      console.error('   URL:', error.config.url);
    } else {
      console.error('   Erro:', error.message);
    }
    
    console.log('\n🔍 Verifique se:');
    console.log('   - O servidor está rodando (npm run dev)');
    console.log('   - O banco de dados está configurado');
    console.log('   - As migrations foram executadas');
    
    process.exit(1);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testBasicSystem();
}

module.exports = testBasicSystem;

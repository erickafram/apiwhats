const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testMinimal() {
  console.log('🔬 Teste mínimo do sistema...\n');

  try {
    // 1. Health check
    console.log('1️⃣ Health check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ OK:', health.data.status);

    // 2. Registro
    console.log('\n2️⃣ Registro...');
    const email = `test_${Date.now()}@test.com`;
    const register = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test User',
      email: email,
      password: 'test123'
    });
    console.log('   ✅ Usuário criado:', register.data.user.name);
    const token = register.data.token;

    // 3. Login
    console.log('\n3️⃣ Login...');
    const login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: email,
      password: 'test123'
    });
    console.log('   ✅ Login OK:', login.data.user.email);

    // 4. Criar bot
    console.log('\n4️⃣ Criar bot...');
    const bot = await axios.post(`${BASE_URL}/api/bots`, {
      name: 'Test Bot',
      description: 'Bot de teste'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Bot criado:', bot.data.bot.name);

    // 5. Listar bots (o que estava falhando)
    console.log('\n5️⃣ Listar bots...');
    const bots = await axios.get(`${BASE_URL}/api/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Bots listados:', bots.data.bots.length);
    console.log('   📊 Primeiro bot:', bots.data.bots[0]?.name);

    console.log('\n🎉 Teste mínimo passou! Sistema funcionando.');

  } catch (error) {
    console.error('\n❌ Erro no teste mínimo:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   URL:', error.config.url);
      console.error('   Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Erro:', error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  testMinimal();
}

module.exports = testMinimal;

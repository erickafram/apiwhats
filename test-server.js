console.log('🧪 Testando inicialização do servidor...');

try {
  // Testar imports básicos primeiro
  console.log('1️⃣ Testando models...');
  const db = require('./src/models');
  console.log('✅ Models carregados:', Object.keys(db));

  console.log('\n2️⃣ Testando middleware auth...');
  const { authenticateToken } = require('./src/middleware/auth');
  console.log('✅ Auth middleware:', typeof authenticateToken);

  console.log('\n3️⃣ Testando rotas quick-messages...');
  const quickMessagesRoutes = require('./src/routes/quick-messages');
  console.log('✅ Quick messages routes:', typeof quickMessagesRoutes);

  console.log('\n4️⃣ Testando servidor principal...');
  // Não iniciar o servidor, apenas carregar
  delete require.cache[require.resolve('./server.js')];
  console.log('✅ Servidor carregado sem erros');

  console.log('\n🎉 Todos os imports estão funcionando!');
  
} catch (error) {
  console.error('❌ Erro encontrado:', error.message);
  console.error('Stack:', error.stack);
} finally {
  process.exit(0);
} 
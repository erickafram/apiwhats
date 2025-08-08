#!/usr/bin/env node

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function clearCacheAndRecompile() {
  console.log('🧹 LIMPEZA COMPLETA: Cache e Estado das Conversas');
  console.log('===============================================');

  try {
    // Conectar ao banco
    const sequelize = new Sequelize({
      dialect: 'mysql',
      host: 'localhost',
      username: 'chatbot',
      password: '@@2025@@Ekb',
      database: 'chatbot',
      logging: false
    });

    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados!');

    // 1. Limpar conversas ativas
    console.log('\n1️⃣ Limpando conversas ativas...');
    const [conversationsResult] = await sequelize.query(`
      SELECT COUNT(*) as total FROM conversations WHERE status = 'active'
    `);
    console.log(`📊 Conversas ativas encontradas: ${conversationsResult[0].total}`);

    if (conversationsResult[0].total > 0) {
      await sequelize.query(`
        UPDATE conversations 
        SET status = 'completed',
            current_flow_id = NULL,
            current_node = NULL,
            session_data = NULL,
            updated_at = NOW()
        WHERE status = 'active'
      `);
      console.log('✅ Conversas ativas resetadas');
    }

    // 2. Limpar mensagens não processadas
    console.log('\n2️⃣ Limpando mensagens não processadas...');
    const [messagesResult] = await sequelize.query(`
      SELECT COUNT(*) as total FROM messages WHERE processed = 0
    `);
    console.log(`📊 Mensagens não processadas: ${messagesResult[0].total}`);

    if (messagesResult[0].total > 0) {
      await sequelize.query(`
        UPDATE messages 
        SET processed = 1,
            updated_at = NOW()
        WHERE processed = 0
      `);
      console.log('✅ Mensagens marcadas como processadas');
    }

    // 3. Resetar status dos bots
    console.log('\n3️⃣ Resetando status dos bots...');
    await sequelize.query(`
      UPDATE bots 
      SET is_connected = 0,
          connection_status = 'disconnected',
          session_data = NULL,
          last_seen = NULL,
          updated_at = NOW()
    `);
    console.log('✅ Status dos bots resetado');

    // 4. Limpar analytics antigas (opcional - últimas 24h apenas)
    console.log('\n4️⃣ Limpando analytics antigas...');
    const [analyticsResult] = await sequelize.query(`
      SELECT COUNT(*) as total FROM analytics 
      WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    console.log(`📊 Analytics antigas (>24h): ${analyticsResult[0].total}`);

    if (analyticsResult[0].total > 100) { // Só limpa se tiver muitos
      await sequelize.query(`
        DELETE FROM analytics 
        WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND metric_type NOT IN ('conversation_completed', 'conversion')
      `);
      console.log('✅ Analytics antigas removidas (mantendo conversões)');
    }

    await sequelize.close();

    // 5. Limpar cache de arquivos do Node.js
    console.log('\n5️⃣ Limpando cache do Node.js...');
    try {
      // Limpar diretório de sessões se existir
      const sessionsDir = path.join(__dirname, 'sessions');
      if (fs.existsSync(sessionsDir)) {
        const files = fs.readdirSync(sessionsDir);
        files.forEach(file => {
          if (file.endsWith('.json') || file.endsWith('.session')) {
            fs.unlinkSync(path.join(sessionsDir, file));
          }
        });
        console.log(`✅ ${files.length} arquivos de sessão removidos`);
      }

      // Limpar WhatsApp sessions
      const whatsappSessionsDir = path.join(__dirname, 'whatsapp_sessions');
      if (fs.existsSync(whatsappSessionsDir)) {
        const files = fs.readdirSync(whatsappSessionsDir);
        files.forEach(file => {
          if (file !== '.gitkeep') {
            const filePath = path.join(whatsappSessionsDir, file);
            if (fs.statSync(filePath).isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(filePath);
            }
          }
        });
        console.log(`✅ Sessões do WhatsApp removidas`);
      }

    } catch (error) {
      console.log('⚠️ Erro ao limpar arquivos de cache:', error.message);
    }

    // 6. Limpar logs antigos
    console.log('\n6️⃣ Limpando logs antigos...');
    try {
      const logsDir = path.join(__dirname, 'logs');
      if (fs.existsSync(logsDir)) {
        const files = fs.readdirSync(logsDir);
        files.forEach(file => {
          if (file.includes('old') || file.includes('backup')) {
            fs.unlinkSync(path.join(logsDir, file));
          }
        });
        console.log('✅ Logs antigos removidos');
      }
    } catch (error) {
      console.log('⚠️ Erro ao limpar logs:', error.message);
    }

    console.log('\n🎯 LIMPEZA CONCLUÍDA!');
    console.log('');
    console.log('📋 RESUMO:');
    console.log('✅ Conversas ativas resetadas');
    console.log('✅ Mensagens não processadas limpas');
    console.log('✅ Status dos bots resetado');
    console.log('✅ Cache de arquivos removido');
    console.log('✅ Sessões do WhatsApp limpas');
    console.log('');
    console.log('🚀 PRÓXIMO PASSO:');
    console.log('Execute o script de recompilação completa!');

  } catch (error) {
    console.error('❌ Erro na limpeza:', error.message);
  }
}

// Executar
clearCacheAndRecompile().catch(console.error);

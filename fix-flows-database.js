const { Sequelize } = require('sequelize');
require('dotenv').config();

async function fixFlowsDatabase() {
  console.log('🔧 CORRIGINDO TABELA DE FLUXOS');
  console.log('==============================');
  console.log('');

  try {
    // Conectar ao banco
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
      }
    );

    console.log('1️⃣ Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');
    console.log('');

    // Verificar se a coluna template_id existe
    console.log('2️⃣ Verificando estrutura da tabela flows...');
    
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE table_schema = '${process.env.DB_NAME}' 
      AND table_name = 'flows' 
      AND column_name = 'template_id'
    `);

    if (results.length === 0) {
      console.log('⚠️ Coluna template_id não encontrada. Adicionando...');
      
      await sequelize.query(`
        ALTER TABLE flows 
        ADD COLUMN template_id VARCHAR(50) NULL 
        AFTER statistics
      `);
      
      console.log('✅ Coluna template_id adicionada com sucesso');
    } else {
      console.log('✅ Coluna template_id já existe');
    }
    console.log('');

    // Verificar estrutura final
    console.log('3️⃣ Verificando estrutura final...');
    const [columns] = await sequelize.query(`
      DESCRIBE flows
    `);

    console.log('📋 Colunas da tabela flows:');
    columns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');

    // Verificar fluxos existentes
    console.log('4️⃣ Verificando fluxos existentes...');
    const [flows] = await sequelize.query(`
      SELECT f.id, f.name, f.is_active, f.is_default, b.name as bot_name
      FROM flows f
      LEFT JOIN bots b ON f.bot_id = b.id
      ORDER BY f.created_at DESC
    `);

    console.log(`📊 Total de fluxos: ${flows.length}`);
    
    if (flows.length > 0) {
      console.log('📝 Fluxos encontrados:');
      flows.forEach((flow, index) => {
        console.log(`   ${index + 1}. ${flow.name} (Bot: ${flow.bot_name || 'N/A'})`);
        console.log(`      - Ativo: ${flow.is_active ? 'Sim' : 'Não'}`);
        console.log(`      - Padrão: ${flow.is_default ? 'Sim' : 'Não'}`);
      });
    } else {
      console.log('⚠️ Nenhum fluxo encontrado');
      console.log('💡 Execute: node create-maytapi-flows.js');
    }
    console.log('');

    await sequelize.close();
    
    console.log('🎉 CORREÇÃO CONCLUÍDA!');
    console.log('');
    console.log('✅ Tabela flows corrigida');
    console.log('✅ Coluna template_id disponível');
    console.log('✅ Estrutura verificada');
    console.log('');
    console.log('🌐 PRÓXIMOS PASSOS:');
    console.log('1. Acesse: http://localhost:3000/flows');
    console.log('2. Faça login se necessário');
    console.log('3. Veja os fluxos funcionando!');

  } catch (error) {
    console.error('❌ Erro ao corrigir banco:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('');
      console.log('💡 SOLUÇÃO: Problema de conexão com banco');
      console.log('   1. Verifique se o MySQL está rodando');
      console.log('   2. Verifique as credenciais no .env');
      console.log('   3. Verifique se o banco "apiwhats" existe');
    }
  }
}

fixFlowsDatabase().catch(console.error);

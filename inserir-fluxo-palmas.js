const mysql = require('mysql2/promise');
const fs = require('fs');

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whatsapp_chatbot',
  charset: 'utf8mb4'
};

async function inserirFluxoPalmas() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📁 Lendo arquivo do fluxo Palmas...');
    const fluxoData = fs.readFileSync('fluxoonibus.json', 'utf8');
    const fluxo = JSON.parse(fluxoData);
    
    console.log('📋 Fluxo carregado:', fluxo.name);
    
    // Primeiro, vamos desativar o fluxo atual
    console.log('🔄 Desativando fluxos atuais...');
    await connection.execute(
      'UPDATE flows SET is_active = 0, is_default = 0 WHERE is_active = 1'
    );
    console.log('✅ Fluxos antigos desativados');
    
    // Atualizar o fluxo existente ao invés de inserir novo
    console.log('📝 Atualizando fluxo ID 5 com origem fixa em Palmas...');
    const result = await connection.execute(
      `UPDATE flows SET 
        flow_data = ?,
        version = '2.1.0',
        is_active = 1,
        is_default = 1,
        updated_at = NOW()
      WHERE id = 5`,
      [JSON.stringify(fluxo.flow_data)]
    );
    
    console.log('✅ Fluxo atualizado! Linhas afetadas:', result[0].affectedRows);
    
    // Verificar se foi inserido corretamente
    console.log('🔍 Verificando fluxo ativo...');
    const [activeFlow] = await connection.execute(
      'SELECT id, name, is_active, is_default, priority, version FROM flows WHERE is_active = 1 ORDER BY priority DESC'
    );
    
    if (activeFlow.length > 0) {
      console.log('\n🎯 FLUXO ATIVO AGORA:');
      activeFlow.forEach(flow => {
        console.log(`ID ${flow.id}: ${flow.name}`);
        console.log(`  Versão: ${flow.version}`);
        console.log(`  Prioridade: ${flow.priority}`);
        console.log(`  Padrão: ${flow.is_default ? '✅ SIM' : '❌ NÃO'}`);
      });
    }
    
    console.log('\n✅ SUCESSO! Agora você pode testar o fluxo:');
    console.log('   1. Digite "oi" para iniciar');
    console.log('   2. Escolha "1" para comprar passagem');
    console.log('   3. Digite o destino (ex: Goiânia)');
    console.log('   4. Digite a data da viagem');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

console.log('🚀 Inserindo fluxo com origem fixa em Palmas...');
inserirFluxoPalmas().catch(console.error); 
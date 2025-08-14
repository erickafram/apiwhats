const mysql = require('mysql2/promise');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'whatsapp_chatbot'
    });
    
    console.log('🔍 Verificando estrutura da tabela flows...');
    const [columns] = await connection.execute('DESCRIBE flows');
    
    console.log('\n📋 Colunas da tabela flows:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      if (col.Field === 'flow_data') {
        console.log(`  👆 FLOW_DATA é do tipo: ${col.Type}`);
      }
    });
    
    // Verificar se flow_data é JSON
    const flowDataColumn = columns.find(col => col.Field === 'flow_data');
    if (flowDataColumn && flowDataColumn.Type.toLowerCase().includes('json')) {
      console.log('\n⚠️ PROBLEMA ENCONTRADO: flow_data é do tipo JSON!');
      console.log('O MySQL está automaticamente parseando JSON → Object');
      console.log('\n🔧 Convertendo para LONGTEXT...');
      
      await connection.execute('ALTER TABLE flows MODIFY COLUMN flow_data LONGTEXT');
      console.log('✅ Coluna alterada para LONGTEXT');
    }
    
    await connection.end();
    console.log('\n✅ Concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

main(); 
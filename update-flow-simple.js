const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  try {
    console.log('Iniciando...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'whatsapp_chatbot'
    });
    
    console.log('✅ Conectado');
    
    const fluxoData = fs.readFileSync('fluxoonibus.json', 'utf8');
    console.log('📄 Arquivo lido, tamanho:', fluxoData.length);
    
    const fluxo = JSON.parse(fluxoData);
    console.log('✅ JSON parseado');
    console.log('📊 Nome do fluxo:', fluxo.name);
    console.log('📊 Número de nós:', fluxo.flow_data?.nodes?.length);
    
    const flowDataString = JSON.stringify(fluxo.flow_data);
    console.log('📊 Flow data string size:', flowDataString.length);
    console.log('📊 Flow data sendo salvo (primeiros 200 chars):', flowDataString.substring(0, 200));
    
    await connection.execute(
      'UPDATE flows SET flow_data = ? WHERE id = 5',
      [flowDataString]
    );
    
    console.log('✅ Banco atualizado!');
    
    await connection.end();
    console.log('✅ Pronto!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

main(); 
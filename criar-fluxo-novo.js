const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  try {
    console.log('🔧 Criando fluxo novo...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'whatsapp_chatbot'
    });
    
    console.log('✅ Conectado ao banco');
    
    // Ler o JSON do fluxo
    const fluxoData = fs.readFileSync('fluxoonibus.json', 'utf8');
    const fluxo = JSON.parse(fluxoData);
    
    console.log('✅ JSON carregado');
    console.log('📊 Nome:', fluxo.name);
    console.log('📊 Nós:', fluxo.flow_data.nodes.length);
    console.log('📊 Edges:', fluxo.flow_data.edges.length);
    
    // Primeiro, desativar todos os outros fluxos
    await connection.execute(
      'UPDATE flows SET is_active = 0, is_default = 0'
    );
    console.log('✅ Outros fluxos desativados');
    
    // Verificar se o fluxo ID 6 já existe
    const [existing] = await connection.execute(
      'SELECT id FROM flows WHERE id = 6'
    );
    
    if (existing.length > 0) {
      console.log('⚠️ Fluxo ID 6 já existe, atualizando...');
      await connection.execute(
        `UPDATE flows SET 
         name = ?, 
         description = ?, 
         flow_data = ?, 
         trigger_keywords = ?, 
         is_active = 1, 
         is_default = 1, 
         priority = 100,
         version = '1.0.0',
         updated_at = NOW()
         WHERE id = 6`,
        [
          fluxo.name,
          fluxo.description,
          JSON.stringify(fluxo.flow_data),
          JSON.stringify(fluxo.trigger_keywords)
        ]
      );
    } else {
      console.log('➕ Criando novo fluxo ID 6...');
      await connection.execute(
        `INSERT INTO flows (
          id, name, description, flow_data, trigger_keywords, 
          is_active, is_default, priority, version, created_at, updated_at
         ) VALUES (6, ?, ?, ?, ?, 1, 1, 100, '1.0.0', NOW(), NOW())`,
        [
          fluxo.name,
          fluxo.description,
          JSON.stringify(fluxo.flow_data),
          JSON.stringify(fluxo.trigger_keywords)
        ]
      );
    }
    
    console.log('✅ Fluxo salvo com sucesso!');
    
    // Verificar se foi salvo corretamente
    const [result] = await connection.execute(
      'SELECT id, name, is_active, is_default FROM flows WHERE id = 6'
    );
    
    if (result.length > 0) {
      console.log('🎯 Fluxo criado:');
      console.log(`- ID: ${result[0].id}`);
      console.log(`- Nome: ${result[0].name}`);
      console.log(`- Ativo: ${result[0].is_active ? 'SIM' : 'NÃO'}`);
      console.log(`- Padrão: ${result[0].is_default ? 'SIM' : 'NÃO'}`);
    }
    
    await connection.end();
    console.log('✅ Concluído! Acesse: http://localhost:3000/flows/6/edit');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

main(); 
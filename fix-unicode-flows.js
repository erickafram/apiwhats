const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// Configuração do banco (usar as mesmas configurações do projeto)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chatbot_whats',
  charset: 'utf8mb4'
};

// Função para sanitizar Unicode problemático
function sanitizeUnicodeForJSON(data) {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(sanitizeUnicodeForJSON(parsed));
    } catch {
      // Se não for JSON válido, sanitizar a string diretamente
      return data
        .replace(/[\u200D]/g, '') // Remove Zero Width Joiner (ZWJ)
        .replace(/[\uD800-\uDFFF]/g, '') // Remove surrogate pairs órfãos
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
        .replace(/[\uFEFF]/g, ''); // Remove BOM
    }
  } else if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeUnicodeForJSON(item));
    } else {
      const result = {};
      for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = typeof key === 'string' ? 
          key.replace(/[\u200D]/g, '').replace(/[\uD800-\uDFFF]/g, '') : key;
        result[sanitizedKey] = sanitizeUnicodeForJSON(value);
      }
      return result;
    }
  }
  return data;
}

async function fixUnicodeFlows() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📊 Buscando todos os fluxos...');
    const [flows] = await connection.execute('SELECT id, name, flow_data FROM flows');
    
    console.log(`🔍 Encontrados ${flows.length} fluxos para verificar`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const flow of flows) {
      try {
        console.log(`\n🔧 Verificando fluxo ${flow.id}: ${flow.name}`);
        
        if (!flow.flow_data) {
          console.log('⏭️ Pulando - sem flow_data');
          continue;
        }
        
        // Tentar parsear o JSON atual
        let originalData;
        try {
          originalData = JSON.parse(flow.flow_data);
          console.log('✅ JSON válido - verificando Unicode...');
        } catch (parseError) {
          console.log('❌ JSON inválido detectado:', parseError.message);
          
          // Tentar sanitizar e parsear novamente
          const sanitized = sanitizeUnicodeForJSON(flow.flow_data);
          try {
            originalData = JSON.parse(sanitized);
            console.log('🔧 JSON sanitizado com sucesso!');
          } catch (sanitizeError) {
            console.log('❌ Não foi possível corrigir o JSON:', sanitizeError.message);
            errorCount++;
            continue;
          }
        }
        
        // Sanitizar os dados
        const sanitizedData = sanitizeUnicodeForJSON(originalData);
        const sanitizedJson = JSON.stringify(sanitizedData);
        
        // Verificar se houve mudanças
        if (sanitizedJson !== flow.flow_data) {
          console.log('🔧 Aplicando correções Unicode...');
          
          // Backup antes da correção
          await fs.writeFile(
            `backup_flow_${flow.id}_${Date.now()}.json`, 
            flow.flow_data,
            'utf8'
          );
          
          // Atualizar no banco
          await connection.execute(
            'UPDATE flows SET flow_data = ? WHERE id = ?',
            [sanitizedJson, flow.id]
          );
          
          console.log('✅ Fluxo corrigido com sucesso!');
          fixedCount++;
        } else {
          console.log('✅ Nenhuma correção necessária');
        }
        
      } catch (flowError) {
        console.error(`❌ Erro ao processar fluxo ${flow.id}:`, flowError.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 RESUMO DA CORREÇÃO:');
    console.log(`✅ Fluxos corrigidos: ${fixedCount}`);
    console.log(`❌ Fluxos com erro: ${errorCount}`);
    console.log(`📊 Total verificados: ${flows.length}`);
    
    if (fixedCount > 0) {
      console.log('\n💡 Backups criados para os fluxos corrigidos.');
      console.log('💡 Recomendado reiniciar o servidor para aplicar as mudanças.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

// Executar o script
console.log('🚀 INICIANDO CORREÇÃO DE UNICODE EM FLUXOS');
console.log('==========================================');
fixUnicodeFlows().catch(console.error); 
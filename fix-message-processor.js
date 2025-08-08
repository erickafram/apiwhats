#!/usr/bin/env node

/**
 * Script para corrigir o erro "Processador não encontrado para tipo de nó: message"
 * 
 * Executa a migration necessária e verifica se a correção foi aplicada.
 */

const { sequelize } = require('./src/models');
const FlowProcessor = require('./src/services/FlowProcessor');

async function fixMessageProcessor() {
  try {
    console.log('🔧 Corrigindo processador de mensagens...\n');

    // 1. Executar migration para adicionar novos tipos de nós
    console.log('1. Executando migration para tipos de nós...');
    const migration = require('./src/migrations/20250131_add_node_types.js');
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    console.log('   ✅ Migration executada com sucesso!\n');

    // 2. Verificar se os processadores estão funcionando
    console.log('2. Verificando processadores...');
    const processor = new FlowProcessor();
    
    const requiredProcessors = ['message', 'input', 'ai'];
    let allFound = true;
    
    requiredProcessors.forEach(type => {
      if (processor.nodeProcessors[type]) {
        console.log(`   ✅ Processador "${type}" encontrado`);
      } else {
        console.log(`   ❌ Processador "${type}" NÃO encontrado`);
        allFound = false;
      }
    });

    if (allFound) {
      console.log('\n🎉 CORREÇÃO APLICADA COM SUCESSO!');
      console.log('   O sistema agora aceita os seguintes tipos de nós:');
      console.log('   - "message" (alias para fixed_response)');
      console.log('   - "input" (alias para input_capture)');
      console.log('   - "ai" (alias para ai_response)');
      console.log('\n   O erro "Processador não encontrado para tipo de nó: message" foi resolvido!');
    } else {
      console.log('\n❌ Ainda há problemas com os processadores.');
    }

    await sequelize.close();

  } catch (error) {
    console.error('❌ Erro ao aplicar correção:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  fixMessageProcessor();
}

module.exports = fixMessageProcessor;

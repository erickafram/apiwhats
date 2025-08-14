// Teste da lógica de bloqueio de fluxo quando operador está ativo
console.log('=== TESTE DE BLOQUEIO DE FLUXO COM OPERADOR ===\n');

const scenarios = [
  {
    name: '1. Conversa sem operador (status: active)',
    conversation: {
      status: 'active',
      assigned_operator_id: null
    },
    shouldProcessFlow: true
  },
  {
    name: '2. Conversa transferida (status: transferred)',
    conversation: {
      status: 'transferred',
      assigned_operator_id: null
    },
    shouldProcessFlow: false
  },
  {
    name: '3. Conversa ativa com operador atribuído',
    conversation: {
      status: 'active',
      assigned_operator_id: 123
    },
    shouldProcessFlow: false
  },
  {
    name: '4. Conversa completed (operador encerrou)',
    conversation: {
      status: 'completed',
      assigned_operator_id: 123
    },
    shouldProcessFlow: true
  },
  {
    name: '5. Conversa waiting (sem operador)',
    conversation: {
      status: 'waiting',
      assigned_operator_id: null
    },
    shouldProcessFlow: true
  }
];

scenarios.forEach(scenario => {
  console.log(`${scenario.name}:`);
  
  const conversation = scenario.conversation;
  
  // Lógica implementada (copiada dos serviços)
  const hasActiveOperator = conversation.status === 'transferred' || 
                            (conversation.status === 'active' && conversation.assigned_operator_id);
  
  const shouldProcessFlow = !hasActiveOperator;
  
  console.log(`  - Status: ${conversation.status}`);
  console.log(`  - Operador ID: ${conversation.assigned_operator_id || 'nenhum'}`);
  console.log(`  - Tem operador ativo: ${hasActiveOperator ? 'Sim' : 'Não'}`);
  console.log(`  - Deve processar fluxo: ${shouldProcessFlow ? 'Sim' : 'Não'}`);
  console.log(`  - Esperado: ${scenario.shouldProcessFlow ? 'Sim' : 'Não'}`);
  console.log(`  - ✅ Resultado: ${shouldProcessFlow === scenario.shouldProcessFlow ? 'CORRETO' : '❌ ERRO'}`);
  console.log('');
});

console.log('=== RESUMO DO COMPORTAMENTO ===\n');
console.log('✅ Bot NÃO processa fluxo quando:');
console.log('   - Status = "transferred" (aguardando operador)');
console.log('   - Status = "active" E assigned_operator_id existe (operador atendendo)');
console.log('');
console.log('✅ Bot PROCESSA fluxo quando:');
console.log('   - Status = "active" sem operador (bot livre)');
console.log('   - Status = "completed" (conversa encerrada)');
console.log('   - Status = "waiting" (bot aguardando resposta)');
console.log('');
console.log('=== TESTE CONCLUÍDO ===');

// Script para testar a lógica de operadores
console.log('=== TESTE DE LÓGICA DE OPERADORES ===\n');

// Simular cenários
const scenarios = [
  {
    name: '1. Primeira atribuição de operador',
    conversation: {
      metadata: {
        assignment_history: [],
        operator_assigned_at: null
      },
      assigned_operator_id: null
    },
    expectWelcome: true
  },
  {
    name: '2. Operador reassumindo sua própria conversa',
    conversation: {
      metadata: {
        assignment_history: [
          { operator_id: 1, action: 'assumed' }
        ],
        operator_assigned_at: new Date('2024-01-01')
      },
      assigned_operator_id: 1
    },
    expectWelcome: false
  },
  {
    name: '3. Conversa que já teve operador antes',
    conversation: {
      metadata: {
        assignment_history: [
          { operator_id: 1, action: 'assumed' },
          { operator_id: 2, action: 'transferred_by_operator' }
        ],
        operator_assigned_at: new Date('2024-01-01')
      },
      assigned_operator_id: 2
    },
    expectWelcome: false
  },
  {
    name: '4. Nova conversa nunca atendida',
    conversation: {
      metadata: {},
      assigned_operator_id: null
    },
    expectWelcome: true
  }
];

scenarios.forEach(scenario => {
  console.log(`${scenario.name}:`);
  
  const conversation = scenario.conversation;
  
  // Lógica do backend (copiada)
  const hadPreviousOperator = (conversation.metadata?.assignment_history?.length > 0) || 
                              (conversation.metadata?.operator_assigned_at && conversation.assigned_operator_id);
  
  const shouldSendWelcome = !hadPreviousOperator;
  
  console.log(`  - Histórico de atribuições: ${conversation.metadata?.assignment_history?.length || 0}`);
  console.log(`  - Teve operador antes: ${hadPreviousOperator ? 'Sim' : 'Não'}`);
  console.log(`  - Deve enviar boas-vindas: ${shouldSendWelcome ? 'Sim' : 'Não'}`);
  console.log(`  - Esperado: ${scenario.expectWelcome ? 'Sim' : 'Não'}`);
  console.log(`  - ✅ Resultado: ${shouldSendWelcome === scenario.expectWelcome ? 'CORRETO' : '❌ ERRO'}`);
  console.log('');
});

console.log('=== MENSAGENS DE TRANSFERÊNCIA ===\n');
console.log('✅ Quando transferir: "Conversa transferida para operador [nome]."');
console.log('✅ Boas-vindas do novo operador: "Olá! Meu nome é [nome] e agora vou continuar nossa conversa."');
console.log('\n=== TESTE CONCLUÍDO ===');

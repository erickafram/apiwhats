#!/usr/bin/env node

/**
 * 🔧 DEBUG: Teste de Conversão de Fluxos
 * 
 * Este script simula a conversão de um fluxo complexo para blocos visuais
 * Execute: node debug-flow-conversion.js
 */

const chalk = require('chalk');

// Simular um fluxo que causa duplicação (como o fluxo de viação)
const complexFlow = {
  nodes: [
    {
      id: "start",
      type: "start",
      position: { x: 100, y: 100 },
      next: "menu_principal"
    },
    {
      id: "menu_principal",
      type: "message",
      position: { x: 100, y: 200 },
      content: "🚌 *VIAÇÃO EXPRESSA*\n\nO que você deseja?\n\n1️⃣ 🎫 Comprar Passagem\n2️⃣ 🕐 Consultar Horários\n3️⃣ ☎️ Falar com Operador",
      next: "menu_principal_input"
    },
    {
      id: "menu_principal_input",
      type: "input",
      position: { x: 100, y: 250 },
      variable: "opcao_principal",
      next: "menu_principal_condition"
    },
    {
      id: "menu_principal_condition",
      type: "condition",
      position: { x: 100, y: 300 },
      conditions: [
        { variable: "opcao_principal", operator: "equals", value: "1", next: "compra_destino" },
        { variable: "opcao_principal", operator: "equals", value: "2", next: "consulta_horarios" },
        { variable: "opcao_principal", operator: "equals", value: "3", next: "operador" }
      ],
      fallback: "opcao_invalida"
    },
    {
      id: "compra_destino",
      type: "message",
      position: { x: 300, y: 350 },
      content: "🗺️ *COMPRA DE PASSAGEM*\n\n📍 *Origem fixa:* Palmas (TO)\n📍 *Escolha o destino:*\n\n1️⃣ Goiânia (GO) *Duração: 8h*\n2️⃣ Brasília (DF) *Duração: 10h*",
      next: "compra_destino_input"
    },
    {
      id: "compra_destino_input",
      type: "input",
      position: { x: 300, y: 400 },
      variable: "destino_escolhido",
      next: "compra_destino_condition"
    },
    {
      id: "compra_destino_condition",
      type: "condition",
      position: { x: 300, y: 450 },
      conditions: [
        { variable: "destino_escolhido", operator: "equals", value: "1", next: "horarios_goiania" },
        { variable: "destino_escolhido", operator: "equals", value: "2", next: "horarios_brasilia" }
      ],
      fallback: "compra_destino"
    },
    {
      id: "horarios_goiania",
      type: "message",
      position: { x: 500, y: 500 },
      content: "🕐 *HORÁRIOS DISPONÍVEIS*\n\n🚌 Rota: Palmas ➜ Goiânia\n\n1️⃣ EXECUTIVO - 06:00 (R$ 85)\n2️⃣ CONVENCIONAL - 14:00 (R$ 65)",
      next: "horarios_goiania_input"
    },
    {
      id: "horarios_goiania_input",
      type: "input",
      position: { x: 500, y: 550 },
      variable: "horario_escolhido",
      next: "confirmar_reserva"
    },
    {
      id: "confirmar_reserva",
      type: "message",
      position: { x: 500, y: 600 },
      content: "✅ *Confirma a reserva?*\n\nRota: Palmas ➜ Goiânia\nHorário: #${horario_escolhido}\n\n*Responda:* SIM para confirmar",
      next: "confirmar_reserva_input"
    },
    {
      id: "confirmar_reserva_input",
      type: "input",
      position: { x: 500, y: 650 },
      variable: "confirmacao",
      next: "confirmar_reserva_condition"
    },
    {
      id: "confirmar_reserva_condition",
      type: "condition",
      position: { x: 500, y: 700 },
      conditions: [
        { variable: "confirmacao", operator: "contains", value: "sim", next: "reserva_confirmada" }
      ],
      fallback: "reserva_cancelada"
    },
    {
      id: "reserva_confirmada",
      type: "message",
      position: { x: 700, y: 750 },
      content: "🎉 *Reserva feita!*\n\n👨‍💼 Vou te conectar com um operador agora para *gerar o QR Code de pagamento*",
      next: "operador"
    },
    {
      id: "reserva_cancelada",
      type: "message",
      position: { x: 300, y: 750 },
      content: "❌ *Compra cancelada.*\n\n1️⃣ Voltar ao menu\n2️⃣ Consultar horários\n3️⃣ Falar com operador\n\n*Digite a opção:*",
      next: "pos_cancelamento_input"
    },
    {
      id: "pos_cancelamento_input",
      type: "input",
      position: { x: 300, y: 800 },
      variable: "pos_cancelamento",
      next: "menu_principal"
    },
    {
      id: "consulta_horarios",
      type: "message",
      position: { x: 100, y: 600 },
      content: "🕐 *HORÁRIOS PALMAS ➜ GOIÂNIA*\n\n06:00 (Executivo) • 09:00 (Convencional) • 14:00 (Executivo) • 22:00 (Leito)",
      next: "consulta_horarios_input"
    },
    {
      id: "consulta_horarios_input",
      type: "input",
      position: { x: 100, y: 650 },
      variable: "apos_horarios",
      next: "menu_principal"
    },
    {
      id: "operador",
      type: "message",
      position: { x: 800, y: 400 },
      content: "👨‍💼 *Conectando você ao operador…*\n\nEle poderá *gerar o QR Code* e finalizar sua compra.",
      next: "end"
    },
    {
      id: "opcao_invalida",
      type: "message",
      position: { x: 100, y: 900 },
      content: "❌ *Opção inválida!*\n\n1 = Comprar Passagem\n2 = Consultar Horários\n3 = Falar com Operador\n\n*Voltando ao menu...*",
      next: "menu_principal"
    },
    {
      id: "end",
      type: "message",
      position: { x: 100, y: 1000 },
      content: "Obrigado por usar nossos serviços!",
      next: null
    }
  ]
};

// Função de conversão (copiada do FlowBuilder com melhorias)
function convertFlowNodesToBlocks(nodes) {
  const blocks = [];
  const processedNodes = new Set(); // Evitar processar o mesmo nó duas vezes
  
  console.log(chalk.gray(`🔧 Iniciando conversão de ${nodes.length} nós para blocos visuais`));
  
  // Analisar o fluxo para identificar padrões de interação
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    
    // Pular nós já processados
    if (processedNodes.has(node.id)) continue;
    
    // Pular nós que não são relevantes para blocos visuais
    if (node.type === 'start' || node.type === 'end') {
      processedNodes.add(node.id);
      continue;
    }
    
    // Pular nós auxiliares que fazem parte de outros blocos
    if (node.id.includes('_input') || node.id.includes('_condition') || node.id.includes('_transfer')) {
      processedNodes.add(node.id);
      continue;
    }
    
    let block = {
      id: `block_${blocks.length}`,
      position: blocks.length
    };
    
    switch (node.type) {
      case 'message':
        // Verificar se é uma mensagem seguida de input (pergunta)
        const hasInputAfter = nodes.some(n => 
          n.id === `${node.id}_input` || 
          (node.next && node.next.includes('input'))
        );
        
        // Verificar se contém opções numeradas (menu)
        const hasMenuOptions = node.content && 
          (/[1-9]️⃣|1\.|2\.|3\.|4\.|5\./.test(node.content) || 
           /opção|escolha|digite/i.test(node.content));
        
        if (hasInputAfter && !hasMenuOptions) {
          // É uma pergunta que captura informação
          block.type = 'question';
          block.content = node.content || '';
          block.variable = node.next ? node.next.replace('_input', '') : 'user_response';
        } else if (hasMenuOptions) {
          // É um menu de opções
          block.type = 'menu';
          block.content = node.content || '';
          
          // Extrair opções do texto
          const optionMatches = node.content.match(/([1-9]️⃣|[1-9]\.)\s*([^\n]+)/g) || [];
          block.options = optionMatches.map((match, idx) => ({
            id: (idx + 1).toString(),
            text: match.replace(/^[1-9]️⃣|^[1-9]\./, '').trim()
          }));
          
          if (block.options.length === 0) {
            // Se não conseguiu extrair, criar opções padrão
            block.options = [
              { id: '1', text: 'Opção 1' },
              { id: '2', text: 'Opção 2' }
            ];
          }
        } else {
          // Mensagem simples
          block.type = 'message';
          block.content = node.content || '';
        }
        break;
        
      case 'ai_response':
        block.type = 'ai_response';
        block.content = 'Resposta gerada por IA';
        block.prompt = node.data?.system_prompt || 'Você é um assistente prestativo.';
        break;
        
      case 'action':
        if (node.action === 'transfer_to_human') {
          block.type = 'human_transfer';
          block.content = node.content || 'Transferindo para atendente...';
        } else {
          block.type = 'message';
          block.content = node.content || `Ação: ${node.action}`;
        }
        break;
        
      default:
        block.type = 'message';
        block.content = node.content || `Nó ${node.type}`;
    }
    
    blocks.push(block);
  }
  
  return blocks;
}

console.log(chalk.cyan.bold('\n🔧 TESTE DE CONVERSÃO DE FLUXOS\n'));

console.log(chalk.blue('📊 Fluxo Original:'));
console.log(`   ${complexFlow.nodes.length} nós`);
console.log(`   Tipos: ${[...new Set(complexFlow.nodes.map(n => n.type))].join(', ')}`);

console.log(chalk.yellow('\n🔄 Convertendo para blocos visuais...'));

const convertedBlocks = convertFlowNodesToBlocks(complexFlow.nodes);

console.log(chalk.green('\n✅ Blocos Convertidos:'));
convertedBlocks.forEach((block, i) => {
  console.log(chalk.gray(`   ${i + 1}. `), chalk.cyan(block.type.toUpperCase()));
  console.log(chalk.gray(`      Conteúdo: `), block.content.substring(0, 50) + '...');
  
  if (block.type === 'question') {
    console.log(chalk.gray(`      Variável: `), chalk.yellow(block.variable));
  }
  
  if (block.type === 'menu' && block.options) {
    console.log(chalk.gray(`      Opções: `), block.options.map(o => o.text).join(', '));
  }
  
  if (block.type === 'ai_response') {
    console.log(chalk.gray(`      Prompt: `), block.prompt.substring(0, 30) + '...');
  }
  
  console.log('');
});

console.log(chalk.magenta.bold('🎯 ANÁLISE:'));

const types = convertedBlocks.reduce((acc, block) => {
  acc[block.type] = (acc[block.type] || 0) + 1;
  return acc;
}, {});

Object.entries(types).forEach(([type, count]) => {
  const emoji = {
    'message': '💬',
    'question': '❓', 
    'menu': '📋',
    'ai_response': '🤖',
    'human_transfer': '👨‍💼'
  }[type] || '🔹';
  
  console.log(`   ${emoji} ${type}: ${count} blocos`);
});

const hasInteractions = convertedBlocks.some(b => b.type === 'question' || b.type === 'menu');

console.log(chalk.green.bold('\n🎉 RESULTADO:'));
if (hasInteractions) {
  console.log('   ✅ Fluxo TEM interações (pausas para usuário)');
  console.log('   ✅ Conversão detectou perguntas e menus');
} else {
  console.log('   ❌ Fluxo NÃO tem interações (enviará tudo de uma vez)');
  console.log('   ⚠️  Conversão pode ter perdido padrões de interação');
}

console.log(chalk.gray('\n💡 Use este teste para verificar se a conversão está funcionando corretamente\n'));

process.exit(0); 
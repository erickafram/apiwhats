const { Flow, Bot } = require('./src/models');

// Fluxo otimizado para venda de passagens de ônibus
const optimizedBusFlow = {
  name: "Venda Rápida de Passagens",
  description: "Fluxo super otimizado para venda rápida de passagens de ônibus - resposta em segundos",
  trigger_keywords: ["passagem", "viagem", "ônibus", "onibus", "goiania", "goiânia", "brasilia", "brasília", "sao paulo", "são paulo", "rio de janeiro", "bh", "belo horizonte"],
  is_active: true,
  is_default: false,
  priority: 100, // Prioridade máxima
  flow_data: {
    nodes: [
      {
        id: "start",
        type: "start",
        position: { x: 100, y: 100 },
        data: { label: "Início" }
      },
      {
        id: "quick_check",
        type: "message",
        position: { x: 100, y: 200 },
        data: {
          label: "Verificação Rápida",
          content: "🚌 *PASSAGENS DISPONÍVEIS*\n\nPara qual cidade você precisa?\n\n✅ *DESTINOS COM PASSAGENS:*\n• Goiânia - R$ 65,00\n• Brasília - R$ 85,00\n• São Paulo - R$ 120,00\n• Rio de Janeiro - R$ 150,00\n• Belo Horizonte - R$ 95,00\n\n❌ *SEM PASSAGENS:* Outras cidades\n\nDigite o nome da cidade:"
        }
      },
      {
        id: "get_destination",
        type: "input",
        position: { x: 100, y: 300 },
        data: {
          label: "Capturar Destino",
          variable: "destination",
          validation: { type: "required" },
          errorMessage: "Digite o destino desejado."
        }
      },
      {
        id: "check_availability",
        type: "condition",
        position: { x: 100, y: 400 },
        data: {
          label: "Verificar Disponibilidade",
          conditions: [
            {
              variable: "destination",
              operator: "contains_any",
              value: ["goiania", "goiânia"],
              next: "goiania_options"
            },
            {
              variable: "destination", 
              operator: "contains_any",
              value: ["brasilia", "brasília"],
              next: "brasilia_options"
            },
            {
              variable: "destination",
              operator: "contains_any", 
              value: ["sao paulo", "são paulo", "sp"],
              next: "saopaulo_options"
            },
            {
              variable: "destination",
              operator: "contains_any",
              value: ["rio de janeiro", "rio", "rj"],
              next: "rio_options"
            },
            {
              variable: "destination",
              operator: "contains_any",
              value: ["belo horizonte", "bh"],
              next: "bh_options"
            }
          ],
          defaultNext: "no_service"
        }
      },
      {
        id: "no_service",
        type: "message",
        position: { x: 400, y: 400 },
        data: {
          label: "Sem Atendimento",
          content: "😔 *SEM PASSAGENS*\n\nInfelizmente não atendemos este destino.\n\n✅ *CIDADES ATENDIDAS:*\n• Goiânia\n• Brasília\n• São Paulo\n• Rio de Janeiro\n• Belo Horizonte\n\nPrecisa de passagem para alguma dessas cidades?"
        }
      },
      {
        id: "goiania_options",
        type: "message",
        position: { x: 100, y: 500 },
        data: {
          label: "Opções Goiânia",
          content: "🎫 *GOIÂNIA - HOJE*\n\n1️⃣ 08:00 - R$ 65,00 (Convencional)\n2️⃣ 14:00 - R$ 75,00 (Executivo)\n3️⃣ 22:00 - R$ 85,00 (Leito)\n\n⚡ *COMPRA RÁPIDA:* Digite o número\n\n📞 *FALAR COM VENDEDOR:* Digite 0"
        }
      },
      {
        id: "brasilia_options", 
        type: "message",
        position: { x: 200, y: 500 },
        data: {
          label: "Opções Brasília",
          content: "🎫 *BRASÍLIA - HOJE*\n\n1️⃣ 07:00 - R$ 85,00 (Convencional)\n2️⃣ 13:00 - R$ 95,00 (Executivo)\n3️⃣ 21:00 - R$ 110,00 (Leito)\n\n⚡ *COMPRA RÁPIDA:* Digite o número\n\n📞 *FALAR COM VENDEDOR:* Digite 0"
        }
      },
      {
        id: "saopaulo_options",
        type: "message", 
        position: { x: 300, y: 500 },
        data: {
          label: "Opções São Paulo",
          content: "🎫 *SÃO PAULO - HOJE*\n\n1️⃣ 06:00 - R$ 120,00 (Convencional)\n2️⃣ 12:00 - R$ 140,00 (Executivo)\n3️⃣ 20:00 - R$ 160,00 (Leito)\n\n⚡ *COMPRA RÁPIDA:* Digite o número\n\n📞 *FALAR COM VENDEDOR:* Digite 0"
        }
      },
      {
        id: "rio_options",
        type: "message",
        position: { x: 400, y: 500 },
        data: {
          label: "Opções Rio de Janeiro", 
          content: "🎫 *RIO DE JANEIRO - HOJE*\n\n1️⃣ 05:00 - R$ 150,00 (Convencional)\n2️⃣ 11:00 - R$ 170,00 (Executivo)\n3️⃣ 19:00 - R$ 190,00 (Leito)\n\n⚡ *COMPRA RÁPIDA:* Digite o número\n\n📞 *FALAR COM VENDEDOR:* Digite 0"
        }
      },
      {
        id: "bh_options",
        type: "message",
        position: { x: 500, y: 500 },
        data: {
          label: "Opções Belo Horizonte",
          content: "🎫 *BELO HORIZONTE - HOJE*\n\n1️⃣ 09:00 - R$ 95,00 (Convencional)\n2️⃣ 15:00 - R$ 110,00 (Executivo)\n3️⃣ 23:00 - R$ 125,00 (Leito)\n\n⚡ *COMPRA RÁPIDA:* Digite o número\n\n📞 *FALAR COM VENDEDOR:* Digite 0"
        }
      },
      {
        id: "get_option",
        type: "input",
        position: { x: 300, y: 600 },
        data: {
          label: "Capturar Opção",
          variable: "selected_option",
          validation: { type: "required" }
        }
      },
      {
        id: "process_selection",
        type: "condition",
        position: { x: 300, y: 700 },
        data: {
          label: "Processar Seleção",
          conditions: [
            {
              variable: "selected_option",
              operator: "equals",
              value: "0",
              next: "transfer_to_human"
            },
            {
              variable: "selected_option", 
              operator: "contains_any",
              value: ["1", "2", "3"],
              next: "quick_purchase"
            }
          ],
          defaultNext: "invalid_option"
        }
      },
      {
        id: "invalid_option",
        type: "message",
        position: { x: 500, y: 700 },
        data: {
          label: "Opção Inválida",
          content: "❌ Opção inválida!\n\nDigite:\n• 1, 2 ou 3 para comprar\n• 0 para falar com vendedor"
        }
      },
      {
        id: "quick_purchase",
        type: "message",
        position: { x: 300, y: 800 },
        data: {
          label: "Compra Rápida",
          content: "✅ *RESERVA CONFIRMADA!*\n\nDestino: {{destination}}\nOpção: {{selected_option}}\n\n🎫 Sua passagem foi reservada por 15 minutos!\n\n📱 *PRÓXIMOS PASSOS:*\n1. Nosso vendedor entrará em contato\n2. Confirme seus dados\n3. Realize o pagamento\n\n⏰ Aguarde o contato..."
        }
      },
      {
        id: "transfer_to_human",
        type: "action",
        position: { x: 100, y: 800 },
        data: {
          label: "Transferir para Vendedor",
          action: "transfer_to_human",
          department: "vendas",
          message: "Cliente solicitou atendimento humano para compra de passagem"
        }
      }
    ],
    edges: [
      { id: "e1", source: "start", target: "quick_check" },
      { id: "e2", source: "quick_check", target: "get_destination" },
      { id: "e3", source: "get_destination", target: "check_availability" },
      { id: "e4", source: "check_availability", target: "goiania_options" },
      { id: "e5", source: "check_availability", target: "brasilia_options" },
      { id: "e6", source: "check_availability", target: "saopaulo_options" },
      { id: "e7", source: "check_availability", target: "rio_options" },
      { id: "e8", source: "check_availability", target: "bh_options" },
      { id: "e9", source: "check_availability", target: "no_service" },
      { id: "e10", source: "goiania_options", target: "get_option" },
      { id: "e11", source: "brasilia_options", target: "get_option" },
      { id: "e12", source: "saopaulo_options", target: "get_option" },
      { id: "e13", source: "rio_options", target: "get_option" },
      { id: "e14", source: "bh_options", target: "get_option" },
      { id: "e15", source: "no_service", target: "get_destination" },
      { id: "e16", source: "get_option", target: "process_selection" },
      { id: "e17", source: "process_selection", target: "quick_purchase" },
      { id: "e18", source: "process_selection", target: "transfer_to_human" },
      { id: "e19", source: "process_selection", target: "invalid_option" },
      { id: "e20", source: "invalid_option", target: "get_option" },
      { id: "e21", source: "quick_purchase", target: "transfer_to_human" }
    ],
    viewport: { x: 0, y: 0, zoom: 1 }
  }
};

async function createOptimizedBusFlow() {
  try {
    console.log('🚌 Criando fluxo otimizado de venda de passagens...');
    
    // Buscar o primeiro bot disponível
    const bot = await Bot.findOne();
    if (!bot) {
      console.error('❌ Nenhum bot encontrado. Crie um bot primeiro.');
      return;
    }

    console.log(`✅ Bot encontrado: ${bot.name} (ID: ${bot.id})`);

    // Criar o fluxo
    const flow = await Flow.create({
      ...optimizedBusFlow,
      bot_id: bot.id
    });

    console.log(`✅ Fluxo criado com sucesso!`);
    console.log(`   ID: ${flow.id}`);
    console.log(`   Nome: ${flow.name}`);
    console.log(`   Palavras-chave: ${flow.trigger_keywords.join(', ')}`);
    console.log(`   Nós: ${flow.flow_data.nodes.length}`);
    console.log(`   Conexões: ${flow.flow_data.edges.length}`);
    
    console.log('\n🎯 CARACTERÍSTICAS DO FLUXO:');
    console.log('   • Resposta imediata sobre disponibilidade');
    console.log('   • Mostra preços e horários na primeira mensagem');
    console.log('   • Compra em 3 cliques máximo');
    console.log('   • Transferência automática para vendedor');
    console.log('   • Otimizado para conversão rápida');

  } catch (error) {
    console.error('❌ Erro ao criar fluxo:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createOptimizedBusFlow().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Erro:', error);
    process.exit(1);
  });
}

module.exports = { createOptimizedBusFlow, optimizedBusFlow };

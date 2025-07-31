const { Flow } = require('./src/models');

async function testFlowParsing() {
  try {
    console.log('🧪 TESTE DE PARSING DE FLUXOS');
    console.log('=============================');
    
    // Buscar todos os fluxos ativos
    const flows = await Flow.findAll({
      where: { is_active: true },
      order: [['updated_at', 'DESC']]
    });
    
    console.log(`📋 ${flows.length} fluxos ativos encontrados\n`);
    
    for (const flow of flows) {
      console.log(`🔍 Testando fluxo: ${flow.name} (ID: ${flow.id})`);
      console.log(`📅 Atualizado: ${flow.updated_at}`);
      
      // Testar parsing do flow_data
      let flowData;
      let parseSuccess = false;
      
      try {
        if (typeof flow.flow_data === 'string') {
          flowData = JSON.parse(flow.flow_data);
          parseSuccess = true;
          console.log('✅ Parse JSON bem-sucedido');
        } else {
          flowData = flow.flow_data;
          parseSuccess = true;
          console.log('✅ Dados já são objeto');
        }
      } catch (error) {
        console.log('❌ Erro no parse JSON:', error.message);
        continue;
      }
      
      if (parseSuccess) {
        // Verificar estrutura
        console.log('📊 Estrutura do fluxo:');
        
        if (Array.isArray(flowData.nodes)) {
          console.log(`  - Estrutura: ANTIGA (array)`);
          console.log(`  - Nós: ${flowData.nodes.length}`);
          
          // Verificar nó inicial
          const startNode = flowData.nodes.find(n => n.id === 'start' || n.type === 'start');
          console.log(`  - Nó inicial: ${startNode ? '✅ Encontrado' : '❌ Não encontrado'}`);
          
          if (startNode) {
            console.log(`    - Tipo: ${startNode.type || 'N/A'}`);
            console.log(`    - Próximo: ${startNode.next || 'N/A'}`);
          }
          
        } else if (typeof flowData.nodes === 'object' && flowData.nodes !== null) {
          console.log(`  - Estrutura: NOVA (objeto)`);
          const nodeArray = Object.values(flowData.nodes);
          console.log(`  - Nós: ${nodeArray.length}`);
          console.log(`  - Conexões: ${(flowData.edges || []).length}`);
          
          // Verificar nó inicial
          const startNode = nodeArray.find(n => 
            n.id === 'start' || 
            n.type === 'start' || 
            n.data?.type === 'start'
          );
          console.log(`  - Nó inicial: ${startNode ? '✅ Encontrado' : '❌ Não encontrado'}`);
          
          if (startNode) {
            console.log(`    - ID: ${startNode.id}`);
            console.log(`    - Tipo: ${startNode.type || startNode.data?.type || 'N/A'}`);
            console.log(`    - Label: ${startNode.data?.label || 'N/A'}`);
          }
          
          // Listar alguns nós
          console.log('  - Primeiros nós:');
          nodeArray.slice(0, 3).forEach(node => {
            console.log(`    * ${node.id}: ${node.data?.label || node.type || 'Sem label'}`);
          });
          
        } else {
          console.log('  - ❌ Estrutura inválida: nodes não é array nem objeto');
        }
      }
      
      console.log(''); // Linha em branco
    }
    
    console.log('✅ Teste de parsing concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    process.exit(0);
  }
}

// Executar teste
testFlowParsing();

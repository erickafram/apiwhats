const { Flow } = require('./src/models');
const fs = require('fs');

async function verificarECorrigirFluxo() {
  try {
    console.log('🔍 Verificando fluxo ID 5 no banco...');
    
    // Buscar fluxo atual no banco
    const flow = await Flow.findByPk(5);
    
    if (!flow) {
      console.log('❌ Fluxo ID 5 não encontrado no banco');
      return;
    }
    
    console.log('✅ Fluxo encontrado:', flow.name);
    console.log('📋 Dados atuais do fluxo:', JSON.stringify(flow.flow_data, null, 2));
    
    // Carregar fluxo correto do arquivo JSON
    const fluxoCorreto = JSON.parse(fs.readFileSync('./fluxo-passagens-onibus.json', 'utf8'));
    
    console.log('\n🔧 Verificando nó menu_input...');
    
    // Buscar nó menu_input no banco
    const menuInputBanco = flow.flow_data.nodes.find(n => n.id === 'menu_input');
    console.log('🏦 Nó menu_input no banco:', menuInputBanco);
    
    // Buscar nó menu_input no arquivo
    const menuInputArquivo = fluxoCorreto.nodes.find(n => n.id === 'menu_input');
    console.log('📄 Nó menu_input no arquivo:', menuInputArquivo);
    
    // Verificar se precisamos atualizar
    if (!menuInputBanco.variable && menuInputArquivo.variable) {
      console.log('\n🚨 PROBLEMA ENCONTRADO: Nó menu_input sem propriedade variable!');
      console.log('🔧 Corrigindo fluxo...');
      
      // Atualizar o nó no banco
      const nodesAtualizados = flow.flow_data.nodes.map(node => {
        if (node.id === 'menu_input') {
          return {
            ...node,
            variable: 'opcao_menu'
          };
        }
        return node;
      });
      
      // Atualizar o fluxo completo
      await flow.update({
        flow_data: {
          ...flow.flow_data,
          nodes: nodesAtualizados
        }
      });
      
      console.log('✅ Fluxo corrigido com sucesso!');
      console.log('📋 Propriedade variable adicionada ao nó menu_input');
      
    } else {
      console.log('✅ Nó menu_input já tem a propriedade variable configurada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar o script
verificarECorrigirFluxo();

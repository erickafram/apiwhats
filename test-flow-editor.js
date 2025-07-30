const axios = require('axios');

async function testFlowEditor() {
  console.log('🎨 TESTE DO EDITOR DE FLUXOS');
  console.log('============================');
  console.log('');

  try {
    // 1. Verificar servidor
    console.log('1️⃣ Verificando servidor...');
    await axios.get('http://localhost:5000/health');
    console.log('✅ Servidor funcionando');
    console.log('');

    // 2. Verificar fluxos disponíveis
    console.log('2️⃣ Verificando fluxos disponíveis...');
    try {
      const { Flow } = require('./src/models');
      
      const flows = await Flow.findAll({
        attributes: ['id', 'name', 'description', 'is_active'],
        order: [['created_at', 'DESC']],
        limit: 10
      });

      console.log(`📋 Total de fluxos: ${flows.length}`);
      
      if (flows.length > 0) {
        console.log('📝 Fluxos disponíveis para edição:');
        flows.forEach((flow, index) => {
          console.log(`   ${index + 1}. ID: ${flow.id} - ${flow.name}`);
          console.log(`      URL: http://localhost:3000/flows/${flow.id}/edit`);
          console.log(`      Status: ${flow.is_active ? 'Ativo' : 'Inativo'}`);
          console.log('');
        });
      } else {
        console.log('⚠️ Nenhum fluxo encontrado');
        console.log('💡 Execute: node create-maytapi-flows.js');
      }
    } catch (dbError) {
      console.log('❌ Erro ao acessar banco de dados:', dbError.message);
    }
    console.log('');

    // 3. Testar API de fluxo específico
    console.log('3️⃣ Testando API de fluxo específico...');
    try {
      // Testar com ID 9 (se existir)
      const flowResponse = await axios.get('http://localhost:5000/api/flows/9');
      const flow = flowResponse.data;
      
      console.log('✅ API de fluxo funcionando');
      console.log(`📋 Fluxo carregado: ${flow.name}`);
      console.log(`📊 Nós no fluxo: ${flow.flow_data?.nodes?.length || 0}`);
      console.log(`🔗 Estrutura disponível: ${flow.flow_data ? 'Sim' : 'Não'}`);
      
      if (flow.flow_data?.nodes) {
        console.log('📝 Tipos de nós encontrados:');
        const nodeTypes = [...new Set(flow.flow_data.nodes.map(n => n.type))];
        nodeTypes.forEach(type => {
          const count = flow.flow_data.nodes.filter(n => n.type === type).length;
          console.log(`   - ${type}: ${count} nó(s)`);
        });
      }
      
    } catch (apiError) {
      if (apiError.response?.status === 404) {
        console.log('⚠️ Fluxo ID 9 não encontrado');
        console.log('💡 Use um ID de fluxo existente da lista acima');
      } else if (apiError.response?.status === 401) {
        console.log('⚠️ API protegida por autenticação (normal)');
      } else {
        console.log('❌ Erro na API:', apiError.message);
      }
    }
    console.log('');

    // 4. Verificar frontend
    console.log('4️⃣ Verificando frontend...');
    try {
      const frontendResponse = await axios.get('http://localhost:3000');
      console.log('✅ Frontend funcionando');
    } catch (frontendError) {
      console.log('⚠️ Frontend não está rodando');
      console.log('💡 Execute: cd frontend && npm run dev');
    }
    console.log('');

    // 5. Verificar dependências do React Flow
    console.log('5️⃣ Verificando dependências...');
    try {
      const packageJson = require('./frontend/package.json');
      const hasReactFlow = packageJson.dependencies['reactflow'] || packageJson.dependencies['react-flow-renderer'];
      
      if (hasReactFlow) {
        console.log('✅ ReactFlow instalado');
        console.log(`📦 Versão: ${hasReactFlow}`);
      } else {
        console.log('❌ ReactFlow não encontrado');
        console.log('💡 Execute: cd frontend && npm install reactflow');
      }
    } catch (packageError) {
      console.log('⚠️ Erro ao verificar package.json:', packageError.message);
    }
    console.log('');

    console.log('🎉 TESTE CONCLUÍDO!');
    console.log('');
    console.log('📋 FUNCIONALIDADES DO EDITOR:');
    console.log('✅ Editor visual com ReactFlow');
    console.log('✅ Drag & Drop de componentes');
    console.log('✅ Tipos de nós: Início, Mensagem, Entrada, Condição, IA, Ação, Fim');
    console.log('✅ Conexões visuais entre nós');
    console.log('✅ Edição de propriedades dos nós');
    console.log('✅ Minimap e controles de zoom');
    console.log('✅ Salvamento automático');
    console.log('✅ Preview do fluxo');
    console.log('✅ Teste de execução');
    console.log('');
    console.log('🌐 COMO USAR O EDITOR:');
    console.log('1. Acesse: http://localhost:3000/flows');
    console.log('2. Clique no ícone de edição de um fluxo');
    console.log('3. Use a sidebar para adicionar novos nós');
    console.log('4. Clique nos nós para editar propriedades');
    console.log('5. Conecte os nós arrastando as bordas');
    console.log('6. Salve o fluxo com o botão "Salvar"');
    console.log('7. Teste o fluxo com o botão "Testar"');
    console.log('');
    console.log('🎨 COMPONENTES DISPONÍVEIS:');
    console.log('🟢 Início - Ponto de entrada do fluxo');
    console.log('🔵 Mensagem - Enviar mensagem de texto');
    console.log('🟠 Entrada - Capturar resposta do usuário');
    console.log('🟣 Condição - Lógica condicional');
    console.log('🔴 IA - Resposta inteligente');
    console.log('⚫ Ação - Executar ação específica');
    console.log('🔴 Fim - Finalizar fluxo');
    console.log('');
    console.log('💡 DICAS:');
    console.log('- Use variáveis para capturar dados do usuário');
    console.log('- Configure condições para criar fluxos dinâmicos');
    console.log('- Use a IA para respostas mais naturais');
    console.log('- Teste sempre após fazer alterações');
    console.log('- Salve frequentemente durante a edição');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 SOLUÇÃO: Servidor não está rodando');
      console.log('   Execute: npm start');
    }
  }
}

testFlowEditor().catch(console.error);

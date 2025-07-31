const { Conversation, Message, Flow } = require('./src/models');

async function clearFlowCache() {
  try {
    console.log('🧹 Iniciando limpeza completa de cache...');
    
    // 1. Deletar TODAS as conversas ativas
    const deletedConversations = await Conversation.destroy({
      where: {},
      force: true
    });
    console.log(`✅ ${deletedConversations} conversas deletadas`);
    
    // 2. Limpar mensagens antigas (últimas 2 horas)
    const deletedMessages = await Message.destroy({
      where: {
        created_at: {
          [require('sequelize').Op.lt]: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`✅ ${deletedMessages} mensagens antigas deletadas`);
    
    // 3. Verificar fluxos ativos
    const activeFlows = await Flow.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'updated_at']
    });
    
    console.log('📋 Fluxos ativos encontrados:');
    activeFlows.forEach(flow => {
      console.log(`  - ID: ${flow.id}, Nome: ${flow.name}, Atualizado: ${flow.updated_at}`);
    });
    
    // 4. Verificar estrutura do fluxo mais recente
    const latestFlow = await Flow.findOne({
      where: { is_active: true },
      order: [['updated_at', 'DESC']]
    });
    
    if (latestFlow && latestFlow.flow_data) {
      try {
        const flowData = JSON.parse(latestFlow.flow_data);
        console.log('🔍 Estrutura do fluxo mais recente:');
        console.log(`  - Nós: ${Object.keys(flowData.nodes || {}).length}`);
        console.log(`  - Conexões: ${(flowData.edges || []).length}`);
        
        // Verificar se tem nó inicial
        const startNode = Object.values(flowData.nodes || {}).find(node => 
          node.type === 'start' || node.data?.type === 'start'
        );
        console.log(`  - Nó inicial: ${startNode ? '✅ Encontrado' : '❌ Não encontrado'}`);
        
      } catch (error) {
        console.log('❌ Erro ao analisar estrutura do fluxo:', error.message);
      }
    }
    
    console.log('✅ Limpeza de cache concluída!');
    console.log('🔄 Agora reinicie o bot com: pm2 restart chatbot-whats-api');
    
  } catch (error) {
    console.error('❌ Erro na limpeza de cache:', error);
  } finally {
    process.exit(0);
  }
}

// Executar limpeza
clearFlowCache();

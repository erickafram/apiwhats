#!/usr/bin/env node

const axios = require('axios');
const { Conversation, Message, Flow } = require('./src/models');

async function forceFlowUpdate() {
  console.log('🔄 FORÇANDO ATUALIZAÇÃO DE FLUXO');
  console.log('================================');
  
  try {
    // 1. Limpar cache do banco de dados
    console.log('🧹 Limpando cache do banco...');
    
    const deletedConversations = await Conversation.destroy({
      where: {},
      force: true
    });
    
    const deletedMessages = await Message.destroy({
      where: {
        created_at: {
          [require('sequelize').Op.lt]: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hora
        }
      }
    });
    
    console.log(`✅ ${deletedConversations} conversas deletadas`);
    console.log(`✅ ${deletedMessages} mensagens antigas deletadas`);
    
    // 2. Verificar fluxo mais recente
    const latestFlow = await Flow.findOne({
      where: { is_active: true },
      order: [['updated_at', 'DESC']]
    });
    
    if (!latestFlow) {
      console.log('❌ Nenhum fluxo ativo encontrado!');
      return;
    }
    
    console.log(`📋 Fluxo ativo: ${latestFlow.name}`);
    console.log(`🕐 Última atualização: ${latestFlow.updated_at}`);
    
    // 3. Verificar estrutura do fluxo
    try {
      const flowData = JSON.parse(latestFlow.flow_data);
      const nodeCount = Object.keys(flowData.nodes || {}).length;
      const edgeCount = (flowData.edges || []).length;
      
      console.log(`🔍 Estrutura do fluxo:`);
      console.log(`  - Nós: ${nodeCount}`);
      console.log(`  - Conexões: ${edgeCount}`);
      
      if (nodeCount === 0) {
        console.log('⚠️  ATENÇÃO: Fluxo não tem nós! Verifique a estrutura.');
      }
      
      // Verificar nó inicial
      const startNode = Object.values(flowData.nodes || {}).find(node => 
        node.type === 'start' || node.data?.type === 'start'
      );
      
      if (startNode) {
        console.log(`✅ Nó inicial encontrado: ${startNode.data?.label || 'Sem label'}`);
      } else {
        console.log('❌ Nó inicial NÃO encontrado!');
      }
      
    } catch (error) {
      console.log('❌ Erro ao analisar estrutura do fluxo:', error.message);
    }
    
    // 4. Limpar cache via API (se disponível)
    try {
      console.log('🌐 Limpando cache via API...');
      const response = await axios.post('http://localhost:5000/api/flows/clear-cache', {}, {
        headers: {
          'Authorization': 'Bearer your-token-here', // Você pode remover se não usar auth
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      console.log('✅ Cache da API limpo com sucesso');
    } catch (error) {
      console.log('⚠️  Não foi possível limpar cache via API (normal se API estiver offline)');
    }
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Execute: pm2 restart chatbot-whats-api');
    console.log('2. Aguarde 5 segundos');
    console.log('3. Teste com uma nova mensagem no WhatsApp');
    console.log('4. Use um número diferente ou aguarde 5 minutos entre testes');
    
    console.log('\n✅ Atualização de fluxo concluída!');
    
  } catch (error) {
    console.error('❌ Erro na atualização de fluxo:', error);
  } finally {
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  forceFlowUpdate();
}

module.exports = forceFlowUpdate;

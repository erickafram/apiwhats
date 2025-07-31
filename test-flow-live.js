const axios = require('axios');
const { Flow } = require('./src/models');

async function testLiveFlow() {
  const BASE_URL = 'http://localhost:5000';
  
  try {
    console.log('🧪 TESTE DE FLUXO EM TEMPO REAL');
    console.log('================================');
    
    // 1. Verificar se API está rodando
    try {
      const healthCheck = await axios.get(`${BASE_URL}/health`);
      console.log('✅ API está rodando');
    } catch (error) {
      console.log('❌ API não está respondendo');
      return;
    }
    
    // 2. Buscar fluxo mais recente do banco
    const latestFlow = await Flow.findOne({
      where: { is_active: true },
      order: [['updated_at', 'DESC']]
    });
    
    if (!latestFlow) {
      console.log('❌ Nenhum fluxo ativo encontrado');
      return;
    }
    
    console.log(`📋 Fluxo mais recente: ${latestFlow.name}`);
    console.log(`🕐 Atualizado em: ${latestFlow.updated_at}`);
    
    // 3. Verificar estrutura do fluxo
    let flowData;
    try {
      flowData = JSON.parse(latestFlow.flow_data);
      console.log(`🔍 Nós no fluxo: ${Object.keys(flowData.nodes || {}).length}`);
      
      // Listar todos os nós
      Object.entries(flowData.nodes || {}).forEach(([nodeId, node]) => {
        console.log(`  - ${nodeId}: ${node.data?.label || node.type || 'Sem label'}`);
      });
      
    } catch (error) {
      console.log('❌ Erro ao analisar fluxo:', error.message);
      return;
    }
    
    // 4. Simular mensagem de teste
    const testMessage = {
      message: {
        text: 'oi',
        _serialized: 'test_message_123',
        fromMe: false
      },
      user: {
        id: '5511999999999@c.us',
        name: 'Teste',
        phone: '5511999999999'
      },
      conversation: '5511999999999@c.us',
      receiver: '556392901378',
      timestamp: Math.floor(Date.now() / 1000),
      type: 'message',
      productId: 'test-product',
      phoneId: 103174
    };
    
    console.log('\n🚀 Simulando mensagem de teste...');
    
    try {
      const response = await axios.post(`${BASE_URL}/webhook/maytapi`, testMessage, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Mensagem processada com sucesso');
      console.log('📤 Resposta:', response.data);
      
    } catch (error) {
      console.log('❌ Erro ao processar mensagem:', error.message);
      if (error.response) {
        console.log('📄 Detalhes:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    process.exit(0);
  }
}

// Executar teste
testLiveFlow();

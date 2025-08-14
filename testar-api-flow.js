const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testarAPIFlow() {
  try {
    console.log('🌐 Testando API do fluxo...');
    
    const response = await fetch('http://localhost:5000/api/flows/5');
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      console.error('❌ Erro na API:', response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ Dados recebidos da API:');
    console.log('- ID:', data.id);
    console.log('- Nome:', data.name);
    console.log('- Ativo:', data.is_active);
    console.log('- Padrão:', data.is_default);
    console.log('- Flow data existe:', !!data.flow_data);
    
    if (data.flow_data) {
      const flowData = typeof data.flow_data === 'string' 
        ? JSON.parse(data.flow_data) 
        : data.flow_data;
        
      console.log('- Número de nós:', flowData.nodes?.length);
      console.log('- Número de edges:', flowData.edges?.length);
      
      // Verificar nó start
      const startNode = flowData.nodes?.find(n => n.type === 'start');
      if (startNode) {
        console.log('- Nó start tem data.next:', startNode.data?.next);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testarAPIFlow(); 
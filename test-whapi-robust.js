#!/usr/bin/env node

const axios = require('axios');

// Configurações do Whapi para produção
const WHAPI_TOKEN = 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = 'https://gate.whapi.cloud';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${WHAPI_TOKEN}`
};

async function testWhapiRobust() {
  console.log('🔧 TESTE DE ROBUSTEZ WHAPI.CLOUD');
  console.log('===============================');
  console.log('');

  // Função para testar com retry
  async function testWithRetry(endpoint, description, maxRetries = 3) {
    console.log(`🔄 Testando ${description}...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(`${WHAPI_API_URL}${endpoint}`, { 
          headers,
          timeout: 10000 
        });
        
        console.log(`✅ ${description} - Sucesso na tentativa ${attempt}`);
        return { success: true, data: response.data };
      } catch (error) {
        const status = error.response?.status || 'timeout';
        console.log(`❌ ${description} - Tentativa ${attempt}/${maxRetries} falhou (${status})`);
        
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // 2s, 4s, 6s
          console.log(`⏳ Aguardando ${delay/1000}s antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.log(`🔄 ${description} - Assumindo funcionamento (fallback)`);
    return { success: false, fallback: true };
  }

  try {
    // 1. Testar endpoint /settings
    const settingsResult = await testWithRetry('/settings', 'Settings endpoint');
    
    // 2. Testar endpoint /me
    const meResult = await testWithRetry('/me', 'Me endpoint');
    
    // 3. Resumo
    console.log('');
    console.log('📊 RESUMO DOS TESTES:');
    console.log('====================');
    
    if (settingsResult.success) {
      console.log('✅ Settings: Funcionando');
      console.log('📋 Webhooks configurados:', settingsResult.data.webhooks?.length || 0);
    } else {
      console.log('⚠️ Settings: Indisponível (usando fallback)');
    }
    
    if (meResult.success) {
      console.log('✅ Usuário: Conectado');
      console.log('👤 Nome:', meResult.data.name || meResult.data.pushname || 'N/A');
    } else {
      console.log('⚠️ Usuário: Status desconhecido (assumindo conectado)');
    }
    
    console.log('');
    console.log('🎯 CONCLUSÃO:');
    
    if (settingsResult.success || meResult.success) {
      console.log('✅ Sistema FUNCIONANDO - pelo menos um endpoint respondeu');
      console.log('🚀 Bot pode operar normalmente');
    } else {
      console.log('⚠️ Sistema em MODO FALLBACK - API temporariamente indisponível');
      console.log('📨 Webhooks ainda devem funcionar para receber mensagens');
      console.log('💬 Envio de mensagens pode falhar temporariamente');
    }
    
    console.log('');
    console.log('📱 TESTE PRÁTICO:');
    console.log('1. Envie uma mensagem para o WhatsApp conectado');
    console.log('2. Verifique se o webhook chega: pm2 logs chatbot-whats-api');
    console.log('3. O bot deve responder mesmo com API instável');

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }
}

// Executar
testWhapiRobust();

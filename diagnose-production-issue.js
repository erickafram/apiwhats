#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Configurar ambiente de produção
process.env.NODE_ENV = 'production';

console.log('🔍 DIAGNÓSTICO DO PROBLEMA DE PRODUÇÃO');
console.log('=====================================\n');

async function diagnoseIssue() {
  try {
    // 1. Verificar estrutura de arquivos
    console.log('1️⃣ Verificando estrutura de arquivos...');
    const requiredFiles = [
      'src/models/index.js',
      'src/services/MaytapiService.js',
      'src/services/MaytapiFlowProcessor.js',
      'src/services/BotManager.js',
      'src/routes/maytapi.js'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} existe`);
      } else {
        console.log(`   ❌ ${file} NÃO ENCONTRADO`);
      }
    }

    // 2. Testar conexão com banco de dados
    console.log('\n2️⃣ Testando conexão com banco de dados...');
    try {
      const { sequelize } = require('./src/models');
      await sequelize.authenticate();
      console.log('   ✅ Conexão com banco OK');
      
      // Testar modelos
      const { Bot, Flow, Conversation } = require('./src/models');
      const botCount = await Bot.count();
      const flowCount = await Flow.count();
      const conversationCount = await Conversation.count();
      
      console.log(`   📊 Bots: ${botCount}, Fluxos: ${flowCount}, Conversas: ${conversationCount}`);
      
    } catch (dbError) {
      console.log(`   ❌ Erro no banco: ${dbError.message}`);
    }

    // 3. Verificar configurações de ambiente
    console.log('\n3️⃣ Verificando variáveis de ambiente...');
    const requiredEnvVars = [
      'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
      'MAYTAPI_PRODUCT_ID', 'MAYTAPI_TOKEN'
    ];

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: definida`);
      } else {
        console.log(`   ⚠️ ${envVar}: não definida`);
      }
    }

    // 4. Testar fluxos ativos
    console.log('\n4️⃣ Verificando fluxos ativos...');
    try {
      const { Flow, Bot } = require('./src/models');
      
      const activeFlows = await Flow.findAll({
        where: { is_active: true },
        include: [{ model: Bot, as: 'bot' }]
      });

      if (activeFlows.length === 0) {
        console.log('   ⚠️ NENHUM FLUXO ATIVO ENCONTRADO - Este pode ser o problema!');
        console.log('   💡 Solução: Ativar pelo menos um fluxo no sistema');
      } else {
        console.log(`   ✅ ${activeFlows.length} fluxo(s) ativo(s) encontrado(s)`);
        for (const flow of activeFlows) {
          console.log(`      - ${flow.name} (Bot: ${flow.bot?.name || 'N/A'})`);
        }
      }

      // 5. Verificar estrutura do fluxo
      console.log('\n5️⃣ Verificando estrutura dos fluxos...');
      for (const flow of activeFlows) {
        try {
          const flowData = JSON.parse(flow.flow_data);
          if (!flowData.nodes || flowData.nodes.length === 0) {
            console.log(`   ❌ Fluxo "${flow.name}" sem nós definidos`);
          } else {
            console.log(`   ✅ Fluxo "${flow.name}" tem ${flowData.nodes.length} nó(s)`);
            
            // Verificar se tem nó de início
            const startNode = flowData.nodes.find(n => n.type === 'start');
            if (!startNode) {
              console.log(`      ⚠️ Fluxo "${flow.name}" sem nó de início`);
            }
          }
        } catch (parseError) {
          console.log(`   ❌ Erro ao parsear fluxo "${flow.name}": ${parseError.message}`);
        }
      }

    } catch (flowError) {
      console.log(`   ❌ Erro ao verificar fluxos: ${flowError.message}`);
    }

    // 6. Testar processamento de mensagem
    console.log('\n6️⃣ Simulando processamento de mensagem...');
    try {
      const MaytapiFlowProcessor = require('./src/services/MaytapiFlowProcessor');
      const MaytapiService = require('./src/services/MaytapiService');
      
      // Simular dados de webhook
      const testWebhookData = {
        type: 'message',
        phone_id: '12345',
        message: {
          text: 'menu',
          type: 'text'
        },
        user: {
          phone: '5511999999999'
        }
      };

      console.log('   🧪 Dados de teste:', JSON.stringify(testWebhookData, null, 2));
      
      // Tentar processar
      const maytapiService = new MaytapiService();
      console.log('   ✅ MaytapiService criado');
      
    } catch (processError) {
      console.log(`   ❌ Erro no processamento: ${processError.message}`);
      console.log(`   📝 Stack trace: ${processError.stack}`);
    }

    // 7. Verificar logs recentes
    console.log('\n7️⃣ Recomendações para resolver o problema...');
    console.log('   🔧 1. Verificar se existe pelo menos um fluxo ativo');
    console.log('   🔧 2. Verificar se o fluxo tem trigger_keywords definidas');
    console.log('   🔧 3. Verificar se o bot está corretamente configurado');
    console.log('   🔧 4. Verificar logs do PM2 com: pm2 logs chatbot-whats-api');
    console.log('   🔧 5. Reiniciar o serviço com: pm2 restart chatbot-whats-api');

  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Executar diagnóstico
diagnoseIssue().then(() => {
  console.log('\n✅ Diagnóstico concluído!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

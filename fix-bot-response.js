#!/usr/bin/env node

const axios = require('axios');
const { Sequelize } = require('sequelize');

// Configurações
const WHAPI_TOKEN = 'lPX5R5QAjWxazo8djm34yQTSSad8ZpZH';
const WHAPI_API_URL = 'https://gate.whapi.cloud';

async function fixBotResponse() {
  console.log('🚨 DIAGNÓSTICO: Bot não responde mensagens');
  console.log('===============================================');

  try {
    // 1. Testar envio direto via Whapi
    console.log('1️⃣ Testando envio direto via Whapi...');
    
    const testMessage = {
      to: '556392410056@s.whatsapp.net',
      body: '🤖 Teste direto do Whapi - Bot funcionando!'
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WHAPI_TOKEN}`
    };

    try {
      const response = await axios.post(
        `${WHAPI_API_URL}/messages/text`,
        testMessage,
        { headers }
      );
      console.log('✅ Mensagem de teste enviada via Whapi!');
      console.log('Resposta:', response.data);
    } catch (error) {
      console.log('❌ Erro no envio via Whapi:', error.response?.data || error.message);
    }

    // 2. Testar API do servidor local
    console.log('\n2️⃣ Testando API do servidor local...');
    
    try {
      // Testar endpoint sem autenticação
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Servidor local online');
    } catch (error) {
      console.log('❌ Servidor local não responde');
    }

    // 3. Verificar fluxos no banco
    console.log('\n3️⃣ Verificando fluxos no banco de dados...');
    
    // Conectar ao banco
    const sequelize = new Sequelize({
      dialect: 'mysql',
      host: 'localhost',
      username: 'chatbotwhats',
      password: process.env.DB_PASSWORD || 'SUA_SENHA_MYSQL_AQUI',
      database: 'chatbotwhats_db',
      logging: false
    });

    try {
      await sequelize.authenticate();
      console.log('✅ Conectado ao banco de dados');

      // Verificar bots ativos
      const [bots] = await sequelize.query('SELECT id, name, is_active, is_connected FROM bots WHERE is_active = 1');
      console.log(`📊 Bots ativos: ${bots.length}`);
      bots.forEach(bot => {
        console.log(`  - Bot ${bot.id}: ${bot.name} (conectado: ${bot.is_connected})`);
      });

      // Verificar fluxos
      const [flows] = await sequelize.query('SELECT id, name, is_active, bot_id FROM flows WHERE is_active = 1');
      console.log(`📊 Fluxos ativos: ${flows.length}`);
      flows.forEach(flow => {
        console.log(`  - Fluxo ${flow.id}: ${flow.name} (bot: ${flow.bot_id})`);
      });

      // Se não há fluxos, criar um fluxo básico
      if (flows.length === 0) {
        console.log('\n🔧 Criando fluxo básico...');
        
        const createFlowQuery = `
          INSERT INTO flows (bot_id, name, trigger_type, trigger_value, flow_data, is_active, is_default, created_at, updated_at)
          VALUES (1, 'Menu Principal', 'keyword', 'menu', '{"nodes":[{"id":"start","type":"message","data":{"message":"🎯 Olá! Bem-vindo!\n\nEscolha uma opção:\n1️⃣ Informações\n2️⃣ Suporte\n3️⃣ Vendas\n\nDigite o número da opção:"}}]}', 1, 1, NOW(), NOW())
        `;
        
        await sequelize.query(createFlowQuery);
        console.log('✅ Fluxo básico criado!');
      }

      await sequelize.close();

    } catch (dbError) {
      console.log('❌ Erro no banco de dados:', dbError.message);
    }

    // 4. Força restart do serviço
    console.log('\n4️⃣ Testando restart do bot manager...');
    
    try {
      // Chamar endpoint para recarregar bots
      const reloadResponse = await axios.post('http://localhost:5000/api/whapi/connect/1');
      console.log('✅ Bot recarregado');
    } catch (error) {
      console.log('⚠️ Não foi possível recarregar via API');
    }

    console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');
    console.log('\n📱 Agora teste no WhatsApp:');
    console.log('1. Envie "menu" para o bot');
    console.log('2. Se não funcionar, execute: pm2 restart chatbot-whats-api');
    console.log('3. Monitore os logs: pm2 logs chatbot-whats-api --lines 0');

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error.message);
  }
}

// Executar
fixBotResponse().catch(console.error);

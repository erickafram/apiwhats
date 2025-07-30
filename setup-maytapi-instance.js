const axios = require('axios');
require('dotenv').config();

// Configurações da Maytapi
const PRODUCT_ID = process.env.MAYTAPI_PRODUCT_ID;
const TOKEN = process.env.MAYTAPI_TOKEN;
const API_URL = process.env.MAYTAPI_API_URL || 'https://api.maytapi.com/api';

const headers = {
  'Content-Type': 'application/json',
  'x-maytapi-key': TOKEN
};

async function checkAndSetupMaytapi() {
  console.log('🔧 CONFIGURAÇÃO DA MAYTAPI');
  console.log('=========================');
  console.log('');

  // Verificar configuração
  if (!PRODUCT_ID || !TOKEN) {
    console.log('❌ CONFIGURAÇÃO INCOMPLETA!');
    console.log('');
    console.log('Adicione no arquivo .env:');
    console.log('MAYTAPI_PRODUCT_ID=ebba8265-1e89-4e6a-8255-7eee3e64b7f5');
    console.log('MAYTAPI_TOKEN=af87a53c-3b0f-4188-b5de-2f7ed0acddda');
    console.log('USE_MAYTAPI=true');
    console.log('');
    return;
  }

  try {
    console.log('1️⃣ Verificando autenticação...');
    
    // Testar autenticação
    const authResponse = await axios.get(
      `${API_URL}/${PRODUCT_ID}/listPhones`,
      { headers }
    );

    console.log('✅ Autenticação bem-sucedida!');
    console.log('');

    console.log('2️⃣ Verificando instâncias existentes...');
    
    const phones = authResponse.data.data || [];
    console.log(`📱 Instâncias encontradas: ${phones.length}`);
    
    if (phones.length === 0) {
      console.log('');
      console.log('⚠️ NENHUMA INSTÂNCIA ENCONTRADA!');
      console.log('');
      console.log('🔧 COMO CRIAR UMA INSTÂNCIA:');
      console.log('');
      console.log('1. Acesse: https://console.maytapi.com/');
      console.log('2. Faça login com suas credenciais');
      console.log('3. No menu lateral, clique em "Phones"');
      console.log('4. Clique no botão "Add Phone" ou "Create Phone Instance"');
      console.log('5. Aguarde a criação (pode levar alguns segundos)');
      console.log('6. Anote o Phone ID gerado');
      console.log('');
      console.log('📋 APÓS CRIAR A INSTÂNCIA:');
      console.log('1. Execute novamente: node setup-maytapi-instance.js');
      console.log('2. Inicie o servidor: npm start');
      console.log('3. Acesse: http://localhost:3000/bots');
      console.log('4. Conecte um bot e escaneie o QR Code');
      console.log('');
      
      // Abrir dashboard automaticamente
      console.log('🌐 Abrindo dashboard da Maytapi...');
      const { exec } = require('child_process');
      exec('start https://console.maytapi.com/', (error) => {
        if (error) {
          console.log('💡 Acesse manualmente: https://console.maytapi.com/');
        }
      });
      
    } else {
      console.log('');
      console.log('✅ INSTÂNCIAS ENCONTRADAS:');
      console.log('');
      
      phones.forEach((phone, index) => {
        console.log(`📱 Instância ${index + 1}:`);
        console.log(`   ID: ${phone.id}`);
        console.log(`   Status: ${phone.status || 'N/A'}`);
        console.log(`   Número: ${phone.number || 'Não conectado'}`);
        console.log(`   Multi-device: ${phone.multi_device ? 'Sim' : 'Não'}`);
        console.log('');
      });
      
      console.log('🎉 CONFIGURAÇÃO COMPLETA!');
      console.log('');
      console.log('📋 PRÓXIMOS PASSOS:');
      console.log('1. Execute: node fix-database.sql (no phpMyAdmin)');
      console.log('2. Reinicie o servidor: npm start');
      console.log('3. Acesse: http://localhost:3000/bots');
      console.log('4. Crie um bot e conecte via Maytapi');
      console.log('5. Escaneie o QR Code para conectar o WhatsApp');
      console.log('');
      
      // Testar uma instância
      const testPhone = phones[0];
      console.log('3️⃣ Testando instância...');
      
      try {
        const statusResponse = await axios.get(
          `${API_URL}/${PRODUCT_ID}/${testPhone.id}/status`,
          { headers }
        );
        
        console.log(`✅ Status da instância ${testPhone.id}:`, statusResponse.data.data?.status || 'unknown');
        
        if (statusResponse.data.data?.status !== 'authenticated') {
          console.log('💡 Esta instância precisa ser autenticada (QR Code)');
        }
        
      } catch (statusError) {
        console.log('⚠️ Erro ao verificar status:', statusError.response?.data?.message || statusError.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('');
      console.log('🔑 ERRO DE AUTENTICAÇÃO');
      console.log('');
      console.log('Verifique se as credenciais estão corretas:');
      console.log(`Product ID: ${PRODUCT_ID}`);
      console.log(`Token: ${TOKEN ? '***' + TOKEN.slice(-4) : 'NÃO DEFINIDO'}`);
      console.log('');
      console.log('💡 Se as credenciais estão corretas, verifique:');
      console.log('1. Se a conta Maytapi está ativa');
      console.log('2. Se o token não expirou');
      console.log('3. Se há créditos suficientes na conta');
    }
  }
}

async function main() {
  await checkAndSetupMaytapi();
}

main().catch(console.error);

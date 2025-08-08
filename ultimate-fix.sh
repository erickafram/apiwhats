#!/bin/bash

echo "🚨 SOLUÇÃO DEFINITIVA - Bot não responde"
echo "======================================="

# 1. Testar envio manual
echo "1️⃣ Enviando mensagem manual via Whapi..."
curl -X POST "https://gate.whapi.cloud/messages/text" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer lPX5R5QAjWxazo8djm34yQTSSad8ZpZH" \
  -d '{
    "to": "556392410056@s.whatsapp.net", 
    "body": "🤖 TESTE: Bot reconfigurado! Digite \"menu\" para testar."
  }'

echo -e "\n2️⃣ Executando diagnóstico..."
node fix-bot-response.js

echo -e "\n3️⃣ Reiniciando servidor..."
pm2 restart chatbot-whats-api

echo -e "\n4️⃣ Aguardando inicialização..."
sleep 3

echo -e "\n5️⃣ Status final..."
pm2 status chatbot-whats-api

echo -e "\n✅ CORREÇÃO CONCLUÍDA!"
echo "📱 Teste no WhatsApp enviando: menu"
echo "💡 Se não funcionar, há um problema nos fluxos do banco de dados"

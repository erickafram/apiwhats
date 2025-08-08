#!/bin/bash

echo "🚨 CORREÇÃO FINAL: Fluxo de Menu que Para na Opção 1"
echo "=================================================="

# 1. Analisar banco real
echo "1️⃣ Analisando estrutura real do banco..."
node analyze-real-db.js

echo -e "\n2️⃣ Testando fluxo passo a passo..."
node debug-menu-flow.js

echo -e "\n3️⃣ Reiniciando servidor..."
pm2 restart chatbot-whats-api

echo -e "\n4️⃣ Aguardando inicialização..."
sleep 5

echo -e "\n5️⃣ Enviando mensagem de teste final..."
curl -X POST "https://gate.whapi.cloud/messages/text" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer lPX5R5QAjWxazo8djm34yQTSSad8ZpZH" \
  -d '{
    "to": "556392410056@s.whatsapp.net",
    "body": "🔧 SISTEMA RECONFIGURADO!\n\n✅ Teste agora:\n1. Digite \"menu\"\n2. Digite \"1\"\n3. Deve aparecer \"digite cidade de ORIGEM\""
  }'

echo -e "\n6️⃣ Status final..."
pm2 status chatbot-whats-api

echo -e "\n✅ CORREÇÃO CONCLUÍDA!"
echo ""
echo "📱 TESTE FINAL:"
echo "1. Digite 'menu' no WhatsApp"
echo "2. Quando aparecer o menu, digite '1'"
echo "3. DEVE aparecer 'digite a cidade de ORIGEM'"
echo ""
echo "🔍 Se não funcionar, monitore:"
echo "pm2 logs chatbot-whats-api --lines 0"
echo ""
echo "💡 O problema pode estar em:"
echo "- FlowProcessor não está processando condições"
echo "- BotManager não está encontrando o fluxo correto"
echo "- Nós do fluxo mal conectados no JSON"

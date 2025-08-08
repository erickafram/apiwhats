#!/bin/bash

echo "⚡ LIMPEZA RÁPIDA E RESTART"
echo "========================="

# Versão rápida para quando você só quer limpar o cache das conversas

# 1. Limpar cache de conversas
echo "1️⃣ Limpando cache das conversas..."
node clear-cache-and-recompile.js

# 2. Reiniciar servidor
echo -e "\n2️⃣ Reiniciando servidor..."
pm2 restart chatbot-whats-api

# 3. Aguardar
echo -e "\n3️⃣ Aguardando inicialização..."
sleep 5

# 4. Status
echo -e "\n4️⃣ Status do sistema..."
pm2 status chatbot-whats-api

# 5. Enviar mensagem de teste
echo -e "\n5️⃣ Enviando mensagem de teste..."
curl -X POST "https://gate.whapi.cloud/messages/text" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer lPX5R5QAjWxazo8djm34yQTSSad8ZpZH" \
  -d '{
    "to": "556392410056@s.whatsapp.net",
    "body": "🧹 CACHE LIMPO!\n\n✅ Conversas resetadas\n✅ Estados limpos\n✅ Sistema reiniciado\n\n📱 Teste com uma conversa nova!"
  }' > /dev/null 2>&1

echo -e "\n✅ LIMPEZA RÁPIDA CONCLUÍDA!"
echo ""
echo "📱 TESTE:"
echo "Inicie uma conversa nova no WhatsApp"
echo "Digite 'ola' ou 'menu' para testar"

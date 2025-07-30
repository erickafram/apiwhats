#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DA MAYTAPI"
echo "=================================="
echo ""

echo "1️⃣ Listando todas as instâncias disponíveis:"
echo "============================================="
curl -s -H "X-Maytapi-Key: af87a53c-3b0f-4188-b5de-2f7ed0acddda" \
  "https://api.maytapi.com/api/ebba8265-1e89-4e6a-8255-7eee3e64b7f5" | jq .
echo ""

echo "2️⃣ Verificando instância específica 103174:"
echo "==========================================="
INSTANCE_STATUS=$(curl -s -H "X-Maytapi-Key: af87a53c-3b0f-4188-b5de-2f7ed0acddda" \
  "https://api.maytapi.com/api/ebba8265-1e89-4e6a-8255-7eee3e64b7f5/103174")
echo "$INSTANCE_STATUS"
echo ""

echo "3️⃣ Configurando webhook na instância 103174:"
echo "============================================="
WEBHOOK_CONFIG=$(curl -s -X POST "https://api.maytapi.com/api/ebba8265-1e89-4e6a-8255-7eee3e64b7f5/103174/config" \
  -H "X-Maytapi-Key: af87a53c-3b0f-4188-b5de-2f7ed0acddda" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": "https://chatbotwhats.online/api/maytapi/webhook",
    "ack_delivery": true,
    "msg_store": false
  }')
echo "$WEBHOOK_CONFIG"
echo ""

echo "4️⃣ Verificando configuração atual do webhook:"
echo "============================================="
CURRENT_CONFIG=$(curl -s -H "X-Maytapi-Key: af87a53c-3b0f-4188-b5de-2f7ed0acddda" \
  "https://api.maytapi.com/api/ebba8265-1e89-4e6a-8255-7eee3e64b7f5/103174/config")
echo "$CURRENT_CONFIG"
echo ""

echo "5️⃣ Verificando status do WhatsApp na instância:"
echo "==============================================="
WHATSAPP_STATUS=$(curl -s -H "X-Maytapi-Key: af87a53c-3b0f-4188-b5de-2f7ed0acddda" \
  "https://api.maytapi.com/api/ebba8265-1e89-4e6a-8255-7eee3e64b7f5/103174/screen")
echo "$WHATSAPP_STATUS"
echo ""

echo "6️⃣ Testando envio de mensagem direta:"
echo "====================================="
SEND_TEST=$(curl -s -X POST "https://api.maytapi.com/api/ebba8265-1e89-4e6a-8255-7eee3e64b7f5/103174/sendMessage" \
  -H "X-Maytapi-Key: af87a53c-3b0f-4188-b5de-2f7ed0acddda" \
  -H "Content-Type: application/json" \
  -d '{
    "to_number": "5563992901378",
    "type": "text",
    "message": "🤖 Teste direto do bot via API - funcionando!"
  }')
echo "$SEND_TEST"
echo ""

echo "7️⃣ Verificando conexões no nosso sistema:"
echo "========================================="
curl -s https://chatbotwhats.online/api/maytapi/connections | jq .
echo ""

echo "8️⃣ Testando nosso webhook:"
echo "========================="
curl -s -X POST https://chatbotwhats.online/api/maytapi/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message",
    "phone_id": "103174",
    "message": {
      "from_number": "5563992901378",
      "text": "teste webhook",
      "type": "text",
      "timestamp": "'$(date -Iseconds)'"
    }
  }'
echo ""

echo "🎯 ANÁLISE DOS RESULTADOS:"
echo "========================="
echo ""

if echo "$INSTANCE_STATUS" | grep -q "404"; then
    echo "❌ PROBLEMA: Instância 103174 não encontrada!"
    echo "   Solução: Use uma das instâncias listadas acima"
else
    echo "✅ Instância 103174 encontrada"
fi

if echo "$WEBHOOK_CONFIG" | grep -q "success"; then
    echo "✅ Webhook configurado com sucesso"
else
    echo "⚠️ Problema na configuração do webhook"
fi

if echo "$WHATSAPP_STATUS" | grep -q "authenticated"; then
    echo "✅ WhatsApp conectado e autenticado"
else
    echo "⚠️ WhatsApp pode não estar conectado"
fi

echo ""
echo "📱 PRÓXIMOS PASSOS:"
echo "=================="
echo "1. Se instância 103174 não existir, use outra instância"
echo "2. Configure webhook na dashboard: https://console.maytapi.com/"
echo "3. Certifique-se que WhatsApp está conectado"
echo "4. Teste enviando mensagem real"
echo ""
echo "🔗 URL do webhook: https://chatbotwhats.online/api/maytapi/webhook"
echo "📞 Número para teste: +55 63 99290-1378"

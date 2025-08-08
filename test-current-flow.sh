#!/bin/bash

echo "🔍 TESTE: Status atual do fluxo de passagens"
echo "============================================"

# 1. Diagnosticar com credenciais corretas
echo "1️⃣ Executando diagnóstico com credenciais corretas..."
node diagnose-flow-fixed.js

echo -e "\n2️⃣ Verificando logs recentes..."
pm2 logs chatbot-whats-api --lines 20 | grep -E "(Mensagem recebida|processada|enviada)" | tail -10

echo -e "\n3️⃣ Testando resposta automática..."
echo "Enviando mensagem de teste para verificar se o bot responde automaticamente..."

# Simular mensagem "1" via webhook local
curl -X POST "http://localhost:5000/api/whapi/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "id": "test-msg-123",
        "from_me": false,
        "type": "text",
        "chat_id": "556392410056@s.whatsapp.net",
        "timestamp": '$(date +%s)',
        "text": {
          "body": "1"
        },
        "from": "556392410056",
        "from_name": "Erick Vinicius"
      }
    ],
    "event": {
      "type": "messages",
      "event": "post"
    }
  }'

echo -e "\n\n4️⃣ Aguardando processamento..."
sleep 3

echo -e "\n5️⃣ Verificando se houve resposta automática..."
pm2 logs chatbot-whats-api --lines 10 | grep -E "(Mensagem recebida|enviada)" | tail -5

echo -e "\n✅ TESTE CONCLUÍDO!"
echo ""
echo "📱 PRÓXIMO PASSO:"
echo "Teste real no WhatsApp:"
echo "1. Digite 'comprar passagem'"
echo "2. Digite '1' quando aparecer o menu"
echo "3. Verifique se aparece 'digite a cidade de ORIGEM'"

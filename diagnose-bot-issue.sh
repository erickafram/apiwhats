#!/bin/bash

echo "🔍 DIAGNÓSTICO DO BOT - WhatsApp não responde"
echo "=============================================="

# 1. Verificar se o servidor está rodando
echo "1️⃣ Verificando se o servidor está ativo..."
curl -s http://localhost:5000/health || echo "❌ Servidor não responde"

# 2. Verificar status do bot via API interna
echo -e "\n2️⃣ Verificando status do bot..."
curl -s "http://localhost:5000/api/whapi/status/1" | head -5

# 3. Verificar logs mais recentes
echo -e "\n3️⃣ Logs mais recentes (últimas 30 linhas)..."
pm2 logs chatbot-whats-api --lines 30 | tail -30

# 4. Verificar se o webhook está configurado
echo -e "\n4️⃣ Verificando webhook do Whapi..."
if [ -n "$WHAPI_TOKEN" ]; then
    curl -s -H "Authorization: Bearer $WHAPI_TOKEN" "https://gate.whapi.cloud/webhooks" | head -3
else
    echo "❌ WHAPI_TOKEN não definido"
fi

# 5. Verificar variáveis de ambiente críticas
echo -e "\n5️⃣ Verificando variáveis de ambiente..."
echo "USE_WHAPI: ${USE_WHAPI:-'não definido'}"
echo "USE_MAYTAPI: ${USE_MAYTAPI:-'não definido'}"
echo "WHAPI_TOKEN: ${WHAPI_TOKEN:+definido}"
echo "WHAPI_BASE_URL: ${WHAPI_BASE_URL:-'não definido'}"

# 6. Verificar se há erros de conexão no banco
echo -e "\n6️⃣ Verificando conexão com banco de dados..."
mysql -h ${DB_HOST:-localhost} -u ${DB_USER:-root} -p${DB_PASSWORD} ${DB_NAME:-whatsapp_chatbot} -e "SELECT COUNT(*) as total_bots FROM bots WHERE is_active = 1;" 2>/dev/null || echo "❌ Erro ao conectar com banco"

# 7. Testar se o bot está recebendo mensagens
echo -e "\n7️⃣ Verificando se há mensagens recentes..."
pm2 logs chatbot-whats-api --lines 50 | grep -E "(Mensagem recebida|processada)" | tail -5

# 8. Verificar processos
echo -e "\n8️⃣ Status do PM2..."
pm2 status chatbot-whats-api

echo -e "\n✅ Diagnóstico concluído!"
echo "Se o bot não responde, verifique:"
echo "- Se o webhook está configurado no Whapi"
echo "- Se o token do Whapi está correto"
echo "- Se há erros nos logs acima"

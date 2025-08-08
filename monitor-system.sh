#!/bin/bash

# Script de monitoramento do sistema
echo "🔍 Verificando status do sistema..."

# Status do PM2
echo "📊 Status PM2:"
pm2 status

# Uso de memória
echo "💾 Uso de memória:"
free -h

# Espaço em disco
echo "💽 Espaço em disco:"
df -h

# Logs recentes com erros
echo "🚨 Erros recentes (últimas 20 linhas):"
pm2 logs chatbot-whats-api --err --lines 20

# Teste de conectividade do bot
echo "🤖 Testando conectividade do bot:"
curl -s -X GET "http://localhost:5000/api/bots/1/status" | head -5

# Verificar webhook do Whapi
echo "📡 Status do webhook:"
curl -s -X GET "https://gate.whapi.cloud/webhooks" -H "Authorization: Bearer $WHAPI_TOKEN" | head -3

echo "✅ Verificação concluída!"

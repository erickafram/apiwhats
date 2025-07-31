#!/bin/bash

echo "🔄 ATUALIZANDO FLUXO PARA WHATSAPP"
echo "=================================="

# 1. Limpar cache
echo "🧹 Limpando cache..."
node clear-flow-cache.js

# 2. Aguardar um pouco
echo "⏳ Aguardando 3 segundos..."
sleep 3

# 3. Reiniciar bot
echo "🔄 Reiniciando bot..."
pm2 restart chatbot-whats-api

# 4. Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 5

# 5. Verificar logs
echo "📋 Verificando logs..."
pm2 logs chatbot-whats-api --lines 10

echo ""
echo "✅ FLUXO ATUALIZADO!"
echo "💡 Agora teste com uma nova mensagem no WhatsApp"
echo "⚠️  Use um número diferente ou aguarde 5 minutos entre testes"

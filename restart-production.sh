#!/bin/bash

echo "🔄 Reiniciando aplicação em produção..."

# Reiniciar PM2
pm2 restart chatbot-whats-api

echo "✅ Aplicação reiniciada!"

# Verificar status
pm2 status

echo ""
echo "📊 Para ver logs em tempo real:"
echo "pm2 logs chatbot-whats-api --lines 20" 
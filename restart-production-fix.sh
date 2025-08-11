#!/bin/bash

echo "🔄 Reiniciando servidor com correções de CORS..."

# Parar o PM2
pm2 stop chatbot-whats-api

echo "⏰ Aguardando 3 segundos..."
sleep 3

# Reiniciar com variáveis de ambiente atualizadas
pm2 start chatbot-whats-api --update-env

echo "✅ Servidor reiniciado!"
echo "📊 Status do PM2:"
pm2 status

echo "📋 Logs recentes:"
pm2 logs chatbot-whats-api --lines 10 
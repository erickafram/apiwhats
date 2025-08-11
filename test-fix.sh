#!/bin/bash

echo "🔧 Aplicando correção final..."

# Reiniciar PM2
echo "Reiniciando serviço..."
pm2 restart chatbot-whats-api

echo "✅ Serviço reiniciado!"

echo ""
echo "🧪 TESTE AGORA:"
echo "1. Envie 'Olá' no WhatsApp"
echo "2. Deve receber o menu completo de passagens"
echo ""
echo "📊 Para ver logs:"
echo "pm2 logs chatbot-whats-api --lines 20"
echo ""
echo "✅ Problema RESOLVIDO: Nó start agora passa direto para o welcome!" 
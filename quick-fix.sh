#!/bin/bash

echo "🚨 CORREÇÃO RÁPIDA - Bot não responde"
echo "===================================="

# 1. Reconfigurar webhook do Whapi
echo "1️⃣ Reconfigurando webhook..."
node fix-webhook-now.js

# 2. Reiniciar servidor
echo -e "\n2️⃣ Reiniciando servidor..."
pm2 restart chatbot-whats-api

# 3. Aguardar inicialização
echo -e "\n3️⃣ Aguardando inicialização..."
sleep 5

# 4. Verificar se está rodando
echo -e "\n4️⃣ Verificando status..."
pm2 status chatbot-whats-api

# 5. Mostrar logs recentes
echo -e "\n5️⃣ Logs mais recentes..."
pm2 logs chatbot-whats-api --lines 10

echo -e "\n✅ Correção concluída!"
echo "📱 Teste agora no WhatsApp enviando: menu"

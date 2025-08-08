#!/bin/bash

echo "🔧 CORREÇÃO: Fluxo de Passagens não continua após opção 1"
echo "========================================================="

# 1. Diagnosticar fluxos no banco
echo "1️⃣ Diagnosticando fluxos..."
node diagnose-flow-passagens.js

echo -e "\n2️⃣ Reiniciando servidor..."
pm2 restart chatbot-whats-api

echo -e "\n3️⃣ Aguardando inicialização..."
sleep 3

# 4. Testar fluxo manualmente
echo -e "\n4️⃣ Testando fluxo passo a passo..."
node test-flow-step-by-step.js

echo -e "\n5️⃣ Status do servidor..."
pm2 status chatbot-whats-api

echo -e "\n✅ CORREÇÃO CONCLUÍDA!"
echo ""
echo "📱 TESTE AGORA:"
echo "1. Digite no WhatsApp: 'comprar passagem'"
echo "2. Quando aparecer o menu, digite: '1'"
echo "3. Deve aparecer: 'digite a cidade de ORIGEM'"
echo ""
echo "💡 Se não funcionar, pode ser problema na configuração dos nós do fluxo."

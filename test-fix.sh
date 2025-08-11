#!/bin/bash

echo "🔄 Reiniciando aplicação..."
pm2 restart chatbot-whats-api
sleep 3

echo ""
echo "📋 TESTE DO SISTEMA - TRANSFERÊNCIA PARA OPERADOR"
echo "=================================================="

echo ""
echo "📱 TESTE NO WHATSAPP:"
echo "1️⃣ Envie: Olá"
echo "2️⃣ Aguarde o menu aparecer"
echo "3️⃣ Digite: 1 (Comprar Passagem)"
echo "4️⃣ Siga o fluxo até a confirmação final"
echo "5️⃣ Digite: SIM (para confirmar)"
echo "6️⃣ ✅ Deve aparecer: 'Vou te conectar com um operador agora...'"
echo ""

echo "💻 TESTE NO PAINEL WEB:"
echo "1️⃣ Acesse: https://chatbotwhats.online/conversations"
echo "2️⃣ ✅ Deve aparecer a conversa com status 'Aguardando Operador'"
echo "3️⃣ Clique em 'Assumir Conversa'"
echo "4️⃣ ✅ Deve abrir o chat para continuar a conversa"
echo "5️⃣ Digite uma mensagem e teste o envio"
echo ""

echo "🔍 VERIFICAR LOGS:"
echo "pm2 logs chatbot-whats-api --lines 20"
echo ""

echo "🎯 RESULTADOS ESPERADOS:"
echo "• Menu aparece após 'Olá'"
echo "• Fluxo funciona até transferência"  
echo "• Status da conversa muda para 'transferred'"
echo "• Conversa aparece no painel web"
echo "• Operador consegue assumir e responder"
echo ""

echo "🔧 Se houver erro, verifique:"
echo "• pm2 logs chatbot-whats-api"
echo "• Banco de dados está rodando"
echo "• UltraMsg está configurado"
echo "" 
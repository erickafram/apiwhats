#!/bin/bash

echo "🚀 RECOMPILAÇÃO COMPLETA DO SISTEMA"
echo "=================================="

# 1. Parar servidor
echo "1️⃣ Parando servidor..."
pm2 stop chatbot-whats-api

# 2. Limpar cache e estado
echo -e "\n2️⃣ Limpando cache e estado das conversas..."
node clear-cache-and-recompile.js

# 3. Limpar cache do NPM
echo -e "\n3️⃣ Limpando cache do NPM..."
npm cache clean --force
echo "✅ Cache NPM limpo"

# 4. Reinstalar dependências do backend
echo -e "\n4️⃣ Reinstalando dependências do backend..."
rm -rf node_modules package-lock.json
npm install
echo "✅ Backend reinstalado"

# 5. Recompilar frontend
echo -e "\n5️⃣ Recompilando frontend..."
cd frontend
rm -rf node_modules package-lock.json dist
npm install
npm run build
cd ..
echo "✅ Frontend recompilado"

# 6. Reiniciar servidor com ambiente limpo
echo -e "\n6️⃣ Reiniciando servidor com ambiente limpo..."
pm2 delete chatbot-whats-api 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

# 7. Aguardar inicialização
echo -e "\n7️⃣ Aguardando inicialização completa..."
sleep 10

# 8. Status final
echo -e "\n8️⃣ Status final do sistema..."
pm2 status

# 9. Testar conectividade
echo -e "\n9️⃣ Testando conectividade..."
curl -s http://localhost:5000/health > /dev/null && echo "✅ Servidor respondendo" || echo "❌ Servidor não responde"

echo -e "\n🎉 RECOMPILAÇÃO COMPLETA CONCLUÍDA!"
echo ""
echo "📋 O QUE FOI FEITO:"
echo "✅ Cache de conversas limpo"
echo "✅ Estados resetados"
echo "✅ Dependências reinstaladas"
echo "✅ Frontend recompilado"
echo "✅ Backend reiniciado limpo"
echo "✅ PM2 reconfigurado"
echo ""
echo "📱 TESTE AGORA:"
echo "1. Digite 'ola' no WhatsApp"
echo "2. Deve funcionar como conversa nova"
echo "3. Digite 'menu' para testar fluxos"
echo ""
echo "🔍 Para monitorar:"
echo "pm2 logs chatbot-whats-api --lines 0"

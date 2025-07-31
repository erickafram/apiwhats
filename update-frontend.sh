#!/bin/bash

echo "🚀 ATUALIZANDO FRONTEND COM MELHORIAS"
echo "===================================="

# Navegar para o diretório frontend
cd frontend

echo "📦 Instalando dependências..."
npm install

echo "🔨 Compilando frontend..."
npm run build

echo "📋 Verificando build..."
if [ -d "dist" ]; then
    echo "✅ Build criado com sucesso!"
    echo "📁 Arquivos gerados:"
    ls -la dist/
else
    echo "❌ Erro no build!"
    exit 1
fi

# Voltar para o diretório raiz
cd ..

echo "🔄 Reiniciando backend..."
pm2 restart chatbot-whats-api

echo "⏳ Aguardando inicialização..."
sleep 3

echo "📋 Verificando logs..."
pm2 logs chatbot-whats-api --lines 5

echo ""
echo "✅ FRONTEND ATUALIZADO COM SUCESSO!"
echo "🌐 Acesse: http://localhost:5000"
echo "💡 Melhorias implementadas:"
echo "  - Layout moderno e intuitivo"
echo "  - Auto-save automático"
echo "  - Aplicação imediata das mudanças no WhatsApp"
echo "  - Indicadores visuais de status"
echo "  - Sidebar melhorada com componentes"
echo "  - Editor ReactFlow aprimorado"

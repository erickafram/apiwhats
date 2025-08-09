#!/bin/bash

# Script para build de produção
echo "🚀 Iniciando build de produção..."

# Verificar se estamos no diretório correto
if [ ! -f "server.js" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Instalar dependências do backend se necessário
echo "📦 Verificando dependências do backend..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install
fi

# Build do frontend
echo "🎨 Fazendo build do frontend..."
cd frontend

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado no diretório frontend"
    exit 1
fi

# Instalar dependências do frontend se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

# Fazer build
echo "🔨 Executando build..."
npm run build

# Verificar se o build foi criado
if [ ! -d "dist" ]; then
    echo "❌ Erro: Build do frontend falhou - diretório dist não foi criado"
    exit 1
fi

echo "✅ Build do frontend concluído com sucesso!"

# Voltar para o diretório raiz
cd ..

# Criar diretório de logs se não existir
mkdir -p logs

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 não está instalado. Instalando..."
    npm install -g pm2
fi

echo "🎉 Build de produção concluído!"
echo ""
echo "Próximos passos:"
echo "1. pm2 start ecosystem.config.js --env production"
echo "2. pm2 save"
echo "3. pm2 startup"
echo ""
echo "Para verificar logs:"
echo "pm2 logs chatbot-whats-api"

#!/bin/bash

echo "🔍 Diagnóstico do servidor de produção"
echo "======================================"

# Verificar se estamos no diretório correto
echo "📁 Diretório atual: $(pwd)"

# Verificar arquivos essenciais
echo ""
echo "📋 Verificando arquivos essenciais:"
files=("server.js" ".env" "package.json" "ecosystem.config.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANDO"
    fi
done

# Verificar diretórios
echo ""
echo "📂 Verificando diretórios:"
dirs=("src" "frontend" "node_modules" "logs")
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/ - OK"
    else
        echo "❌ $dir/ - FALTANDO"
    fi
done

# Verificar build do frontend
echo ""
echo "🎨 Verificando build do frontend:"
if [ -d "frontend/dist" ]; then
    echo "✅ frontend/dist/ - OK"
    echo "   Arquivos: $(ls -la frontend/dist/ | wc -l) itens"
else
    echo "❌ frontend/dist/ - FALTANDO (precisa fazer build)"
fi

# Verificar Node.js e npm
echo ""
echo "🟢 Verificando Node.js:"
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js não instalado"
fi

if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm não instalado"
fi

# Verificar PM2
echo ""
echo "⚙️  Verificando PM2:"
if command -v pm2 &> /dev/null; then
    echo "✅ PM2: $(pm2 --version)"
    echo ""
    echo "📊 Status dos processos PM2:"
    pm2 list
else
    echo "❌ PM2 não instalado"
fi

# Verificar porta 5000
echo ""
echo "🔌 Verificando porta 5000:"
if netstat -tlnp | grep :5000 &> /dev/null; then
    echo "✅ Porta 5000 está em uso"
    netstat -tlnp | grep :5000
else
    echo "❌ Porta 5000 não está em uso"
fi

# Verificar conexão com banco de dados
echo ""
echo "🗄️  Verificando conexão com MySQL:"
if command -v mysql &> /dev/null; then
    echo "✅ MySQL client instalado"
    # Tentar conectar (sem senha para teste)
    if mysql -h localhost -u chatbot -p@@2025@@Ekb -e "USE chatbot; SHOW TABLES;" 2>/dev/null; then
        echo "✅ Conexão com banco de dados OK"
    else
        echo "❌ Erro na conexão com banco de dados"
    fi
else
    echo "⚠️  MySQL client não instalado"
fi

# Verificar logs
echo ""
echo "📝 Verificando logs:"
if [ -d "logs" ]; then
    echo "✅ Diretório logs existe"
    if [ -f "logs/error.log" ]; then
        echo "📄 Últimas linhas do error.log:"
        tail -5 logs/error.log
    fi
else
    echo "❌ Diretório logs não existe"
fi

echo ""
echo "🎯 Resumo do diagnóstico concluído!"
echo "Se houver problemas, execute: chmod +x build-production.sh && ./build-production.sh"

#!/bin/bash

echo "🚀 Iniciando deploy para produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute o script no diretório raiz do projeto."
    exit 1
fi

log "📥 Fazendo pull das alterações do GitHub..."
if git pull origin main; then
    log "✅ Código atualizado com sucesso"
else
    error "❌ Erro ao fazer pull do GitHub"
    exit 1
fi

log "📦 Verificando dependências do backend..."
if npm install; then
    log "✅ Dependências do backend instaladas"
else
    warning "⚠️ Possível erro nas dependências do backend"
fi

log "📦 Verificando dependências do frontend..."
cd frontend
if npm install; then
    log "✅ Dependências do frontend instaladas"
else
    warning "⚠️ Possível erro nas dependências do frontend"
fi

log "🔨 Compilando frontend para produção..."
if npm run build; then
    log "✅ Frontend compilado com sucesso"
else
    error "❌ Erro ao compilar frontend"
    cd ..
    exit 1
fi

cd ..

log "🔄 Reiniciando servidor..."

# Verificar se PM2 está disponível
if command -v pm2 &> /dev/null; then
    log "Usando PM2 para reiniciar..."
    pm2 restart all
    pm2 status
elif systemctl is-active --quiet seu-servico; then
    log "Usando systemctl para reiniciar..."
    sudo systemctl restart seu-servico
    sudo systemctl status seu-servico
else
    warning "PM2 ou systemctl não encontrados. Reinicie manualmente o servidor."
    log "Execute: pkill -f node && npm start"
fi

log "🧪 Testando aplicação..."
sleep 5

# Testar se o servidor está respondendo
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    log "✅ Servidor está respondendo corretamente"
else
    warning "⚠️ Servidor pode não estar respondendo. Verifique os logs."
fi

# Testar se o frontend está acessível
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Frontend está acessível"
else
    warning "⚠️ Frontend pode não estar acessível. Verifique a configuração."
fi

log "🎉 Deploy concluído!"
log "📊 Verificar logs: pm2 logs"
log "🌐 Acessar aplicação: http://seu-dominio.com"

echo ""
echo "📋 Resumo das alterações aplicadas:"
echo "   ✅ Criação de fluxos por código"
echo "   ✅ Edição de fluxos por código"
echo "   ✅ Menu principal com passagens de ônibus"
echo "   ✅ Fluxo otimizado de venda de passagens"

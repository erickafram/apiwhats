#!/bin/bash

# Script de Instalação em Produção - CloudPanel
# Execute este script no servidor de produção

echo "🚀 INSTALAÇÃO EM PRODUÇÃO - CHATBOT WHATSAPP"
echo "============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    error "Execute este script como root (sudo)"
    exit 1
fi

log "1️⃣ Atualizando sistema..."
apt update && apt upgrade -y

log "2️⃣ Instalando Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalação
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log "Node.js instalado: $NODE_VERSION"
log "NPM instalado: $NPM_VERSION"

log "3️⃣ Navegando para o projeto..."
cd /home/chatbotwhats/htdocs/chatbotwhats.online/apiwhats

log "4️⃣ Instalando dependências do backend..."
npm install

log "5️⃣ Instalando PM2 globalmente..."
npm install -g pm2

log "6️⃣ Instalando dependências do frontend..."
cd frontend
npm install

log "7️⃣ Fazendo build do frontend..."
npm run build

log "8️⃣ Voltando para raiz do projeto..."
cd ..

log "9️⃣ Criando diretórios necessários..."
mkdir -p logs
mkdir -p sessions
mkdir -p uploads

log "🔟 Configurando permissões..."
chown -R clp:clp /home/chatbotwhats/htdocs/chatbotwhats.online/apiwhats
chmod -R 755 /home/chatbotwhats/htdocs/chatbotwhats.online/apiwhats
chmod -R 777 logs
chmod -R 777 sessions
chmod -R 777 uploads

log "📋 Criando arquivo .env..."
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Configuração de Produção
NODE_ENV=production
PORT=5000

# Banco de Dados
DB_HOST=localhost
DB_USER=chatbotwhats
DB_PASSWORD=ALTERE_ESTA_SENHA
DB_NAME=chatbotwhats_db
DB_PORT=3306

# JWT
JWT_SECRET=sua_chave_jwt_super_secreta_production_2025

# Maytapi
MAYTAPI_PRODUCT_ID=ebba8265-1e89-4e6a-8255-7eee3e64b7f5
MAYTAPI_TOKEN=af87a53c-3b0f-4188-b5de-2f7ed0acddda
MAYTAPI_API_URL=https://api.maytapi.com/api
MAYTAPI_PHONE_ID=103174
USE_MAYTAPI=true

# IA
TOGETHER_API_TOKEN=8f2666a67bee6b36fbc09d507c0b2e4e4059ae3c3a78672448eefaf248cd673b
TOGETHER_MODEL=deepseek-ai/DeepSeek-V3

# URLs
FRONTEND_URL=https://chatbotwhats.online
BACKEND_URL=https://chatbotwhats.online/api
WEBHOOK_URL=https://chatbotwhats.online/api/maytapi/webhook

# Segurança
CORS_ORIGIN=https://chatbotwhats.online
SESSION_SECRET=sua_session_secret_production_2025
EOF
    warning "Arquivo .env criado. EDITE AS SENHAS antes de continuar!"
else
    log "Arquivo .env já existe"
fi

log "📋 Criando ecosystem.config.js para PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'chatbot-whats-api',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: 'logs/combined.log',
    out_file: 'logs/out.log',
    error_file: 'logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true
  }]
};
EOF

log "🗄️ Configurando banco de dados..."
echo ""
echo "IMPORTANTE: Configure o banco de dados MySQL:"
echo "1. mysql -u root -p"
echo "2. CREATE DATABASE chatbotwhats_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "3. CREATE USER 'chatbotwhats'@'localhost' IDENTIFIED BY 'SUA_SENHA';"
echo "4. GRANT ALL PRIVILEGES ON chatbotwhats_db.* TO 'chatbotwhats'@'localhost';"
echo "5. FLUSH PRIVILEGES;"
echo "6. EXIT;"
echo ""

log "🎉 INSTALAÇÃO CONCLUÍDA!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Edite o arquivo .env com suas configurações"
echo "2. Configure o banco de dados MySQL"
echo "3. Execute: pm2 start ecosystem.config.js"
echo "4. Configure o Nginx no CloudPanel"
echo "5. Configure SSL/HTTPS"
echo "6. Configure webhook na Maytapi"
echo ""
echo "🚀 COMANDOS ÚTEIS:"
echo "pm2 start ecosystem.config.js    # Iniciar aplicação"
echo "pm2 stop chatbot-whats-api       # Parar aplicação"
echo "pm2 restart chatbot-whats-api    # Reiniciar aplicação"
echo "pm2 logs chatbot-whats-api       # Ver logs"
echo "pm2 monit                        # Monitor em tempo real"
echo "pm2 save                         # Salvar configuração"
echo "pm2 startup                      # Auto-start no boot"
echo ""
log "Instalação finalizada com sucesso! 🎉"

@echo off
echo.
echo ===============================================
echo    INICIANDO SISTEMA WHATSAPP COM ULTRAMSG
echo ===============================================
echo.

echo 🔧 Configurando variáveis de ambiente...
set NODE_ENV=development
set PORT=5000

REM UltraMsg API
set USE_ULTRAMSG=true
set ULTRAMSG_TOKEN=2k5evpl6634a08hn
set ULTRAMSG_INSTANCE_ID=instance138466
set ULTRAMSG_API_URL=https://api.ultramsg.com

REM Desabilitar outras APIs
set USE_WHAPI=false
set USE_MAYTAPI=false
set USE_WHATSAPP_SIMULATOR=false

REM Database
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=
set DB_NAME=whatsapp_chatbot
set DB_PORT=3306

REM Outros
set JWT_SECRET=local_jwt_secret_123
set FRONTEND_URL=http://localhost:3000
set BACKEND_URL=http://localhost:5000/api
set WEBHOOK_URL=http://localhost:5000/api/ultramsg/webhook

REM IA
set TOGETHER_API_TOKEN=8f2666a67bee6b36fbc09d507c0b2e4e4059ae3c3a78672448eefaf248cd673b
set TOGETHER_MODEL=deepseek-ai/DeepSeek-V3

echo ✅ Variáveis configuradas
echo.

echo 🚀 Iniciando servidor backend na porta 5000...
echo 📍 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:3000
echo 📱 API: UltraMsg (Instance: %ULTRAMSG_INSTANCE_ID%)
echo.
echo 💡 Para parar: Ctrl+C
echo.

node server.js

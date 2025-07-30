# 🚀 Guia de Correção - Servidor de Produção

## Problemas Identificados:
1. ❌ Frontend não foi buildado (erro 500)
2. ❌ Configurações do .env estavam para desenvolvimento
3. ❌ Servidor Node.js pode não estar rodando corretamente

## 🔧 Passos para Correção:

### 1. Conectar no servidor e navegar para o projeto:
```bash
ssh root@165.227.206.12
cd /home/chatbotwhats/htdocs/chatbotwhats.online
```

### 2. Fazer backup das configurações atuais:
```bash
cp .env .env.backup
```

### 3. Executar diagnóstico:
```bash
chmod +x diagnose-production.sh
./diagnose-production.sh
```

### 4. Fazer build do frontend:
```bash
chmod +x build-production.sh
./build-production.sh
```

### 5. Parar processos PM2 existentes:
```bash
pm2 stop all
pm2 delete all
```

### 6. Iniciar o servidor:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 7. Verificar se está funcionando:
```bash
pm2 logs chatbot-whats-api
pm2 status
curl http://localhost:5000/health
```

### 8. Testar no navegador:
- Acesse: https://chatbotwhats.online
- Deve carregar o frontend
- Acesse: https://chatbotwhats.online/health
- Deve retornar: `{"status":"OK","timestamp":"..."}`

## 🔍 Comandos de Diagnóstico:

### Verificar logs em tempo real:
```bash
pm2 logs chatbot-whats-api --lines 50
```

### Verificar status dos processos:
```bash
pm2 status
```

### Verificar se a porta 5000 está em uso:
```bash
netstat -tlnp | grep :5000
```

### Verificar logs do nginx:
```bash
tail -f /home/chatbotwhats/logs/access.log
tail -f /home/chatbotwhats/logs/error.log
```

### Testar conexão com banco:
```bash
mysql -h localhost -u chatbot -p -e "USE chatbot; SHOW TABLES;"
# Senha: @@2025@@Ekb
```

## 🚨 Se ainda houver problemas:

### Reiniciar nginx:
```bash
systemctl restart nginx
```

### Verificar configuração do nginx:
```bash
nginx -t
```

### Verificar se o build do frontend foi criado:
```bash
ls -la frontend/dist/
```

### Forçar rebuild do frontend:
```bash
cd frontend
rm -rf dist node_modules
npm install
npm run build
cd ..
```

## 📝 Arquivos Importantes:
- `.env` - Configurações do ambiente
- `ecosystem.config.js` - Configuração do PM2
- `frontend/dist/` - Build do frontend
- `logs/` - Logs da aplicação

## ✅ Checklist Final:
- [ ] Frontend buildado (existe `frontend/dist/`)
- [ ] PM2 rodando o processo
- [ ] Porta 5000 respondendo
- [ ] Nginx configurado corretamente
- [ ] Banco de dados conectando
- [ ] Site carregando em https://chatbotwhats.online

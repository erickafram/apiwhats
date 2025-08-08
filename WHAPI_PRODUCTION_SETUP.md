# 🚀 CONFIGURAÇÃO WHAPI.CLOUD PRODUÇÃO

## 📋 Comandos para executar no servidor:

```bash
# 1. Navegar para o diretório do projeto
cd /home/chatbotwhats/htdocs/chatbotwhats.online

# 2. Executar script de configuração do webhook
node fix-whapi-webhook-production.js

# 3. Verificar logs do servidor
pm2 logs chatbot-whats-api --lines 20

# 4. Testar enviando mensagem para o bot
# (Envie uma mensagem para o número do WhatsApp conectado)
```

## 🔍 O que o script faz:

1. ✅ **Verifica configurações atuais** do Whapi.cloud
2. 🔄 **Configura webhook** para: `https://chatbotwhats.online/api/whapi/webhook`
3. ✅ **Verifica se ficou correto**
4. 📱 **Testa conexão** do WhatsApp

## 🎯 Resultado esperado:

Após executar, você deve ver:
- ✅ Webhook configurado corretamente
- 📱 Status da conexão WhatsApp
- 🔥 Sistema pronto para receber mensagens

## 🐛 Se der erro:

```bash
# Verificar se o servidor está rodando
pm2 status

# Reiniciar se necessário
pm2 restart chatbot-whats-api

# Ver logs de erro
pm2 logs chatbot-whats-api --err
```

## 📱 Como testar:

1. Envie uma mensagem para o WhatsApp conectado
2. Verifique os logs: `pm2 logs chatbot-whats-api`
3. Deve aparecer: "📨 Webhook recebido do Whapi"

---

## ⚡ COMANDO RÁPIDO:

```bash
cd /home/chatbotwhats/htdocs/chatbotwhats.online && node fix-whapi-webhook-production.js
```

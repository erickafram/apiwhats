# 🚀 Guia de Configuração Maytapi WhatsApp API

Este guia mostra como configurar e usar a Maytapi WhatsApp API no seu projeto de chatbot.

## 📋 Pré-requisitos

1. **Conta na Maytapi**: Acesse [maytapi.com](https://maytapi.com) e crie uma conta
2. **Credenciais fornecidas**:
   - Product ID: `ebba8265-1e89-4e6a-8255-7eee3e64b7f5`
   - Token: `af87a53c-3b0f-4188-b5de-2f7ed0acddda`

## ⚙️ Configuração

### 1. Criar Instância na Dashboard Maytapi

**IMPORTANTE**: Antes de configurar o projeto, você precisa criar uma instância de telefone na dashboard da Maytapi:

1. **Acesse a Dashboard**: [https://console.maytapi.com/](https://console.maytapi.com/)
2. **Faça Login** com suas credenciais
3. **Vá em "Phones"** no menu lateral
4. **Clique em "Add Phone"** ou "Create Phone Instance"
5. **Aguarde** a criação da instância (pode levar alguns segundos)
6. **Anote o Phone ID** que será gerado

### 2. Configurar Variáveis de Ambiente

Adicione as seguintes linhas no arquivo `.env`:

```env
# Configurações da Maytapi WhatsApp API
MAYTAPI_PRODUCT_ID=ebba8265-1e89-4e6a-8255-7eee3e64b7f5
MAYTAPI_TOKEN=af87a53c-3b0f-4188-b5de-2f7ed0acddda
MAYTAPI_API_URL=https://api.maytapi.com/api
USE_MAYTAPI=true

# Opcional: Número para testes
TEST_PHONE_NUMBER=5511999999999
```

### 2. Instalar Dependências

As dependências necessárias já estão incluídas no projeto:
- `axios` - Para requisições HTTP
- `qrcode` - Para gerar QR codes

### 3. Iniciar o Servidor

```bash
npm start
```

## 🧪 Testes

### Teste Básico da API

```bash
node test-maytapi-integration.js
```

Este teste verifica:
- ✅ Autenticação com a Maytapi
- ✅ Criação de instâncias
- ✅ Geração de QR codes
- ✅ Status das conexões

### Teste Completo do Bot

```bash
node test-maytapi-bot.js
```

Este teste verifica:
- ✅ Servidor funcionando
- ✅ Conexão do bot via Maytapi
- ✅ Geração de QR code
- ✅ Envio de mensagens (se configurado)

## 🔗 Configuração do Webhook

Para receber mensagens, configure o webhook na dashboard da Maytapi:

### 1. Acesse a Dashboard
- URL: [https://maytapi.com/dashboard](https://maytapi.com/dashboard)
- Faça login com suas credenciais

### 2. Configurar Webhook
1. Vá em **Settings** > **Webhooks**
2. Adicione uma nova URL de webhook:
   ```
   http://seu-dominio.com/api/maytapi/webhook
   ```
3. Selecione os eventos:
   - ✅ `message` - Para receber mensagens
   - ✅ `status` - Para atualizações de status

### 3. Para Desenvolvimento Local
Se estiver testando localmente, use um serviço como [ngrok](https://ngrok.com):

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 5000

# Use a URL gerada pelo ngrok
https://abc123.ngrok.io/api/maytapi/webhook
```

## 📱 Como Usar

### 1. Acessar o Frontend
```
http://localhost:3000/bots
```

### 2. Criar um Bot
1. Clique em "Criar Novo Bot"
2. Preencha as informações
3. Ative o bot

### 3. Conectar WhatsApp
1. Clique em "Conectar WhatsApp" no bot
2. Escaneie o QR code com o WhatsApp
3. Aguarde a confirmação de conexão

### 4. Testar Mensagens
1. Envie uma mensagem para o número conectado
2. O bot deve responder automaticamente
3. Verifique os logs no console

## 🔧 Endpoints da API

### Conexões
```http
GET /api/maytapi/connections
```
Lista todas as conexões ativas.

### Conectar Bot
```http
POST /api/maytapi/connect/:botId
```
Conecta um bot específico via Maytapi.

### Desconectar Bot
```http
POST /api/maytapi/disconnect/:botId
```
Desconecta um bot específico.

### Obter QR Code
```http
GET /api/maytapi/qr/:botId
```
Obtém o QR code para autenticação.

### Enviar Mensagem de Teste
```http
POST /api/maytapi/send-test
Content-Type: application/json

{
  "botId": 1,
  "to": "5511999999999",
  "message": "Mensagem de teste"
}
```

### Webhook (Receber Mensagens)
```http
POST /api/maytapi/webhook
Content-Type: application/json

{
  "type": "message",
  "phone_id": "123",
  "message": {
    "from_number": "5511999999999",
    "text": "Olá!",
    "type": "text"
  }
}
```

## 🐛 Solução de Problemas

### Erro de Autenticação
```
❌ Erro 401: Unauthorized
```
**Solução**: Verifique se `MAYTAPI_PRODUCT_ID` e `MAYTAPI_TOKEN` estão corretos.

### QR Code Não Aparece
```
⚠️ QR Code não disponível
```
**Solução**: 
1. Aguarde alguns segundos após criar a instância
2. Tente gerar novamente
3. Verifique se a instância foi criada corretamente

### Mensagens Não São Recebidas
```
⚠️ Webhook não está funcionando
```
**Solução**:
1. Verifique se o webhook está configurado na Maytapi
2. Teste a URL do webhook
3. Verifique os logs do servidor

### Bot Não Conecta
```
❌ Bot não conectado
```
**Solução**:
1. Verifique se `USE_MAYTAPI=true` no .env
2. Reinicie o servidor
3. Verifique os logs de erro

## 📊 Monitoramento

### Logs do Servidor
```bash
# Ver logs em tempo real
tail -f logs/app.log

# Ou no console
npm start
```

### Status das Conexões
```bash
curl http://localhost:5000/api/maytapi/connections
```

### Health Check
```bash
curl http://localhost:5000/health
```

## 🎯 Próximos Passos

1. **Configurar Webhook**: Configure o webhook na dashboard da Maytapi
2. **Testar Fluxos**: Crie fluxos de conversa no frontend
3. **Configurar IA**: Configure a integração com IA para respostas automáticas
4. **Deploy**: Faça deploy em um servidor com domínio público
5. **Monitoramento**: Configure logs e monitoramento em produção

## 📞 Suporte

- **Documentação Maytapi**: [docs.maytapi.com](https://docs.maytapi.com)
- **Dashboard Maytapi**: [maytapi.com/dashboard](https://maytapi.com/dashboard)
- **Logs do Sistema**: Verifique `logs/app.log` para detalhes

---

✅ **Configuração concluída!** Seu chatbot agora está integrado com a Maytapi WhatsApp API.

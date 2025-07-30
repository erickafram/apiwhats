# 🚀 Guia Rápido de Correção - Maytapi Integration

## ❌ Problemas Identificados

1. **Erro no Banco de Dados**: Falta coluna `template_id` na tabela `flows`
2. **Nenhuma Instância Maytapi**: Precisa criar instância na dashboard

## ✅ Soluções

### 1. Corrigir Banco de Dados

**Opção A - phpMyAdmin (Recomendado):**
1. Acesse: `http://localhost/phpmyadmin`
2. Selecione o banco `whatsapp_chatbot`
3. Vá na aba "SQL"
4. Execute o conteúdo do arquivo `fix-database.sql`:

```sql
USE whatsapp_chatbot;
ALTER TABLE flows ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) NULL AFTER statistics;
CREATE INDEX IF NOT EXISTS flows_template_id_index ON flows(template_id);
```

**Opção B - Linha de Comando:**
```bash
# Se tiver MySQL CLI instalado
mysql -u root -p whatsapp_chatbot < fix-database.sql
```

### 2. Criar Instância na Maytapi

1. **Acesse**: [https://console.maytapi.com/](https://console.maytapi.com/)
2. **Login** com suas credenciais
3. **Menu "Phones"** → **"Add Phone"**
4. **Aguarde** a criação da instância
5. **Anote o Phone ID** gerado

### 3. Verificar Configuração

Execute para verificar se tudo está OK:
```bash
node setup-maytapi-instance.js
```

### 4. Reiniciar Servidor

```bash
# Parar servidor atual (Ctrl+C)
# Depois reiniciar:
npm start
```

## 🧪 Testar Integração

### Teste 1 - API Maytapi
```bash
node test-maytapi-integration.js
```

### Teste 2 - Bot Completo
```bash
node test-maytapi-bot.js
```

### Teste 3 - Frontend
1. Acesse: `http://localhost:3000/bots`
2. Crie um novo bot
3. Clique em "Conectar WhatsApp"
4. Escaneie o QR Code

## 📱 Configurar Webhook (Opcional)

Para receber mensagens automaticamente:

1. **Dashboard Maytapi**: [https://console.maytapi.com/](https://console.maytapi.com/)
2. **Settings** → **Webhooks**
3. **Adicionar URL**: `http://seu-dominio.com/api/maytapi/webhook`
4. **Eventos**: `message`, `status`

Para desenvolvimento local, use [ngrok](https://ngrok.com):
```bash
npm install -g ngrok
ngrok http 5000
# Use a URL gerada: https://abc123.ngrok.io/api/maytapi/webhook
```

## 🔍 Verificar Status

### Conexões Ativas
```bash
curl http://localhost:5000/api/maytapi/connections
```

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs do Servidor
Verifique o console onde o servidor está rodando para logs em tempo real.

## 🆘 Problemas Comuns

### "Unknown column 'flows.template_id'"
- **Solução**: Execute o SQL de correção no banco de dados

### "Nenhuma instância encontrada"
- **Solução**: Crie uma instância na dashboard da Maytapi

### "Erro de autenticação"
- **Solução**: Verifique `MAYTAPI_PRODUCT_ID` e `MAYTAPI_TOKEN` no `.env`

### "QR Code não aparece"
- **Solução**: Aguarde alguns segundos após conectar o bot

### "Mensagens não são recebidas"
- **Solução**: Configure o webhook na dashboard da Maytapi

## 📞 Suporte

- **Documentação**: [maytapi.com/whatsapp-api-documentation](https://maytapi.com/whatsapp-api-documentation)
- **Dashboard**: [console.maytapi.com](https://console.maytapi.com)
- **Status**: Verifique logs do servidor para detalhes

---

## ✅ Checklist Final

- [ ] Banco de dados corrigido (coluna `template_id` adicionada)
- [ ] Instância criada na dashboard Maytapi
- [ ] Variáveis `.env` configuradas
- [ ] Servidor reiniciado
- [ ] Testes executados com sucesso
- [ ] Frontend acessível em `http://localhost:3000/bots`
- [ ] Bot criado e conectado
- [ ] QR Code escaneado
- [ ] Webhook configurado (opcional)

**🎉 Quando todos os itens estiverem marcados, sua integração Maytapi estará funcionando!**

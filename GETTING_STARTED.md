# 🚀 Guia de Início Rápido - WhatsApp Chatbot System

Este guia irá ajudá-lo a configurar e executar o sistema de chatbot WhatsApp em poucos minutos.

## ⚡ Início Rápido

### 1. Configuração Inicial
```bash
# Clone o repositório (se ainda não fez)
git clone <repository-url>
cd whatsapp-chatbot-system

# Execute o script de configuração automática
npm run setup
```

### 2. Configure o Banco de Dados
```bash
# Crie o banco MySQL
mysql -u root -p
CREATE DATABASE whatsapp_chatbot;
exit

# Execute as migrations
npm run migrate

# (Opcional) Carregue dados de demonstração
npm run seed:demo
```

### 3. Configure as Variáveis de Ambiente
Edite o arquivo `.env`:
```env
# Banco de dados - OBRIGATÓRIO
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=whatsapp_chatbot

# JWT - OBRIGATÓRIO (mude em produção)
JWT_SECRET=sua_chave_secreta_jwt_muito_segura_aqui

# Together.xyz - JÁ CONFIGURADO
TOGETHER_API_TOKEN=8f2666a67bee6b36fbc09d507c0b2e4e4059ae3c3a78672448eefaf248cd673b
```

### 4. Inicie o Servidor
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:5000`

### 5. Teste o Sistema
```bash
# Em outro terminal, execute os testes
npm run test:system
```

## 🎯 Primeiros Passos

### Criar sua primeira conta
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Seu Nome",
    "email": "seu@email.com",
    "password": "suasenha123"
  }'
```

### Fazer login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "suasenha123"
  }'
```

Salve o `token` retornado para usar nas próximas requisições.

### Criar seu primeiro bot
```bash
curl -X POST http://localhost:5000/api/bots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Meu Primeiro Bot",
    "description": "Bot de atendimento ao cliente"
  }'
```

### Conectar ao WhatsApp
```bash
curl -X POST http://localhost:5000/api/bots/1/connect \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Escaneie o QR Code retornado com seu WhatsApp.

## 📱 Usando Dados Demo

Se você executou `npm run seed:demo`, pode usar estas contas:

**Admin:**
- Email: `admin@whatsapp-bot.com`
- Senha: `admin123`

**Usuário Demo:**
- Email: `demo@whatsapp-bot.com`
- Senha: `user123`

O usuário demo já tem um bot configurado com fluxos de exemplo.

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor em modo desenvolvimento
npm run start            # Iniciar servidor em produção

# Banco de dados
npm run migrate          # Executar migrations
npm run migrate:undo     # Desfazer última migration
npm run seed:demo        # Carregar dados demo
npm run db:create        # Criar banco de dados
npm run db:drop          # Deletar banco de dados

# Testes
npm run test:system      # Testar sistema completo
npm test                 # Executar testes unitários

# Configuração
npm run setup            # Configuração inicial completa
```

## 🎨 Estrutura dos Fluxos

### Tipos de Nós Disponíveis:

1. **Start** - Início da conversa
   ```json
   {
     "type": "start",
     "data": {
       "message": "Olá! Como posso ajudar?"
     }
   }
   ```

2. **Fixed Response** - Resposta fixa
   ```json
   {
     "type": "fixed_response",
     "data": {
       "message": "Esta é uma resposta pré-definida",
       "delay": 1000
     }
   }
   ```

3. **AI Response** - Resposta com IA
   ```json
   {
     "type": "ai_response",
     "data": {
       "system_prompt": "Você é um assistente útil",
       "temperature": 0.7,
       "max_tokens": 500
     }
   }
   ```

4. **Condition** - Condicionais
   ```json
   {
     "type": "condition",
     "data": {
       "conditions": [
         {
           "field": "message_content",
           "operator": "contains",
           "value": "sim"
         }
       ],
       "operator": "AND"
     }
   }
   ```

5. **Input Capture** - Capturar entrada
   ```json
   {
     "type": "input_capture",
     "data": {
       "variable_name": "nome_usuario",
       "input_type": "text",
       "validation": {
         "required": true,
         "min_length": 2
       }
     }
   }
   ```

6. **End** - Finalizar conversa
   ```json
   {
     "type": "end",
     "data": {
       "message": "Obrigado pelo contato!",
       "reset_session": false
     }
   }
   ```

## 🤖 Configuração da IA

### Configurações Disponíveis:
```json
{
  "ai_config": {
    "enabled": true,
    "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    "temperature": 0.7,
    "max_tokens": 1000,
    "system_prompt": "Você é um assistente virtual útil e amigável."
  }
}
```

### Parâmetros:
- **temperature**: 0.0 (mais determinístico) a 2.0 (mais criativo)
- **max_tokens**: Máximo de tokens na resposta (1-4000)
- **system_prompt**: Instruções para o comportamento da IA

## 📊 Monitoramento

### Verificar Status do Sistema:
```bash
curl http://localhost:5000/health
```

### Ver Analytics:
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:5000/api/analytics/dashboard
```

### Monitorar Conversas:
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:5000/api/conversations
```

## 🔍 Troubleshooting

### Problema: Servidor não inicia
**Solução:**
1. Verifique se o MySQL está rodando
2. Confirme as configurações no `.env`
3. Execute `npm run migrate`

### Problema: QR Code não aparece
**Solução:**
1. Verifique se o bot está ativo
2. Tente reconectar: `POST /api/bots/:id/connect`
3. Verifique os logs do servidor

### Problema: IA não responde
**Solução:**
1. Verifique o `TOGETHER_API_TOKEN` no `.env`
2. Confirme se `ai_config.enabled = true`
3. Verifique os logs de erro

### Problema: Mensagens não chegam
**Solução:**
1. Confirme que o WhatsApp está conectado
2. Verifique se há fluxos ativos
3. Monitore os logs em tempo real

## 📞 Próximos Passos

1. **Crie seus próprios fluxos** usando a API
2. **Configure webhooks** para integrações externas
3. **Monitore analytics** para otimizar performance
4. **Implemente templates** para casos de uso específicos

## 🎉 Pronto!

Seu sistema de chatbot WhatsApp está funcionando! 

Para dúvidas, consulte:
- `README.md` - Documentação completa
- Logs em `logs/app.log`
- API endpoints em `/api/*`

**Desenvolvido com ❤️ para automatizar seu atendimento no WhatsApp!**

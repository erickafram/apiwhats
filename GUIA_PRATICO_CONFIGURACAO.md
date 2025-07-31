# 🚀 Guia Prático: Configurar Bot com IA (Passo a Passo)

## 📋 Situação Atual
✅ **Maytapi funcionando** (instância 103174 - número 556392901378)  
✅ **IA configurada** (Together.xyz com Llama-3.3-70B)  
✅ **Servidor rodando** (porta 5000)  
✅ **Processamento automático** implementado  

## 🎯 Objetivo
Configurar um bot que responda automaticamente com IA às mensagens recebidas.

---

## 📱 PASSO 1: Acessar o Frontend

1. **Abra seu navegador**
2. **Acesse**: `http://localhost:3000/bots`
3. **Se pedir login**, use credenciais de administrador

---

## 🤖 PASSO 2: Criar Bot com IA

### 2.1 Criar Novo Bot
1. Clique em **"Criar Novo Bot"** ou **"+"**
2. Preencha os dados:

```
Nome: Bot IA Atendimento
Descrição: Bot inteligente para atendimento automático
Telefone: (deixe vazio - será preenchido automaticamente)
Status: ✅ Ativo
```

### 2.2 Configurar IA
Na seção **"Configurações de IA"**:

```json
{
  "ai_enabled": true,
  "ai_model": "deepseek-ai/DeepSeek-V3",
  "welcome_message": "Olá! 👋 Sou seu assistente virtual inteligente. Como posso ajudá-lo hoje?",
  "ai_prompt": "Você é um assistente virtual prestativo e amigável. Responda de forma clara, educada e profissional. Use emojis moderadamente para tornar a conversa mais amigável.",
  "fallback_message": "Desculpe, não entendi sua mensagem. Pode reformular sua pergunta?",
  "use_context": true,
  "max_tokens": 150,
  "temperature": 0.7
}
```

### 2.3 Salvar Bot
1. Clique em **"Salvar"**
2. **Anote o ID do bot** (ex: 1, 2, 3...)

---

## 🔗 PASSO 3: Conectar Bot ao WhatsApp

### 3.1 Conectar via Frontend
1. Na lista de bots, clique em **"Conectar WhatsApp"**
2. O sistema usará automaticamente a instância **103174**
3. Aguarde a confirmação de conexão

### 3.2 Verificar Conexão
- Status deve mostrar: **"Conectado"**
- Phone ID: **103174**
- Número: **556392901378**

---

## 📡 PASSO 4: Configurar Webhook (IMPORTANTE!)

### 4.1 Acessar Dashboard Maytapi
1. **Abra**: [https://console.maytapi.com/](https://console.maytapi.com/)
2. **Faça login** com suas credenciais
3. **Vá em**: Settings → Webhooks

### 4.2 Configurar Webhook
```
URL: http://seu-dominio.com/api/maytapi/webhook
Método: POST
Eventos: ✅ message, ✅ status
```

### 4.3 Para Desenvolvimento Local (ngrok)
```bash
# Instalar ngrok (se não tiver)
npm install -g ngrok

# Expor porta local
ngrok http 5000

# Copiar URL gerada (ex: https://abc123.ngrok.io)
# Usar no webhook: https://abc123.ngrok.io/api/maytapi/webhook
```

---

## 🧪 PASSO 5: Testar o Sistema

### 5.1 Teste Manual
1. **Envie mensagem** para: **556392901378**
2. **Digite**: "Olá, preciso de ajuda"
3. **Aguarde** a resposta automática da IA

### 5.2 Teste via Script
```bash
# Substitua BOT_ID pelo ID do seu bot
node -e "
const axios = require('axios');
axios.post('http://localhost:5000/api/maytapi/webhook', {
  type: 'message',
  phone_id: '103174',
  message: {
    from_number: '5511999999999',
    text: 'Olá! Como você pode me ajudar?',
    type: 'text'
  }
}).then(() => console.log('✅ Teste enviado!')).catch(console.error);
"
```

---

## 📊 PASSO 6: Monitorar e Ajustar

### 6.1 Verificar Logs
```bash
# Ver logs do servidor
tail -f logs/app.log

# Ou verificar console onde o servidor está rodando
```

### 6.2 Verificar Conversas
1. **Frontend**: `http://localhost:3000/conversations`
2. **API**: `curl http://localhost:5000/api/conversations`

### 6.3 Ajustar IA
Se as respostas não estão boas:
1. **Edite o bot** no frontend
2. **Ajuste o prompt** da IA
3. **Modifique a temperatura** (0.1 = mais conservador, 0.9 = mais criativo)

---

## 🎨 PASSO 7: Personalizar Respostas

### 7.1 Exemplos de Prompts

**Atendimento Formal:**
```
Você é um assistente virtual profissional da empresa XYZ. Seja sempre educado, formal e prestativo. Responda de forma clara e objetiva.
```

**Atendimento Amigável:**
```
Você é um assistente virtual amigável e descontraído. Use emojis, seja carismático e torne a conversa agradável, mas sempre profissional.
```

**Suporte Técnico:**
```
Você é um especialista em suporte técnico. Faça perguntas específicas para entender o problema e ofereça soluções passo a passo.
```

### 7.2 Configurar Contexto
```json
{
  "use_context": true,
  "context_messages": 5,
  "remember_user": true,
  "user_variables": ["name", "email", "problem_type"]
}
```

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### ❌ Bot não responde
**Verificar:**
- ✅ Webhook configurado na Maytapi
- ✅ Bot está ativo e conectado
- ✅ `ai_enabled: true` nas configurações
- ✅ Token da Together.xyz válido

### ❌ Respostas estranhas
**Ajustar:**
- ✅ Prompt da IA mais específico
- ✅ Temperatura menor (0.3-0.5)
- ✅ Max tokens adequado (100-200)

### ❌ Webhook não funciona
**Verificar:**
- ✅ URL acessível publicamente
- ✅ HTTPS (obrigatório para produção)
- ✅ Eventos corretos selecionados

---

## 🎉 RESULTADO FINAL

Após seguir todos os passos:

✅ **Bot criado e ativo**  
✅ **IA configurada e funcionando**  
✅ **WhatsApp conectado** (556392901378)  
✅ **Webhook configurado**  
✅ **Respostas automáticas** funcionando  

### 📱 Como Testar:
1. **Envie mensagem** para: **556392901378**
2. **A IA responderá automaticamente**
3. **Monitore no frontend**: `http://localhost:3000/bots`

---

## 🚀 PRÓXIMOS PASSOS

1. **✅ Criar fluxos personalizados**
2. **✅ Configurar múltiplos bots**
3. **✅ Integrar com CRM/banco de dados**
4. **✅ Adicionar análises e relatórios**
5. **✅ Deploy em produção**

**🎯 Seu chatbot inteligente está pronto para atender clientes 24/7!** 🤖

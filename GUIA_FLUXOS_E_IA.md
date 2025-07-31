# 🤖 Guia Completo: Fluxos e IA para WhatsApp Bot

## 📋 Visão Geral

Seu sistema já tem:
- ✅ **Maytapi integrada** (instância 103174)
- ✅ **IA configurada** (Together.xyz com Llama-3.3-70B)
- ✅ **Processamento automático** de mensagens
- ✅ **Sistema de fluxos** para conversas estruturadas

## 🚀 Como Funciona

### 1. **Fluxo de Mensagens**
```
Cliente envia mensagem → Maytapi → Webhook → BotManager → IA/Fluxo → Resposta
```

### 2. **Tipos de Resposta**
- **IA Livre**: Resposta inteligente baseada no contexto
- **Fluxos Estruturados**: Conversas guiadas (menu, formulários, etc.)
- **Híbrido**: Combina fluxos com IA

## 🎯 Configurando seu Bot

### 1. **Acessar o Frontend**
```
http://localhost:3000/bots
```

### 2. **Criar/Editar Bot**
1. Clique em "Criar Novo Bot" ou edite um existente
2. Configure as informações básicas:
   - **Nome**: Ex: "Atendimento Virtual"
   - **Descrição**: Ex: "Bot para atendimento ao cliente"
   - **Ativo**: ✅ Marcar como ativo

### 3. **Configurar IA**
No formulário do bot, configure:

```json
{
  "ai_enabled": true,
  "ai_model": "deepseek-ai/DeepSeek-V3",
  "ai_prompt": "Você é um assistente virtual prestativo. Responda de forma amigável e profissional.",
  "welcome_message": "Olá! 👋 Sou seu assistente virtual. Como posso ajudá-lo hoje?",
  "fallback_message": "Desculpe, não entendi. Pode reformular sua pergunta?"
}
```

## 🔧 Criando Fluxos

### 1. **Fluxo Simples - Menu Principal**

```json
{
  "name": "Menu Principal",
  "trigger_keywords": ["menu", "opções", "ajuda", "oi", "olá"],
  "flow_data": {
    "nodes": [
      {
        "id": "welcome",
        "type": "message",
        "content": "Olá! 👋 Escolha uma opção:\n\n1️⃣ Informações\n2️⃣ Suporte\n3️⃣ Vendas\n4️⃣ Falar com humano",
        "next": "wait_option"
      },
      {
        "id": "wait_option",
        "type": "input",
        "conditions": [
          {
            "input": "1",
            "next": "info"
          },
          {
            "input": "2",
            "next": "support"
          },
          {
            "input": "3",
            "next": "sales"
          },
          {
            "input": "4",
            "next": "human"
          }
        ],
        "fallback": "invalid_option"
      },
      {
        "id": "info",
        "type": "message",
        "content": "📋 Aqui estão nossas informações:\n\n🕒 Horário: 8h às 18h\n📍 Endereço: Rua Example, 123\n📞 Telefone: (11) 99999-9999",
        "next": "end"
      },
      {
        "id": "support",
        "type": "message",
        "content": "🛠️ Suporte Técnico\n\nDescreva seu problema que nosso time irá ajudá-lo!",
        "next": "ai_mode"
      },
      {
        "id": "sales",
        "type": "message",
        "content": "💰 Vendas\n\nQue produto você tem interesse? Nossa IA pode ajudá-lo!",
        "next": "ai_mode"
      },
      {
        "id": "human",
        "type": "message",
        "content": "👨‍💼 Transferindo para atendente humano...\n\nAguarde um momento.",
        "next": "transfer_human"
      },
      {
        "id": "invalid_option",
        "type": "message",
        "content": "❌ Opção inválida. Digite um número de 1 a 4.",
        "next": "wait_option"
      },
      {
        "id": "ai_mode",
        "type": "ai",
        "prompt": "Continue a conversa de forma natural e prestativa."
      }
    ]
  }
}
```

### 2. **Fluxo de Coleta de Dados**

```json
{
  "name": "Cadastro Cliente",
  "trigger_keywords": ["cadastro", "registrar"],
  "flow_data": {
    "nodes": [
      {
        "id": "start",
        "type": "message",
        "content": "📝 Vamos fazer seu cadastro!\n\nQual é o seu nome completo?",
        "next": "get_name"
      },
      {
        "id": "get_name",
        "type": "input",
        "variable": "customer_name",
        "validation": "required",
        "next": "get_email"
      },
      {
        "id": "get_email",
        "type": "message",
        "content": "Obrigado, {{customer_name}}! 😊\n\nAgora, qual é o seu e-mail?",
        "next": "input_email"
      },
      {
        "id": "input_email",
        "type": "input",
        "variable": "customer_email",
        "validation": "email",
        "next": "confirm"
      },
      {
        "id": "confirm",
        "type": "message",
        "content": "✅ Cadastro realizado com sucesso!\n\n👤 Nome: {{customer_name}}\n📧 E-mail: {{customer_email}}\n\nObrigado!",
        "next": "end"
      }
    ]
  }
}
```

## 🎨 Configurações Avançadas de IA

### 1. **Personalidade do Bot**

```json
{
  "ai_config": {
    "personality": "profissional_amigavel",
    "tone": "formal_mas_acessivel",
    "language": "pt-BR",
    "max_tokens": 150,
    "temperature": 0.7,
    "system_prompt": "Você é um assistente virtual da empresa XYZ. Seja sempre educado, prestativo e profissional. Use emojis moderadamente. Se não souber algo, seja honesto e ofereça alternativas."
  }
}
```

### 2. **Contexto e Memória**

```json
{
  "ai_config": {
    "use_context": true,
    "context_messages": 5,
    "remember_user": true,
    "user_variables": ["name", "email", "preferences"]
  }
}
```

## 📱 Testando o Sistema

### 1. **Teste Manual via API**

```bash
# Simular mensagem recebida
curl -X POST http://localhost:5000/api/maytapi/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message",
    "phone_id": "103174",
    "message": {
      "from_number": "5511999999999",
      "text": "oi",
      "type": "text"
    }
  }'
```

### 2. **Teste via WhatsApp**
1. Envie uma mensagem para: **556392901378**
2. Digite: "oi" ou "menu"
3. Siga o fluxo de conversa

## 🔧 Configuração do Webhook

Para receber mensagens automaticamente:

### 1. **Dashboard Maytapi**
1. Acesse: [https://console.maytapi.com/](https://console.maytapi.com/)
2. Vá em **Settings** → **Webhooks**
3. Adicione: `http://seu-dominio.com/api/maytapi/webhook`
4. Eventos: ✅ `message`, ✅ `status`

### 2. **Para Desenvolvimento Local (ngrok)**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 5000

# Usar URL gerada no webhook
# Ex: https://abc123.ngrok.io/api/maytapi/webhook
```

## 📊 Monitoramento

### 1. **Logs do Sistema**
```bash
# Ver logs em tempo real
tail -f logs/app.log
```

### 2. **Verificar Conversas**
```bash
# API para listar conversas
curl http://localhost:5000/api/conversations
```

### 3. **Status das Conexões**
```bash
# Verificar bots conectados
curl http://localhost:5000/api/maytapi/connections
```

## 🎯 Próximos Passos

1. **✅ Configure o webhook** na Maytapi
2. **✅ Crie seus fluxos** no frontend
3. **✅ Teste com mensagens reais**
4. **✅ Ajuste a personalidade da IA**
5. **✅ Monitore as conversas**

## 🆘 Solução de Problemas

### Bot não responde
- ✅ Verifique se o webhook está configurado
- ✅ Verifique logs do servidor
- ✅ Teste a API manualmente

### IA não funciona
- ✅ Verifique `TOGETHER_API_TOKEN` no .env
- ✅ Verifique se `ai_enabled: true` no bot
- ✅ Verifique logs de erro

### Fluxos não funcionam
- ✅ Verifique sintaxe JSON dos fluxos
- ✅ Verifique se as palavras-chave estão corretas
- ✅ Teste fluxos simples primeiro

---

🎉 **Seu bot está pronto para conversar inteligentemente!** 🤖

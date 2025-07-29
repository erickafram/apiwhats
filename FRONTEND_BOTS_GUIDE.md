# 🤖 Guia da Interface de Bots

## 🎯 Visão Geral

A interface de gerenciamento de bots foi completamente implementada e está funcionando! Agora você pode criar, gerenciar e conectar seus bots de WhatsApp através de uma interface visual moderna e intuitiva.

## 🌐 Acesso

- **URL do Frontend:** http://localhost:3001
- **Página de Bots:** http://localhost:3001/bots

## ✨ Funcionalidades Implementadas

### 📋 **1. Listagem de Bots**
- Cards visuais para cada bot
- Status em tempo real (Ativo/Inativo/Conectado)
- Informações principais: nome, descrição, data de criação
- Chips indicativos: status, IA ativa, número do WhatsApp

### ➕ **2. Criação de Novos Bots**
- Botão "Novo Bot" no canto superior direito
- Dialog modal com formulário completo
- Campos disponíveis:
  - **Nome** (obrigatório, 2-100 caracteres)
  - **Descrição** (opcional, até 500 caracteres)
  - **Configurações de IA:**
    - Habilitar/desabilitar IA
    - Temperature (0.0-2.0)
    - Máximo de tokens (1-4000)
    - Prompt do sistema personalizado

### ⚡ **3. Gerenciamento de Bots**
- **Ativar/Desativar:** Botão play/stop em cada card
- **Conectar WhatsApp:** Botão WhatsApp que gera QR Code
- **Configurações:** Acesso às configurações detalhadas
- **Analytics:** Visualizar métricas do bot

### 📱 **4. Conexão WhatsApp**
- Modal dedicado com QR Code
- Instruções passo-a-passo
- Interface visual moderna
- Renovação automática do QR Code

### 🔧 **5. Menu de Contexto**
- Botão de três pontos em cada card
- Opções disponíveis:
  - Configurações
  - Gerenciar Fluxos
  - Ver Conversas
  - Deletar Bot

## 🚀 Como Usar

### **Criar seu Primeiro Bot:**

1. **Acesse:** http://localhost:3001/bots
2. **Clique em:** "Novo Bot" (canto superior direito)
3. **Preencha:**
   - Nome: "Meu Bot de Atendimento"
   - Descrição: "Bot para atendimento ao cliente"
   - Configure a IA conforme necessário
4. **Clique em:** "Criar Bot"

### **Ativar e Conectar:**

1. **Ativar:** Clique no botão ▶️ (play) no card do bot
2. **Conectar:** Clique no botão WhatsApp 📱
3. **Escanear:** Use o QR Code que aparecerá no modal
4. **Aguardar:** A conexão será estabelecida automaticamente

### **Gerenciar Fluxos:**

1. **Menu:** Clique nos três pontos (⋮) no card do bot
2. **Selecione:** "Gerenciar Fluxos"
3. **Criar:** Fluxos de conversa personalizados

## 📊 Status dos Bots

### **Cores dos Status:**
- 🟢 **Verde:** Bot conectado ao WhatsApp
- 🟡 **Amarelo:** Bot ativo mas não conectado
- ⚪ **Cinza:** Bot inativo

### **Chips Informativos:**
- **"Conectado"** - Bot está online no WhatsApp
- **"Ativo"** - Bot está funcionando mas não conectado
- **"Inativo"** - Bot está desligado
- **"IA Ativa"** - Inteligência artificial habilitada
- **Número** - Número do WhatsApp conectado

## 🔧 Configurações Avançadas

### **IA Configuration:**
- **Temperature:** Controla criatividade (0.0 = conservador, 2.0 = criativo)
- **Max Tokens:** Tamanho máximo das respostas
- **System Prompt:** Define personalidade e comportamento

### **Exemplo de Prompt:**
```
Você é um assistente virtual especializado em atendimento ao cliente. 
Seja sempre educado, prestativo e profissional. 
Responda em português brasileiro de forma clara e objetiva.
```

## 🛠️ Troubleshooting

### **Bot não aparece na lista:**
- Verifique se está logado
- Atualize a página (F5)
- Verifique se o backend está rodando

### **Erro ao criar bot:**
- Verifique se o nome tem pelo menos 2 caracteres
- Verifique conexão com a internet
- Veja o console do navegador (F12)

### **QR Code não aparece:**
- Verifique se o bot está ativo
- Tente desconectar e conectar novamente
- Verifique se o serviço WhatsApp está configurado

## 📱 Próximos Passos

Após criar e conectar seu bot:

1. **Criar Fluxos:** Defina automações de conversa
2. **Configurar Webhooks:** Integre com sistemas externos
3. **Monitorar Analytics:** Acompanhe métricas de performance
4. **Gerenciar Conversas:** Visualize e responda mensagens

## 🎉 Conclusão

A interface está completamente funcional e pronta para uso! Você pode:

- ✅ Criar bots facilmente
- ✅ Gerenciar múltiplos bots
- ✅ Conectar ao WhatsApp
- ✅ Configurar IA personalizada
- ✅ Monitorar status em tempo real

**🚀 Acesse agora: http://localhost:3001/bots**

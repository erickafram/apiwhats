# 🔘 Guia de Botões Interativos WhatsApp

## 📋 Visão Geral

Os botões interativos no WhatsApp permitem que os usuários respondam rapidamente através de botões predefinidos ao invés de digitar texto. Esta funcionalidade aumenta significativamente a taxa de resposta e melhora a experiência do usuário.

## ✨ Benefícios

- **🚀 Maior Taxa de Resposta**: Botões são mais fáceis e rápidos de usar
- **📱 Melhor UX**: Interface mais intuitiva e moderna
- **🎯 Respostas Padronizadas**: Elimina erros de digitação
- **⚡ Processamento Mais Rápido**: Respostas podem ser processadas automaticamente

## 🛠️ Como Implementar

### 1. Criar Nó de Botões Interativos

```json
{
  "id": "menu_botoes",
  "type": "interactive_buttons",
  "position": {"x": 0, "y": 150},
  "next": "processar_resposta",
  "content": "Escolha uma opção:",
  "data": {
    "content": "👋 *Bem-vindo!*\n\nEscolha uma das opções abaixo:",
    "buttons": [
      {
        "id": "opcao_1",
        "title": "🎯 Opção 1"
      },
      {
        "id": "opcao_2", 
        "title": "🚀 Opção 2"
      },
      {
        "id": "opcao_3",
        "title": "💡 Opção 3"
      }
    ],
    "footer": "Escolha tocando no botão"
  }
}
```

### 2. Criar Nó de Condição para Processar Respostas

```json
{
  "id": "processar_resposta",
  "type": "condition",
  "position": {"x": 0, "y": 300},
  "conditions": [
    {
      "variable": "user_input",
      "operator": "button_id",
      "value": "opcao_1",
      "next": "resposta_1"
    },
    {
      "variable": "user_input",
      "operator": "button_id", 
      "value": "opcao_2",
      "next": "resposta_2"
    },
    {
      "variable": "user_input",
      "operator": "button_id",
      "value": "opcao_3", 
      "next": "resposta_3"
    },
    {
      "variable": "user_input",
      "operator": "equals",
      "value": "1",
      "next": "resposta_1"
    },
    {
      "variable": "user_input",
      "operator": "equals",
      "value": "2",
      "next": "resposta_2"
    },
    {
      "variable": "user_input",
      "operator": "equals",
      "value": "3",
      "next": "resposta_3"
    },
    {
      "variable": "user_input",
      "operator": "default",
      "value": "",
      "next": "opcao_invalida"
    }
  ]
}
```

## 📐 Especificações Técnicas

### Limitações dos Botões

- **Máximo**: 3 botões por mensagem
- **Título**: Máximo 20 caracteres por botão
- **Footer**: Máximo 60 caracteres (opcional)
- **Body**: Máximo 1024 caracteres

### Tipos de Operadores de Condição

- `button_id`: Verifica se a resposta corresponde ao ID do botão
- `equals`: Verifica igualdade exata (funciona com números também)
- `contains`: Verifica se contém o texto
- `default`: Condição padrão se nenhuma outra for atendida

## 🔧 Compatibilidade

### Serviços Suportados

| Serviço | Suporte | Observações |
|---------|---------|-------------|
| **UltraMsg** | ✅ Completo | API nativa de botões |
| **Whapi.cloud** | ✅ Completo | API WhatsApp Business |
| **Baileys** | ✅ Completo | Biblioteca WhatsApp Web |
| **Maytapi** | ⚠️ Limitado | Fallback para texto |

### Fallback Automático

Se o serviço não suportar botões interativos, o sistema automaticamente converte para mensagem de texto numerada:

```
👋 Bem-vindo!

Escolha uma das opções abaixo:

1️⃣ 🎯 Opção 1
2️⃣ 🚀 Opção 2  
3️⃣ 💡 Opção 3

*Digite o número da opção desejada:*

_Escolha tocando no botão_
```

## 📱 Exemplos de Uso

### 1. Menu Principal

```json
{
  "content": "🏪 *MENU PRINCIPAL*\n\nComo posso ajudar você hoje?",
  "buttons": [
    {"id": "produtos", "title": "🛍️ Produtos"},
    {"id": "suporte", "title": "🆘 Suporte"},
    {"id": "contato", "title": "📞 Contato"}
  ],
  "footer": "Escolha uma opção"
}
```

### 2. Confirmação Sim/Não

```json
{
  "content": "❓ *CONFIRMAÇÃO*\n\nDeseja confirmar seu pedido?",
  "buttons": [
    {"id": "sim", "title": "✅ Sim, confirmar"},
    {"id": "nao", "title": "❌ Não, cancelar"}
  ]
}
```

### 3. Avaliação de Atendimento

```json
{
  "content": "⭐ *AVALIE NOSSO ATENDIMENTO*\n\nComo foi sua experiência?",
  "buttons": [
    {"id": "otimo", "title": "😍 Ótimo"},
    {"id": "bom", "title": "😊 Bom"},
    {"id": "ruim", "title": "😞 Ruim"}
  ],
  "footer": "Sua opinião é importante!"
}
```

## 🎨 Boas Práticas

### ✅ Fazer

- Use títulos descritivos e claros
- Inclua emojis para melhor visualização
- Mantenha textos concisos (máximo 20 chars)
- Sempre inclua fallback para texto
- Use IDs únicos e descritivos

### ❌ Evitar

- Títulos muito longos
- Muitas opções (máx. 3 botões)
- IDs genéricos como "btn1", "btn2"
- Botões sem contexto claro
- Dependência exclusiva de botões

## 🔄 Processamento de Respostas

### Webhook Response (UltraMsg)

```json
{
  "event_type": "message_received",
  "data": {
    "id": "msg_123",
    "from": "5511999999999",
    "button_reply": {
      "id": "opcao_1",
      "title": "🎯 Opção 1"
    },
    "type": "interactive"
  }
}
```

### Processamento no Sistema

1. **Detecção**: Sistema identifica resposta de botão
2. **Extração**: Extrai ID e título do botão
3. **Condições**: Avalia condições do nó seguinte
4. **Direcionamento**: Direciona para próximo nó apropriado

## 🚀 Implementação no Frontend

Em breve será adicionado suporte visual no editor de fluxos para:

- Arrastar e soltar nós de botões interativos
- Configurar botões visualmente
- Preview em tempo real
- Teste de botões no simulador

## 📞 Suporte

Para dúvidas sobre implementação:

1. Verifique este guia
2. Teste com o fluxo de exemplo (`exemplo-fluxo-botoes-interativos.json`)
3. Consulte logs do sistema para debug
4. Use o fallback de texto como backup

---

**💡 Dica**: Teste sempre em diferentes dispositivos e serviços para garantir compatibilidade máxima! 
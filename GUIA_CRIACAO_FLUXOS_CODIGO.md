# 🚀 Guia: Criação de Fluxos por Código

## 📋 Visão Geral

Agora você pode criar e editar fluxos conversacionais usando código JSON diretamente na interface web. Isso facilita:

- ✅ Criação rápida de fluxos complexos
- ✅ Compartilhamento de fluxos entre projetos
- ✅ Backup e versionamento de fluxos
- ✅ Edição avançada com controle total

## 🎯 Como Usar

### 1. Criar Fluxo por Código

1. Acesse: `http://localhost:3000/flows`
2. Clique na aba **"Criar por Código"**
3. Selecione o bot desejado
4. Cole ou digite o código JSON do fluxo
5. Clique em **"Criar Fluxo"**

### 2. Editar Fluxo por Código

1. Acesse: `http://localhost:3000/flows/{id}/edit`
2. Clique na aba **"Editar por Código"**
3. Modifique o código JSON
4. Clique em **"Aplicar Mudanças"**

## 📝 Estrutura do JSON

```json
{
  "name": "Nome do Fluxo",
  "description": "Descrição do fluxo",
  "trigger_keywords": ["palavra1", "palavra2"],
  "is_active": true,
  "is_default": false,
  "priority": 90,
  "flow_data": {
    "nodes": [
      {
        "id": "start",
        "type": "start",
        "position": { "x": 100, "y": 100 },
        "data": { "label": "Início" }
      },
      {
        "id": "message1",
        "type": "message",
        "position": { "x": 100, "y": 200 },
        "data": {
          "label": "Mensagem de Boas-vindas",
          "content": "Olá! Como posso ajudar?"
        }
      }
    ],
    "edges": [
      { "id": "e1", "source": "start", "target": "message1" }
    ],
    "viewport": { "x": 0, "y": 0, "zoom": 1 }
  }
}
```

## 🔧 Tipos de Nós

### 1. **start** - Nó de Início
```json
{
  "id": "start",
  "type": "start",
  "position": { "x": 100, "y": 100 },
  "data": { "label": "Início" }
}
```

### 2. **message** - Mensagem
```json
{
  "id": "welcome",
  "type": "message",
  "position": { "x": 100, "y": 200 },
  "data": {
    "label": "Boas-vindas",
    "content": "🚌 Olá! Como posso ajudar com passagens?"
  }
}
```

### 3. **input** - Captura de Entrada
```json
{
  "id": "get_name",
  "type": "input",
  "position": { "x": 100, "y": 300 },
  "data": {
    "label": "Capturar Nome",
    "variable": "user_name",
    "content": "Qual é o seu nome?",
    "validation": { "type": "required" },
    "errorMessage": "Por favor, digite seu nome."
  }
}
```

### 4. **condition** - Condição/Decisão
```json
{
  "id": "check_city",
  "type": "condition",
  "position": { "x": 100, "y": 400 },
  "data": {
    "label": "Verificar Cidade",
    "conditions": [
      {
        "variable": "destination",
        "operator": "contains_any",
        "value": ["goiania", "brasilia"],
        "next": "show_options"
      }
    ],
    "defaultNext": "city_not_available"
  }
}
```

### 5. **action** - Ação/Transferência
```json
{
  "id": "transfer",
  "type": "action",
  "position": { "x": 100, "y": 500 },
  "data": {
    "label": "Transferir para Humano",
    "action": "transfer_to_human",
    "department": "vendas"
  }
}
```

### 6. **end** - Fim do Fluxo
```json
{
  "id": "end",
  "type": "end",
  "position": { "x": 100, "y": 600 },
  "data": {
    "label": "Fim",
    "content": "Obrigado! Até logo!"
  }
}
```

## 🎯 Exemplo Prático: Venda de Passagens

O sistema inclui um exemplo completo de fluxo otimizado para venda de passagens de ônibus. Características:

- ⚡ **Resposta imediata** sobre disponibilidade
- 💰 **Preços visíveis** na primeira mensagem  
- 🎯 **Máximo 3 cliques** para comprar
- 🤖 **Transferência automática** para vendedor
- 📱 **Otimizado para mobile**

### Fluxo de Venda Rápida:

1. **Verificação Imediata**: Mostra destinos e preços disponíveis
2. **Captura do Destino**: Usuário digita a cidade
3. **Verificação de Disponibilidade**: Checa se atende o destino
4. **Opções Rápidas**: Mostra horários e preços
5. **Seleção**: Usuário escolhe opção ou fala com vendedor
6. **Confirmação**: Reserva por 15 minutos
7. **Transferência**: Direciona para vendedor humano

## 🔍 Operadores de Condição

- `equals`: Igual exato
- `contains`: Contém texto
- `contains_any`: Contém qualquer um dos valores
- `starts_with`: Começa com
- `ends_with`: Termina com
- `greater_than`: Maior que
- `less_than`: Menor que

## 💡 Dicas Importantes

### ✅ Boas Práticas

1. **IDs únicos**: Cada nó deve ter um ID único
2. **Conexões válidas**: Todas as edges devem referenciar nós existentes
3. **Nó de início**: Sempre inclua um nó do tipo "start"
4. **Validação**: Use o validador integrado antes de salvar
5. **Backup**: Mantenha cópias dos fluxos importantes

### ⚠️ Cuidados

1. **JSON válido**: Verifique a sintaxe antes de aplicar
2. **Variáveis**: Use nomes consistentes para variáveis
3. **Fluxos grandes**: Para fluxos muito complexos, prefira o editor visual
4. **Teste sempre**: Teste o fluxo após modificações

## 🚀 Vantagens da Edição por Código

- **Velocidade**: Criação muito mais rápida
- **Precisão**: Controle total sobre todos os parâmetros
- **Reutilização**: Fácil cópia entre projetos
- **Versionamento**: Compatível com Git
- **Compartilhamento**: Envie fluxos por email/chat
- **Backup**: Backup simples em arquivos JSON

## 📞 Suporte

Para dúvidas sobre criação de fluxos por código:

1. Use o exemplo incluído como base
2. Consulte este guia
3. Teste sempre no ambiente de desenvolvimento
4. Mantenha backups dos fluxos funcionais

---

**🎯 Objetivo**: Tornar a criação de fluxos mais rápida e eficiente, especialmente para fluxos de venda de passagens que precisam ser objetivos e converter rapidamente!

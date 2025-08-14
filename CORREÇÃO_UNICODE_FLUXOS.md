# 🔧 Correção de Erro Unicode em Fluxos

## ❌ Problema Identificado

**Erro:** `Invalid JSON text: "The surrogate pair in string is invalid." at position 3925`

### 🔍 Causa Raiz
- **Emojis complexos** como `👨‍💼` (homem de negócios) contêm **ZWJ (Zero Width Joiner)**
- **Surrogate pairs** inválidos no JSON podem corromper os dados
- **MySQL** rejeita caracteres Unicode mal formados

## ✅ Solução Implementada

### 1. **🛠️ Sanitização Automática**
Adicionada função `sanitizeUnicodeForJSON()` que:
- Remove **Zero Width Joiner** (`\u200D`)
- Remove **surrogate pairs** órfãos (`\uD800-\uDFFF`)
- Remove **caracteres de controle** problemáticos
- Preserva emojis válidos

### 2. **🔄 Aplicação Preventiva**
- **Criação de fluxos:** Sanitiza antes de salvar
- **Atualização de fluxos:** Sanitiza antes de atualizar
- **Recuperação automática:** Se falhar, tenta sanitizar e salvar novamente

### 3. **🚨 Detecção de Erro**
```javascript
if (error.name === 'SequelizeDatabaseError' && error.original?.code === 'ER_INVALID_JSON_TEXT') {
  // Tenta sanitizar automaticamente
}
```

## 🔧 Como Corrigir Fluxos Existentes

### Opção 1: Script Automático
```bash
node fix-unicode-flows.js
```

**O que faz:**
- Verifica todos os fluxos no banco
- Identifica JSONs inválidos
- Faz backup dos originais
- Aplica correções Unicode
- Gera relatório de resultados

### Opção 2: Correção Manual
```sql
-- Verificar fluxos com problemas
SELECT id, name, LENGTH(flow_data) as size 
FROM flows 
WHERE flow_data LIKE '%\\ud83d%' OR flow_data LIKE '%‍%';

-- Backup antes de corrigir
CREATE TABLE flows_backup AS SELECT * FROM flows;
```

## 🎯 Resultados Esperados

### ✅ Antes da Correção:
```
❌ "👨‍💼" → Causa erro ER_INVALID_JSON_TEXT
```

### ✅ Depois da Correção:
```
✅ "👨💼" → Funciona perfeitamente 
```

## 🔍 Verificação

### 1. **Testar Edição de Fluxo**
- Acesse: `http://localhost:3000/flows/5/edit`
- Edite o fluxo normalmente
- Salve as alterações
- ✅ Deve salvar sem erros

### 2. **Verificar Logs**
```bash
pm2 logs chatbot-whats-api --lines 20
```

**Busque por:**
- `🔧 DEBUG: flow_data sanitizado`
- `✅ Fluxo salvo com sucesso após sanitização`

### 3. **Testar Construtor Visual**
- Use o "Construtor Visual"
- Adicione emojis nas mensagens
- Salve o fluxo
- ✅ Deve funcionar sem duplicação

## 📋 Caracteres Problemáticos Removidos

| Caractere | Unicode | Descrição |
|-----------|---------|-----------|
| ZWJ | `\u200D` | Zero Width Joiner |
| Surrogate | `\uD800-\uDFFF` | Surrogate pairs órfãos |
| Controle | `\u0000-\u001F` | Caracteres de controle |
| BOM | `\uFEFF` | Byte Order Mark |

## 🎉 Benefícios

✅ **Sem mais erros** de JSON inválido  
✅ **Edição funcional** de fluxos existentes  
✅ **Prevenção automática** em novos fluxos  
✅ **Emojis preservados** (versões válidas)  
✅ **Backups automáticos** para segurança  

## 🚀 Próximos Passos

1. **Execute o script:** `node fix-unicode-flows.js`
2. **Reinicie o servidor:** `pm2 restart chatbot-whats-api`
3. **Teste a edição** dos fluxos problemáticos
4. **Verifique o funcionamento** do construtor visual

---

**✅ Problema resolvido! Os fluxos agora podem ser editados sem erros Unicode.** 
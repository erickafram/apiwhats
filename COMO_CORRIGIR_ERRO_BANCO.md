# 🔧 Como Corrigir Erro do Banco de Dados

## ❌ Erro Identificado
```
Unknown column 'Conversation.custom_status_id' in 'on clause'
```

## 🎯 Causa
A coluna `custom_status_id` está faltando na tabela `conversations`.

## ✅ Soluções (escolha uma)

### 🚀 Opção 1: Script SQL Rápido
1. Conecte no seu banco MySQL:
```bash
mysql -u root -p chatbot
```

2. Execute o script:
```bash
source fix-database.sql
```

### 🛠️ Opção 2: Script Node.js
```bash
cd /home/chatbotwhats/htdocs/chatbotwhats.online
node fix-database-column.js
```

### 💻 Opção 3: SQL Manual
Execute estes comandos no MySQL:

```sql
-- Criar tabela de status
CREATE TABLE IF NOT EXISTS conversation_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Adicionar coluna faltante
ALTER TABLE conversations 
ADD COLUMN custom_status_id INT NULL,
ADD FOREIGN KEY (custom_status_id) REFERENCES conversation_statuses(id);
```

### 🔄 Opção 4: Reiniciar sem a coluna
Se não precisar da funcionalidade de status customizado, pode remover temporariamente a associação no modelo:

1. Abra: `src/models/Conversation.js`
2. Comente a linha que faz referência ao `custom_status`:
```javascript
// Conversation.belongsTo(ConversationStatus, { as: 'custom_status', foreignKey: 'custom_status_id' });
```

## 🔄 Após Corrigir

1. **Reinicie o servidor:**
```bash
pm2 restart chatbot-whats-api
```

2. **Verifique os logs:**
```bash
pm2 logs chatbot-whats-api --lines 20
```

3. **Teste a aplicação:**
- Acesse: http://chatbotwhats.online
- Verifique se o erro desapareceu

## ✅ Verificação
Se tudo estiver correto, você deve ver:
```
✅ Serviços inicializados com sucesso
BotManager inicializado com X bots ativos
```

## 🆘 Se o Erro Persistir

1. **Verifique a estrutura da tabela:**
```sql
DESCRIBE conversations;
```

2. **Verifique se a coluna foi adicionada:**
```sql
SHOW COLUMNS FROM conversations LIKE 'custom_status_id';
```

3. **Logs detalhados:**
```bash
pm2 logs chatbot-whats-api --lines 50
```

---

## 🎯 Resumo
Este erro é comum após atualizações do sistema. A solução é simples: adicionar a coluna que está faltando no banco de dados.

**Execute uma das opções acima e o erro será resolvido! 🚀** 
# 🔧 Guia de Solução de Problemas

## ❌ Erro: "Erro interno do servidor" durante testes

### Problema Identificado
O erro ocorre devido a problemas nas associações do Sequelize quando há relacionamentos entre tabelas que ainda não possuem dados.

### ✅ Soluções Implementadas

1. **Adicionado `required: false`** em todas as associações para torná-las opcionais
2. **Melhorada inicialização** dos serviços no servidor
3. **Criado teste básico** para verificar funcionalidades core

### 🚀 Como Resolver

#### Passo 1: Reiniciar o servidor
```bash
# Pare o servidor atual (Ctrl+C)
# Reinicie o servidor
npm run dev
```

#### Passo 2: Testar funcionalidades básicas primeiro
```bash
# Execute o teste básico (sem associações complexas)
npm run test:basic
```

#### Passo 3: Se o teste básico passar, execute o teste completo
```bash
npm run test:system
```

### 🔍 Verificações Adicionais

#### Verificar se o banco está funcionando
```bash
# Conectar ao MySQL
mysql -u root -p

# Verificar se o banco existe
SHOW DATABASES;
USE whatsapp_chatbot;
SHOW TABLES;

# Verificar se há dados nas tabelas
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM bots;
```

#### Verificar logs do servidor
Quando executar `npm run dev`, observe os logs para:
- ✅ "Banco de dados sincronizado"
- ✅ "Serviços inicializados com sucesso"
- ✅ "Servidor rodando na porta 5000"

### 🛠️ Correções Aplicadas

#### 1. Rotas de Bots (`src/routes/bots.js`)
```javascript
// ANTES (causava erro)
include: [
  {
    model: Flow,
    as: 'flows',
    attributes: ['id', 'name', 'is_active', 'is_default']
  }
]

// DEPOIS (corrigido)
include: [
  {
    model: Flow,
    as: 'flows',
    attributes: ['id', 'name', 'is_active', 'is_default'],
    required: false  // ← Adicionado
  }
]
```

#### 2. Rotas de Flows (`src/routes/flows.js`)
```javascript
// Adicionado required: false em todas as associações
include: [
  {
    model: Bot,
    as: 'bot',
    attributes: ['id', 'name'],
    required: false  // ← Adicionado
  }
]
```

#### 3. Rotas de Conversations (`src/routes/conversations.js`)
```javascript
// Adicionado required: false em todas as associações
include: [
  {
    model: Bot,
    as: 'bot',
    attributes: ['id', 'name'],
    required: false  // ← Adicionado
  },
  // ... outros includes também corrigidos
]
```

#### 4. Modelo Analytics (`src/models/Analytics.js`)
```javascript
// Método getTopFlows corrigido
include: [{
  model: this.sequelize.models.Flow,
  as: 'flow',
  attributes: ['name', 'description'],
  required: false  // ← Adicionado
}]
```

#### 5. Servidor (`server.js`)
```javascript
// Melhorada inicialização dos serviços
db.sequelize.sync({ force: false }).then(async () => {
  console.log('Banco de dados sincronizado');
  
  // Inicializar serviços após sincronização
  const WhatsAppService = require('./src/services/WhatsAppService');
  const BotManager = require('./src/services/BotManager');

  global.whatsappService = new WhatsAppService(io);
  global.botManager = new BotManager(io);
  
  // Inicializar BotManager
  try {
    await global.botManager.initialize();
    console.log('Serviços inicializados com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar serviços:', error);
  }
});
```

### 📋 Comandos de Diagnóstico

#### Verificar status do sistema
```bash
# Health check
curl http://localhost:5000/health

# Verificar se o servidor responde
curl -I http://localhost:5000
```

#### Testar autenticação
```bash
# Registrar usuário
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@test.com","password":"123456"}'

# Fazer login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@test.com","password":"123456"}'
```

### 🚨 Se o Problema Persistir

#### 1. Limpar e recriar o banco
```bash
npm run db:drop
npm run db:create
npm run migrate
npm run seed:demo
```

#### 2. Verificar dependências
```bash
npm install
```

#### 3. Verificar configuração do .env
```env
# Certifique-se de que estas variáveis estão corretas
DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsapp_chatbot
DB_USER=root
DB_PASSWORD=sua_senha

JWT_SECRET=sua_chave_secreta_jwt
```

#### 4. Verificar versões
```bash
node --version  # Deve ser 18+
npm --version
mysql --version  # Deve ser 8.0+
```

### 💡 Dicas de Prevenção

1. **Sempre use `required: false`** em associações opcionais
2. **Inicialize serviços após** sincronização do banco
3. **Teste funcionalidades básicas** antes das complexas
4. **Monitore logs** durante desenvolvimento
5. **Use dados demo** para testes iniciais

### 📞 Próximos Passos

1. Execute `npm run test:basic` para verificar funcionalidades core
2. Se passar, execute `npm run test:system` para teste completo
3. Use `npm run seed:demo` para ter dados de exemplo
4. Monitore logs do servidor para identificar problemas

### ✅ Status das Correções

- ✅ Associações Sequelize corrigidas
- ✅ Inicialização de serviços melhorada
- ✅ Teste básico criado
- ✅ Logs de diagnóstico adicionados
- ✅ Documentação de troubleshooting criada

O sistema agora deve funcionar corretamente! 🎉

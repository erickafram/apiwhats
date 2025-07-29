# WhatsApp Chatbot System

Sistema completo de chatbot para WhatsApp com IA e editor visual de fluxos conversacionais.

## 🚀 Características

- **Chatbot WhatsApp Gratuito**: Utiliza Baileys (WhatsApp Web API)
- **IA Conversacional**: Integração com Together.xyz API (Llama-3.3-70B-Instruct-Turbo)
- **Editor Visual**: Interface tipo n8n para criação de fluxos
- **Dashboard Completo**: Sistema de gerenciamento e analytics
- **Multi-Bot**: Suporte a múltiplos chatbots simultâneos
- **Tempo Real**: WebSocket para atualizações em tempo real

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** + **Express.js**
- **MySQL** + **Sequelize ORM**
- **@whiskeysockets/baileys** (WhatsApp Web API)
- **Socket.io** (WebSocket)
- **JWT** (Autenticação)
- **Together.xyz** (IA)

### Frontend (Próxima fase)
- **React.js** + **Material-UI**
- **React Flow** (Editor visual)
- **Socket.io-client**
- **Axios**

## 📋 Pré-requisitos

- Node.js 18+
- MySQL 8.0+
- NPM ou Yarn

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <repository-url>
cd whatsapp-chatbot-system
```

### 2. Execute o script de configuração
```bash
npm run setup
```

### 3. Configure o banco de dados MySQL
Crie um banco de dados MySQL:
```sql
CREATE DATABASE whatsapp_chatbot;
```

### 4. Configure as variáveis de ambiente
Edite o arquivo `.env` com suas configurações:
```env
# Banco de dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsapp_chatbot
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_jwt_muito_segura

# Together.xyz (já configurado)
TOGETHER_API_TOKEN=8f2666a67bee6b36fbc09d507c0b2e4e4059ae3c3a78672448eefaf248cd673b
```

### 5. Execute as migrations
```bash
npm run migrate
```

### 6. Inicie o servidor
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:5000`

## 📱 Como usar

### 1. Criar usuário
```bash
POST /api/auth/register
{
  "name": "Seu Nome",
  "email": "seu@email.com",
  "password": "suasenha"
}
```

### 2. Fazer login
```bash
POST /api/auth/login
{
  "email": "seu@email.com",
  "password": "suasenha"
}
```

### 3. Criar um bot
```bash
POST /api/bots
Authorization: Bearer <seu_token>
{
  "name": "Meu Bot",
  "description": "Bot de atendimento"
}
```

### 4. Conectar ao WhatsApp
```bash
POST /api/bots/:id/connect
Authorization: Bearer <seu_token>
```

Escaneie o QR Code que aparecerá no response com seu WhatsApp.

## 🎨 Estrutura do Projeto

```
whatsapp-chatbot-system/
├── src/
│   ├── config/          # Configurações
│   ├── models/          # Modelos do banco
│   ├── routes/          # Rotas da API
│   ├── services/        # Serviços (WhatsApp, IA, etc.)
│   ├── middleware/      # Middlewares
│   └── migrations/      # Migrations do banco
├── scripts/             # Scripts utilitários
├── uploads/             # Arquivos de upload
├── sessions/            # Sessões do WhatsApp
├── logs/               # Logs da aplicação
└── server.js           # Servidor principal
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/refresh` - Renovar token

### Bots
- `GET /api/bots` - Listar bots
- `POST /api/bots` - Criar bot
- `GET /api/bots/:id` - Buscar bot
- `PUT /api/bots/:id` - Atualizar bot
- `DELETE /api/bots/:id` - Deletar bot
- `POST /api/bots/:id/connect` - Conectar ao WhatsApp
- `POST /api/bots/:id/disconnect` - Desconectar
- `GET /api/bots/:id/qr-code` - Obter QR Code

### Fluxos
- `GET /api/flows` - Listar fluxos
- `POST /api/flows` - Criar fluxo
- `GET /api/flows/:id` - Buscar fluxo
- `PUT /api/flows/:id` - Atualizar fluxo
- `DELETE /api/flows/:id` - Deletar fluxo
- `POST /api/flows/:id/test` - Testar fluxo

### Conversas
- `GET /api/conversations` - Listar conversas
- `GET /api/conversations/:id` - Buscar conversa
- `GET /api/conversations/:id/messages` - Mensagens da conversa
- `POST /api/conversations/:id/send-message` - Enviar mensagem

### Analytics
- `GET /api/analytics/dashboard` - Dashboard geral
- `GET /api/analytics/bot/:id` - Analytics do bot
- `GET /api/analytics/flow/:id` - Analytics do fluxo

## 🤖 Tipos de Nós do Fluxo

- **Start**: Início da conversa
- **AI Response**: Resposta gerada por IA
- **Fixed Response**: Resposta pré-definida
- **Condition**: Condicionais (contém, igual, etc.)
- **Input Capture**: Capturar dados do usuário
- **Action**: Ações externas (webhook, email)
- **End**: Finalizar conversa
- **Delay**: Pausa na conversa
- **Transfer Human**: Transferir para humano

## 🧠 Configuração da IA

O sistema usa a API Together.xyz com o modelo Llama-3.3-70B-Instruct-Turbo:

```json
{
  "enabled": true,
  "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  "temperature": 0.7,
  "max_tokens": 1000,
  "system_prompt": "Você é um assistente virtual útil e amigável."
}
```

## 📊 Analytics e Métricas

O sistema coleta automaticamente:
- Mensagens recebidas/enviadas
- Conversas iniciadas/completadas
- Tempo de resposta
- Execuções de fluxo
- Erros e falhas
- Engajamento do usuário

## 🔒 Segurança

- Autenticação JWT
- Rate limiting
- Validação de entrada
- Sanitização de dados
- Logs de auditoria

## 🚀 Próximas Fases

### Fase 3: IA Integration (Em desenvolvimento)
- [ ] Classificação de intenções
- [ ] Análise de sentimento
- [ ] Extração de entidades

### Fase 4: Recursos Avançados
- [ ] Templates de fluxos
- [ ] Integrações externas
- [ ] Webhooks avançados

### Fase 5: Frontend React
- [ ] Dashboard visual
- [ ] Editor de fluxos drag-and-drop
- [ ] Monitor de conversas em tempo real

## 🐛 Troubleshooting

### Erro de conexão com MySQL
```bash
# Verificar se o MySQL está rodando
sudo systemctl status mysql

# Verificar configurações no .env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsapp_chatbot
```

### QR Code não aparece
- Verificar se o bot está ativo
- Verificar logs do servidor
- Tentar reconectar o bot

### IA não responde
- Verificar TOGETHER_API_TOKEN no .env
- Verificar logs de erro da API
- Verificar configuração ai_config do bot

## 📝 Logs

Os logs são salvos em:
- Console (desenvolvimento)
- `logs/app.log` (produção)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API
- Verifique os logs de erro

---

**Desenvolvido com ❤️ para automatizar atendimento no WhatsApp**

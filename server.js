const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
app.use(limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para uploads
app.use('/uploads', express.static('uploads'));

// Importar rotas
const authRoutes = require('./src/routes/auth');
const botRoutes = require('./src/routes/bots');
const flowRoutes = require('./src/routes/flows');
const templateRoutes = require('./src/routes/templates');
const queueRoutes = require('./src/routes/queue');
const conversationRoutes = require('./src/routes/conversations');
const analyticsRoutes = require('./src/routes/analytics');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Configurar Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Inicializar banco de dados
const db = require('./src/models');
db.sequelize.sync({ force: false }).then(async () => {
  console.log('Banco de dados sincronizado');

  // Inicializar serviços após sincronização do banco
  const WhatsAppService = require('./src/services/WhatsAppService');
  const BotManager = require('./src/services/BotManager');
  const QueueService = require('./src/services/QueueService');

  // Instanciar serviços globais
  global.whatsappService = new WhatsAppService(io);
  global.botManager = new BotManager(io);
  global.queueService = new QueueService(io);

  // Inicializar serviços
  try {
    await global.botManager.initialize();
    console.log('Serviços inicializados com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar serviços:', error);
  }
}).catch(error => {
  console.error('Erro ao sincronizar banco de dados:', error);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
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

// Configurar trust proxy ANTES do rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  trustProxy: true // Para CloudPanel/nginx
});
app.use(limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para uploads
app.use('/uploads', express.static('uploads'));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Importar rotas
const authRoutes = require('./src/routes/auth');
const botRoutes = require('./src/routes/bots');
const flowRoutes = require('./src/routes/flows');
const templateRoutes = require('./src/routes/templates');
const queueRoutes = require('./src/routes/queue');
const conversationRoutes = require('./src/routes/conversations');
const analyticsRoutes = require('./src/routes/analytics');
const maytapiRoutes = require('./src/routes/maytapi');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/maytapi', maytapiRoutes);

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

// Rota catch-all para SPA - deve vir DEPOIS das rotas da API
app.get('*', (req, res) => {
  // Se a requisição é para API, retorna 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota da API não encontrada' });
  }

  // Para todas as outras rotas, serve o index.html do frontend
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
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
  const WhatsAppSimulator = require('./src/services/WhatsAppSimulator');
  const MaytapiService = require('./src/services/MaytapiService');
  const BotManager = require('./src/services/BotManager');
  const QueueService = require('./src/services/QueueService');

  // Verificar qual serviço usar
  const useMaytapi = process.env.USE_MAYTAPI === 'true';
  const useSimulator = process.env.USE_WHATSAPP_SIMULATOR === 'true' || false;

  console.log('🔧 Configuração de serviços:');
  console.log('USE_MAYTAPI:', useMaytapi);
  console.log('USE_WHATSAPP_SIMULATOR:', useSimulator);

  // Instanciar serviços globais
  if (useMaytapi) {
    console.log('🚀 Iniciando Maytapi WhatsApp Service');
    try {
      global.maytapiService = new MaytapiService(io);
      global.whatsappService = global.maytapiService; // Compatibilidade
      console.log('✅ MaytapiService inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar MaytapiService:', error);
    }
  } else if (useSimulator) {
    console.log('🤖 Iniciando WhatsApp SIMULADOR para desenvolvimento');
    global.whatsappService = new WhatsAppSimulator(io);
  } else {
    console.log('📱 Iniciando WhatsApp Service real (Baileys)');
    global.whatsappService = new WhatsAppService(io);
  }

  global.botManager = new BotManager(io);
  global.queueService = new QueueService(io);

  // Inicializar serviços
  try {
    await global.botManager.initialize();
    console.log('✅ Serviços inicializados com sucesso');
    
    // Verificar se MaytapiService está disponível
    if (global.maytapiService) {
      console.log('✅ MaytapiService está disponível globalmente');
    } else {
      console.log('⚠️ MaytapiService não está disponível');
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar serviços:', error);
  }
}).catch(error => {
  console.error('❌ Erro ao sincronizar banco de dados:', error);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };


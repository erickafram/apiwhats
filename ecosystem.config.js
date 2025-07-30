// Configuração PM2 para Produção
// Salve este arquivo como ecosystem.config.js na raiz do projeto

module.exports = {
  apps: [
    {
      name: 'chatbot-whats-api',
      script: 'server.js',
      cwd: '/home/chatbotwhats/htdocs/chatbotwhats.online/apiwhats',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Logs
      log_file: 'logs/combined.log',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart policies
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'sessions'],
      max_memory_restart: '1G',
      restart_delay: 4000,
      
      // Advanced features
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      
      // Cluster mode (se necessário)
      // instances: 'max',
      // exec_mode: 'cluster'
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '165.227.206.12',
      ref: 'origin/main',
      repo: 'https://github.com/erickafram/apiwhats.git',
      path: '/home/chatbotwhats/htdocs/chatbotwhats.online',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

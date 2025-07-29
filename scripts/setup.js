const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando configuração do WhatsApp Chatbot System...\n');

// Verificar se o Node.js está na versão correta
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

if (majorVersion < 18) {
  console.error('❌ Node.js 18+ é necessário. Versão atual:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js versão:', nodeVersion);

// Criar diretórios necessários
const directories = [
  'uploads',
  'sessions',
  'logs',
  'src/migrations',
  'src/seeders'
];

console.log('\n📁 Criando diretórios...');
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`   ✅ ${dir}`);
  } else {
    console.log(`   ⏭️  ${dir} (já existe)`);
  }
});

// Verificar se o arquivo .env existe
if (!fs.existsSync('.env')) {
  console.log('\n📝 Copiando arquivo .env...');
  fs.copyFileSync('.env.example', '.env');
  console.log('   ✅ Arquivo .env criado');
  console.log('   ⚠️  IMPORTANTE: Configure as variáveis de ambiente no arquivo .env');
} else {
  console.log('\n⏭️  Arquivo .env já existe');
}

// Instalar dependências
console.log('\n📦 Instalando dependências...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('   ✅ Dependências instaladas');
} catch (error) {
  console.error('   ❌ Erro ao instalar dependências:', error.message);
  process.exit(1);
}

// Verificar configuração do banco de dados
console.log('\n🗄️  Verificando configuração do banco de dados...');

const dbConfig = require('../src/config/database');
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

console.log(`   📊 Ambiente: ${env}`);
console.log(`   🏠 Host: ${config.host}:${config.port}`);
console.log(`   📋 Database: ${config.database}`);
console.log(`   👤 User: ${config.username}`);

// Criar migration inicial
console.log('\n🔄 Criando migrations...');

const migrationContent = `'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar tabela users
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'user'),
        defaultValue: 'user',
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Criar tabela bots
    await queryInterface.createTable('bots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      session_data: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ai_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      webhook_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_connected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      qr_code: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      connection_status: {
        type: Sequelize.ENUM('disconnected', 'connecting', 'connected', 'error'),
        defaultValue: 'disconnected'
      },
      last_seen: {
        type: Sequelize.DATE,
        allowNull: true
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Criar tabela flows
    await queryInterface.createTable('flows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bot_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bots',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      flow_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      version: {
        type: Sequelize.STRING(20),
        defaultValue: '1.0.0'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      trigger_keywords: {
        type: Sequelize.JSON,
        allowNull: true
      },
      trigger_conditions: {
        type: Sequelize.JSON,
        allowNull: true
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      statistics: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Criar tabela flow_nodes
    await queryInterface.createTable('flow_nodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flow_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'flows',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      node_id: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      node_type: {
        type: Sequelize.ENUM(
          'start',
          'ai_response',
          'fixed_response',
          'condition',
          'input_capture',
          'action',
          'end',
          'delay',
          'webhook',
          'transfer_human'
        ),
        allowNull: false
      },
      node_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      position_x: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      position_y: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      width: {
        type: Sequelize.INTEGER,
        defaultValue: 200
      },
      height: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      style: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Criar tabela conversations
    await queryInterface.createTable('conversations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bot_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bots',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      user_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      user_profile_pic: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      current_flow_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'flows',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      current_node: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      session_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'waiting', 'completed', 'abandoned', 'transferred'),
        defaultValue: 'active'
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      started_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      last_activity_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Criar tabela messages
    await queryInterface.createTable('messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      conversation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      whatsapp_message_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      direction: {
        type: Sequelize.ENUM('in', 'out'),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      media_type: {
        type: Sequelize.ENUM('text', 'image', 'audio', 'video', 'document', 'sticker', 'location', 'contact'),
        defaultValue: 'text'
      },
      media_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      media_filename: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      media_size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      media_mimetype: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      quoted_message_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'messages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'delivered', 'read', 'failed'),
        defaultValue: 'pending'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      processed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      processing_time: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      node_id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Criar tabela analytics
    await queryInterface.createTable('analytics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bot_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bots',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      metric_type: {
        type: Sequelize.ENUM(
          'message_received',
          'message_sent',
          'conversation_started',
          'conversation_completed',
          'conversation_abandoned',
          'flow_executed',
          'node_executed',
          'ai_request',
          'webhook_called',
          'error_occurred',
          'user_engagement',
          'response_time',
          'conversion'
        ),
        allowNull: false
      },
      metric_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      conversation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'conversations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      flow_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'flows',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      node_id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      user_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      recorded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Criar índices
    await queryInterface.addIndex('bots', ['user_id']);
    await queryInterface.addIndex('flows', ['bot_id', 'is_active']);
    await queryInterface.addIndex('flow_nodes', ['flow_id', 'node_id'], { unique: true });
    await queryInterface.addIndex('conversations', ['bot_id', 'user_phone'], { unique: true });
    await queryInterface.addIndex('conversations', ['bot_id', 'status']);
    await queryInterface.addIndex('messages', ['conversation_id', 'timestamp']);
    await queryInterface.addIndex('analytics', ['bot_id', 'metric_type', 'recorded_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('analytics');
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversations');
    await queryInterface.dropTable('flow_nodes');
    await queryInterface.dropTable('flows');
    await queryInterface.dropTable('bots');
    await queryInterface.dropTable('users');
  }
};`;

const migrationFile = `src/migrations/${Date.now()}-create-initial-tables.js`;
fs.writeFileSync(migrationFile, migrationContent);
console.log('   ✅ Migration inicial criada');

console.log('\n🎉 Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('   1. Configure o banco de dados MySQL');
console.log('   2. Edite o arquivo .env com suas configurações');
console.log('   3. Execute: npm run migrate');
console.log('   4. Execute: npm run dev');
console.log('\n🚀 Para iniciar o desenvolvimento: npm run dev');
console.log('📚 Documentação: README.md');

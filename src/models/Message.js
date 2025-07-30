module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bots',
        key: 'id'
      }
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id'
      }
    },
    whatsapp_message_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    sender_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    sender_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'audio', 'video', 'document', 'location', 'contact'),
      defaultValue: 'text'
    },
    direction: {
      type: DataTypes.ENUM('incoming', 'outgoing'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    media_type: {
      type: DataTypes.ENUM('text', 'image', 'audio', 'video', 'document', 'sticker', 'location', 'contact'),
      defaultValue: 'text'
    },
    media_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    media_filename: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    media_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    media_mimetype: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    quoted_message_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'messages',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed'),
      defaultValue: 'pending'
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    processed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    processing_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tempo de processamento em milissegundos'
    },
    node_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'ID do nó que gerou esta mensagem'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        ai_generated: false,
        confidence_score: null,
        intent: null,
        entities: [],
        sentiment: null
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'messages',
    timestamps: true,
    indexes: [
      {
        fields: ['conversation_id', 'timestamp']
      },
      {
        fields: ['whatsapp_message_id']
      },
      {
        fields: ['direction', 'processed']
      },
      {
        fields: ['media_type']
      }
    ]
  });

  // Métodos de instância
  Message.prototype.markAsProcessed = function(processingTime = null) {
    this.processed = true;
    if (processingTime) {
      this.processing_time = processingTime;
    }
  };

  Message.prototype.setError = function(errorMessage) {
    this.status = 'failed';
    this.error_message = errorMessage;
  };

  Message.prototype.updateStatus = function(status) {
    this.status = status;
  };

  Message.prototype.isMedia = function() {
    return this.media_type !== 'text';
  };

  Message.prototype.getMediaPath = function() {
    if (!this.media_url) return null;
    return this.media_url.startsWith('http') ? this.media_url : `uploads/${this.media_url}`;
  };

  // Métodos estáticos
  Message.getUnprocessedMessages = function(limit = 100) {
    return this.findAll({
      where: {
        direction: 'in',
        processed: false
      },
      order: [['timestamp', 'ASC']],
      limit
    });
  };

  Message.getConversationHistory = function(conversationId, limit = 50) {
    return this.findAll({
      where: {
        conversation_id: conversationId
      },
      order: [['timestamp', 'DESC']],
      limit,
      include: [{
        model: this.sequelize.models.Message,
        as: 'quoted_message',
        required: false
      }]
    });
  };

  // Associações
  Message.associate = function(models) {
    Message.belongsTo(models.Conversation, {
      foreignKey: 'conversation_id',
      as: 'conversation'
    });

    Message.belongsTo(models.Message, {
      foreignKey: 'quoted_message_id',
      as: 'quoted_message'
    });

    Message.hasMany(models.Message, {
      foreignKey: 'quoted_message_id',
      as: 'replies'
    });
  };

  return Message;
};

module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
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
    user_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    user_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    user_profile_pic: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    current_flow_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'flows',
        key: 'id'
      }
    },
    current_node: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    session_data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        variables: {},
        context: [],
        user_inputs: {},
        flow_history: [],
        ai_context: []
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'waiting', 'completed', 'abandoned', 'transferred'),
      defaultValue: 'active'
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        source: 'whatsapp',
        device_type: 'mobile',
        location: null,
        referrer: null
      }
    },
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    last_activity_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'conversations',
    timestamps: true,
    indexes: [
      {
        fields: ['bot_id', 'user_phone'],
        unique: true
      },
      {
        fields: ['bot_id', 'status']
      },
      {
        fields: ['last_activity_at']
      }
    ]
  });

  // Métodos de instância
  Conversation.prototype.setVariable = function(key, value) {
    if (!this.session_data) this.session_data = { variables: {} };
    if (!this.session_data.variables) this.session_data.variables = {};
    this.session_data.variables[key] = value;
    this.changed('session_data', true);
  };

  Conversation.prototype.getVariable = function(key) {
    if (!this.session_data || !this.session_data.variables) return null;
    return this.session_data.variables[key];
  };

  Conversation.prototype.addToContext = function(message, role = 'user') {
    if (!this.session_data) this.session_data = { context: [] };
    if (!this.session_data.context) this.session_data.context = [];
    
    this.session_data.context.push({
      role,
      content: message,
      timestamp: new Date()
    });

    // Manter apenas os últimos 20 contextos
    if (this.session_data.context.length > 20) {
      this.session_data.context = this.session_data.context.slice(-20);
    }
    
    this.changed('session_data', true);
  };

  Conversation.prototype.getContext = function() {
    if (!this.session_data || !this.session_data.context) return [];
    return this.session_data.context;
  };

  Conversation.prototype.addToFlowHistory = function(nodeId, nodeType, timestamp = new Date()) {
    if (!this.session_data) this.session_data = { flow_history: [] };
    if (!this.session_data.flow_history) this.session_data.flow_history = [];
    
    this.session_data.flow_history.push({
      node_id: nodeId,
      node_type: nodeType,
      timestamp
    });
    
    this.changed('session_data', true);
  };

  Conversation.prototype.updateActivity = function() {
    this.last_activity_at = new Date();
  };

  // Associações
  Conversation.associate = function(models) {
    Conversation.belongsTo(models.Bot, {
      foreignKey: 'bot_id',
      as: 'bot'
    });

    Conversation.belongsTo(models.Flow, {
      foreignKey: 'current_flow_id',
      as: 'current_flow'
    });

    Conversation.hasMany(models.Message, {
      foreignKey: 'conversation_id',
      as: 'messages'
    });
  };

  return Conversation;
};

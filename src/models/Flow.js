module.exports = (sequelize, DataTypes) => {
  const Flow = sequelize.define('Flow', {
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    flow_data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      }
    },
    version: {
      type: DataTypes.STRING(20),
      defaultValue: '1.0.0'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    trigger_keywords: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    trigger_conditions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        type: 'any', // 'any', 'keyword', 'intent', 'time', 'custom'
        keywords: [],
        intents: [],
        time_conditions: null,
        custom_conditions: null
      }
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    statistics: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        total_executions: 0,
        successful_completions: 0,
        average_completion_time: 0,
        last_execution: null
      }
    },
    template_id: {
      type: DataTypes.STRING(50),
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
    tableName: 'flows',
    timestamps: true,
    indexes: [
      {
        fields: ['bot_id', 'is_active']
      },
      {
        fields: ['bot_id', 'is_default']
      }
    ]
  });

  // Métodos de instância
  Flow.prototype.getStartNode = function() {
    if (!this.flow_data || !this.flow_data.nodes) return null;
    return this.flow_data.nodes.find(node => node.type === 'start');
  };

  Flow.prototype.getNodeById = function(nodeId) {
    if (!this.flow_data || !this.flow_data.nodes) return null;
    return this.flow_data.nodes.find(node => node.id === nodeId);
  };

  Flow.prototype.getNextNodes = function(currentNodeId) {
    if (!this.flow_data || !this.flow_data.edges) return [];
    const edges = this.flow_data.edges.filter(edge => edge.source === currentNodeId);
    return edges.map(edge => this.getNodeById(edge.target)).filter(Boolean);
  };

  // Associações
  Flow.associate = function(models) {
    Flow.belongsTo(models.Bot, {
      foreignKey: 'bot_id',
      as: 'bot'
    });

    Flow.hasMany(models.FlowNode, {
      foreignKey: 'flow_id',
      as: 'nodes'
    });

    Flow.hasMany(models.Conversation, {
      foreignKey: 'current_flow_id',
      as: 'active_conversations'
    });
  };

  return Flow;
};

module.exports = (sequelize, DataTypes) => {
  const Analytics = sequelize.define('Analytics', {
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
    metric_type: {
      type: DataTypes.ENUM(
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
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'conversations',
        key: 'id'
      }
    },
    flow_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'flows',
        key: 'id'
      }
    },
    node_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    user_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    recorded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'analytics',
    timestamps: false,
    indexes: [
      {
        fields: ['bot_id', 'metric_type', 'recorded_at']
      },
      {
        fields: ['bot_id', 'recorded_at']
      },
      {
        fields: ['conversation_id']
      },
      {
        fields: ['flow_id']
      },
      {
        fields: ['user_phone', 'recorded_at']
      }
    ]
  });

  // Métodos estáticos para relatórios
  Analytics.getDashboardMetrics = async function(botId, startDate, endDate) {
    const metrics = await this.findAll({
      where: {
        bot_id: botId,
        recorded_at: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'metric_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('metric_value')), 'total_value'],
        [sequelize.fn('AVG', sequelize.col('metric_value')), 'avg_value']
      ],
      group: ['metric_type']
    });

    return metrics.reduce((acc, metric) => {
      acc[metric.metric_type] = {
        count: parseInt(metric.getDataValue('count')),
        total_value: parseFloat(metric.getDataValue('total_value')),
        avg_value: parseFloat(metric.getDataValue('avg_value'))
      };
      return acc;
    }, {});
  };

  Analytics.getHourlyMetrics = async function(botId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.findAll({
      where: {
        bot_id: botId,
        recorded_at: {
          [sequelize.Op.between]: [startOfDay, endOfDay]
        }
      },
      attributes: [
        [sequelize.fn('HOUR', sequelize.col('recorded_at')), 'hour'],
        'metric_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [
        sequelize.fn('HOUR', sequelize.col('recorded_at')),
        'metric_type'
      ],
      order: [
        [sequelize.fn('HOUR', sequelize.col('recorded_at')), 'ASC']
      ]
    });
  };

  Analytics.getTopFlows = async function(botId, startDate, endDate, limit = 10) {
    return await this.findAll({
      where: {
        bot_id: botId,
        metric_type: 'flow_executed',
        flow_id: {
          [sequelize.Op.not]: null
        },
        recorded_at: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'flow_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'executions'],
        [sequelize.fn('AVG', sequelize.col('metric_value')), 'avg_completion_time']
      ],
      group: ['flow_id'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit,
      include: [{
        model: this.sequelize.models.Flow,
        as: 'flow',
        attributes: ['name', 'description'],
        required: false
      }]
    });
  };

  Analytics.getUserEngagement = async function(botId, startDate, endDate) {
    return await this.findAll({
      where: {
        bot_id: botId,
        user_phone: {
          [sequelize.Op.not]: null
        },
        recorded_at: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'user_phone',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_interactions'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('conversation_id'))), 'conversations'],
        [sequelize.fn('MIN', sequelize.col('recorded_at')), 'first_interaction'],
        [sequelize.fn('MAX', sequelize.col('recorded_at')), 'last_interaction']
      ],
      group: ['user_phone'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });
  };

  // Métodos estáticos para registrar métricas
  Analytics.recordMetric = async function(data) {
    return await this.create({
      bot_id: data.botId,
      metric_type: data.type,
      metric_value: data.value || 1,
      metadata: data.metadata || {},
      conversation_id: data.conversationId || null,
      flow_id: data.flowId || null,
      node_id: data.nodeId || null,
      user_phone: data.userPhone || null,
      recorded_at: data.timestamp || new Date()
    });
  };

  // Associações
  Analytics.associate = function(models) {
    Analytics.belongsTo(models.Bot, {
      foreignKey: 'bot_id',
      as: 'bot'
    });

    Analytics.belongsTo(models.Conversation, {
      foreignKey: 'conversation_id',
      as: 'conversation'
    });

    Analytics.belongsTo(models.Flow, {
      foreignKey: 'flow_id',
      as: 'flow'
    });
  };

  return Analytics;
};

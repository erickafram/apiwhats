module.exports = (sequelize, DataTypes) => {
  const Bot = sequelize.define('Bot', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    session_data: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('session_data');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('session_data', value ? JSON.stringify(value) : null);
      }
    },
    ai_config: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        enabled: true,
        model: 'deepseek-ai/DeepSeek-V3',
        temperature: 0.7,
        max_tokens: 1000,
        system_prompt: 'Você é um assistente virtual útil e amigável.'
      }
    },
    webhook_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_connected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    connection_status: {
      type: DataTypes.ENUM('disconnected', 'connecting', 'connected', 'error'),
      defaultValue: 'disconnected'
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        auto_reply: true,
        typing_delay: 1000,
        read_receipts: true,
        group_support: false,
        business_hours: {
          enabled: false,
          timezone: 'America/Sao_Paulo',
          schedule: {
            monday: { start: '09:00', end: '18:00', enabled: true },
            tuesday: { start: '09:00', end: '18:00', enabled: true },
            wednesday: { start: '09:00', end: '18:00', enabled: true },
            thursday: { start: '09:00', end: '18:00', enabled: true },
            friday: { start: '09:00', end: '18:00', enabled: true },
            saturday: { start: '09:00', end: '12:00', enabled: false },
            sunday: { start: '09:00', end: '12:00', enabled: false }
          }
        }
      }
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
    tableName: 'bots',
    timestamps: true
  });

  // Associações
  Bot.associate = function(models) {
    Bot.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    Bot.hasMany(models.Flow, {
      foreignKey: 'bot_id',
      as: 'flows'
    });

    Bot.hasMany(models.Conversation, {
      foreignKey: 'bot_id',
      as: 'conversations'
    });

    Bot.hasMany(models.Analytics, {
      foreignKey: 'bot_id',
      as: 'analytics'
    });
  };

  return Bot;
};

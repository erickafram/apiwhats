module.exports = (sequelize, DataTypes) => {
  const QuickMessage = sequelize.define('QuickMessage', {
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
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 4000] // Limite do WhatsApp
      }
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'geral',
      validate: {
        isIn: [['geral', 'saudacoes', 'despedidas', 'informacoes', 'suporte', 'vendas', 'agendamento', 'pagamento', 'outros']]
      }
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
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
    tableName: 'quick_messages',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id', 'category']
      },
      {
        fields: ['user_id', 'is_active']
      },
      {
        fields: ['sort_order']
      }
    ]
  });

  // Métodos de instância
  QuickMessage.prototype.incrementUsage = function() {
    return this.increment('usage_count');
  };

  // Métodos estáticos
  QuickMessage.getCategories = function() {
    return [
      { value: 'geral', label: 'Geral' },
      { value: 'saudacoes', label: 'Saudações' },
      { value: 'despedidas', label: 'Despedidas' },
      { value: 'informacoes', label: 'Informações' },
      { value: 'suporte', label: 'Suporte' },
      { value: 'vendas', label: 'Vendas' },
      { value: 'agendamento', label: 'Agendamento' },
      { value: 'pagamento', label: 'Pagamento' },
      { value: 'outros', label: 'Outros' }
    ];
  };

  // Associações
  QuickMessage.associate = function(models) {
    QuickMessage.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return QuickMessage;
}; 
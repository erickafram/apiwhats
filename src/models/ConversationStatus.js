const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ConversationStatus extends Model {
    static associate(models) {
      // Um status pertence a um usuário (dono dos bots)
      ConversationStatus.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Um status pode ter muitas conversas
      ConversationStatus.hasMany(models.Conversation, {
        foreignKey: 'custom_status_id',
        as: 'conversations'
      });
    }
  }

  ConversationStatus.init({
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
      comment: 'Nome do status (ex: Aguardando Pagamento, Pago, etc)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição detalhada do status'
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#2196f3',
      comment: 'Cor do status em hexadecimal (#RRGGBB)'
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Nome do ícone Material-UI (ex: Payment, CheckCircle, etc)'
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Ordem de exibição dos status'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Se o status está ativo e pode ser usado'
    },
    is_final: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se este status indica que a conversa está finalizada'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Metadados adicionais do status'
    }
  }, {
    sequelize,
    modelName: 'ConversationStatus',
    tableName: 'conversation_statuses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['user_id', 'name'],
        unique: true
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['order_index']
      }
    ]
  });

  return ConversationStatus;
};

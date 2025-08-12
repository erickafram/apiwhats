const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'operator'),
      defaultValue: 'user',
      allowNull: false
    },
    parent_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'ID do usuário principal (para operadores)'
    },
    operator_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nome específico do operador para identificação'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
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
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Métodos de instância
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  // Associações
  User.associate = function(models) {
    User.hasMany(models.Bot, {
      foreignKey: 'user_id',
      as: 'bots'
    });

    // Relação de operadores
    User.hasMany(models.User, {
      foreignKey: 'parent_user_id',
      as: 'operators'
    });

    User.belongsTo(models.User, {
      foreignKey: 'parent_user_id',
      as: 'parent_user'
    });

    // Conversas atribuídas ao operador
    User.hasMany(models.Conversation, {
      foreignKey: 'assigned_operator_id',
      as: 'assigned_conversations'
    });
  };

  return User;
};

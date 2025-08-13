const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Para MySQL, modificar o enum da role para incluir 'operator'
    await queryInterface.changeColumn('users', 'role', {
      type: DataTypes.ENUM('admin', 'user', 'operator'),
      defaultValue: 'user',
      allowNull: false
    });

    // Adicionar campos ao modelo User
    await queryInterface.addColumn('users', 'parent_user_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('users', 'operator_name', {
      type: DataTypes.STRING(100),
      allowNull: true
    });

    // Adicionar campo ao modelo Conversation
    await queryInterface.addColumn('conversations', 'assigned_operator_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Criar índices para performance
    await queryInterface.addIndex('users', ['parent_user_id']);
    await queryInterface.addIndex('conversations', ['assigned_operator_id']);
    await queryInterface.addIndex('conversations', ['bot_id', 'assigned_operator_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índices
    await queryInterface.removeIndex('conversations', ['bot_id', 'assigned_operator_id']);
    await queryInterface.removeIndex('conversations', ['assigned_operator_id']);
    await queryInterface.removeIndex('users', ['parent_user_id']);

    // Remover colunas
    await queryInterface.removeColumn('conversations', 'assigned_operator_id');
    await queryInterface.removeColumn('users', 'operator_name');
    await queryInterface.removeColumn('users', 'parent_user_id');

    // Reverter enum para valores originais
    await queryInterface.changeColumn('users', 'role', {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
      allowNull: false
    });
  }
};

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adicionar nova role 'operator' ao enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role" ADD VALUE 'operator';
    `);

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

    // Nota: Não é possível remover valores de enum facilmente no PostgreSQL
    // Em ambiente de produção, seria necessário criar um novo enum e migrar
  }
};

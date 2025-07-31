'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Alterar a coluna bot_id para permitir NULL
    await queryInterface.changeColumn('flows', 'bot_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'bots',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter: tornar bot_id obrigatório novamente
    await queryInterface.changeColumn('flows', 'bot_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'bots',
        key: 'id'
      }
    });
  }
};

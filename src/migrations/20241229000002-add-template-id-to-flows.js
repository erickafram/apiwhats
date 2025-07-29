'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('flows', 'template_id', {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: 'statistics'
    });

    // Adicionar índice para melhor performance
    await queryInterface.addIndex('flows', ['template_id'], {
      name: 'flows_template_id_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('flows', 'flows_template_id_index');
    await queryInterface.removeColumn('flows', 'template_id');
  }
};

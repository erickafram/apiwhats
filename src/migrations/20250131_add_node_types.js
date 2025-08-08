'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar novos tipos de nós ao ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE flow_nodes 
      MODIFY COLUMN node_type ENUM(
        'start',
        'ai_response', 
        'fixed_response',
        'message',
        'condition',
        'input_capture',
        'input',
        'action',
        'end',
        'delay',
        'webhook',
        'transfer_human',
        'ai'
      ) NOT NULL
    `);
    
    console.log('✅ Tipos de nós atualizados com sucesso');
  },

  async down(queryInterface, Sequelize) {
    // Reverter para tipos originais
    await queryInterface.sequelize.query(`
      ALTER TABLE flow_nodes 
      MODIFY COLUMN node_type ENUM(
        'start',
        'ai_response',
        'fixed_response', 
        'condition',
        'input_capture',
        'action',
        'end',
        'delay',
        'webhook',
        'transfer_human'
      ) NOT NULL
    `);
  }
};

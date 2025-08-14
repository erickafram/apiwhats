const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔧 Adicionando coluna custom_status_id na tabela conversations...');
    
    try {
      // Verificar se a coluna já existe
      const tableDescription = await queryInterface.describeTable('conversations');
      
      if (!tableDescription.custom_status_id) {
        // Adicionar a coluna custom_status_id
        await queryInterface.addColumn('conversations', 'custom_status_id', {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'conversation_statuses',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        });
        
        console.log('✅ Coluna custom_status_id adicionada com sucesso');
      } else {
        console.log('ℹ️ Coluna custom_status_id já existe');
      }
      
    } catch (error) {
      console.error('❌ Erro ao adicionar coluna custom_status_id:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔧 Removendo coluna custom_status_id da tabela conversations...');
    
    try {
      await queryInterface.removeColumn('conversations', 'custom_status_id');
      console.log('✅ Coluna custom_status_id removida com sucesso');
    } catch (error) {
      console.error('❌ Erro ao remover coluna custom_status_id:', error);
      throw error;
    }
  }
}; 
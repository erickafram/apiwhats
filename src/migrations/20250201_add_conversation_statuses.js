const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Criar tabela de status customizados
    await queryInterface.createTable('conversation_statuses', {
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
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
        defaultValue: '{}',
        comment: 'Metadados adicionais do status'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Adicionar índices
    await queryInterface.addIndex('conversation_statuses', ['user_id']);
    await queryInterface.addIndex('conversation_statuses', ['user_id', 'name'], { unique: true });
    await queryInterface.addIndex('conversation_statuses', ['is_active']);
    await queryInterface.addIndex('conversation_statuses', ['order_index']);

    // Adicionar coluna custom_status_id na tabela conversations
    await queryInterface.addColumn('conversations', 'custom_status_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'conversation_statuses',
        key: 'id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL',
      comment: 'ID do status customizado da conversa'
    });

    // Adicionar índice na nova coluna
    await queryInterface.addIndex('conversations', ['custom_status_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remover coluna da tabela conversations
    await queryInterface.removeColumn('conversations', 'custom_status_id');
    
    // Remover tabela de status customizados
    await queryInterface.dropTable('conversation_statuses');
  }
};

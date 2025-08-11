'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quick_messages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'geral'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Adicionar índices
    await queryInterface.addIndex('quick_messages', ['user_id'], {
      name: 'quick_messages_user_id_index'
    });

    await queryInterface.addIndex('quick_messages', ['category'], {
      name: 'quick_messages_category_index'
    });

    await queryInterface.addIndex('quick_messages', ['is_active'], {
      name: 'quick_messages_is_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('quick_messages', 'quick_messages_user_id_index');
    await queryInterface.removeIndex('quick_messages', 'quick_messages_category_index');
    await queryInterface.removeIndex('quick_messages', 'quick_messages_is_active_index');
    await queryInterface.dropTable('quick_messages');
  }
}; 
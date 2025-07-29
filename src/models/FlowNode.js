module.exports = (sequelize, DataTypes) => {
  const FlowNode = sequelize.define('FlowNode', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    flow_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'flows',
        key: 'id'
      }
    },
    node_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    node_type: {
      type: DataTypes.ENUM(
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
      ),
      allowNull: false
    },
    node_config: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    position_x: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    position_y: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    width: {
      type: DataTypes.INTEGER,
      defaultValue: 200
    },
    height: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    style: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
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
    tableName: 'flow_nodes',
    timestamps: true,
    indexes: [
      {
        fields: ['flow_id', 'node_id'],
        unique: true
      },
      {
        fields: ['flow_id', 'node_type']
      }
    ]
  });

  // Métodos de instância
  FlowNode.prototype.getDefaultConfig = function() {
    const configs = {
      start: {
        message: 'Olá! Como posso ajudá-lo?',
        delay: 0
      },
      ai_response: {
        system_prompt: '',
        temperature: 0.7,
        max_tokens: 500,
        fallback_message: 'Desculpe, não consegui processar sua mensagem.'
      },
      fixed_response: {
        message: '',
        delay: 1000,
        typing_indicator: true
      },
      condition: {
        conditions: [],
        operator: 'AND', // AND, OR
        fallback_path: null
      },
      input_capture: {
        variable_name: '',
        input_type: 'text', // text, number, email, phone
        validation: {
          required: true,
          min_length: 0,
          max_length: 500,
          pattern: null
        },
        retry_message: 'Por favor, digite uma resposta válida.',
        max_retries: 3
      },
      action: {
        action_type: 'webhook', // webhook, email, sms, database
        config: {}
      },
      end: {
        message: 'Obrigado pelo contato!',
        reset_session: false
      },
      delay: {
        duration: 2000,
        typing_indicator: true
      },
      webhook: {
        url: '',
        method: 'POST',
        headers: {},
        timeout: 30000,
        retry_attempts: 3
      },
      transfer_human: {
        department: 'support',
        message: 'Transferindo para um atendente humano...',
        queue_message: 'Você está na posição {position} da fila.'
      }
    };

    return configs[this.node_type] || {};
  };

  // Associações
  FlowNode.associate = function(models) {
    FlowNode.belongsTo(models.Flow, {
      foreignKey: 'flow_id',
      as: 'flow'
    });
  };

  return FlowNode;
};

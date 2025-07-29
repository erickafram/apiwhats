const { Conversation, Message, Analytics } = require('../models');
const { Op } = require('sequelize');

class QueueService {
  constructor(io) {
    this.io = io;
    this.queues = new Map(); // department -> queue
    this.agents = new Map(); // agentId -> agent info
    this.activeAssignments = new Map(); // conversationId -> agentId
    
    this.initializeQueues();
  }

  initializeQueues() {
    // Filas padrão
    const defaultQueues = [
      {
        id: 'support',
        name: 'Suporte Técnico',
        description: 'Atendimento para problemas técnicos',
        priority: 1,
        max_wait_time: 300000, // 5 minutos
        auto_assign: true,
        business_hours: {
          enabled: true,
          timezone: 'America/Sao_Paulo',
          schedule: {
            monday: { start: '09:00', end: '18:00', enabled: true },
            tuesday: { start: '09:00', end: '18:00', enabled: true },
            wednesday: { start: '09:00', end: '18:00', enabled: true },
            thursday: { start: '09:00', end: '18:00', enabled: true },
            friday: { start: '09:00', end: '18:00', enabled: true },
            saturday: { start: '09:00', end: '12:00', enabled: false },
            sunday: { start: '09:00', end: '12:00', enabled: false }
          }
        }
      },
      {
        id: 'sales',
        name: 'Vendas',
        description: 'Atendimento comercial e vendas',
        priority: 2,
        max_wait_time: 180000, // 3 minutos
        auto_assign: true,
        business_hours: {
          enabled: true,
          timezone: 'America/Sao_Paulo',
          schedule: {
            monday: { start: '08:00', end: '19:00', enabled: true },
            tuesday: { start: '08:00', end: '19:00', enabled: true },
            wednesday: { start: '08:00', end: '19:00', enabled: true },
            thursday: { start: '08:00', end: '19:00', enabled: true },
            friday: { start: '08:00', end: '19:00', enabled: true },
            saturday: { start: '09:00', end: '14:00', enabled: true },
            sunday: { start: '09:00', end: '14:00', enabled: false }
          }
        }
      },
      {
        id: 'general',
        name: 'Atendimento Geral',
        description: 'Atendimento geral e dúvidas',
        priority: 3,
        max_wait_time: 600000, // 10 minutos
        auto_assign: true,
        business_hours: {
          enabled: false
        }
      }
    ];

    defaultQueues.forEach(queue => {
      this.queues.set(queue.id, {
        ...queue,
        conversations: [],
        agents: [],
        stats: {
          total_conversations: 0,
          avg_wait_time: 0,
          avg_resolution_time: 0,
          satisfaction_score: 0
        }
      });
    });

    console.log(`✅ ${this.queues.size} filas de atendimento inicializadas`);
  }

  async addToQueue(conversationId, department = 'general', priority = 0, metadata = {}) {
    try {
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        throw new Error('Conversa não encontrada');
      }

      const queue = this.queues.get(department);
      if (!queue) {
        throw new Error(`Fila ${department} não encontrada`);
      }

      // Verificar se já está na fila
      const existingIndex = queue.conversations.findIndex(item => item.conversation_id === conversationId);
      if (existingIndex !== -1) {
        console.log(`Conversa ${conversationId} já está na fila ${department}`);
        return queue.conversations[existingIndex];
      }

      // Verificar horário de funcionamento
      if (queue.business_hours.enabled && !this.isWithinBusinessHours(queue.business_hours)) {
        await this.sendOutOfHoursMessage(conversation, queue);
        return null;
      }

      const queueItem = {
        conversation_id: conversationId,
        user_phone: conversation.user_phone,
        user_name: conversation.user_name,
        bot_id: conversation.bot_id,
        priority,
        added_at: new Date(),
        estimated_wait_time: this.calculateEstimatedWaitTime(queue),
        metadata
      };

      // Inserir na posição correta baseado na prioridade
      const insertIndex = this.findInsertPosition(queue.conversations, priority);
      queue.conversations.splice(insertIndex, 0, queueItem);

      // Atualizar status da conversa
      await conversation.update({
        status: 'waiting',
        metadata: {
          ...conversation.metadata,
          queue_department: department,
          queue_position: insertIndex + 1,
          queue_added_at: new Date(),
          estimated_wait_time: queueItem.estimated_wait_time
        }
      });

      // Registrar métrica
      await Analytics.create({
        bot_id: conversation.bot_id,
        metric_type: 'conversation_queued',
        conversation_id: conversationId,
        user_phone: conversation.user_phone,
        metadata: {
          department,
          priority,
          queue_position: insertIndex + 1,
          estimated_wait_time: queueItem.estimated_wait_time
        }
      });

      // Notificar agentes disponíveis
      this.notifyAvailableAgents(department, queueItem);

      // Enviar mensagem de confirmação
      await this.sendQueueConfirmationMessage(conversation, queue, insertIndex + 1);

      // Auto-assign se habilitado e há agentes disponíveis
      if (queue.auto_assign) {
        setTimeout(() => {
          this.tryAutoAssign(department);
        }, 1000);
      }

      console.log(`Conversa ${conversationId} adicionada à fila ${department} na posição ${insertIndex + 1}`);
      
      return queueItem;

    } catch (error) {
      console.error('Erro ao adicionar à fila:', error);
      throw error;
    }
  }

  async assignToAgent(conversationId, agentId, department) {
    try {
      const queue = this.queues.get(department);
      if (!queue) {
        throw new Error(`Fila ${department} não encontrada`);
      }

      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error(`Agente ${agentId} não encontrado`);
      }

      if (agent.status !== 'available') {
        throw new Error(`Agente ${agentId} não está disponível`);
      }

      // Remover da fila
      const queueIndex = queue.conversations.findIndex(item => item.conversation_id === conversationId);
      if (queueIndex === -1) {
        throw new Error('Conversa não encontrada na fila');
      }

      const queueItem = queue.conversations.splice(queueIndex, 1)[0];
      const waitTime = Date.now() - queueItem.added_at.getTime();

      // Atualizar status do agente
      agent.status = 'busy';
      agent.current_conversation = conversationId;
      agent.assigned_at = new Date();

      // Registrar assignment
      this.activeAssignments.set(conversationId, agentId);

      // Atualizar conversa
      const conversation = await Conversation.findByPk(conversationId);
      await conversation.update({
        status: 'active',
        metadata: {
          ...conversation.metadata,
          assigned_agent: agentId,
          assigned_at: new Date(),
          wait_time: waitTime,
          queue_department: department
        }
      });

      // Registrar métrica
      await Analytics.create({
        bot_id: conversation.bot_id,
        metric_type: 'conversation_assigned',
        conversation_id: conversationId,
        user_phone: conversation.user_phone,
        metadata: {
          agent_id: agentId,
          department,
          wait_time: waitTime,
          queue_position: queueIndex + 1
        }
      });

      // Atualizar estatísticas da fila
      this.updateQueueStats(queue, waitTime);

      // Notificar agente e usuário
      this.notifyAgentAssignment(agentId, conversationId, queueItem);
      await this.sendAssignmentMessage(conversation, agent);

      // Atualizar posições na fila
      this.updateQueuePositions(queue);

      console.log(`Conversa ${conversationId} atribuída ao agente ${agentId}`);

      return {
        conversation_id: conversationId,
        agent_id: agentId,
        wait_time: waitTime,
        assigned_at: new Date()
      };

    } catch (error) {
      console.error('Erro ao atribuir agente:', error);
      throw error;
    }
  }

  async releaseFromAgent(conversationId, reason = 'completed') {
    try {
      const agentId = this.activeAssignments.get(conversationId);
      if (!agentId) {
        console.log(`Conversa ${conversationId} não está atribuída a nenhum agente`);
        return;
      }

      const agent = this.agents.get(agentId);
      if (agent) {
        agent.status = 'available';
        agent.current_conversation = null;
        agent.last_activity = new Date();
        
        if (reason === 'completed') {
          agent.stats.completed_conversations++;
        }
      }

      // Remover assignment
      this.activeAssignments.delete(conversationId);

      // Atualizar conversa
      const conversation = await Conversation.findByPk(conversationId);
      if (conversation) {
        const resolutionTime = conversation.metadata?.assigned_at ? 
          Date.now() - new Date(conversation.metadata.assigned_at).getTime() : 0;

        await conversation.update({
          status: reason === 'completed' ? 'completed' : 'active',
          completed_at: reason === 'completed' ? new Date() : null,
          metadata: {
            ...conversation.metadata,
            released_at: new Date(),
            release_reason: reason,
            resolution_time: resolutionTime
          }
        });

        // Registrar métrica
        await Analytics.create({
          bot_id: conversation.bot_id,
          metric_type: 'conversation_released',
          conversation_id: conversationId,
          user_phone: conversation.user_phone,
          metadata: {
            agent_id: agentId,
            reason,
            resolution_time: resolutionTime
          }
        });
      }

      // Tentar próximo assignment automático
      if (agent && agent.status === 'available') {
        Object.keys(agent.departments).forEach(department => {
          setTimeout(() => {
            this.tryAutoAssign(department);
          }, 500);
        });
      }

      console.log(`Conversa ${conversationId} liberada do agente ${agentId} (${reason})`);

    } catch (error) {
      console.error('Erro ao liberar conversa do agente:', error);
    }
  }

  registerAgent(agentData) {
    const agent = {
      id: agentData.id,
      name: agentData.name,
      email: agentData.email,
      departments: agentData.departments || ['general'],
      status: 'available', // available, busy, away, offline
      max_concurrent: agentData.max_concurrent || 3,
      current_conversation: null,
      skills: agentData.skills || [],
      stats: {
        total_conversations: 0,
        completed_conversations: 0,
        avg_response_time: 0,
        satisfaction_score: 0
      },
      last_activity: new Date(),
      connected_at: new Date()
    };

    this.agents.set(agent.id, agent);

    // Adicionar agente às filas apropriadas
    agent.departments.forEach(department => {
      const queue = this.queues.get(department);
      if (queue && !queue.agents.includes(agent.id)) {
        queue.agents.push(agent.id);
      }
    });

    console.log(`Agente ${agent.name} (${agent.id}) registrado`);
    return agent;
  }

  unregisterAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Liberar conversa atual se houver
    if (agent.current_conversation) {
      this.releaseFromAgent(agent.current_conversation, 'agent_disconnected');
    }

    // Remover das filas
    agent.departments.forEach(department => {
      const queue = this.queues.get(department);
      if (queue) {
        const index = queue.agents.indexOf(agentId);
        if (index !== -1) {
          queue.agents.splice(index, 1);
        }
      }
    });

    this.agents.delete(agentId);
    console.log(`Agente ${agentId} desregistrado`);
  }

  tryAutoAssign(department) {
    const queue = this.queues.get(department);
    if (!queue || queue.conversations.length === 0) return;

    // Encontrar agente disponível
    const availableAgent = this.findAvailableAgent(department);
    if (!availableAgent) return;

    // Pegar próxima conversa da fila
    const nextConversation = queue.conversations[0];
    
    // Fazer assignment
    this.assignToAgent(nextConversation.conversation_id, availableAgent.id, department)
      .catch(error => {
        console.error('Erro no auto-assignment:', error);
      });
  }

  findAvailableAgent(department) {
    const queue = this.queues.get(department);
    if (!queue) return null;

    for (const agentId of queue.agents) {
      const agent = this.agents.get(agentId);
      if (agent && agent.status === 'available') {
        // Verificar se não excedeu limite de conversas simultâneas
        const currentConversations = Array.from(this.activeAssignments.values())
          .filter(id => id === agentId).length;
        
        if (currentConversations < agent.max_concurrent) {
          return agent;
        }
      }
    }

    return null;
  }

  findInsertPosition(conversations, priority) {
    for (let i = 0; i < conversations.length; i++) {
      if (conversations[i].priority < priority) {
        return i;
      }
    }
    return conversations.length;
  }

  calculateEstimatedWaitTime(queue) {
    if (queue.conversations.length === 0) return 0;
    
    const avgResolutionTime = queue.stats.avg_resolution_time || 300000; // 5 min default
    const availableAgents = queue.agents.filter(agentId => {
      const agent = this.agents.get(agentId);
      return agent && agent.status === 'available';
    }).length;

    if (availableAgents === 0) return queue.max_wait_time;

    return Math.min(
      (queue.conversations.length / availableAgents) * avgResolutionTime,
      queue.max_wait_time
    );
  }

  updateQueueStats(queue, waitTime) {
    queue.stats.total_conversations++;
    
    // Atualizar tempo médio de espera
    const currentAvg = queue.stats.avg_wait_time || 0;
    queue.stats.avg_wait_time = (currentAvg + waitTime) / 2;
  }

  updateQueuePositions(queue) {
    queue.conversations.forEach((item, index) => {
      item.queue_position = index + 1;
    });
  }

  isWithinBusinessHours(businessHours) {
    if (!businessHours.enabled) return true;

    const now = new Date();
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const schedule = businessHours.schedule[dayOfWeek];

    if (!schedule || !schedule.enabled) return false;

    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(schedule.start.replace(':', ''));
    const endTime = parseInt(schedule.end.replace(':', ''));

    return currentTime >= startTime && currentTime <= endTime;
  }

  // Métodos de notificação e mensagens
  notifyAvailableAgents(department, queueItem) {
    const queue = this.queues.get(department);
    if (!queue) return;

    queue.agents.forEach(agentId => {
      const agent = this.agents.get(agentId);
      if (agent && agent.status === 'available') {
        this.io.to(`agent_${agentId}`).emit('new_queue_item', {
          department,
          conversation_id: queueItem.conversation_id,
          user_phone: queueItem.user_phone,
          user_name: queueItem.user_name,
          priority: queueItem.priority,
          estimated_wait_time: queueItem.estimated_wait_time
        });
      }
    });
  }

  notifyAgentAssignment(agentId, conversationId, queueItem) {
    this.io.to(`agent_${agentId}`).emit('conversation_assigned', {
      conversation_id: conversationId,
      user_phone: queueItem.user_phone,
      user_name: queueItem.user_name,
      metadata: queueItem.metadata
    });
  }

  async sendQueueConfirmationMessage(conversation, queue, position) {
    const message = `🎯 Você foi adicionado à fila de ${queue.name}!\n\n📍 Posição na fila: ${position}\n⏱️ Tempo estimado: ${Math.ceil(queue.stats.avg_wait_time / 60000)} minutos\n\nAguarde que em breve um atendente entrará em contato!`;
    
    await global.whatsappService.sendMessage(
      conversation.bot_id,
      conversation.user_phone,
      message
    );

    await Message.create({
      conversation_id: conversation.id,
      direction: 'out',
      content: message,
      media_type: 'text',
      status: 'sent',
      processed: true,
      metadata: {
        system_message: true,
        queue_message: true
      }
    });
  }

  async sendAssignmentMessage(conversation, agent) {
    const message = `👨‍💼 Olá! Sou ${agent.name} e vou ajudá-lo agora.\n\nComo posso ajudá-lo?`;
    
    await global.whatsappService.sendMessage(
      conversation.bot_id,
      conversation.user_phone,
      message
    );

    await Message.create({
      conversation_id: conversation.id,
      direction: 'out',
      content: message,
      media_type: 'text',
      status: 'sent',
      processed: true,
      metadata: {
        agent_message: true,
        agent_id: agent.id
      }
    });
  }

  async sendOutOfHoursMessage(conversation, queue) {
    const schedule = queue.business_hours.schedule;
    const message = `🕒 Nosso atendimento está fora do horário de funcionamento.\n\n📅 Horários de atendimento:\nSegunda a Sexta: ${schedule.monday.start} às ${schedule.monday.end}\n\nDeixe sua mensagem que retornaremos assim que possível!`;
    
    await global.whatsappService.sendMessage(
      conversation.bot_id,
      conversation.user_phone,
      message
    );

    await Message.create({
      conversation_id: conversation.id,
      direction: 'out',
      content: message,
      media_type: 'text',
      status: 'sent',
      processed: true,
      metadata: {
        system_message: true,
        out_of_hours: true
      }
    });
  }

  // Métodos de consulta
  getQueueStatus(department) {
    const queue = this.queues.get(department);
    if (!queue) return null;

    return {
      department,
      name: queue.name,
      conversations_waiting: queue.conversations.length,
      agents_available: queue.agents.filter(agentId => {
        const agent = this.agents.get(agentId);
        return agent && agent.status === 'available';
      }).length,
      agents_total: queue.agents.length,
      avg_wait_time: queue.stats.avg_wait_time,
      estimated_wait_time: this.calculateEstimatedWaitTime(queue)
    };
  }

  getAllQueuesStatus() {
    const status = {};
    for (const [department, queue] of this.queues.entries()) {
      status[department] = this.getQueueStatus(department);
    }
    return status;
  }

  getAgentStatus(agentId) {
    return this.agents.get(agentId) || null;
  }

  getAllAgentsStatus() {
    return Array.from(this.agents.values());
  }
}

module.exports = QueueService;

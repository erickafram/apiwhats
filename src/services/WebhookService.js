const axios = require('axios');
const crypto = require('crypto');
const { Analytics } = require('../models');

class WebhookService {
  constructor() {
    this.retryDelays = [1000, 3000, 10000, 30000, 60000]; // 1s, 3s, 10s, 30s, 1m
    this.maxRetries = 5;
    this.timeout = 30000; // 30 segundos
  }

  async executeWebhook(webhookConfig, data, context = {}) {
    const {
      url,
      method = 'POST',
      headers = {},
      authentication = null,
      retry_config = {},
      timeout = this.timeout
    } = webhookConfig;

    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      // Preparar headers
      const requestHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp-Chatbot-System/1.0',
        'X-Request-ID': requestId,
        'X-Timestamp': new Date().toISOString(),
        ...headers
      };

      // Adicionar autenticação se configurada
      if (authentication) {
        this.addAuthentication(requestHeaders, authentication);
      }

      // Preparar payload
      const payload = this.preparePayload(data, context);

      // Adicionar assinatura se configurada
      if (webhookConfig.signature_secret) {
        requestHeaders['X-Signature'] = this.generateSignature(payload, webhookConfig.signature_secret);
      }

      // Executar requisição
      const response = await this.makeRequest({
        url,
        method,
        headers: requestHeaders,
        data: payload,
        timeout
      });

      const duration = Date.now() - startTime;

      // Log de sucesso
      await this.logWebhookExecution({
        request_id: requestId,
        url,
        method,
        status: 'success',
        status_code: response.status,
        duration,
        payload,
        response_data: response.data,
        context
      });

      return {
        success: true,
        request_id: requestId,
        status_code: response.status,
        response_data: response.data,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log de erro
      await this.logWebhookExecution({
        request_id: requestId,
        url,
        method,
        status: 'error',
        status_code: error.response?.status || 0,
        duration,
        payload: data,
        error_message: error.message,
        error_details: error.response?.data,
        context
      });

      // Verificar se deve fazer retry
      const shouldRetry = this.shouldRetry(error, retry_config);
      
      if (shouldRetry) {
        return await this.executeWithRetry(webhookConfig, data, context, 1);
      }

      throw error;
    }
  }

  async executeWithRetry(webhookConfig, data, context, attempt) {
    const maxRetries = webhookConfig.retry_config?.max_retries || this.maxRetries;
    
    if (attempt > maxRetries) {
      throw new Error(`Webhook falhou após ${maxRetries} tentativas`);
    }

    const delay = this.getRetryDelay(attempt, webhookConfig.retry_config);
    
    console.log(`Tentativa ${attempt}/${maxRetries} do webhook em ${delay}ms...`);
    
    await this.sleep(delay);

    try {
      return await this.executeWebhook(webhookConfig, data, {
        ...context,
        retry_attempt: attempt
      });
    } catch (error) {
      if (this.shouldRetry(error, webhookConfig.retry_config)) {
        return await this.executeWithRetry(webhookConfig, data, context, attempt + 1);
      }
      throw error;
    }
  }

  async makeRequest(config) {
    return await axios(config);
  }

  preparePayload(data, context) {
    return {
      timestamp: new Date().toISOString(),
      event_type: context.event_type || 'webhook_call',
      data,
      context: {
        bot_id: context.bot_id,
        conversation_id: context.conversation_id,
        user_phone: context.user_phone,
        flow_id: context.flow_id,
        node_id: context.node_id,
        retry_attempt: context.retry_attempt || 0
      }
    };
  }

  addAuthentication(headers, authentication) {
    switch (authentication.type) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${authentication.token}`;
        break;
      
      case 'basic':
        const credentials = Buffer.from(`${authentication.username}:${authentication.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
        break;
      
      case 'api_key':
        if (authentication.header_name) {
          headers[authentication.header_name] = authentication.api_key;
        } else {
          headers['X-API-Key'] = authentication.api_key;
        }
        break;
      
      case 'custom':
        Object.assign(headers, authentication.headers);
        break;
    }
  }

  generateSignature(payload, secret) {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }

  shouldRetry(error, retryConfig = {}) {
    const retryableStatusCodes = retryConfig.retryable_status_codes || [408, 429, 500, 502, 503, 504];
    const retryableErrors = retryConfig.retryable_errors || ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];

    // Verificar status code
    if (error.response && retryableStatusCodes.includes(error.response.status)) {
      return true;
    }

    // Verificar código de erro
    if (error.code && retryableErrors.includes(error.code)) {
      return true;
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      return true;
    }

    return false;
  }

  getRetryDelay(attempt, retryConfig = {}) {
    const baseDelay = retryConfig.base_delay || 1000;
    const maxDelay = retryConfig.max_delay || 60000;
    const backoffMultiplier = retryConfig.backoff_multiplier || 2;

    if (retryConfig.delays && retryConfig.delays[attempt - 1]) {
      return retryConfig.delays[attempt - 1];
    }

    // Exponential backoff
    const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
    return Math.min(delay, maxDelay);
  }

  async logWebhookExecution(logData) {
    try {
      await Analytics.create({
        bot_id: logData.context?.bot_id || null,
        metric_type: 'webhook_called',
        metric_value: logData.status === 'success' ? 1 : 0,
        conversation_id: logData.context?.conversation_id || null,
        flow_id: logData.context?.flow_id || null,
        node_id: logData.context?.node_id || null,
        user_phone: logData.context?.user_phone || null,
        metadata: {
          request_id: logData.request_id,
          url: logData.url,
          method: logData.method,
          status: logData.status,
          status_code: logData.status_code,
          duration: logData.duration,
          error_message: logData.error_message,
          retry_attempt: logData.context?.retry_attempt || 0
        }
      });
    } catch (error) {
      console.error('Erro ao registrar log do webhook:', error);
    }
  }

  generateRequestId() {
    return crypto.randomBytes(16).toString('hex');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Métodos para diferentes tipos de webhook

  async sendToZapier(data, zapierUrl, context = {}) {
    return await this.executeWebhook({
      url: zapierUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, data, { ...context, webhook_type: 'zapier' });
  }

  async sendToCRM(leadData, crmConfig, context = {}) {
    return await this.executeWebhook({
      url: crmConfig.url,
      method: 'POST',
      headers: crmConfig.headers,
      authentication: crmConfig.authentication,
      retry_config: {
        max_retries: 3,
        base_delay: 2000
      }
    }, leadData, { ...context, webhook_type: 'crm' });
  }

  async sendNotification(notificationData, notificationConfig, context = {}) {
    return await this.executeWebhook({
      url: notificationConfig.url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...notificationConfig.headers
      },
      authentication: notificationConfig.authentication
    }, notificationData, { ...context, webhook_type: 'notification' });
  }

  async sendToSlack(message, slackWebhookUrl, context = {}) {
    const slackPayload = {
      text: message.text || message,
      username: 'WhatsApp Bot',
      icon_emoji: ':robot_face:',
      attachments: message.attachments || []
    };

    return await this.executeWebhook({
      url: slackWebhookUrl,
      method: 'POST'
    }, slackPayload, { ...context, webhook_type: 'slack' });
  }

  async sendToDiscord(message, discordWebhookUrl, context = {}) {
    const discordPayload = {
      content: message.content || message,
      username: 'WhatsApp Bot',
      avatar_url: message.avatar_url,
      embeds: message.embeds || []
    };

    return await this.executeWebhook({
      url: discordWebhookUrl,
      method: 'POST'
    }, discordPayload, { ...context, webhook_type: 'discord' });
  }

  // Validar configuração de webhook
  validateWebhookConfig(config) {
    const errors = [];

    if (!config.url) {
      errors.push('URL é obrigatória');
    }

    if (config.url && !this.isValidUrl(config.url)) {
      errors.push('URL inválida');
    }

    if (config.method && !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase())) {
      errors.push('Método HTTP inválido');
    }

    if (config.authentication) {
      const authErrors = this.validateAuthentication(config.authentication);
      errors.push(...authErrors);
    }

    return errors;
  }

  validateAuthentication(auth) {
    const errors = [];

    if (!auth.type) {
      errors.push('Tipo de autenticação é obrigatório');
      return errors;
    }

    switch (auth.type) {
      case 'bearer':
        if (!auth.token) {
          errors.push('Token é obrigatório para autenticação Bearer');
        }
        break;
      
      case 'basic':
        if (!auth.username || !auth.password) {
          errors.push('Username e password são obrigatórios para autenticação Basic');
        }
        break;
      
      case 'api_key':
        if (!auth.api_key) {
          errors.push('API Key é obrigatória');
        }
        break;
    }

    return errors;
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

module.exports = WebhookService;

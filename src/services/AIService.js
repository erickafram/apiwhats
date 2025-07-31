const axios = require('axios');

class AIService {
  constructor() {
    this.apiUrl = process.env.TOGETHER_API_URL || 'https://api.together.xyz/v1/chat/completions';
    this.apiToken = process.env.TOGETHER_API_TOKEN;
    this.defaultModel = process.env.TOGETHER_MODEL || 'deepseek-ai/DeepSeek-V3';
    
    if (!this.apiToken) {
      console.warn('TOGETHER_API_TOKEN não configurado. Funcionalidades de IA estarão desabilitadas.');
    }
  }

  async generateResponse({ message, context = [], config = {}, userPhone }) {
    try {
      if (!this.apiToken) {
        throw new Error('API Token da Together.xyz não configurado');
      }

      const {
        model = this.defaultModel,
        temperature = 0.7,
        max_tokens = 1000,
        system_prompt = 'Você é um assistente virtual útil e amigável.'
      } = config;

      // Preparar mensagens para a API
      const messages = this.prepareMessages(message, context, system_prompt);

      // Fazer requisição para Together.xyz
      const response = await axios.post(this.apiUrl, {
        model,
        messages,
        temperature,
        max_tokens,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const choice = response.data.choices[0];
        const content = choice.message.content.trim();
        
        // Calcular score de confiança baseado na resposta
        const confidence = this.calculateConfidence(choice, response.data);

        return {
          content,
          confidence,
          model,
          usage: response.data.usage,
          finish_reason: choice.finish_reason
        };
      }

      throw new Error('Resposta inválida da API Together.xyz');

    } catch (error) {
      console.error('Erro ao gerar resposta com IA:', error);
      
      if (error.response) {
        console.error('Resposta da API:', error.response.data);
      }

      // Retornar null em caso de erro para que o sistema use fallback
      return null;
    }
  }

  prepareMessages(userMessage, context, systemPrompt) {
    const messages = [];

    // Adicionar prompt do sistema
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Adicionar contexto da conversa (limitado aos últimos 10 para não exceder limites)
    const recentContext = context.slice(-10);
    
    for (const contextItem of recentContext) {
      messages.push({
        role: contextItem.role === 'user' ? 'user' : 'assistant',
        content: contextItem.content
      });
    }

    // Adicionar mensagem atual do usuário
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  calculateConfidence(choice, responseData) {
    try {
      // Fatores para calcular confiança:
      // 1. Finish reason (completed = maior confiança)
      // 2. Comprimento da resposta (muito curta ou muito longa = menor confiança)
      // 3. Presença de tokens de incerteza

      let confidence = 0.8; // Base

      // Ajustar baseado no finish_reason
      if (choice.finish_reason === 'stop') {
        confidence += 0.1;
      } else if (choice.finish_reason === 'length') {
        confidence -= 0.2;
      }

      // Ajustar baseado no comprimento
      const contentLength = choice.message.content.length;
      if (contentLength < 10) {
        confidence -= 0.3;
      } else if (contentLength > 1000) {
        confidence -= 0.1;
      }

      // Verificar tokens de incerteza
      const uncertaintyPhrases = [
        'não sei', 'não tenho certeza', 'talvez', 'possivelmente',
        'não posso', 'desculpe', 'não entendi'
      ];
      
      const content = choice.message.content.toLowerCase();
      const hasUncertainty = uncertaintyPhrases.some(phrase => content.includes(phrase));
      
      if (hasUncertainty) {
        confidence -= 0.2;
      }

      // Garantir que a confiança esteja entre 0 e 1
      return Math.max(0, Math.min(1, confidence));

    } catch (error) {
      console.error('Erro ao calcular confiança:', error);
      return 0.5; // Confiança média em caso de erro
    }
  }

  async classifyIntent(message, possibleIntents = []) {
    try {
      if (!this.apiToken || possibleIntents.length === 0) {
        return null;
      }

      const systemPrompt = `Você é um classificador de intenções. Analise a mensagem do usuário e classifique-a em uma das seguintes intenções: ${possibleIntents.join(', ')}. Responda apenas com o nome da intenção mais provável.`;

      const response = await this.generateResponse({
        message,
        context: [],
        config: {
          system_prompt: systemPrompt,
          temperature: 0.1,
          max_tokens: 50
        }
      });

      if (response && response.content) {
        const intent = response.content.toLowerCase().trim();
        
        // Verificar se a intenção está na lista de possíveis
        const matchedIntent = possibleIntents.find(i => 
          intent.includes(i.toLowerCase()) || i.toLowerCase().includes(intent)
        );

        return {
          intent: matchedIntent || 'unknown',
          confidence: response.confidence,
          raw_response: response.content
        };
      }

      return null;

    } catch (error) {
      console.error('Erro ao classificar intenção:', error);
      return null;
    }
  }

  async extractEntities(message, entityTypes = []) {
    try {
      if (!this.apiToken || entityTypes.length === 0) {
        return [];
      }

      const systemPrompt = `Você é um extrator de entidades. Analise a mensagem e extraia as seguintes entidades: ${entityTypes.join(', ')}. Responda em formato JSON com a estrutura: {"entities": [{"type": "tipo", "value": "valor", "start": posição_inicial, "end": posição_final}]}`;

      const response = await this.generateResponse({
        message,
        context: [],
        config: {
          system_prompt: systemPrompt,
          temperature: 0.1,
          max_tokens: 200
        }
      });

      if (response && response.content) {
        try {
          const parsed = JSON.parse(response.content);
          return parsed.entities || [];
        } catch (parseError) {
          console.error('Erro ao parsear entidades:', parseError);
          return [];
        }
      }

      return [];

    } catch (error) {
      console.error('Erro ao extrair entidades:', error);
      return [];
    }
  }

  async analyzeSentiment(message) {
    try {
      if (!this.apiToken) {
        return null;
      }

      const systemPrompt = 'Analise o sentimento da mensagem e responda apenas com: "positivo", "negativo" ou "neutro".';

      const response = await this.generateResponse({
        message,
        context: [],
        config: {
          system_prompt: systemPrompt,
          temperature: 0.1,
          max_tokens: 10
        }
      });

      if (response && response.content) {
        const sentiment = response.content.toLowerCase().trim();
        
        if (['positivo', 'negativo', 'neutro'].includes(sentiment)) {
          return {
            sentiment,
            confidence: response.confidence
          };
        }
      }

      return null;

    } catch (error) {
      console.error('Erro ao analisar sentimento:', error);
      return null;
    }
  }

  async summarizeConversation(messages, maxLength = 200) {
    try {
      if (!this.apiToken || !messages || messages.length === 0) {
        return null;
      }

      // Preparar contexto da conversa
      const conversationText = messages.map(msg => 
        `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`
      ).join('\n');

      const systemPrompt = `Resuma a seguinte conversa em no máximo ${maxLength} caracteres, destacando os pontos principais e o resultado da interação:`;

      const response = await this.generateResponse({
        message: conversationText,
        context: [],
        config: {
          system_prompt: systemPrompt,
          temperature: 0.3,
          max_tokens: Math.ceil(maxLength / 3) // Aproximadamente 3 caracteres por token
        }
      });

      if (response && response.content) {
        return {
          summary: response.content.substring(0, maxLength),
          confidence: response.confidence
        };
      }

      return null;

    } catch (error) {
      console.error('Erro ao resumir conversa:', error);
      return null;
    }
  }

  async generateVariations(text, count = 3) {
    try {
      if (!this.apiToken) {
        return [text];
      }

      const systemPrompt = `Gere ${count} variações diferentes da seguinte mensagem, mantendo o mesmo significado mas com palavras e estruturas diferentes. Responda apenas com as variações, uma por linha:`;

      const response = await this.generateResponse({
        message: text,
        context: [],
        config: {
          system_prompt: systemPrompt,
          temperature: 0.8,
          max_tokens: 300
        }
      });

      if (response && response.content) {
        const variations = response.content
          .split('\n')
          .map(v => v.trim())
          .filter(v => v.length > 0)
          .slice(0, count);

        return variations.length > 0 ? variations : [text];
      }

      return [text];

    } catch (error) {
      console.error('Erro ao gerar variações:', error);
      return [text];
    }
  }

  isAvailable() {
    return !!this.apiToken;
  }

  getStatus() {
    return {
      available: this.isAvailable(),
      model: this.defaultModel,
      api_url: this.apiUrl
    };
  }
}

module.exports = AIService;

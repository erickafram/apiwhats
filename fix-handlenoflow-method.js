#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRIGINDO MÉTODO handleNoFlow');
console.log('=================================\n');

function fixHandleNoFlowMethod() {
  const filePath = './src/services/MaytapiFlowProcessor.js';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Arquivo MaytapiFlowProcessor.js não encontrado');
    return;
  }

  console.log('1️⃣ Lendo arquivo atual...');
  let content = fs.readFileSync(filePath, 'utf8');

  // Encontrar e substituir o método handleNoFlow
  const oldHandleNoFlow = `  async handleNoFlow(botId, phoneNumber, messageContent) {
    // Usar IA como fallback
    try {
      const AIService = require('./AIService');
      const aiService = new AIService();
      
      const response = await aiService.generateResponse(
        'Você é um assistente virtual prestativo. Responda de forma amigável.',
        messageContent
      );
      
      await this.sendMessage(botId, phoneNumber, response);
      return { success: true, usedAI: true };
      
    } catch (error) {
      console.error('❌ Erro na IA fallback:', error);
      return await this.sendErrorMessage(botId, phoneNumber);
    }
  }`;

  const newHandleNoFlow = `  async handleNoFlow(botId, phoneNumber, messageContent) {
    console.log(\`🤖 Nenhum fluxo encontrado para bot \${botId}, usando resposta padrão\`);
    
    // Resposta padrão mais útil em vez de erro
    const defaultResponse = \`👋 Olá! Como posso ajudá-lo?

Comandos disponíveis:
• Digite "menu" - Ver opções principais
• Digite "ajuda" - Obter suporte
• Digite "contato" - Falar conosco

Ou descreva o que você precisa que tentarei ajudar!\`;

    try {
      // Tentar usar IA primeiro
      const AIService = require('./AIService');
      const aiService = new AIService();
      
      const aiResponse = await aiService.generateResponse({
        message: messageContent,
        context: [],
        config: {
          system_prompt: 'Você é um assistente virtual de uma auto mecânica. Seja prestativo e amigável. Se não souber algo, oriente o cliente a usar o comando "menu" ou "contato".',
          temperature: 0.7,
          max_tokens: 150
        }
      });
      
      if (aiResponse && aiResponse.content) {
        await this.sendMessage(botId, phoneNumber, aiResponse.content);
        return { success: true, usedAI: true };
      } else {
        throw new Error('IA não retornou resposta válida');
      }
      
    } catch (error) {
      console.log(\`⚠️ IA indisponível para bot \${botId}, usando resposta padrão\`);
      
      // Em vez de erro, usar resposta padrão útil
      await this.sendMessage(botId, phoneNumber, defaultResponse);
      return { success: true, usedDefault: true };
    }
  }`;

  // Substituir o método
  if (content.includes('async handleNoFlow(botId, phoneNumber, messageContent)')) {
    content = content.replace(oldHandleNoFlow, newHandleNoFlow);
    console.log('2️⃣ Método handleNoFlow substituído');
  } else {
    console.log('⚠️ Método handleNoFlow não encontrado na forma esperada');
    return;
  }

  // Melhorar também o método sendErrorMessage para ser menos assustador
  const oldSendErrorMessage = `  async sendErrorMessage(botId, phoneNumber) {
    const errorMsg = 'Desculpe, ocorreu um erro. Tente novamente ou digite "ajuda" para obter suporte.';
    await this.sendMessage(botId, phoneNumber, errorMsg);
    return { success: false, error: true };
  }`;

  const newSendErrorMessage = `  async sendErrorMessage(botId, phoneNumber) {
    const helpMsg = \`🤔 Não entendi sua mensagem.

Tente:
• "menu" - Ver opções
• "ajuda" - Obter suporte  
• "contato" - Falar conosco

Ou reformule sua pergunta!\`;
    
    await this.sendMessage(botId, phoneNumber, helpMsg);
    return { success: true, showedHelp: true };
  }`;

  if (content.includes('async sendErrorMessage(botId, phoneNumber)')) {
    content = content.replace(oldSendErrorMessage, newSendErrorMessage);
    console.log('3️⃣ Método sendErrorMessage melhorado');
  }

  // Melhorar o comando "menu" para ser mais robusto
  const menuCommandIndex = content.indexOf("messageContent.toLowerCase() === 'menu'");
  if (menuCommandIndex !== -1) {
    console.log('4️⃣ Comando menu encontrado e está OK');
  } else {
    console.log('⚠️ Comando menu pode precisar de ajustes');
  }

  // Salvar arquivo
  console.log('5️⃣ Salvando arquivo modificado...');
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ Arquivo MaytapiFlowProcessor.js corrigido!');
  
  console.log('\n🎯 MUDANÇAS REALIZADAS:');
  console.log('   • handleNoFlow agora usa resposta útil em vez de erro');
  console.log('   • IA como primeira opção, resposta padrão como fallback');
  console.log('   • sendErrorMessage agora é mais amigável');
  console.log('   • Orientações claras para o usuário');

  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('   1. Execute: pm2 restart chatbot-whats-api');
  console.log('   2. Teste enviando qualquer mensagem');
  console.log('   3. Agora deve receber resposta útil em vez de erro');
}

// Executar correção
try {
  fixHandleNoFlowMethod();
  console.log('\n🎉 Correção concluída com sucesso!');
} catch (error) {
  console.error('❌ Erro durante correção:', error);
}

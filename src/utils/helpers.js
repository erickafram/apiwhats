const crypto = require('crypto');

/**
 * Gerar ID único
 */
function generateId(prefix = '', length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return prefix ? `${prefix}_${result}` : result;
}

/**
 * Formatar número de telefone
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remover caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Adicionar código do país se não tiver
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `55${cleaned.substring(1)}`;
  }
  
  if (cleaned.length === 11 && !cleaned.startsWith('55')) {
    return `55${cleaned}`;
  }
  
  return cleaned;
}

/**
 * Validar número de telefone brasileiro
 */
function isValidBrazilianPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato: 55 + DDD (2 dígitos) + número (8 ou 9 dígitos)
  const regex = /^55[1-9][0-9]{8,9}$/;
  return regex.test(cleaned);
}

/**
 * Sanitizar texto para evitar XSS
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remover < e >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
}

/**
 * Truncar texto
 */
function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Extrair menções (@usuario) do texto
 */
function extractMentions(text) {
  if (!text) return [];
  
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

/**
 * Extrair hashtags (#tag) do texto
 */
function extractHashtags(text) {
  if (!text) return [];
  
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;
  
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }
  
  return hashtags;
}

/**
 * Detectar idioma do texto (básico)
 */
function detectLanguage(text) {
  if (!text) return 'unknown';
  
  const portugueseWords = ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais'];
  const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'];
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para'];
  
  const words = text.toLowerCase().split(/\s+/);
  
  let ptCount = 0;
  let enCount = 0;
  let esCount = 0;
  
  words.forEach(word => {
    if (portugueseWords.includes(word)) ptCount++;
    if (englishWords.includes(word)) enCount++;
    if (spanishWords.includes(word)) esCount++;
  });
  
  if (ptCount > enCount && ptCount > esCount) return 'pt';
  if (enCount > ptCount && enCount > esCount) return 'en';
  if (esCount > ptCount && esCount > enCount) return 'es';
  
  return 'unknown';
}

/**
 * Calcular similaridade entre textos (Levenshtein distance)
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const distance = matrix[len2][len1];
  const maxLength = Math.max(len1, len2);
  
  return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
}

/**
 * Gerar hash MD5
 */
function generateMD5(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * Gerar hash SHA256
 */
function generateSHA256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Criptografar texto
 */
function encrypt(text, key) {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Descriptografar texto
 */
function decrypt(encryptedText, key) {
  try {
    const algorithm = 'aes-256-cbc';
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = parts.join(':');
    const decipher = crypto.createDecipher(algorithm, key);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    return null;
  }
}

/**
 * Formatar duração em milissegundos para texto legível
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Formatar bytes para texto legível
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validar URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Extrair domínio de URL
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (_) {
    return null;
  }
}

/**
 * Gerar slug a partir de texto
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiais
    .replace(/\s+/g, '-') // Substituir espaços por hífens
    .replace(/-+/g, '-') // Remover hífens duplicados
    .trim('-'); // Remover hífens do início e fim
}

/**
 * Delay/sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry com backoff exponencial
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
}

module.exports = {
  generateId,
  formatPhoneNumber,
  isValidBrazilianPhone,
  sanitizeText,
  truncateText,
  extractMentions,
  extractHashtags,
  detectLanguage,
  calculateSimilarity,
  generateMD5,
  generateSHA256,
  encrypt,
  decrypt,
  formatDuration,
  formatBytes,
  isValidUrl,
  extractDomain,
  generateSlug,
  sleep,
  retryWithBackoff
};

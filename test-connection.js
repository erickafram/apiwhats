const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');

async function testConnection() {
  try {
    console.log('🧪 Teste de Conexão Simplificado...\n');
    
    console.log('📋 Configuração:');
    console.log('   🔧 Baileys: 6.4.1');
    console.log('   🌐 Browser: Chrome simples');
    console.log('   📱 Configuração mínima');
    
    const { state, saveCreds } = await useMultiFileAuthState('./test_session');
    
    console.log('\n🔄 Criando socket...');
    const socket = makeWASocket({
      auth: state,
      browser: ['Chrome', 'Chrome', '110.0.0.0'],
      printQRInTerminal: true
    });
    
    socket.ev.on('creds.update', saveCreds);
    
    socket.ev.on('connection.update', async (update) => {
      console.log('\n=== CONNECTION UPDATE ===');
      console.log(JSON.stringify(update, null, 2));
      
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('\n📱 QR Code received!');
        console.log('🎯 Escaneie com seu WhatsApp agora!');
        
        try {
          const qrCodeDataURL = await QRCode.toDataURL(qr, {
            width: 256,
            margin: 2
          });
          console.log('✅ QR Code gerado com sucesso');
          console.log('📏 Tamanho:', qrCodeDataURL.length, 'caracteres');
        } catch (qrError) {
          console.log('❌ Erro ao gerar QR Code:', qrError.message);
        }
      }
      
      if (connection === 'close') {
        console.log('\n🔴 Connection closed');
        if (lastDisconnect?.error) {
          console.log('❌ Error:', lastDisconnect.error.message);
          console.log('📋 Error code:', lastDisconnect.error.output?.statusCode);
          
          // Analisar códigos de erro específicos
          const statusCode = lastDisconnect.error.output?.statusCode;
          if (statusCode === 401) {
            console.log('🚨 ERRO 401: Número bloqueado ou sessão inválida');
            console.log('💡 Soluções:');
            console.log('   1. Use WhatsApp Business');
            console.log('   2. Aguarde 24h');
            console.log('   3. Use número diferente');
          } else if (statusCode === 403) {
            console.log('🚨 ERRO 403: Acesso negado');
            console.log('💡 Número pode estar banido');
          } else if (statusCode === 428) {
            console.log('🚨 ERRO 428: Precondition Required');
            console.log('💡 WhatsApp detectou comportamento suspeito');
          }
        }
        
        // Não reconectar automaticamente
        console.log('⚠️ Não reconectando automaticamente');
        process.exit(1);
      }
      
      if (connection === 'open') {
        console.log('\n🎉 Connected successfully!');
        console.log('👤 User:', socket.user);
        console.log('📱 Phone:', socket.user?.id?.split(':')[0]);
        
        console.log('\n✅ SUCESSO TOTAL!');
        console.log('🎯 Seu número está conectado!');
        console.log('📋 Agora você pode usar o sistema completo');
        
        // Aguardar um pouco e desconectar
        setTimeout(() => {
          console.log('\n🔌 Desconectando teste...');
          socket.logout();
          process.exit(0);
        }, 10000);
      }
      
      if (connection === 'connecting') {
        console.log('\n🔄 Connecting...');
      }
    });
    
    socket.ev.on('messages.upsert', (m) => {
      console.log('\n📨 Message received:', m.messages[0]?.key?.remoteJid);
    });
    
    console.log('\n⏳ Aguardando conexão...');
    console.log('📱 Se aparecer QR Code no terminal, escaneie com seu WhatsApp');
    console.log('🌐 Ou acesse a interface web se preferir');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error);
    console.error('Stack:', error.stack);
  }
}

// Executar teste
testConnection().catch(console.error);

// Timeout de segurança
setTimeout(() => {
  console.log('\n⏰ Timeout do teste (2 minutos)');
  process.exit(1);
}, 120000);

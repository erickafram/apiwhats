const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whatsapp_chatbot',
  charset: 'utf8mb4'
};

async function atualizarFluxoTeste() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao banco...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Buscando fluxo ID 5...');
    const [flows] = await connection.execute('SELECT * FROM flows WHERE id = 5');
    
    if (flows.length === 0) {
      console.log('❌ Fluxo ID 5 não encontrado!');
      return;
    }
    
    const flow = flows[0];
    console.log(`📋 Fluxo encontrado: ${flow.name}`);
    
    // Parse do flow_data
    let flowData;
    try {
      if (typeof flow.flow_data === 'string') {
        flowData = JSON.parse(flow.flow_data);
      } else {
        flowData = flow.flow_data;
      }
    } catch (parseError) {
      console.log('❌ Erro ao parsear flow_data:', parseError.message);
      return;
    }
    
    // Helper para aplicar conteúdo com segurança
    const applyContent = (nodeId, content) => {
      const node = flowData.nodes.find(n => n.id === nodeId);
      if (!node) {
        console.log(`⚠️ Nó ${nodeId} não encontrado`);
        return false;
      }
      node.content = content;
      if (node.data) node.data.content = content;
      console.log(`✅ Atualizado nó ${nodeId}`);
      return true;
    };

    // 1) Menu principal (welcome)
    const welcomeContent = `🚌 *VIAÇÃO EXPRESSA*\n\nO que você deseja?\n\n1️⃣ 🎫 Comprar Passagem\n2️⃣ 🕐 Consultar Horários\n3️⃣ ☎️ Falar com Operador\n\n*Digite o número da opção:*`;
    applyContent('welcome', welcomeContent);

    // 2) Compra de destino (comprar_destino) - já ajustado anteriormente
    const comprarDestinoContent = `🗺️ *COMPRA DE PASSAGEM*\n\n📍 *Origem fixa:* Palmas (TO)\n📍 *Digite o destino desejado:*\n\n💡 Exemplos:\n• Goiânia\n• Brasília\n• Anápolis\n• Aparecida de Goiânia\n\n✍️ *Digite o nome da cidade:*`;
    applyContent('comprar_destino', comprarDestinoContent);

    // 3) Mostrar horários (mostrar_horarios_compra)
    const horariosContent = `🕐 *HORÁRIOS DISPONÍVEIS*\n\n🚌 Rota: Palmas ➜ #\${cidade_destino}\n\n1️⃣ EXECUTIVO - 06:00 (R$ 85)\n2️⃣ CONVENCIONAL - 09:00 (R$ 65)\n3️⃣ EXECUTIVO - 14:00 (R$ 85)\n4️⃣ LEITO - 22:00 (R$ 120)\n\n*Digite o número do horário desejado:*`;
    applyContent('mostrar_horarios_compra', horariosContent);

    // 4) Confirmação (confirmar_compra)
    const confirmarContent = `✅ *Confirma a reserva?*\n\nRota: Palmas ➜ #\${cidade_destino}\nHorário: #\${horario_escolhido}\n\n*Responda:*\n• SIM para confirmar\n• NÃO para cancelar\n• MENU para voltar`;
    applyContent('confirmar_compra', confirmarContent);

    // Salvar no banco
    await connection.execute(
      'UPDATE flows SET flow_data = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(flowData), 5]
    );
    
    console.log('✅ Fluxo atualizado com sucesso!');
    console.log('\n💡 Teste: "oi" -> 1 -> digite destino -> verifique linhas e variáveis.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

console.log('🚀 ATUALIZANDO NÓS COM QUEBRAS DE LINHA (welcome, horários, confirmação)');
console.log('=====================================================================');
atualizarFluxoTeste().catch(console.error); 
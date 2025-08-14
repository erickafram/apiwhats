-- 🔧 SCRIPT PARA CORRIGIR ERRO DO BANCO DE DADOS
-- Erro: Unknown column 'Conversation.custom_status_id' in 'on clause'
-- Execute este SQL no seu banco de dados

-- 1. Criar tabela conversation_statuses se não existir
CREATE TABLE IF NOT EXISTS conversation_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Inserir status padrão se a tabela estiver vazia
INSERT IGNORE INTO conversation_statuses (id, name, description, color) VALUES
(1, 'Em Andamento', 'Conversa em andamento', '#007bff'),
(2, 'Aguardando', 'Aguardando resposta', '#ffc107'), 
(3, 'Resolvido', 'Conversa resolvida', '#28a745'),
(4, 'Cancelado', 'Conversa cancelada', '#dc3545');

-- 3. Adicionar a coluna custom_status_id na tabela conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS custom_status_id INT NULL,
ADD CONSTRAINT fk_conversations_custom_status 
    FOREIGN KEY (custom_status_id) 
    REFERENCES conversation_statuses(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- 4. Verificar outras colunas necessárias
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS assigned_operator_id INT NULL,
ADD COLUMN IF NOT EXISTS current_flow_id INT NULL;

-- 5. Atualizar coluna status se necessário
ALTER TABLE conversations 
MODIFY COLUMN status ENUM('pending', 'active', 'transferred', 'completed', 'archived') DEFAULT 'pending';

-- ✅ Correção completa! 
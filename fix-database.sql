-- Script para corrigir o banco de dados
-- Execute este script no phpMyAdmin ou outro cliente MySQL

USE whatsapp_chatbot;

-- Adicionar coluna template_id na tabela flows se não existir
ALTER TABLE flows ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) NULL AFTER statistics;

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS flows_template_id_index ON flows(template_id);

-- Verificar se a coluna foi criada
DESCRIBE flows;

-- Mostrar estrutura das tabelas principais
SHOW TABLES;

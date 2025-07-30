-- Corrigir tabela de fluxos
-- Adicionar coluna template_id se não existir

-- Verificar se a coluna existe
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'flows' 
AND column_name = 'template_id';

-- Adicionar coluna se não existir
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE flows ADD COLUMN template_id VARCHAR(50) NULL AFTER statistics',
    'SELECT "Coluna template_id já existe" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar estrutura da tabela
DESCRIBE flows;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 29/07/2025 às 03:38
-- Versão do servidor: 9.1.0
-- Versão do PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `whatsapp_chatbot`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `analytics`
--

DROP TABLE IF EXISTS `analytics`;
CREATE TABLE IF NOT EXISTS `analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bot_id` int NOT NULL,
  `metric_type` enum('message_received','message_sent','conversation_started','conversation_completed','conversation_abandoned','flow_executed','node_executed','ai_request','webhook_called','error_occurred','user_engagement','response_time','conversion') COLLATE utf8mb4_general_ci NOT NULL,
  `metric_value` decimal(10,2) NOT NULL DEFAULT '1.00',
  `metadata` json DEFAULT NULL,
  `conversation_id` int DEFAULT NULL,
  `flow_id` int DEFAULT NULL,
  `node_id` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `recorded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `analytics_bot_id_metric_type_recorded_at` (`bot_id`,`metric_type`,`recorded_at`),
  KEY `analytics_bot_id_recorded_at` (`bot_id`,`recorded_at`),
  KEY `analytics_conversation_id` (`conversation_id`),
  KEY `analytics_flow_id` (`flow_id`),
  KEY `analytics_user_phone_recorded_at` (`user_phone`,`recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bots`
--

DROP TABLE IF EXISTS `bots`;
CREATE TABLE IF NOT EXISTS `bots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `phone_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `session_data` text COLLATE utf8mb4_general_ci,
  `ai_config` json DEFAULT NULL,
  `webhook_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `is_connected` tinyint(1) DEFAULT '0',
  `qr_code` text COLLATE utf8mb4_general_ci,
  `connection_status` enum('disconnected','connecting','connected','error') COLLATE utf8mb4_general_ci DEFAULT 'disconnected',
  `last_seen` datetime DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone_number` (`phone_number`),
  KEY `bots_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `bots`
--

INSERT INTO `bots` (`id`, `user_id`, `name`, `description`, `phone_number`, `session_data`, `ai_config`, `webhook_url`, `is_active`, `is_connected`, `qr_code`, `connection_status`, `last_seen`, `settings`, `created_at`, `updated_at`) VALUES
(1, 2, 'Bot de Atendimento Demo', 'Bot demonstrativo para atendimento ao cliente', NULL, NULL, '{\"model\": \"meta-llama/Llama-3.3-70B-Instruct-Turbo\", \"enabled\": true, \"max_tokens\": 1000, \"temperature\": 0.7, \"system_prompt\": \"Você é um assistente virtual de atendimento ao cliente. Seja sempre educado, prestativo e profissional. Responda em português brasileiro.\"}', NULL, 1, 0, NULL, 'disconnected', NULL, '{\"auto_reply\": true, \"typing_delay\": 1500, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-29 00:36:08', '2025-07-29 00:36:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `conversations`
--

DROP TABLE IF EXISTS `conversations`;
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bot_id` int NOT NULL,
  `user_phone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `user_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_profile_pic` text COLLATE utf8mb4_general_ci,
  `current_flow_id` int DEFAULT NULL,
  `current_node` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `session_data` json DEFAULT NULL,
  `status` enum('active','waiting','completed','abandoned','transferred') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `priority` int DEFAULT '0',
  `tags` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `started_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversations_bot_id_user_phone` (`bot_id`,`user_phone`),
  KEY `current_flow_id` (`current_flow_id`),
  KEY `conversations_bot_id_status` (`bot_id`,`status`),
  KEY `conversations_last_activity_at` (`last_activity_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `flows`
--

DROP TABLE IF EXISTS `flows`;
CREATE TABLE IF NOT EXISTS `flows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bot_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `flow_data` json DEFAULT NULL,
  `version` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '1.0.0',
  `is_active` tinyint(1) DEFAULT '0',
  `is_default` tinyint(1) DEFAULT '0',
  `trigger_keywords` json DEFAULT NULL,
  `trigger_conditions` json DEFAULT NULL,
  `priority` int DEFAULT '0',
  `statistics` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `flows_bot_id_is_active` (`bot_id`,`is_active`),
  KEY `flows_bot_id_is_default` (`bot_id`,`is_default`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `flows`
--

INSERT INTO `flows` (`id`, `bot_id`, `name`, `description`, `flow_data`, `version`, `is_active`, `is_default`, `trigger_keywords`, `trigger_conditions`, `priority`, `statistics`, `created_at`, `updated_at`) VALUES
(1, 1, 'Fluxo de Atendimento Principal', 'Fluxo principal para atendimento ao cliente com opções de produtos, suporte e transferência humana', '{\"edges\": [{\"id\": \"e1\", \"source\": \"start_1\", \"target\": \"condition_1\"}, {\"id\": \"e2\", \"source\": \"condition_1\", \"target\": \"products_info\", \"sourceHandle\": \"true\"}, {\"id\": \"e3\", \"source\": \"condition_1\", \"target\": \"support_check\", \"sourceHandle\": \"false\"}, {\"id\": \"e4\", \"source\": \"support_check\", \"target\": \"technical_support\", \"sourceHandle\": \"true\"}, {\"id\": \"e5\", \"source\": \"support_check\", \"target\": \"human_check\", \"sourceHandle\": \"false\"}, {\"id\": \"e6\", \"source\": \"human_check\", \"target\": \"transfer_human\", \"sourceHandle\": \"true\"}, {\"id\": \"e7\", \"source\": \"human_check\", \"target\": \"ai_general\", \"sourceHandle\": \"false\"}], \"nodes\": [{\"id\": \"start_1\", \"data\": {\"message\": \"👋 Olá! Bem-vindo ao nosso atendimento!\\n\\nComo posso ajudá-lo hoje?\\n\\n1️⃣ Informações sobre produtos\\n2️⃣ Suporte técnico\\n3️⃣ Falar com atendente\\n4️⃣ Outras dúvidas\"}, \"type\": \"start\", \"position\": {\"x\": 100, \"y\": 100}}, {\"id\": \"condition_1\", \"data\": {\"operator\": \"OR\", \"conditions\": [{\"field\": \"message_content\", \"value\": \"1\", \"operator\": \"contains\"}]}, \"type\": \"condition\", \"position\": {\"x\": 100, \"y\": 250}}, {\"id\": \"products_info\", \"data\": {\"delay\": 1000, \"message\": \"📦 Informações sobre Produtos\\n\\nTemos uma ampla gama de produtos disponíveis:\\n\\n• Categoria A\\n• Categoria B\\n• Categoria C\\n\\nGostaria de saber mais sobre alguma categoria específica?\"}, \"type\": \"fixed_response\", \"position\": {\"x\": 300, \"y\": 200}}, {\"id\": \"support_check\", \"data\": {\"operator\": \"OR\", \"conditions\": [{\"field\": \"message_content\", \"value\": \"2\", \"operator\": \"contains\"}]}, \"type\": \"condition\", \"position\": {\"x\": 100, \"y\": 400}}, {\"id\": \"technical_support\", \"data\": {\"max_tokens\": 500, \"temperature\": 0.5, \"system_prompt\": \"Você é um especialista em suporte técnico. Ajude o usuário com problemas técnicos de forma clara e didática.\"}, \"type\": \"ai_response\", \"position\": {\"x\": 300, \"y\": 350}}, {\"id\": \"human_check\", \"data\": {\"operator\": \"OR\", \"conditions\": [{\"field\": \"message_content\", \"value\": \"3\", \"operator\": \"contains\"}]}, \"type\": \"condition\", \"position\": {\"x\": 100, \"y\": 550}}, {\"id\": \"transfer_human\", \"data\": {\"message\": \"👨‍💼 Transferindo você para um de nossos atendentes...\\n\\nEm breve alguém entrará em contato!\", \"department\": \"support\"}, \"type\": \"transfer_human\", \"position\": {\"x\": 300, \"y\": 500}}, {\"id\": \"ai_general\", \"data\": {\"max_tokens\": 800, \"temperature\": 0.7, \"system_prompt\": \"Você é um assistente de atendimento ao cliente. Responda de forma útil e educada sobre dúvidas gerais.\"}, \"type\": \"ai_response\", \"position\": {\"x\": 100, \"y\": 700}}], \"viewport\": {\"x\": 0, \"y\": 0, \"zoom\": 1}}', '1.0.0', 1, 1, '[\"oi\", \"olá\", \"hello\", \"help\", \"ajuda\", \"início\"]', '{\"type\": \"any\", \"intents\": [], \"keywords\": [\"oi\", \"olá\", \"hello\", \"help\", \"ajuda\"], \"time_conditions\": null, \"custom_conditions\": null}', 1, '{\"last_execution\": null, \"total_executions\": 0, \"successful_completions\": 0, \"average_completion_time\": 0}', '2025-07-29 00:36:08', '2025-07-29 00:36:08'),
(2, 1, 'FAQ - Perguntas Frequentes', 'Fluxo para responder perguntas frequentes dos clientes', '{\"edges\": [{\"id\": \"e1\", \"source\": \"start_faq\", \"target\": \"faq_condition\"}, {\"id\": \"e2\", \"source\": \"faq_condition\", \"target\": \"hours_info\"}, {\"id\": \"e3\", \"source\": \"hours_info\", \"target\": \"end_faq\"}], \"nodes\": [{\"id\": \"start_faq\", \"data\": {\"message\": \"❓ FAQ - Perguntas Frequentes\\n\\nEscolha uma categoria:\\n\\n1️⃣ Horário de funcionamento\\n2️⃣ Formas de pagamento\\n3️⃣ Política de devolução\\n4️⃣ Entrega e frete\"}, \"type\": \"start\", \"position\": {\"x\": 100, \"y\": 100}}, {\"id\": \"faq_condition\", \"data\": {\"conditions\": [{\"field\": \"message_content\", \"value\": \"1\", \"operator\": \"contains\"}]}, \"type\": \"condition\", \"position\": {\"x\": 100, \"y\": 250}}, {\"id\": \"hours_info\", \"data\": {\"message\": \"🕒 Horário de Funcionamento\\n\\nSegunda a Sexta: 9h às 18h\\nSábado: 9h às 12h\\nDomingo: Fechado\\n\\nAtendimento online 24h via chatbot!\"}, \"type\": \"fixed_response\", \"position\": {\"x\": 300, \"y\": 200}}, {\"id\": \"end_faq\", \"data\": {\"message\": \"Espero ter ajudado! 😊\\n\\nSe tiver outras dúvidas, digite \\\"menu\\\" para voltar ao início.\"}, \"type\": \"end\", \"position\": {\"x\": 500, \"y\": 300}}], \"viewport\": {\"x\": 0, \"y\": 0, \"zoom\": 1}}', '1.0.0', 1, 0, '[\"faq\", \"dúvidas\", \"perguntas\", \"frequentes\", \"horário\", \"funcionamento\"]', '{\"type\": \"keyword\", \"intents\": [], \"keywords\": [\"faq\", \"dúvidas\", \"perguntas\"], \"time_conditions\": null, \"custom_conditions\": null}', 2, '{\"last_execution\": null, \"total_executions\": 0, \"successful_completions\": 0, \"average_completion_time\": 0}', '2025-07-29 00:36:08', '2025-07-29 00:36:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `flow_nodes`
--

DROP TABLE IF EXISTS `flow_nodes`;
CREATE TABLE IF NOT EXISTS `flow_nodes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `flow_id` int NOT NULL,
  `node_id` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `node_type` enum('start','ai_response','fixed_response','condition','input_capture','action','end','delay','webhook','transfer_human') COLLATE utf8mb4_general_ci NOT NULL,
  `node_config` json DEFAULT NULL,
  `position_x` float DEFAULT '0',
  `position_y` float DEFAULT '0',
  `width` int DEFAULT '200',
  `height` int DEFAULT '100',
  `style` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `flow_nodes_flow_id_node_id` (`flow_id`,`node_id`),
  KEY `flow_nodes_flow_id_node_type` (`flow_id`,`node_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `whatsapp_message_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direction` enum('in','out') COLLATE utf8mb4_general_ci NOT NULL,
  `content` text COLLATE utf8mb4_general_ci,
  `media_type` enum('text','image','audio','video','document','sticker','location','contact') COLLATE utf8mb4_general_ci DEFAULT 'text',
  `media_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `media_filename` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `media_size` int DEFAULT NULL,
  `media_mimetype` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quoted_message_id` int DEFAULT NULL,
  `status` enum('pending','sent','delivered','read','failed') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `error_message` text COLLATE utf8mb4_general_ci,
  `processed` tinyint(1) DEFAULT '0',
  `processing_time` int DEFAULT NULL,
  `node_id` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `whatsapp_message_id` (`whatsapp_message_id`),
  KEY `quoted_message_id` (`quoted_message_id`),
  KEY `messages_conversation_id_timestamp` (`conversation_id`,`timestamp`),
  KEY `messages_whatsapp_message_id` (`whatsapp_message_id`),
  KEY `messages_direction_processed` (`direction`,`processed`),
  KEY `messages_media_type` (`media_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
CREATE TABLE IF NOT EXISTS `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('1753757135025-create-initial-tables.js');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@whatsapp-bot.com', '$2a$12$8ysPAx893DAyP7w.nkn6Ie5ZCCKwbN37FL0JIUCQfA.jlLo4BP3Ea', 'admin', 1, '2025-07-29 00:37:06', '2025-07-29 00:36:08', '2025-07-29 00:37:06'),
(2, 'Usuário Demo', 'demo@whatsapp-bot.com', '$2a$12$xg5hY0gIndkjnyVb894FZ.qfadjWZaHnWHjGPwkzdHpX7R4kTqYOK', 'user', 1, NULL, '2025-07-29 00:36:08', '2025-07-29 00:36:08');

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `analytics`
--
ALTER TABLE `analytics`
  ADD CONSTRAINT `analytics_ibfk_1` FOREIGN KEY (`bot_id`) REFERENCES `bots` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `analytics_ibfk_2` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `analytics_ibfk_3` FOREIGN KEY (`flow_id`) REFERENCES `flows` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `bots`
--
ALTER TABLE `bots`
  ADD CONSTRAINT `bots_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`bot_id`) REFERENCES `bots` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`current_flow_id`) REFERENCES `flows` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `flows`
--
ALTER TABLE `flows`
  ADD CONSTRAINT `flows_ibfk_1` FOREIGN KEY (`bot_id`) REFERENCES `bots` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `flow_nodes`
--
ALTER TABLE `flow_nodes`
  ADD CONSTRAINT `flow_nodes_ibfk_1` FOREIGN KEY (`flow_id`) REFERENCES `flows` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`quoted_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

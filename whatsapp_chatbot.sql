-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 29/07/2025 às 03:21
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
(1, 1, 'Bot de Teste', 'Bot criado durante teste automatizado', NULL, NULL, '{\"enabled\": true, \"max_tokens\": 500, \"temperature\": 0.7, \"system_prompt\": \"Você é um bot de teste.\"}', NULL, 0, 0, NULL, 'disconnected', NULL, '{\"auto_reply\": true, \"typing_delay\": 1000, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-28 23:47:32', '2025-07-28 23:47:32'),
(2, 2, 'Bot de Teste', 'Bot criado durante teste automatizado', NULL, NULL, '{\"enabled\": true, \"max_tokens\": 500, \"temperature\": 0.7, \"system_prompt\": \"Você é um bot de teste.\"}', NULL, 0, 0, NULL, 'disconnected', NULL, '{\"auto_reply\": true, \"typing_delay\": 1000, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-28 23:50:29', '2025-07-28 23:50:29'),
(3, 3, 'Bot de Teste', 'Bot criado durante teste automatizado', NULL, NULL, '{\"enabled\": true, \"max_tokens\": 500, \"temperature\": 0.7, \"system_prompt\": \"Você é um bot de teste.\"}', NULL, 0, 0, NULL, 'disconnected', NULL, '{\"auto_reply\": true, \"typing_delay\": 1000, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-28 23:51:34', '2025-07-28 23:51:34'),
(4, 4, 'Bot de Teste', 'Bot criado durante teste automatizado', NULL, NULL, '{\"enabled\": true, \"max_tokens\": 500, \"temperature\": 0.7, \"system_prompt\": \"Você é um bot de teste.\"}', NULL, 0, 0, NULL, 'disconnected', NULL, '{\"auto_reply\": true, \"typing_delay\": 1000, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-28 23:52:02', '2025-07-28 23:52:02'),
(5, 5, 'Bot de Teste', 'Bot criado durante teste automatizado', NULL, NULL, '{\"enabled\": true, \"max_tokens\": 500, \"temperature\": 0.7, \"system_prompt\": \"Você é um bot de teste.\"}', NULL, 0, 0, NULL, 'disconnected', NULL, '{\"auto_reply\": true, \"typing_delay\": 1000, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-28 23:52:58', '2025-07-28 23:52:58'),
(6, 6, 'Bot de Teste', 'Bot criado durante teste automatizado', NULL, NULL, '{\"enabled\": true, \"max_tokens\": 500, \"temperature\": 0.7, \"system_prompt\": \"Você é um bot de teste.\"}', NULL, 0, 0, NULL, 'disconnected', NULL, '{\"auto_reply\": true, \"typing_delay\": 1000, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-28 23:53:45', '2025-07-28 23:53:45'),
(7, 7, 'Bot de Teste', 'Bot criado durante teste automatizado', NULL, NULL, '{\"enabled\": true, \"max_tokens\": 500, \"temperature\": 0.7, \"system_prompt\": \"Você é um bot de teste.\"}', NULL, 0, 0, NULL, 'disconnected', NULL, '{\"auto_reply\": true, \"typing_delay\": 1000, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-28 23:54:56', '2025-07-28 23:54:56'),
(8, 8, 'Bot de Teste', 'Bot criado durante teste automatizado', NULL, NULL, '{\"enabled\": true, \"max_tokens\": 500, \"temperature\": 0.7, \"system_prompt\": \"Você é um bot de teste.\"}', NULL, 0, 0, NULL, 'disconnected', NULL, '{\"auto_reply\": true, \"typing_delay\": 1000, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-28 23:56:34', '2025-07-28 23:56:34'),
(9, 9, 'Flow Test Bot', 'Bot para testar fluxos', NULL, NULL, '{\"model\": \"meta-llama/Llama-3.3-70B-Instruct-Turbo\", \"enabled\": true, \"max_tokens\": 1000, \"temperature\": 0.7, \"system_prompt\": \"Você é um assistente virtual útil e amigável.\"}', NULL, 0, 0, NULL, 'disconnected', NULL, '{\"auto_reply\": true, \"typing_delay\": 1000, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-29 00:01:11', '2025-07-29 00:01:11');

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
(1, 6, 'Fluxo de Teste', 'Fluxo criado durante teste automatizado', '{\"edges\": [{\"id\": \"e1\", \"source\": \"start_1\", \"target\": \"end_1\"}], \"nodes\": [{\"id\": \"start_1\", \"data\": {\"message\": \"Olá! Este é um teste.\"}, \"type\": \"start\", \"position\": {\"x\": 100, \"y\": 100}}, {\"id\": \"end_1\", \"data\": {\"message\": \"Teste finalizado!\"}, \"type\": \"end\", \"position\": {\"x\": 300, \"y\": 100}}], \"viewport\": {\"x\": 0, \"y\": 0, \"zoom\": 1}}', '1.0.0', 1, 1, '[\"teste\", \"test\"]', '{\"type\": \"any\", \"intents\": [], \"keywords\": [], \"time_conditions\": null, \"custom_conditions\": null}', 0, '{\"last_execution\": null, \"total_executions\": 0, \"successful_completions\": 0, \"average_completion_time\": 0}', '2025-07-28 23:53:45', '2025-07-28 23:53:45'),
(2, 7, 'Fluxo de Teste', 'Fluxo criado durante teste automatizado', '{\"edges\": [{\"id\": \"e1\", \"source\": \"start_1\", \"target\": \"end_1\"}], \"nodes\": [{\"id\": \"start_1\", \"data\": {\"message\": \"Olá! Este é um teste.\"}, \"type\": \"start\", \"position\": {\"x\": 100, \"y\": 100}}, {\"id\": \"end_1\", \"data\": {\"message\": \"Teste finalizado!\"}, \"type\": \"end\", \"position\": {\"x\": 300, \"y\": 100}}], \"viewport\": {\"x\": 0, \"y\": 0, \"zoom\": 1}}', '1.0.0', 1, 1, '[\"teste\", \"test\"]', '{\"type\": \"any\", \"intents\": [], \"keywords\": [], \"time_conditions\": null, \"custom_conditions\": null}', 0, '{\"last_execution\": null, \"total_executions\": 0, \"successful_completions\": 0, \"average_completion_time\": 0}', '2025-07-28 23:54:56', '2025-07-28 23:54:56'),
(3, 8, 'Fluxo de Teste', 'Fluxo criado durante teste automatizado', '{\"edges\": [{\"id\": \"e1\", \"source\": \"start_1\", \"target\": \"end_1\"}], \"nodes\": [{\"id\": \"start_1\", \"data\": {\"message\": \"Olá! Este é um teste.\"}, \"type\": \"start\", \"position\": {\"x\": 100, \"y\": 100}}, {\"id\": \"end_1\", \"data\": {\"message\": \"Teste finalizado!\"}, \"type\": \"end\", \"position\": {\"x\": 300, \"y\": 100}}], \"viewport\": {\"x\": 0, \"y\": 0, \"zoom\": 1}}', '1.0.0', 1, 1, '[\"teste\", \"test\"]', '{\"type\": \"any\", \"intents\": [], \"keywords\": [], \"time_conditions\": null, \"custom_conditions\": null}', 0, '{\"last_execution\": null, \"total_executions\": 0, \"successful_completions\": 0, \"average_completion_time\": 0}', '2025-07-28 23:56:34', '2025-07-28 23:56:34'),
(4, 9, 'Fluxo de Teste', 'Fluxo atualizado durante teste', '{\"edges\": [], \"nodes\": [{\"id\": \"start_1\", \"data\": {\"message\": \"Olá! Este é um teste.\"}, \"type\": \"start\", \"position\": {\"x\": 100, \"y\": 100}}], \"viewport\": {\"x\": 0, \"y\": 0, \"zoom\": 1}}', '1.0.0', 1, 1, '[\"teste\"]', '{\"type\": \"any\", \"intents\": [], \"keywords\": [], \"time_conditions\": null, \"custom_conditions\": null}', 0, '{\"last_execution\": null, \"total_executions\": 0, \"successful_completions\": 0, \"average_completion_time\": 0}', '2025-07-29 00:01:11', '2025-07-29 00:01:11');

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
(1, 'Usuário Teste', 'teste_1753757252126@example.com', '$2a$12$tn0jcUvuioMehXJehzOReuz6h.Q4po0bi6dGv9sivOPbWQBkNsbE.', 'user', 1, '2025-07-28 23:47:32', '2025-07-28 23:47:32', '2025-07-28 23:47:32'),
(2, 'Usuário Teste', 'teste_1753757428536@example.com', '$2a$12$SATBNS6rQP4USM5qON0WueWKrigaDTXixAHy3ICB6mnlWc6JbM172', 'user', 1, '2025-07-28 23:50:29', '2025-07-28 23:50:28', '2025-07-28 23:50:29'),
(3, 'Usuário Teste', 'teste_1753757493689@example.com', '$2a$12$iT1bBXHXvFfG3UQ.XCE0ce81cfWTuCf1diwk9/aygrJ00pXYBlTnq', 'user', 1, '2025-07-28 23:51:34', '2025-07-28 23:51:33', '2025-07-28 23:51:34'),
(4, 'Usuário Teste', 'teste_1753757521647@example.com', '$2a$12$K2Dug10CEsnBHp.arKCCV.jvtOxQh8kE5Fv7JpO3aOY2hcana2iHy', 'user', 1, '2025-07-28 23:52:02', '2025-07-28 23:52:01', '2025-07-28 23:52:02'),
(5, 'Usuário Teste', 'teste_1753757578103@example.com', '$2a$12$1PoCUTohgZ0n63Vb2P6KueiaotNw4IxDfaBqPe8u..GnrOiGDgHTu', 'user', 1, '2025-07-28 23:52:58', '2025-07-28 23:52:58', '2025-07-28 23:52:58'),
(6, 'Usuário Teste', 'teste_1753757624554@example.com', '$2a$12$OrPg0BPxS7rVJpDtzY6dPOxqForNApIskvJFuX2ay6veGpyPYnKWG', 'user', 1, '2025-07-28 23:53:45', '2025-07-28 23:53:44', '2025-07-28 23:53:45'),
(7, 'Usuário Teste', 'teste_1753757695604@example.com', '$2a$12$cHEq9W5RZfiHnL7WvdeBIeNMU4KmYrcxemlyGDnCQe/OUvX6YjZBu', 'user', 1, '2025-07-28 23:54:56', '2025-07-28 23:54:55', '2025-07-28 23:54:56'),
(8, 'Usuário Teste', 'teste_1753757793821@example.com', '$2a$12$HbyLVEWFLjPqShDB5ZIVg.sglrgbpqjCWPCdmRgDBfc9fVZPI2gd.', 'user', 1, '2025-07-28 23:56:34', '2025-07-28 23:56:33', '2025-07-28 23:56:34'),
(9, 'Flow Test User', 'flow_test_1753758071330@test.com', '$2a$12$OrGsGv.yVuts2ECYqVyNIektoSCkuDorB19WNyhmuJp1dwYssQfGC', 'user', 1, NULL, '2025-07-29 00:01:11', '2025-07-29 00:01:11');

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

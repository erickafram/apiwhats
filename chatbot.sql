-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 11/08/2025 às 14:16
-- Versão do servidor: 8.0.36-28
-- Versão do PHP: 8.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `chatbot`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `analytics`
--

CREATE TABLE `analytics` (
  `id` int NOT NULL,
  `bot_id` int NOT NULL,
  `metric_type` enum('message_received','message_sent','conversation_started','conversation_completed','conversation_abandoned','flow_executed','node_executed','ai_request','webhook_called','error_occurred','user_engagement','response_time','conversion') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `metric_value` decimal(10,2) NOT NULL DEFAULT '1.00',
  `metadata` json DEFAULT NULL,
  `conversation_id` int DEFAULT NULL,
  `flow_id` int DEFAULT NULL,
  `node_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `recorded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `analytics`
--

INSERT INTO `analytics` (`id`, `bot_id`, `metric_type`, `metric_value`, `metadata`, `conversation_id`, `flow_id`, `node_id`, `user_phone`, `recorded_at`, `created_at`) VALUES
(2, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056', '2025-08-08 15:09:09', '2025-08-08 15:09:09'),
(5, 1, 'error_occurred', 1.00, '{\"error\": \"Cannot add or update a child row: a foreign key constraint fails (`chatbot`.`analytics`, CONSTRAINT `analytics_ibfk_3` FOREIGN KEY (`flow_id`) REFERENCES `flows` (`id`) ON DELETE SET NULL ON UPDATE CASCADE)\", \"stack\": \"Error\\n    at Query.run (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/dialects/mysql/query.js:52:25)\\n    at /home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/sequelize.js:315:28\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async MySQLQueryInterface.insert (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/dialects/abstract/query-interface.js:308:21)\\n    at async model.save (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/model.js:2490:35)\\n    at async Analytics.create (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/model.js:1362:12)\\n    at async Analytics.recordMetric (/home/chatbotwhats/htdocs/chatbotwhats.online/src/models/Analytics.js:209:12)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:115:7)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:84:22)\"}', NULL, NULL, NULL, '556392410056', '2025-08-08 15:09:09', '2025-08-08 15:09:09'),
(6, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378', '2025-08-08 15:09:10', '2025-08-08 15:09:10'),
(9, 1, 'error_occurred', 1.00, '{\"error\": \"Cannot add or update a child row: a foreign key constraint fails (`chatbot`.`analytics`, CONSTRAINT `analytics_ibfk_3` FOREIGN KEY (`flow_id`) REFERENCES `flows` (`id`) ON DELETE SET NULL ON UPDATE CASCADE)\", \"stack\": \"Error\\n    at Query.run (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/dialects/mysql/query.js:52:25)\\n    at /home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/sequelize.js:315:28\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async MySQLQueryInterface.insert (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/dialects/abstract/query-interface.js:308:21)\\n    at async model.save (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/model.js:2490:35)\\n    at async Analytics.create (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/model.js:1362:12)\\n    at async Analytics.recordMetric (/home/chatbotwhats/htdocs/chatbotwhats.online/src/models/Analytics.js:209:12)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:115:7)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:84:22)\"}', NULL, NULL, NULL, '556392901378', '2025-08-08 15:09:10', '2025-08-08 15:09:10'),
(10, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056', '2025-08-08 15:09:18', '2025-08-08 15:09:18'),
(13, 1, 'error_occurred', 1.00, '{\"error\": \"Cannot add or update a child row: a foreign key constraint fails (`chatbot`.`analytics`, CONSTRAINT `analytics_ibfk_3` FOREIGN KEY (`flow_id`) REFERENCES `flows` (`id`) ON DELETE SET NULL ON UPDATE CASCADE)\", \"stack\": \"Error\\n    at Query.run (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/dialects/mysql/query.js:52:25)\\n    at /home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/sequelize.js:315:28\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async MySQLQueryInterface.insert (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/dialects/abstract/query-interface.js:308:21)\\n    at async model.save (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/model.js:2490:35)\\n    at async Analytics.create (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/model.js:1362:12)\\n    at async Analytics.recordMetric (/home/chatbotwhats/htdocs/chatbotwhats.online/src/models/Analytics.js:209:12)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:115:7)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:84:22)\"}', NULL, NULL, NULL, '556392410056', '2025-08-08 15:09:18', '2025-08-08 15:09:18'),
(14, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378', '2025-08-08 15:09:18', '2025-08-08 15:09:18'),
(17, 1, 'error_occurred', 1.00, '{\"error\": \"Cannot add or update a child row: a foreign key constraint fails (`chatbot`.`analytics`, CONSTRAINT `analytics_ibfk_3` FOREIGN KEY (`flow_id`) REFERENCES `flows` (`id`) ON DELETE SET NULL ON UPDATE CASCADE)\", \"stack\": \"Error\\n    at Query.run (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/dialects/mysql/query.js:52:25)\\n    at /home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/sequelize.js:315:28\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async MySQLQueryInterface.insert (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/dialects/abstract/query-interface.js:308:21)\\n    at async model.save (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/model.js:2490:35)\\n    at async Analytics.create (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/sequelize/lib/model.js:1362:12)\\n    at async Analytics.recordMetric (/home/chatbotwhats/htdocs/chatbotwhats.online/src/models/Analytics.js:209:12)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:115:7)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:84:22)\"}', NULL, NULL, NULL, '556392901378', '2025-08-08 15:09:18', '2025-08-08 15:09:18'),
(18, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056', '2025-08-08 15:18:08', '2025-08-08 15:18:08'),
(19, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056', '2025-08-08 15:18:08', '2025-08-08 15:18:08'),
(20, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', '556392410056', '2025-08-08 15:18:08', '2025-08-08 15:18:08'),
(21, 1, 'response_time', 725.00, '{}', NULL, 5, NULL, '556392410056', '2025-08-08 15:18:08', '2025-08-08 15:18:08'),
(22, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378', '2025-08-08 15:18:09', '2025-08-08 15:18:09'),
(23, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378', '2025-08-08 15:18:09', '2025-08-08 15:18:09'),
(24, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', '556392901378', '2025-08-08 15:18:09', '2025-08-08 15:18:09'),
(25, 1, 'response_time', 914.00, '{}', NULL, 5, NULL, '556392901378', '2025-08-08 15:18:10', '2025-08-08 15:18:10'),
(26, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056', '2025-08-08 15:18:32', '2025-08-08 15:18:32'),
(27, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056', '2025-08-08 15:18:32', '2025-08-08 15:18:32'),
(28, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'welcome', '556392410056', '2025-08-08 15:18:32', '2025-08-08 15:18:32'),
(29, 1, 'error_occurred', 1.00, '{\"error\": \"Request failed with status code 401\", \"stack\": \"AxiosError: Request failed with status code 401\\n    at settle (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/axios/dist/node/axios.cjs:2090:12)\\n    at IncomingMessage.handleStreamEnd (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/axios/dist/node/axios.cjs:3207:11)\\n    at IncomingMessage.emit (node:events:530:35)\\n    at endReadableNT (node:internal/streams/readable:1698:12)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:90:21)\\n    at Axios.request (/home/chatbotwhats/htdocs/chatbotwhats.online/node_modules/axios/dist/node/axios.cjs:4317:41)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async WhapiService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/WhapiService.js:294:24)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processFixedResponseNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:199:5)\\n    at async FlowProcessor.processMessageNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:237:12)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:84:22)\\n    at async WhapiService.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/WhapiService.js:502:11)\"}', NULL, NULL, NULL, '556392410056', '2025-08-08 15:18:33', '2025-08-08 15:18:33'),
(30, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:55:46', '2025-08-09 18:55:46'),
(31, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:55:47', '2025-08-09 18:55:47'),
(32, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:55:48', '2025-08-09 18:55:48'),
(33, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:55:48', '2025-08-09 18:55:48'),
(34, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:56:33', '2025-08-09 18:56:33'),
(35, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:56:34', '2025-08-09 18:56:34'),
(36, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:56:35', '2025-08-09 18:56:35'),
(37, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:56:35', '2025-08-09 18:56:35'),
(38, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:58:38', '2025-08-09 18:58:38'),
(39, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:58:40', '2025-08-09 18:58:40'),
(40, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:58:40', '2025-08-09 18:58:40'),
(41, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:58:41', '2025-08-09 18:58:41'),
(42, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:59:04', '2025-08-09 18:59:04'),
(43, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:59:05', '2025-08-09 18:59:05'),
(44, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:59:05', '2025-08-09 18:59:05'),
(45, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 18:59:05', '2025-08-09 18:59:05'),
(46, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:03:04', '2025-08-09 19:03:04'),
(47, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:03:05', '2025-08-09 19:03:05'),
(48, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:03:06', '2025-08-09 19:03:06'),
(49, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:03:06', '2025-08-09 19:03:06'),
(50, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:03:35', '2025-08-09 19:03:35'),
(51, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:03:36', '2025-08-09 19:03:36'),
(52, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:03:37', '2025-08-09 19:03:37'),
(53, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:03:37', '2025-08-09 19:03:37'),
(54, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:06:02', '2025-08-09 19:06:02'),
(55, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:06:02', '2025-08-09 19:06:02'),
(56, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:06:02', '2025-08-09 19:06:02'),
(57, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:06:02', '2025-08-09 19:06:02'),
(58, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:06:03', '2025-08-09 19:06:03'),
(59, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:06:03', '2025-08-09 19:06:03'),
(60, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:06:03', '2025-08-09 19:06:03'),
(61, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:06:03', '2025-08-09 19:06:03'),
(62, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:06:03', '2025-08-09 19:06:03'),
(63, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:06:03', '2025-08-09 19:06:03'),
(64, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at runNextTicks (node:internal/process/task_queues:65:5)\\n    at process.processTimers (node:internal/timers:520:9)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:06:04', '2025-08-09 19:06:04'),
(65, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:06:04', '2025-08-09 19:06:04'),
(66, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:06:04', '2025-08-09 19:06:04'),
(67, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:06:04', '2025-08-09 19:06:04'),
(68, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:06:04', '2025-08-09 19:06:04'),
(69, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:06:05', '2025-08-09 19:06:05'),
(70, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:07:06', '2025-08-09 19:07:06'),
(71, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:07:06', '2025-08-09 19:07:06'),
(72, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:07:06', '2025-08-09 19:07:06'),
(73, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:07:06', '2025-08-09 19:07:06'),
(74, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:07:08', '2025-08-09 19:07:08'),
(75, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:07:08', '2025-08-09 19:07:08'),
(76, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:07:08', '2025-08-09 19:07:08'),
(77, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:07:08', '2025-08-09 19:07:08'),
(78, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:07:08', '2025-08-09 19:07:08'),
(79, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:07:08', '2025-08-09 19:07:08'),
(80, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:07:08', '2025-08-09 19:07:08'),
(81, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:07:09', '2025-08-09 19:07:09'),
(82, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:07:09', '2025-08-09 19:07:09'),
(83, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:07:09', '2025-08-09 19:07:09'),
(84, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:07:09', '2025-08-09 19:07:09'),
(85, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:07:09', '2025-08-09 19:07:09'),
(86, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:10:39', '2025-08-09 19:10:39'),
(87, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:10:39', '2025-08-09 19:10:39'),
(88, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:10:39', '2025-08-09 19:10:39'),
(89, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:10:39', '2025-08-09 19:10:39'),
(90, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:10:40', '2025-08-09 19:10:40'),
(91, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:10:40', '2025-08-09 19:10:40'),
(92, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:10:40', '2025-08-09 19:10:40'),
(93, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:10:41', '2025-08-09 19:10:41'),
(94, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:10:41', '2025-08-09 19:10:41'),
(95, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:10:41', '2025-08-09 19:10:41'),
(96, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:10:41', '2025-08-09 19:10:41'),
(97, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:10:41', '2025-08-09 19:10:41'),
(98, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:10:41', '2025-08-09 19:10:41'),
(99, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:10:41', '2025-08-09 19:10:41'),
(100, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at runNextTicks (node:internal/process/task_queues:65:5)\\n    at process.processTimers (node:internal/timers:520:9)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:10:42', '2025-08-09 19:10:42'),
(101, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at runNextTicks (node:internal/process/task_queues:65:5)\\n    at process.processTimers (node:internal/timers:520:9)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:885:7)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:405:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:10:42', '2025-08-09 19:10:42'),
(102, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:14:25', '2025-08-09 19:14:25'),
(103, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:14:25', '2025-08-09 19:14:25'),
(104, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:14:25', '2025-08-09 19:14:25'),
(105, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:887:9)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:411:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:14:25', '2025-08-09 19:14:25'),
(106, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:14:26', '2025-08-09 19:14:26'),
(107, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:14:26', '2025-08-09 19:14:26'),
(108, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:14:26', '2025-08-09 19:14:26'),
(109, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:887:9)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:411:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:14:27', '2025-08-09 19:14:27'),
(110, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:14:27', '2025-08-09 19:14:27'),
(111, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:14:27', '2025-08-09 19:14:27'),
(112, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:14:27', '2025-08-09 19:14:27'),
(113, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:14:27', '2025-08-09 19:14:27'),
(114, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:14:27', '2025-08-09 19:14:27'),
(115, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:14:27', '2025-08-09 19:14:27'),
(116, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at runNextTicks (node:internal/process/task_queues:65:5)\\n    at process.processTimers (node:internal/timers:520:9)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:887:9)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:411:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:14:28', '2025-08-09 19:14:28'),
(117, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:887:9)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:411:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:14:28', '2025-08-09 19:14:28'),
(118, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:15:13', '2025-08-09 19:15:13'),
(119, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:15:13', '2025-08-09 19:15:13'),
(120, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:15:13', '2025-08-09 19:15:13'),
(121, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:887:9)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:411:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:15:13', '2025-08-09 19:15:13'),
(122, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:15:15', '2025-08-09 19:15:15'),
(123, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:15:15', '2025-08-09 19:15:15'),
(124, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:15:15', '2025-08-09 19:15:15'),
(125, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:887:9)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:411:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:15:15', '2025-08-09 19:15:15'),
(126, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:15:15', '2025-08-09 19:15:15'),
(127, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:15:15', '2025-08-09 19:15:15'),
(128, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:15:15', '2025-08-09 19:15:15'),
(129, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, NULL, '2025-08-09 19:15:15', '2025-08-09 19:15:15'),
(130, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, NULL, '2025-08-09 19:15:16', '2025-08-09 19:15:16'),
(131, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', NULL, '2025-08-09 19:15:16', '2025-08-09 19:15:16'),
(132, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at runNextTicks (node:internal/process/task_queues:65:5)\\n    at process.processTimers (node:internal/timers:520:9)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:887:9)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:411:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:15:16', '2025-08-09 19:15:16'),
(133, 1, 'error_occurred', 1.00, '{\"error\": \"Número de telefone inválido: undefined\", \"stack\": \"Error: Número de telefone inválido: undefined\\n    at UltraMsgService.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:276:15)\\n    at async FlowProcessor.sendMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:887:9)\\n    at async FlowProcessor.processStartNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:160:7)\\n    at async FlowProcessor.processNode (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:133:22)\\n    at async FlowProcessor.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/FlowProcessor.js:60:22)\\n    at async BotManager.processMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/BotManager.js:92:22)\\n    at async UltraMsgService.processIncomingMessage (/home/chatbotwhats/htdocs/chatbotwhats.online/src/services/UltraMsgService.js:411:9)\\n    at async /home/chatbotwhats/htdocs/chatbotwhats.online/src/routes/ultramsg.js:16:5\"}', NULL, NULL, NULL, NULL, '2025-08-09 19:15:16', '2025-08-09 19:15:16'),
(134, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 19:59:12', '2025-08-09 19:59:12'),
(135, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 19:59:12', '2025-08-09 19:59:12'),
(136, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', '556392410056@c.us', '2025-08-09 19:59:12', '2025-08-09 19:59:12'),
(137, 1, 'response_time', 1047.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 19:59:13', '2025-08-09 19:59:13'),
(138, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:14', '2025-08-09 19:59:14'),
(139, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:14', '2025-08-09 19:59:14'),
(140, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', '556392901378@c.us', '2025-08-09 19:59:14', '2025-08-09 19:59:14'),
(141, 1, 'response_time', 683.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:14', '2025-08-09 19:59:14'),
(142, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:15', '2025-08-09 19:59:15'),
(143, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:15', '2025-08-09 19:59:15'),
(144, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'welcome', '556392901378@c.us', '2025-08-09 19:59:15', '2025-08-09 19:59:15'),
(145, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:17', '2025-08-09 19:59:17'),
(146, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:17', '2025-08-09 19:59:17'),
(147, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'welcome', '556392901378@c.us', '2025-08-09 19:59:17', '2025-08-09 19:59:17'),
(148, 1, 'response_time', 1554.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:17', '2025-08-09 19:59:17'),
(149, 1, 'response_time', 1557.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:18', '2025-08-09 19:59:18'),
(150, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:19', '2025-08-09 19:59:19'),
(151, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:19', '2025-08-09 19:59:19'),
(152, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'menu_input', '556392901378@c.us', '2025-08-09 19:59:19', '2025-08-09 19:59:19'),
(153, 1, 'response_time', 12.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:19', '2025-08-09 19:59:19'),
(154, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:20', '2025-08-09 19:59:20'),
(155, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:20', '2025-08-09 19:59:20'),
(156, 1, 'node_executed', 1.00, '{\"node_type\": \"condition\"}', NULL, 5, 'menu_condition', '556392901378@c.us', '2025-08-09 19:59:20', '2025-08-09 19:59:20'),
(157, 1, 'response_time', 23.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:20', '2025-08-09 19:59:20'),
(158, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 19:59:23', '2025-08-09 19:59:23'),
(159, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 19:59:23', '2025-08-09 19:59:23'),
(160, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'welcome', '556392410056@c.us', '2025-08-09 19:59:23', '2025-08-09 19:59:23'),
(161, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:24', '2025-08-09 19:59:24'),
(162, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:24', '2025-08-09 19:59:24'),
(163, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'consultar_origem', '556392901378@c.us', '2025-08-09 19:59:24', '2025-08-09 19:59:24'),
(164, 1, 'response_time', 1687.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 19:59:24', '2025-08-09 19:59:24'),
(165, 1, 'response_time', 1734.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:26', '2025-08-09 19:59:26'),
(166, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:26', '2025-08-09 19:59:26'),
(167, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:26', '2025-08-09 19:59:26'),
(168, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'input_origem', '556392901378@c.us', '2025-08-09 19:59:26', '2025-08-09 19:59:26'),
(169, 1, 'response_time', 9.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:26', '2025-08-09 19:59:26'),
(170, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:27', '2025-08-09 19:59:27'),
(171, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:27', '2025-08-09 19:59:27'),
(172, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'consultar_destino', '556392901378@c.us', '2025-08-09 19:59:27', '2025-08-09 19:59:27'),
(173, 1, 'response_time', 1573.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:29', '2025-08-09 19:59:29');
INSERT INTO `analytics` (`id`, `bot_id`, `metric_type`, `metric_value`, `metadata`, `conversation_id`, `flow_id`, `node_id`, `user_phone`, `recorded_at`, `created_at`) VALUES
(174, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 19:59:30', '2025-08-09 19:59:30'),
(175, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 19:59:30', '2025-08-09 19:59:30'),
(176, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'menu_input', '556392410056@c.us', '2025-08-09 19:59:30', '2025-08-09 19:59:30'),
(177, 1, 'response_time', 34.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 19:59:30', '2025-08-09 19:59:30'),
(178, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:30', '2025-08-09 19:59:30'),
(179, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:30', '2025-08-09 19:59:30'),
(180, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'input_destino', '556392901378@c.us', '2025-08-09 19:59:30', '2025-08-09 19:59:30'),
(181, 1, 'response_time', 30.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:30', '2025-08-09 19:59:30'),
(182, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:32', '2025-08-09 19:59:32'),
(183, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:32', '2025-08-09 19:59:32'),
(184, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'consultar_data', '556392901378@c.us', '2025-08-09 19:59:32', '2025-08-09 19:59:32'),
(185, 1, 'response_time', 1551.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:33', '2025-08-09 19:59:33'),
(186, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 19:59:34', '2025-08-09 19:59:34'),
(187, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:34', '2025-08-09 19:59:34'),
(188, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'input_data', '556392901378@c.us', '2025-08-09 19:59:34', '2025-08-09 19:59:34'),
(189, 1, 'response_time', 7.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 19:59:34', '2025-08-09 19:59:34'),
(190, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 20:23:34', '2025-08-09 20:23:34'),
(191, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:23:34', '2025-08-09 20:23:34'),
(192, 1, 'node_executed', 1.00, '{\"node_type\": \"condition\"}', NULL, 5, 'menu_condition', '556392410056@c.us', '2025-08-09 20:23:34', '2025-08-09 20:23:34'),
(193, 1, 'response_time', 17.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:23:34', '2025-08-09 20:23:34'),
(194, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:23:36', '2025-08-09 20:23:36'),
(195, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:36', '2025-08-09 20:23:36'),
(196, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'mostrar_disponibilidade', '556392901378@c.us', '2025-08-09 20:23:36', '2025-08-09 20:23:36'),
(197, 1, 'response_time', 1689.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:37', '2025-08-09 20:23:37'),
(198, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:23:38', '2025-08-09 20:23:38'),
(199, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:38', '2025-08-09 20:23:38'),
(200, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'aguardar_acao', '556392901378@c.us', '2025-08-09 20:23:38', '2025-08-09 20:23:38'),
(201, 1, 'response_time', 9.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:38', '2025-08-09 20:23:38'),
(202, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 20:23:42', '2025-08-09 20:23:42'),
(203, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:23:42', '2025-08-09 20:23:42'),
(204, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'consultar_origem', '556392410056@c.us', '2025-08-09 20:23:42', '2025-08-09 20:23:42'),
(205, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:23:43', '2025-08-09 20:23:43'),
(206, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:43', '2025-08-09 20:23:43'),
(207, 1, 'node_executed', 1.00, '{\"node_type\": \"condition\"}', NULL, 5, 'verificar_acao', '556392901378@c.us', '2025-08-09 20:23:43', '2025-08-09 20:23:43'),
(208, 1, 'response_time', 18.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:43', '2025-08-09 20:23:43'),
(209, 1, 'response_time', 1926.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:23:44', '2025-08-09 20:23:44'),
(210, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:23:45', '2025-08-09 20:23:45'),
(211, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:45', '2025-08-09 20:23:45'),
(212, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'iniciar_compra', '556392901378@c.us', '2025-08-09 20:23:45', '2025-08-09 20:23:45'),
(213, 1, 'response_time', 1554.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:46', '2025-08-09 20:23:46'),
(214, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:23:47', '2025-08-09 20:23:47'),
(215, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:47', '2025-08-09 20:23:47'),
(216, 1, 'node_executed', 1.00, '{\"node_type\": \"action\"}', NULL, 5, 'transferir_humano', '556392901378@c.us', '2025-08-09 20:23:47', '2025-08-09 20:23:47'),
(217, 1, 'response_time', 9.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:47', '2025-08-09 20:23:47'),
(218, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 20:23:53', '2025-08-09 20:23:53'),
(219, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:23:53', '2025-08-09 20:23:53'),
(220, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'input_origem', '556392410056@c.us', '2025-08-09 20:23:53', '2025-08-09 20:23:53'),
(221, 1, 'response_time', 12.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:23:53', '2025-08-09 20:23:53'),
(222, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:23:54', '2025-08-09 20:23:54'),
(223, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:54', '2025-08-09 20:23:54'),
(224, 1, 'node_executed', 1.00, '{\"node_type\": \"end\"}', NULL, 5, 'end', '556392901378@c.us', '2025-08-09 20:23:54', '2025-08-09 20:23:54'),
(225, 1, 'conversation_completed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:54', '2025-08-09 20:23:54'),
(226, 1, 'response_time', 11.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:23:54', '2025-08-09 20:23:54'),
(227, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 20:24:20', '2025-08-09 20:24:20'),
(228, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:24:20', '2025-08-09 20:24:20'),
(229, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'consultar_destino', '556392410056@c.us', '2025-08-09 20:24:20', '2025-08-09 20:24:20'),
(230, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:24:21', '2025-08-09 20:24:21'),
(231, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:24:21', '2025-08-09 20:24:21'),
(232, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', NULL, 5, 'start', '556392901378@c.us', '2025-08-09 20:24:21', '2025-08-09 20:24:21'),
(233, 1, 'response_time', 1678.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:24:21', '2025-08-09 20:24:21'),
(234, 1, 'response_time', 1604.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:24:22', '2025-08-09 20:24:22'),
(235, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:24:22', '2025-08-09 20:24:22'),
(236, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:24:22', '2025-08-09 20:24:22'),
(237, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'welcome', '556392901378@c.us', '2025-08-09 20:24:22', '2025-08-09 20:24:22'),
(238, 1, 'response_time', 1588.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:24:24', '2025-08-09 20:24:24'),
(239, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:24:24', '2025-08-09 20:24:24'),
(240, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:24:24', '2025-08-09 20:24:24'),
(241, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'menu_input', '556392901378@c.us', '2025-08-09 20:24:24', '2025-08-09 20:24:24'),
(242, 1, 'response_time', 13.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:24:24', '2025-08-09 20:24:24'),
(243, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:24:26', '2025-08-09 20:24:26'),
(244, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:24:26', '2025-08-09 20:24:26'),
(245, 1, 'node_executed', 1.00, '{\"node_type\": \"condition\"}', NULL, 5, 'menu_condition', '556392901378@c.us', '2025-08-09 20:24:26', '2025-08-09 20:24:26'),
(246, 1, 'response_time', 16.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:24:26', '2025-08-09 20:24:26'),
(247, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 20:26:16', '2025-08-09 20:26:16'),
(248, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:26:16', '2025-08-09 20:26:16'),
(249, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'input_destino', '556392410056@c.us', '2025-08-09 20:26:16', '2025-08-09 20:26:16'),
(250, 1, 'response_time', 22.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:26:16', '2025-08-09 20:26:16'),
(251, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:26:17', '2025-08-09 20:26:17'),
(252, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:26:18', '2025-08-09 20:26:18'),
(253, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'consultar_origem', '556392901378@c.us', '2025-08-09 20:26:18', '2025-08-09 20:26:18'),
(254, 1, 'response_time', 1814.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:26:19', '2025-08-09 20:26:19'),
(255, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:26:20', '2025-08-09 20:26:20'),
(256, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:26:20', '2025-08-09 20:26:20'),
(257, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'input_origem', '556392901378@c.us', '2025-08-09 20:26:20', '2025-08-09 20:26:20'),
(258, 1, 'response_time', 12.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:26:20', '2025-08-09 20:26:20'),
(259, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 20:30:55', '2025-08-09 20:30:55'),
(260, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:30:55', '2025-08-09 20:30:55'),
(261, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'consultar_data', '556392410056@c.us', '2025-08-09 20:30:55', '2025-08-09 20:30:55'),
(262, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:30:57', '2025-08-09 20:30:57'),
(263, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:30:57', '2025-08-09 20:30:57'),
(264, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'consultar_destino', '556392901378@c.us', '2025-08-09 20:30:57', '2025-08-09 20:30:57'),
(265, 1, 'response_time', 1716.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:30:57', '2025-08-09 20:30:57'),
(266, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:30:58', '2025-08-09 20:30:58'),
(267, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:30:58', '2025-08-09 20:30:58'),
(268, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'consultar_destino', '556392901378@c.us', '2025-08-09 20:30:58', '2025-08-09 20:30:58'),
(269, 1, 'response_time', 1684.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:30:58', '2025-08-09 20:30:58'),
(270, 1, 'response_time', 1564.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:00', '2025-08-09 20:31:00'),
(271, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:31:00', '2025-08-09 20:31:00'),
(272, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:00', '2025-08-09 20:31:00'),
(273, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'input_destino', '556392901378@c.us', '2025-08-09 20:31:00', '2025-08-09 20:31:00'),
(274, 1, 'response_time', 16.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:00', '2025-08-09 20:31:00'),
(275, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:31:02', '2025-08-09 20:31:02'),
(276, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:02', '2025-08-09 20:31:02'),
(277, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'consultar_data', '556392901378@c.us', '2025-08-09 20:31:02', '2025-08-09 20:31:02'),
(278, 1, 'response_time', 1570.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:03', '2025-08-09 20:31:03'),
(279, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:31:04', '2025-08-09 20:31:04'),
(280, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:04', '2025-08-09 20:31:04'),
(281, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'input_data', '556392901378@c.us', '2025-08-09 20:31:04', '2025-08-09 20:31:04'),
(282, 1, 'response_time', 13.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:04', '2025-08-09 20:31:04'),
(283, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 20:31:16', '2025-08-09 20:31:16'),
(284, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:31:16', '2025-08-09 20:31:16'),
(285, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'input_data', '556392410056@c.us', '2025-08-09 20:31:16', '2025-08-09 20:31:16'),
(286, 1, 'response_time', 24.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:31:16', '2025-08-09 20:31:16'),
(287, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:31:17', '2025-08-09 20:31:17'),
(288, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:17', '2025-08-09 20:31:17'),
(289, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'mostrar_disponibilidade', '556392901378@c.us', '2025-08-09 20:31:17', '2025-08-09 20:31:17'),
(290, 1, 'response_time', 1692.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:19', '2025-08-09 20:31:19'),
(291, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:31:20', '2025-08-09 20:31:20'),
(292, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:20', '2025-08-09 20:31:20'),
(293, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', NULL, 5, 'aguardar_acao', '556392901378@c.us', '2025-08-09 20:31:20', '2025-08-09 20:31:20'),
(294, 1, 'response_time', 13.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:31:20', '2025-08-09 20:31:20'),
(295, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392410056@c.us', '2025-08-09 20:32:58', '2025-08-09 20:32:58'),
(296, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:32:58', '2025-08-09 20:32:58'),
(297, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'mostrar_disponibilidade', '556392410056@c.us', '2025-08-09 20:32:58', '2025-08-09 20:32:58'),
(298, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:32:59', '2025-08-09 20:32:59'),
(299, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:32:59', '2025-08-09 20:32:59'),
(300, 1, 'node_executed', 1.00, '{\"node_type\": \"condition\"}', NULL, 5, 'verificar_acao', '556392901378@c.us', '2025-08-09 20:32:59', '2025-08-09 20:32:59'),
(301, 1, 'response_time', 15.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:32:59', '2025-08-09 20:32:59'),
(302, 1, 'response_time', 1793.00, '{}', NULL, 5, NULL, '556392410056@c.us', '2025-08-09 20:33:00', '2025-08-09 20:33:00'),
(303, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:33:01', '2025-08-09 20:33:01'),
(304, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:33:01', '2025-08-09 20:33:01'),
(305, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', NULL, 5, 'iniciar_compra', '556392901378@c.us', '2025-08-09 20:33:01', '2025-08-09 20:33:01'),
(306, 1, 'response_time', 1661.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:33:03', '2025-08-09 20:33:03'),
(307, 1, 'message_received', 1.00, '{}', NULL, NULL, NULL, '556392901378@c.us', '2025-08-09 20:33:03', '2025-08-09 20:33:03'),
(308, 1, 'flow_executed', 1.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:33:03', '2025-08-09 20:33:03'),
(309, 1, 'node_executed', 1.00, '{\"node_type\": \"action\"}', NULL, 5, 'transferir_humano', '556392901378@c.us', '2025-08-09 20:33:03', '2025-08-09 20:33:03'),
(310, 1, 'response_time', 27.00, '{}', NULL, 5, NULL, '556392901378@c.us', '2025-08-09 20:33:03', '2025-08-09 20:33:03'),
(311, 1, 'message_received', 1.00, '{}', 13, NULL, NULL, '556392410056@c.us', '2025-08-09 20:37:09', '2025-08-09 20:37:09'),
(312, 1, 'flow_executed', 1.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-09 20:37:09', '2025-08-09 20:37:09'),
(313, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', 13, 5, 'start', '556392410056@c.us', '2025-08-09 20:37:09', '2025-08-09 20:37:09'),
(314, 1, 'response_time', 1054.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-09 20:37:10', '2025-08-09 20:37:10'),
(315, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:10', '2025-08-09 20:37:10'),
(316, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:10', '2025-08-09 20:37:10'),
(317, 1, 'node_executed', 1.00, '{\"node_type\": \"start\"}', 14, 5, 'start', '556392901378@c.us', '2025-08-09 20:37:10', '2025-08-09 20:37:10'),
(318, 1, 'response_time', 1022.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:11', '2025-08-09 20:37:11'),
(319, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:12', '2025-08-09 20:37:12'),
(320, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:12', '2025-08-09 20:37:12'),
(321, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 14, 5, 'welcome', '556392901378@c.us', '2025-08-09 20:37:12', '2025-08-09 20:37:12'),
(322, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:13', '2025-08-09 20:37:13'),
(323, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:13', '2025-08-09 20:37:13'),
(324, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 14, 5, 'welcome', '556392901378@c.us', '2025-08-09 20:37:13', '2025-08-09 20:37:13'),
(325, 1, 'response_time', 1674.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:14', '2025-08-09 20:37:14'),
(326, 1, 'response_time', 1669.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:15', '2025-08-09 20:37:15'),
(327, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:15', '2025-08-09 20:37:15'),
(328, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:15', '2025-08-09 20:37:15'),
(329, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', 14, 5, 'menu_input', '556392901378@c.us', '2025-08-09 20:37:15', '2025-08-09 20:37:15'),
(330, 1, 'response_time', 15.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:15', '2025-08-09 20:37:15'),
(331, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:17', '2025-08-09 20:37:17'),
(332, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:17', '2025-08-09 20:37:17'),
(333, 1, 'node_executed', 1.00, '{\"node_type\": \"condition\"}', 14, 5, 'menu_condition', '556392901378@c.us', '2025-08-09 20:37:17', '2025-08-09 20:37:17'),
(334, 1, 'response_time', 15.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:17', '2025-08-09 20:37:17'),
(335, 1, 'message_received', 1.00, '{}', 13, NULL, NULL, '556392410056@c.us', '2025-08-09 20:37:18', '2025-08-09 20:37:18'),
(336, 1, 'flow_executed', 1.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-09 20:37:18', '2025-08-09 20:37:18'),
(337, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 13, 5, 'welcome', '556392410056@c.us', '2025-08-09 20:37:18', '2025-08-09 20:37:18'),
(338, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:19', '2025-08-09 20:37:19'),
(339, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:19', '2025-08-09 20:37:19'),
(340, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 14, 5, 'comprar_origem', '556392901378@c.us', '2025-08-09 20:37:19', '2025-08-09 20:37:19'),
(341, 1, 'response_time', 1563.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-09 20:37:19', '2025-08-09 20:37:19'),
(342, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:20', '2025-08-09 20:37:20'),
(343, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:20', '2025-08-09 20:37:20'),
(344, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 14, 5, 'comprar_origem', '556392901378@c.us', '2025-08-09 20:37:20', '2025-08-09 20:37:20'),
(345, 1, 'response_time', 1776.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:20', '2025-08-09 20:37:20'),
(346, 1, 'response_time', 1615.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:22', '2025-08-09 20:37:22'),
(347, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:22', '2025-08-09 20:37:22'),
(348, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:22', '2025-08-09 20:37:22'),
(349, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', 14, 5, 'input_origem', '556392901378@c.us', '2025-08-09 20:37:22', '2025-08-09 20:37:22'),
(350, 1, 'response_time', 18.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:22', '2025-08-09 20:37:22'),
(351, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:24', '2025-08-09 20:37:24'),
(352, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:24', '2025-08-09 20:37:24'),
(353, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 14, 5, 'comprar_destino', '556392901378@c.us', '2025-08-09 20:37:24', '2025-08-09 20:37:24'),
(354, 1, 'response_time', 1557.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:25', '2025-08-09 20:37:25'),
(355, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:26', '2025-08-09 20:37:26'),
(356, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:26', '2025-08-09 20:37:26'),
(357, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', 14, 5, 'input_destino', '556392901378@c.us', '2025-08-09 20:37:26', '2025-08-09 20:37:26'),
(358, 1, 'response_time', 12.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:26', '2025-08-09 20:37:26'),
(359, 1, 'message_received', 1.00, '{}', 13, NULL, NULL, '556392410056@c.us', '2025-08-09 20:37:28', '2025-08-09 20:37:28'),
(360, 1, 'flow_executed', 1.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-09 20:37:28', '2025-08-09 20:37:28'),
(361, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', 13, 5, 'menu_input', '556392410056@c.us', '2025-08-09 20:37:28', '2025-08-09 20:37:28'),
(362, 1, 'response_time', 15.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-09 20:37:28', '2025-08-09 20:37:28'),
(363, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:29', '2025-08-09 20:37:29'),
(364, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:29', '2025-08-09 20:37:29'),
(365, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 14, 5, 'comprar_data', '556392901378@c.us', '2025-08-09 20:37:29', '2025-08-09 20:37:29'),
(366, 1, 'response_time', 1557.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:30', '2025-08-09 20:37:30'),
(367, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:37:31', '2025-08-09 20:37:31'),
(368, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:31', '2025-08-09 20:37:31'),
(369, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', 14, 5, 'input_data', '556392901378@c.us', '2025-08-09 20:37:31', '2025-08-09 20:37:31'),
(370, 1, 'response_time', 13.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:37:31', '2025-08-09 20:37:31'),
(371, 1, 'message_received', 1.00, '{}', 13, NULL, NULL, '556392410056@c.us', '2025-08-09 20:42:45', '2025-08-09 20:42:45'),
(372, 1, 'flow_executed', 1.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-09 20:42:45', '2025-08-09 20:42:45'),
(373, 1, 'node_executed', 1.00, '{\"node_type\": \"condition\"}', 13, 5, 'menu_condition', '556392410056@c.us', '2025-08-09 20:42:45', '2025-08-09 20:42:45'),
(374, 1, 'response_time', 14.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-09 20:42:45', '2025-08-09 20:42:45'),
(375, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:42:46', '2025-08-09 20:42:46'),
(376, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:42:46', '2025-08-09 20:42:46'),
(377, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 14, 5, 'mostrar_passagens', '556392901378@c.us', '2025-08-09 20:42:46', '2025-08-09 20:42:46'),
(378, 1, 'response_time', 1604.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:42:48', '2025-08-09 20:42:48'),
(379, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-09 20:42:48', '2025-08-09 20:42:48'),
(380, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:42:48', '2025-08-09 20:42:48'),
(381, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', 14, 5, 'input_escolha_passagem', '556392901378@c.us', '2025-08-09 20:42:48', '2025-08-09 20:42:48'),
(382, 1, 'response_time', 16.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-09 20:42:48', '2025-08-09 20:42:48'),
(383, 1, 'message_received', 1.00, '{}', 13, NULL, NULL, '556392410056@c.us', '2025-08-11 09:13:05', '2025-08-11 09:13:05'),
(384, 1, 'flow_executed', 1.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-11 09:13:05', '2025-08-11 09:13:05'),
(385, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 13, 5, 'comprar_origem', '556392410056@c.us', '2025-08-11 09:13:05', '2025-08-11 09:13:05'),
(386, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-11 09:13:06', '2025-08-11 09:13:06'),
(387, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-11 09:13:06', '2025-08-11 09:13:06'),
(388, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 14, 5, 'confirmar_compra', '556392901378@c.us', '2025-08-11 09:13:06', '2025-08-11 09:13:06'),
(389, 1, 'response_time', 2132.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-11 09:13:07', '2025-08-11 09:13:07'),
(390, 1, 'response_time', 1710.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-11 09:13:08', '2025-08-11 09:13:08'),
(391, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-11 09:13:08', '2025-08-11 09:13:08'),
(392, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-11 09:13:08', '2025-08-11 09:13:08'),
(393, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', 14, 5, 'input_confirmacao', '556392901378@c.us', '2025-08-11 09:13:08', '2025-08-11 09:13:08'),
(394, 1, 'response_time', 34.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-11 09:13:08', '2025-08-11 09:13:08'),
(395, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-11 09:13:09', '2025-08-11 09:13:09'),
(396, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-11 09:13:09', '2025-08-11 09:13:09'),
(397, 1, 'node_executed', 1.00, '{\"node_type\": \"condition\"}', 14, 5, 'processar_confirmacao', '556392901378@c.us', '2025-08-11 09:13:09', '2025-08-11 09:13:09'),
(398, 1, 'response_time', 23.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-11 09:13:10', '2025-08-11 09:13:10'),
(399, 1, 'message_received', 1.00, '{}', 13, NULL, NULL, '556392410056@c.us', '2025-08-11 09:13:15', '2025-08-11 09:13:15'),
(400, 1, 'flow_executed', 1.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-11 09:13:15', '2025-08-11 09:13:15'),
(401, 1, 'node_executed', 1.00, '{\"node_type\": \"input\"}', 13, 5, 'input_origem', '556392410056@c.us', '2025-08-11 09:13:15', '2025-08-11 09:13:15'),
(402, 1, 'response_time', 23.00, '{}', 13, 5, NULL, '556392410056@c.us', '2025-08-11 09:13:15', '2025-08-11 09:13:15'),
(403, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-11 09:13:16', '2025-08-11 09:13:16'),
(404, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-11 09:13:16', '2025-08-11 09:13:16'),
(405, 1, 'node_executed', 1.00, '{\"node_type\": \"message\"}', 14, 5, 'finalizar_compra', '556392901378@c.us', '2025-08-11 09:13:16', '2025-08-11 09:13:16'),
(406, 1, 'response_time', 1701.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-11 09:13:18', '2025-08-11 09:13:18'),
(407, 1, 'message_received', 1.00, '{}', 14, NULL, NULL, '556392901378@c.us', '2025-08-11 09:13:18', '2025-08-11 09:13:18'),
(408, 1, 'flow_executed', 1.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-11 09:13:18', '2025-08-11 09:13:18'),
(409, 1, 'node_executed', 1.00, '{\"node_type\": \"action\"}', 14, 5, 'transferir_pagamento', '556392901378@c.us', '2025-08-11 09:13:18', '2025-08-11 09:13:18'),
(410, 1, 'response_time', 16.00, '{}', 14, 5, NULL, '556392901378@c.us', '2025-08-11 09:13:18', '2025-08-11 09:13:18');

-- --------------------------------------------------------

--
-- Estrutura para tabela `bots`
--

CREATE TABLE `bots` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `session_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `ai_config` json DEFAULT NULL,
  `webhook_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `is_connected` tinyint(1) DEFAULT '0',
  `qr_code` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `connection_status` enum('disconnected','connecting','connected','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'disconnected',
  `last_seen` datetime DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `bots`
--

INSERT INTO `bots` (`id`, `user_id`, `name`, `description`, `phone_number`, `session_data`, `ai_config`, `webhook_url`, `is_active`, `is_connected`, `qr_code`, `connection_status`, `last_seen`, `settings`, `created_at`, `updated_at`) VALUES
(1, 1, 'BOT', 'bot', NULL, NULL, '{\"model\": \"meta-llama/Llama-3.3-70B-Instruct-Turbo\", \"enabled\": true, \"max_tokens\": 1000, \"temperature\": 0.7, \"system_prompt\": \"Você é um assistente virtual de atendimento ao cliente. Seja sempre educado, prestativo e profissional. Responda em português brasileiro.\"}', NULL, 1, 0, NULL, 'disconnected', '2025-08-11 09:15:06', '{\"auto_reply\": true, \"typing_delay\": 1500, \"group_support\": false, \"read_receipts\": true, \"business_hours\": {\"enabled\": false, \"schedule\": {\"friday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"sunday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"saturday\": {\"end\": \"12:00\", \"start\": \"09:00\", \"enabled\": false}, \"thursday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}, \"timezone\": \"America/Sao_Paulo\"}}', '2025-07-29 00:36:08', '2025-08-11 09:15:06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `conversations`
--

CREATE TABLE `conversations` (
  `id` int NOT NULL,
  `bot_id` int NOT NULL,
  `user_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_profile_pic` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `current_flow_id` int DEFAULT NULL,
  `current_node` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `session_data` json DEFAULT NULL,
  `status` enum('active','waiting','completed','abandoned','transferred') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `priority` int DEFAULT '0',
  `tags` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `started_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `conversations`
--

INSERT INTO `conversations` (`id`, `bot_id`, `user_phone`, `user_name`, `user_profile_pic`, `current_flow_id`, `current_node`, `session_data`, `status`, `priority`, `tags`, `metadata`, `started_at`, `last_activity_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(13, 1, '556392410056@c.us', NULL, NULL, 5, 'comprar_destino', '{\"context\": [], \"variables\": {}, \"ai_context\": [], \"user_inputs\": {}, \"flow_history\": [{\"node_id\": \"start\", \"node_type\": \"start\", \"timestamp\": \"2025-08-09T23:37:10.403Z\"}, {\"node_id\": \"welcome\", \"node_type\": \"message\", \"timestamp\": \"2025-08-09T23:37:19.915Z\"}, {\"node_id\": \"menu_input\", \"node_type\": \"input\", \"timestamp\": \"2025-08-09T23:37:28.162Z\"}, {\"node_id\": \"menu_condition\", \"node_type\": \"condition\", \"timestamp\": \"2025-08-09T23:42:45.558Z\"}, {\"node_id\": \"comprar_origem\", \"node_type\": \"message\", \"timestamp\": \"2025-08-11T12:13:07.160Z\"}, {\"node_id\": \"input_origem\", \"node_type\": \"input\", \"timestamp\": \"2025-08-11T12:13:15.553Z\"}]}', 'active', 0, '[]', '{\"source\": \"whatsapp\", \"location\": null, \"referrer\": null, \"device_type\": \"mobile\"}', '2025-08-09 20:37:09', '2025-08-11 09:13:15', NULL, '2025-08-09 20:37:09', '2025-08-11 09:13:15'),
(14, 1, '556392901378@c.us', NULL, NULL, 5, 'end', '{\"context\": [], \"variables\": {}, \"ai_context\": [], \"user_inputs\": {}, \"flow_history\": [{\"node_id\": \"start\", \"node_type\": \"start\", \"timestamp\": \"2025-08-09T23:37:11.668Z\"}, {\"node_id\": \"welcome\", \"node_type\": \"message\", \"timestamp\": \"2025-08-09T23:37:15.426Z\"}, {\"node_id\": \"menu_input\", \"node_type\": \"input\", \"timestamp\": \"2025-08-09T23:37:15.667Z\"}, {\"node_id\": \"menu_condition\", \"node_type\": \"condition\", \"timestamp\": \"2025-08-09T23:37:17.414Z\"}, {\"node_id\": \"comprar_origem\", \"node_type\": \"message\", \"timestamp\": \"2025-08-09T23:37:22.511Z\"}, {\"node_id\": \"input_origem\", \"node_type\": \"input\", \"timestamp\": \"2025-08-09T23:37:22.668Z\"}, {\"node_id\": \"comprar_destino\", \"node_type\": \"message\", \"timestamp\": \"2025-08-09T23:37:25.955Z\"}, {\"node_id\": \"input_destino\", \"node_type\": \"input\", \"timestamp\": \"2025-08-09T23:37:26.915Z\"}, {\"node_id\": \"comprar_data\", \"node_type\": \"message\", \"timestamp\": \"2025-08-09T23:37:30.959Z\"}, {\"node_id\": \"input_data\", \"node_type\": \"input\", \"timestamp\": \"2025-08-09T23:37:31.918Z\"}, {\"node_id\": \"mostrar_passagens\", \"node_type\": \"message\", \"timestamp\": \"2025-08-09T23:42:48.253Z\"}, {\"node_id\": \"input_escolha_passagem\", \"node_type\": \"input\", \"timestamp\": \"2025-08-09T23:42:48.593Z\"}, {\"node_id\": \"confirmar_compra\", \"node_type\": \"message\", \"timestamp\": \"2025-08-11T12:13:08.176Z\"}, {\"node_id\": \"input_confirmacao\", \"node_type\": \"input\", \"timestamp\": \"2025-08-11T12:13:08.287Z\"}, {\"node_id\": \"processar_confirmacao\", \"node_type\": \"condition\", \"timestamp\": \"2025-08-11T12:13:10.009Z\"}, {\"node_id\": \"finalizar_compra\", \"node_type\": \"message\", \"timestamp\": \"2025-08-11T12:13:18.440Z\"}, {\"node_id\": \"transferir_pagamento\", \"node_type\": \"action\", \"timestamp\": \"2025-08-11T12:13:18.757Z\"}]}', 'active', 0, '[]', '{\"source\": \"whatsapp\", \"location\": null, \"referrer\": null, \"device_type\": \"mobile\"}', '2025-08-09 20:37:10', '2025-08-11 09:13:19', NULL, '2025-08-09 20:37:10', '2025-08-11 09:13:19');

-- --------------------------------------------------------

--
-- Estrutura para tabela `flows`
--

CREATE TABLE `flows` (
  `id` int NOT NULL,
  `bot_id` int DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `flow_data` json DEFAULT NULL,
  `version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '1.0.0',
  `is_active` tinyint(1) DEFAULT '0',
  `is_default` tinyint(1) DEFAULT '0',
  `trigger_keywords` json DEFAULT NULL,
  `trigger_conditions` json DEFAULT NULL,
  `priority` int DEFAULT '0',
  `statistics` json DEFAULT NULL,
  `template_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `flows`
--

INSERT INTO `flows` (`id`, `bot_id`, `name`, `description`, `flow_data`, `version`, `is_active`, `is_default`, `trigger_keywords`, `trigger_conditions`, `priority`, `statistics`, `template_id`, `created_at`, `updated_at`) VALUES
(5, 1, 'Sistema de Passagens de Ônibus', 'Fluxo completo para consulta e compra de passagens de ônibus com integração WhatsApp', '{\"edges\": [{\"id\": \"start-welcome\", \"type\": \"smoothstep\", \"source\": \"start\", \"target\": \"welcome\"}, {\"id\": \"welcome-menu_input\", \"type\": \"smoothstep\", \"source\": \"welcome\", \"target\": \"menu_input\"}, {\"id\": \"menu_input-menu_condition\", \"type\": \"smoothstep\", \"source\": \"menu_input\", \"target\": \"menu_condition\"}, {\"id\": \"menu_condition-comprar_origem-1\", \"type\": \"smoothstep\", \"label\": \"1\", \"source\": \"menu_condition\", \"target\": \"comprar_origem\"}, {\"id\": \"menu_condition-consultar_horarios-2\", \"type\": \"smoothstep\", \"label\": \"2\", \"source\": \"menu_condition\", \"target\": \"consultar_horarios\"}, {\"id\": \"menu_condition-mostrar_destinos-3\", \"type\": \"smoothstep\", \"label\": \"3\", \"source\": \"menu_condition\", \"target\": \"mostrar_destinos\"}, {\"id\": \"menu_condition-consultar_precos-4\", \"type\": \"smoothstep\", \"label\": \"4\", \"source\": \"menu_condition\", \"target\": \"consultar_precos\"}, {\"id\": \"menu_condition-transferir_atendente-5\", \"type\": \"smoothstep\", \"label\": \"5\", \"source\": \"menu_condition\", \"target\": \"transferir_atendente\"}, {\"id\": \"menu_condition-info_empresa-6\", \"type\": \"smoothstep\", \"label\": \"6\", \"source\": \"menu_condition\", \"target\": \"info_empresa\"}, {\"id\": \"menu_condition-opcao_invalida-default\", \"type\": \"smoothstep\", \"label\": \"inválida\", \"source\": \"menu_condition\", \"target\": \"opcao_invalida\"}, {\"id\": \"comprar_origem-input_origem\", \"type\": \"smoothstep\", \"source\": \"comprar_origem\", \"target\": \"input_origem\"}, {\"id\": \"input_origem-comprar_destino\", \"type\": \"smoothstep\", \"source\": \"input_origem\", \"target\": \"comprar_destino\"}, {\"id\": \"comprar_destino-input_destino\", \"type\": \"smoothstep\", \"source\": \"comprar_destino\", \"target\": \"input_destino\"}, {\"id\": \"input_destino-comprar_data\", \"type\": \"smoothstep\", \"source\": \"input_destino\", \"target\": \"comprar_data\"}, {\"id\": \"comprar_data-input_data\", \"type\": \"smoothstep\", \"source\": \"comprar_data\", \"target\": \"input_data\"}, {\"id\": \"input_data-mostrar_passagens\", \"type\": \"smoothstep\", \"source\": \"input_data\", \"target\": \"mostrar_passagens\"}, {\"id\": \"mostrar_passagens-input_escolha_passagem\", \"type\": \"smoothstep\", \"source\": \"mostrar_passagens\", \"target\": \"input_escolha_passagem\"}, {\"id\": \"input_escolha_passagem-confirmar_compra\", \"type\": \"smoothstep\", \"source\": \"input_escolha_passagem\", \"target\": \"confirmar_compra\"}, {\"id\": \"confirmar_compra-input_confirmacao\", \"type\": \"smoothstep\", \"source\": \"confirmar_compra\", \"target\": \"input_confirmacao\"}, {\"id\": \"input_confirmacao-processar_confirmacao\", \"type\": \"smoothstep\", \"source\": \"input_confirmacao\", \"target\": \"processar_confirmacao\"}, {\"id\": \"processar_confirmacao-finalizar_compra-sim\", \"type\": \"smoothstep\", \"label\": \"SIM\", \"source\": \"processar_confirmacao\", \"target\": \"finalizar_compra\"}, {\"id\": \"processar_confirmacao-welcome-menu\", \"type\": \"smoothstep\", \"label\": \"MENU\", \"source\": \"processar_confirmacao\", \"target\": \"welcome\"}, {\"id\": \"processar_confirmacao-compra_cancelada-default\", \"type\": \"smoothstep\", \"label\": \"cancelar\", \"source\": \"processar_confirmacao\", \"target\": \"compra_cancelada\"}, {\"id\": \"finalizar_compra-transferir_pagamento\", \"type\": \"smoothstep\", \"source\": \"finalizar_compra\", \"target\": \"transferir_pagamento\"}, {\"id\": \"transferir_pagamento-end\", \"type\": \"smoothstep\", \"source\": \"transferir_pagamento\", \"target\": \"end\"}, {\"id\": \"compra_cancelada-voltar_menu_cancelamento\", \"type\": \"smoothstep\", \"source\": \"compra_cancelada\", \"target\": \"voltar_menu_cancelamento\"}, {\"id\": \"voltar_menu_cancelamento-processar_pos_cancelamento\", \"type\": \"smoothstep\", \"source\": \"voltar_menu_cancelamento\", \"target\": \"processar_pos_cancelamento\"}, {\"id\": \"processar_pos_cancelamento-welcome-1\", \"type\": \"smoothstep\", \"label\": \"1\", \"source\": \"processar_pos_cancelamento\", \"target\": \"welcome\"}, {\"id\": \"processar_pos_cancelamento-comprar_origem-2\", \"type\": \"smoothstep\", \"label\": \"2\", \"source\": \"processar_pos_cancelamento\", \"target\": \"comprar_origem\"}, {\"id\": \"processar_pos_cancelamento-transferir_atendente-3\", \"type\": \"smoothstep\", \"label\": \"3\", \"source\": \"processar_pos_cancelamento\", \"target\": \"transferir_atendente\"}, {\"id\": \"consultar_horarios-voltar_menu_horarios\", \"type\": \"smoothstep\", \"source\": \"consultar_horarios\", \"target\": \"voltar_menu_horarios\"}, {\"id\": \"voltar_menu_horarios-welcome\", \"type\": \"smoothstep\", \"source\": \"voltar_menu_horarios\", \"target\": \"welcome\"}, {\"id\": \"mostrar_destinos-voltar_menu_destinos\", \"type\": \"smoothstep\", \"source\": \"mostrar_destinos\", \"target\": \"voltar_menu_destinos\"}, {\"id\": \"voltar_menu_destinos-welcome\", \"type\": \"smoothstep\", \"source\": \"voltar_menu_destinos\", \"target\": \"welcome\"}, {\"id\": \"consultar_precos-voltar_menu_precos\", \"type\": \"smoothstep\", \"source\": \"consultar_precos\", \"target\": \"voltar_menu_precos\"}, {\"id\": \"voltar_menu_precos-welcome\", \"type\": \"smoothstep\", \"source\": \"voltar_menu_precos\", \"target\": \"welcome\"}, {\"id\": \"transferir_atendente-acao_transferir_atendente\", \"type\": \"smoothstep\", \"source\": \"transferir_atendente\", \"target\": \"acao_transferir_atendente\"}, {\"id\": \"acao_transferir_atendente-end\", \"type\": \"smoothstep\", \"source\": \"acao_transferir_atendente\", \"target\": \"end\"}, {\"id\": \"info_empresa-voltar_menu_info\", \"type\": \"smoothstep\", \"source\": \"info_empresa\", \"target\": \"voltar_menu_info\"}, {\"id\": \"voltar_menu_info-welcome\", \"type\": \"smoothstep\", \"source\": \"voltar_menu_info\", \"target\": \"welcome\"}, {\"id\": \"opcao_invalida-welcome\", \"type\": \"smoothstep\", \"source\": \"opcao_invalida\", \"target\": \"welcome\"}], \"nodes\": [{\"id\": \"start\", \"next\": \"welcome\", \"type\": \"start\", \"content\": \"\", \"position\": {\"x\": 0, \"y\": 0}}, {\"id\": \"welcome\", \"next\": \"menu_input\", \"type\": \"message\", \"content\": \"🚌 *BEM-VINDO À VIAÇÃO EXPRESSA!*\\n\\n🎯 *O que você gostaria de fazer?*\\n\\n1️⃣ 🎫 Comprar Passagem\\n2️⃣ 🕐 Consultar Horários\\n3️⃣ 📍 Destinos Disponíveis\\n4️⃣ 💰 Consultar Preços\\n5️⃣ 📞 Falar com Atendente\\n6️⃣ ℹ️ Informações da Empresa\\n\\n*Digite o número da opção:*\", \"position\": {\"x\": 0, \"y\": 150}}, {\"id\": \"menu_input\", \"next\": \"menu_condition\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": 0, \"y\": 300}}, {\"id\": \"menu_condition\", \"next\": \"comprar_origem\", \"type\": \"condition\", \"content\": \"\", \"position\": {\"x\": 0, \"y\": 450}}, {\"id\": \"comprar_origem\", \"next\": \"input_origem\", \"type\": \"message\", \"content\": \"🗺️ *COMPRA DE PASSAGEM*\\n\\n📍 *Digite a cidade de ORIGEM:*\\n\\n💡 *Exemplos:*\\n• São Paulo\\n• Rio de Janeiro\\n• Belo Horizonte\\n• Brasília\\n• Salvador\\n\\n*Digite apenas o nome da cidade:*\", \"position\": {\"x\": -400, \"y\": 600}}, {\"id\": \"input_origem\", \"next\": \"comprar_destino\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": -400, \"y\": 750}}, {\"id\": \"comprar_destino\", \"next\": \"input_destino\", \"type\": \"message\", \"content\": \"🎯 *Perfeito!* Origem: *${cidade_origem}*\\n\\n📍 *Agora digite a cidade de DESTINO:*\\n\\n💡 *Principais destinos:*\\n• São Paulo\\n• Rio de Janeiro\\n• Belo Horizonte\\n• Brasília\\n• Salvador\\n• Goiânia\\n• Curitiba\\n\\n*Digite o destino:*\", \"position\": {\"x\": -400, \"y\": 900}}, {\"id\": \"input_destino\", \"next\": \"comprar_data\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": -400, \"y\": 1050}}, {\"id\": \"comprar_data\", \"next\": \"input_data\", \"type\": \"message\", \"content\": \"📅 *Rota selecionada:*\\n🚌 ${cidade_origem} ➜ ${cidade_destino}\\n\\n*Digite a data da viagem:*\\n\\n📋 *Formato: DD/MM/AAAA*\\n💡 *Exemplos:*\\n• 15/08/2025\\n• 20/08/2025\\n• 25/08/2025\\n\\n⚠️ *Mínimo: hoje*\\n⚠️ *Máximo: 60 dias*\", \"position\": {\"x\": -400, \"y\": 1200}}, {\"id\": \"input_data\", \"next\": \"mostrar_passagens\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": -400, \"y\": 1350}}, {\"id\": \"mostrar_passagens\", \"next\": \"input_escolha_passagem\", \"type\": \"message\", \"content\": \"🎫 *PASSAGENS DISPONÍVEIS*\\n\\n🚌 *Rota:* ${cidade_origem} ➜ ${cidade_destino}\\n📅 *Data:* ${data_viagem}\\n\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n*1️⃣ EXECUTIVO - 06:00*\\n💺 45 lugares disponíveis\\n💰 R$ 85,00\\n⏱️ Duração: 6h30min\\n\\n*2️⃣ CONVENCIONAL - 09:00*\\n💺 23 lugares disponíveis\\n💰 R$ 65,00\\n⏱️ Duração: 7h15min\\n\\n*3️⃣ EXECUTIVO - 14:00*\\n💺 31 lugares disponíveis\\n💰 R$ 85,00\\n⏱️ Duração: 6h30min\\n\\n*4️⃣ LEITO - 22:00*\\n💺 12 lugares disponíveis\\n💰 R$ 120,00\\n⏱️ Duração: 8h00min\\n\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n*Digite o número da passagem escolhida:*\", \"position\": {\"x\": -400, \"y\": 1500}}, {\"id\": \"input_escolha_passagem\", \"next\": \"confirmar_compra\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": -400, \"y\": 1650}}, {\"id\": \"confirmar_compra\", \"next\": \"input_confirmacao\", \"type\": \"message\", \"content\": \"✅ *CONFIRMAÇÃO DA COMPRA*\\n\\n🎫 *Resumo da Passagem:*\\n📍 ${cidade_origem} ➜ ${cidade_destino}\\n📅 ${data_viagem}\\n🚌 Passagem #${passagem_escolhida}\\n\\n💳 *Formas de Pagamento:*\\n• PIX (5% desconto)\\n• Cartão de Crédito (até 3x)\\n• Cartão de Débito\\n\\n*Digite SIM para confirmar a compra:*\\n*Digite NÃO para cancelar*\\n*Digite MENU para voltar ao início*\", \"position\": {\"x\": -400, \"y\": 1800}}, {\"id\": \"input_confirmacao\", \"next\": \"processar_confirmacao\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": -400, \"y\": 1950}}, {\"id\": \"processar_confirmacao\", \"next\": \"finalizar_compra\", \"type\": \"condition\", \"content\": \"\", \"position\": {\"x\": -400, \"y\": 2100}}, {\"id\": \"finalizar_compra\", \"next\": \"transferir_pagamento\", \"type\": \"message\", \"content\": \"🎉 *COMPRA CONFIRMADA!*\\n\\n✅ *Sua passagem foi reservada:*\\n🎫 Código: #PASS${passagem_escolhida}${data_viagem}\\n📍 ${cidade_origem} ➜ ${cidade_destino}\\n📅 ${data_viagem}\\n\\n👨‍💼 *Transferindo para atendente...*\\n\\nEm instantes você será conectado com um operador para:\\n• Finalizar pagamento\\n• Escolher assento\\n• Receber bilhete por email\\n• Tirar dúvidas\\n\\n⏱️ *Aguarde um momento...*\", \"position\": {\"x\": -600, \"y\": 2250}}, {\"id\": \"transferir_pagamento\", \"next\": \"end\", \"type\": \"action\", \"content\": \"\", \"position\": {\"x\": -600, \"y\": 2400}}, {\"id\": \"compra_cancelada\", \"next\": \"voltar_menu_cancelamento\", \"type\": \"message\", \"content\": \"❌ *Compra cancelada*\\n\\n🔄 Sem problemas! Sua passagem não foi reservada.\\n\\n*O que você gostaria de fazer?*\\n\\n1️⃣ Voltar ao menu principal\\n2️⃣ Tentar nova busca\\n3️⃣ Falar com atendente\\n\\n*Digite sua opção:*\", \"position\": {\"x\": -200, \"y\": 2250}}, {\"id\": \"voltar_menu_cancelamento\", \"next\": \"processar_pos_cancelamento\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": -200, \"y\": 2400}}, {\"id\": \"processar_pos_cancelamento\", \"next\": \"welcome\", \"type\": \"condition\", \"content\": \"\", \"position\": {\"x\": -200, \"y\": 2550}}, {\"id\": \"consultar_horarios\", \"next\": \"voltar_menu_horarios\", \"type\": \"message\", \"content\": \"🕐 *HORÁRIOS DE PARTIDA*\\n\\n🚌 *PRINCIPAIS ROTAS:*\\n\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n*📍 SÃO PAULO → RIO DE JANEIRO*\\n🕕 06:00 • 🕘 09:00 • 🕐 13:00 • 🕕 18:00 • 🕘 21:00\\n\\n*📍 RIO DE JANEIRO → BELO HORIZONTE*\\n🕖 07:00 • 🕑 14:00 • 🕗 20:00\\n\\n*📍 SÃO PAULO → SALVADOR*\\n🕖 19:00 • 🕘 22:00 (Leito)\\n\\n*📍 BRASÍLIA → GOIÂNIA*\\n🕗 08:00 • 🕒 15:00 • 🕘 21:00\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n💡 *Para horários específicos, digite 1 para comprar passagem*\\n\\n*Digite MENU para voltar*\", \"position\": {\"x\": 200, \"y\": 600}}, {\"id\": \"voltar_menu_horarios\", \"next\": \"welcome\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": 200, \"y\": 750}}, {\"id\": \"mostrar_destinos\", \"next\": \"voltar_menu_destinos\", \"type\": \"message\", \"content\": \"📍 *DESTINOS DISPONÍVEIS*\\n\\n🌟 *DESTINOS PRINCIPAIS:*\\n\\n🏙️ *REGIÃO SUDESTE*\\n• São Paulo (SP)\\n• Rio de Janeiro (RJ)\\n• Belo Horizonte (MG)\\n• Vitória (ES)\\n\\n🌆 *REGIÃO CENTRO-OESTE*\\n• Brasília (DF)\\n• Goiânia (GO)\\n• Campo Grande (MS)\\n• Cuiabá (MT)\\n\\n🏖️ *REGIÃO NORDESTE*\\n• Salvador (BA)\\n• Recife (PE)\\n• Fortaleza (CE)\\n• Natal (RN)\\n\\n❄️ *REGIÃO SUL*\\n• Curitiba (PR)\\n• Florianópolis (SC)\\n• Porto Alegre (RS)\\n\\n💡 *Para consultar passagens, digite 1*\\n\\n*Digite MENU para voltar*\", \"position\": {\"x\": 400, \"y\": 600}}, {\"id\": \"voltar_menu_destinos\", \"next\": \"welcome\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": 400, \"y\": 750}}, {\"id\": \"consultar_precos\", \"next\": \"voltar_menu_precos\", \"type\": \"message\", \"content\": \"💰 *TABELA DE PREÇOS*\\n\\n🎫 *TIPOS DE PASSAGEM:*\\n\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n*🚌 CONVENCIONAL*\\n💺 Poltronas reclináveis\\n💰 R$ 45 - R$ 80\\n\\n*🚌 EXECUTIVO*\\n💺 Poltronas amplas + ar\\n💰 R$ 65 - R$ 120\\n\\n*🛏️ LEITO*\\n💺 Cama individual\\n💰 R$ 90 - R$ 180\\n\\n*🌟 PREMIUM*\\n💺 Suite privada\\n💰 R$ 150 - R$ 300\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n💳 *FORMAS DE PAGAMENTO:*\\n• PIX (5% desconto)\\n• Cartão (até 3x sem juros)\\n• Dinheiro (nas lojas)\\n\\n💡 *Preços variam por distância*\\n\\n*Digite MENU para voltar*\", \"position\": {\"x\": 600, \"y\": 600}}, {\"id\": \"voltar_menu_precos\", \"next\": \"welcome\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": 600, \"y\": 750}}, {\"id\": \"transferir_atendente\", \"next\": \"acao_transferir_atendente\", \"type\": \"message\", \"content\": \"👨‍💼 *TRANSFERINDO PARA ATENDENTE*\\n\\n✅ *Você será conectado com nossa equipe especializada!*\\n\\n⏱️ *Horário de atendimento:*\\n🕕 Segunda a Sexta: 06:00 às 22:00\\n🕘 Sábados: 08:00 às 18:00\\n🕘 Domingos: 10:00 às 16:00\\n\\n📞 *O que nosso atendente pode fazer:*\\n• Finalizar compras\\n• Alterar/cancelar passagens\\n• Informações especiais\\n• Suporte técnico\\n\\n🔄 *Conectando... aguarde um momento*\", \"position\": {\"x\": 800, \"y\": 600}}, {\"id\": \"acao_transferir_atendente\", \"next\": \"end\", \"type\": \"action\", \"content\": \"\", \"position\": {\"x\": 800, \"y\": 750}}, {\"id\": \"info_empresa\", \"next\": \"voltar_menu_info\", \"type\": \"message\", \"content\": \"🏢 *VIAÇÃO EXPRESSA - INFORMAÇÕES*\\n\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n*📞 CONTATOS*\\n• Central: 0800-123-4567\\n• WhatsApp: (11) 99999-8888\\n• Email: contato@viacaoexpressa.com.br\\n\\n*🏪 RODOVIÁRIA PRINCIPAL*\\n📍 Av. Principal, 1000 - Centro\\n🏙️ São Paulo - SP\\n📮 CEP: 01234-567\\n\\n*🕐 HORÁRIOS DE FUNCIONAMENTO*\\n📅 Seg-Sex: 05:00 às 23:00\\n📅 Sábados: 06:00 às 22:00\\n📅 Domingos: 07:00 às 21:00\\n\\n*🎫 POLÍTICA DE BAGAGEM*\\n✅ 1 bagagem de mão (10kg)\\n✅ 1 bagagem despachada (23kg)\\n❌ Itens proibidos: consulte site\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n*Digite MENU para voltar*\", \"position\": {\"x\": 1000, \"y\": 600}}, {\"id\": \"voltar_menu_info\", \"next\": \"welcome\", \"type\": \"input\", \"content\": \"\", \"position\": {\"x\": 1000, \"y\": 750}}, {\"id\": \"opcao_invalida\", \"next\": \"welcome\", \"type\": \"message\", \"content\": \"❌ *Opção inválida!*\\n\\n🔍 *Digite apenas o número da opção desejada:*\\n• 1 = Comprar Passagem\\n• 2 = Consultar Horários\\n• 3 = Destinos\\n• 4 = Preços\\n• 5 = Atendente\\n• 6 = Informações\\n\\n🔄 *Voltando ao menu...*\", \"position\": {\"x\": 0, \"y\": 750}}, {\"id\": \"end\", \"next\": null, \"type\": \"end\", \"content\": \"\", \"position\": {\"x\": 0, \"y\": 2700}}], \"viewport\": {\"x\": 0, \"y\": 0, \"zoom\": 1}}', '2.0.0', 1, 1, '[\"oi\", \"olá\", \"menu\", \"passagem\", \"onibus\", \"viagem\", \"start\", \"começar\", \"iniciar\"]', '{\"type\": \"any\", \"intents\": [], \"keywords\": [], \"time_conditions\": null, \"custom_conditions\": null}', 100, '{\"last_execution\": null, \"total_executions\": 0, \"successful_completions\": 0, \"average_completion_time\": 0}', NULL, '2025-07-30 09:21:12', '2025-08-09 20:36:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `flow_keywords`
--

CREATE TABLE `flow_keywords` (
  `id` int NOT NULL,
  `flow_id` int NOT NULL,
  `keyword` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `flow_nodes`
--

CREATE TABLE `flow_nodes` (
  `id` int NOT NULL,
  `flow_id` int NOT NULL,
  `node_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `node_type` enum('start','ai_response','fixed_response','message','condition','input_capture','input','action','end','delay','webhook','transfer_human','ai') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `node_config` json DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `position_x` float DEFAULT '0',
  `position_y` float DEFAULT '0',
  `width` int DEFAULT '200',
  `height` int DEFAULT '100',
  `style` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `bot_id` int NOT NULL,
  `conversation_id` int DEFAULT NULL,
  `whatsapp_message_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sender_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sender_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message_type` enum('text','image','audio','video','document','location','contact') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'text',
  `direction` enum('incoming','outgoing') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `media_type` enum('text','image','audio','video','document','sticker','location','contact') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'text',
  `media_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `media_filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `media_size` int DEFAULT NULL,
  `media_mimetype` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quoted_message_id` int DEFAULT NULL,
  `status` enum('pending','sent','delivered','read','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `processed` tinyint(1) DEFAULT '0',
  `processing_time` int DEFAULT NULL,
  `node_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `bot_id`, `conversation_id`, `whatsapp_message_id`, `sender_phone`, `sender_name`, `message_type`, `direction`, `content`, `media_type`, `media_url`, `media_filename`, `media_size`, `media_mimetype`, `quoted_message_id`, `status`, `error_message`, `processed`, `processing_time`, `node_id`, `metadata`, `timestamp`, `created_at`, `updated_at`) VALUES
(335, 1, 13, 'false_556392410056@c.us_3EB0269017DB7901C0E665', '556392410056@c.us', NULL, 'text', 'incoming', 'ola', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1054, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:09', '2025-08-09 20:37:09', '2025-08-09 20:37:10'),
(336, 1, 13, NULL, '556392410056@c.us', NULL, 'text', 'outgoing', 'Olá! Como posso ajudá-lo?', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"start\", \"system_message\": true}', '2025-08-09 20:37:10', '2025-08-09 20:37:10', '2025-08-09 20:37:10'),
(337, 1, 14, 'true_556392410056@c.us_3EB01E7615576B9B801441', '556392901378@c.us', NULL, 'text', 'incoming', 'I don\'t know this command. To get commands list - return to the menu (#)', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1022, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:10', '2025-08-09 20:37:10', '2025-08-09 20:37:11'),
(338, 1, 14, NULL, '556392901378@c.us', NULL, 'text', 'outgoing', 'Olá! Como posso ajudá-lo?', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"start\", \"system_message\": true}', '2025-08-09 20:37:11', '2025-08-09 20:37:11', '2025-08-09 20:37:11'),
(339, 1, 14, 'true_556392410056@c.us_3EB0F28127BDEF242B8363', '556392901378@c.us', NULL, 'text', 'incoming', 'Olá! Como posso ajudá-lo?', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1674, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:12', '2025-08-09 20:37:12', '2025-08-09 20:37:14'),
(340, 1, 14, 'true_556392901378@c.us_3EB0516AB508FA3762AEF1_out', '556392901378@c.us', NULL, 'text', 'incoming', 'Olá! Como posso ajudá-lo?', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1669, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:13', '2025-08-09 20:37:13', '2025-08-09 20:37:15'),
(341, 1, 14, NULL, '556392901378@c.us', NULL, 'text', 'outgoing', '🚌 *BEM-VINDO À VIAÇÃO EXPRESSA!*\n\n🎯 *O que você gostaria de fazer?*\n\n1️⃣ 🎫 Comprar Passagem\n2️⃣ 🕐 Consultar Horários\n3️⃣ 📍 Destinos Disponíveis\n4️⃣ 💰 Consultar Preços\n5️⃣ 📞 Falar com Atendente\n6️⃣ ℹ️ Informações da Empresa\n\n*Digite o número da opção:*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"welcome\", \"system_message\": true}', '2025-08-09 20:37:14', '2025-08-09 20:37:14', '2025-08-09 20:37:14'),
(342, 1, 14, NULL, '556392901378@c.us', NULL, 'text', 'outgoing', '🚌 *BEM-VINDO À VIAÇÃO EXPRESSA!*\n\n🎯 *O que você gostaria de fazer?*\n\n1️⃣ 🎫 Comprar Passagem\n2️⃣ 🕐 Consultar Horários\n3️⃣ 📍 Destinos Disponíveis\n4️⃣ 💰 Consultar Preços\n5️⃣ 📞 Falar com Atendente\n6️⃣ ℹ️ Informações da Empresa\n\n*Digite o número da opção:*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"welcome\", \"system_message\": true}', '2025-08-09 20:37:15', '2025-08-09 20:37:15', '2025-08-09 20:37:15'),
(343, 1, 14, 'true_556392901378@c.us_3EB076FAEE2A7E669FDE26_out', '556392901378@c.us', NULL, 'text', 'incoming', '🚌 *BEM-VINDO À VIAÇÃO EXPRESSA!*\n\n🎯 *O que você gostaria de fazer?*\n\n1️⃣ 🎫 Comprar Passagem\n2️⃣ 🕐 Consultar Horários\n3️⃣ 📍 Destinos Disponíveis\n4️⃣ 💰 Consultar Preços\n5️⃣ 📞 Falar com Atendente\n6️⃣ ℹ️ Informações da Empresa\n\n*Digite o número da opção:*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 15, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:15', '2025-08-09 20:37:15', '2025-08-09 20:37:15'),
(344, 1, 14, 'true_556392901378@c.us_3EB07843914700E168A986_out', '556392901378@c.us', NULL, 'text', 'incoming', '🚌 *BEM-VINDO À VIAÇÃO EXPRESSA!*\n\n🎯 *O que você gostaria de fazer?*\n\n1️⃣ 🎫 Comprar Passagem\n2️⃣ 🕐 Consultar Horários\n3️⃣ 📍 Destinos Disponíveis\n4️⃣ 💰 Consultar Preços\n5️⃣ 📞 Falar com Atendente\n6️⃣ ℹ️ Informações da Empresa\n\n*Digite o número da opção:*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 15, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:17', '2025-08-09 20:37:17', '2025-08-09 20:37:17'),
(345, 1, 13, 'false_556392410056@c.us_3EB02F69863E7A59352C8C', '556392410056@c.us', NULL, 'text', 'incoming', 'comprar passagem', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1563, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:18', '2025-08-09 20:37:18', '2025-08-09 20:37:19'),
(346, 1, 14, 'true_556392410056@c.us_3EB0DA3284D4BD23E87799', '556392901378@c.us', NULL, 'text', 'incoming', 'I don\'t know this command. To get commands list - return to the menu (#)', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1776, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:19', '2025-08-09 20:37:19', '2025-08-09 20:37:20'),
(347, 1, 13, NULL, '556392410056@c.us', NULL, 'text', 'outgoing', '🚌 *BEM-VINDO À VIAÇÃO EXPRESSA!*\n\n🎯 *O que você gostaria de fazer?*\n\n1️⃣ 🎫 Comprar Passagem\n2️⃣ 🕐 Consultar Horários\n3️⃣ 📍 Destinos Disponíveis\n4️⃣ 💰 Consultar Preços\n5️⃣ 📞 Falar com Atendente\n6️⃣ ℹ️ Informações da Empresa\n\n*Digite o número da opção:*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"welcome\", \"system_message\": true}', '2025-08-09 20:37:19', '2025-08-09 20:37:19', '2025-08-09 20:37:19'),
(348, 1, 14, 'true_556392410056@c.us_3EB08E87C502BAB7942482', '556392901378@c.us', NULL, 'text', 'incoming', '🚌 *BEM-VINDO À VIAÇÃO EXPRESSA!*\n\n🎯 *O que você gostaria de fazer?*\n\n1️⃣ 🎫 Comprar Passagem\n2️⃣ 🕐 Consultar Horários\n3️⃣ 📍 Destinos Disponíveis\n4️⃣ 💰 Consultar Preços\n5️⃣ 📞 Falar com Atendente\n6️⃣ ℹ️ Informações da Empresa\n\n*Digite o número da opção:*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1615, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:20', '2025-08-09 20:37:20', '2025-08-09 20:37:22'),
(349, 1, 14, NULL, '556392901378@c.us', NULL, 'text', 'outgoing', '🗺️ *COMPRA DE PASSAGEM*\n\n📍 *Digite a cidade de ORIGEM:*\n\n💡 *Exemplos:*\n• São Paulo\n• Rio de Janeiro\n• Belo Horizonte\n• Brasília\n• Salvador\n\n*Digite apenas o nome da cidade:*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"comprar_origem\", \"system_message\": true}', '2025-08-09 20:37:20', '2025-08-09 20:37:20', '2025-08-09 20:37:20'),
(350, 1, 14, NULL, '556392901378@c.us', NULL, 'text', 'outgoing', '🗺️ *COMPRA DE PASSAGEM*\n\n📍 *Digite a cidade de ORIGEM:*\n\n💡 *Exemplos:*\n• São Paulo\n• Rio de Janeiro\n• Belo Horizonte\n• Brasília\n• Salvador\n\n*Digite apenas o nome da cidade:*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"comprar_origem\", \"system_message\": true}', '2025-08-09 20:37:22', '2025-08-09 20:37:22', '2025-08-09 20:37:22'),
(351, 1, 14, 'true_556392901378@c.us_3EB02774F96374A4B6A8FE_out', '556392901378@c.us', NULL, 'text', 'incoming', '🗺️ *COMPRA DE PASSAGEM*\n\n📍 *Digite a cidade de ORIGEM:*\n\n💡 *Exemplos:*\n• São Paulo\n• Rio de Janeiro\n• Belo Horizonte\n• Brasília\n• Salvador\n\n*Digite apenas o nome da cidade:*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 18, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:22', '2025-08-09 20:37:22', '2025-08-09 20:37:22'),
(352, 1, 14, 'true_556392901378@c.us_3EB07E8009266D1C5366E2_out', '556392901378@c.us', NULL, 'text', 'incoming', '🗺️ *COMPRA DE PASSAGEM*\n\n📍 *Digite a cidade de ORIGEM:*\n\n💡 *Exemplos:*\n• São Paulo\n• Rio de Janeiro\n• Belo Horizonte\n• Brasília\n• Salvador\n\n*Digite apenas o nome da cidade:*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1557, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:24', '2025-08-09 20:37:24', '2025-08-09 20:37:25'),
(353, 1, 14, NULL, '556392901378@c.us', NULL, 'text', 'outgoing', '🎯 *Perfeito!* Origem: *${cidade_origem}*\n\n📍 *Agora digite a cidade de DESTINO:*\n\n💡 *Principais destinos:*\n• São Paulo\n• Rio de Janeiro\n• Belo Horizonte\n• Brasília\n• Salvador\n• Goiânia\n• Curitiba\n\n*Digite o destino:*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"comprar_destino\", \"system_message\": true}', '2025-08-09 20:37:25', '2025-08-09 20:37:25', '2025-08-09 20:37:25'),
(354, 1, 14, 'true_556392901378@c.us_3EB02F6A206A4F180C8EEB_out', '556392901378@c.us', NULL, 'text', 'incoming', '🎯 *Perfeito!* Origem: *${cidade_origem}*\n\n📍 *Agora digite a cidade de DESTINO:*\n\n💡 *Principais destinos:*\n• São Paulo\n• Rio de Janeiro\n• Belo Horizonte\n• Brasília\n• Salvador\n• Goiânia\n• Curitiba\n\n*Digite o destino:*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 12, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:26', '2025-08-09 20:37:26', '2025-08-09 20:37:26'),
(355, 1, 13, 'false_556392410056@c.us_3EB017FBC23D589DC3A274', '556392410056@c.us', NULL, 'text', 'incoming', '1', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 15, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:28', '2025-08-09 20:37:28', '2025-08-09 20:37:28'),
(356, 1, 14, 'true_556392410056@c.us_3EB07BAAF9F6486A2CCA61', '556392901378@c.us', NULL, 'text', 'incoming', 'Example of sending a text message', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1557, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:29', '2025-08-09 20:37:29', '2025-08-09 20:37:30'),
(357, 1, 14, NULL, '556392901378@c.us', NULL, 'text', 'outgoing', '📅 *Rota selecionada:*\n🚌 ${cidade_origem} ➜ ${cidade_destino}\n\n*Digite a data da viagem:*\n\n📋 *Formato: DD/MM/AAAA*\n💡 *Exemplos:*\n• 15/08/2025\n• 20/08/2025\n• 25/08/2025\n\n⚠️ *Mínimo: hoje*\n⚠️ *Máximo: 60 dias*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"comprar_data\", \"system_message\": true}', '2025-08-09 20:37:30', '2025-08-09 20:37:30', '2025-08-09 20:37:30'),
(358, 1, 14, 'true_556392901378@c.us_3EB0EA6924F08F7A20325A_out', '556392901378@c.us', NULL, 'text', 'incoming', '📅 *Rota selecionada:*\n🚌 ${cidade_origem} ➜ ${cidade_destino}\n\n*Digite a data da viagem:*\n\n📋 *Formato: DD/MM/AAAA*\n💡 *Exemplos:*\n• 15/08/2025\n• 20/08/2025\n• 25/08/2025\n\n⚠️ *Mínimo: hoje*\n⚠️ *Máximo: 60 dias*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 13, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:37:31', '2025-08-09 20:37:31', '2025-08-09 20:37:31'),
(359, 1, 13, 'false_556392410056@c.us_3EB007BED7D266C6F48F47', '556392410056@c.us', NULL, 'text', 'incoming', 'Olá', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 14, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:42:45', '2025-08-09 20:42:45', '2025-08-09 20:42:45'),
(360, 1, 14, 'true_556392410056@c.us_3EB03271B4263B84659A85', '556392901378@c.us', NULL, 'text', 'incoming', '🤖 Hi! I am the Ultramsg Whatsapp bot 🥰\r\n	\r\n	➖➖➖➖➖➖➖\r\n	Let me show you what I can do!\r\n	➖➖➖➖➖➖➖\r\n	\r\n	😮 (To select the desired item, simply send me the number in the reply message)\r\n	1 - I\'ll send a text message \r\n	2 - I\'ll send a picture\r\n	3 - I\'ll send a voice  \r\n	4 - I\'ll send an audio  \r\n	5 - I\'ll send a video  \r\n	6 - I\'ll send a document  \r\n	7 - I\'ll send a link  \r\n	8 - I\'ll send a contact   \r\n	9 - I\'ll send the geolocation\r\n	10 - I\'ll send a vcard   \r\n	\r\n	Start testing, I\'m waiting for 👀\r\n	\r\n	You can always return to the main menu: \r\n	🔙 To return to the menu, send me \"#\"', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1604, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:42:46', '2025-08-09 20:42:46', '2025-08-09 20:42:48'),
(361, 1, 14, NULL, '556392901378@c.us', NULL, 'text', 'outgoing', '🎫 *PASSAGENS DISPONÍVEIS*\n\n🚌 *Rota:* ${cidade_origem} ➜ ${cidade_destino}\n📅 *Data:* ${data_viagem}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n*1️⃣ EXECUTIVO - 06:00*\n💺 45 lugares disponíveis\n💰 R$ 85,00\n⏱️ Duração: 6h30min\n\n*2️⃣ CONVENCIONAL - 09:00*\n💺 23 lugares disponíveis\n💰 R$ 65,00\n⏱️ Duração: 7h15min\n\n*3️⃣ EXECUTIVO - 14:00*\n💺 31 lugares disponíveis\n💰 R$ 85,00\n⏱️ Duração: 6h30min\n\n*4️⃣ LEITO - 22:00*\n💺 12 lugares disponíveis\n💰 R$ 120,00\n⏱️ Duração: 8h00min\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n*Digite o número da passagem escolhida:*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"mostrar_passagens\", \"system_message\": true}', '2025-08-09 20:42:48', '2025-08-09 20:42:48', '2025-08-09 20:42:48'),
(362, 1, 14, 'true_556392901378@c.us_3EB0211870DE7627D60C9D_out', '556392901378@c.us', NULL, 'text', 'incoming', '🎫 *PASSAGENS DISPONÍVEIS*\n\n🚌 *Rota:* ${cidade_origem} ➜ ${cidade_destino}\n📅 *Data:* ${data_viagem}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n*1️⃣ EXECUTIVO - 06:00*\n💺 45 lugares disponíveis\n💰 R$ 85,00\n⏱️ Duração: 6h30min\n\n*2️⃣ CONVENCIONAL - 09:00*\n💺 23 lugares disponíveis\n💰 R$ 65,00\n⏱️ Duração: 7h15min\n\n*3️⃣ EXECUTIVO - 14:00*\n💺 31 lugares disponíveis\n💰 R$ 85,00\n⏱️ Duração: 6h30min\n\n*4️⃣ LEITO - 22:00*\n💺 12 lugares disponíveis\n💰 R$ 120,00\n⏱️ Duração: 8h00min\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n*Digite o número da passagem escolhida:*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 16, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-09 20:42:48', '2025-08-09 20:42:48', '2025-08-09 20:42:48'),
(363, 1, 13, 'false_556392410056@c.us_3EB06029AC5F1AB74CD4D2', '556392410056@c.us', NULL, 'text', 'incoming', 'Bom dia', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 2132, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-11 09:13:05', '2025-08-11 09:13:05', '2025-08-11 09:13:07'),
(364, 1, 14, 'true_556392410056@c.us_3EB0EE34747C13FFBE2DA4', '556392901378@c.us', NULL, 'text', 'incoming', '🤖 Hi! I am the Ultramsg Whatsapp bot 🥰\r\n	\r\n	➖➖➖➖➖➖➖\r\n	Let me show you what I can do!\r\n	➖➖➖➖➖➖➖\r\n	\r\n	😮 (To select the desired item, simply send me the number in the reply message)\r\n	1 - I\'ll send a text message \r\n	2 - I\'ll send a picture\r\n	3 - I\'ll send a voice  \r\n	4 - I\'ll send an audio  \r\n	5 - I\'ll send a video  \r\n	6 - I\'ll send a document  \r\n	7 - I\'ll send a link  \r\n	8 - I\'ll send a contact   \r\n	9 - I\'ll send the geolocation\r\n	10 - I\'ll send a vcard   \r\n	\r\n	Start testing, I\'m waiting for 👀\r\n	\r\n	You can always return to the main menu: \r\n	🔙 To return to the menu, send me \"#\"', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1710, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-11 09:13:06', '2025-08-11 09:13:06', '2025-08-11 09:13:08'),
(365, 1, 13, NULL, '556392410056@c.us', NULL, 'text', 'outgoing', '🗺️ *COMPRA DE PASSAGEM*\n\n📍 *Digite a cidade de ORIGEM:*\n\n💡 *Exemplos:*\n• São Paulo\n• Rio de Janeiro\n• Belo Horizonte\n• Brasília\n• Salvador\n\n*Digite apenas o nome da cidade:*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"comprar_origem\", \"system_message\": true}', '2025-08-11 09:13:07', '2025-08-11 09:13:07', '2025-08-11 09:13:07'),
(366, 1, 14, NULL, '556392901378@c.us', NULL, 'text', 'outgoing', '✅ *CONFIRMAÇÃO DA COMPRA*\n\n🎫 *Resumo da Passagem:*\n📍 ${cidade_origem} ➜ ${cidade_destino}\n📅 ${data_viagem}\n🚌 Passagem #${passagem_escolhida}\n\n💳 *Formas de Pagamento:*\n• PIX (5% desconto)\n• Cartão de Crédito (até 3x)\n• Cartão de Débito\n\n*Digite SIM para confirmar a compra:*\n*Digite NÃO para cancelar*\n*Digite MENU para voltar ao início*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"confirmar_compra\", \"system_message\": true}', '2025-08-11 09:13:08', '2025-08-11 09:13:08', '2025-08-11 09:13:08'),
(367, 1, 14, 'true_556392410056@c.us_3EB01F4704D2A7725D15D4', '556392901378@c.us', NULL, 'text', 'incoming', '🗺️ *COMPRA DE PASSAGEM*\n\n📍 *Digite a cidade de ORIGEM:*\n\n💡 *Exemplos:*\n• São Paulo\n• Rio de Janeiro\n• Belo Horizonte\n• Brasília\n• Salvador\n\n*Digite apenas o nome da cidade:*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 34, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-11 09:13:08', '2025-08-11 09:13:08', '2025-08-11 09:13:08'),
(368, 1, 14, 'true_556392901378@c.us_3EB01928B210262914A03C_out', '556392901378@c.us', NULL, 'text', 'incoming', '✅ *CONFIRMAÇÃO DA COMPRA*\n\n🎫 *Resumo da Passagem:*\n📍 ${cidade_origem} ➜ ${cidade_destino}\n📅 ${data_viagem}\n🚌 Passagem #${passagem_escolhida}\n\n💳 *Formas de Pagamento:*\n• PIX (5% desconto)\n• Cartão de Crédito (até 3x)\n• Cartão de Débito\n\n*Digite SIM para confirmar a compra:*\n*Digite NÃO para cancelar*\n*Digite MENU para voltar ao início*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 23, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-11 09:13:09', '2025-08-11 09:13:09', '2025-08-11 09:13:10'),
(369, 1, 13, 'false_556392410056@c.us_3EB039285728E38F9C5D49', '556392410056@c.us', NULL, 'text', 'incoming', 'São Paulo', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 23, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-11 09:13:15', '2025-08-11 09:13:15', '2025-08-11 09:13:15'),
(370, 1, 14, 'true_556392410056@c.us_3EB0DE48FABD2C9865F656', '556392901378@c.us', NULL, 'text', 'incoming', 'I don\'t know this command. To get commands list - return to the menu (#)', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 1701, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-11 09:13:16', '2025-08-11 09:13:16', '2025-08-11 09:13:18'),
(371, 1, 14, NULL, '556392901378@c.us', NULL, 'text', 'outgoing', '🎉 *COMPRA CONFIRMADA!*\n\n✅ *Sua passagem foi reservada:*\n🎫 Código: #PASS${passagem_escolhida}${data_viagem}\n📍 ${cidade_origem} ➜ ${cidade_destino}\n📅 ${data_viagem}\n\n👨‍💼 *Transferindo para atendente...*\n\nEm instantes você será conectado com um operador para:\n• Finalizar pagamento\n• Escolher assento\n• Receber bilhete por email\n• Tirar dúvidas\n\n⏱️ *Aguarde um momento...*', 'text', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, NULL, NULL, '{\"node_id\": \"finalizar_compra\", \"system_message\": true}', '2025-08-11 09:13:18', '2025-08-11 09:13:18', '2025-08-11 09:13:18'),
(372, 1, 14, 'true_556392901378@c.us_3EB01B6793FC49359891C3_out', '556392901378@c.us', NULL, 'text', 'incoming', '🎉 *COMPRA CONFIRMADA!*\n\n✅ *Sua passagem foi reservada:*\n🎫 Código: #PASS${passagem_escolhida}${data_viagem}\n📍 ${cidade_origem} ➜ ${cidade_destino}\n📅 ${data_viagem}\n\n👨‍💼 *Transferindo para atendente...*\n\nEm instantes você será conectado com um operador para:\n• Finalizar pagamento\n• Escolher assento\n• Receber bilhete por email\n• Tirar dúvidas\n\n⏱️ *Aguarde um momento...*', 'text', NULL, NULL, NULL, NULL, NULL, 'delivered', NULL, 1, 16, NULL, '{\"intent\": null, \"entities\": [], \"sentiment\": null, \"ai_generated\": false, \"confidence_score\": null}', '2025-08-11 09:13:18', '2025-08-11 09:13:18', '2025-08-11 09:13:18');

-- --------------------------------------------------------

--
-- Estrutura para tabela `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
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

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','user') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@whatsapp-bot.com', '$2a$12$8ysPAx893DAyP7w.nkn6Ie5ZCCKwbN37FL0JIUCQfA.jlLo4BP3Ea', 'admin', 1, '2025-08-09 20:23:18', '2025-07-29 00:36:08', '2025-08-09 20:23:18'),
(2, 'Usuário Demo', 'demo@whatsapp-bot.com', '$2a$12$xg5hY0gIndkjnyVb894FZ.qfadjWZaHnWHjGPwkzdHpX7R4kTqYOK', 'user', 1, NULL, '2025-07-29 00:36:08', '2025-07-29 00:36:08'),
(10, 'Admin', 'admin@chatbot.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1, NULL, '2025-07-30 19:18:04', '2025-07-30 19:18:04'),
(11, 'erick vinicius', 'erickafram123@gmail.com', '$2a$12$b.Y/AKwo7Ru.hVU4HJElhOKPerTacbK2MyU7boJayPR28oVF3QwK2', 'user', 1, NULL, '2025-07-31 17:04:52', '2025-07-31 17:04:52');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `analytics`
--
ALTER TABLE `analytics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `analytics_bot_id_metric_type_recorded_at` (`bot_id`,`metric_type`,`recorded_at`),
  ADD KEY `analytics_bot_id_recorded_at` (`bot_id`,`recorded_at`),
  ADD KEY `analytics_conversation_id` (`conversation_id`),
  ADD KEY `analytics_flow_id` (`flow_id`),
  ADD KEY `analytics_user_phone_recorded_at` (`user_phone`,`recorded_at`);

--
-- Índices de tabela `bots`
--
ALTER TABLE `bots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD KEY `bots_user_id` (`user_id`);

--
-- Índices de tabela `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `conversations_bot_id_user_phone` (`bot_id`,`user_phone`),
  ADD KEY `current_flow_id` (`current_flow_id`),
  ADD KEY `conversations_bot_id_status` (`bot_id`,`status`),
  ADD KEY `conversations_last_activity_at` (`last_activity_at`);

--
-- Índices de tabela `flows`
--
ALTER TABLE `flows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `flows_bot_id_is_active` (`bot_id`,`is_active`),
  ADD KEY `flows_bot_id_is_default` (`bot_id`,`is_default`);

--
-- Índices de tabela `flow_keywords`
--
ALTER TABLE `flow_keywords`
  ADD PRIMARY KEY (`id`),
  ADD KEY `flow_id` (`flow_id`),
  ADD KEY `keyword` (`keyword`);

--
-- Índices de tabela `flow_nodes`
--
ALTER TABLE `flow_nodes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `flow_nodes_flow_id_node_id` (`flow_id`,`node_id`),
  ADD KEY `flow_nodes_flow_id_node_type` (`flow_id`,`node_type`);

--
-- Índices de tabela `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `whatsapp_message_id` (`whatsapp_message_id`),
  ADD KEY `quoted_message_id` (`quoted_message_id`),
  ADD KEY `messages_conversation_id_timestamp` (`conversation_id`,`timestamp`),
  ADD KEY `messages_whatsapp_message_id` (`whatsapp_message_id`),
  ADD KEY `messages_direction_processed` (`direction`,`processed`),
  ADD KEY `messages_media_type` (`media_type`),
  ADD KEY `bot_id` (`bot_id`),
  ADD KEY `sender_phone` (`sender_phone`);

--
-- Índices de tabela `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `analytics`
--
ALTER TABLE `analytics`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=411;

--
-- AUTO_INCREMENT de tabela `bots`
--
ALTER TABLE `bots`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `flows`
--
ALTER TABLE `flows`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `flow_keywords`
--
ALTER TABLE `flow_keywords`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `flow_nodes`
--
ALTER TABLE `flow_nodes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=373;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
-- Restrições para tabelas `flow_keywords`
--
ALTER TABLE `flow_keywords`
  ADD CONSTRAINT `flow_keywords_ibfk_1` FOREIGN KEY (`flow_id`) REFERENCES `flows` (`id`) ON DELETE CASCADE;

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

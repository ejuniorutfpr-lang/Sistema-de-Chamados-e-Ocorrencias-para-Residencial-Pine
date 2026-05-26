CREATE TABLE `anexos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chamadoId` int NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anexos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `atualizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chamadoId` int NOT NULL,
	`autor` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`statusAnterior` varchar(50),
	`statusNovo` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `atualizacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chamados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`nomeRequerente` varchar(255) NOT NULL,
	`unidade` varchar(50) NOT NULL,
	`contato` varchar(100) NOT NULL,
	`categoria` enum('manutencao','seguranca','limpeza','barulho','areas_comuns','animais','outros') NOT NULL,
	`localizacao` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`status` enum('aberto','em_andamento','resolvido','encerrado') NOT NULL DEFAULT 'aberto',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chamados_id` PRIMARY KEY(`id`),
	CONSTRAINT `chamados_protocolo_unique` UNIQUE(`protocolo`)
);

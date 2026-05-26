import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Chamados ────────────────────────────────────────────────────────────────

export const chamados = mysqlTable("chamados", {
  id: int("id").autoincrement().primaryKey(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),

  // Dados do morador
  nomeRequerente: varchar("nomeRequerente", { length: 255 }).notNull(),
  unidade: varchar("unidade", { length: 50 }).notNull(),
  contato: varchar("contato", { length: 100 }).notNull(),

  // Detalhes da ocorrência
  categoria: mysqlEnum("categoria", [
    "manutencao",
    "seguranca",
    "limpeza",
    "barulho",
    "areas_comuns",
    "animais",
    "outros",
  ]).notNull(),
  localizacao: varchar("localizacao", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),

  // Status
  status: mysqlEnum("status", [
    "aberto",
    "em_andamento",
    "resolvido",
    "encerrado",
  ])
    .default("aberto")
    .notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chamado = typeof chamados.$inferSelect;
export type InsertChamado = typeof chamados.$inferInsert;

// ─── Atualizações / Histórico ─────────────────────────────────────────────────

export const atualizacoes = mysqlTable("atualizacoes", {
  id: int("id").autoincrement().primaryKey(),
  chamadoId: int("chamadoId").notNull(),
  autor: varchar("autor", { length: 255 }).notNull(), // "Síndico" ou nome do admin
  mensagem: text("mensagem").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Atualizacao = typeof atualizacoes.$inferSelect;
export type InsertAtualizacao = typeof atualizacoes.$inferInsert;

// ─── Anexos (S3) ──────────────────────────────────────────────────────────────

export const anexos = mysqlTable("anexos", {
  id: int("id").autoincrement().primaryKey(),
  chamadoId: int("chamadoId").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Anexo = typeof anexos.$inferSelect;
export type InsertAnexo = typeof anexos.$inferInsert;

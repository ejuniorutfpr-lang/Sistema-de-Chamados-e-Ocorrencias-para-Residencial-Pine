import { and, desc, eq, gte, lte, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { anexos, atualizacoes, chamados, InsertAnexo, InsertAtualizacao, InsertChamado, users, InsertUser } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Protocolo ────────────────────────────────────────────────────────────────

export function gerarProtocolo(): string {
  const ano = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `PINE-${ano}-${random}`;
}

// ─── Chamados ────────────────────────────────────────────────────────────────

export async function criarChamado(data: InsertChamado) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(chamados).values(data);
  return result;
}

export async function getChamadoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chamados).where(eq(chamados.id, id)).limit(1);
  return result[0];
}

export async function getChamadoByProtocolo(protocolo: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chamados).where(eq(chamados.protocolo, protocolo)).limit(1);
  return result[0];
}

export type FiltrosChamados = {
  status?: string;
  categoria?: string;
  dataInicio?: Date;
  dataFim?: Date;
  busca?: string;
  page?: number;
  pageSize?: number;
};

export async function listarChamados(filtros: FiltrosChamados = {}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const { status, categoria, dataInicio, dataFim, busca, page = 1, pageSize = 20 } = filtros;

  const conditions = [];
  if (status && status !== "todos") conditions.push(eq(chamados.status, status as any));
  if (categoria && categoria !== "todos") conditions.push(eq(chamados.categoria, categoria as any));
  if (dataInicio) conditions.push(gte(chamados.createdAt, dataInicio));
  if (dataFim) {
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    conditions.push(lte(chamados.createdAt, fim));
  }
  if (busca) {
    conditions.push(
      or(
        like(chamados.protocolo, `%${busca}%`),
        like(chamados.nomeRequerente, `%${busca}%`),
        like(chamados.unidade, `%${busca}%`),
        like(chamados.descricao, `%${busca}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * pageSize;

  const items = await db
    .select()
    .from(chamados)
    .where(where)
    .orderBy(desc(chamados.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Count total
  const allItems = await db.select({ id: chamados.id }).from(chamados).where(where);
  const total = allItems.length;

  return { items, total };
}

export async function atualizarStatusChamado(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(chamados).set({ status: status as any }).where(eq(chamados.id, id));
}

export async function excluirChamado(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(atualizacoes).where(eq(atualizacoes.chamadoId, id));
  await db.delete(anexos).where(eq(anexos.chamadoId, id));
  await db.delete(chamados).where(eq(chamados.id, id));
}

// ─── Atualizações ─────────────────────────────────────────────────────────────

export async function criarAtualizacao(data: InsertAtualizacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(atualizacoes).values(data);
  return result;
}

export async function getAtualizacoesByChamado(chamadoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(atualizacoes)
    .where(eq(atualizacoes.chamadoId, chamadoId))
    .orderBy(atualizacoes.createdAt);
}

// ─── Anexos ───────────────────────────────────────────────────────────────────

export async function criarAnexo(data: InsertAnexo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(anexos).values(data);
  return result;
}

export async function getAnexosByChamado(chamadoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(anexos).where(eq(anexos.chamadoId, chamadoId));
}

// ─── Estatísticas ─────────────────────────────────────────────────────────────

export async function getEstatisticas() {
  const db = await getDb();
  if (!db) return { total: 0, aberto: 0, em_andamento: 0, resolvido: 0, encerrado: 0 };

  const todos = await db.select({ id: chamados.id, status: chamados.status }).from(chamados);
  const total = todos.length;
  const aberto = todos.filter((c) => c.status === "aberto").length;
  const em_andamento = todos.filter((c) => c.status === "em_andamento").length;
  const resolvido = todos.filter((c) => c.status === "resolvido").length;
  const encerrado = todos.filter((c) => c.status === "encerrado").length;

  return { total, aberto, em_andamento, resolvido, encerrado };
}

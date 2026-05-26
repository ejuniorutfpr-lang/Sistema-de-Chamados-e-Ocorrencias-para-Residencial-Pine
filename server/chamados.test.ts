import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock do banco de dados
vi.mock("./db", () => ({
  gerarProtocolo: vi.fn(() => "PINE-2025-123456"),
  getChamadoByProtocolo: vi.fn(async (protocolo: string) => {
    // Retorna chamado para protocolos válidos (não retorna para "PINE-0000-000000")
    if (protocolo.startsWith("PINE-") && protocolo !== "PINE-0000-000000") {
      return {
        id: 1,
        protocolo,
        nomeRequerente: "João Silva",
        unidade: "Apto 101",
        contato: "(11) 99999-9999",
        categoria: "manutencao",
        localizacao: "Elevador",
        descricao: "Elevador com defeito há 3 dias.",
        status: "aberto",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return undefined;
  }),
  criarChamado: vi.fn(async () => [{ insertId: 1 }]),
  getChamadoById: vi.fn(async (id: number) => {
    if (id === 1) {
      return {
        id: 1,
        protocolo: "PINE-2025-999999",
        nomeRequerente: "João Silva",
        unidade: "Apto 101",
        contato: "(11) 99999-9999",
        categoria: "manutencao",
        localizacao: "Elevador",
        descricao: "Elevador com defeito há 3 dias.",
        status: "aberto",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return undefined;
  }),
  getAtualizacoesByChamado: vi.fn(async () => []),
  getAnexosByChamado: vi.fn(async () => []),
  listarChamados: vi.fn(async () => ({ items: [], total: 0 })),
  atualizarStatusChamado: vi.fn(async () => {}),
  criarAtualizacao: vi.fn(async () => [{ insertId: 1 }]),
  excluirChamado: vi.fn(async () => {}),
  getEstatisticas: vi.fn(async () => ({
    total: 5, aberto: 2, em_andamento: 1, resolvido: 1, encerrado: 1,
  })),
  criarAnexo: vi.fn(async () => [{ insertId: 1 }]),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(async () => ({ key: "test-key", url: "/manus-storage/test-key" })),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-open-id",
      name: "Síndico",
      email: "sindico@pine.com",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-open-id",
      name: "Morador",
      email: "morador@pine.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("chamados.criar", () => {
  it("cria um chamado e retorna protocolo", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.chamados.criar({
      nomeRequerente: "Maria Souza",
      unidade: "Apto 202",
      contato: "(11) 98888-8888",
      categoria: "limpeza",
      localizacao: "Área de lazer",
      descricao: "Lixo acumulado na área de lazer há dois dias.",
    });
    expect(result).toHaveProperty("protocolo");
    expect(result.protocolo).toMatch(/^PINE-/);
    expect(result).toHaveProperty("chamadoId");
  });

  it("rejeita descrição muito curta", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.chamados.criar({
        nomeRequerente: "Maria Souza",
        unidade: "Apto 202",
        contato: "(11) 98888-8888",
        categoria: "limpeza",
        localizacao: "Área de lazer",
        descricao: "Curto",
      })
    ).rejects.toThrow();
  });
});

describe("chamados.consultarProtocolo", () => {
  it("retorna chamado existente pelo protocolo", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.chamados.consultarProtocolo({ protocolo: "PINE-2025-999999" });
    expect(result.chamado.protocolo).toBe("PINE-2025-999999");
    expect(result.chamado.nomeRequerente).toBe("João Silva");
    expect(result.historico).toBeInstanceOf(Array);
    expect(result.anexos).toBeInstanceOf(Array);
  });

  it("lança NOT_FOUND para protocolo inexistente", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.chamados.consultarProtocolo({ protocolo: "PINE-0000-000000" })
    ).rejects.toThrow();
  });
});

describe("chamados.listar (admin)", () => {
  it("permite acesso ao admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.chamados.listar({ page: 1, pageSize: 10 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });

  it("bloqueia acesso a usuário comum", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.chamados.listar({ page: 1, pageSize: 10 })
    ).rejects.toThrow();
  });

  it("bloqueia acesso não autenticado", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.chamados.listar({ page: 1, pageSize: 10 })
    ).rejects.toThrow();
  });
});

describe("chamados.estatisticas (admin)", () => {
  it("retorna estatísticas para admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.chamados.estatisticas();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("aberto");
    expect(result).toHaveProperty("em_andamento");
  });
});

describe("chamados.excluir (admin)", () => {
  it("exclui chamado existente", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.chamados.excluir({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("lança NOT_FOUND para chamado inexistente", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.chamados.excluir({ id: 9999 })
    ).rejects.toThrow();
  });
});

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  atualizarStatusChamado,
  criarAnexo,
  criarAtualizacao,
  criarChamado,
  excluirChamado,
  gerarProtocolo,
  getAnexosByChamado,
  getAtualizacoesByChamado,
  getChamadoById,
  getChamadoByProtocolo,
  getEstatisticas,
  listarChamados,
  getDb,
} from "./db";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { verifyPassword, createJWT } from "./auth-helpers";

// ─── Admin guard ──────────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao síndico." });
  }
  return next({ ctx });
});

// ─── Schemas ──────────────────────────────────────────────────────────────────

const CategoriaEnum = z.enum([
  "manutencao",
  "seguranca",
  "limpeza",
  "barulho",
  "areas_comuns",
  "animais",
  "outros",
]);

const StatusEnum = z.enum(["aberto", "em_andamento", "resolvido", "encerrado"]);

// ─── Router ───────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    loginSindico: publicProcedure
      .input(z.object({ senha: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Banco de dados indisponível",
          });
        }

        // Buscar qualquer usuário admin com senhaUnica configurada
        const result = await db.execute(
          `SELECT id, openId, email, name, senhaUnica FROM users WHERE role = 'admin' AND senhaUnica IS NOT NULL LIMIT 1`
        );

        const rows = (result as any[])[0];
        if (!rows || rows.length === 0) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Acesso não configurado",
          });
        }

        const sindico = rows[0];

        // Validar senha
        const senhaValida = await verifyPassword(input.senha, sindico.senhaUnica);
        if (!senhaValida) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha incorreta" });
        }

        // Criar JWT
        const jwtToken = await createJWT({
          userId: sindico.id,
          openId: sindico.openId,
          email: sindico.email,
          name: sindico.name,
          role: "admin",
        });

        // Salvar cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, jwtToken, cookieOptions);

        return { success: true, message: "Login realizado com sucesso" } as const;
      }),
  }),

  // ─── Chamados ──────────────────────────────────────────────────────────────

  chamados: router({
    // Cria um novo chamado (público — moradores não precisam de login)
    criar: publicProcedure
      .input(
        z.object({
          nomeRequerente: z.string().min(3).max(255),
          unidade: z.string().min(1).max(50),
          contato: z.string().min(5).max(100),
          categoria: CategoriaEnum,
          localizacao: z.string().min(3).max(255),
          descricao: z.string().min(10).max(5000),
          anexosIds: z.array(z.number()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        let protocolo = gerarProtocolo();
        // Garante unicidade (retry em colisão)
        let tentativas = 0;
        while (tentativas < 5) {
          const existente = await getChamadoByProtocolo(protocolo);
          if (!existente) break;
          protocolo = gerarProtocolo();
          tentativas++;
        }

        await criarChamado({
          protocolo,
          nomeRequerente: input.nomeRequerente,
          unidade: input.unidade,
          contato: input.contato,
          categoria: input.categoria,
          localizacao: input.localizacao,
          descricao: input.descricao,
          status: "aberto",
        });

        const chamado = await getChamadoByProtocolo(protocolo);
        if (!chamado) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return chamado;
      }),

    // Consulta um chamado pelo protocolo (público)
    consultarProtocolo: publicProcedure
      .input(z.object({ protocolo: z.string() }))
      .query(async ({ input }) => {
        const chamado = await getChamadoByProtocolo(input.protocolo);
        if (!chamado) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chamado não encontrado",
          });
        }

        const atualizacoes = await getAtualizacoesByChamado(chamado.id);
        const anexos = await getAnexosByChamado(chamado.id);

        return { chamado, atualizacoes, anexos };
      }),

    // Lista chamados com filtros (admin)
    listar: adminProcedure
      .input(
        z.object({
          status: z.string().optional(),
          categoria: z.string().optional(),
          busca: z.string().optional(),
          dataInicio: z.string().optional(),
          dataFim: z.string().optional(),
          page: z.number().default(1),
          pageSize: z.number().default(15),
        })
      )
      .query(async ({ input }) => {
        return listarChamados({
          status: input.status,
          categoria: input.categoria,
          busca: input.busca,
          dataInicio: input.dataInicio ? new Date(input.dataInicio) : undefined,
          dataFim: input.dataFim ? new Date(input.dataFim) : undefined,
          page: input.page,
          pageSize: input.pageSize,
        });
      }),

    // Detalha um chamado (admin)
    detalhar: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const chamado = await getChamadoById(input.id);
        if (!chamado) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chamado não encontrado",
          });
        }

        const atualizacoes = await getAtualizacoesByChamado(chamado.id);
        const anexos = await getAnexosByChamado(chamado.id);

        return { chamado, atualizacoes, anexos };
      }),

    // Atualiza status (admin)
    atualizarStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          novoStatus: StatusEnum,
        })
      )
      .mutation(async ({ input }) => {
        const chamado = await getChamadoById(input.id);
        if (!chamado) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chamado não encontrado",
          });
        }

        await atualizarStatusChamado(input.id, input.novoStatus);
        return { success: true };
      }),

    // Adiciona atualização/resposta (admin)
    adicionarAtualizacao: adminProcedure
      .input(
        z.object({
          chamadoId: z.number(),
          mensagem: z.string().min(1).max(5000),
          novoStatus: StatusEnum.optional(),
        })
      )
      .mutation(async ({ input }) => {
        const chamado = await getChamadoById(input.chamadoId);
        if (!chamado) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chamado não encontrado",
          });
        }

        // Atualizar status se fornecido
        if (input.novoStatus && input.novoStatus !== chamado.status) {
          await atualizarStatusChamado(input.chamadoId, input.novoStatus);
        }

        // Criar atualização
        await criarAtualizacao({
          chamadoId: input.chamadoId,
          autor: "Síndico",
          mensagem: input.mensagem,
          statusAnterior: chamado.status,
          statusNovo: input.novoStatus || chamado.status,
        });

        return { success: true };
      }),

    // Exclui chamado (admin)
    excluir: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const chamado = await getChamadoById(input.id);
        if (!chamado) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chamado não encontrado",
          });
        }

        await excluirChamado(input.id);
        return { success: true };
      }),

    // Estatísticas (admin)
    estatisticas: adminProcedure.query(async () => {
      return getEstatisticas();
    }),
  }),

  // ─── Upload ────────────────────────────────────────────────────────────────

  upload: router({
    salvar: publicProcedure
      .input(
        z.object({
          nomeArquivo: z.string(),
          tipoMidia: z.string(),
          dados: z.string(), // base64
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Decodificar base64
          const buffer = Buffer.from(input.dados, "base64");

          // Gerar chave S3
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const chaveS3 = `uploads/${timestamp}-${random}-${input.nomeArquivo}`;

          // Upload para S3
          const { key, url } = await storagePut(chaveS3, buffer, input.tipoMidia);

          return { key, url, success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao fazer upload",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

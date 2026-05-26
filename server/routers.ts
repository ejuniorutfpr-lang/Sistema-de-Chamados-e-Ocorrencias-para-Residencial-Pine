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
} from "./db";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

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

        // Vincular anexos ao chamado
        if (input.anexosIds && input.anexosIds.length > 0) {
          // Anexos já foram criados no upload, apenas atualizamos o chamadoId
          // (feito via upload.vincular abaixo)
        }

        // Notificar o síndico
        try {
          await notifyOwner({
            title: `Novo chamado: ${protocolo}`,
            content: `Morador ${input.nomeRequerente} (Unidade ${input.unidade}) abriu um chamado.\nCategoria: ${input.categoria}\nDescrição: ${input.descricao.substring(0, 200)}`,
          });
        } catch (_) {}

        return { protocolo, chamadoId: chamado.id };
      }),

    // Consulta pública por protocolo
    consultarProtocolo: publicProcedure
      .input(z.object({ protocolo: z.string().min(1) }))
      .query(async ({ input }) => {
        const chamado = await getChamadoByProtocolo(input.protocolo.trim().toUpperCase());
        if (!chamado) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Protocolo não encontrado." });
        }
        const historico = await getAtualizacoesByChamado(chamado.id);
        const arquivos = await getAnexosByChamado(chamado.id);
        return { chamado, historico, anexos: arquivos };
      }),

    // Listagem admin com filtros
    listar: adminProcedure
      .input(
        z.object({
          status: z.string().optional(),
          categoria: z.string().optional(),
          dataInicio: z.string().optional(),
          dataFim: z.string().optional(),
          busca: z.string().optional(),
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(20),
        })
      )
      .query(async ({ input }) => {
        return listarChamados({
          status: input.status,
          categoria: input.categoria,
          dataInicio: input.dataInicio ? new Date(input.dataInicio) : undefined,
          dataFim: input.dataFim ? new Date(input.dataFim) : undefined,
          busca: input.busca,
          page: input.page,
          pageSize: input.pageSize,
        });
      }),

    // Detalhe de um chamado (admin)
    detalhar: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const chamado = await getChamadoById(input.id);
        if (!chamado) throw new TRPCError({ code: "NOT_FOUND" });
        const historico = await getAtualizacoesByChamado(chamado.id);
        const arquivos = await getAnexosByChamado(chamado.id);
        return { chamado, historico, anexos: arquivos };
      }),

    // Adicionar atualização/resposta
    adicionarAtualizacao: adminProcedure
      .input(
        z.object({
          chamadoId: z.number(),
          mensagem: z.string().min(1).max(2000),
          novoStatus: StatusEnum.optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const chamado = await getChamadoById(input.chamadoId);
        if (!chamado) throw new TRPCError({ code: "NOT_FOUND" });

        const statusAnterior = chamado.status;
        if (input.novoStatus && input.novoStatus !== statusAnterior) {
          await atualizarStatusChamado(input.chamadoId, input.novoStatus);
        }

        await criarAtualizacao({
          chamadoId: input.chamadoId,
          autor: ctx.user.name ?? "Síndico",
          mensagem: input.mensagem,
          statusAnterior: input.novoStatus ? statusAnterior : undefined,
          statusNovo: input.novoStatus,
        });

        return { success: true };
      }),

    // Alterar apenas o status
    atualizarStatus: adminProcedure
      .input(z.object({ id: z.number(), status: StatusEnum }))
      .mutation(async ({ input, ctx }) => {
        const chamado = await getChamadoById(input.id);
        if (!chamado) throw new TRPCError({ code: "NOT_FOUND" });

        const statusAnterior = chamado.status;
        await atualizarStatusChamado(input.id, input.status);

        await criarAtualizacao({
          chamadoId: input.id,
          autor: ctx.user.name ?? "Síndico",
          mensagem: `Status alterado de "${statusAnterior}" para "${input.status}".`,
          statusAnterior,
          statusNovo: input.status,
        });

        return { success: true };
      }),

    // Excluir chamado
    excluir: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const chamado = await getChamadoById(input.id);
        if (!chamado) throw new TRPCError({ code: "NOT_FOUND" });
        await excluirChamado(input.id);
        return { success: true };
      }),

    // Estatísticas para o dashboard
    estatisticas: adminProcedure.query(async () => {
      return getEstatisticas();
    }),
  }),

  // ─── Upload ────────────────────────────────────────────────────────────────

  upload: router({
    // Recebe o arquivo em base64 e salva no S3
    salvar: publicProcedure
      .input(
        z.object({
          chamadoId: z.number(),
          fileName: z.string(),
          mimeType: z.string(),
          fileSize: z.number().max(50 * 1024 * 1024), // 50MB
          base64: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const allowed = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ];
        if (!allowed.includes(input.mimeType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tipo de arquivo não permitido.",
          });
        }

        const buffer = Buffer.from(input.base64, "base64");
        const ext = input.fileName.split(".").pop() ?? "bin";
        const fileKey = `chamados/${input.chamadoId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { key, url } = await storagePut(fileKey, buffer, input.mimeType);

        await criarAnexo({
          chamadoId: input.chamadoId,
          fileKey: key,
          fileUrl: url,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
        });

        return { key, url };
      }),
  }),
});

export type AppRouter = typeof appRouter;

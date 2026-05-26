import { useState, useEffect } from "react";
import { useSearch, Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard, FileText, Search, Filter, ChevronLeft, ChevronRight,
  ArrowRight, LogOut, Loader2, AlertTriangle, Trash2, Clock, CheckCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  aberto: { label: "Aberto", className: "status-aberto" },
  em_andamento: { label: "Em Andamento", className: "status-em_andamento" },
  resolvido: { label: "Resolvido", className: "status-resolvido" },
  encerrado: { label: "Encerrado", className: "status-encerrado" },
};

const categoriaLabel: Record<string, string> = {
  manutencao: "🔧 Manutenção",
  seguranca: "🔒 Segurança",
  limpeza: "🧹 Limpeza",
  barulho: "🔊 Barulho",
  areas_comuns: "🏊 Áreas Comuns",
  animais: "🐾 Animais",
  outros: "📋 Outros",
};

export default function AdminChamados() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [filtroStatus, setFiltroStatus] = useState(params.get("status") ?? "todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [page, setPage] = useState(1);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data, isLoading, refetch } = trpc.chamados.listar.useQuery(
    {
      status: filtroStatus === "todos" ? undefined : filtroStatus,
      categoria: filtroCategoria === "todos" ? undefined : filtroCategoria,
      busca: buscaAtiva || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      page,
      pageSize: 15,
    },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const excluirMutation = trpc.chamados.excluir.useMutation({
    onSuccess: () => {
      toast.success("Chamado excluído com sucesso.");
      utils.chamados.listar.invalidate();
      utils.chamados.estatisticas.invalidate();
      setDeletandoId(null);
    },
    onError: () => {
      toast.error("Erro ao excluir chamado.");
      setDeletandoId(null);
    },
  });

  const handleExcluir = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.")) return;
    setDeletandoId(id);
    excluirMutation.mutate({ id });
  };

  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pine-400" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 card-shadow text-center max-w-sm w-full">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="font-serif text-xl text-pine-950 mb-2">Acesso Restrito</h2>
          <p className="text-pine-500 text-sm mb-6">Faça login como síndico para acessar esta área.</p>
          <a href={getLoginUrl()}>
            <Button className="pine-gradient text-white hover:opacity-90 w-full">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-pine-950 fixed left-0 top-0 bottom-0">
        <div className="p-6 border-b border-pine-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-pine-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-serif font-bold">P</span>
            </div>
            <div>
              <p className="text-white font-serif font-semibold text-sm">Residencial Pine</p>
              <p className="text-pine-400 text-xs">Painel do Síndico</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-pine-400 hover:bg-pine-800 hover:text-white text-sm font-medium transition-all cursor-pointer">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </div>
          </Link>
          <Link href="/admin/chamados">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pine-800 text-white text-sm font-medium cursor-pointer">
              <FileText className="w-4 h-4" />
              Todos os Chamados
            </div>
          </Link>
        </nav>
        <div className="p-4 border-t border-pine-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-pine-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase() ?? "S"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.name ?? "Síndico"}</p>
              <p className="text-pine-400 text-xs">Administrador</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-pine-400 hover:text-red-400 text-xs transition-colors w-full">
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <header className="bg-white border-b border-pine-200/60 lg:hidden sticky top-0 z-40">
          <div className="container flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <button className="text-pine-400 hover:text-pine-700 mr-2">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </Link>
              <span className="font-serif font-semibold text-pine-900 text-sm">Chamados</span>
            </div>
            <button onClick={logout} className="text-pine-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-3xl text-pine-950 mb-1">Chamados</h1>
              <p className="text-pine-500 text-sm">
                {data ? `${data.total} chamado${data.total !== 1 ? "s" : ""} encontrado${data.total !== 1 ? "s" : ""}` : "Carregando..."}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl p-5 card-shadow mb-5 space-y-4">
            {/* Busca */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pine-400" />
                <Input
                  value={filtroBusca}
                  onChange={(e) => setFiltroBusca(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { setBuscaAtiva(filtroBusca); setPage(1); } }}
                  placeholder="Buscar por protocolo, nome, unidade..."
                  className="pl-9 border-pine-200 focus:border-pine-500 h-10"
                />
              </div>
              <Button
                onClick={() => { setBuscaAtiva(filtroBusca); setPage(1); }}
                className="pine-gradient text-white hover:opacity-90 h-10 px-5"
              >
                Buscar
              </Button>
            </div>

            {/* Filtros de data */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-pine-500 text-xs font-medium">Período:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => { setDataInicio(e.target.value); setPage(1); }}
                  className="h-8 px-2 rounded-lg border border-pine-200 text-pine-700 text-xs focus:outline-none focus:border-pine-500"
                />
                <span className="text-pine-400 text-xs">até</span>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => { setDataFim(e.target.value); setPage(1); }}
                  className="h-8 px-2 rounded-lg border border-pine-200 text-pine-700 text-xs focus:outline-none focus:border-pine-500"
                />
                {(dataInicio || dataFim) && (
                  <button
                    onClick={() => { setDataInicio(""); setDataFim(""); setPage(1); }}
                    className="text-pine-400 hover:text-red-500 text-xs transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Filtros de status e categoria */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-pine-400" />
                <span className="text-pine-500 text-xs font-medium">Status:</span>
              </div>
              {["todos", "aberto", "em_andamento", "resolvido", "encerrado"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setFiltroStatus(s); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filtroStatus === s
                      ? "pine-gradient text-white shadow-sm"
                      : "bg-pine-50 text-pine-600 hover:bg-pine-100"
                  }`}
                >
                  {s === "todos" ? "Todos" : statusConfig[s]?.label ?? s}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-pine-400" />
                <span className="text-pine-500 text-xs font-medium">Categoria:</span>
              </div>
              {["todos", "manutencao", "seguranca", "limpeza", "barulho", "areas_comuns", "animais", "outros"].map((c) => (
                <button
                  key={c}
                  onClick={() => { setFiltroCategoria(c); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filtroCategoria === c
                      ? "pine-gradient text-white shadow-sm"
                      : "bg-pine-50 text-pine-600 hover:bg-pine-100"
                  }`}
                >
                  {c === "todos" ? "Todas" : categoriaLabel[c]?.replace(/^\S+\s/, "") ?? c}
                </button>
              ))}
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            {isLoading ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-pine-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : data?.items.length === 0 ? (
              <div className="py-20 text-center">
                <FileText className="w-10 h-10 text-pine-200 mx-auto mb-3" />
                <p className="text-pine-400 font-medium">Nenhum chamado encontrado</p>
                <p className="text-pine-300 text-sm mt-1">Tente ajustar os filtros.</p>
              </div>
            ) : (
              <>
                {/* Header da tabela — desktop */}
                <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 bg-pine-50 border-b border-pine-100 text-xs font-semibold text-pine-400 uppercase tracking-wider">
                  <span>Protocolo</span>
                  <span>Morador / Descrição</span>
                  <span>Categoria</span>
                  <span>Status</span>
                  <span>Data</span>
                  <span></span>
                </div>

                <div className="divide-y divide-pine-50">
                  {data?.items.map((c) => (
                    <Link key={c.id} href={`/admin/chamados/${c.id}`}>
                      <div className="flex md:grid md:grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-pine-50/50 transition-colors cursor-pointer group">
                        <span className="font-mono text-xs text-pine-500 hidden md:block">{c.protocolo}</span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-xs text-pine-400 md:hidden">{c.protocolo}</span>
                          </div>
                          <p className="text-pine-800 text-sm font-medium truncate">{c.nomeRequerente}</p>
                          <p className="text-pine-400 text-xs truncate">{c.unidade} · {c.descricao.substring(0, 60)}...</p>
                        </div>

                        <span className="hidden md:block text-xs text-pine-500">
                          {categoriaLabel[c.categoria]?.replace(/^\S+\s/, "") ?? c.categoria}
                        </span>

                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statusConfig[c.status]?.className ?? ""}`}>
                          {statusConfig[c.status]?.label ?? c.status}
                        </span>

                        <span className="hidden md:block text-xs text-pine-400 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                        </span>

                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-pine-300 group-hover:text-pine-600 transition-colors" />
                          <button
                            onClick={(e) => handleExcluir(c.id, e)}
                            disabled={deletandoId === c.id}
                            className="p-1.5 rounded-lg text-pine-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            {deletandoId === c.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-pine-100">
                    <p className="text-pine-400 text-xs">
                      Página {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="border-pine-200 text-pine-600 h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="border-pine-200 text-pine-600 h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

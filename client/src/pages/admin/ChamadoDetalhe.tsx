import { useState } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard, FileText, ArrowLeft, LogOut, Loader2, AlertTriangle,
  Send, Trash2, CheckCircle, Clock, XCircle, ChevronRight, FileImage, FileVideo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLocation } from "wouter";

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  aberto: { label: "Aberto", className: "status-aberto", icon: AlertTriangle },
  em_andamento: { label: "Em Andamento", className: "status-em_andamento", icon: Clock },
  resolvido: { label: "Resolvido", className: "status-resolvido", icon: CheckCircle },
  encerrado: { label: "Encerrado", className: "status-encerrado", icon: XCircle },
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

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminChamadoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const chamadoId = parseInt(id ?? "0");
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const [mensagem, setMensagem] = useState("");
  const [novoStatus, setNovoStatus] = useState<string>("");

  const utils = trpc.useUtils();

  const { data, isLoading, refetch } = trpc.chamados.detalhar.useQuery(
    { id: chamadoId },
    { enabled: isAuthenticated && user?.role === "admin" && chamadoId > 0 }
  );

  const atualizarMutation = trpc.chamados.adicionarAtualizacao.useMutation({
    onSuccess: () => {
      toast.success("Atualização enviada com sucesso.");
      setMensagem("");
      setNovoStatus("");
      refetch();
      utils.chamados.listar.invalidate();
      utils.chamados.estatisticas.invalidate();
    },
    onError: () => toast.error("Erro ao enviar atualização."),
  });

  const excluirMutation = trpc.chamados.excluir.useMutation({
    onSuccess: () => {
      toast.success("Chamado excluído.");
      navigate("/admin/chamados");
    },
    onError: () => toast.error("Erro ao excluir chamado."),
  });

  const handleEnviar = () => {
    if (!mensagem.trim()) {
      toast.error("Digite uma mensagem antes de enviar.");
      return;
    }
    atualizarMutation.mutate({
      chamadoId,
      mensagem: mensagem.trim(),
      novoStatus: novoStatus ? (novoStatus as any) : undefined,
    });
  };

  const handleExcluir = () => {
    if (!confirm("Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.")) return;
    excluirMutation.mutate({ id: chamadoId });
  };

  if (loading || isLoading) {
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
          <a href={getLoginUrl()}>
            <Button className="pine-gradient text-white hover:opacity-90 w-full mt-4">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-pine-500 mb-4">Chamado não encontrado.</p>
          <Link href="/admin/chamados">
            <Button className="pine-gradient text-white">Voltar</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cfg = statusConfig[data.chamado.status];

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
            <Link href="/admin/chamados">
              <button className="flex items-center gap-1.5 text-pine-600 hover:text-pine-900 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                Chamados
              </button>
            </Link>
            <button onClick={logout} className="text-pine-400 hover:text-red-500">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-4xl">
          {/* Breadcrumb desktop */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-pine-400 mb-6">
            <Link href="/admin/chamados">
              <span className="hover:text-pine-700 cursor-pointer">Chamados</span>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-pine-700 font-medium">{data.chamado.protocolo}</span>
          </div>

          {/* Cabeçalho do chamado */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-sm text-pine-400">{data.chamado.protocolo}</span>
                {cfg && (
                  <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${cfg.className}`}>
                    <cfg.icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-2xl md:text-3xl text-pine-950">
                Chamado de {data.chamado.nomeRequerente}
              </h1>
              <p className="text-pine-400 text-sm mt-1">
                Aberto em {formatDate(data.chamado.createdAt)}
              </p>
            </div>
            <Button
              onClick={handleExcluir}
              disabled={excluirMutation.isPending}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 flex-shrink-0"
            >
              {excluirMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="ml-1.5 hidden sm:inline">Excluir</span>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Coluna principal */}
            <div className="lg:col-span-2 space-y-5">
              {/* Dados do chamado */}
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h2 className="font-serif text-lg text-pine-900 mb-4 pb-3 border-b border-pine-100">
                  Detalhes da Ocorrência
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-pine-400 text-xs font-medium mb-1">Categoria</p>
                    <p className="text-pine-800 text-sm">{categoriaLabel[data.chamado.categoria] ?? data.chamado.categoria}</p>
                  </div>
                  <div>
                    <p className="text-pine-400 text-xs font-medium mb-1">Localização</p>
                    <p className="text-pine-800 text-sm">{data.chamado.localizacao}</p>
                  </div>
                </div>
                <div>
                  <p className="text-pine-400 text-xs font-medium mb-2">Descrição</p>
                  <p className="text-pine-700 text-sm leading-relaxed bg-pine-50 rounded-xl p-4">
                    {data.chamado.descricao}
                  </p>
                </div>
              </div>

              {/* Anexos */}
              {data.anexos.length > 0 && (
                <div className="bg-white rounded-2xl p-6 card-shadow">
                  <h2 className="font-serif text-lg text-pine-900 mb-4">Anexos</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {data.anexos.map((anexo) => (
                      <a
                        key={anexo.id}
                        href={anexo.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative rounded-xl overflow-hidden border border-pine-200 hover:border-pine-400 transition-all aspect-square bg-pine-50 flex items-center justify-center"
                      >
                        {anexo.mimeType.startsWith("image/") ? (
                          <img src={anexo.fileUrl} alt={anexo.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 p-3">
                            <FileVideo className="w-8 h-8 text-pine-400" />
                            <span className="text-pine-500 text-xs text-center truncate w-full">{anexo.fileName}</span>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Histórico */}
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h2 className="font-serif text-lg text-pine-900 mb-5">Histórico</h2>

                {data.historico.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-pine-200 mx-auto mb-3" />
                    <p className="text-pine-400 text-sm">Nenhuma atualização ainda.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-pine-100" />
                    <div className="space-y-5">
                      {data.historico.map((item, i) => {
                        const isLast = i === data.historico.length - 1;
                        return (
                          <div key={item.id} className="flex gap-4 relative">
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${isLast ? "pine-gradient" : "bg-pine-100"}`}>
                              {isLast ? (
                                <ChevronRight className="w-4 h-4 text-white" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-pine-400" />
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium text-pine-800 text-sm">{item.autor}</span>
                                <span className="text-pine-400 text-xs">{formatDate(item.createdAt)}</span>
                                {item.statusNovo && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[item.statusNovo]?.className ?? ""}`}>
                                    {statusConfig[item.statusNovo]?.label ?? item.statusNovo}
                                  </span>
                                )}
                              </div>
                              <div className="bg-pine-50 rounded-xl p-4 border border-pine-100">
                                <p className="text-pine-700 text-sm leading-relaxed">{item.mensagem}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Adicionar atualização */}
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h2 className="font-serif text-lg text-pine-900 mb-4">Adicionar Resposta / Atualização</h2>

                <div className="space-y-4">
                  {/* Alterar status */}
                  <div>
                    <p className="text-pine-600 text-sm font-medium mb-2">Alterar status (opcional)</p>
                    <div className="flex flex-wrap gap-2">
                      {["", "aberto", "em_andamento", "resolvido", "encerrado"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNovoStatus(s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            novoStatus === s
                              ? "pine-gradient text-white shadow-sm"
                              : "bg-pine-50 text-pine-600 hover:bg-pine-100 border border-pine-200"
                          }`}
                        >
                          {s === "" ? "Manter status atual" : statusConfig[s]?.label ?? s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite sua resposta ou atualização para o morador..."
                    rows={4}
                    className="border-pine-200 focus:border-pine-500 resize-none"
                  />

                  <Button
                    onClick={handleEnviar}
                    disabled={atualizarMutation.isPending || !mensagem.trim()}
                    className="pine-gradient text-white hover:opacity-90 w-full h-11"
                  >
                    {atualizarMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Enviar Atualização
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar direita — dados do morador */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h3 className="font-serif text-lg text-pine-900 mb-4 pb-3 border-b border-pine-100">
                  Dados do Morador
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-pine-400 text-xs font-medium mb-0.5">Nome</p>
                    <p className="text-pine-800 text-sm font-medium">{data.chamado.nomeRequerente}</p>
                  </div>
                  <div>
                    <p className="text-pine-400 text-xs font-medium mb-0.5">Unidade</p>
                    <p className="text-pine-800 text-sm">{data.chamado.unidade}</p>
                  </div>
                  <div>
                    <p className="text-pine-400 text-xs font-medium mb-0.5">Contato</p>
                    <p className="text-pine-800 text-sm">{data.chamado.contato}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h3 className="font-serif text-lg text-pine-900 mb-4 pb-3 border-b border-pine-100">
                  Status Atual
                </h3>
                {cfg && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${cfg.className}`}>
                    <cfg.icon className="w-4 h-4" />
                    {cfg.label}
                  </div>
                )}
                <p className="text-pine-400 text-xs mt-3">
                  Última atualização: {formatDate(data.chamado.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

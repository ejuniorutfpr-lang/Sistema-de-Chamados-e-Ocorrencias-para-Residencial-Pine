import { useState, useEffect } from "react";
import { useSearch, Link } from "wouter";
import { Search, ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle, FileImage, FileVideo, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  aberto: { label: "Aberto", icon: AlertCircle, className: "status-aberto" },
  em_andamento: { label: "Em Andamento", icon: Clock, className: "status-em_andamento" },
  resolvido: { label: "Resolvido", icon: CheckCircle, className: "status-resolvido" },
  encerrado: { label: "Encerrado", icon: XCircle, className: "status-encerrado" },
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

export default function ConsultarProtocolo() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const protocoloInicial = params.get("protocolo") ?? "";

  const [protocolo, setProtocolo] = useState(protocoloInicial);
  const [busca, setBusca] = useState(protocoloInicial);

  const { data, isLoading, error, refetch } = trpc.chamados.consultarProtocolo.useQuery(
    { protocolo: busca },
    { enabled: busca.length > 0, retry: false }
  );

  useEffect(() => {
    if (protocoloInicial) setBusca(protocoloInicial);
  }, [protocoloInicial]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (protocolo.trim()) setBusca(protocolo.trim().toUpperCase());
  };

  const cfg = data ? statusConfig[data.chamado.status] : null;

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-pine-200/60 sticky top-0 z-40">
        <div className="container flex items-center h-16 gap-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-pine-600 hover:text-pine-900 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </Link>
          <div className="h-5 w-px bg-pine-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 pine-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-serif font-bold text-xs">P</span>
            </div>
            <span className="font-serif font-semibold text-pine-900">Consultar Protocolo</span>
          </div>
        </div>
      </header>

      <main className="container py-10 max-w-2xl">
        {/* Título */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-pine-950 mb-2">
            Consultar Chamado
          </h1>
          <p className="text-pine-500">
            Informe o número de protocolo para visualizar o status e o histórico do seu chamado.
          </p>
        </div>

        {/* Formulário de busca */}
        <form onSubmit={handleBuscar} className="flex gap-3 mb-8">
          <Input
            value={protocolo}
            onChange={(e) => setProtocolo(e.target.value.toUpperCase())}
            placeholder="Ex: PINE-2025-123456"
            className="border-pine-200 focus:border-pine-500 h-12 font-mono text-pine-800 flex-1"
          />
          <Button
            type="submit"
            className="pine-gradient text-white hover:opacity-90 h-12 px-6"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="ml-2 hidden sm:inline">Buscar</span>
          </Button>
        </form>

        {/* Estado de carregamento */}
        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-pine-400 mx-auto mb-3" />
            <p className="text-pine-500">Buscando chamado...</p>
          </div>
        )}

        {/* Erro */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-medium mb-1">Protocolo não encontrado</p>
            <p className="text-red-500 text-sm">
              Verifique o número digitado e tente novamente.
            </p>
          </div>
        )}

        {/* Resultado */}
        {data && !isLoading && cfg && (
          <div className="space-y-5 animate-fade-up">
            {/* Card principal */}
            <div className="bg-white rounded-2xl p-7 card-shadow">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-pine-400 text-xs font-semibold uppercase tracking-widest mb-1">Protocolo</p>
                  <p className="font-mono font-bold text-pine-900 text-xl">{data.chamado.protocolo}</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.className}`}>
                  <cfg.icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-5 border-t border-pine-100">
                <div>
                  <p className="text-pine-400 text-xs font-medium mb-1">Morador</p>
                  <p className="text-pine-800 text-sm font-medium">{data.chamado.nomeRequerente}</p>
                </div>
                <div>
                  <p className="text-pine-400 text-xs font-medium mb-1">Unidade</p>
                  <p className="text-pine-800 text-sm font-medium">{data.chamado.unidade}</p>
                </div>
                <div>
                  <p className="text-pine-400 text-xs font-medium mb-1">Categoria</p>
                  <p className="text-pine-800 text-sm font-medium">{categoriaLabel[data.chamado.categoria] ?? data.chamado.categoria}</p>
                </div>
                <div>
                  <p className="text-pine-400 text-xs font-medium mb-1">Localização</p>
                  <p className="text-pine-800 text-sm font-medium">{data.chamado.localizacao}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-pine-400 text-xs font-medium mb-1">Aberto em</p>
                  <p className="text-pine-800 text-sm">{formatDate(data.chamado.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-pine-400 text-xs font-medium mb-2">Descrição</p>
                  <p className="text-pine-700 text-sm leading-relaxed bg-pine-50 rounded-xl p-4">
                    {data.chamado.descricao}
                  </p>
                </div>
              </div>
            </div>

            {/* Anexos */}
            {data.anexos.length > 0 && (
              <div className="bg-white rounded-2xl p-7 card-shadow">
                <h3 className="font-serif text-lg text-pine-900 mb-4">Anexos</h3>
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
            <div className="bg-white rounded-2xl p-7 card-shadow">
              <h3 className="font-serif text-lg text-pine-900 mb-5">Histórico de Atualizações</h3>

              {data.historico.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-pine-200 mx-auto mb-3" />
                  <p className="text-pine-400 text-sm">Nenhuma atualização ainda.</p>
                  <p className="text-pine-300 text-xs mt-1">O síndico responderá em breve.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Linha vertical */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-pine-100" />

                  <div className="space-y-6">
                    {data.historico.map((item, i) => {
                      const isLast = i === data.historico.length - 1;
                      return (
                        <div key={item.id} className="flex gap-4 relative">
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${
                            isLast ? "pine-gradient" : "bg-pine-100"
                          }`}>
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
          </div>
        )}

        {/* Estado inicial (sem busca) */}
        {!busca && !isLoading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 pine-gradient rounded-2xl flex items-center justify-center mx-auto mb-5 opacity-20">
              <Search className="w-7 h-7 text-white" />
            </div>
            <p className="text-pine-400 text-sm">Digite o número do protocolo para consultar seu chamado.</p>
          </div>
        )}
      </main>
    </div>
  );
}

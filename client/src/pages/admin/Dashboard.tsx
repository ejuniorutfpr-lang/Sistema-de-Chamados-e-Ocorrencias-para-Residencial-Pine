import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { LayoutDashboard, FileText, Clock, CheckCircle, XCircle, ArrowRight, LogOut, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
  color: string;
  href?: string;
}) {
  const content = (
    <div className={`bg-white rounded-2xl p-6 card-shadow border-l-4 ${color} hover:shadow-md transition-all group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-pine-400 text-xs font-semibold uppercase tracking-widest mb-2">{label}</p>
          <p className="font-serif text-4xl font-bold text-pine-950">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.replace("border-", "bg-").replace("-500", "-100")}`}>
          <Icon className={`w-5 h-5 ${color.replace("border-", "text-")}`} />
        </div>
      </div>
      {href && (
        <div className="mt-4 flex items-center gap-1 text-pine-400 text-xs group-hover:text-pine-600 transition-colors">
          Ver chamados
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default function AdminDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  const { data: stats, isLoading: statsLoading } = trpc.chamados.estatisticas.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: recentes, isLoading: recentesLoading } = trpc.chamados.listar.useQuery(
    { page: 1, pageSize: 5 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pine-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 card-shadow-lg text-center max-w-sm w-full">
          <div className="w-14 h-14 pine-gradient rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-white font-serif font-bold text-xl">P</span>
          </div>
          <h1 className="font-serif text-2xl text-pine-950 mb-2">Área do Síndico</h1>
          <p className="text-pine-500 text-sm mb-7">
            Faça login para acessar o painel administrativo do Residencial Pine.
          </p>
          <a href={getLoginUrl("/admin")}>
            <Button className="w-full pine-gradient text-white hover:opacity-90 h-11">
              Entrar com Manus
            </Button>
          </a>
          <Link href="/">
            <Button variant="ghost" className="w-full mt-3 text-pine-500 hover:text-pine-700">
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 card-shadow text-center max-w-sm w-full">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="font-serif text-xl text-pine-950 mb-2">Acesso Restrito</h2>
          <p className="text-pine-500 text-sm mb-6">
            Esta área é exclusiva para o síndico do Residencial Pine.
          </p>
          <Link href="/">
            <Button className="pine-gradient text-white hover:opacity-90 w-full">
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = [
    { label: "Total de Chamados", value: stats?.total ?? 0, icon: FileText, color: "border-pine-500", href: "/admin/chamados" },
    { label: "Abertos", value: stats?.aberto ?? 0, icon: AlertTriangle, color: "border-blue-500", href: "/admin/chamados?status=aberto" },
    { label: "Em Andamento", value: stats?.em_andamento ?? 0, icon: Clock, color: "border-amber-500", href: "/admin/chamados?status=em_andamento" },
    { label: "Resolvidos", value: stats?.resolvido ?? 0, icon: CheckCircle, color: "border-emerald-500", href: "/admin/chamados?status=resolvido" },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Sidebar + Layout */}
      <div className="flex">
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
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pine-800 text-white text-sm font-medium cursor-pointer">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </div>
            </Link>
            <Link href="/admin/chamados">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-pine-400 hover:bg-pine-800 hover:text-white text-sm font-medium transition-all cursor-pointer">
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
            <button
              onClick={logout}
              className="flex items-center gap-2 text-pine-400 hover:text-red-400 text-xs transition-colors w-full"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64">
          {/* Top bar mobile */}
          <header className="bg-white border-b border-pine-200/60 lg:hidden sticky top-0 z-40">
            <div className="container flex items-center justify-between h-14">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 pine-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-serif font-bold text-xs">P</span>
                </div>
                <span className="font-serif font-semibold text-pine-900 text-sm">Painel do Síndico</span>
              </div>
              <button onClick={logout} className="text-pine-400 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            {/* Cabeçalho */}
            <div className="mb-8">
              <h1 className="font-serif text-3xl text-pine-950 mb-1">Dashboard</h1>
              <p className="text-pine-500 text-sm">
                Bem-vindo, {user.name ?? "Síndico"}. Aqui está o resumo dos chamados.
              </p>
            </div>

            {/* Stats */}
            {statsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 card-shadow animate-pulse">
                    <div className="h-3 bg-pine-100 rounded w-20 mb-3" />
                    <div className="h-8 bg-pine-100 rounded w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statusConfig.map((s) => (
                  <StatCard key={s.label} {...s} />
                ))}
              </div>
            )}

            {/* Chamados recentes */}
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-pine-100">
                <h2 className="font-serif text-xl text-pine-900">Chamados Recentes</h2>
                <Link href="/admin/chamados">
                  <Button variant="ghost" size="sm" className="text-pine-500 hover:text-pine-800 text-xs">
                    Ver todos
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              {recentesLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-pine-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentes?.items.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="w-8 h-8 text-pine-200 mx-auto mb-3" />
                  <p className="text-pine-400 text-sm">Nenhum chamado registrado ainda.</p>
                </div>
              ) : (
                <div className="divide-y divide-pine-50">
                  {recentes?.items.map((c) => {
                    const statusMap: Record<string, string> = {
                      aberto: "status-aberto",
                      em_andamento: "status-em_andamento",
                      resolvido: "status-resolvido",
                      encerrado: "status-encerrado",
                    };
                    const statusLabel: Record<string, string> = {
                      aberto: "Aberto",
                      em_andamento: "Em Andamento",
                      resolvido: "Resolvido",
                      encerrado: "Encerrado",
                    };
                    return (
                      <Link key={c.id} href={`/admin/chamados/${c.id}`}>
                        <div className="flex items-center gap-4 px-6 py-4 hover:bg-pine-50/50 transition-colors cursor-pointer">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-xs text-pine-400">{c.protocolo}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusMap[c.status]}`}>
                                {statusLabel[c.status]}
                              </span>
                            </div>
                            <p className="text-pine-800 text-sm font-medium truncate">{c.nomeRequerente}</p>
                            <p className="text-pine-400 text-xs truncate">{c.descricao}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-pine-400 text-xs">
                              {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                            <ArrowRight className="w-4 h-4 text-pine-300 mt-1 ml-auto" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

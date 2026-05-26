import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function LoginSindico() {
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [, navigate] = useLocation();

  const loginMutation = trpc.auth.loginSindico.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      navigate("/admin");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Senha incorreta");
      setSenha("");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senha.trim()) {
      toast.error("Digite a senha");
      return;
    }

    setCarregando(true);
    try {
      await loginMutation.mutateAsync({ senha });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pine-50 to-pine-100 px-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pine-600 to-pine-700 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-pine-900 mb-2 font-playfair">
            Área do Síndico
          </h1>
          <p className="text-center text-pine-600 text-sm mb-8">
            Digite a senha para acessar o painel administrativo
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de Senha */}
            <div className="relative">
              <label className="block text-sm font-medium text-pine-700 mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite a senha"
                  disabled={carregando}
                  className="pr-10 h-11 text-base"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pine-500 hover:text-pine-700 transition-colors"
                >
                  {mostrarSenha ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={carregando || !senha.trim()}
              className="w-full h-11 bg-pine-600 hover:bg-pine-700 text-white font-semibold transition-all"
            >
              {carregando ? "Entrando..." : "Entrar no Painel"}
            </Button>
          </form>

          {/* Aviso de Segurança */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Use um computador seguro e pessoal. Não compartilhe a senha com ninguém.
            </p>
          </div>

          {/* Rodapé */}
          <p className="text-center text-xs text-pine-500 mt-8">
            Sistema Pine Chamados © 2026
          </p>
        </div>
      </Card>
    </div>
  );
}

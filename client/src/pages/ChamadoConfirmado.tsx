import { Link, useParams } from "wouter";
import { CheckCircle, Copy, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ChamadoConfirmado() {
  const params = useParams<{ protocolo: string }>();
  const protocolo = params.protocolo ?? "";

  const copiar = () => {
    navigator.clipboard.writeText(protocolo).then(() => {
      toast.success("Protocolo copiado!");
    });
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-pine-200/60">
        <div className="container flex items-center h-16 gap-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-pine-600 hover:text-pine-900 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Início
            </button>
          </Link>
          <div className="h-5 w-px bg-pine-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 pine-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-serif font-bold text-xs">P</span>
            </div>
            <span className="font-serif font-semibold text-pine-900">Chamado Registrado</span>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full text-center animate-fade-up">
          {/* Ícone de sucesso */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>

          <h1 className="font-serif text-3xl md:text-4xl text-pine-950 mb-3">
            Chamado Aberto!
          </h1>
          <p className="text-pine-500 mb-10 text-lg">
            Seu chamado foi registrado com sucesso. Guarde o número de protocolo abaixo para acompanhar o andamento.
          </p>

          {/* Card do protocolo */}
          <div className="bg-white rounded-2xl p-8 card-shadow-lg mb-8">
            <p className="text-pine-400 text-sm font-medium mb-3 uppercase tracking-widest">
              Número de Protocolo
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="font-serif text-2xl md:text-3xl font-bold text-pine-900 tracking-wider">
                {protocolo}
              </span>
              <button
                onClick={copiar}
                className="p-2 rounded-lg bg-pine-50 hover:bg-pine-100 text-pine-500 hover:text-pine-700 transition-all"
                title="Copiar protocolo"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Status: Aberto
            </div>
          </div>

          <div className="bg-gold-100/60 rounded-xl p-5 mb-8 border border-gold-300/40 text-left">
            <p className="text-pine-700 text-sm font-medium mb-1">📌 Guarde este protocolo</p>
            <p className="text-pine-500 text-sm leading-relaxed">
              Você pode consultar o status e as respostas do síndico a qualquer momento usando este número. Recomendamos anotar ou tirar um print desta tela.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/consultar?protocolo=${protocolo}`} className="flex-1">
              <Button size="lg" className="w-full pine-gradient text-white hover:opacity-90 h-12">
                <Search className="w-4 h-4 mr-2" />
                Acompanhar Chamado
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button size="lg" variant="outline" className="w-full border-pine-300 text-pine-700 hover:bg-pine-50 h-12 bg-white">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

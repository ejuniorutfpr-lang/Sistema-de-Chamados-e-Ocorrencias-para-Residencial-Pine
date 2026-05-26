import { Link } from "wouter";
import { ArrowRight, Shield, Clock, FileText, CheckCircle, Phone, MapPin, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FileText,
    title: "Abertura Simplificada",
    desc: "Registre sua ocorrência em minutos com formulário intuitivo e envio de fotos ou vídeos.",
  },
  {
    icon: Shield,
    title: "Protocolo Único",
    desc: "Cada chamado recebe um número de protocolo exclusivo para rastreamento seguro.",
  },
  {
    icon: Clock,
    title: "Acompanhamento em Tempo Real",
    desc: "Consulte o status do seu chamado a qualquer momento, de qualquer dispositivo.",
  },
  {
    icon: CheckCircle,
    title: "Gestão Profissional",
    desc: "O síndico gerencia todos os chamados com ferramentas completas de administração.",
  },
];

const categorias = [
  { label: "Manutenção", emoji: "🔧" },
  { label: "Segurança", emoji: "🔒" },
  { label: "Limpeza", emoji: "🧹" },
  { label: "Barulho", emoji: "🔊" },
  { label: "Áreas Comuns", emoji: "🏊" },
  { label: "Animais", emoji: "🐾" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-pine-200/60">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 pine-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-serif font-bold text-sm">P</span>
            </div>
            <div>
              <span className="font-serif font-semibold text-pine-900 text-lg leading-none block">Pine</span>
              <span className="text-pine-500 text-xs leading-none">Residencial</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/consultar" className="text-pine-600 hover:text-pine-900 text-sm font-medium transition-colors">
              Consultar Protocolo
            </Link>
            <Link href="/admin" className="text-pine-600 hover:text-pine-900 text-sm font-medium transition-colors">
              Área do Síndico
            </Link>
          </nav>
          <Link href="/abrir-chamado">
            <Button className="pine-gradient text-white hover:opacity-90 shadow-sm text-sm px-5">
              Abrir Chamado
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-16 min-h-screen flex items-center relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 pine-gradient opacity-[0.03] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-gold-100/40 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-pine-100/60 blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

        <div className="container relative py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-gold-100 text-pine-800 text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-gold-300/50 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
              Sistema Oficial do Residencial Pine
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-pine-950 leading-[1.1] mb-6 animate-fade-up animate-delay-100">
              Sua voz chega
              <span className="block text-pine-700 italic">ao síndico.</span>
            </h1>

            <p className="text-pine-600 text-lg md:text-xl leading-relaxed mb-10 max-w-xl animate-fade-up animate-delay-200">
              Registre ocorrências, acompanhe chamados e mantenha a comunicação com a administração do condomínio de forma simples, segura e transparente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animate-delay-300">
              <Link href="/abrir-chamado">
                <Button size="lg" className="pine-gradient text-white hover:opacity-90 shadow-md text-base px-8 h-13 w-full sm:w-auto group">
                  Abrir um Chamado
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/consultar">
                <Button size="lg" variant="outline" className="border-pine-300 text-pine-700 hover:bg-pine-50 text-base px-8 h-13 w-full sm:w-auto bg-white">
                  Consultar Protocolo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-pine-950 mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-pine-500 text-lg max-w-xl mx-auto">
              Uma plataforma completa para moradores e síndico, acessível em qualquer dispositivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-cream-50 rounded-2xl p-7 border border-pine-100 hover:border-pine-300 hover:shadow-md transition-all duration-300 group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 pine-gradient rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-serif text-lg text-pine-900 mb-2">{f.title}</h3>
                <p className="text-pine-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section className="py-24 bg-cream-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl text-pine-950 mb-6">
                Como funciona?
              </h2>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Preencha o formulário", desc: "Informe seus dados, descreva a ocorrência, selecione a categoria e localização.", icon: FileText },
                  { step: "02", title: "Anexe uma foto ou vídeo", desc: "Adicione evidências visuais para facilitar a compreensão do problema.", icon: Camera },
                  { step: "03", title: "Receba seu protocolo", desc: "Um número único é gerado automaticamente para rastrear seu chamado.", icon: Shield },
                  { step: "04", title: "Acompanhe o andamento", desc: "Consulte o status e as respostas do síndico a qualquer momento.", icon: Clock },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 pine-gradient rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gold-600 mb-1 tracking-widest uppercase">Passo {item.step}</div>
                      <h4 className="font-serif text-lg text-pine-900 mb-1">{item.title}</h4>
                      <p className="text-pine-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl p-8 card-shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 pine-gradient rounded-xl flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-serif text-pine-900 font-semibold">Categorias de Chamados</div>
                    <div className="text-pine-400 text-xs">Selecione a que melhor descreve sua ocorrência</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {categorias.map((cat) => (
                    <div key={cat.label} className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-pine-100 hover:border-pine-300 transition-colors cursor-default">
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-pine-700 text-sm font-medium">{cat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorativo */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl gold-gradient opacity-20 -z-10" />
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-2xl pine-gradient opacity-10 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-24 pine-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gold-400 blur-3xl" />
        </div>
        <div className="container relative text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Tem algo a reportar?
          </h2>
          <p className="text-pine-200 text-lg mb-10 max-w-lg mx-auto">
            Abra seu chamado agora. É rápido, seguro e você acompanha tudo online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/abrir-chamado">
              <Button size="lg" className="bg-white text-pine-900 hover:bg-cream-100 shadow-lg text-base px-10 h-13 w-full sm:w-auto font-semibold">
                Abrir Chamado Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/consultar">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 text-base px-10 h-13 w-full sm:w-auto bg-transparent">
                Consultar Protocolo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-pine-950 py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-pine-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-serif font-bold text-xs">P</span>
            </div>
            <span className="text-pine-300 text-sm font-medium">Residencial Pine</span>
          </div>
          <p className="text-pine-500 text-xs text-center">
            Sistema de Chamados e Ocorrências — Todos os dados armazenados com segurança na nuvem.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/consultar" className="text-pine-400 hover:text-pine-200 text-xs transition-colors">
              Consultar Protocolo
            </Link>
            <Link href="/admin" className="text-pine-400 hover:text-pine-200 text-xs transition-colors">
              Área do Síndico
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

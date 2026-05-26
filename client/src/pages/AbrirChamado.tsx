import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, FileImage, FileVideo, Loader2, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

const schema = z.object({
  nomeRequerente: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  unidade: z.string().min(1, "Informe a unidade/apartamento"),
  contato: z.string().min(8, "Informe um contato válido"),
  categoria: z.enum(["manutencao", "seguranca", "limpeza", "barulho", "areas_comuns", "animais", "outros"]),
  localizacao: z.string().min(3, "Informe a localização da ocorrência"),
  descricao: z.string().min(10, "Descreva a ocorrência com pelo menos 10 caracteres"),
});

type FormData = z.infer<typeof schema>;

const categorias = [
  { value: "manutencao", label: "🔧 Manutenção" },
  { value: "seguranca", label: "🔒 Segurança" },
  { value: "limpeza", label: "🧹 Limpeza" },
  { value: "barulho", label: "🔊 Barulho / Perturbação" },
  { value: "areas_comuns", label: "🏊 Áreas Comuns" },
  { value: "animais", label: "🐾 Animais" },
  { value: "outros", label: "📋 Outros" },
];

const localizacoes = [
  "Portaria",
  "Estacionamento",
  "Piscina",
  "Academia",
  "Salão de Festas",
  "Corredor / Escada",
  "Elevador",
  "Área de Lazer",
  "Jardim / Área Verde",
  "Minha Unidade",
  "Outro local",
];

type Arquivo = {
  file: File;
  preview: string;
  tipo: "imagem" | "video";
};

export default function AbrirChamado() {
  const [, navigate] = useLocation();
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const categoriaAtual = watch("categoria");
  const localizacaoAtual = watch("localizacao");

  const criarMutation = trpc.chamados.criar.useMutation();
  const uploadMutation = trpc.upload.salvar.useMutation();

  const processarArquivo = (file: File) => {
    if (arquivos.length >= 3) {
      toast.error("Máximo de 3 arquivos por chamado.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 50MB.");
      return;
    }
    const tipo = file.type.startsWith("video/") ? "video" : "imagem";
    const preview = URL.createObjectURL(file);
    setArquivos((prev) => [...prev, { file, preview, tipo }]);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      Array.from(e.dataTransfer.files).forEach(processarArquivo);
    },
    [arquivos]
  );

  const removerArquivo = (index: number) => {
    setArquivos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      // 1. Criar chamado
      const resultado = await criarMutation.mutateAsync({
        ...data,
        anexosIds: [],
      });

      // 2. Upload dos arquivos
      if (arquivos.length > 0) {
        for (let i = 0; i < arquivos.length; i++) {
          const arq = arquivos[i];
          setUploadProgress(Math.round(((i + 0.5) / arquivos.length) * 100));

          const buffer = await arq.file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let j = 0; j < bytes.byteLength; j++) binary += String.fromCharCode(bytes[j]);
          const base64 = btoa(binary);

          await uploadMutation.mutateAsync({
            chamadoId: resultado.chamadoId,
            fileName: arq.file.name,
            mimeType: arq.file.type,
            fileSize: arq.file.size,
            base64,
          });

          setUploadProgress(Math.round(((i + 1) / arquivos.length) * 100));
        }
      }

      toast.success("Chamado aberto com sucesso!");
      navigate(`/chamado-confirmado/${resultado.protocolo}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao abrir chamado. Tente novamente.");
    }
  };

  const isLoading = criarMutation.isPending || uploadMutation.isPending;

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
            <span className="font-serif font-semibold text-pine-900">Abrir Chamado</span>
          </div>
        </div>
      </header>

      <main className="container py-10 max-w-2xl">
        {/* Título */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-pine-950 mb-2">
            Novo Chamado
          </h1>
          <p className="text-pine-500">
            Preencha os dados abaixo para registrar sua ocorrência. Um número de protocolo será gerado automaticamente.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Dados do morador */}
          <div className="bg-white rounded-2xl p-7 card-shadow space-y-5">
            <h2 className="font-serif text-xl text-pine-900 pb-3 border-b border-pine-100">
              Dados do Morador
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="nomeRequerente" className="text-pine-700 font-medium text-sm">
                Nome Completo *
              </Label>
              <Input
                id="nomeRequerente"
                placeholder="Seu nome completo"
                className="border-pine-200 focus:border-pine-500 focus:ring-pine-500/20 h-11"
                {...register("nomeRequerente")}
              />
              {errors.nomeRequerente && (
                <p className="text-red-500 text-xs mt-1">{errors.nomeRequerente.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="unidade" className="text-pine-700 font-medium text-sm">
                  Unidade / Apartamento *
                </Label>
                <Input
                  id="unidade"
                  placeholder="Ex: Apto 204, Bloco B"
                  className="border-pine-200 focus:border-pine-500 h-11"
                  {...register("unidade")}
                />
                {errors.unidade && (
                  <p className="text-red-500 text-xs mt-1">{errors.unidade.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contato" className="text-pine-700 font-medium text-sm">
                  Telefone / E-mail *
                </Label>
                <Input
                  id="contato"
                  placeholder="(00) 00000-0000"
                  className="border-pine-200 focus:border-pine-500 h-11"
                  {...register("contato")}
                />
                {errors.contato && (
                  <p className="text-red-500 text-xs mt-1">{errors.contato.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Detalhes da ocorrência */}
          <div className="bg-white rounded-2xl p-7 card-shadow space-y-5">
            <h2 className="font-serif text-xl text-pine-900 pb-3 border-b border-pine-100">
              Detalhes da Ocorrência
            </h2>

            {/* Categoria */}
            <div className="space-y-1.5">
              <Label className="text-pine-700 font-medium text-sm">Categoria *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categorias.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setValue("categoria", cat.value as any, { shouldValidate: true })}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                      categoriaAtual === cat.value
                        ? "border-pine-700 bg-pine-50 text-pine-800 shadow-sm"
                        : "border-pine-200 text-pine-600 hover:border-pine-400 hover:bg-pine-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {errors.categoria && (
                <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>
              )}
            </div>

            {/* Localização */}
            <div className="space-y-1.5">
              <Label className="text-pine-700 font-medium text-sm">Localização da Ocorrência *</Label>
              <div className="relative">
                <select
                  className="w-full h-11 px-3 pr-9 rounded-lg border border-pine-200 bg-white text-pine-800 text-sm appearance-none focus:outline-none focus:border-pine-500 focus:ring-2 focus:ring-pine-500/20"
                  value={localizacaoAtual ?? ""}
                  onChange={(e) => setValue("localizacao", e.target.value, { shouldValidate: true })}
                >
                  <option value="">Selecione a localização</option>
                  {localizacoes.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pine-400 pointer-events-none" />
              </div>
              {errors.localizacao && (
                <p className="text-red-500 text-xs mt-1">{errors.localizacao.message}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label htmlFor="descricao" className="text-pine-700 font-medium text-sm">
                Descrição Detalhada *
              </Label>
              <Textarea
                id="descricao"
                placeholder="Descreva a ocorrência com o máximo de detalhes possível: o que aconteceu, quando, como, etc."
                rows={5}
                className="border-pine-200 focus:border-pine-500 resize-none"
                {...register("descricao")}
              />
              {errors.descricao && (
                <p className="text-red-500 text-xs mt-1">{errors.descricao.message}</p>
              )}
            </div>
          </div>

          {/* Upload de mídia */}
          <div className="bg-white rounded-2xl p-7 card-shadow space-y-5">
            <div>
              <h2 className="font-serif text-xl text-pine-900 mb-1">Anexar Mídia</h2>
              <p className="text-pine-400 text-sm">Opcional — Fotos ou vídeos curtos (máx. 3 arquivos, 50MB cada)</p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-pine-500 bg-pine-50"
                  : "border-pine-200 hover:border-pine-400 hover:bg-pine-50/50"
              }`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? "text-pine-600" : "text-pine-300"}`} />
              <p className="text-pine-600 text-sm font-medium mb-1">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-pine-400 text-xs">JPG, PNG, MP4, MOV — até 50MB por arquivo</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => Array.from(e.target.files ?? []).forEach(processarArquivo)}
              />
            </div>

            {/* Preview dos arquivos */}
            {arquivos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {arquivos.map((arq, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-pine-200 aspect-square bg-pine-50">
                    {arq.tipo === "imagem" ? (
                      <img src={arq.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <FileVideo className="w-8 h-8 text-pine-400" />
                        <span className="text-pine-500 text-xs text-center px-2 truncate w-full">{arq.file.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removerArquivo(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-pine-900/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Barra de progresso do upload */}
            {isLoading && uploadProgress > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-pine-500">
                  <span>Enviando arquivos...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-pine-100 rounded-full overflow-hidden">
                  <div
                    className="h-full pine-gradient rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botão de envio */}
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full pine-gradient text-white hover:opacity-90 h-13 text-base font-semibold shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadProgress > 0 ? `Enviando arquivos (${uploadProgress}%)...` : "Abrindo chamado..."}
              </>
            ) : (
              "Abrir Chamado"
            )}
          </Button>

          <p className="text-center text-pine-400 text-xs">
            Ao enviar, você concorda que os dados serão armazenados com segurança no banco de dados do condomínio.
          </p>
        </form>
      </main>
    </div>
  );
}

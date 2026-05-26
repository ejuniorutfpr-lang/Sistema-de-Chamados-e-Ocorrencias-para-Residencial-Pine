# 🏢 Pine Chamados — Sistema de Gestão de Chamados para Condomínios

Um SaaS completo e elegante para moradores abrirem chamados e síndicos gerenciarem ocorrências no Residencial Pine. Sistema 100% online com armazenamento em nuvem, autenticação segura e design responsivo.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tests](https://img.shields.io/badge/tests-11%2F11%20passing-brightgreen)

---

## 🎯 Funcionalidades

### 👥 Para Moradores (Acesso Público)

- ✅ **Abrir Chamado** — Formulário com foto/vídeo, protocolo único gerado automaticamente
- ✅ **Consultar Protocolo** — Acompanhar status em tempo real com histórico completo
- ✅ **Upload em Nuvem** — Fotos e vídeos armazenados em Amazon S3
- ✅ **Sem Dados Locais** — Zero persistência em cookies ou localStorage

### 🔐 Para Síndico (Painel Administrativo)

- ✅ **Autenticação Segura** — Login via Manus OAuth
- ✅ **Dashboard** — Estatísticas em tempo real (abertos, em andamento, resolvidos)
- ✅ **Listagem com Filtros** — Por status, categoria, período e busca por texto
- ✅ **Gerenciamento Completo** — Ver detalhes, adicionar respostas, alterar status, excluir
- ✅ **Histórico Detalhado** — Timeline de todas as atualizações com timestamps

---

## 🛠️ Tech Stack

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui, Wouter |
| **Backend** | Express 4, tRPC 11, Node.js 22 |
| **Database** | MySQL/TiDB com Drizzle ORM |
| **Storage** | Amazon S3 (URLs pré-assinadas) |
| **Autenticação** | Manus OAuth + JWT |
| **Testes** | Vitest (11/11 passando) |
| **Build** | Vite, esbuild |

---

## 📁 Estrutura do Projeto

```
pine-chamados/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Landing page elegante
│   │   │   ├── AbrirChamado.tsx    # Formulário com upload
│   │   │   ├── ChamadoConfirmado.tsx
│   │   │   ├── ConsultarProtocolo.tsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.tsx   # Dashboard do síndico
│   │   │       ├── Chamados.tsx    # Listagem com filtros
│   │   │       └── ChamadoDetalhe.tsx
│   │   ├── components/             # shadcn/ui + custom
│   │   ├── index.css               # Paleta verde + dourado + creme
│   │   └── App.tsx                 # Rotas
│   └── package.json
├── server/                          # Backend Express + tRPC
│   ├── routers.ts                  # Todas as rotas tRPC
│   ├── db.ts                       # Helpers de banco
│   ├── storage.ts                  # Integração S3
│   ├── chamados.test.ts            # Testes (11/11 ✅)
│   └── _core/                      # Framework interno
├── drizzle/                         # Schema + Migrações
│   ├── schema.ts                   # Tabelas: users, chamados, atualizacoes, anexos
│   └── *.sql                       # Migrações aplicadas
├── shared/                          # Tipos compartilhados
└── package.json
```

---

## 🚀 Instalação & Execução Local

### Pré-requisitos

- **Node.js** 22+
- **pnpm** (gerenciador de pacotes)
- **MySQL/TiDB** (banco de dados)
- **Credenciais AWS** (para S3)
- **Manus OAuth** (autenticação)

### Passos

```bash
# 1. Clonar repositório
git clone https://github.com/ejuniorutfpr-lang/Sistema-de-Chamados-e-Ocorrencias-para-Residencial-Pine.git
cd pine-chamados

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# 4. Aplicar migrações do banco
pnpm drizzle-kit migrate

# 5. Rodar em desenvolvimento
pnpm dev

# 6. Rodar testes
pnpm test
```

O sistema estará disponível em **http://localhost:3000**

---

## 📋 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/pine_chamados

# Autenticação
JWT_SECRET=sua-chave-secreta-aqui
VITE_APP_ID=seu-app-id-manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Armazenamento S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua-chave-acesso
AWS_SECRET_ACCESS_KEY=sua-chave-secreta

# Informações do Proprietário
OWNER_NAME=Síndico Pine
OWNER_OPEN_ID=seu-open-id-manus

# URLs Públicas
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua-chave-publica
```

---

## 🧪 Testes

O projeto inclui **11 testes unitários** cobrindo as rotas críticas:

```bash
# Rodar todos os testes
pnpm test

# Resultado esperado: 11/11 passando ✅
```

**Testes cobertos:**
- Criação de chamado
- Consulta de protocolo
- Listagem com filtros (admin)
- Estatísticas (admin)
- Exclusão de chamado (admin)
- Controle de acesso (admin vs user)

---

## 🔐 Segurança

| Aspecto | Implementação |
|---|---|
| **Dados de Chamados** | Banco de dados remoto (MySQL/TiDB) |
| **Fotos/Vídeos** | Amazon S3 com URLs pré-assinadas |
| **Autenticação** | Manus OAuth + JWT |
| **Sessão** | Cookie seguro (httpOnly, secure, sameSite) |
| **Cliente** | ZERO persistência em localStorage/cookies |
| **Validação** | Zod schemas em todas as rotas |
| **CORS** | Configurado para produção |

---

## 📱 Responsividade

O sistema é **100% responsivo** e funciona perfeitamente em:
- 📱 Smartphones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)

Design elegante com:
- Paleta: Verde escuro (#1a3a3a) + Dourado (#d4a574) + Creme (#f5f1e8)
- Tipografia: Playfair Display (títulos) + Inter (corpo)
- Espaçamento generoso e micro-interações suaves

---

## 🚢 Deploy em Produção

### Opção 1: Manus (Recomendado)

O sistema foi desenvolvido para a plataforma Manus e está pronto para publicação:

1. Acesse o painel de gerenciamento Manus
2. Clique em **Publish**
3. Configure domínio customizado (opcional)

### Opção 2: Servidor Próprio (Node.js)

```bash
# Build para produção
pnpm build

# Iniciar servidor
NODE_ENV=production pnpm start
```

**Requisitos:**
- Node.js 22+
- Banco de dados MySQL/TiDB
- Credenciais AWS S3
- SSL/HTTPS

---

## 📊 Rotas da API (tRPC)

### Públicas

| Rota | Método | Descrição |
|---|---|---|
| `chamados.criar` | POST | Criar novo chamado |
| `chamados.consultarProtocolo` | GET | Consultar por protocolo |
| `upload.salvar` | POST | Upload de foto/vídeo |

### Administrativas (requer `role = 'admin'`)

| Rota | Método | Descrição |
|---|---|---|
| `chamados.listar` | GET | Listar com filtros |
| `chamados.detalhar` | GET | Ver detalhe |
| `chamados.adicionarAtualizacao` | POST | Adicionar resposta |
| `chamados.excluir` | DELETE | Excluir chamado |
| `chamados.estatisticas` | GET | Estatísticas |

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

Para dúvidas ou problemas:
- 📖 Consulte a documentação em `GUIA-GITHUB-PINE-CHAMADOS.md`
- 🧪 Verifique os testes em `server/*.test.ts`
- 🐛 Abra uma issue no repositório

---

## 🎉 Agradecimentos

Desenvolvido com ❤️ para o **Residencial Pine**.

**Tecnologias utilizadas:**
- React, Tailwind CSS, shadcn/ui
- Express, tRPC, Drizzle ORM
- Manus Platform, AWS S3

---

**Versão:** 1.0.0  
**Status:** Production Ready ✅  
**Última atualização:** Maio 2026

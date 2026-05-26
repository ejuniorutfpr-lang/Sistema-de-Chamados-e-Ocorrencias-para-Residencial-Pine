# 🔐 Variáveis de Ambiente — Pine Chamados

Este documento descreve todas as variáveis de ambiente necessárias para rodar o Pine Chamados em desenvolvimento e produção.

---

## 📋 Visão Geral

| Categoria | Variáveis | Obrigatório | Ambiente |
|---|---|---|---|
| **Banco de Dados** | `DATABASE_URL` | ✅ | Dev + Prod |
| **Autenticação** | `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL` | ✅ | Dev + Prod |
| **Armazenamento** | `AWS_*` | ✅ | Dev + Prod |
| **Proprietário** | `OWNER_NAME`, `OWNER_OPEN_ID` | ✅ | Prod |
| **APIs Manus** | `BUILT_IN_FORGE_API_*`, `VITE_FRONTEND_FORGE_API_*` | ✅ | Dev + Prod |
| **Analytics** | `VITE_ANALYTICS_*` | ❌ | Prod (opcional) |

---

## 🗄️ Banco de Dados

### `DATABASE_URL`
**Descrição:** URL de conexão com o banco de dados MySQL/TiDB

**Formato:** `mysql://usuario:senha@host:porta/database`

**Exemplo:**
```
DATABASE_URL=mysql://root:senha123@localhost:3306/pine_chamados
DATABASE_URL=mysql://admin:senha456@db.example.com:3306/pine_prod
```

**Como obter:**
1. Crie um banco MySQL/TiDB
2. Crie um usuário com permissões
3. Use a URL acima

---

## 🔐 Autenticação & Segurança

### `JWT_SECRET`
**Descrição:** Chave secreta para assinar tokens JWT

**Requisitos:**
- Mínimo 32 caracteres
- Aleatória e forte
- Diferente para dev e prod

**Gerar chave segura:**
```bash
openssl rand -base64 32
# Resultado: AbC1d2E3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xY3zA4bC5dE6fG7hI8jK9lM0nO1pQ==
```

### `VITE_APP_ID`
**Descrição:** ID da aplicação no Manus OAuth

**Como obter:**
1. Acesse https://manus.im/dashboard
2. Crie uma nova aplicação
3. Copie o App ID

**Exemplo:**
```
VITE_APP_ID=app_1234567890abcdef
```

### `OAUTH_SERVER_URL`
**Descrição:** URL base do servidor OAuth Manus

**Valor fixo:**
```
OAUTH_SERVER_URL=https://api.manus.im
```

### `VITE_OAUTH_PORTAL_URL`
**Descrição:** URL do portal de login Manus

**Valor fixo:**
```
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
```

---

## 💾 Armazenamento S3 (Amazon Web Services)

### `AWS_REGION`
**Descrição:** Região do AWS S3

**Exemplos:**
```
AWS_REGION=us-east-1      # N. Virgínia
AWS_REGION=us-west-2      # Oregon
AWS_REGION=eu-west-1      # Irlanda
AWS_REGION=sa-east-1      # São Paulo
```

### `AWS_ACCESS_KEY_ID`
**Descrição:** Chave de acesso AWS

**Como obter:**
1. Acesse https://console.aws.amazon.com/iam/
2. Crie um usuário IAM
3. Gere credenciais de acesso
4. Copie a Access Key ID

**Exemplo:**
```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
```

### `AWS_SECRET_ACCESS_KEY`
**Descrição:** Chave secreta AWS

**Como obter:**
1. Mesmo processo que Access Key ID
2. Copie a Secret Access Key (aparece uma única vez!)

**Exemplo:**
```
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### `AWS_S3_BUCKET`
**Descrição:** Nome do bucket S3 para armazenar anexos

**Como obter:**
1. Acesse https://console.aws.amazon.com/s3/
2. Crie um novo bucket
3. Use o nome do bucket

**Exemplo:**
```
AWS_S3_BUCKET=pine-chamados-prod
```

---

## 👤 Informações do Proprietário

### `OWNER_NAME`
**Descrição:** Nome do síndico/proprietário

**Exemplo:**
```
OWNER_NAME=João Silva - Síndico Residencial Pine
```

### `OWNER_OPEN_ID`
**Descrição:** Open ID do proprietário no Manus

**Como obter:**
1. Faça login no Manus com sua conta
2. Acesse o perfil
3. Copie seu Open ID

**Exemplo:**
```
OWNER_OPEN_ID=user_1234567890abcdef
```

---

## 🔗 APIs Internas Manus

### `BUILT_IN_FORGE_API_URL`
**Descrição:** URL base das APIs internas Manus (servidor)

**Valor fixo:**
```
BUILT_IN_FORGE_API_URL=https://api.manus.im
```

### `BUILT_IN_FORGE_API_KEY`
**Descrição:** Chave de API para servidor (backend)

**Como obter:**
- Fornecida automaticamente pelo Manus
- Não compartilhe publicamente

### `VITE_FRONTEND_FORGE_API_URL`
**Descrição:** URL base das APIs internas Manus (cliente)

**Valor fixo:**
```
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

### `VITE_FRONTEND_FORGE_API_KEY`
**Descrição:** Chave de API para cliente (frontend)

**Como obter:**
- Fornecida automaticamente pelo Manus
- Pode ser exposta no cliente

---

## 📊 Analytics (Opcional)

### `VITE_ANALYTICS_ENDPOINT`
**Descrição:** URL do serviço de analytics

**Exemplos:**
```
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com/api
VITE_ANALYTICS_ENDPOINT=https://plausible.io/api/event
```

### `VITE_ANALYTICS_WEBSITE_ID`
**Descrição:** ID do website no serviço de analytics

**Exemplo:**
```
VITE_ANALYTICS_WEBSITE_ID=pine-chamados.com
```

---

## 🌍 Ambiente

### `NODE_ENV`
**Descrição:** Ambiente de execução

**Valores:**
```
NODE_ENV=development   # Desenvolvimento
NODE_ENV=production    # Produção
```

### `PORT`
**Descrição:** Porta local (apenas desenvolvimento)

**Padrão:**
```
PORT=3000
```

---

## 📝 Arquivo .env.local (Desenvolvimento)

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL=mysql://root:password@localhost:3306/pine_chamados

# Autenticação
JWT_SECRET=AbC1d2E3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xY3zA4bC5dE6fG7hI8jK9lM0nO1pQ==
VITE_APP_ID=app_seu_id_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Armazenamento S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=pine-chamados-dev

# Proprietário
OWNER_NAME=Síndico Pine
OWNER_OPEN_ID=user_seu_id_aqui

# APIs Manus
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_aqui
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_chave_publica_aqui

# Ambiente
NODE_ENV=development
PORT=3000
```

---

## 🚀 Produção (Servidor)

Para produção, configure as variáveis via:

1. **Painel Manus** (Recomendado)
   - Acesse o dashboard
   - Vá para Settings → Secrets
   - Adicione cada variável

2. **Variáveis de Ambiente do Sistema**
   ```bash
   export DATABASE_URL=mysql://...
   export JWT_SECRET=...
   export NODE_ENV=production
   ```

3. **Arquivo .env (não recomendado)**
   - Crie `.env` na raiz
   - Nunca faça commit

---

## ⚠️ Segurança

**IMPORTANTE:**

1. ❌ **NUNCA** faça commit de `.env.local` ou `.env`
2. ❌ **NUNCA** compartilhe chaves secretas
3. ❌ **NUNCA** exponha `JWT_SECRET` ou `AWS_SECRET_ACCESS_KEY`
4. ✅ Use `.gitignore` para ignorar arquivos `.env*`
5. ✅ Gere chaves fortes e únicas para cada ambiente
6. ✅ Rotacione chaves regularmente em produção

---

## 🔄 Rotação de Chaves

**A cada 90 dias:**
1. Gere novas chaves AWS
2. Atualize `JWT_SECRET`
3. Revogue chaves antigas
4. Teste em staging antes de produção

---

## 🆘 Troubleshooting

### Erro: "DATABASE_URL is not set"
- Verifique se `.env.local` existe
- Confirme se `DATABASE_URL` está preenchida
- Teste a conexão: `mysql -u user -p -h host database`

### Erro: "Invalid JWT_SECRET"
- Gere uma chave com: `openssl rand -base64 32`
- Confirme se tem pelo menos 32 caracteres

### Erro: "AWS credentials not found"
- Verifique `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`
- Confirme se o bucket existe
- Teste com AWS CLI: `aws s3 ls`

### Erro: "OAuth not working"
- Confirme `VITE_APP_ID` está correto
- Verifique se a aplicação está ativa no Manus
- Teste a URL: `https://auth.manus.im`

---

**Última atualização:** Maio 2026  
**Versão:** 1.0.0

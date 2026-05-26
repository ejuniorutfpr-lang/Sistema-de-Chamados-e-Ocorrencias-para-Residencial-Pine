# 🚀 Guia de Deploy — Pine Chamados

Instruções completas para colocar o Pine Chamados em produção.

---

## 📋 Pré-requisitos

- ✅ Repositório GitHub configurado
- ✅ Conta Manus ativa
- ✅ Banco de dados MySQL/TiDB em produção
- ✅ Bucket S3 criado
- ✅ Credenciais AWS configuradas
- ✅ Domínio customizado (opcional)

---

## 🌐 Opção 1: Deploy via Manus (Recomendado)

### Passo 1: Acessar o Painel Manus

1. Acesse https://manus.im/dashboard
2. Selecione o projeto "Pine Chamados"
3. Vá para **Settings** → **Publish**

### Passo 2: Configurar Variáveis de Ambiente

1. Vá para **Settings** → **Secrets**
2. Adicione cada variável necessária:

| Variável | Valor | Exemplo |
|---|---|---|
| `DATABASE_URL` | URL MySQL/TiDB | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Chave secreta | `openssl rand -base64 32` |
| `VITE_APP_ID` | ID Manus OAuth | `app_xxxxx` |
| `AWS_REGION` | Região S3 | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | Chave AWS | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Secreta AWS | `wJal...` |
| `AWS_S3_BUCKET` | Bucket S3 | `pine-chamados-prod` |
| `OWNER_NAME` | Nome síndico | `João Silva` |
| `OWNER_OPEN_ID` | Open ID Manus | `user_xxxxx` |

### Passo 3: Publicar

1. Clique em **Publish**
2. Aguarde o build (2-5 minutos)
3. Acesse a URL gerada: `https://seu-projeto.manus.space`

### Passo 4: Configurar Domínio Customizado (Opcional)

1. Vá para **Settings** → **Domains**
2. Clique em **Add Custom Domain**
3. Siga as instruções para configurar DNS
4. Aguarde a validação (até 24 horas)

---

## 🖥️ Opção 2: Deploy em Servidor Próprio (Node.js)

### Passo 1: Preparar o Servidor

**Requisitos:**
- Ubuntu 22.04 LTS (ou similar)
- Node.js 22+
- pnpm
- MySQL/TiDB
- Nginx (reverse proxy)
- SSL/HTTPS

### Passo 2: Clonar e Configurar

```bash
# 1. SSH no servidor
ssh usuario@seu-servidor.com

# 2. Clonar repositório
git clone https://github.com/ejuniorutfpr-lang/Sistema-de-Chamados-e-Ocorrencias-para-Residencial-Pine.git
cd pine-chamados

# 3. Instalar dependências
pnpm install --frozen-lockfile

# 4. Criar arquivo .env
nano .env
# Adicione todas as variáveis (veja ENVIRONMENT_VARIABLES.md)

# 5. Build para produção
pnpm build

# 6. Aplicar migrações do banco
pnpm drizzle-kit migrate
```

### Passo 3: Configurar PM2 (Process Manager)

```bash
# 1. Instalar PM2 globalmente
sudo npm install -g pm2

# 2. Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'pine-chamados',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
EOF

# 3. Iniciar com PM2
pm2 start ecosystem.config.js

# 4. Salvar configuração
pm2 save

# 5. Configurar startup automático
pm2 startup
```

### Passo 4: Configurar Nginx (Reverse Proxy)

```bash
# 1. Instalar Nginx
sudo apt update && sudo apt install -y nginx

# 2. Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/pine-chamados

# 3. Adicionar configuração:
```

```nginx
upstream pine_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/pine-chamados-access.log;
    error_log /var/log/nginx/pine-chamados-error.log;

    # Proxy
    location / {
        proxy_pass http://pine_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
}
```

```bash
# 4. Ativar site
sudo ln -s /etc/nginx/sites-available/pine-chamados /etc/nginx/sites-enabled/

# 5. Testar configuração
sudo nginx -t

# 6. Reiniciar Nginx
sudo systemctl restart nginx
```

### Passo 5: Configurar SSL com Let's Encrypt

```bash
# 1. Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Gerar certificado
sudo certbot certonly --nginx -d seu-dominio.com -d www.seu-dominio.com

# 3. Renovação automática
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Passo 6: Monitorar e Manter

```bash
# Ver status do PM2
pm2 status

# Ver logs em tempo real
pm2 logs pine-chamados

# Reiniciar aplicação
pm2 restart pine-chamados

# Atualizar código
git pull origin main
pnpm install
pnpm build
pm2 restart pine-chamados
```

---

## 🐳 Opção 3: Deploy com Docker

### Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build
RUN pnpm build

# Expor porta
EXPOSE 3000

# Iniciar
CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      # ... outras variáveis
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: pine_chamados
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  db_data:
```

### Deploy com Docker

```bash
# 1. Build
docker-compose build

# 2. Iniciar
docker-compose up -d

# 3. Ver logs
docker-compose logs -f app

# 4. Parar
docker-compose down
```

---

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados em produção
- [ ] Bucket S3 criado e testado
- [ ] Certificado SSL válido
- [ ] Domínio apontando para servidor
- [ ] Testes executados com sucesso
- [ ] Backups configurados
- [ ] Monitoramento ativo
- [ ] Logs centralizados
- [ ] Plano de rollback pronto

---

## 🔍 Verificações Pós-Deploy

```bash
# 1. Testar landing page
curl https://seu-dominio.com/

# 2. Testar API
curl https://seu-dominio.com/api/trpc/auth.me

# 3. Verificar banco
mysql -u user -p -h host -e "SELECT COUNT(*) FROM chamados;"

# 4. Verificar S3
aws s3 ls s3://seu-bucket/

# 5. Ver logs
pm2 logs pine-chamados
```

---

## 🚨 Troubleshooting

### Erro: "Cannot connect to database"
```bash
# Verificar conexão
mysql -u user -p -h host database
# Confirmar DATABASE_URL está correto
```

### Erro: "AWS credentials not found"
```bash
# Verificar credenciais
aws configure
aws s3 ls
```

### Erro: "Port 3000 already in use"
```bash
# Encontrar processo
lsof -i :3000
# Matar processo
kill -9 <PID>
```

### Erro: "SSL certificate not valid"
```bash
# Renovar certificado
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

---

## 📊 Monitoramento em Produção

### Ferramentas Recomendadas

1. **PM2 Plus** — Monitoramento de aplicação
2. **Datadog** — APM e logs
3. **Sentry** — Rastreamento de erros
4. **New Relic** — Performance monitoring
5. **CloudWatch** — Logs AWS

### Métricas Importantes

- CPU e memória
- Tempo de resposta da API
- Taxa de erro
- Conexões de banco de dados
- Espaço em disco
- Uptime

---

## 🔄 Atualizações e Rollback

### Atualizar Código

```bash
# 1. Parar aplicação
pm2 stop pine-chamados

# 2. Atualizar código
git pull origin main

# 3. Instalar dependências
pnpm install

# 4. Build
pnpm build

# 5. Aplicar migrações (se houver)
pnpm drizzle-kit migrate

# 6. Reiniciar
pm2 start pine-chamados
```

### Rollback

```bash
# 1. Voltar para versão anterior
git revert HEAD

# 2. Build
pnpm build

# 3. Reiniciar
pm2 restart pine-chamados
```

---

## 📞 Suporte

Para dúvidas sobre deploy:
- 📖 Consulte [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- 🐛 Abra uma issue no GitHub
- 💬 Contate o suporte Manus

---

**Última atualização:** Maio 2026  
**Versão:** 1.0.0

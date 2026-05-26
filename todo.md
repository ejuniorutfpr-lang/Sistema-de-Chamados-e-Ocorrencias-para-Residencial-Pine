# Pine Chamados — TODO

## Banco de Dados & Schema
- [x] Tabela `chamados` com todos os campos do formulário
- [x] Tabela `atualizacoes` para histórico de respostas do síndico
- [x] Tabela `anexos` para armazenar referências S3 de fotos/vídeos
- [x] Geração de número de protocolo único (PINE-ANO-RANDOM)
- [x] Aplicar migrações via webdev_execute_sql

## API (tRPC Routers)
- [x] `chamados.criar` — cria chamado com protocolo único (publicProcedure)
- [x] `chamados.consultarProtocolo` — consulta por número de protocolo (publicProcedure)
- [x] `chamados.listar` — lista todos os chamados com filtros (adminProcedure)
- [x] `chamados.detalhar` — detalha chamado por ID (adminProcedure)
- [x] `chamados.atualizarStatus` — altera status do chamado (adminProcedure)
- [x] `chamados.adicionarAtualizacao` — adiciona resposta/atualização (adminProcedure)
- [x] `chamados.excluir` — exclui chamado (adminProcedure)
- [x] `upload.salvar` — salva arquivo no S3 (publicProcedure)

## Interface Pública
- [x] Landing page elegante com apresentação do sistema e CTAs
- [x] Formulário de abertura de chamado (nome, unidade, contato, descrição, localização, categoria)
- [x] Upload de foto/vídeo com preview e progresso
- [x] Tela de confirmação com número de protocolo gerado
- [x] Página de consulta de protocolo (busca + exibição de status e histórico)

## Painel Administrativo (Síndico)
- [x] Autenticação via Manus OAuth (protectedProcedure + role admin)
- [x] Dashboard com estatísticas (total, abertos, em andamento, resolvidos)
- [x] Listagem de chamados com filtros por status e categoria
- [x] Visualização detalhada de cada chamado com anexos
- [x] Adicionar atualização/resposta ao chamado
- [x] Alterar status do chamado
- [x] Excluir chamado com confirmação

## Design & UX
- [x] Paleta de cores elegante (verde escuro + dourado + creme)
- [x] Tipografia refinada (Playfair Display para títulos, Inter para corpo)
- [x] Layout responsivo mobile-first
- [x] Animações suaves e micro-interações
- [x] Estados de loading, erro e vazio bem tratados
- [x] Toast notifications para feedback de ações

## Testes
- [x] Testes unitários para criação de chamado
- [x] Testes para consulta de protocolo
- [x] Testes para ações administrativas (11/11 passando)

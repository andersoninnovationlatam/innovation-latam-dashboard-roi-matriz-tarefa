# 02 — Stack e Arquitetura

Definição de tecnologias utilizadas e estrutura de pastas do repositório (para alinhamento da IA e do time).

---

## Arquitetura geral

- **Full-stack no mesmo repositório.**
- Pensada para **Edge Runtime.**
- **Deploy em Cloudflare Workers** via OpenNext.

---

## Frontend

- **Next.js** (App Router)
- **React**
- **Tailwind CSS**
- **shadcn/ui** (componentes)
- **react-hook-form** + **zod** (formulários e validações)

---

## Backend

- **Next.js Route Handlers / Server Actions** (backend integrado ao front).
- **Runtime:** Cloudflare Workers (Node.js compatibility via OpenNext).

---

## Banco de dados e autenticação

- **Supabase**
  - Postgres
  - Authentication (e-mail/senha)
  - Row Level Security (RLS)
- **Supabase CLI:** Migrações e consultas podem ser feitas pelo terminal (agentes e desenvolvedores). Ver [docs/supabase-terminal.md](../supabase-terminal.md).
- **Zod** para schemas compartilhados (validação e tipos).

---

## Deploy

- **Cloudflare Workers**
- **OpenNext** (`@opennextjs/cloudflare`) para build e deploy do Next.js no Workers.
- **Wrangler** (≥ 3.99) para preview e deploy; configuração em `wrangler.jsonc` com `nodejs_compat`.
- **Fluxo:** Desenvolvimento com `next dev`; build para Cloudflare com `npm run cf:build`; preview local com `npm run cf:preview`; deploy com `npm run cf:deploy`.
- **CI/CD (Cloudflare):** O build deve rodar `npm run cf:build` (não só `npm run build`) para gerar `.open-next/worker.js`; o deploy roda `npx wrangler deploy`. Ver README.

---

## Supabase pelo terminal

O projeto usa o **Supabase CLI** para que migrações e consultas ao banco possam ser feitas diretamente pelo terminal (incluindo por agentes de IA). Comandos principais:

- `npx supabase migration new <nome>` — cria nova migração em `supabase/migrations/`
- `npx supabase db reset` — aplica migrações no ambiente local (com `supabase start`)
- `npx supabase db push` — aplica migrações no projeto remoto (após `supabase link`)
- **Uso automático:** Com `SUPABASE_ACCESS_TOKEN` e `SUPABASE_PROJECT_REF` definidos (e exportados), `npm run db:push` aplica migrações sem login interativo.

Detalhes: [docs/supabase-terminal.md](../supabase-terminal.md).

---

## Design centralizado

- Tema, cores e tokens de design devem ficar em **um único lugar** (ex.: design system / tema centralizado em CSS ou configuração do Tailwind/shadcn).
- Objetivo: refatorar o front (cores, modo claro/escuro, componentes) alterando o mínimo possível de arquivos.
- Cores do projeto: ver [01-projeto-e-identidade.md](01-projeto-e-identidade.md) (primary `#951b81`, secondary `#49bab6`).

---

## Estrutura de pastas proposta

Esboço alinhado à stack (Next.js App Router, Supabase). Ajustar conforme convenções adotadas no projeto.

```
/
├── app/                    # App Router (rotas, layouts, páginas)
│   ├── (auth)/             # rotas de autenticação (login, cadastro)
│   ├── (dashboard)/        # área logada; (dashboard)/dashboard/ → rota /dashboard
│   └── api/                # Route Handlers / API routes
├── components/             # componentes React reutilizáveis
│   ├── ui/                 # shadcn e componentes base
│   └── ...                 # componentes de feature
├── lib/                    # utilitários, clientes, helpers
│   ├── supabase/           # clientes Supabase (browser, server)
│   ├── auth/               # reexportações e helpers de autenticação
│   └── utils.ts            # utilitários (ex.: cn)
├── server/                 # Server Actions e lógica de servidor
├── supabase/               # Supabase CLI (config.toml, migrations/)
├── docs/                   # documentação (incluindo context/)
│   └── context/            # documentação de contexto para IA
├── open-next.config.ts     # configuração OpenNext para Cloudflare
├── wrangler.jsonc          # configuração Wrangler
└── ...                     # configs (next.config, tailwind, etc.)
```

# Fullstack Starter

Boilerplate full-stack com **Next.js** (App Router), **Supabase Auth** e deploy no **Cloudflare Workers**. Inclui login, cadastro e uma área logada com “Olá mundo”, tema claro/escuro e Supabase acessível pelo terminal para migrações e consultas.

---

## Pré-requisitos

- **Node.js** 18+
- **npm** ou **pnpm**
- Conta **Supabase** (projeto para Auth)
- Conta **Cloudflare** (para deploy)
- **Supabase CLI** (opcional, para migrações pelo terminal): [Instalação](https://supabase.com/docs/guides/cli)

---

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha com os valores do seu projeto Supabase:

```bash
cp .env.example .env.local
```

Em `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto (ex.: `https://xxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave anônima (pública) do projeto

No **Supabase Dashboard** → Authentication → URL Configuration, adicione em **Redirect URLs** (para auth por e-mail):

- `http://localhost:3000/api/auth/callback`
- A URL de produção após o deploy (ex.: `https://seu-worker.workers.dev/api/auth/callback`)

---

## Desenvolvimento

```bash
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000). Use **Entrar** ou **Criar conta** para testar o fluxo de autenticação.

---

## Supabase: migrações e consultas pelo terminal

O projeto usa o **Supabase CLI** para que migrações e consultas possam ser feitas pelo terminal (incluindo por agentes de IA).

- **Estrutura:** `supabase/config.toml` e `supabase/migrations/` (SQL versionado).
- **Comandos principais:**
  - `npx supabase migration new <nome>` — cria nova migração
  - `npx supabase db reset` — aplica migrações no ambiente local (requer `supabase start`)
  - `npx supabase db push` — aplica migrações no projeto remoto (após `supabase link --project-ref <ref>`)

Documentação completa: [docs/supabase-terminal.md](docs/supabase-terminal.md).

---

## Build e deploy (Cloudflare Workers)

- **Build para Cloudflare:**  
  `npm run cf:build`  
  Gera a pasta `.open-next/` (incluída no `.gitignore`). O `next.config.ts` chama `initOpenNextCloudflareForDev()` para integração com Wrangler no dev; em ambientes restritos (ex.: CI ou sandbox sem permissão de escrita em `~/.config`), `npm run lint`, `npm run build` e `npm run cf:build` podem falhar ao criar `~/.config/.wrangler`. Nesses casos, rode com permissões que permitam escrita no diretório de config do usuário ou desabilite temporariamente a chamada em `next.config.ts`.

- **Preview local ( Workers runtime):**  
  `npm run cf:preview`  
  Faz o build e sobe o app localmente com Wrangler.

- **Deploy:**  
  `npm run cf:deploy`  
  Faz o build e publica no Cloudflare Workers. Configure as variáveis de ambiente (Supabase) como [secrets](https://developers.cloudflare.com/workers/configuration/secrets/) no Workers ou no dashboard.

Configuração: `wrangler.jsonc` (e `open-next.config.ts` para OpenNext).

---

## Documentação de contexto

A pasta **`/docs/context`** contém a documentação de arquitetura e regras do projeto para alinhamento de humanos e agentes. Consulte-a antes de implementar mudanças. O arquivo **`.cursorrules`** na raiz orienta a sempre consultar `/docs/context` antes de qualquer tarefa.

---

## Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui, react-hook-form, zod
- **Auth:** Supabase Auth (@supabase/ssr)
- **Deploy:** OpenNext + Wrangler (Cloudflare Workers)

Cores do tema: primary `#951b81`, secondary `#49bab6`; suporte a modo claro e escuro.

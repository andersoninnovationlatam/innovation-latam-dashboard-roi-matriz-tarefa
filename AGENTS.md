# AGENTS.md

Registro de decisões de design, visão de funcionamento do sistema e orientações para subagentes (Arquitetura de Contexto: Cursor/Claude Code).

---

## Decisões de design

- **Boilerplate:** Este projeto é um ponto de partida funcional (auth + tela “Olá mundo”); perfis e regras adicionais devem ser documentados em `/docs/context` ao estender.
- **Autenticação:** Supabase Auth (e-mail/senha); criar conta, login e logout; sessão via cookies (@supabase/ssr).
- **Identidade e UX:** Layout minimalista e limpo; tema centralizado; modo claro e escuro obrigatórios. Cores: primary `#951b81`, secondary `#49bab6`.

---

## Como o sistema funciona (alto nível)

1. **Visitante** acessa a landing → pode ir para **Entrar** ou **Criar conta**.
2. **Criar conta / Entrar** → Supabase Auth; em sucesso, redirecionamento para a área logada.
3. **Área logada** → layout verifica sessão; exibe “Olá mundo” e o e-mail do usuário; opção de logout.
4. **Supabase:** Migrações e consultas pelo terminal (Supabase CLI); ver [docs/supabase-terminal.md](docs/supabase-terminal.md).
5. **Deploy:** Build com OpenNext; preview e deploy com Wrangler (Cloudflare Workers).

---

## Stack de referência

- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui, react-hook-form + zod.
- **Backend:** Next.js Route Handlers / Server Actions; runtime Cloudflare Workers (OpenNext).
- **Banco e Auth:** Supabase (Postgres, Auth); Supabase CLI para migrações/consultas no terminal; Zod para schemas.
- **Deploy:** Cloudflare Workers, OpenNext, Wrangler.

Detalhes e estrutura de pastas: [docs/context/02-stack-e-arquitetura.md](docs/context/02-stack-e-arquitetura.md).

---

## Orientações para subagentes

- **Sempre consultar** a pasta `/docs/context` antes de implementar ou propor mudanças.
- **Regras de negócio** → [docs/context/03-regras-de-negocio.md](docs/context/03-regras-de-negocio.md).
- **Permissões e perfis** → [docs/context/04-seguranca-e-permissoes.md](docs/context/04-seguranca-e-permissoes.md).
- **Estrutura do repositório e stack** → [docs/context/02-stack-e-arquitetura.md](docs/context/02-stack-e-arquitetura.md).
- **Guardrails e rotina de doc** → [docs/context/05-workflow-ia-rules.md](docs/context/05-workflow-ia-rules.md).
- **Não inventar** perfis, regras de acesso ou fluxos não documentados; em dúvida, propor atualização da documentação primeiro.

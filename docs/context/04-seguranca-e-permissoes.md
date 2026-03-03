# 04 — Segurança e Permissões

Variáveis de ambiente, padrões de segurança e regras de acesso no boilerplate.

---

## Perfis no boilerplate

Neste boilerplate há apenas:

- **Visitante:** não autenticado; pode acessar landing, login e cadastro.
- **Usuário autenticado:** logado via Supabase Auth; acessa a área logada (“Olá mundo”) e pode fazer logout.

Perfis adicionais (ex.: administrador, super admin) podem ser definidos e documentados ao estender o projeto.

---

## Variáveis de ambiente

- **Supabase (obrigatórias para auth):**
  - `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave anônima (pública) do projeto
- **Cloudflare (para deploy):** configuradas no dashboard ou via Wrangler (ex.: secrets); não commitar segredos no repositório.
- **Arquivo de exemplo:** `.env.example` na raiz lista as variáveis necessárias; usar `.env.local` para valores locais (e não commitar `.env.local`).

---

## Segurança

- **Segredos:** Nunca commitar API keys, senhas ou tokens no repositório.
- **Supabase:** Usar RLS (Row Level Security) em tabelas que armazenem dados por usuário.
- **HTTPS:** Em produção, usar sempre HTTPS.
- **Validação:** Formulários de login e cadastro validados com Zod; tratar erros de auth de forma segura (mensagens genéricas quando apropriado).

# Supabase pelo terminal (migrações e consultas)

Este projeto usa o **Supabase CLI** para que migrações e consultas ao banco possam ser feitas diretamente pelo terminal, inclusive por agentes de IA.

---

## Pré-requisitos

- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado:
  ```bash
  npm install -g supabase
  # ou
  npx supabase
  ```

---

## Estrutura

- `supabase/config.toml` — configuração do projeto (local e/ou link remoto).
- `supabase/migrations/` — migrações SQL versionadas (ordem por timestamp no nome do arquivo).

---

## Comandos úteis

### Migrações

| Comando | Descrição |
|--------|-----------|
| `supabase migration new <nome>` | Cria nova migração em `supabase/migrations/` (ex.: `supabase migration new add_profiles`) |
| `supabase db reset` | Aplica todas as migrações no banco **local** (e recria o banco). Requer `supabase start` antes. |
| `supabase db push` | Aplica migrações pendentes no projeto **remoto** (após `supabase link`). |
| `supabase db diff` | Mostra diferenças entre o schema local e as migrações. |

### Ambiente local (Docker)

| Comando | Descrição |
|--------|-----------|
| `supabase start` | Sobe Postgres, Auth, Studio etc. em containers locais. |
| `supabase stop` | Para os serviços locais. |

### Projeto remoto

| Comando | Descrição |
|--------|-----------|
| `supabase link --project-ref <ref>` | Vincula o projeto ao projeto remoto no Supabase (usar o ref do dashboard). |
| `supabase db push` | Envia migrações para o banco remoto. |

### Consultas no banco

- **Local (com `supabase start`):** use `psql` na porta 54322 ou o **Supabase Studio** em `http://localhost:54323`.
- **Remoto:** no dashboard do Supabase, use o SQL Editor, ou conecte via connection string com `psql`.
- **Pelo CLI:** é possível usar `supabase db execute` em alguns fluxos; para consultas ad hoc o SQL Editor ou `psql` são mais práticos.

---

## Fluxo recomendado para agentes

1. **Criar migração:** `npx supabase migration new <nome_da_mudança>`.
2. **Editar** o arquivo em `supabase/migrations/<timestamp>_<nome>.sql`.
3. **Aplicar localmente:** `npx supabase start` (se ainda não estiver rodando) e `npx supabase db reset`.
4. **Aplicar no remoto:** após `supabase link`, rodar `npx supabase db push`.

As migrações são apenas arquivos SQL; versionadas no repositório, podem ser revisadas e executadas por humanos ou agentes a partir do terminal.

# 05 — Workflow e Regras para IA

Guardrails, padrões de código, regras de testes e rotina de atualização da documentação.

---

## Guardrails

- **Antes de qualquer tarefa de codificação,** consultar sempre a pasta `/docs/context` para garantir alinhamento com a arquitetura e regras do projeto (conforme [.cursorrules](../../.cursorrules) na raiz).
- Respeitar as **regras de negócio** documentadas em [03-regras-de-negocio.md](03-regras-de-negocio.md).
- Respeitar **perfis e permissões** documentados em [04-seguranca-e-permissoes.md](04-seguranca-e-permissoes.md).
- Não inventar perfis, regras de acesso ou fluxos que não estejam documentados; em caso de dúvida, propor atualização da documentação primeiro.

---

## Padrões de código e testes

- **Lint:** ESLint com configuração Next.js (`npm run lint`).
- **Estrutura:** Convenções e pastas em [02-stack-e-arquitetura.md](02-stack-e-arquitetura.md).
- **Validação e dados:** Zod para schemas e validação; Supabase client para acesso a dados; migrações via Supabase CLI (SQL em `supabase/migrations/`).

---

## Rotina de atualização da documentação

A cada implementação relevante, atualizar o documento de contexto correspondente:

| Se a mudança for… | Atualizar |
|-------------------|-----------|
| Nova funcionalidade ou regra de negócio | [03-regras-de-negocio.md](03-regras-de-negocio.md) |
| Nova permissão, perfil ou regra de acesso | [04-seguranca-e-permissoes.md](04-seguranca-e-permissoes.md) |
| Nova tecnologia, pasta ou módulo na arquitetura | [02-stack-e-arquitetura.md](02-stack-e-arquitetura.md) |
| Nova decisão de identidade, UX ou branding | [01-projeto-e-identidade.md](01-projeto-e-identidade.md) |
| Nova regra de guardrail, padrão de código ou rotina de doc | Este arquivo ([05-workflow-ia-rules.md](05-workflow-ia-rules.md)) |

Manter a documentação de contexto atualizada garante que humanos e agentes continuem alinhados ao projeto.

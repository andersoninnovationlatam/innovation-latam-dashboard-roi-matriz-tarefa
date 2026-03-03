# Guia do Desenvolvedor — Documentação de Contexto

Documento mestre da pasta `/docs/context`: onde estão os arquivos, como usá-los e como alimentá-los conforme o projeto cresce.

---

## Índice dos arquivos

| Arquivo | Propósito |
|---------|-----------|
| [01-projeto-e-identidade.md](01-projeto-e-identidade.md) | Nome, descrição, funcionalidades principais e identidade visual (cores, layout, UX, tema claro/escuro). |
| [02-stack-e-arquitetura.md](02-stack-e-arquitetura.md) | Tecnologias (Next.js, Cloudflare, Supabase, etc.), design centralizado, estrutura de pastas, Supabase CLI e deploy. |
| [03-regras-de-negocio.md](03-regras-de-negocio.md) | Regras do boilerplate: auth, criar conta, login, área logada (“Olá mundo”). |
| [04-seguranca-e-permissoes.md](04-seguranca-e-permissoes.md) | Visitante vs usuário autenticado, variáveis de ambiente e boas práticas de segurança. |
| [05-workflow-ia-rules.md](05-workflow-ia-rules.md) | Guardrails para IA, padrões de código/testes e rotina de atualização desta documentação. |

---

## Como usar (humanos e agentes)

- **Contexto do projeto e identidade:** Ler [01-projeto-e-identidade.md](01-projeto-e-identidade.md) e [02-stack-e-arquitetura.md](02-stack-e-arquitetura.md) para entender o boilerplate, a stack e a estrutura de pastas.
- **Regras de negócio:** Consultar [03-regras-de-negocio.md](03-regras-de-negocio.md) antes de implementar fluxos de auth ou novas funcionalidades.
- **Segurança e permissões:** Consultar [04-seguranca-e-permissoes.md](04-seguranca-e-permissoes.md) antes de expor dados ou ações por perfil.
- **Workflow e guardrails:** Usar [05-workflow-ia-rules.md](05-workflow-ia-rules.md) para saber como a IA deve se comportar e quando atualizar a documentação.

A instrução na raiz (`.cursorrules`) orienta a **sempre consultar `/docs/context` antes de qualquer tarefa** para manter alinhamento com a arquitetura e regras do projeto.

---

## Como alimentar (quando atualizar cada arquivo)

| Se você… | Atualize |
|----------|----------|
| Mudar nome, descrição, funcionalidades ou identidade visual/UX | [01-projeto-e-identidade.md](01-projeto-e-identidade.md) |
| Adotar nova tecnologia, nova pasta ou mudar a estrutura do repo | [02-stack-e-arquitetura.md](02-stack-e-arquitetura.md) |
| Incluir ou alterar regra de negócio (auth, fluxos, escopo) | [03-regras-de-negocio.md](03-regras-de-negocio.md) |
| Alterar perfis, permissões ou regras de acesso | [04-seguranca-e-permissoes.md](04-seguranca-e-permissoes.md) |
| Definir novo guardrail, padrão de código/teste ou rotina de doc | [05-workflow-ia-rules.md](05-workflow-ia-rules.md) |

Manter esses arquivos atualizados garante desenvolvimento ágil e organizado e que a IA tenha referências corretas ao codificar.

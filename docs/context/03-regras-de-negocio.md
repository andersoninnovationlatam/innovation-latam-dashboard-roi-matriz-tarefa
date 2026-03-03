# 03 — Regras de Negócio

Regras centrais do domínio para consulta rápida de humanos e agentes.

---

## Escopo do boilerplate

Este projeto é um **boilerplate** com escopo mínimo:

- **Usuário pode criar conta** (e-mail e senha) via Supabase Auth.
- **Usuário pode fazer login** e logout.
- **Após login,** o usuário é redirecionado para a área logada, onde vê uma tela com a mensagem **“Olá mundo”** (e, opcionalmente, o e-mail do usuário).
- **Visitante** (não autenticado) pode acessar a landing (com links para login e cadastro) e as páginas de login e cadastro.

---

## Fluxo de autenticação

1. Na landing, o usuário escolhe “Entrar” ou “Criar conta”.
2. Em **Criar conta:** preenche e-mail e senha; ao sucesso, é redirecionado para a área logada.
3. Em **Entrar:** preenche e-mail e senha; ao sucesso, é redirecionado para a área logada.
4. Na área logada, o usuário vê “Olá mundo” e pode sair (logout), voltando à landing.

Regras adicionais (cursos, agentes, métricas, perfis múltiplos) ficam **fora do escopo** deste boilerplate e podem ser documentadas e implementadas ao estender o projeto.

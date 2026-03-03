# 01 — Projeto e Identidade

## Nome

**Fullstack Starter** — Boilerplate full-stack com Next.js, Supabase e deploy no Cloudflare Workers.

---

## Descrição

Este repositório é um **boilerplate** funcional que implementa a stack definida na documentação: Next.js (App Router), autenticação com Supabase, tema centralizado (modo claro/escuro) e deploy no Cloudflare Workers. O objetivo é servir de ponto de partida para novos projetos, com login, cadastro e uma área logada mínima (“Olá mundo”).

---

## Funcionalidades principais (alto nível)

- **Autenticação:** Criar conta (e-mail/senha), login e logout via Supabase Auth.
- **Área logada:** Após login, o usuário é redirecionado para uma tela que exibe “Olá mundo” (e opcionalmente o e-mail do usuário).
- **Design centralizado:** Cores e tema em um único lugar; suporte obrigatório a modo claro e modo escuro.

---

## Identidade visual e UX

### Cores (branding)

- **Primary:** `#951b81`
- **Secondary:** `#49bab6`

### Layout

- Minimalista, limpo e moderno.

### Princípios de UX

- **Acessível:** Experiência simples para qualquer usuário.
- **Design centralizado:** Tema, cores e tokens de design em um único lugar (ex.: CSS variables e configuração Tailwind/shadcn), para que refatorações do front exijam alterações em poucos arquivos.

### Tema

- Obrigatório suporte a **modo claro** e **modo escuro**.

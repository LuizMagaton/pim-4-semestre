# VendeSprint AI

MVP funcional de um workspace brasileiro para transformar briefing de produto em campanhas e conteúdos editáveis. A interface usa português brasileiro, BRL, dark mode por padrão e autenticação real do Manus OAuth fornecida pelo starter Webdev.

## O que está pronto

O fluxo principal está implementado: landing pública; login/logout real; dashboard com dados persistidos; criação de campanha com briefing, geração server-side via `invokeLLM`, fallback transparente de rascunho assistido, edição, cópia, biblioteca, gerador de conteúdo, modelos de WhatsApp com link `wa.me`, calculadora financeira, planos apresentados e créditos com reserva, devolução em falha, histórico e idempotência por `requestId`.

As regras de propriedade são aplicadas no servidor: todas as consultas tRPC protegidas filtram pelo usuário autenticado. O frontend não recebe chaves da IA. Saídas de IA são sugestões editáveis; o produto não inventa estoque, avaliações, escassez, descontos ou características não informadas.

## Stack e estrutura

O projeto usa React, TypeScript, Vite, Express, tRPC, Drizzle ORM e MySQL gerenciado. O esquema está em `drizzle/schema.ts`, com migrações versionadas em `drizzle/`. O servidor está em `server/`, a interface em `client/src/` e o manifesto de rotas em `client/public/manus-routes.json`.

## Desenvolvimento

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Para a lista de requisitos do ambiente e o passo a passo completo de instalação, consulte `requirements.txt` e `INSTALACAO.md`. Este projeto usa Node.js/TypeScript; portanto, as dependências são instaladas com `pnpm install`, e não com `pip`.

O ambiente Webdev injeta `DATABASE_URL`, `MANUS_PROJECT_ID`, `MANUS_JWT_SECRET`, `MANUS_OAUTH_API_URL`, `MANUS_API_URL` e `MANUS_API_KEY`. Não coloque esses valores no frontend ou em commits.

Checks disponíveis:

```bash
pnpm check
pnpm test
pnpm build
```

## IA

A integração usa o endpoint oficial do ambiente por meio de `server/_core/llm.ts`. A geração de campanha custa 3 créditos e a geração de conteúdo custa 2. O usuário recebe um rascunho assistido claramente sinalizado quando o provedor estiver indisponível; esse fallback não cria fatos comerciais.

## Integrações ainda dependentes de configuração

Mercado Pago ainda precisa de credenciais de teste e produção, URLs de webhook, validação de assinatura no servidor e regras de renovação/cancelamento antes de liberar checkout. E-mail transacional e verificação de e-mail dependem de um provedor configurado. WhatsApp Business Platform oficial depende de app Meta, número, templates aprovados e políticas; o MVP abre apenas mensagens preenchidas via `wa.me`, sem disparos automáticos. Páginas públicas de venda, encurtador/UTM, calendário de datas móveis e painel administrativo completo ficam para a segunda/terceira etapa.

## Segurança e LGPD

A sessão usa `webdev_app_session` com `SameSite=None; Secure` para funcionar no Preview HTTPS embutido. O starter valida o JWT server-side. As páginas públicas de Termos e Privacidade deixam explícito que este texto deve ser revisado juridicamente antes da operação comercial. Não usar dados de clientes para treinamento sem consentimento válido.

## Publicação

O Dockerfile e `/api/health` já estão preparados pelo starter. Antes de publicar, revisar variáveis de produção, configurar Mercado Pago em ambiente separado, revisar os documentos legais, executar `pnpm check`, `pnpm test` e `pnpm build`, criar checkpoint no repositório canônico e só então solicitar publicação.

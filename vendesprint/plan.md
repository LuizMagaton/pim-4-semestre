# VendeSprint AI — plano técnico e design

## Abordagem de implementação

O MVP será construído sobre o starter gerenciado React + TypeScript + Vite no cliente, Express + tRPC no servidor e Drizzle sobre o MySQL gerenciado do projeto. A autenticação permanecerá no Manus OAuth fornecido pelo starter, com sessão `webdev_app_session`, validação server-side e isolamento por `user.id`. O banco será estendido com campanhas, conteúdos salvos, lançamentos de créditos e preferências de conta; migrações serão versionadas em `drizzle/`.

A camada de domínio ficará no servidor: procedimentos tRPC protegidos validam entradas com Zod, consultam apenas registros do usuário autenticado e registram consumo de créditos com idempotência simples por `requestId`. A geração de campanha usa o `invokeLLM` oficial em `server/_core/llm.ts`, com prompt especializado e fallback claramente identificado como rascunho assistido quando o provedor estiver indisponível. O cliente nunca recebe chaves. Pagamentos Mercado Pago, e-mail transacional, WhatsApp Business e páginas públicas ficarão documentados como integrações da próxima etapa, sem simulação de checkout ou disparos.

O frontend terá uma landing pública e um workspace autenticado em uma única experiência responsiva. A navegação lateral alterna Dashboard, Nova campanha, Conteúdo, WhatsApp, Calculadora, Biblioteca, Planos e Configurações. Os fluxos críticos do MVP são reais: login, criação/geração de campanha, edição, salvamento, favoritos, cópia de peças, cálculo financeiro, consulta de histórico e visualização do saldo/limites.

## Estrutura principal

- `client/src/pages/Home.tsx`: landing pública e shell do workspace autenticado.
- `client/src/index.css`: identidade visual, dark mode padrão e responsividade.
- `client/src/components/`: primitives acessíveis do starter e componentes de apoio.
- `server/routers.ts`: autenticação, dashboard, campanhas, conteúdos e créditos.
- `server/db.ts`: queries e mutações Drizzle com escopo por usuário.
- `drizzle/schema.ts` e `drizzle/*.sql`: modelo persistente e migrações.
- `server/_core/llm.ts`: integração oficial de IA já fornecida pelo ambiente.
- `public/manus-routes.json`: manifesto das rotas públicas e do workspace.
- `README.md`: execução, ambiente, integração externa e deploy.

## Design

### Alternativas consideradas

- **Neo-editorial noturno** (0,07): editorial premium com painéis densos, tipografia forte e acentos elétricos.
- **Growth console neon** (0,05): console de operação com gradientes discretos e sinais de performance.
- **Soft commerce studio** (0,08): estúdio claro e acolhedor para pequenos lojistas.

### Escolha: Neo-editorial noturno

- **Movimento:** dashboard editorial de alta performance, inspirado em software financeiro premium e estúdios de campanha.
- **Princípios:** foco no próximo movimento; densidade sem ruído; confiança por transparência; ação sempre visível.
- **Filosofia de cor:** base grafite quase preta para reduzir fadiga e elevar o contraste; branco quente para leitura; verde-lima elétrico como assinatura de progresso e conversão; azul-violeta apenas para estados de IA e navegação.
- **Paradigma de layout:** barra lateral fixa no desktop, faixa de contexto no topo e painéis assimétricos com uma ação principal dominante; no mobile, a barra vira navegação horizontal compacta.
- **Elementos assinatura:** marca em forma de raio dobrado; chips de status com borda luminosa; cards com linha de acento superior e micrográficos de operação.
- **Interação:** cada tela responde a uma pergunta operacional — “o que posso publicar agora?” — e mantém o resultado editável, copiável e salvável.
- **Animação:** entrada curta em opacidade + deslocamento de 8px; hover com elevação mínima e brilho controlado; sem loops decorativos que distraiam o usuário.
- **Tipografia:** Manrope para interface e títulos, com escala compacta e peso 700–800; Inter fallback para dados e textos longos; números em tabular-nums.
- **Essência da marca:** “Transforme uma ideia de produto em uma campanha pronta para vender — sem improviso.” Personalidade: prática, afiada, confiável.
- **Voz:** direta, encorajadora e honesta. Exemplos: “Dê um briefing. Saia com uma campanha publicável.” / “Sem estoque inventado. Sem promessa que você não pode cumprir.”
- **Logotipo:** wordmark “VendeSprint” com o “S” cortado por um raio ascendente; símbolo independente usa dois traços angulares formando um play/raio.
- **Cor proprietária:** `#C7F36B`, verde-lima que representa velocidade com responsabilidade.

## Entrega e publicação

Após os checks, o projeto será compilado com `pnpm build`, versionado no repositório canônico e preparado para publicação pelo Dockerfile já configurado. A URL pública só será informada se uma publicação efetiva for confirmada. Pendências externas ficam em `.env.example` e no README, sem segredos reais.

# VendeSprint AI — TODO de entrega

## Fundação, identidade e publicação

- [ ] O projeto deve usar a identidade VendeSprint AI em português brasileiro, moeda BRL e fuso America/Sao_Paulo, com interface premium, moderna, tecnológica e comercial, dark mode elegante como padrão, opção de light mode, responsividade desktop/tablet/celular, logo tipográfica original e favicon.
- [ ] A aplicação deve servir `GET /manus-routes.json` com o conjunto de rotas reais da landing, workspace e páginas legais, sem APIs ou assets no manifesto.
- [ ] O README deve documentar instalação, execução, deploy, variáveis de ambiente, banco, integrações, testes e manutenção; ambientes de desenvolvimento e produção devem manter credenciais separadas quando integrações externas forem configuradas.

## Acesso e conta

- [ ] O usuário deve conseguir iniciar login real, entrar, sair e ter sessão segura; a área protegida deve exigir autorização server-side e cada usuário deve ver somente os próprios dados.
- [ ] O produto deve ter onboarding inicial, perfil, preferências, exclusão e exportação de dados documentadas; login Google fica preparado somente se o provedor estiver configurado no ambiente.

## MVP de campanha e conteúdo

- [ ] O usuário autenticado deve conseguir informar nome, descrição, categoria, preços, público-alvo, diferencial, canal, objetivo, tom e data do produto; escolher Black Friday, Natal, Ano-Novo, Cyber Monday, volta às aulas ou campanha personalizada.
- [ ] A geração deve retornar conceito, título, subtítulo, descrição, benefícios, CTA, legenda Instagram, roteiros 15/30/60 segundos, hashtags, texto WhatsApp, follow-up, ideias de criativos e calendário de publicação, sem inventar características, estoque, avaliações, escassez ou descontos.
- [ ] O usuário deve conseguir editar, regenerar uma parte, copiar, salvar, favoritar, exportar e consultar campanhas salvas; o resultado deve manter os dados de entrada visíveis para correção.
- [ ] O gerador de conteúdo deve oferecer legendas, títulos, descrições, hashtags, ganchos, roteiros UGC, anúncios e CTAs por canal TikTok, Instagram, Facebook, Pinterest e WhatsApp e por estilo persuasivo, descontraído, profissional, emocional, urgente sem falsa escassez e informativo.
- [ ] O gerador de WhatsApp deve oferecer modelos de divulgação, lançamento, apresentação, recuperação de interesse, pós-venda e relacionamento, permitir personalização e abrir o link oficial `wa.me`; não deve disparar mensagens nem importar contatos sem consentimento.

## Operação e finanças

- [ ] O dashboard deve mostrar saudação personalizada, campanhas criadas, créditos disponíveis, links/cliques quando existirem, atividades recentes, atalhos, sugestões sazonais e avisos de limite; estados vazios devem orientar a próxima ação e números não podem ser fictícios apresentados como resultados.
- [ ] A calculadora deve receber custo, preço de venda, taxas, frete subsidiado, comissão, impostos opcionais e despesas adicionais e mostrar receita, custos, lucro líquido estimado, margem, ponto de equilíbrio, preço mínimo e simulador de descontos/combos, distinguindo faturamento de lucro.
- [ ] Cada operação de IA deve registrar usuário, tipo, custo, data e resultado; o sistema deve impedir consumo acima do limite, evitar duplicidade por repetição, mostrar saldo/histórico e permitir custo configurável em uma futura área administrativa.
- [ ] Planos Free, Starter (R$ 19,90/mês), Pro (R$ 39,90/mês) e Sazonal (R$ 49,90 pagamento único até 15/01/2027) devem ser apresentados como configuráveis; pagamento Mercado Pago com Pix/cartão, webhooks e permissões só deve ser liberado após configuração real de credenciais e confirmação server-side.

## Biblioteca e próximos módulos

- [ ] A biblioteca deve ter histórico com filtros por data, canal, produto, campanha e status, além de duplicar, editar, arquivar, excluir, favoritar e exportar; organizar por pasta/projeto quando o módulo for expandido.
- [ ] A segunda etapa deve incluir páginas públicas de venda com URL exclusiva, publicação/despublicação, cliques/UTM e aviso de que não há processamento de pagamento/entrega de terceiros.
- [ ] A segunda etapa deve incluir encurtador interno, identificador único, UTMs e relatórios de visualizações/cliques/conversões somente quando registrados ou integrados, sem afirmar que clique é venda.
- [ ] A terceira etapa deve incluir calendário atualizável de datas comerciais brasileiras, lembretes, integrações adicionais, automações e relatórios avançados; datas móveis não devem depender de hardcode incorreto.

## Qualidade e segurança

- [ ] Formulários devem validar no cliente e no servidor, ter feedback de carregamento/sucesso/erro, confirmação de exclusão, tooltips e nenhum botão sem ação.
- [ ] O servidor deve aplicar proteção de rotas, validação server-side, consultas parametrizadas via ORM, controle de sessão, rate limit/limites de uso, logs sem dados sensíveis e segredos fora do frontend.
- [ ] Devem existir testes unitários ou de integração para autenticação, isolamento de dados, créditos, geração de IA, checkout preparado e permissões; `pnpm check`, `pnpm test` e `pnpm build` devem concluir sem erros.
- [ ] Devem existir páginas de Termos de uso, Privacidade e canal de solicitações LGPD; dados de clientes não podem ser usados para treinamento sem consentimento válido.

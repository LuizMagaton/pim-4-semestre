# Instalação do VendeSprint AI

## Observação importante

O VendeSprint AI é um projeto **Node.js/TypeScript**. O arquivo `requirements.txt` registra os requisitos do ambiente, mas não deve ser executado com `pip`. As dependências do projeto são instaladas com `pnpm install` a partir do `package.json` e do `pnpm-lock.yaml`.

## Requisitos

- Node.js 20 ou superior;
- pnpm 10.18.0;
- MySQL 8 ou superior;
- Git 2.40 ou superior;
- acesso às credenciais do ambiente OAuth/Manus e do provedor de IA.

## Instalação

1. Instale o Node.js 20+.
2. Ative o pnpm com `corepack enable` e confirme a versão com `pnpm --version`.
3. Descompacte o projeto e entre na pasta raiz:

```bash
cd vendesprint
```

4. Instale as dependências JavaScript:

```bash
pnpm install
```

5. Configure as variáveis de ambiente no ambiente de execução. Nunca publique essas chaves no frontend ou no Git:

```text
DATABASE_URL=mysql://usuario:senha@host:3306/vendesprint
MANUS_PROJECT_ID=seu-projeto
MANUS_JWT_SECRET=segredo-do-ambiente
MANUS_OAUTH_API_URL=url-do-oauth
MANUS_API_URL=url-da-api
MANUS_API_KEY=chave-da-api
```

6. Crie o banco MySQL e aplique as migrações:

```bash
pnpm db:migrate
```

7. Inicie o modo de desenvolvimento:

```bash
pnpm dev
```

O endereço padrão é `http://localhost:3000`.

## Verificação

Antes de publicar, execute:

```bash
pnpm check
pnpm test
pnpm build
```

Para executar a versão compilada:

```bash
pnpm start
```

## Estrutura principal

- `client/`: interface React;
- `server/`: servidor Express, autenticação, tRPC e integração de IA;
- `drizzle/`: schema e migrações do banco;
- `shared/`: tipos e utilitários compartilhados;
- `package.json`: scripts e dependências;
- `pnpm-lock.yaml`: versões exatas para instalação reprodutível.

## Limites de configuração

Mercado Pago, e-mail transacional e WhatsApp Business oficial ainda exigem credenciais, webhooks e configurações externas. O MVP utiliza link `wa.me` para abrir mensagens preenchidas e não realiza disparos automáticos.

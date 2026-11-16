import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

const campaignInputSchema = z.object({
  productName: z.string().min(2, "Informe o nome do produto").max(180),
  description: z.string().min(10, "Descreva o produto em pelo menos 10 caracteres").max(4000),
  category: z.string().min(2).max(100),
  currentPrice: z.string().min(1).max(40),
  previousPrice: z.string().max(40).optional().default(""),
  audience: z.string().min(2).max(300),
  differential: z.string().max(500).optional().default(""),
  channel: z.string().min(2).max(40),
  objective: z.string().min(2).max(80),
  tone: z.string().min(2).max(50),
  occasion: z.string().min(2).max(80),
  campaignDate: z.string().max(30).optional().default(""),
});

type CampaignInput = z.infer<typeof campaignInputSchema>;
const campaignResultSchema = z.object({
  concept: z.string().max(4000), title: z.string().min(2).max(220), subtitle: z.string().max(1000), description: z.string().max(4000),
  benefits: z.array(z.string().max(500)).max(10), cta: z.string().max(300), instagramCaption: z.string().max(4000),
  reel15: z.string().max(2500), reel30: z.string().max(3000), reel60: z.string().max(4500), hashtags: z.array(z.string().max(80)).max(20),
  whatsapp: z.string().max(3000), followUp: z.array(z.string().max(800)).max(10), creativeIdeas: z.array(z.string().max(800)).max(10),
  calendar: z.array(z.string().max(800)).max(10), source: z.enum(["ai", "assistido"]),
});
type CampaignResult = z.infer<typeof campaignResultSchema>;

const stripJsonFence = (text: string) => text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
const withTimeout = async <T>(promise: Promise<T>, ms: number) => Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("LLM timeout")), ms))]);
const PLAN_LIMITS = { free: 10, starter: 40, pro: 120, seasonal: 25 } as const;
type PlanName = keyof typeof PLAN_LIMITS;
const saoPauloDayStart = () => {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return new Date(`${date}T00:00:00-03:00`);
};
async function ensureGenerationEntitlement(userId: number, cost: number) {
  const user = await db.getUserById(userId);
  const plan = (user?.plan ?? "free") as PlanName;
  const usedToday = await db.countCompletedCreditsSince(userId, saoPauloDayStart());
  if (usedToday + cost > PLAN_LIMITS[plan]) throw new TRPCError({ code: "FORBIDDEN", message: `O plano ${plan} atingiu o limite diário de ${PLAN_LIMITS[plan]} créditos. Consulte Planos para escolher outro limite.` });
}

function readCompletion(result: Awaited<ReturnType<typeof invokeLLM>>) {
  const content = result.choices?.[0]?.message?.content;
  if (Array.isArray(content)) return content.map(part => "text" in part ? part.text : "").join("\n");
  return typeof content === "string" ? content : "";
}

function fallbackCampaign(input: CampaignInput): CampaignResult {
  const priceLine = input.previousPrice ? ` por ${input.currentPrice} (antes: ${input.previousPrice})` : ` por ${input.currentPrice}`;
  return {
    concept: `Uma campanha honesta para apresentar ${input.productName} a ${input.audience}, destacando apenas as informações fornecidas.`,
    title: `${input.productName}: uma escolha que faz sentido para você`,
    subtitle: input.differential || `Conheça os detalhes de ${input.productName}.`,
    description: `${input.description} Disponível${priceLine}.`,
    benefits: ["Comunicação clara sobre o produto", "Mensagem adaptada ao público informado", "CTA direto para o próximo passo"],
    cta: "Quero conhecer melhor",
    instagramCaption: `${input.productName}\n\n${input.description}\n\nPara: ${input.audience}.\n\n${input.differential || "Veja os detalhes e decida com calma."}\n\n${priceLine}.\n\nQuero conhecer melhor: link na bio.`,
    reel15: `Gancho: você está procurando ${input.category}? Apresente ${input.productName} com base em: ${input.description}. Feche com: ${"Quero conhecer melhor"}.`,
    reel30: `0–5s: pergunta para ${input.audience}. 5–20s: mostre ${input.productName} e diga apenas: ${input.description}. 20–30s: reforce ${input.differential || "o diferencial informado"} e convide para conhecer.`,
    reel60: `Abertura com uma situação de ${input.audience}. Contextualize ${input.productName}, apresente a descrição real, explique ${input.differential || "o diferencial informado"} e finalize com o CTA: Quero conhecer melhor.`,
    hashtags: [`#${input.category.replace(/[^a-zA-Z0-9]/g, "")}`, "#achadinhos", "#comprasinteligentes", "#vendasonline"],
    whatsapp: `Oi! Separei uma opção que pode fazer sentido para você: ${input.productName}.\n\n${input.description}\n\n${priceLine}.\n\nSe quiser, te envio o link para ver os detalhes.`,
    followUp: ["Passando para saber se conseguiu ver os detalhes do produto.", "Ficou alguma dúvida sobre o que eu te enviei?", "Se fizer sentido para você, posso te mandar o link novamente."],
    creativeIdeas: ["Demonstração do produto em uso, sem promessas não comprovadas", "Carrossel com descrição, diferencial e preço informado", "Vídeo curto respondendo uma dúvida comum do público"],
    calendar: ["Dia 1: apresentar o problema e o produto", "Dia 3: explicar o diferencial informado", "Dia 5: responder dúvidas e reforçar o CTA"],
    source: "assistido",
  };
}

async function generateCampaignWithAI(input: CampaignInput): Promise<CampaignResult> {
  const prompt = `Você é um estrategista de marketing brasileiro. Gere uma campanha em português do Brasil usando exclusivamente os dados fornecidos. Nunca invente características, avaliações, estoque, escassez, cupons, descontos ou garantias. Se algo não foi informado, escreva de forma neutra. Retorne SOMENTE um JSON válido com as chaves: concept, title, subtitle, description, benefits (array), cta, instagramCaption, reel15, reel30, reel60, hashtags (array), whatsapp, followUp (array), creativeIdeas (array), calendar (array).\n\nDados do briefing:\n${JSON.stringify(input)}`;
  try {
    const response = await withTimeout(invokeLLM({
      messages: [
        { role: "system", content: "Você escreve campanhas comerciais claras, honestas e prontas para edição." },
        { role: "user", content: prompt },
      ],
      maxTokens: 3000,
    }), 45_000);
    const parsed = campaignResultSchema.omit({ source: true }).parse(JSON.parse(stripJsonFence(readCompletion(response))));
    return { ...parsed, source: "ai" };
  } catch (error) {
    console.warn("[Campaigns] AI unavailable, using transparent assisted draft", error instanceof Error ? error.message : "unknown");
    return fallbackCampaign(input);
  }
}

const contentInputSchema = z.object({
  kind: z.string().min(2).max(50),
  channel: z.string().min(2).max(40),
  style: z.string().min(2).max(50),
  productName: z.string().min(2).max(180),
  context: z.string().min(5).max(2000),
});
const contentResultSchema = z.object({ title: z.string().min(2).max(220), body: z.string().min(2).max(5000), source: z.enum(["ai", "assistido"]) });

function fallbackContent(input: z.infer<typeof contentInputSchema>) {
  return {
    title: `${input.productName}: uma mensagem para ${input.channel}`,
    body: `${input.context}\n\nConheça ${input.productName} e veja se faz sentido para você.`,
    source: "assistido" as const,
  };
}

async function generateContentWithAI(input: z.infer<typeof contentInputSchema>) {
  try {
    const response = await withTimeout(invokeLLM({
      messages: [
        { role: "system", content: "Você cria conteúdo comercial brasileiro, claro, editável e sem inventar informações." },
        { role: "user", content: `Gere um JSON com title e body. Tipo: ${input.kind}. Canal: ${input.channel}. Estilo: ${input.style}. Produto: ${input.productName}. Contexto real: ${input.context}. Não crie descontos, avaliações, escassez ou características que não estejam no contexto.` },
      ],
      maxTokens: 900,
    }), 30_000);
    const parsed = contentResultSchema.omit({ source: true }).parse(JSON.parse(stripJsonFence(readCompletion(response))));
    return { ...parsed, source: "ai" as const };
  } catch (error) {
    console.warn("[Content] AI unavailable, using transparent assisted draft", error instanceof Error ? error.message : "unknown");
    return fallbackContent(input);
  }
}

export const appRouter = router({
  system: router({
    health: publicProcedure.query(() => ({ ok: true, service: "vendesprint" })),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dashboard: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      const [campaignCount, contentCount, recentCampaigns, recentCredits] = await Promise.all([
        db.countCampaigns(ctx.user.id),
        db.countContent(ctx.user.id),
        db.listCampaigns(ctx.user.id),
        db.listCredits(ctx.user.id),
      ]);
      return {
        user: user ?? ctx.user,
        campaignCount,
        contentCount,
        recentCampaigns: recentCampaigns.slice(0, 5).map(campaign => ({ ...campaign, inputData: JSON.parse(campaign.inputData), resultData: JSON.parse(campaign.resultData) })),
        recentCredits: recentCredits.slice(0, 5),
      };
    }),
  }),
  campaigns: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const rows = await db.listCampaigns(ctx.user.id);
      return rows.map(campaign => ({ ...campaign, inputData: JSON.parse(campaign.inputData), resultData: JSON.parse(campaign.resultData) }));
    }),
    generate: protectedProcedure.input(z.object({ input: campaignInputSchema, requestId: z.string().min(8).max(100) })).mutation(async ({ ctx, input }) => {
      const existing = await db.getCreditRequest(ctx.user.id, input.requestId);
      if (existing?.status === "completed" && existing.resultData) return JSON.parse(existing.resultData);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Esta geração já está em processamento ou foi encerrada. Gere novamente com um novo pedido." });
      const cost = 3;
      await ensureGenerationEntitlement(ctx.user.id, cost);
      const balanceAfter = await db.reserveCredits(ctx.user.id, cost);
      if (balanceAfter === null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Você não tem créditos suficientes para gerar esta campanha." });
      try {
        await db.addCreditEntry({ userId: ctx.user.id, operation: "campaign.generate", requestId: input.requestId, amount: -cost, balanceAfter, status: "reserved", resultData: null });
      } catch {
        await db.refundCredits(ctx.user.id, cost);
        const winner = await db.getCreditRequest(ctx.user.id, input.requestId);
        if (winner?.status === "completed" && winner.resultData) return JSON.parse(winner.resultData);
        throw new TRPCError({ code: "CONFLICT", message: "Esta geração já está em processamento. Aguarde o resultado." });
      }
      try {
        const result = await generateCampaignWithAI(input.input);
        return await db.finalizeCampaignGeneration(ctx.user.id, input.requestId, {
          userId: ctx.user.id, productName: input.input.productName, title: result.title, channel: input.input.channel,
          objective: input.input.objective, tone: input.input.tone, occasion: input.input.occasion, status: "generated", isFavorite: 0,
          inputData: JSON.stringify(input.input), resultData: JSON.stringify(result),
        }, result, balanceAfter);
      } catch {
        await db.refundCredits(ctx.user.id, cost);
        const current = await db.getUserById(ctx.user.id);
        await db.updateCreditEntry(ctx.user.id, input.requestId, { amount: cost, balanceAfter: current?.creditsBalance ?? 0, status: "refunded", resultData: null });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível gerar a campanha. Seus créditos foram devolvidos; tente novamente." });
      }
    }),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().min(2).max(220), resultData: campaignResultSchema, isFavorite: z.number().int().min(0).max(1).optional(), status: z.enum(["draft", "generated", "archived"]).optional() })).mutation(async ({ ctx, input }) => {
      const row = await db.updateCampaign(ctx.user.id, input.id, { title: input.title, resultData: JSON.stringify(input.resultData), ...(input.isFavorite === undefined ? {} : { isFavorite: input.isFavorite }), ...(input.status ? { status: input.status } : {}) });
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Campanha não encontrada." });
      return { ...row, inputData: JSON.parse(row.inputData), resultData: JSON.parse(row.resultData) };
    }),
    duplicate: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const row = await db.getCampaign(ctx.user.id, input.id);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Campanha não encontrada." });
      const id = await db.insertCampaign({ ...row, id: undefined, title: `${row.title} — cópia`, status: "draft", createdAt: undefined, updatedAt: undefined });
      return { id };
    }),
    remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await db.deleteCampaign(ctx.user.id, input.id);
      return { success: true };
    }),
  }),
  contents: router({
    list: protectedProcedure.query(async ({ ctx }) => db.listContent(ctx.user.id)),
    generate: protectedProcedure.input(z.object({ input: contentInputSchema, requestId: z.string().min(8).max(100) })).mutation(async ({ ctx, input }) => {
      const existing = await db.getCreditRequest(ctx.user.id, input.requestId);
      if (existing?.status === "completed" && existing.resultData) return JSON.parse(existing.resultData);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Esta geração já está em processamento ou foi encerrada. Gere novamente com um novo pedido." });
      const cost = 2;
      await ensureGenerationEntitlement(ctx.user.id, cost);
      const balanceAfter = await db.reserveCredits(ctx.user.id, cost);
      if (balanceAfter === null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Você não tem créditos suficientes para gerar este conteúdo." });
      try {
        await db.addCreditEntry({ userId: ctx.user.id, operation: "content.generate", requestId: input.requestId, amount: -cost, balanceAfter, status: "reserved", resultData: null });
      } catch {
        await db.refundCredits(ctx.user.id, cost);
        const winner = await db.getCreditRequest(ctx.user.id, input.requestId);
        if (winner?.status === "completed" && winner.resultData) return JSON.parse(winner.resultData);
        throw new TRPCError({ code: "CONFLICT", message: "Esta geração já está em processamento. Aguarde o resultado." });
      }
      try {
        const result = await generateContentWithAI(input.input);
        return await db.finalizeContentGeneration(ctx.user.id, input.requestId, {
          userId: ctx.user.id, kind: input.input.kind, channel: input.input.channel, style: input.input.style,
          productName: input.input.productName, title: result.title, body: result.body, isFavorite: 0,
        }, result, balanceAfter);
      } catch {
        await db.refundCredits(ctx.user.id, cost);
        const current = await db.getUserById(ctx.user.id);
        await db.updateCreditEntry(ctx.user.id, input.requestId, { amount: cost, balanceAfter: current?.creditsBalance ?? 0, status: "refunded", resultData: null });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível gerar o conteúdo. Seus créditos foram devolvidos." });
      }
    }),
  }),
  credits: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      return { balance: user?.creditsBalance ?? 0, plan: user?.plan ?? "free", entries: await db.listCredits(ctx.user.id) };
    }),
  }),
});

export type AppRouter = typeof appRouter;

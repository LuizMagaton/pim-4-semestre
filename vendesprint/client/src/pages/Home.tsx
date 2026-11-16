import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  CircleHelp,
  Clipboard,
  Copy,
  ExternalLink,
  FileText,
  Heart,
  LayoutDashboard,
  Library,
  Lightbulb,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  PenLine,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";

const navItems = [
  { id: "dashboard", label: "Visão geral", icon: LayoutDashboard },
  { id: "campaign", label: "Nova campanha", icon: WandSparkles },
  { id: "content", label: "Conteúdo", icon: PenLine },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "calculator", label: "Calculadora", icon: Calculator },
  { id: "library", label: "Biblioteca", icon: Library },
  { id: "plans", label: "Planos", icon: Zap },
];

type View = (typeof navItems)[number]["id"] | "settings";
type CampaignInput = {
  productName: string;
  description: string;
  category: string;
  currentPrice: string;
  previousPrice: string;
  audience: string;
  differential: string;
  channel: string;
  objective: string;
  tone: string;
  occasion: string;
  campaignDate: string;
};
type CampaignResult = {
  concept: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  cta: string;
  instagramCaption: string;
  reel15: string;
  reel30: string;
  reel60: string;
  hashtags: string[];
  whatsapp: string;
  followUp: string[];
  creativeIdeas: string[];
  calendar: string[];
  source: "ai" | "assistido";
};

type GeneratedCampaign = { campaignId: number; result: CampaignResult; balanceAfter: number };

const emptyCampaign: CampaignInput = {
  productName: "",
  description: "",
  category: "",
  currentPrice: "",
  previousPrice: "",
  audience: "",
  differential: "",
  channel: "Instagram",
  objective: "Gerar interesse",
  tone: "Profissional",
  occasion: "Campanha personalizada",
  campaignDate: "",
};

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateLabel = (value: Date | string | number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value));
const todayLabel = () => new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" }).format(new Date()).toUpperCase();

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? "compact" : ""}`}><span className="brand-mark">↗</span><span>Vende<span>Sprint</span><b>AI</b></span></div>;
}

function Landing() {
  const { theme, toggleTheme } = useTheme();
  return (
    <main className="landing">
      <nav className="landing-nav container-wide">
        <Brand />
        <div className="landing-links"><a href="#como-funciona">Como funciona</a><a href="#ferramentas">Ferramentas</a><a href="#planos">Planos</a></div>
        <div className="nav-actions"><button className="icon-button" aria-label="Alternar tema" onClick={toggleTheme}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button><button className="login-button" onClick={startLogin}>Entrar</button><Button onClick={startLogin} className="button-lime">Começar grátis <ArrowRight size={16} /></Button></div>
      </nav>
      <section className="hero container-wide">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> Marketing que sai do rascunho</div>
          <h1>Dê um briefing.<br /><em>Saia vendendo.</em></h1>
          <p className="hero-lead">O VendeSprint AI transforma informações simples do seu produto em campanhas, conteúdos e mensagens prontas para publicar — sem inventar o que não existe.</p>
          <div className="hero-actions"><Button onClick={startLogin} className="button-lime button-large">Criar minha primeira campanha <ArrowRight size={17} /></Button><a href="#como-funciona" className="text-link">Ver como funciona <span>↓</span></a></div>
          <div className="hero-proof"><div className="proof-line"><Check size={14} /> Sem cartão de crédito</div><div className="proof-line"><Check size={14} /> Plano grátis para começar</div><div className="proof-line"><Check size={14} /> Conteúdo editável</div></div>
        </div>
        <div className="hero-visual">
          <div className="hero-glow" />
          <div className="campaign-preview">
            <div className="preview-top"><div><span className="mini-label">CAMPANHA EM FOCO</span><h3>Kit rotina leve</h3></div><span className="status-pill"><span /> IA pronta</span></div>
            <div className="preview-art"><div className="art-sun" /><div className="art-card"><span>BRIEFING</span><strong>Uma rotina<br />que cabe no dia.</strong><small>Instagram · Profissional</small></div><div className="art-side-line one" /><div className="art-side-line two" /></div>
            <div className="preview-grid"><div><span>ÂNGULO</span><strong>Praticidade real</strong></div><div><span>CTA</span><strong>Quero conhecer</strong></div></div>
            <div className="preview-bottom"><div className="avatar-stack"><span>VS</span><span>AI</span></div><span>Campanha gerada com briefing real</span><ArrowRight size={15} /></div>
          </div>
          <div className="floating-chip chip-top"><Sparkles size={14} /> <span>+ 12 peças prontas</span></div>
          <div className="floating-chip chip-bottom"><TrendingUp size={14} /> <span>Mais clareza. Menos retrabalho.</span></div>
        </div>
      </section>
      <section className="trust-strip container-wide"><span>Feito para quem vende em</span><strong>Instagram</strong><strong>WhatsApp</strong><strong>Marketplaces</strong><strong>Pequenos e-commerces</strong></section>
      <section className="section-block container-wide" id="como-funciona"><div className="section-intro"><p className="eyebrow">DO BRIEFING À PUBLICAÇÃO</p><h2>Uma sprint comercial<br /><em>em poucos minutos.</em></h2><p>Você traz o contexto. A plataforma organiza a estratégia e entrega peças prontas para você revisar, editar e publicar.</p></div><div className="steps"><div className="step-card"><span>01</span><Lightbulb size={22} /><h3>Conte o essencial</h3><p>Produto, público, preço, diferencial e objetivo. Só o que você já sabe.</p></div><div className="step-card accent"><span>02</span><WandSparkles size={22} /><h3>Receba a campanha</h3><p>Conceito, copy, roteiros, WhatsApp, hashtags e calendário num só lugar.</p></div><div className="step-card"><span>03</span><Send size={22} /><h3>Publique com confiança</h3><p>Edite, copie e leve cada peça para o canal certo — sem promessa inventada.</p></div></div></section>
      <section className="feature-band" id="ferramentas"><div className="container-wide feature-layout"><div><p className="eyebrow">SEU ESTÚDIO DE CRESCIMENTO</p><h2>Menos abas.<br /><em>Mais ação.</em></h2><p>As ferramentas trabalham juntas para você não perder o fio entre estratégia, conteúdo e venda.</p><Button onClick={startLogin} className="button-outline-light">Conhecer o workspace <ArrowRight size={16} /></Button></div><div className="feature-list"><div><span className="feature-number">01</span><div><h3>Campanhas completas</h3><p>Uma entrada simples vira um plano de publicação organizado.</p></div><WandSparkles size={20} /></div><div><span className="feature-number">02</span><div><h3>Conteúdo por canal</h3><p>Legenda, anúncio, gancho e roteiro no formato que seu público consome.</p></div><PenLine size={20} /></div><div><span className="feature-number">03</span><div><h3>Decisão com números</h3><p>Veja margem e lucro estimado antes de chamar uma venda de “resultado”.</p></div><BarChart3 size={20} /></div></div></div></section>
      <section className="section-block container-wide" id="planos"><div className="section-intro centered"><p className="eyebrow">COMECE NO SEU RITMO</p><h2>Planos claros.<br /><em>Sem surpresa.</em></h2><p>O plano grátis é suficiente para você sentir o valor na primeira campanha.</p></div><div className="pricing-grid"><PlanCard name="Free" price="R$ 0" detail="para experimentar" items={["10 créditos iniciais", "Campanhas com IA", "Calculadora de margem", "Biblioteca pessoal"]} /><PlanCard featured name="Starter" price="R$ 19,90" detail="por mês" items={["Mais créditos por mês", "Gerador de conteúdo", "Templates WhatsApp", "Histórico organizado"]} /><PlanCard name="Pro" price="R$ 39,90" detail="por mês" items={["Limite ampliado", "Prioridade de geração", "Relatórios e links", "Recursos avançados"]} /></div><p className="pricing-note">Pagamentos reais e permissões server-side serão habilitados após a configuração do Mercado Pago.</p></section>
      <footer className="landing-footer container-wide"><Brand compact /><span>Campanhas mais honestas. Vendas mais consistentes.</span><div><Link href="/termos">Termos</Link><Link href="/privacidade">Privacidade</Link><button onClick={startLogin}>Entrar</button></div></footer>
    </main>
  );
}

function PlanCard({ name, price, detail, items, featured = false }: { name: string; price: string; detail: string; items: string[]; featured?: boolean }) {
  return <div className={`plan-card ${featured ? "featured" : ""}`}>{featured && <span className="plan-badge">Mais escolhido</span>}<p className="plan-name">{name}</p><div className="plan-price">{price}<small>{name === "Free" ? "" : "/mês"}</small></div><p className="plan-detail">{detail}</p><div className="plan-items">{items.map(item => <span key={item}><Check size={14} /> {item}</span>)}</div><Button onClick={startLogin} variant={featured ? "default" : "outline"} className={featured ? "button-lime" : "button-dark-outline"}>{name === "Free" ? "Começar grátis" : "Escolher plano"}</Button></div>;
}

function Workspace({ user, onLogout }: { user: NonNullable<ReturnType<typeof useAuth>["user"]>; onLogout: () => Promise<void> }) {
  const [view, setView] = useState<View>("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const firstName = user.name?.split(" ")[0] || "empreendedor";
  const summary = trpc.dashboard.summary.useQuery(undefined, { staleTime: 10_000 });
  const campaignList = trpc.campaigns.list.useQuery(undefined, { enabled: view === "library" || view === "campaign", staleTime: 5_000 });
  const contentList = trpc.contents.list.useQuery(undefined, { enabled: view === "content", staleTime: 5_000 });
  const credits = trpc.credits.history.useQuery(undefined, { staleTime: 10_000 });
  const utils = trpc.useUtils();

  const navigate = (next: View) => { setView(next); setMobileMenu(false); };
  const refreshAll = () => { void utils.dashboard.summary.invalidate(); void utils.campaigns.list.invalidate(); void utils.credits.history.invalidate(); void utils.contents.list.invalidate(); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
      <div className="sidebar-brand"><Brand compact /><button className="mobile-close icon-button" onClick={() => setMobileMenu(false)}><X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">{navItems.map(item => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}><Icon size={17} /><span>{item.label}</span>{item.id === "campaign" && <span className="nav-plus">+</span>}</button>; })}</nav>
      <div className="sidebar-spacer" />
      <button className={`side-settings ${view === "settings" ? "active" : ""}`} onClick={() => navigate("settings")}><Settings size={17} /><span>Configurações</span></button>
      <div className="sidebar-user"><div className="user-avatar">{(user.name || "V").slice(0, 1).toUpperCase()}</div><div><strong>{user.name || "Seu workspace"}</strong><span>{user.plan === "free" ? "Plano Free" : `Plano ${user.plan}`}</span></div><button className="icon-button"><MoreHorizontal size={17} /></button></div>
    </aside>
    {mobileMenu && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}
    <section className="workspace-main">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMobileMenu(true)}><Menu size={19} /></button><div className="breadcrumb"><span>VendeSprint AI</span><span>/</span><strong>{navItems.find(item => item.id === view)?.label || "Configurações"}</strong></div><div className="topbar-actions"><div className="credit-chip"><Zap size={14} /><strong>{credits.data?.balance ?? user.creditsBalance ?? 0}</strong><span>créditos</span></div><button className="icon-button" onClick={toggleTheme} aria-label="Alternar tema">{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button><button className="top-avatar">{(user.name || "V").slice(0, 1).toUpperCase()}</button></div></header>
      <main className="workspace-content">
        {view === "dashboard" && <Dashboard firstName={firstName} summary={summary.data} onNavigate={navigate} />}
        {view === "campaign" && <CampaignStudio list={campaignList.data || []} onSaved={refreshAll} />}
        {view === "content" && <ContentStudio list={contentList.data || []} onSaved={refreshAll} />}
        {view === "whatsapp" && <WhatsAppStudio />}
        {view === "calculator" && <CalculatorView />}
        {view === "library" && <LibraryView campaigns={campaignList.data || []} onNavigate={navigate} onRefresh={refreshAll} />}
        {view === "plans" && <PlansView currentPlan={user.plan || "free"} />}
        {view === "settings" && <SettingsView user={user} onLogout={onLogout} />}
      </main>
    </section>
  </div>;
}

function Dashboard({ firstName, summary, onNavigate }: { firstName: string; summary?: any; onNavigate: (view: View) => void }) {
  const campaigns = summary?.recentCampaigns || [];
  const credits = summary?.user?.creditsBalance ?? 0;
  return <div className="page-stack"><div className="page-heading dashboard-heading"><div><p className="eyebrow">{todayLabel()}</p><h1>Bom dia, {firstName}. <em>Vamos vender?</em></h1><p>O próximo movimento da sua operação começa aqui.</p></div><Button onClick={() => onNavigate("campaign")} className="button-lime"><Plus size={17} /> Nova campanha</Button></div><div className="metric-grid"><MetricCard label="Campanhas criadas" value={summary?.campaignCount ?? 0} note="neste workspace" icon={WandSparkles} /><MetricCard label="Créditos disponíveis" value={credits} note={credits <= 3 ? "limite próximo" : "para gerar conteúdo"} icon={Zap} accent /><MetricCard label="Conteúdos salvos" value={summary?.contentCount ?? 0} note="peças na biblioteca" icon={Library} /><MetricCard label="Links rastreados" value="—" note="módulo da próxima etapa" icon={BarChart3} /></div><div className="dashboard-grid"><section className="panel campaign-panel"><div className="panel-heading"><div><p className="eyebrow">ÚLTIMAS CAMPANHAS</p><h2>Seu histórico recente</h2></div><button className="inline-link" onClick={() => onNavigate("library")}>Ver biblioteca <ArrowRight size={14} /></button></div>{campaigns.length === 0 ? <EmptyState icon={Sparkles} title="Sua primeira campanha começa com um briefing" text="Conte o essencial do seu produto e receba uma sprint comercial editável." action="Criar campanha" onClick={() => onNavigate("campaign")} /> : <div className="campaign-list">{campaigns.map((campaign: any) => <div className="campaign-row" key={campaign.id}><div className="campaign-icon"><Sparkles size={16} /></div><div className="campaign-row-copy"><strong>{campaign.title}</strong><span>{campaign.productName} · {campaign.channel}</span></div><span className="campaign-status">{campaign.status === "generated" ? "Gerada" : "Rascunho"}</span><span className="campaign-date">{dateLabel(campaign.updatedAt)}</span><ChevronDown size={15} className="row-chevron" /></div>)}</div>}</section><section className="panel quick-panel"><div className="panel-heading"><div><p className="eyebrow">ATALHOS</p><h2>O que você quer fazer?</h2></div></div><div className="quick-actions"><QuickAction icon={WandSparkles} title="Gerar campanha" text="Do briefing ao calendário" onClick={() => onNavigate("campaign")} /><QuickAction icon={PenLine} title="Criar conteúdo" text="Para qualquer canal" onClick={() => onNavigate("content")} /><QuickAction icon={MessageCircle} title="Montar WhatsApp" text="Mensagem com link" onClick={() => onNavigate("whatsapp")} /><QuickAction icon={Calculator} title="Calcular margem" text="Decida com números" onClick={() => onNavigate("calculator")} /></div></section></div><section className="seasonal-banner"><div className="seasonal-icon"><Target size={22} /></div><div><p className="eyebrow">JANELA COMERCIAL</p><h2>Black Friday sem improviso.</h2><p>Monte sua campanha, revise os argumentos e chegue ao dia 27/11 com cada peça pronta para publicar.</p></div><button onClick={() => onNavigate("campaign")} className="banner-arrow"><ArrowRight size={18} /></button></section></div>;
}

function MetricCard({ label, value, note, icon: Icon, accent = false }: { label: string; value: string | number; note: string; icon: any; accent?: boolean }) { return <div className={`metric-card ${accent ? "accent" : ""}`}><div className="metric-top"><span>{label}</span><Icon size={17} /></div><strong>{value}</strong><small>{note}</small></div>; }
function QuickAction({ icon: Icon, title, text, onClick }: { icon: any; title: string; text: string; onClick: () => void }) { return <button className="quick-action" onClick={onClick}><span className="quick-icon"><Icon size={17} /></span><span><strong>{title}</strong><small>{text}</small></span><ArrowRight size={15} /></button>; }
function EmptyState({ icon: Icon, title, text, action, onClick }: { icon: any; title: string; text: string; action: string; onClick: () => void }) { return <div className="empty-state"><span className="empty-icon"><Icon size={21} /></span><h3>{title}</h3><p>{text}</p><Button onClick={onClick} size="sm" className="button-lime">{action} <ArrowRight size={14} /></Button></div>; }

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) { return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>; }
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input className="text-input" {...props} />; }
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className="text-input textarea" {...props} />; }
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select className="text-input" {...props} />; }

function CampaignStudio({ list, onSaved }: { list: any[]; onSaved: () => void }) {
  const [form, setForm] = useState<CampaignInput>(emptyCampaign);
  const [generated, setGenerated] = useState<GeneratedCampaign | null>(null);
  const [editing, setEditing] = useState(false);
  const mutation = trpc.campaigns.generate.useMutation({ onSuccess: payload => { setGenerated(payload); setEditing(false); onSaved(); toast.success(payload.result.source === "ai" ? "Campanha gerada com IA." : "Rascunho assistido criado."); }, onError: error => toast.error(error.message) });
  const updateMutation = trpc.campaigns.update.useMutation({ onSuccess: row => { setGenerated({ campaignId: row.id, result: row.resultData as CampaignResult, balanceAfter: 0 }); setEditing(false); onSaved(); toast.success("Campanha salva."); }, onError: error => toast.error(error.message) });
  const [draft, setDraft] = useState<CampaignResult | null>(null);
  const current = draft || generated?.result;
  const updateForm = (key: keyof CampaignInput, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); mutation.mutate({ input: form, requestId: crypto.randomUUID() }); };
  const startEditing = () => { setDraft(generated?.result || null); setEditing(true); };
  const save = () => { if (!generated || !current) return; updateMutation.mutate({ id: generated.campaignId, title: current.title, resultData: current }); };
  return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">CENTRAL DE CAMPANHAS</p><h1>Dê o briefing. <em>Receba o sprint.</em></h1><p>Quanto mais contexto real você trouxer, mais útil fica a primeira versão.</p></div><div className="credit-callout"><Zap size={14} /> Esta geração usa <strong>3 créditos</strong></div></div><div className="studio-layout"><form className="panel brief-form" onSubmit={submit}><div className="panel-heading"><div><p className="eyebrow">01 / BRIEFING</p><h2>O que vamos vender?</h2></div><span className="step-count">1/2</span></div><div className="form-grid"><Field label="Nome do produto"><TextInput required value={form.productName} onChange={e => updateForm("productName", e.target.value)} placeholder="Ex.: Kit rotina leve" /></Field><Field label="Categoria"><TextInput required value={form.category} onChange={e => updateForm("category", e.target.value)} placeholder="Ex.: organização" /></Field><Field label="Descrição real do produto"><TextArea required value={form.description} onChange={e => updateForm("description", e.target.value)} placeholder="O que é, para que serve e o que você pode comprovar?" /></Field><Field label="Público-alvo"><TextInput required value={form.audience} onChange={e => updateForm("audience", e.target.value)} placeholder="Ex.: pessoas com rotina corrida" /></Field><Field label="Preço atual"><TextInput required value={form.currentPrice} onChange={e => updateForm("currentPrice", e.target.value)} placeholder="Ex.: R$ 89,90" /></Field><Field label="Preço anterior (opcional)" hint="Só informe se for verdadeiro."><TextInput value={form.previousPrice} onChange={e => updateForm("previousPrice", e.target.value)} placeholder="Ex.: R$ 119,90" /></Field><Field label="Diferencial comprovável"><TextInput value={form.differential} onChange={e => updateForm("differential", e.target.value)} placeholder="Ex.: material lavável" /></Field><Field label="Data da campanha"><TextInput value={form.campaignDate} onChange={e => updateForm("campaignDate", e.target.value)} placeholder="Ex.: 27/11/2026" /></Field><Field label="Canal"><Select value={form.channel} onChange={e => updateForm("channel", e.target.value)}><option>Instagram</option><option>TikTok</option><option>WhatsApp</option><option>Facebook</option><option>Marketplace</option></Select></Field><Field label="Objetivo"><Select value={form.objective} onChange={e => updateForm("objective", e.target.value)}><option>Gerar interesse</option><option>Apresentar produto</option><option>Converter vendas</option><option>Relacionar com clientes</option></Select></Field><Field label="Tom"><Select value={form.tone} onChange={e => updateForm("tone", e.target.value)}><option>Profissional</option><option>Persuasivo</option><option>Descontraído</option><option>Emocional</option><option>Informativo</option><option>Urgente sem falsa escassez</option></Select></Field><Field label="Momento da campanha"><Select value={form.occasion} onChange={e => updateForm("occasion", e.target.value)}><option>Campanha personalizada</option><option>Black Friday</option><option>Natal</option><option>Ano-Novo</option><option>Cyber Monday</option><option>Volta às aulas</option></Select></Field></div><div className="form-footnote"><CircleHelp size={15} /> O VendeSprint não inventa estoque, avaliações, escassez ou descontos.</div><Button type="submit" disabled={mutation.isPending} className="button-lime button-wide">{mutation.isPending ? "Gerando sua campanha..." : "Gerar campanha completa"}<ArrowRight size={16} /></Button></form><section className="panel result-panel"><div className="panel-heading"><div><p className="eyebrow">02 / RESULTADO</p><h2>{current?.title || "Sua campanha aparece aqui"}</h2></div>{current && <div className="result-actions"><button className="icon-button" onClick={() => copyText(current.description)} title="Copiar"><Copy size={16} /></button><button className="icon-button" onClick={startEditing} title="Editar"><PenLine size={16} /></button></div>}</div>{!current ? <div className="result-empty"><div className="result-orb"><Sparkles size={24} /></div><h3>Pronto para sair do rascunho?</h3><p>Preencha o briefing ao lado. Você vai receber conceito, copy, roteiros, WhatsApp, hashtags, ideias de criativo e calendário.</p><div className="result-tags"><span>Conceito</span><span>Copy</span><span>Roteiros</span><span>WhatsApp</span><span>Calendário</span></div></div> : <div className="result-scroll"><div className={`source-banner ${current.source === "ai" ? "ai" : "assisted"}`}><Sparkles size={14} /> {current.source === "ai" ? "Gerado com IA a partir do seu briefing" : "Rascunho assistido: revise antes de publicar"}</div>{editing ? <ResultEditor result={draft || current} setResult={setDraft} onSave={save} onCancel={() => { setEditing(false); setDraft(null); }} saving={updateMutation.isPending} /> : <ResultDisplay result={current} />}</div>}</section></div>{list.length > 0 && <section className="panel recent-panel"><div className="panel-heading"><div><p className="eyebrow">CONTINUE DE ONDE PAROU</p><h2>Campanhas recentes</h2></div></div><div className="mini-campaign-grid">{list.slice(0, 3).map(item => <button key={item.id} onClick={() => { setGenerated({ campaignId: item.id, result: item.resultData, balanceAfter: 0 }); setDraft(null); }}><span className="campaign-icon"><Sparkles size={15} /></span><span><strong>{item.title}</strong><small>{item.productName} · {dateLabel(item.updatedAt)}</small></span><ArrowRight size={14} /></button>)}</div></section>}</div>;
}

function ResultDisplay({ result }: { result: CampaignResult }) { return <div className="result-sections"><ResultBlock label="Conceito" content={result.concept} /><ResultBlock label="Mensagem principal" content={`${result.title}\n${result.subtitle}\n\n${result.description}\n\nCTA: ${result.cta}`} /><ResultBlock label="Benefícios informados" items={result.benefits} /><ResultBlock label="Legenda para Instagram" content={result.instagramCaption} copyable /><ResultBlock label="Roteiro de Reels / TikTok · 15s" content={result.reel15} copyable /><ResultBlock label="Roteiro de Reels / TikTok · 30s" content={result.reel30} copyable /><ResultBlock label="Roteiro de Reels / TikTok · 60s" content={result.reel60} copyable /><ResultBlock label="Mensagem para WhatsApp" content={result.whatsapp} copyable /><ResultBlock label="Follow-up" items={result.followUp} /><ResultBlock label="Hashtags" content={result.hashtags.join(" ")} copyable /><ResultBlock label="Ideias de criativos" items={result.creativeIdeas} /><ResultBlock label="Calendário sugerido" items={result.calendar} /></div>; }
function ResultBlock({ label, content, items, copyable = false }: { label: string; content?: string; items?: string[]; copyable?: boolean }) { return <div className="result-block"><div className="result-block-head"><span>{label}</span>{copyable && <button onClick={() => copyText(content || "")}><Copy size={13} /> Copiar</button>}</div>{content && <p className="result-content">{content}</p>}{items && <ul className="result-list">{items.map(item => <li key={item}><span />{item}</li>)}</ul>}</div>; }
function ResultEditor({ result, setResult, onSave, onCancel, saving }: { result: CampaignResult; setResult: (result: CampaignResult) => void; onSave: () => void; onCancel: () => void; saving: boolean }) { const set = (key: keyof CampaignResult, value: string) => setResult({ ...result, [key]: value }); return <div className="result-editor"><Field label="Título"><TextInput value={result.title} onChange={e => set("title", e.target.value)} /></Field><Field label="Subtítulo"><TextInput value={result.subtitle} onChange={e => set("subtitle", e.target.value)} /></Field><Field label="Descrição"><TextArea value={result.description} onChange={e => set("description", e.target.value)} /></Field><Field label="Legenda Instagram"><TextArea value={result.instagramCaption} onChange={e => set("instagramCaption", e.target.value)} /></Field><div className="editor-actions"><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button><Button type="button" className="button-lime" onClick={onSave} disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button></div></div>; }

function ContentStudio({ list, onSaved }: { list: any[]; onSaved: () => void }) { const [form, setForm] = useState({ kind: "Legenda", channel: "Instagram", style: "Persuasivo", productName: "", context: "" }); const [result, setResult] = useState<any>(null); const mutation = trpc.contents.generate.useMutation({ onSuccess: payload => { setResult(payload); onSaved(); toast.success(payload.source === "ai" ? "Conteúdo gerado com IA." : "Rascunho assistido criado."); }, onError: error => toast.error(error.message) }); const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value })); return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">GERADOR DE CONTEÚDO</p><h1>Uma ideia, <em>muitos formatos.</em></h1><p>Escolha o canal e deixe o trabalho repetitivo para a sprint.</p></div><div className="credit-callout"><Zap size={14} /> Esta geração usa <strong>2 créditos</strong></div></div><div className="studio-layout content-layout"><form className="panel brief-form" onSubmit={e => { e.preventDefault(); mutation.mutate({ input: form, requestId: crypto.randomUUID() }); }}><div className="panel-heading"><div><p className="eyebrow">BRIEFING RÁPIDO</p><h2>O que você precisa?</h2></div></div><div className="form-grid"><Field label="Tipo de peça"><Select value={form.kind} onChange={e => set("kind", e.target.value)}><option>Legenda</option><option>Título</option><option>Descrição</option><option>Gancho de vídeo</option><option>Roteiro UGC</option><option>Anúncio</option><option>Chamada para ação</option></Select></Field><Field label="Canal"><Select value={form.channel} onChange={e => set("channel", e.target.value)}><option>Instagram</option><option>TikTok</option><option>Facebook</option><option>Pinterest</option><option>WhatsApp</option></Select></Field><Field label="Estilo"><Select value={form.style} onChange={e => set("style", e.target.value)}><option>Persuasivo</option><option>Descontraído</option><option>Profissional</option><option>Emocional</option><option>Urgente sem falsa escassez</option><option>Informativo</option></Select></Field><Field label="Produto"><TextInput required value={form.productName} onChange={e => set("productName", e.target.value)} placeholder="Nome do produto" /></Field><Field label="Contexto real da peça"><TextArea required value={form.context} onChange={e => set("context", e.target.value)} placeholder="Inclua os fatos que podem aparecer no texto." /></Field></div><div className="form-footnote"><CircleHelp size={15} /> Traga fatos. A ferramenta não cria prova social nem oferta que você não informou.</div><Button type="submit" disabled={mutation.isPending} className="button-lime button-wide">{mutation.isPending ? "Criando conteúdo..." : "Gerar peça"}<ArrowRight size={16} /></Button></form><section className="panel result-panel"><div className="panel-heading"><div><p className="eyebrow">RESULTADO</p><h2>{result?.title || "Sua peça aparece aqui"}</h2></div>{result && <button className="icon-button" onClick={() => copyText(`${result.title}\n\n${result.body}`)}><Copy size={16} /></button>}</div>{result ? <div className="result-scroll"><div className={`source-banner ${result.source === "ai" ? "ai" : "assisted"}`}><Sparkles size={14} /> {result.source === "ai" ? "Gerado com IA" : "Rascunho assistido"}</div><ResultBlock label={form.kind} content={result.body} copyable /></div> : <div className="result-empty"><div className="result-orb"><PenLine size={24} /></div><h3>Qual é a próxima peça?</h3><p>Escolha um formato, dê o contexto e receba um texto pronto para revisar.</p></div>}</section></div>{list.length > 0 && <section className="panel recent-panel"><div className="panel-heading"><div><p className="eyebrow">BIBLIOTECA DE CONTEÚDO</p><h2>Últimas peças</h2></div></div><div className="content-history">{list.slice(0, 5).map(item => <div key={item.id}><span className="content-type">{item.kind}</span><div><strong>{item.title}</strong><small>{item.channel} · {item.style}</small></div><button onClick={() => copyText(item.body)}><Copy size={14} /></button></div>)}</div></section>}</div>; }

function WhatsAppStudio() { const [form, setForm] = useState({ type: "Apresentação de produto", name: "", product: "", price: "", coupon: "", link: "" }); const templates: Record<string, string> = { "Apresentação de produto": "Oi, {name}! Separei uma opção que pode fazer sentido para você: {product}. {price} {coupon} Se quiser, te envio os detalhes por aqui: {link}", "Lançamento": "Oi, {name}! Acabei de apresentar {product}. {price} Quer receber o link e conhecer melhor? {link}", "Recuperação de interesse": "Oi, {name}! Passando para saber se você conseguiu ver {product}. Se quiser, posso te mandar o link novamente: {link}", "Pós-venda": "Oi, {name}! Tudo bem com {product}? Se precisar de ajuda com alguma informação, me chama por aqui." }; const message = useMemo(() => templates[form.type].replaceAll("{name}", form.name || "tudo bem").replaceAll("{product}", form.product || "este produto").replaceAll("{price}", form.price ? `O valor informado é ${form.price}.` : "").replaceAll("{coupon}", form.coupon ? `Cupom informado: ${form.coupon}.` : "").replaceAll("{link}", form.link || "[link]").trim(), [form]); const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value })); return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">MENSAGENS WHATSAPP</p><h1>Conversa que <em>começa bem.</em></h1><p>Modelos editáveis para divulgação, lançamento, relacionamento e pós-venda.</p></div><div className="whatsapp-disclaimer"><MessageCircle size={14} /> Sem disparo automático</div></div><div className="whatsapp-layout"><section className="panel brief-form"><div className="panel-heading"><div><p className="eyebrow">MONTAR MENSAGEM</p><h2>Personalize o contexto</h2></div></div><div className="form-grid"><Field label="Modelo"><Select value={form.type} onChange={e => set("type", e.target.value)}>{Object.keys(templates).map(type => <option key={type}>{type}</option>)}</Select></Field><Field label="Nome da pessoa"><TextInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="Como você vai chamar?" /></Field><Field label="Produto"><TextInput value={form.product} onChange={e => set("product", e.target.value)} placeholder="Nome do produto" /></Field><Field label="Preço informado"><TextInput value={form.price} onChange={e => set("price", e.target.value)} placeholder="Opcional" /></Field><Field label="Cupom informado"><TextInput value={form.coupon} onChange={e => set("coupon", e.target.value)} placeholder="Opcional" /></Field><Field label="Link de compra"><TextInput value={form.link} onChange={e => set("link", e.target.value)} placeholder="https://..." /></Field></div><div className="consent-note"><Check size={14} /> Use somente com contatos que consentiram em receber sua mensagem.</div></section><section className="panel whatsapp-preview"><div className="phone-top"><span>Prévia da mensagem</span><MessageCircle size={16} /></div><div className="phone-body"><div className="wa-bubble">{message}</div></div><div className="whatsapp-actions"><Button onClick={() => copyText(message)} variant="outline"><Copy size={15} /> Copiar</Button><Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")} className="button-lime"><ExternalLink size={15} /> Abrir no WhatsApp</Button></div></section></div></div>; }

function CalculatorView() { const [values, setValues] = useState({ cost: "", price: "", fees: "", shipping: "", commission: "", taxes: "", extras: "", discount: "" }); const num = (key: keyof typeof values) => Number(values[key].replace(",", ".")) || 0; const result = useMemo(() => { const price = num("price"); const discount = num("discount"); const revenue = price * (1 - discount / 100); const costs = num("cost") + num("fees") + num("shipping") + num("commission") + num("taxes") + num("extras"); const profit = revenue - costs; return { revenue, costs, profit, margin: revenue ? (profit / revenue) * 100 : 0, min: costs }; }, [values]); const set = (key: keyof typeof values, value: string) => setValues(prev => ({ ...prev, [key]: value })); return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">CALCULADORA FINANCEIRA</p><h1>Preço bonito é bom.<br /><em>Lucro é melhor.</em></h1><p>Separe faturamento de lucro antes de decidir seu próximo desconto.</p></div><div className="calculator-note"><Calculator size={14} /> Estimativa, não contabilidade</div></div><div className="calculator-layout"><section className="panel brief-form"><div className="panel-heading"><div><p className="eyebrow">PREMISSAS</p><h2>Monte seu cenário</h2></div></div><div className="form-grid"><Field label="Custo do produto"><TextInput inputMode="decimal" value={values.cost} onChange={e => set("cost", e.target.value)} placeholder="R$ 0,00" /></Field><Field label="Preço de venda"><TextInput inputMode="decimal" value={values.price} onChange={e => set("price", e.target.value)} placeholder="R$ 0,00" /></Field><Field label="Taxas da plataforma"><TextInput inputMode="decimal" value={values.fees} onChange={e => set("fees", e.target.value)} placeholder="R$ 0,00" /></Field><Field label="Frete subsidiado"><TextInput inputMode="decimal" value={values.shipping} onChange={e => set("shipping", e.target.value)} placeholder="R$ 0,00" /></Field><Field label="Comissão"><TextInput inputMode="decimal" value={values.commission} onChange={e => set("commission", e.target.value)} placeholder="R$ 0,00" /></Field><Field label="Impostos opcionais"><TextInput inputMode="decimal" value={values.taxes} onChange={e => set("taxes", e.target.value)} placeholder="R$ 0,00" /></Field><Field label="Despesas adicionais"><TextInput inputMode="decimal" value={values.extras} onChange={e => set("extras", e.target.value)} placeholder="R$ 0,00" /></Field><Field label="Desconto simulado (%)"><TextInput inputMode="decimal" value={values.discount} onChange={e => set("discount", e.target.value)} placeholder="0" /></Field></div><div className="form-footnote"><CircleHelp size={15} /> Informe valores reais. O cálculo não considera custos que você não preencher.</div></section><section className="panel calculator-result"><p className="eyebrow">LEITURA DO CENÁRIO</p><h2>Resultado estimado</h2><div className="profit-hero"><span>Lucro líquido estimado</span><strong className={result.profit >= 0 ? "positive" : "negative"}>{money(result.profit)}</strong><small>após os custos informados</small></div><div className="calc-metrics"><div><span>Receita</span><strong>{money(result.revenue)}</strong></div><div><span>Custos</span><strong>{money(result.costs)}</strong></div><div><span>Margem</span><strong>{result.margin.toFixed(1).replace(".", ",")}%</strong></div><div><span>Preço mínimo</span><strong>{money(result.min)}</strong></div></div><div className="break-even"><div><span>Ponto de equilíbrio</span><strong>{money(result.min)}</strong></div><div className="mini-bar"><span style={{ width: `${Math.min(100, Math.max(0, result.margin))}%` }} /></div><small>Estimativa baseada apenas nas premissas preenchidas.</small></div></section></div></div>; }

function LibraryView({ campaigns, onNavigate, onRefresh }: { campaigns: any[]; onNavigate: (view: View) => void; onRefresh: () => void }) { const [search, setSearch] = useState(""); const remove = trpc.campaigns.remove.useMutation({ onSuccess: () => { onRefresh(); toast.success("Campanha removida."); }, onError: error => toast.error(error.message) }); const duplicate = trpc.campaigns.duplicate.useMutation({ onSuccess: () => { onRefresh(); toast.success("Campanha duplicada como rascunho."); }, onError: error => toast.error(error.message) }); const filtered = campaigns.filter(item => `${item.title} ${item.productName} ${item.channel}`.toLowerCase().includes(search.toLowerCase())); return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">BIBLIOTECA</p><h1>Seu trabalho, <em>bem guardado.</em></h1><p>Histórico real do que já foi criado neste workspace.</p></div><Button onClick={() => onNavigate("campaign")} className="button-lime"><Plus size={17} /> Nova campanha</Button></div><section className="panel library-panel"><div className="library-toolbar"><div className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por produto, título ou canal" /></div><span className="library-count">{filtered.length} {filtered.length === 1 ? "campanha" : "campanhas"}</span></div>{filtered.length === 0 ? <EmptyState icon={BookOpen} title="Nada encontrado ainda" text="Crie sua primeira campanha para começar uma biblioteca que trabalha com você." action="Criar campanha" onClick={() => onNavigate("campaign")} /> : <div className="library-table"><div className="table-head"><span>Campanha</span><span>Canal</span><span>Status</span><span>Atualizada</span><span /></div>{filtered.map(item => <div className="table-row" key={item.id}><div className="table-campaign"><span className="campaign-icon"><Sparkles size={15} /></span><div><strong>{item.title}</strong><small>{item.productName}</small></div></div><span>{item.channel}</span><span className="status-text">{item.status === "generated" ? "Gerada" : "Rascunho"}</span><span>{dateLabel(item.updatedAt)}</span><div className="table-actions"><button onClick={() => copyText(item.resultData.description || item.title)} title="Copiar"><Copy size={14} /></button><button onClick={() => duplicate.mutate({ id: item.id })} title="Duplicar"><Clipboard size={14} /></button><button onClick={() => { if (window.confirm("Excluir esta campanha? Essa ação não pode ser desfeita.")) remove.mutate({ id: item.id }); }} title="Excluir"><X size={14} /></button></div></div>)}</div>}</section></div>; }

function PlansView({ currentPlan }: { currentPlan: string }) { const plans = [{ name: "Free", slug: "free", price: "R$ 0", detail: "Para começar", items: ["10 créditos iniciais", "Campanhas com IA", "Calculadora", "Biblioteca"] }, { name: "Starter", slug: "starter", price: "R$ 19,90", detail: "por mês", items: ["Mais créditos", "Conteúdo por canal", "Templates WhatsApp", "Histórico organizado"] }, { name: "Pro", slug: "pro", price: "R$ 39,90", detail: "por mês", items: ["Limite ampliado", "Prioridade de geração", "Relatórios", "Recursos avançados"] }]; return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">PLANOS E LIMITES</p><h1>Escolha o ritmo <em>da sua operação.</em></h1><p>Seus limites são controlados no servidor. Pagamentos reais entram após conectar o Mercado Pago.</p></div><div className="plan-status"><span>Plano atual</span><strong>{currentPlan === "free" ? "Free" : currentPlan}</strong></div></div><div className="workspace-pricing">{plans.map(plan => <div key={plan.slug} className={`workspace-plan ${currentPlan === plan.slug ? "current" : ""}`}><div className="workspace-plan-top"><span className="plan-name">{plan.name}</span>{currentPlan === plan.slug && <span className="current-badge">Atual</span>}</div><strong className="workspace-price">{plan.price}</strong><small>{plan.detail}</small><div className="plan-items">{plan.items.map(item => <span key={item}><Check size={14} /> {item}</span>)}</div><Button variant={currentPlan === plan.slug ? "outline" : "default"} className={currentPlan === plan.slug ? "button-dark-outline" : "button-lime"} disabled={currentPlan === plan.slug}>{currentPlan === plan.slug ? "Plano ativo" : "Configurar quando publicar"}</Button></div>)}</div><div className="integration-note"><CircleHelp size={17} /><div><strong>Mercado Pago ainda não conectado</strong><p>O checkout Pix/cartão, webhooks assinados e renovação só serão habilitados quando as credenciais de teste e produção estiverem configuradas no servidor.</p></div></div></div>; }

function SettingsView({ user, onLogout }: { user: any; onLogout: () => Promise<void> }) { const { theme, toggleTheme } = useTheme(); return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">CONFIGURAÇÕES</p><h1>Seu workspace, <em>do seu jeito.</em></h1><p>Preferências básicas e transparência sobre o que está conectado.</p></div></div><section className="settings-grid"><div className="panel settings-card"><div className="settings-card-heading"><div className="large-avatar">{(user.name || "V").slice(0, 1).toUpperCase()}</div><div><p className="eyebrow">CONTA</p><h2>{user.name || "Usuário VendeSprint"}</h2><span>{user.email || "Conta autenticada pelo Manus"}</span></div></div><div className="settings-row"><div><strong>Plano atual</strong><small>Limites aplicados no servidor</small></div><span className="setting-value">{user.plan || "free"}</span></div><div className="settings-row"><div><strong>Forma de login</strong><small>Não armazenamos sua senha no VendeSprint</small></div><span className="setting-value">{user.loginMethod || "Manus OAuth"}</span></div><Button variant="outline" onClick={() => void onLogout()} className="logout-button"><LogOut size={16} /> Sair da conta</Button></div><div className="panel settings-card"><div className="panel-heading"><div><p className="eyebrow">PREFERÊNCIAS</p><h2>Como você trabalha</h2></div></div><button className="preference-row" onClick={toggleTheme}><span className="preference-icon">{theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}</span><span><strong>Tema da interface</strong><small>{theme === "dark" ? "Dark mode ativo" : "Light mode ativo"}</small></span><span className="setting-value">Alternar</span></button><div className="preference-row disabled"><span className="preference-icon"><Send size={17} /></span><span><strong>Notificações sazonais</strong><small>Disponível na próxima etapa</small></span><span className="coming-soon">Em breve</span></div><div className="preference-row disabled"><span className="preference-icon"><ShieldIcon /></span><span><strong>Exportar meus dados</strong><small>Solicitação LGPD documentada</small></span><span className="coming-soon">Em breve</span></div></div></section><div className="security-note"><ShieldIcon /><span><strong>Segurança por padrão.</strong> Chaves de IA, regras de plano e permissões nunca ficam no frontend.</span></div></div>; }
function ShieldIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 20 7v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V7l8-4Z" /><path d="m9 12 2 2 4-4" /></svg>; }

function LoadingScreen() { return <div className="loading-screen"><div className="loading-mark"><Sparkles size={22} /></div><span>Preparando seu workspace...</span></div>; }
function copyText(text: string) { void navigator.clipboard?.writeText(text).then(() => toast.success("Copiado para a área de transferência.")); }

export default function Home() { const auth = useAuth(); if (auth.loading) return <LoadingScreen />; if (!auth.isAuthenticated || !auth.user) return <Landing />; return <Workspace user={auth.user} onLogout={auth.logout} />; }

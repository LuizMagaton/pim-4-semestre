import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

type LegalProps = { kind: "terms" | "privacy" };

export default function Legal({ kind }: LegalProps) {
  const privacy = kind === "privacy";
  return (
    <main className="legal-page">
      <div className="legal-wrap">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Voltar para o VendeSprint</Link>
        <div className="legal-heading"><div className="brand-mark small">↗</div><span>VendeSprint AI</span></div>
        <p className="eyebrow"><ShieldCheck size={14} /> Documento público</p>
        <h1>{privacy ? "Política de privacidade" : "Termos de uso"}</h1>
        <p className="legal-lead">Este texto é uma base de lançamento e deve ser revisado pelo responsável jurídico antes da publicação comercial.</p>
        <section className="legal-card">
          {privacy ? <>
            <h2>Dados tratados</h2>
            <p>Tratamos os dados necessários para autenticação, funcionamento do workspace, histórico de campanhas, consumo de créditos e atendimento. Não vendemos dados pessoais e não usamos conteúdo de clientes para treinamento sem consentimento válido.</p>
            <h2>Uso responsável</h2>
            <p>Os textos gerados são sugestões editáveis. O usuário é responsável por confirmar características, preços, regras comerciais, direitos autorais e conformidade antes de publicar.</p>
            <h2>Direitos LGPD</h2>
            <p>Para solicitar acesso, correção, exportação ou exclusão de dados, use o canal de contato informado no contrato comercial do serviço. A conta pode ser excluída pelo usuário quando esse recurso estiver habilitado no workspace.</p>
          </> : <>
            <h2>Sobre o serviço</h2>
            <p>O VendeSprint AI oferece ferramentas de apoio à criação de campanhas e conteúdos. Ele não processa pagamentos de produtos de terceiros, não garante entrega, estoque, conversão ou vendas e não substitui orientação jurídica, contábil ou de marketing.</p>
            <h2>Conteúdo gerado</h2>
            <p>O usuário deve revisar cada saída antes de publicar. É proibido usar a plataforma para inventar avaliações, escassez, descontos, promessas de saúde ou informações que não possam ser comprovadas.</p>
            <h2>Planos e integrações</h2>
            <p>Planos, limites e integrações dependem da configuração vigente. Nenhum plano pago será liberado apenas por retorno do navegador; confirmações ocorrerão no servidor quando o provedor de pagamentos estiver conectado.</p>
          </>}
        </section>
        <p className="legal-foot">Última atualização: novembro de 2026 · Documento informativo.</p>
      </div>
    </main>
  );
}

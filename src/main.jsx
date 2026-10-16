import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, ShoppingBag, TrendingUp, ReceiptText, Target, Package,
  ChartColumnIncreasing, Settings, LogOut, Bell, Menu, ArrowUpRight,
  ArrowDownRight, ShieldCheck, Eye, EyeOff, Save, RotateCcw, CheckCircle2,
  AlertCircle, Calculator
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';
import './index.css';

const currency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2
  }).format(Number(value) || 0);

const nav = [
  ['Dashboard', LayoutDashboard],
  ['Nova Venda', ShoppingBag],
  ['Evolução do Mês', TrendingUp],
  ['Vendas', ReceiptText],
  ['Metas', Target],
  ['Produtos', Package],
  ['BI Produtos', ChartColumnIncreasing],
  ['Administração', Settings]
];

const monthly = [
  { mes: 'Jul', realizado: 23165, meta: 28000 },
  { mes: 'Ago', realizado: 10365, meta: 28000 },
  { mes: 'Set', realizado: 6945, meta: 28000 },
  { mes: 'Out', realizado: 0, meta: 28000 }
];

const sampleSales = [
  { servico: 'Coating cerâmico', loja: 'Fiat/Jeep Guarapuava', data: '24/09/2026', valor: 880 },
  { servico: 'Lavagem com cera', loja: 'Fiat/Jeep Guarapuava', data: '23/09/2026', valor: 80 },
  { servico: 'Polimento', loja: 'Fiat/Jeep Guarapuava', data: '23/09/2026', valor: 310 },
  { servico: 'Prime', loja: 'Fiat/Jeep Guarapuava', data: '22/09/2026', valor: 200 }
];

const stores = [
  'Fiat/Jeep Guarapuava',
  'Hyundai Barigui Ponta Grossa',
  'Hyundai Barigui Guarapuava',
  'Fiat Londrina'
];

function Logo({ size = 48 }) {
  return (
    <img
      src="/lacc-logo.jpg"
      alt="Logotipo LACC Estética Automotiva"
      style={{ width: size, height: size, objectFit: 'contain' }}
      className="rounded-lg"
    />
  );
}

function Login({ onEnter }) {
  const [show, setShow] = useState(false);
  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-5">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 20% 10%,#b7852b,transparent 36%)' }}
      />
      <div className="relative bg-[#1c1c1c] border border-[#333] rounded-3xl w-full max-w-[420px] p-8 sm:p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-9">
          <Logo size={118} />
          <h1 className="text-white text-2xl font-semibold mt-5 tracking-tight">Bem-vindo à LACC</h1>
          <p className="text-[#aaa] text-sm mt-2">Monitor de Vendas · V2</p>
        </div>
        <div className="rounded-lg border border-[#5d4a29] bg-[#32291c] text-[#f0cf8d] text-xs p-3 mb-6">
          Prévia visual: autenticação real será integrada na próxima etapa. Não insira credenciais verdadeiras.
        </div>
        <label className="text-[#ddd] text-xs font-semibold">E-mail</label>
        <input type="email" placeholder="seu@email.com" disabled className="w-full mt-2 mb-5 p-3 rounded-xl bg-[#292929] border border-[#444] text-[#999]" />
        <label className="text-[#ddd] text-xs font-semibold">PIN</label>
        <div className="relative mt-2 mb-6">
          <input disabled type={show ? 'text' : 'password'} placeholder="••••••" className="w-full p-3 rounded-xl bg-[#292929] border border-[#444] text-[#999]" />
          <button type="button" aria-label="Mostrar ou ocultar PIN" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-[#aaa]">
            {show ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
        <button onClick={onEnter} className="w-full rounded-xl bg-[#D9A441] text-[#1b1b1b] font-bold py-3.5 hover:bg-[#efbf63]">
          Visualizar demonstração
        </button>
        <p className="text-[#777] text-center text-xs mt-6">Protótipo sem acesso aos dados reais</p>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, up, icon: Icon }) {
  return (
    <div className="glass bg-white border border-[#e9e8e4] rounded-2xl p-5 min-w-0">
      <div className="flex justify-between items-start">
        <span className="text-[#777] text-xs font-semibold uppercase tracking-wider">{label}</span>
        <div className="rounded-xl bg-[#f9f5ea] p-2 text-[#ae812a]"><Icon size={17} /></div>
      </div>
      <div className="mt-4 text-[clamp(1.2rem,2vw,1.7rem)] font-bold tracking-tight truncate">{value}</div>
      <p className="text-xs text-[#888] mt-2 flex items-center gap-1">
        {up === true ? <ArrowUpRight size={14} className="text-emerald-600" /> : up === false ? <ArrowDownRight size={14} className="text-rose-500" /> : null}
        {sub}
      </p>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="fade space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Visão geral</h2>
          <p className="text-sm text-[#888] mt-1">Indicadores comerciais e desempenho da operação</p>
        </div>
        <div className="flex gap-2">
          <select aria-label="Ano" className="bg-white border border-[#e3e1dd] rounded-xl px-3 py-2 text-sm"><option>2026</option></select>
          <select aria-label="Período" className="bg-white border border-[#e3e1dd] rounded-xl px-3 py-2 text-sm">
            <option>Todos os meses</option><option>Setembro</option><option>Agosto</option><option>Julho</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Faturamento histórico" value={currency(40475)} sub="Julho a setembro de 2026" icon={ReceiptText} />
        <Stat label="Vendas registradas" value="157" sub="Registros importados para demonstração" icon={ShoppingBag} />
        <Stat label="Ticket médio" value={currency(40475 / 157)} sub="Por registro histórico" icon={TrendingUp} />
        <Stat label="Lojas na amostra" value="1" sub="Fiat/Jeep Guarapuava" icon={Target} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-5">
        <section className="glass bg-white border border-[#e9e8e4] rounded-2xl p-5">
          <h3 className="font-bold">Evolução de faturamento</h3>
          <p className="text-xs text-[#888] mt-1">Dados históricos de demonstração · julho a outubro</p>
          <div className="h-[280px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs><linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D9A441" stopOpacity={0.27} /><stop offset="100%" stopColor="#D9A441" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#f0eee9" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => currency(v)} />
                <Area type="monotone" dataKey="realizado" name="Realizado" stroke="#D9A441" strokeWidth={3} fill="url(#goldFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="glass bg-white border border-[#e9e8e4] rounded-2xl p-5">
          <h3 className="font-bold">Desempenho mensal</h3>
          <p className="text-xs text-[#888] mt-1">Faturamento histórico por mês</p>
          <div className="space-y-6 mt-9">
            {monthly.slice(0, 3).map((m) => (
              <div key={m.mes}>
                <div className="flex justify-between text-sm mb-2"><span className="font-medium">{m.mes}/2026</span><strong>{currency(m.realizado)}</strong></div>
                <div className="h-2 bg-[#f0efeb] rounded-full overflow-hidden"><div className="h-full bg-[#D9A441] rounded-full" style={{ width: `${Math.min(100, m.realizado / m.meta * 100)}%` }} /></div>
                <p className="text-xs text-[#999] mt-1">Meta de demonstração: {currency(m.meta)}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#f8f6f0] rounded-xl p-3 text-xs text-[#807358] mt-8">Os valores são uma amostra histórica, não uma conexão em tempo real.</div>
        </section>
      </div>
      <section className="glass bg-white border border-[#e9e8e4] rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4"><h3 className="font-bold">Exemplos de vendas</h3><p className="text-xs text-[#888] mt-1">Prévia de como ficará a tabela</p></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#fafaf9] text-[#888] text-xs uppercase"><tr>{['Serviço', 'Loja', 'Data', 'Valor'].map((x) => <th key={x} className="px-5 py-3 text-left font-semibold">{x}</th>)}</tr></thead>
            <tbody>{sampleSales.map((s, i) => <tr key={i} className="border-t border-[#f0efec]"><td className="px-5 py-4 font-medium">{s.servico}</td><td className="px-5 py-4 text-[#777]">{s.loja}</td><td className="px-5 py-4 text-[#777]">{s.data}</td><td className="px-5 py-4 font-semibold">{currency(s.valor)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const initialForm = {
  data: new Date().toISOString().slice(0, 10),
  loja: '',
  marca: '',
  tipoVenda: '',
  produto: '',
  quantidade: '1',
  valorUnitario: '',
  consultor: '',
  veiculo: '',
  placa: '',
  os: '',
  observacao: ''
};

function Field({ label, required, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-semibold text-[#383838] mb-2">
        {label}{required && <span className="text-rose-600"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass = 'w-full rounded-xl border border-[#dedbd4] bg-white px-3.5 py-3 text-sm text-[#252525] outline-none transition focus:border-[#c49a4a] focus:ring-2 focus:ring-[#d9a441]/20 disabled:bg-[#f4f3f0]';
const selectClass = `${inputClass} appearance-auto`;

function NovaVenda() {
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const total = useMemo(() => {
    const qty = Math.max(0, Number(form.quantidade) || 0);
    const unit = Math.max(0, Number(form.valorUnitario) || 0);
    return qty * unit;
  }, [form.quantidade, form.valorUnitario]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFeedback(null);
  }

  function resetForm() {
    setForm({ ...initialForm, data: new Date().toISOString().slice(0, 10) });
    setFeedback(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.data || !form.loja || !form.marca || !form.tipoVenda || !form.produto.trim() || !form.quantidade || Number(form.quantidade) <= 0 || form.valorUnitario === '' || Number(form.valorUnitario) < 0) {
      setFeedback({ type: 'error', text: 'Confira os campos obrigatórios e informe quantidade e valor unitário válidos.' });
      return;
    }
    const draft = {
      ...form,
      quantidade: Number(form.quantidade),
      valorUnitario: Number(form.valorUnitario),
      valorTotal: total,
      status: 'Rascunho local',
      id: `DEMO-${Date.now()}`
    };
    setDrafts((current) => [draft, ...current]);
    setFeedback({ type: 'success', text: 'Venda adicionada à lista de demonstração deste navegador. Ela NÃO foi enviada para a planilha nem para o servidor.' });
    setForm({ ...initialForm, data: new Date().toISOString().slice(0, 10) });
  }

  return (
    <div className="fade space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nova Venda</h2>
          <p className="text-sm text-[#888] mt-1">Preencha os dados abaixo para testar o formulário.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#fbf4e7] px-3 py-2 text-xs font-semibold text-[#8c672b]"><ShieldCheck size={15} /> Modo de demonstração</span>
      </div>

      <div className="flex gap-3 rounded-2xl border border-[#ead9b5] bg-[#fffaf0] p-4 text-sm text-[#735b31]">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <p>Este formulário serve para testar o fluxo e os cálculos. Os registros ficam somente na memória desta tela e não são gravados na V1, no Google Sheets ou em um servidor.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="bg-white border border-[#e9e8e4] rounded-2xl p-5 sm:p-7">
          <h3 className="font-bold text-lg">Informações da venda</h3>
          <p className="text-xs text-[#888] mt-1 mb-6">Os campos marcados com * são obrigatórios.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <Field label="Data da venda" required>
              <input className={inputClass} type="date" value={form.data} onChange={(e) => update('data', e.target.value)} required />
            </Field>
            <Field label="Loja" required>
              <select className={selectClass} value={form.loja} onChange={(e) => update('loja', e.target.value)} required>
                <option value="">Selecione a loja</option>{stores.map((store) => <option key={store} value={store}>{store}</option>)}
              </select>
            </Field>
            <Field label="Marca" required>
              <select className={selectClass} value={form.marca} onChange={(e) => update('marca', e.target.value)} required>
                <option value="">Selecione a marca</option>
                {['Fiat', 'Jeep', 'Hyundai', 'Outra'].map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </Field>
            <Field label="Tipo de venda" required>
              <select className={selectClass} value={form.tipoVenda} onChange={(e) => update('tipoVenda', e.target.value)} required>
                <option value="">Selecione o tipo</option>
                {['Interna', 'Externa'].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </Field>
            <Field label="Produto ou serviço" required className="md:col-span-2 xl:col-span-2">
              <input className={inputClass} value={form.produto} onChange={(e) => update('produto', e.target.value)} placeholder="Ex.: Higienização, vitrificação, polimento..." maxLength={120} required />
            </Field>
            <Field label="Quantidade" required>
              <input className={inputClass} type="number" min="1" step="1" value={form.quantidade} onChange={(e) => update('quantidade', e.target.value)} required />
            </Field>
            <Field label="Valor unitário (R$)" required>
              <input className={inputClass} type="number" min="0" step="0.01" value={form.valorUnitario} onChange={(e) => update('valorUnitario', e.target.value)} placeholder="0,00" required />
            </Field>
            <Field label="Consultor / vendedor">
              <input className={inputClass} value={form.consultor} onChange={(e) => update('consultor', e.target.value)} placeholder="Nome do consultor" maxLength={100} />
            </Field>
            <Field label="Veículo">
              <input className={inputClass} value={form.veiculo} onChange={(e) => update('veiculo', e.target.value)} placeholder="Modelo do veículo" maxLength={100} />
            </Field>
            <Field label="Placa / chassi">
              <input className={inputClass} value={form.placa} onChange={(e) => update('placa', e.target.value.toUpperCase())} placeholder="Opcional" maxLength={30} />
            </Field>
            <Field label="OS (ordem de serviço)">
              <input className={inputClass} value={form.os} onChange={(e) => update('os', e.target.value)} placeholder="Número da OS, se houver" maxLength={50} />
            </Field>
            <Field label="Observações" className="md:col-span-2 xl:col-span-3">
              <textarea className={`${inputClass} min-h-[100px] resize-y`} value={form.observacao} onChange={(e) => update('observacao', e.target.value)} placeholder="Informações adicionais (opcional)" maxLength={500} />
            </Field>
          </div>
        </section>

        <section className="bg-[#1b1b1b] text-white rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#3a3020] text-[#e5b75e] p-3"><Calculator size={22} /></div>
              <div><p className="text-sm text-[#c5c5c5]">Valor total calculado</p><p className="text-xs text-[#8d8d8d] mt-1">Quantidade × valor unitário</p></div>
            </div>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[#e5b75e]">{currency(total)}</p>
          </div>
        </section>

        {feedback && (
          <div role="status" className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={19} className="shrink-0" /> : <AlertCircle size={19} className="shrink-0" />}
            <p>{feedback.text}</p>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dedbd4] bg-white px-5 py-3 text-sm font-semibold hover:bg-[#f7f6f3]">
            <RotateCcw size={17} /> Limpar formulário
          </button>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D9A441] px-6 py-3 text-sm font-bold text-[#191919] hover:bg-[#efbf63]">
            <Save size={17} /> Testar cadastro
          </button>
        </div>
      </form>

      {drafts.length > 0 && (
        <section className="bg-white border border-[#e9e8e4] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[#efeee9]"><h3 className="font-bold">Cadastros de demonstração desta sessão</h3><p className="text-xs text-[#888] mt-1">Estes registros desaparecem ao recarregar a página.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fafaf9] text-[#888] text-xs uppercase"><tr>{['Data', 'Loja', 'Produto/serviço', 'Qtd.', 'Total', 'Status'].map((label) => <th key={label} className="px-4 py-3 text-left font-semibold">{label}</th>)}</tr></thead>
              <tbody>{drafts.map((draft) => <tr key={draft.id} className="border-t border-[#f0efec]">
                <td className="px-4 py-3 whitespace-nowrap">{draft.data.split('-').reverse().join('/')}</td>
                <td className="px-4 py-3">{draft.loja}</td><td className="px-4 py-3 font-medium">{draft.produto}</td><td className="px-4 py-3">{draft.quantidade}</td><td className="px-4 py-3 font-semibold">{currency(draft.valorTotal)}</td><td className="px-4 py-3"><span className="rounded-full bg-[#fbf4e7] px-2.5 py-1 text-xs text-[#8c672b]">{draft.status}</span></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Placeholder({ name }) {
  return (
    <div className="fade space-y-5">
      <div><h2 className="text-2xl font-bold">{name}</h2><p className="text-sm text-[#888] mt-1">Área prevista para a integração da próxima etapa</p></div>
      <div className="bg-white border border-[#e9e8e4] rounded-2xl p-10 min-h-[330px] flex flex-col items-center justify-center text-center">
        <ShieldCheck size={38} className="text-[#c29a51}" />
        <h3 className="font-bold mt-4">Estrutura visual preparada</h3>
        <p className="text-sm text-[#888] mt-2 max-w-md">O módulo {name} será conectado ao backend existente após implementarmos autenticação e autorização seguras.</p>
      </div>
    </div>
  );
}

function App() {
  const [demo, setDemo] = useState(false);
  const [page, setPage] = useState('Dashboard');
  const [open, setOpen] = useState(false);

  if (!demo) return <Login onEnter={() => setDemo(true)} />;

  return (
    <div className="min-h-screen flex bg-[#f5f5f3]">
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 h-screen w-[252px] bg-[#161616] text-white z-30 transition-transform flex flex-col shrink-0`}>
        <div className="p-5 flex gap-3 items-center border-b border-[#303030]"><Logo size={49} /><div><strong className="text-[#e4b35c] tracking-wider">LACC</strong><p className="text-[10px] text-[#aaa]">MONITOR DE VENDAS</p></div></div>
        <nav className="px-3 py-6 flex-1 overflow-auto thin-scroll">
          <p className="text-[#777] uppercase text-[10px] tracking-[.18em] px-4 mb-3">Navegação</p>
          {nav.map(([name, Icon]) => (
            <button key={name} onClick={() => { setPage(name); setOpen(false); }} className={`w-full flex gap-3 items-center px-4 py-3 rounded-xl text-sm text-left mb-1 transition-colors ${page === name ? 'bg-[#D9A441] text-[#171717] font-bold' : 'text-[#b9b9b9] hover:bg-[#292929]'}`}>
              <Icon size={18} />{name}
            </button>
          ))}
        </nav>
        <div className="border-t border-[#303030] p-4"><div className="flex gap-3 items-center"><div className="w-9 h-9 bg-[#383127] text-[#e4b35c] rounded-full flex items-center justify-center font-bold">D</div><div className="flex-1"><p className="text-sm font-semibold">Demonstração</p><p className="text-xs text-[#888]">Modo visual</p></div><button title="Sair" onClick={() => { setDemo(false); setPage('Dashboard'); }} className="text-[#aaa] hover:text-white"><LogOut size={18} /></button></div></div>
      </aside>
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/50 z-20 lg:hidden" />}
      <div className="min-w-0 flex-1">
        <header className="h-[78px] bg-white border-b border-[#e9e8e4] flex items-center justify-between px-5 lg:px-9">
          <div className="flex items-center gap-3"><button className="lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu size={23} /></button><span className="text-sm text-[#999]">Painel / <span className="text-[#242424] font-semibold">{page}</span></span></div>
          <div className="flex items-center gap-4"><span className="hidden md:block text-xs text-[#a78343] bg-[#fbf4e7] px-3 py-2 rounded-full font-semibold">Prévia visual · sem conexão</span><Bell size={19} className="text-[#777]" /><div className="w-9 h-9 rounded-full bg-[#171717] text-[#D9A441] flex justify-center items-center font-semibold">L</div></div>
        </header>
        <main className="p-5 lg:p-9 max-w-[1540px] mx-auto">
          {page === 'Dashboard' ? <Dashboard /> : page === 'Nova Venda' ? <NovaVenda /> : <Placeholder name={page} />}
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

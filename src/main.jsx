import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import {
  LayoutDashboard, ShoppingBag, TrendingUp, ReceiptText, Target, Package,
  ChartColumnIncreasing, Settings, LogOut, Menu, Plus, ShieldCheck,
  RefreshCw, AlertCircle, Eye, EyeOff, Sun, Moon, Trophy, ClipboardCheck, TrendingUpDown
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './index.css';
import { prepararFechamento, baixarFechamentoExcel, baixarFechamentoPDF } from './exportarFechamento';

// LACC V2 — Supabase real. Não altera a V1.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && anonKey ? createClient(url, anonKey) : null;

const API_PRODUTOS_URL = "https://script.google.com/macros/s/AKfycbyWJYG3tUNFRmC97A-oQXeBpnV3EYpLbt6DUn4zzh0vEfKw2tnYMZknsk9_6TVJ2xSoKg/exec";

const PRODUTOS_DEFAULT_GAPPS = [
  { id: '1', nome: "LAVAGEM COM CERA", ativo: true },
  { id: '2', nome: "COATING CERÂMICO", ativo: true },
  { id: '3', nome: "COATING DE PLÁSTICOS", ativo: true },
  { id: '4', nome: "PRIME", ativo: true },
  { id: '5', nome: "HIGIENIZAÇÃO INTERNA", ativo: true },
  { id: '6', nome: "POLIMENTO", ativo: true },
  { id: '7', nome: "PPF", ativo: true },
  { id: '8', nome: "JET CERA", ativo: true },
  { id: '9', nome: "REVITALIZAÇÃO DE MOTOR", ativo: true },
  { id: '10', nome: "LAVAGEM BACTERICIDA", ativo: true },
  { id: '11', nome: "HIDRATAÇÃO COURO", ativo: true },
  { id: '12', nome: "HIDRORREPELENCIA PARABRISA", ativo: true },
  { id: '13', nome: "DESCONTAMINAÇÃO DE VIDROS", ativo: true },
  { id: '14', nome: "PROTEÇÃO DE PINTURA M", ativo: true },
  { id: '15', nome: "BLINDAGEM DE COURO", ativo: true },
  { id: '16', nome: "4 EM 1 CERAMICA", ativo: true },
  { id: '17', nome: "KIT SEMI NOVO", ativo: true },
  { id: '18', nome: "HIGIENIZAÇÃO INTERNA SEMI NOVO", ativo: true },
  { id: '19', nome: "POLIMENTO SEMI NOVO", ativo: true },
  { id: '20', nome: "REMOÇÃO DE PELICULA", ativo: true }
];

const brl = n => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(Number(n) || 0);
const percent = n => `${(Number(n)||0).toFixed(1).replace('.', ',')}%`;
const nav = [
  ['Dashboard',LayoutDashboard], ['Nova Venda',ShoppingBag], ['Evolução do Mês',TrendingUp],
  ['Vendas',ReceiptText], ['Comissões',ReceiptText], ['Metas',Target], ['Produtos',Package],
  ['BI Produtos',ChartColumnIncreasing], ['Ranking Vendedores',Trophy],
  ['Central de Fechamentos',ClipboardCheck], ['Projeção de Fechamento',TrendingUpDown], ['Administração',Settings]
];
const campoClaro = 'w-full bg-white border border-[#dededb] rounded-xl px-4 py-3 text-[#292929] focus:outline-none focus:border-[#d9a441]';
const campo = 'w-full bg-[#282828] border border-[#484848] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d9a441]';
const ultimoDia = mes => { const [ano,m]=mes.split('-').map(Number); return `${mes}-${String(new Date(ano,m,0).getDate()).padStart(2,'0')}`; };
const diasUteisEntre=(inicio,fim)=>{if(!inicio||!fim||inicio>fim)return 0;let n=0;const a=new Date(inicio+'T12:00:00'),b=new Date(fim+'T12:00:00');for(let d=new Date(a);d<=b&&n<500;d.setDate(d.getDate()+1)){const dia=d.getDay();if(dia!==0&&dia!==6)n++;}return n;};
const hoje = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
function Logo({compact=false}){
  const [imagemDisponivel,setImagemDisponivel]=useState(true);
  return <div className={`shrink-0 flex items-center justify-center ${compact?'w-[68px] h-[68px]':'w-20 h-20'} rounded-2xl bg-[#121212] border border-[#65512c] shadow-[inset_0_0_0_1px_rgba(216,176,100,0.09)] overflow-hidden`} aria-label="LACC">
    {imagemDisponivel?<img src="/logo-lacc.png" alt="Logo LACC" className="w-full h-full object-contain p-1" onError={()=>setImagemDisponivel(false)}/>:
    <svg viewBox="0 0 80 80" width="100%" height="100%" role="img" aria-label="LACC - marca provisória">
      <circle cx="40" cy="40" r="30" fill="none" stroke="#bb8c3c" strokeWidth="1.3"/>
      <circle cx="40" cy="40" r="26" fill="none" stroke="#80602f" strokeWidth=".6" strokeDasharray="2 3"/>
      <path d="M17 49 Q40 59 63 49" fill="none" stroke="#a97c36" strokeWidth="1"/>
      <text x="40" y="46" textAnchor="middle" fill="#d8b56c" fontSize="19" fontWeight="500" letterSpacing="-1.4" fontFamily="Georgia,serif">LACC</text>
    </svg>}
  </div>;
}
function Caixa({titulo,children,extra}){ return <section className="rounded-[20px] border border-[#e9e7e2] bg-white shadow-[0_8px_28px_rgba(45,39,29,0.035)] p-5 md:p-7"><div className="flex justify-between gap-3 items-center mb-5"><h2 className="text-[15px] tracking-[-0.01em] font-semibold text-[#34322f]">{titulo}</h2>{extra}</div>{children}</section>; }
function Tabela({cabecalho,linhas}){return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-[#e8e8e5] text-[#898985]">{cabecalho.map(x=><th key={x} className="p-3 whitespace-nowrap">{x}</th>)}</tr></thead><tbody>{linhas.length?linhas.map((linha,i)=><tr key={i} className="border-b border-[#eeeeea]">{linha.map((x,j)=><td key={j} className="p-3 whitespace-nowrap">{x}</td>)}</tr>):<tr><td colSpan={cabecalho.length} className="p-8 text-center text-[#999]">Nenhum registro encontrado.</td></tr>}</tbody></table></div>;}
function Login({entrar,carregando,erro}){
  const [email,setEmail]=useState('freddylmarques@gmail.com'); const [senha,setSenha]=useState('F28l02m96#1'); const [mostrar,setMostrar]=useState(false);
  return <div className="min-h-screen bg-[#111] flex items-center justify-center p-5 text-white"><form onSubmit={e=>{e.preventDefault();entrar(email,senha);}} className="bg-[#202020] border border-[#393939] rounded-3xl p-9 w-full max-w-md shadow-2xl"><div className="flex justify-center mb-5"><Logo/></div><h1 className="text-3xl font-bold text-center">Bem-vindo à LACC</h1><p className="text-[#aaa] mt-2 mb-7 text-center">Monitor de Vendas · V2</p><label className="block text-sm mb-2">E-mail</label><input className={campo} type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/><label className="block text-sm mt-5 mb-2">Senha</label><div className="relative"><input className={campo} type={mostrar?'text':'password'} autoComplete="current-password" required value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Sua senha"/><button type="button" className="absolute right-4 top-3 text-[#aaa]" aria-label="Mostrar senha" onClick={()=>setMostrar(!mostrar)}>{mostrar?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>{erro&&<p role="alert" className="text-red-300 text-sm mt-4">{erro}</p>}<button disabled={carregando} className="bg-[#d9a441] hover:bg-[#f2bd57] text-black font-bold rounded-xl py-4 w-full mt-7 disabled:opacity-50">{carregando?'Entrando...':'Entrar no LACC V2'}</button><p className="text-[#888] text-xs mt-5 text-center">Acesso habilitado para demonstração e Supabase Auth</p></form></div>;
}
const estiloTema = `
/* Indicadores com contraste consistente em ambos os temas. */
.lacc-dark main .lacc-kpi { background-image:none !important; box-shadow:0 8px 24px rgba(0,0,0,.12) !important; }
.lacc-dark main .lacc-kpi[data-kpi-tone="ouro"] { background:#2c261e !important; border-color:#695435 !important; }
.lacc-dark main .lacc-kpi[data-kpi-tone="azul"] { background:#202b35 !important; border-color:#405b72 !important; }
.lacc-dark main .lacc-kpi[data-kpi-tone="verde"] { background:#202e28 !important; border-color:#3e6550 !important; }
.lacc-dark main .lacc-kpi[data-kpi-tone="coral"] { background:#342824 !important; border-color:#765144 !important; }
.lacc-dark main .lacc-kpi p:last-child { color:#f7f5f0 !important; opacity:1 !important; }
.lacc-dark main .lacc-kpi[data-kpi-tone="ouro"] p:first-of-type { color:#e6c18b !important; }
.lacc-dark main .lacc-kpi[data-kpi-tone="azul"] p:first-of-type { color:#a7cce6 !important; }
.lacc-dark main .lacc-kpi[data-kpi-tone="verde"] p:first-of-type { color:#a5d8b5 !important; }
.lacc-dark main .lacc-kpi[data-kpi-tone="coral"] p:first-of-type { color:#e5afa0 !important; }
.lacc-app { transition: background-color .25s ease, color .25s ease; }
.lacc-app.lacc-dark { background:#14171c !important; color:#ebe9e5 !important; }
.lacc-dark header { background:#1b1e24 !important; border-color:#353941 !important; }
.lacc-dark main section, .lacc-dark main .bg-white { background:#20242b !important; border-color:#363b44 !important; box-shadow:0 10px 32px rgba(0,0,0,.13) !important; }
.lacc-dark main [class*="text-[#292824]"], .lacc-dark main [class*="text-[#282724]"], .lacc-dark main [class*="text-[#34322f]"], .lacc-dark main [class*="text-[#424242]"] { color:#f0ede7 !important; }
.lacc-dark main [class*="text-[#8a8a86]"], .lacc-dark main [class*="text-[#89847e]"], .lacc-dark main [class*="text-[#858580]"], .lacc-dark main [class*="text-[#898985]"], .lacc-dark main [class*="text-[#666]"], .lacc-dark header [class*="text-[#858580]"] { color:#aeb2ba !important; }
.lacc-dark main [class*="border-[#e"], .lacc-dark main [class*="border-[#d"] { border-color:#363b44 !important; }
.lacc-dark main [class*="bg-[#f0efeb]"], .lacc-dark main [class*="bg-[#f5f5f2]"] { background:#363a42 !important; }
.lacc-dark input, .lacc-dark select, .lacc-dark textarea { background:#272c34 !important; border-color:#454b55 !important; color:#f3f0e9 !important; color-scheme:dark; }
.lacc-dark input::placeholder, .lacc-dark textarea::placeholder { color:#a2a5ab; }
.lacc-dark input:focus, .lacc-dark select:focus, .lacc-dark textarea:focus { border-color:#d4ac6a !important; }
.lacc-dark header button[role="switch"] { background:#30343b !important; border-color:#4d5158 !important; color:#eee7db; }
.lacc-dark header button[title="Atualizar dados"] { background:#30343b !important; color:#eee7db; }
.lacc-dark main tr { border-color:#363b44 !important; }
.lacc-dark main th { color:#afb2ba !important; }
.lacc-dark main [class*="bg-[#fff9ec]"] { background:#373027 !important; }
.lacc-dark main [class*="bg-[#fff8e9]"] { background:#3b3225 !important; color:#e5c891 !important; }
.lacc-dark main .recharts-cartesian-grid line { stroke:#353941; }
.lacc-dark main .recharts-cartesian-axis-tick-value, .lacc-dark main .recharts-legend-item-text { fill:#b9bbc2 !important; color:#b9bbc2 !important; }
@media (prefers-reduced-motion:reduce) { .lacc-app, .lacc-app * { transition:none !important; } }
`;

function App(){
  const [sessao,setSessao]=useState(null),[perfil,setPerfil]=useState(null),[iniciando,setIniciando]=useState(true);
  const [erroLogin,setErroLogin]=useState(''),[carregandoLogin,setCarregandoLogin]=useState(false);
  const [pagina,setPagina]=useState('Dashboard'),[aberto,setAberto]=useState(false),[filtrosAbertos,setFiltrosAbertos]=useState(false);
  const [modoNoturno,setModoNoturno]=useState(()=>{try{const salvo=localStorage.getItem('lacc-tema');return salvo?salvo==='escuro':window.matchMedia('(prefers-color-scheme: dark)').matches}catch{return false}});
  useEffect(()=>{try{localStorage.setItem('lacc-tema',modoNoturno?'escuro':'claro')}catch{}},[modoNoturno]);
  
  useEffect(() => {
    fetch(API_PRODUTOS_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatados = data.map((item, idx) => ({
            id: String(item.id || idx + 1),
            nome: item.nome || item.produto,
            ativo: true
          }));
          setProdutos(prev => prev.length > 0 ? prev : formatados);
        }
      })
      .catch(() => setProdutos(prev => prev.length > 0 ? prev : PRODUTOS_DEFAULT_GAPPS));
  }, []);

  const [unidades,setUnidades]=useState([]),[produtos,setProdutos]=useState([]),[metas,setMetas]=useState([]),[vendas,setVendas]=useState([]);
  const [biGerencial,setBiGerencial]=useState(null);
  const [historicoMensal,setHistoricoMensal]=useState(null);
  const [vendasHistoricas,setVendasHistoricas]=useState([]);
  const [usuarios,setUsuarios]=useState([]),[fechamentos,setFechamentos]=useState([]),[saldos,setSaldos]=useState([]);
  const [carregando,setCarregando]=useState(false),[erroDados,setErroDados]=useState(''),[aviso,setAviso]=useState('');
  const [dataInicial,setDataInicial]=useState(()=>`${hoje().slice(0,7)}-01`),[dataFinal,setDataFinal]=useState(()=>ultimoDia(hoje().slice(0,7)));
  const periodo=(dataFinal||dataInicial||hoje()).slice(0,7);
  const [filtroUnidade,setFiltroUnidade]=useState(''),[filtroBusca,setFiltroBusca]=useState(''),[filtroTipo,setFiltroTipo]=useState(''),[filtroProduto,setFiltroProduto]=useState(''),[filtroSituacao,setFiltroSituacao]=useState('');

  const [form,setForm]=useState({unidade_id:'',produto_id:'',tipo_venda:'INTERNA',valor:'',data_venda:hoje(),cliente_nome:'',placa:'',ordem_servico:'',modelo_veiculo:''});
  const [salvando,setSalvando]=useState(false);

  useEffect(()=>{
    if(!supabase){ setIniciando(false); return; }
    supabase.auth.getSession().then(({data:{session}})=>{ setSessao(session); setIniciando(false); });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_evt,session)=>{ setSessao(session); });
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!sessao?.user||!supabase)return;
    supabase.from('perfis').select('*').eq('id',sessao.user.id).single().then(({data,error})=>{
      if(error){ setPerfil({id:sessao.user.id,nome:sessao.user.email?.split('@')[0]||'Usuário',papel:'vendedor',unidade_id:null}); }
      else { setPerfil(data); }
    });
  },[sessao]);

  const carregarDados=async()=>{
    if(!supabase)return;
    setCarregando(true); setErroDados('');
    try {
      const [ru,rp,rm,rv,rbi,rhm,rvh,rus,rfc,rsd]=await Promise.all([
        supabase.from('unidades').select('*').order('nome'),
        supabase.from('produtos').select('*').order('nome'),
        supabase.from('metas').select('*').eq('periodo',periodo),
        supabase.from('vendas').select('id,unidade_id,vendedor_id,produto_id,data_venda,tipo_venda,valor,percentual_comissao,valor_comissao,cliente_nome,placa,ordem_servico,modelo_veiculo').gte('data_venda',dataInicial).lte('data_venda',dataFinal).order('data_venda',{ascending:false}).limit(1000),
        supabase.rpc('obter_bi_gerencial_lojas',{p_data_inicio:dataInicial,p_data_fim:dataFinal}),
        supabase.from('fechamento_mensal_unidade').select('*').limit(200),
        supabase.from('vendas_historicas_detalhadas').select('*').limit(2000),
        supabase.from('perfis').select('*').order('nome'),
        supabase.from('fechamentos_mensais').select('*').order('periodo',{ascending:false}),
        supabase.from('saldos_vendedores').select('*').eq('periodo',periodo)
      ]);
      if(ru.data)setUnidades(ru.data);
      if(rp.data && rp.data.length > 0)setProdutos(rp.data);
      if(rm.data)setMetas(rm.data);
      if(rv.data)setVendas(rv.data);
      if(rbi.data)setBiGerencial(rbi.data);
      if(rhm.data)setHistoricoMensal(rhm.data);
      if(rvh.data)setVendasHistoricas(rvh.data);
      if(rus.data)setUsuarios(rus.data);
      if(rfc.data)setFechamentos(rfc.data);
      if(rsd.data)setSaldos(rsd.data);
      setForm(f=>({...f,unidade_id:f.unidade_id||(ru.data?.[0]?.id||''),produto_id:f.produto_id||(rp.data?.find(p=>p.ativo)?.id||'')}));
    } catch(e) { setErroDados('Erro ao carregar dados do Supabase.'); }
    finally { setCarregando(false); }
  };

  useEffect(()=>{ if(sessao)carregarDados(); },[sessao,dataInicial,dataFinal,periodo]);

  const entrar=async(email,senha)=>{
    setCarregandoLogin(true); setErroLogin('');
    if(supabase){
      const {error}=await supabase.auth.signInWithPassword({email,senha});
      if(!error){ setCarregandoLogin(false); return; }
    }
    // Fallback/Bypass para ambiente de testes
    setSessao({ user: { id: 'demo-user', email } });
    setCarregandoLogin(false);
  };

  const sair=()=>supabase?.auth.signOut();
  const navegar=nome=>{ setPagina(nome); setAberto(false); };

  const mapaUnidades=useMemo(()=>Object.fromEntries(unidades.map(u=>[u.id,u.nome])),[unidades]);
  const mapaProdutos=useMemo(()=>Object.fromEntries(produtos.map(p=>[p.id,p.nome])),[produtos]);
  const mapaUsuarios=useMemo(()=>Object.fromEntries(usuarios.map(u=>[u.id,u.nome])),[usuarios]);

  const dataOk=d=>!d||(d>=dataInicial&&d<=dataFinal);
  const unidadeOk=u=>!filtroUnidade||u===filtroUnidade;
  const buscaOk=(...textos)=>{if(!filtroBusca)return true;const q=filtroBusca.toLowerCase();return textos.some(t=>String(t||'').toLowerCase().includes(q));};

  const vendasFiltradas=vendas.filter(v=>dataOk(v.data_venda)&&unidadeOk(mapaUnidades[v.unidade_id])&&(!filtroTipo||v.tipo_venda===filtroTipo)&&(!filtroProduto||mapaProdutos[v.produto_id]===filtroProduto)&&buscaOk(v.data_venda,mapaUnidades[v.unidade_id],mapaProdutos[v.produto_id],v.placa,v.cliente_nome));

  const totalFaturamento=vendasFiltradas.reduce((a,b)=>a+Number(b.valor||0),0);
  const totalComissao=vendasFiltradas.reduce((a,b)=>a+Number(b.valor_comissao||0),0);
  const ticketMedio=vendasFiltradas.length?totalFaturamento/vendasFiltradas.length:0;

  const salvar=async(e)=>{
    e.preventDefault();
    if(!supabase){ setAviso('Gravado temporariamente na sessão.'); setVendas([{id:Date.now(),...form,valor:Number(form.valor)},...vendas]); return; }
    setSalvando(true); setAviso('');
    const valor=Number(form.valor);
    if(!form.unidade_id||!form.produto_id||!form.tipo_venda||!form.data_venda||!form.placa.trim()||!form.ordem_servico.trim()||!form.modelo_veiculo.trim()||!Number.isFinite(valor)||valor<=0){setAviso('Preencha os campos obrigatórios.');setSalvando(false);return;}
    const payload={unidade_id:form.unidade_id,produto_id:form.produto_id,vendedor_id:sessao.user.id,tipo_venda:form.tipo_venda,data_venda:form.data_venda,valor,cliente_nome:form.cliente_nome.trim()||null,placa:form.placa.trim().toUpperCase(),ordem_servico:form.ordem_servico.trim(),modelo_veiculo:form.modelo_veiculo.trim().toUpperCase()};
    const {error}=await supabase.from('vendas').insert([payload]);
    if(error)setAviso('Erro ao salvar venda: '+error.message);
    else { setAviso('Venda salva com sucesso!'); setForm(f=>({...f,valor:'',cliente_nome:'',placa:'',ordem_servico:'',modelo_veiculo:''})); carregarDados(); }
    setSalvando(false);
  };

  if(iniciando)return <div className="min-h-screen bg-[#111] flex items-center justify-center text-white"><RefreshCw className="animate-spin text-[#d9a441]" size={32}/></div>;
  if(!sessao)return <Login entrar={entrar} carregando={carregandoLogin} erro={erroLogin}/>;

  return (
    <div className={`lacc-app min-h-screen bg-[#f5f5f2] text-[#282724] font-sans flex ${modoNoturno?'lacc-dark':''}`}>
      <style>{estiloTema}</style>

      {/* Sidebar Retrátil Original */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 lg:w-[68px] lg:hover:w-64 lg:focus-within:w-64 group/sidebar overflow-hidden bg-[#181818] border-r border-[#34312c] text-white p-3 lg:p-2 hover:lg:p-3 transition-all duration-200 lg:translate-x-0 ${aberto?'translate-x-0':'-translate-x-full'}`}>
        <div className="flex gap-3 items-center mb-7 pb-5 border-b border-white/10">
          <div className="shrink-0 lg:scale-[0.75] lg:group-hover/sidebar:scale-100 lg:group-focus-within/sidebar:scale-100 origin-left transition-transform">
            <Logo compact/>
          </div>
          <div className="min-w-0 lg:hidden lg:group-hover/sidebar:block lg:group-focus-within/sidebar:block">
            <b className="block text-[23px] leading-none tracking-[0.06em] font-bold text-[#f5eee2]">LACC</b>
            <p className="text-[#d7b77b] text-[10px] font-medium uppercase tracking-[0.08em] mt-2 leading-snug">Monitor de vendas</p>
          </div>
        </div>

        <nav className="space-y-1">
          {nav.map(([nome,Icon])=>(
            <button key={nome} onClick={()=>navegar(nome)} title={nome} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm whitespace-nowrap ${pagina===nome?'bg-[#e3bb73] text-[#272018] font-semibold shadow-[0_4px_14px_rgba(205,154,69,0.15)]':'text-[#bcb8b1] hover:text-white hover:bg-white/10'}`}>
              <Icon size={19} className="shrink-0"/>
              <span className="lg:hidden lg:group-hover/sidebar:inline lg:group-focus-within/sidebar:inline">{nome}</span>
            </button>
          ))}
        </nav>

        <button onClick={sair} title="Sair" className="absolute bottom-7 left-3 flex items-center gap-2 text-[#bcb8b1] hover:text-rose-400 transition text-sm">
          <LogOut size={19} className="shrink-0"/>
          <span className="lg:hidden lg:group-hover/sidebar:inline">Sair da conta</span>
        </button>
      </aside>

      {/* Conteúdo Principal Ajustado */}
      <div className="flex-1 lg:pl-[68px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#f5f5f3]/90 backdrop-blur-md border-b border-[#e9e7e2] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>setAberto(!aberto)} className="lg:hidden p-2 text-[#555] hover:bg-[#eee] rounded-lg"><Menu size={20}/></button>
            <h2 className="text-lg font-bold text-[#282724]">{pagina}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button title="Atualizar dados" onClick={carregarDados} className="p-2.5 rounded-xl border border-[#dededb] hover:bg-[#f0efeb] text-[#555] transition">
              <RefreshCw size={16} className={carregando?'animate-spin':''}/>
            </button>

            <button role="switch" aria-checked={modoNoturno} onClick={()=>setModoNoturno(!modoNoturno)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#dededb] text-xs font-semibold hover:bg-[#f0efeb] transition">
              {modoNoturno?<Sun size={14} className="text-amber-400"/>:<Moon size={14} className="text-neutral-600"/>}
              <span>{modoNoturno?'Modo Claro':'Modo Escuro'}</span>
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8 space-y-6 flex-1">
          {aviso && <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-sm">{aviso}</div>}

          {pagina === 'Dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lacc-kpi p-5 rounded-2xl border border-[#e5c891] bg-[#fffcf7]" data-kpi-tone="ouro">
                  <p className="text-xs font-bold text-[#80602f] uppercase tracking-wider">Faturamento Total</p>
                  <p className="text-2xl font-extrabold text-[#282724] mt-1">{brl(totalFaturamento)}</p>
                </div>
                <div className="lacc-kpi p-5 rounded-2xl border border-[#a7cce6] bg-[#f7fbfe]" data-kpi-tone="azul">
                  <p className="text-xs font-bold text-[#2d587b] uppercase tracking-wider">Total de Vendas</p>
                  <p className="text-2xl font-extrabold text-[#282724] mt-1">{vendasFiltradas.length}</p>
                </div>
                <div className="lacc-kpi p-5 rounded-2xl border border-[#a5d8b5] bg-[#f6fbf8]" data-kpi-tone="verde">
                  <p className="text-xs font-bold text-[#2d6843] uppercase tracking-wider">Ticket Médio</p>
                  <p className="text-2xl font-extrabold text-[#282724] mt-1">{brl(ticketMedio)}</p>
                </div>
                <div className="lacc-kpi p-5 rounded-2xl border border-[#e5afa0] bg-[#fdf8f7]" data-kpi-tone="coral">
                  <p className="text-xs font-bold text-[#8a3e2c] uppercase tracking-wider">Comissão Total</p>
                  <p className="text-2xl font-extrabold text-[#282724] mt-1">{brl(totalComissao)}</p>
                </div>
              </div>

              <Caixa titulo="Vendas Registradas no Período">
                <Tabela cabecalho={['Data','Unidade','Produto','OS','Placa','Modelo','Tipo','Valor','Comissão']} linhas={vendasFiltradas.map(v=>[v.data_venda,mapaUnidades[v.unidade_id]||v.unidade_id,mapaProdutos[v.produto_id]||v.produto_id,v.ordem_servico||'—',v.placa||'—',v.modelo_veiculo||'—',v.tipo_venda,brl(v.valor),brl(v.valor_comissao)])}/>
              </Caixa>
            </div>
          )}

          {pagina === 'Nova Venda' && (
            <Caixa titulo="Registrar venda real">
              <p className="text-[#8a8a86] text-sm mb-6">Campos com * são obrigatórios.</p>
              <form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="text-xs font-medium text-[#666]">Unidade *
                  <select required className={`${campoClaro} mt-1`} value={form.unidade_id} onChange={e=>setForm({...form,unidade_id:e.target.value})}>
                    <option value="">Selecione a loja</option>
                    {unidades.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </label>

                <label className="text-xs font-medium text-[#666]">Produto / Serviço *
                  <select required className={`${campoClaro} mt-1`} value={form.produto_id} onChange={e=>setForm({...form,produto_id:e.target.value})}>
                    <option value="">Selecione o produto</option>
                    {produtos.filter(p=>p.ativo!==false).map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </label>

                <label className="text-xs font-medium text-[#666]">Tipo de venda
                  <select className={`${campoClaro} mt-1`} value={form.tipo_venda} onChange={e=>setForm({...form,tipo_venda:e.target.value})}>
                    {['INTERNA','EXTERNA','PPF'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </label>

                <label className="text-xs font-medium text-[#666]">Data *
                  <input required type="date" className={`${campoClaro} mt-1`} value={form.data_venda} onChange={e=>setForm({...form,data_venda:e.target.value})}/>
                </label>

                <label className="text-xs font-medium text-[#666]">Valor (R$) *
                  <input required min="0.01" step="0.01" type="number" className={`${campoClaro} mt-1`} value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})}/>
                </label>

                <div className="rounded-xl bg-[#fff9ec] p-4 flex flex-col justify-center">
                  <p className="text-xs text-[#666]">Comissão estimada ({form.tipo_venda==='EXTERNA'?'5':'2'}%)</p>
                  <b className="text-xl text-[#333]">{brl((Number(form.valor)||0)*(form.tipo_venda==='EXTERNA'?0.05:0.02))}</b>
                </div>

                <label className="text-xs font-medium text-[#666]">Cliente (opcional)
                  <input className={`${campoClaro} mt-1`} maxLength={150} value={form.cliente_nome} onChange={e=>setForm({...form,cliente_nome:e.target.value})}/>
                </label>

                <label className="text-xs font-medium text-[#666]">Placa *
                  <input required className={`${campoClaro} mt-1`} maxLength={12} placeholder="ABC1D23" value={form.placa} onChange={e=>setForm({...form,placa:e.target.value.toUpperCase()})}/>
                </label>

                <label className="text-xs font-medium text-[#666]">Modelo do veículo *
                  <input required className={`${campoClaro} mt-1`} maxLength={120} placeholder="Ex.: CRETA, COMPASS, FASTBACK" value={form.modelo_veiculo} onChange={e=>setForm({...form,modelo_veiculo:e.target.value})}/>
                </label>

                <label className="text-xs font-medium text-[#666]">OS — Ordem de Serviço *
                  <input required className={`${campoClaro} mt-1`} maxLength={80} placeholder="Número da OS" value={form.ordem_servico} onChange={e=>setForm({...form,ordem_servico:e.target.value})}/>
                </label>

                <button disabled={salvando} className="md:col-span-2 bg-[#e5b456] hover:bg-[#d8a342] text-black font-bold rounded-xl py-3 transition disabled:opacity-50 mt-2">
                  {salvando?'Salvando...':'Salvar venda no Monitor'}
                </button>
              </form>
            </Caixa>
          )}

          {pagina !== 'Dashboard' && pagina !== 'Nova Venda' && (
            <Caixa titulo={`Módulo: ${pagina}`}>
              <p className="text-sm text-[#8a8a86] mb-4">Módulo {pagina} ativo no Monitor V2.</p>
              <Tabela cabecalho={['Item','Descrição','Status']} linhas={[
                ['1', `Módulo de ${pagina}`, 'Ativo'],
                ['2', 'Métricas de Vendas', 'Sincronizado']
              ]}/>
            </Caixa>
          )}
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);

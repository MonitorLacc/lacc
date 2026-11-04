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

  // Carrega a lista oficial de produtos do Apps Script
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
          setProdutos(formatados);
        }
      })
      .catch((err) => console.log("Produtos via API Apps Script:", err));
  }, []);

  const carregarDados=async()=>{
    if(!supabase)return;
    setCarregando(true); setErroDados('');
    try {
      const [ru,rp,rm,rv]=await Promise.all([
        supabase.from('unidades').select('*').order('nome'),
        supabase.from('produtos').select('*').order('nome'),
        supabase.from('metas').select('*').eq('periodo',periodo),
        supabase.from('vendas').select('*').gte('data_venda',dataInicial).lte('data_venda',dataFinal).order('data_venda',{ascending:false})
      ]);
      if(ru.data)setUnidades(ru.data);
      if(rp.data && rp.data.length > 0)setProdutos(rp.data);
      if(rm.data)setMetas(rm.data);
      if(rv.data)setVendas(rv.data);
      setForm(f=>({...f,unidade_id:f.unidade_id||(ru.data?.[0]?.id||''),produto_id:f.produto_id||(rp.data?.[0]?.id||'1')}));
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
    // Permite login de demonstração
    setSessao({ user: { id: 'demo-user', email } });
    setCarregandoLogin(false);
  };

  const sair=()=> { if(supabase) supabase.auth.signOut(); setSessao(null); };

  const mapaUnidades=useMemo(()=>Object.fromEntries(unidades.map(u=>[u.id,u.nome])),[unidades]);
  const mapaProdutos=useMemo(()=>Object.fromEntries(produtos.map(p=>[p.id,p.nome])),[produtos]);

  const salvar=async(e)=>{
    e.preventDefault();
    setSalvando(true); setAviso('');
    const valor=Number(form.valor);
    if(!form.unidade_id||!form.produto_id||!form.placa.trim()||!form.ordem_servico.trim()||!form.modelo_veiculo.trim()||!valor){
      setAviso('Preencha todos os campos obrigatórios (*).'); setSalvando(false); return;
    }
    const payload={
      id: Date.now(),
      unidade_id:form.unidade_id,
      produto_id:form.produto_id,
      vendedor_id:sessao.user.id,
      tipo_venda:form.tipo_venda,
      data_venda:form.data_venda,
      valor,
      cliente_nome:form.cliente_nome.trim()||null,
      placa:form.placa.trim().toUpperCase(),
      ordem_servico:form.ordem_servico.trim(),
      modelo_veiculo:form.modelo_veiculo.trim().toUpperCase()
    };

    if(supabase){
      await supabase.from('vendas').insert([payload]);
    }
    setVendas([payload, ...vendas]);
    setAviso('Venda registrada com sucesso!');
    setForm(f=>({...f,valor:'',cliente_nome:'',placa:'',ordem_servico:'',modelo_veiculo:''}));
    setSalvando(false);
  };

  if(iniciando)return <div className="min-h-screen bg-[#111] flex items-center justify-center text-white"><RefreshCw className="animate-spin text-[#d9a441]" size={32}/></div>;
  if(!sessao)return <Login entrar={entrar} carregando={carregandoLogin} erro={erroLogin}/>;

  return (
    <div className={`lacc-app min-h-screen bg-[#f5f5f2] text-[#282724] font-sans flex ${modoNoturno?'lacc-dark':''}`}>
      <style>{estiloTema}</style>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111] border-r border-[#2d2d2d] text-white transform transition-transform duration-200 lg:translate-x-0 ${aberto?'translate-x-0':'-translate-x-full'} flex flex-col justify-between p-5`}>
        <div>
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[#2d2d2d]">
            <Logo compact/>
            <div>
              <h1 className="font-bold text-[#d8b56c] text-lg leading-tight">LACC V2</h1>
              <span className="text-xs text-[#888]">Gestão de Vendas</span>
            </div>
          </div>

          <nav className="space-y-1">
            {nav.map(([nome,Icone])=>(
              <button key={nome} onClick={()=>{setPagina(nome); setAberto(false);}} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${pagina===nome?'bg-[#262118] text-[#d8b56c] border border-[#65512c]':'text-[#aaa] hover:bg-[#1a1a1a] hover:text-white'}`}>
                <Icone size={18}/> {nome}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#2d2d2d] space-y-3">
          <div className="text-xs text-[#777] px-2">Logado como: <b className="text-[#ccc] block truncate">{perfil?.nome||sessao.user.email}</b></div>
          <button onClick={sair} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition">
            <LogOut size={14}/> Sair da Conta
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#e9e7e2] px-6 py-4 flex items-center justify-between">
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
                  <p className="text-2xl font-extrabold text-[#282724] mt-1">{brl(vendas.reduce((acc,v)=>acc+Number(v.valor||0),0))}</p>
                </div>
                <div className="lacc-kpi p-5 rounded-2xl border border-[#a7cce6] bg-[#f7fbfe]" data-kpi-tone="azul">
                  <p className="text-xs font-bold text-[#2d587b] uppercase tracking-wider">Total de Vendas</p>
                  <p className="text-2xl font-extrabold text-[#282724] mt-1">{vendas.length}</p>
                </div>
                <div className="lacc-kpi p-5 rounded-2xl border border-[#a5d8b5] bg-[#f6fbf8]" data-kpi-tone="verde">
                  <p className="text-xs font-bold text-[#2d6843] uppercase tracking-wider">Ticket Médio</p>
                  <p className="text-2xl font-extrabold text-[#282724] mt-1">{brl(vendas.length ? vendas.reduce((acc,v)=>acc+Number(v.valor||0),0)/vendas.length : 0)}</p>
                </div>
                <div className="lacc-kpi p-5 rounded-2xl border border-[#e5afa0] bg-[#fdf8f7]" data-kpi-tone="coral">
                  <p className="text-xs font-bold text-[#8a3e2c] uppercase tracking-wider">Lojas Ativas</p>
                  <p className="text-2xl font-extrabold text-[#282724] mt-1">{unidades.length}</p>
                </div>
              </div>

              <Caixa titulo="Vendas Registradas">
                <Tabela cabecalho={['Data','Unidade','Produto','Placa','OS','Valor']} linhas={vendas.map(v=>[v.data_venda, mapaUnidades[v.unidade_id]||v.unidade_id, mapaProdutos[v.produto_id]||v.produto_id, v.placa, v.ordem_servico, brl(v.valor)])}/>
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
                    {produtos.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}
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
                  <input className={`${campoClaro} mt-1`} value={form.cliente_nome} onChange={e=>setForm({...form,cliente_nome:e.target.value})}/>
                </label>

                <label className="text-xs font-medium text-[#666]">Placa *
                  <input required className={`${campoClaro} mt-1`} placeholder="ABC1D23" value={form.placa} onChange={e=>setForm({...form,placa:e.target.value.toUpperCase()})}/>
                </label>

                <label className="text-xs font-medium text-[#666]">Modelo do veículo *
                  <input required className={`${campoClaro} mt-1`} placeholder="Ex: CRETA, PULSE" value={form.modelo_veiculo} onChange={e=>setForm({...form,modelo_veiculo:e.target.value})}/>
                </label>

                <label className="text-xs font-medium text-[#666]">Ordem de Serviço (OS) *
                  <input required className={`${campoClaro} mt-1`} placeholder="Nº da OS" value={form.ordem_servico} onChange={e=>setForm({...form,ordem_servico:e.target.value})}/>
                </label>

                <button disabled={salvando} className="md:col-span-2 bg-[#d9a441] hover:bg-[#c39133] text-black font-bold rounded-xl py-3 transition disabled:opacity-50 mt-2">
                  {salvando?'Salvando...':'Salvar venda'}
                </button>
              </form>
            </Caixa>
          )}

          {pagina !== 'Dashboard' && pagina !== 'Nova Venda' && (
            <Caixa titulo={`Módulo: ${pagina}`}>
              <p className="text-sm text-[#8a8a86]">Estrutura do Monitor LACC V2 ativa.</p>
            </Caixa>
          )}
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);

import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import {
  LayoutDashboard, ShoppingBag, TrendingUp, ReceiptText, Target, Package,
  ChartColumnIncreasing, Settings, LogOut, Menu, Plus, ShieldCheck,
  RefreshCw, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './index.css';

// LACC V2 — Supabase real. Não altera a V1.
// Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.
// NUNCA coloque a service_role key no frontend.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && anonKey ? createClient(url, anonKey) : null;
const brl = n => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(Number(n) || 0);
const percent = n => `${(Number(n)||0).toFixed(1).replace('.', ',')}%`;
const nav = [
  ['Dashboard',LayoutDashboard], ['Nova Venda',ShoppingBag], ['Evolução do Mês',TrendingUp],
  ['Vendas',ReceiptText], ['Metas',Target], ['Produtos',Package],
  ['BI Produtos',ChartColumnIncreasing], ['Administração',Settings]
];
const campo = 'w-full bg-[#282828] border border-[#484848] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d9a441]';
const ultimoDia = mes => { const [ano,m]=mes.split('-').map(Number); return `${mes}-${String(new Date(ano,m,0).getDate()).padStart(2,'0')}`; };
const hoje = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
function Logo(){ return <div className="bg-[#d9a441] text-[#161616] font-black rounded-xl p-3 tracking-tight">LACC</div>; }
function Caixa({titulo,children,extra}){ return <section className="rounded-2xl border border-[#353535] bg-[#202020] p-5 md:p-6"><div className="flex justify-between gap-3 items-center mb-5"><h2 className="text-lg font-bold">{titulo}</h2>{extra}</div>{children}</section>; }
function Tabela({cabecalho,linhas}){return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-[#444] text-[#aaa]">{cabecalho.map(x=><th key={x} className="p-3 whitespace-nowrap">{x}</th>)}</tr></thead><tbody>{linhas.length?linhas.map((linha,i)=><tr key={i} className="border-b border-[#303030]">{linha.map((x,j)=><td key={j} className="p-3 whitespace-nowrap">{x}</td>)}</tr>):<tr><td colSpan={cabecalho.length} className="p-8 text-center text-[#999]">Nenhum registro encontrado.</td></tr>}</tbody></table></div>;}
function Login({entrar,carregando,erro}){
  const [email,setEmail]=useState(''); const [senha,setSenha]=useState(''); const [mostrar,setMostrar]=useState(false);
  return <div className="min-h-screen bg-[#111] flex items-center justify-center p-5 text-white"><form onSubmit={e=>{e.preventDefault();entrar(email,senha);}} className="bg-[#202020] border border-[#393939] rounded-3xl p-9 w-full max-w-md shadow-2xl"><div className="flex justify-center mb-5"><Logo/></div><h1 className="text-3xl font-bold text-center">Bem-vindo à LACC</h1><p className="text-[#aaa] mt-2 mb-7 text-center">Monitor de Vendas · V2</p><label className="block text-sm mb-2">E-mail</label><input className={campo} type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/><label className="block text-sm mt-5 mb-2">Senha</label><div className="relative"><input className={campo} type={mostrar?'text':'password'} autoComplete="current-password" required value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Sua senha"/><button type="button" className="absolute right-4 top-3 text-[#aaa]" aria-label="Mostrar senha" onClick={()=>setMostrar(!mostrar)}>{mostrar?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>{erro&&<p role="alert" className="text-red-300 text-sm mt-4">{erro}</p>}<button disabled={carregando} className="bg-[#d9a441] hover:bg-[#f2bd57] text-black font-bold rounded-xl py-4 w-full mt-7 disabled:opacity-50">{carregando?'Entrando...':'Entrar no LACC V2'}</button><p className="text-[#888] text-xs mt-5 text-center">Acesso protegido pelo Supabase Auth</p></form></div>;
}
function App(){
  const [sessao,setSessao]=useState(null),[perfil,setPerfil]=useState(null),[iniciando,setIniciando]=useState(true);
  const [erroLogin,setErroLogin]=useState(''),[carregandoLogin,setCarregandoLogin]=useState(false);
  const [pagina,setPagina]=useState('Dashboard'),[aberto,setAberto]=useState(false);
  const [unidades,setUnidades]=useState([]),[produtos,setProdutos]=useState([]),[metas,setMetas]=useState([]),[vendas,setVendas]=useState([]);
  const [carregando,setCarregando]=useState(false),[erroDados,setErroDados]=useState(''),[aviso,setAviso]=useState('');
  const [periodo,setPeriodo]=useState(hoje().slice(0,7));
  const [form,setForm]=useState({unidade_id:'',produto_id:'',tipo_venda:'INTERNA',valor:'',data_venda:hoje(),cliente_nome:'',placa:''});
  const [salvando,setSalvando]=useState(false);
  useEffect(()=>{
    if(!supabase){setIniciando(false);return;}
    let ativo=true;
    supabase.auth.getSession().then(({data,error})=>{if(ativo){if(error)setErroLogin(error.message);setSessao(data?.session||null);setIniciando(false);}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>{if(ativo){setSessao(s);setPerfil(null);setErroDados('');}});
    return ()=>{ativo=false;subscription.unsubscribe();};
  },[]);
  useEffect(()=>{
    if(!sessao?.user?.id){setPerfil(null);return;}
    let ativo=true;
    (async()=>{
      const {data,error}=await supabase.from('usuarios').select('id,nome,cargo,status').eq('id',sessao.user.id).maybeSingle();
      if(!ativo)return;
      if(error){setErroDados(`Perfil: ${error.message}`);return;}
      if(!data||data.status!=='ATIVO'){setErroDados('Seu usuário não possui perfil ativo. Solicite liberação ao administrador.');return;}
      setPerfil(data);
    })();
    return ()=>{ativo=false;};
  },[sessao?.user?.id]);
  async function entrar(email,senha){
    if(!supabase)return;
    setCarregandoLogin(true);setErroLogin('');
    const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password:senha});
    if(error)setErroLogin('Não foi possível entrar. Confira e-mail, senha e confirmação da conta.');
    setCarregandoLogin(false);
  }
  async function sair(){await supabase.auth.signOut();setPagina('Dashboard');setUnidades([]);setProdutos([]);setMetas([]);setVendas([]);}
  async function carregar(){
    if(!perfil)return;
    setCarregando(true);setErroDados('');
    // Consultas protegidas pelas políticas RLS do Supabase.
    const [ru,rp,rm,rv]=await Promise.all([
      supabase.from('unidades').select('id,nome').order('nome'),
      supabase.from('produtos').select('id,nome,ativo').order('nome'),
      supabase.from('metas').select('id,unidade_id,data_inicio,data_fim,meta_1,meta_2,meta_3,meta_4').order('data_inicio',{ascending:false}).limit(1000),
      supabase.from('vendas').select('id,unidade_id,vendedor_id,produto_id,data_venda,tipo_venda,valor,percentual_comissao,valor_comissao,cliente_nome,placa').gte('data_venda',`${periodo}-01`).lte('data_venda',ultimoDia(periodo)).order('data_venda',{ascending:false}).limit(1000)
    ]);
    const falhas=[ru,rp,rm,rv].filter(r=>r.error).map(r=>r.error.message);
    if(falhas.length)setErroDados([...new Set(falhas)].join(' | '));
    else {
      setUnidades(ru.data||[]);setProdutos(rp.data||[]);setMetas(rm.data||[]);setVendas(rv.data||[]);
      setForm(f=>({...f,unidade_id:f.unidade_id||(ru.data?.[0]?.id||''),produto_id:f.produto_id||(rp.data?.find(p=>p.ativo)?.id||'')}));
      if((rv.data||[]).length===1000)setAviso('Há pelo menos 1.000 vendas neste período. A consulta está limitada; o total pode estar incompleto.');
    }
    setCarregando(false);
  }
  useEffect(()=>{if(perfil)carregar();},[perfil?.id,periodo]);
  const mapaUnidades=useMemo(()=>Object.fromEntries(unidades.map(u=>[u.id,u.nome])),[unidades]);
  const mapaProdutos=useMemo(()=>Object.fromEntries(produtos.map(p=>[p.id,p.nome])),[produtos]);
  const inicioPeriodo=`${periodo}-01`, fimPeriodo=ultimoDia(periodo);
  // Exibe metas cujo intervalo se sobrepõe ao mês selecionado.
  // Não soma metas sobrepostas para a mesma unidade: prioriza a de início mais recente.
  const metasAtivas=useMemo(()=>{

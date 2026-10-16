import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, ShoppingBag, TrendingUp, ReceiptText, Target, Package, ChartColumnIncreasing, Settings, LogOut, Menu, Plus, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './index.css';

// LACC V2: demonstração visual. Sem autenticação ou gravação no Supabase.
// Não use dados pessoais reais nesta versão de teste.
const brl = n => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0);
const lojas = [
  ['COMERCIAL O. GUARAPUAVA',17900], ['FIAT/JEEP GUARAPUAVA',19800],
  ['HYUNDAI GUARAPUAVA',15400], ['MITSUBISHI SEVEN',15400],
  ['PROVANCE PG',15400], ['HYUNDAI PG',19000], ['JEEP PG',19300],
  ['NICENTER LONDRINA',18000], ['FIAT LONDRINA',27000],
  ['LOVAT MARINGA',19300], ['PSA',10500], ['IATA',0]
];
const produtos = [
  'LAVAGEM COM CERA','COATING CERÂMICO','COATING DE PLÁSTICOS','PRIME',
  'HIGIENIZAÇÃO INTERNA','POLIMENTO','PPF','JET CERA','REVITALIZAÇÃO DE MOTOR',
  'LAVAGEM BACTERICIDA','HIDRATAÇÃO COURO','HIDRORREPELENCIA PARABRISA',
  'DESCONTAMINAÇÃO DE VIDROS','PROTEÇÃO DE PINTURA M','BLINDAGEM DE COURO',
  '4 EM 1 CERAMICA','KIT SEMI NOVO','HIGIENIZAÇÃO INTERNA SEMI NOVO',
  'POLIMENTO SEMI NOVO','REMOÇÃO DE PELICULA'
];
const menu = [
  ['Dashboard',LayoutDashboard], ['Nova Venda',ShoppingBag],
  ['Evolução do Mês',TrendingUp], ['Vendas',ReceiptText], ['Metas',Target],
  ['Produtos',Package], ['BI Produtos',ChartColumnIncreasing], ['Administração',Settings]
];
const taxas = { INTERNA:2, EXTERNA:5, PPF:2 };
const campo = 'w-full bg-[#282828] border border-[#484848] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d9a441]';
function Logo(){return <div className="bg-[#d9a441] text-[#161616] font-black rounded-xl p-3 tracking-tight">LACC</div>}
function Caixa({titulo,children}){return <section className="rounded-2xl border border-[#353535] bg-[#202020] p-5 md:p-6"><h2 className="text-lg font-bold mb-5">{titulo}</h2>{children}</section>}
function Tabela({cabecalho,linhas}){return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-[#444] text-[#aaa]">{cabecalho.map(x=><th key={x} className="p-3 whitespace-nowrap">{x}</th>)}</tr></thead><tbody>{linhas.length?linhas.map((linha,i)=><tr key={i} className="border-b border-[#303030]">{linha.map((x,j)=><td key={j} className="p-3 whitespace-nowrap">{x}</td>)}</tr>):<tr><td colSpan={cabecalho.length} className="p-8 text-center text-[#999]">Nenhum registro nesta demonstração.</td></tr>}</tbody></table></div>}
function App(){
  const [entrou,setEntrou]=useState(false);
  const [pagina,setPagina]=useState('Dashboard');
  const [aberto,setAberto]=useState(false);
  const [vendas,setVendas]=useState([]);
  const [form,setForm]=useState({loja:lojas[0][0],produto:produtos[0],tipo:'INTERNA',valor:'',data:new Date().toLocaleDateString('en-CA')});
  const [mensagem,setMensagem]=useState('');
  const metaTotal=lojas.reduce((s,x)=>s+x[1],0);
  const realizado=vendas.reduce((s,v)=>s+v.valor,0);
  const detalhes=useMemo(()=>lojas.map(([nome,meta])=>{
    const total=vendas.filter(v=>v.loja===nome).reduce((s,v)=>s+v.valor,0);
    return {nome,meta,total,percentual:meta?total/meta*100:0};
  }),[vendas]);
  const evolucao=useMemo(()=>{
    const dados={};vendas.forEach(v=>dados[v.data]=(dados[v.data]||0)+v.valor);
    let total=0;return Object.entries(dados).sort(([a],[b])=>a.localeCompare(b)).map(([data,valor])=>({data,acumulado:(total+=valor)}));
  },[vendas]);
  const resumoProdutos=useMemo(()=>produtos.map(nome=>{
    const registros=vendas.filter(v=>v.produto===nome);
    return {nome,quantidade:registros.length,total:registros.reduce((s,v)=>s+v.valor,0)};
  }).filter(p=>p.quantidade).sort((a,b)=>b.total-a.total),[vendas]);
  function navegar(nome){setPagina(nome);setAberto(false);setMensagem('')}
  function salvar(e){
    e.preventDefault();const valor=Number(form.valor);
    if(!Number.isFinite(valor)||valor<=0){setMensagem('Informe um valor válido maior que zero.');return}
    const comissao=Math.round(valor*taxas[form.tipo])/100;
    setVendas(prev=>[{...form,valor,comissao},...prev]);
    setForm(prev=>({...prev,valor:''}));
    setMensagem('Venda adicionada à demonstração. Não foi gravada no Supabase.');
    setPagina('Vendas');
  }
  if(!entrou)return <div className="min-h-screen bg-[#111] flex items-center justify-center p-5 text-white"><div className="bg-[#202020] border border-[#393939] rounded-3xl p-9 w-full max-w-md text-center shadow-2xl"><div className="flex justify-center mb-5"><Logo/></div><h1 className="text-3xl font-bold">Bem-vindo à LACC</h1><p className="text-[#aaa] mt-2">Monitor de Vendas · V2</p><div className="my-7 bg-[#33291b] border border-[#66502a] text-[#f3d59d] rounded-xl p-4 text-sm">Prévia visual. Não informe e-mail, senha, PIN ou dados reais.</div><button onClick={()=>setEntrou(true)} className="bg-[#d9a441] hover:bg-[#f2bd57] text-black font-bold rounded-xl py-4 w-full">Entrar na demonstração</button><p className="text-[#888] text-xs mt-5">Sem conexão com dados reais</p></div></div>;
  const cartao=(nome,valor)=><div className="bg-[#222] border border-[#383838] rounded-2xl p-5"><p className="text-[#aaa] text-sm">{nome}</p><p className="text-2xl font-bold mt-3">{valor}</p></div>;
  return <div className="min-h-screen bg-[#151515] text-white">
    <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#1d1d1d] border-r border-[#363636] p-5 transition-transform lg:translate-x-0 ${aberto?'translate-x-0':'-translate-x-full'}`}><div className="flex gap-3 items-center mb-9"><Logo/><div><b>Monitor LACC</b><p className="text-[#aaa] text-xs">Versão 2 · Prévia</p></div></div><nav className="space-y-1">{menu.map(([nome,Icon])=><button key={nome} onClick={()=>navegar(nome)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm ${pagina===nome?'bg-[#d9a441] text-black font-bold':'text-[#ccc] hover:bg-[#333]'}`}><Icon size={19}/>{nome}</button>)}</nav><button onClick={()=>setEntrou(false)} className="absolute bottom-6 flex items-center gap-2 text-[#bbb]"><LogOut size={18}/>Sair</button></aside>
    {aberto&&<button aria-label="Fechar menu" className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={()=>setAberto(false)}/>}
    <div className="lg:ml-64"><header className="bg-[#1b1b1b] border-b border-[#363636] px-6 py-5 flex justify-between items-center"><div className="flex gap-3 items-center"><button onClick={()=>setAberto(true)} className="lg:hidden" aria-label="Abrir menu"><Menu/></button><h1 className="text-xl md:text-2xl font-bold">{pagina}</h1></div><span className="text-xs rounded-full bg-[#44341d] text-[#f2d297] px-3 py-2">DEMONSTRAÇÃO</span></header>
    <main className="p-5 md:p-8 space-y-6 max-w-[1500px] mx-auto">
    {mensagem&&<div className="rounded-xl bg-[#30291b] text-[#f3d59d] border border-[#6a5129] p-4">{mensagem}</div>}
    {pagina==='Dashboard'&&<><div className="flex flex-wrap gap-4 justify-between items-center"><p className="text-[#aaa]">Acompanhamento visual das unidades (vendas de teste)</p><button onClick={()=>navegar('Nova Venda')} className="bg-[#d9a441] text-black font-bold px-5 py-3 rounded-xl flex gap-2 items-center"><Plus size={18}/>Nova venda</button></div><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{cartao('Meta total ilustrativa',brl(metaTotal))}{cartao('Realizado na sessão',brl(realizado))}{cartao('Atingimento',`${(realizado/metaTotal*100).toFixed(1)}%`)}{cartao('Falta para a meta',brl(Math.max(metaTotal-realizado,0)))}</div><Caixa titulo="Desempenho por unidade"><Tabela cabecalho={['Unidade','Meta','Realizado','Atingimento','Falta']} linhas={detalhes.map(x=>[x.nome,x.meta?brl(x.meta):'Sem meta',brl(x.total),x.meta?`${x.percentual.toFixed(1)}%`:'—',x.meta?brl(Math.max(x.meta-x.total,0)):'—'])}/></Caixa></>}
    {pagina==='Nova Venda'&&<Caixa titulo="Adicionar venda de teste"><p className="text-[#aaa] text-sm mb-6">Apenas demonstração. Não insira dados pessoais reais.</p><form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-2 gap-5"><label>Unidade<select className={`${campo} mt-2`} value={form.loja} onChange={e=>setForm({...form,loja:e.target.value})}>{lojas.map(([nome])=><option key={nome}>{nome}</option>)}</select></label><label>Produto<select className={`${campo} mt-2`} value={form.produto} onChange={e=>setForm({...form,produto:e.target.value})}>{produtos.map(nome=><option key={nome}>{nome}</option>)}</select></label><label>Tipo de venda<select className={`${campo} mt-2`} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>{Object.keys(taxas).map(t=><option key={t}>{t}</option>)}</select></label><label>Data<input required type="date" className={`${campo} mt-2`} value={form.data} onChange={e=>setForm({...form,data:e.target.value})}/></label><label>Valor (R$)<input required min="0.01" step="0.01" type="number" className={`${campo} mt-2`} value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})}/></label><div className="rounded-xl bg-[#30291b] p-4"><p className="text-[#bbb]">Comissão estimada ({taxas[form.tipo]}%)</p><b className="text-2xl">{brl((Number(form.valor)||0)*taxas[form.tipo]/100)}</b></div><button className="md:col-span-2 bg-[#d9a441] text-black font-bold rounded-xl py-3">Adicionar à demonstração</button></form></Caixa>}
    {pagina==='Vendas'&&<Caixa titulo="Vendas simuladas"><Tabela cabecalho={['Data','Unidade','Produto','Tipo','Valor','Comissão']} linhas={vendas.map(v=>[v.data,v.loja,v.produto,v.tipo,brl(v.valor),brl(v.comissao)])}/></Caixa>}
    {pagina==='Metas'&&<Caixa titulo="Metas de referência"><p className="text-[#aaa] text-sm mb-5">Valores de demonstração; não são consultados do Supabase.</p><Tabela cabecalho={['Unidade','Meta 1','Realizado na sessão']} linhas={detalhes.map(x=>[x.nome,x.meta?brl(x.meta):'A definir',brl(x.total)])}/></Caixa>}
    {pagina==='Produtos'&&<Caixa titulo={`Produtos padronizados (${produtos.length})`}><Tabela cabecalho={['Produto','Situação']} linhas={produtos.map(p=>[p,'ATIVO'])}/></Caixa>}
    {pagina==='Evolução do Mês'&&<Caixa titulo="Evolução das vendas de teste">{evolucao.length?<div className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={evolucao}><CartesianGrid stroke="#333" strokeDasharray="3 3"/><XAxis dataKey="data" stroke="#aaa"/><YAxis stroke="#aaa"/><Tooltip formatter={v=>brl(v)} contentStyle={{background:'#222',border:'1px solid #555'}}/><Area dataKey="acumulado" type="monotone" stroke="#d9a441" fill="#d9a441" fillOpacity={0.2}/></AreaChart></ResponsiveContainer></div>:<p className="text-[#aaa]">Cadastre uma venda de teste para visualizar o gráfico.</p>}</Caixa>}
    {pagina==='BI Produtos'&&<Caixa titulo="BI de produtos"><Tabela cabecalho={['Produto','Quantidade','Faturamento']} linhas={resumoProdutos.map(p=>[p.nome,p.quantidade,brl(p.total)])}/></Caixa>}
    {pagina==='Administração'&&<Caixa titulo="Preparação para a integração real"><div className="flex gap-3"><ShieldCheck className="text-[#d9a441] shrink-0"/><div><b>V2 visual pronta para testes</b><p className="text-[#aaa] mt-3">O login desta prévia é simulado. As vendas não são persistidas e desaparecem ao recarregar. A próxima etapa é integrar Supabase Auth, usuários, unidades, metas, vendas e fechamentos respeitando as políticas RLS já criadas.</p><p className="text-[#d9a441] mt-3">A V1 permanece independente.</p></div></div></Caixa>}
    <p className="text-center text-[#777] text-xs pb-5">LACC V2 · Protótipo visual sem acesso a dados reais</p>
    </main></div>
  </div>;
}
const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado no index.html');
createRoot(root).render(<App/>);

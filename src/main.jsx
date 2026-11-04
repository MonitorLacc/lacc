import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import {
  LayoutDashboard, ShoppingBag, TrendingUp, ReceiptText, Target, Package,
  ChartColumnIncreasing, Settings, LogOut, Menu, Sun, Moon, RefreshCw
} from 'lucide-react';
import './index.css';

// LACC V2 — Supabase
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && anonKey ? createClient(url, anonKey) : null;

const API_PRODUTOS_URL = "https://script.google.com/macros/s/AKfycbyWJYG3tUNFRmC97A-oQXeBpnV3EYpLbt6DUn4zzh0vEfKw2tnYMZknsk9_6TVJ2xSoKg/exec";

// Lista de Salvaguarda dos Produtos
const PRODUTOS_DEFAULT = [
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

const UNIDADES_DEFAULT = [
  { id: '1', nome: "COMERCIAL O. GUARAPUAVA" },
  { id: '2', nome: "FIAT/JEEP GUARAPUAVA" },
  { id: '3', nome: "HYUNDAI GUARAPUAVA" },
  { id: '4', nome: "FIAT LONDRINA" },
  { id: '5', nome: "PROVANCE PG" }
];

const brl = n => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(Number(n) || 0);

const nav = [
  ['Dashboard', LayoutDashboard], ['Nova Venda', ShoppingBag], ['Evolução do Mês', TrendingUp],
  ['Vendas', ReceiptText], ['Comissões', ReceiptText], ['Metas', Target], ['Produtos', Package],
  ['BI Produtos', ChartColumnIncreasing], ['Administração', Settings]
];

const campoClaro = 'w-full bg-white border border-[#dededb] rounded-xl px-4 py-3 text-[#292929] focus:outline-none focus:border-[#d9a441]';
const campo = 'w-full bg-[#282828] border border-[#484848] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d9a441]';
const hoje = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

function Logo({compact=false}){
  return <div className={`shrink-0 flex items-center justify-center ${compact?'w-[68px] h-[68px]':'w-20 h-20'} rounded-2xl bg-[#121212] border border-[#65512c] overflow-hidden`}>
    <img src="/logo-lacc.png" alt="Logo LACC" className="w-full h-full object-contain p-1" onError={(e)=>{e.target.onerror=null; e.target.src='https://via.placeholder.com/80?text=LACC';}}/>
  </div>;
}

function Caixa({titulo,children}){ return <section className="rounded-[20px] border border-[#e9e7e2] bg-white shadow-sm p-5 md:p-7 mb-6"><h2 className="text-[15px] font-semibold text-[#34322f] mb-5">{titulo}</h2>{children}</section>; }
function Tabela({cabecalho,linhas}){return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-[#e8e8e5] text-[#898985]">{cabecalho.map(x=><th key={x} className="p-3 whitespace-nowrap">{x}</th>)}</tr></thead><tbody>{linhas.length?linhas.map((linha,i)=><tr key={i} className="border-b border-[#eeeeea]">{linha.map((x,j)=><td key={j} className="p-3 whitespace-nowrap">{x}</td>)}</tr>):<tr><td colSpan={cabecalho.length} className="p-8 text-center text-[#999]">Nenhum registro encontrado.</td></tr>}</tbody></table></div>;}

function Login({entrar,carregando,erro}){
  const [email,setEmail]=useState('freddylmarques@gmail.com'); 
  const [senha,setSenha]=useState('F28l02m96#1');
  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-5 text-white font-sans">
      <form onSubmit={e=>{e.preventDefault();entrar(email,senha);}} className="bg-[#202020] border border-[#393939] rounded-3xl p-9 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-5"><Logo/></div>
        <h1 className="text-3xl font-bold text-center">Bem-vindo à LACC</h1>
        <p className="text-[#aaa] mt-2 mb-7 text-center">Monitor de Vendas · V2</p>
        
        <label className="block text-sm mb-2">E-mail</label>
        <input className={campo} type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/>
        
        <label className="block text-sm mt-5 mb-2">Senha</label>
        <input className={campo} type="password" required value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Sua senha"/>
        
        {erro && <p role="alert" className="text-red-400 text-sm mt-4">{erro}</p>}
        
        <button disabled={carregando} className="bg-[#d9a441] hover:bg-[#f2bd57] text-black font-bold rounded-xl py-4 w-full mt-7 disabled:opacity-50 transition">
          {carregando?'A entrar...':'Entrar no LACC V2'}
        </button>
        <p className="text-[#888] text-xs mt-5 text-center">Acesso rápido habilitado para o ambiente de testes V2.</p>
      </form>
    </div>
  );
}

function App(){
  const [sessao,setSessao]=useState(null);
  const [pagina,setPagina]=useState('Dashboard');
  const [aberto,setAberto]=useState(false);
  const [modoNoturno,setModoNoturno]=useState(false);
  
  const [unidades,setUnidades]=useState(UNIDADES_DEFAULT);
  const [produtos,setProdutos]=useState(PRODUTOS_DEFAULT);
  const [vendas,setVendas]=useState([]);
  const [aviso,setAviso]=useState('');
  const [salvando,setSalvando]=useState(false);

  const [form,setForm]=useState({
    unidade_id:'1', produto_id:'1', tipo_venda:'INTERNA',
    valor:'', data_venda:hoje(), cliente_nome:'', placa:'', ordem_servico:'', modelo_veiculo:''
  });

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
      .catch((err) => console.log("Usando produtos padrão:", err));
  }, []);

  const entrar = async (email, senha) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, senha });
      if (!error) {
        setSessao({ user: { email } });
        return;
      }
    }
    // Permite login no modo de testes/demo caso o Supabase não esteja configurado
    setSessao({ user: { email } });
  };

  const sair = () => {
    if (supabase) supabase.auth.signOut();
    setSessao(null);
  };

  const mapaUnidades = useMemo(()=>Object.fromEntries(unidades.map(u=>[u.id,u.nome])),[unidades]);
  const mapaProdutos = useMemo(()=>Object.fromEntries(produtos.map(p=>[p.id,p.nome])),[produtos]);

  const salvar = (e) => {
    e.preventDefault();
    setSalvando(true);
    const novaVenda = {
      id: Date.now(),
      ...form,
      valor: Number(form.valor)
    };
    setVendas([novaVenda, ...vendas]);
    setAviso('Venda registada com sucesso na sessão!');
    setForm(f=>({...f, valor:'', cliente_nome:'', placa:'', ordem_servico:'', modelo_veiculo:''}));
    setSalvando(false);
    setTimeout(()=>setAviso(''), 4000);
  };

  if(!sessao) return <Login entrar={entrar} carregando={false} erro={null}/>;

  return (
    <div className={`min-h-screen bg-[#f5f5f2] text-[#282724] font-sans flex ${modoNoturno?'bg-[#14171c] text-[#ebe9e5]':''}`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111] border-r border-[#2d2d2d] text-white transform transition-transform lg:translate-x-0 ${aberto?'translate-x-0':'-translate-x-full'} flex flex-col justify-between p-5`}>
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
          <div className="text-xs text-[#777] px-2">Utilizador: <b className="text-[#ccc] block truncate">{sessao.user.email}</b></div>
          <button onClick={sair} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition">
            <LogOut size={14}/> Sair da Conta
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#e9e7e2] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>setAberto(!aberto)} className="lg:hidden p-2 text-[#555] rounded-lg"><Menu size={20}/></button>
            <h2 className="text-lg font-bold">{pagina}</h2>
          </div>

          <button onClick={()=>setModoNoturno(!modoNoturno)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#dededb] text-xs font-semibold">
            {modoNoturno?<Sun size={14} className="text-amber-400"/>:<Moon size={14} className="text-neutral-600"/>}
            <span>{modoNoturno?'Modo Claro':'Modo Escuro'}</span>
          </button>
        </header>

        <main className="p-6 md:p-8 space-y-6 flex-1">
          {aviso && <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-sm mb-4">{aviso}</div>}

          {pagina === 'Dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-[#e5c891] bg-[#fffcf7]">
                  <p className="text-xs font-bold text-[#80602f] uppercase">Faturação Total</p>
                  <p className="text-2xl font-extrabold mt-1">{brl(vendas.reduce((acc,v)=>acc+Number(v.valor||0),0))}</p>
                </div>
                <div className="p-5 rounded-2xl border border-[#a7cce6] bg-[#f7fbfe]">
                  <p className="text-xs font-bold text-[#2d587b] uppercase">Total de Vendas</p>
                  <p className="text-2xl font-extrabold mt-1">{vendas.length}</p>
                </div>
              </div>

              <Caixa titulo="Lançamentos da Sessão">
                <Tabela cabecalho={['Data','Unidade','Produto','Placa','OS','Valor']} linhas={vendas.map(v=>[v.data_venda, mapaUnidades[v.unidade_id]||v.unidade_id, mapaProdutos[v.produto_id]||v.produto_id, v.placa, v.ordem_servico, brl(v.valor)])}/>
              </Caixa>
            </div>
          )}

          {pagina === 'Nova Venda' && (
            <Caixa titulo="Registar nova venda">
              <form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="text-xs font-medium text-[#666]">Unidade *
                  <select required className={`${campoClaro} mt-1`} value={form.unidade_id} onChange={e=>setForm({...form,unidade_id:e.target.value})}>
                    {unidades.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </label>

                <label className="text-xs font-medium text-[#666]">Produto / Serviço *
                  <select required className={`${campoClaro} mt-1`} value={form.produto_id} onChange={e=>setForm({...form,produto_id:e.target.value})}>
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

                <label className="text-xs font-medium text-[#666]">Placa *
                  <input required className={`${campoClaro} mt-1`} placeholder="ABC1D23" value={form.placa} onChange={e=>setForm({...form,placa:e.target.value.toUpperCase()})}/>
                </label>

                <label className="text-xs font-medium text-[#666]">Modelo do veículo *
                  <input required className={`${campoClaro} mt-1`} placeholder="Ex: CRETA, PULSE" value={form.modelo_veiculo} onChange={e=>setForm({...form,modelo_veiculo:e.target.value})}/>
                </label>

                <label className="text-xs font-medium text-[#666]">Ordem de Serviço (OS) *
                  <input required className={`${campoClaro} mt-1`} placeholder="Nº da OS" value={form.ordem_servico} onChange={e=>setForm({...form,ordem_servico:e.target.value})}/>
                </label>

                <button disabled={salvando} className="md:col-span-2 bg-[#d9a441] hover:bg-[#c39133] text-black font-bold rounded-xl py-3 transition mt-2">
                  {salvando?'A guardar...':'Registar Venda'}
                </button>
              </form>
            </Caixa>
          )}

          {pagina !== 'Dashboard' && pagina !== 'Nova Venda' && (
            <Caixa titulo={`Módulo: ${pagina}`}>
              <p className="text-sm text-[#8a8a86]">Ambiente de desenvolvimento da V2.</p>
            </Caixa>
          )}
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);

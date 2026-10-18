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
  const [email,setEmail]=useState(''); const [senha,setSenha]=useState(''); const [mostrar,setMostrar]=useState(false);
  return <div className="min-h-screen bg-[#111] flex items-center justify-center p-5 text-white"><form onSubmit={e=>{e.preventDefault();entrar(email,senha);}} className="bg-[#202020] border border-[#393939] rounded-3xl p-9 w-full max-w-md shadow-2xl"><div className="flex justify-center mb-5"><Logo/></div><h1 className="text-3xl font-bold text-center">Bem-vindo à LACC</h1><p className="text-[#aaa] mt-2 mb-7 text-center">Monitor de Vendas · V2</p><label className="block text-sm mb-2">E-mail</label><input className={campo} type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/><label className="block text-sm mt-5 mb-2">Senha</label><div className="relative"><input className={campo} type={mostrar?'text':'password'} autoComplete="current-password" required value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Sua senha"/><button type="button" className="absolute right-4 top-3 text-[#aaa]" aria-label="Mostrar senha" onClick={()=>setMostrar(!mostrar)}>{mostrar?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>{erro&&<p role="alert" className="text-red-300 text-sm mt-4">{erro}</p>}<button disabled={carregando} className="bg-[#d9a441] hover:bg-[#f2bd57] text-black font-bold rounded-xl py-4 w-full mt-7 disabled:opacity-50">{carregando?'Entrando...':'Entrar no LACC V2'}</button><p className="text-[#888] text-xs mt-5 text-center">Acesso protegido pelo Supabase Auth</p></form></div>;
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
  const [tentativaPerfil,setTentativaPerfil]=useState(0);
  const usuarioAtualRef=useRef(null);
  useEffect(()=>{
    if(!supabase){setIniciando(false);return;}
    let ativo=true;
    // Renovar o token não deve apagar o perfil e bloquear a interface.
    const {data:{subscription}}=supabase.auth.onAuthStateChange((evento,novaSessao)=>{
      if(!ativo)return;
      const novoId=novaSessao?.user?.id||null;
      if(usuarioAtualRef.current!==novoId){
        usuarioAtualRef.current=novoId;
        setPerfil(null);
        setErroDados('');
      }
      setSessao(novaSessao);
      setIniciando(false);
    });
    supabase.auth.getSession()
      .then(({data,error})=>{
        if(!ativo)return;
        if(error)setErroLogin(error.message);
        if(usuarioAtualRef.current===null && data?.session?.user?.id){
          usuarioAtualRef.current=data.session.user.id;
          setSessao(data.session);
        }
      })
      .catch(error=>{if(ativo)setErroLogin(`Falha ao verificar sessão: ${error.message}`);})
      .finally(()=>{if(ativo)setIniciando(false);});
    return ()=>{ativo=false;subscription.unsubscribe();};
  },[]);
  useEffect(()=>{
    if(!sessao?.user?.id){setPerfil(null);return;}
    let ativo=true;
    setErroDados('');
    const timer=setTimeout(()=>{
      if(ativo)setErroDados('A validação está demorando. Verifique sua conexão e clique em Tentar novamente.');
    },12000);
    (async()=>{
      try{
        const {data,error}=await supabase.from('usuarios').select('id,nome,cargo,status').eq('id',sessao.user.id).maybeSingle();
        if(!ativo)return;
        if(error){setErroDados(`Perfil: ${error.message}`);return;}
        if(!data||data.status!=='ATIVO'){setErroDados('Seu usuário não possui perfil ativo. Solicite liberação ao administrador.');return;}
        setPerfil(data);
        setErroDados('');
      }catch(error){if(ativo)setErroDados(`Não foi possível validar seu perfil: ${error.message}`);}
      finally{clearTimeout(timer);}
    })();
    return ()=>{ativo=false;clearTimeout(timer);};
  },[sessao?.user?.id,tentativaPerfil]);
  async function entrar(email,senha){
    if(!supabase)return;
    setCarregandoLogin(true);setErroLogin('');
    const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password:senha});
    if(error)setErroLogin('Não foi possível entrar. Confira e-mail, senha e confirmação da conta.');
    setCarregandoLogin(false);
  }
  async function sair(){await supabase.auth.signOut();setPagina('Dashboard');setUnidades([]);setProdutos([]);setMetas([]);setVendas([]);}
  async function carregar(){
    if(!perfil||!dataInicial||!dataFinal||dataInicial>dataFinal)return;
    setCarregando(true);setErroDados('');
    // Consultas protegidas pelas políticas RLS do Supabase.
    const [ru,rp,rm,rv,rbi,rh,rhd,rusr,rfc,rsaldo]=await Promise.all([
      supabase.from('unidades').select('id,nome').order('nome'),
      supabase.from('produtos').select('id,nome,ativo').order('nome'),
      supabase.from('metas').select('id,unidade_id,data_inicio,data_fim,meta_1,meta_2,meta_3,meta_4').order('data_inicio',{ascending:false}).limit(1000),
      supabase.from('vendas').select('id,unidade_id,vendedor_id,produto_id,data_venda,tipo_venda,valor,percentual_comissao,valor_comissao,cliente_nome,placa,ordem_servico,modelo_veiculo').gte('data_venda',dataInicial).lte('data_venda',dataFinal).order('data_venda',{ascending:false}).limit(1000),
      periodo==='2026-10' ? supabase.from('bi_gerencial_v2_com_saldos').select('*') : Promise.resolve({data:null,error:null}),
      dataInicial<='2026-09-30'&&dataFinal>='2026-09-01' ? supabase.from('bi_historico_mensal').select('competencia,unidade_id,unidade,realizado,observacoes').eq('competencia',periodo) : Promise.resolve({data:null,error:null}),
      supabase.from('historico_vendas_detalhes').select('id_fonte,data_fonte,unidade_nome,produto,tipo,quantidade,valor_historico,placa,status_conferencia,conta_meta').eq('competencia',periodo).order('id_fonte').limit(1000),
      supabase.from('usuarios').select('id,nome,cargo,status').eq('status','ATIVO').limit(500),
      supabase.from('fechamentos').select('id,unidade_id,data_inicio,data_fim,status,valor_total,valor_interno,valor_externo,valor_ppf,quantidade_vendas,enviado_em,conferido_em,observacoes').lte('data_inicio',dataFinal).gte('data_fim',dataInicial).limit(1000),
      supabase.from('saldos_iniciais_bi').select('unidade_id,competencia,data_referencia,valor').eq('competencia',periodo).limit(200)
    ]);
    const falhas=[ru,rp,rm,rv,rbi,rh,rhd,rusr,rfc,rsaldo].filter(r=>r.error).map(r=>r.error.message);
    if(falhas.length)setErroDados([...new Set(falhas)].join(' | '));
    else {
      setUnidades(ru.data||[]);setProdutos(rp.data||[]);setMetas(rm.data||[]);setVendas(rv.data||[]);setBiGerencial(periodo==='2026-10'?(rbi.data||[]):null);setHistoricoMensal(dataInicial<='2026-09-30'&&dataFinal>='2026-09-01'?(rh.data||[]):null);setVendasHistoricas(rhd.data||[]);setUsuarios(rusr.data||[]);setFechamentos(rfc.data||[]);setSaldos(rsaldo.data||[]);
      setForm(f=>({...f,unidade_id:f.unidade_id||(ru.data?.[0]?.id||''),produto_id:f.produto_id||(rp.data?.find(p=>p.ativo)?.id||'')}));
      if((rv.data||[]).length===1000)setAviso('Há pelo menos 1.000 vendas neste período. A consulta está limitada; o total pode estar incompleto.');
    }
    setCarregando(false);
  }
  useEffect(()=>{if(perfil)carregar();},[perfil?.id,dataInicial,dataFinal]);
  const mapaUnidades=useMemo(()=>Object.fromEntries(unidades.map(u=>[u.id,u.nome])),[unidades]);
  const mapaProdutos=useMemo(()=>Object.fromEntries(produtos.map(p=>[p.id,p.nome])),[produtos]);
  const inicioPeriodo=`${periodo}-01`, fimPeriodo=ultimoDia(periodo);
  // Exibe metas cujo intervalo se sobrepõe ao mês selecionado.
  // Não soma metas sobrepostas para a mesma unidade: prioriza a de início mais recente.
  const metasAtivas=useMemo(()=>{
    const lista=metas.filter(m=>m.data_inicio<=fimPeriodo&&m.data_fim>=inicioPeriodo);
    const mapa=new Map();
    for(const m of lista){const anterior=mapa.get(m.unidade_id);if(!anterior||m.data_inicio>anterior.data_inicio)mapa.set(m.unidade_id,m);}
    return mapa;
  },[metas,periodo]);
  const desempenho=useMemo(()=>unidades.map(u=>{
    const meta=metasAtivas.get(u.id),realizado=vendas.filter(v=>v.unidade_id===u.id).reduce((s,v)=>s+Number(v.valor||0),0);
    const alvo=Number(meta?.meta_1||0);
    return {id:u.id,nome:u.nome,meta:alvo,realizado,falta:Math.max(0,alvo-realizado),percentual:alvo?realizado/alvo*100:0,temMeta:!!meta};
  }),[unidades,metasAtivas,vendas]);
  // O BI de outubro usa os saldos parciais consolidados, sem criar vendas fictícias.
  // Para outros meses, conserva o comportamento anterior de vendas detalhadas.
  const linhasBI=biGerencial && periodo==='2026-10' ? biGerencial : null;
  // Fechamentos históricos auditados: não são vendas detalhadas nem alteram outubro.
  const metasSetembro={'COMERCIAL O. GUARAPUAVA':17900,'FIAT/JEEP GUARAPUAVA':19800,'HYUNDAI GUARAPUAVA':15400,'MITSUBISHI SEVEN':15400,'PROVANCE PG':15400,'HYUNDAI PG':19000,'JEEP PG':19300,'NICENTER LONDRINA':18000,'FIAT LONDRINA':33000,'LOVAT MARINGA':19300};
  const historicoBI=periodo==='2026-09'&&historicoMensal?.length ? historicoMensal.map(x=>{const meta=metasSetembro[x.unidade]||0,realizado=Number(x.realizado||0);return {id:x.unidade_id,nome:x.unidade,meta,realizado,falta:Math.max(0,meta-realizado),percentual:meta?realizado/meta*100:0,temMeta:meta>0,status:realizado>=meta?'META ATINGIDA':'ENCERRADO',origem:'FECHAMENTO VALIDADO',necessario:null,dias:0,meta2:null,meta3:null,meta4:null};}) : null;
  const mesInteiro=dataInicial===`${periodo}-01`&&dataFinal===ultimoDia(periodo);
  const desempenhoBI=linhasBI&&mesInteiro ? linhasBI.map(x=>({
    id:x.unidade_id,nome:x.unidade,meta:Number(x.meta_1||0),
    realizado:Number(x.realizado_gerencial||0),falta:Number(x.falta_meta_1_gerencial||0),
    percentual:Number(x.atingimento_gerencial_pct||0),temMeta:x.meta_1!=null,
    necessario:x.necessario_por_dia_gerencial,dias:x.dias_uteis_restantes,
    status:x.status_gerencial,origem:x.origem_realizado,
    inicio:x.data_inicio,fim:x.data_fim,
    meta2:x.meta_2,meta3:x.meta_3,meta4:x.meta_4
  })) : ((mesInteiro?historicoBI:null) || desempenho);
  const normalizar=t=>String(t??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const busca=normalizar(filtroBusca.trim());
  const unidadeOk=nome=>!filtroUnidade||nome===filtroUnidade;
  const buscaOk=(...campos)=>!busca||campos.some(c=>normalizar(c).includes(busca));
  const desempenhoFiltrado=desempenhoBI.filter(x=>unidadeOk(x.nome)&&buscaOk(x.nome)&&(!filtroSituacao||x.status===filtroSituacao));
  const historicoFiltrado=(historicoMensal||[]).filter(h=>unidadeOk(h.unidade)&&buscaOk(h.unidade));
  // Datas históricas podem vir como AAAA-MM-DD, DD/MM/AAAA ou data/hora.
  // Datas ausentes/inválidas não são incluídas quando um intervalo está ativo.
  const dataISO=valor=>{const t=String(valor??'').trim();const iso=t.match(/^(\d{4})-(\d{2})-(\d{2})/);if(iso)return iso[0];const br=t.match(/^(\d{2})\/(\d{2})\/(\d{4})/);return br?`${br[3]}-${br[2]}-${br[1]}`:'';};
  const dataOk=valor=>{if(!dataInicial&&!dataFinal)return true;const d=dataISO(valor);return !!d&&(!dataInicial||d>=dataInicial)&&(!dataFinal||d<=dataFinal);};
  const intervaloAtivo=!!(dataInicial||dataFinal);
  const intervaloInvalido=!!(dataInicial&&dataFinal&&dataInicial>dataFinal);
  const detalhesFiltrados=vendasHistoricas.filter(v=>!intervaloInvalido&&dataOk(v.data_fonte)&&unidadeOk(v.unidade_nome)&&(!filtroTipo||v.tipo===filtroTipo)&&(!filtroProduto||v.produto===filtroProduto)&&(!filtroSituacao||v.status_conferencia===filtroSituacao)&&buscaOk(v.unidade_nome,v.produto,v.placa,v.data_fonte,v.id_fonte));
  const vendasFiltradas=vendas.filter(v=>!intervaloInvalido&&dataOk(v.data_venda)&&unidadeOk(mapaUnidades[v.unidade_id])&&(!filtroTipo||v.tipo_venda===filtroTipo)&&(!filtroProduto||mapaProdutos[v.produto_id]===filtroProduto)&&buscaOk(v.data_venda,mapaUnidades[v.unidade_id],mapaProdutos[v.produto_id],v.placa,v.cliente_nome));
  const produtosFiltrados=produtos.filter(p=>(!filtroProduto||p.nome===filtroProduto)&&buscaOk(p.nome)&&(!filtroSituacao||(filtroSituacao==='ATIVO'?p.ativo:filtroSituacao==='INATIVO'?!p.ativo:true)));
  const totalMeta=desempenhoFiltrado.reduce((s,x)=>s+x.meta,0),totalVendas=desempenhoFiltrado.reduce((s,x)=>s+x.realizado,0);
  const corStatus=st=>st==='META ATINGIDA'||st==='TRANQUILO'?'text-green-300':st==='ATENÇÃO'?'text-yellow-300':st==='URGENTE'?'text-red-300':'text-[#aaa]';
  const evolucao=useMemo(()=>{const porDia={};vendasFiltradas.forEach(v=>porDia[v.data_venda]=(porDia[v.data_venda]||0)+Number(v.valor||0));let acum=0;return Object.entries(porDia).sort(([a],[b])=>a.localeCompare(b)).map(([data,valor])=>({data,acumulado:(acum+=valor)}));},[vendasFiltradas]);
  const rankingBI=useMemo(()=>desempenhoFiltrado.filter(x=>x.temMeta&&x.meta>0).sort((a,b)=>b.percentual-a.percentual),[desempenhoFiltrado]);
  const comparativoBI=useMemo(()=>desempenhoFiltrado.filter(x=>x.temMeta&&x.meta>0).map(x=>({nome:x.nome.replace(' GUARAPUAVA',' GUA.').replace(' LONDRINA',' LON.').replace(' MARINGA',' MAR.'),meta:x.meta,realizado:x.realizado})),[desempenhoFiltrado]);
  const corBarra=valor=>valor>=100?'#4ade80':valor>=50?'#facc15':'#f87171';
  const resumoProdutos=useMemo(()=>{const mapa=new Map();for(const v of vendasFiltradas){const nome=mapaProdutos[v.produto_id]||'Produto não identificado';const x=mapa.get(nome)||{nome,quantidade:0,total:0};x.quantidade+=1;x.total+=Number(v.valor||0);mapa.set(nome,x);}for(const v of detalhesFiltrados){const nome=v.produto||'Produto não identificado';const x=mapa.get(nome)||{nome,quantidade:0,total:0};x.quantidade+=Number(v.quantidade??1);x.total+=Number(v.valor_historico||0);mapa.set(nome,x);}return [...mapa.values()].filter(x=>x.quantidade||x.total).sort((a,b)=>b.total-a.total);},[vendasFiltradas,detalhesFiltrados,produtos]);
  // Ranking: somente vendas reais com vendedor identificado; histórico sem vendedor não participa.
  const rankingVendedores=useMemo(()=>{
    const mapa=new Map(usuarios.map(u=>[u.id,{id:u.id,nome:u.nome,cargo:u.cargo,quantidade:0,total:0,comissao:0,unidades:new Set()}]));
    for(const v of vendasFiltradas){const u=mapa.get(v.vendedor_id);if(!u)continue;u.quantidade++;u.total+=Number(v.valor||0);u.comissao+=Number(v.valor_comissao||0);u.unidades.add(mapaUnidades[v.unidade_id]||'—');}
    return [...mapa.values()].filter(u=>u.quantidade>0).sort((a,b)=>b.total-a.total);
  },[usuarios,vendasFiltradas,unidades]);
  // Central: fechamentos efetivamente enviados e fechamento mensal histórico validado.
  const centralFechamentos=useMemo(()=>unidades.filter(u=>unidadeOk(u.nome)&&buscaOk(u.nome)).map(u=>{
    const docs=fechamentos.filter(f=>f.unidade_id===u.id).sort((a,b)=>(b.enviado_em||'').localeCompare(a.enviado_em||''));
    const validado=(historicoMensal||[]).find(h=>h.unidade_id===u.id);
    const ultimo=docs[0];
    return {nome:u.nome,ultimo,validado,status:ultimo?(ultimo.conferido_em?'CONFERIDO':ultimo.status||'ENVIADO'):validado?'HISTÓRICO VALIDADO':'SEM ENVIO REGISTRADO'};
  }),[unidades,fechamentos,historicoMensal,filtroUnidade,filtroBusca]);
  async function exportarFechamento(f,formato){
    const unidade=mapaUnidades[f.unidade_id];
    if(!unidade||f.status!=='CONFERIDO'){setAviso('Selecione um fechamento conferido para exportar.');return;}
    setAviso('Conferindo vendas individuais, placas e OS antes da exportação...');
    try{
      // Consultar o período exato, não somente o intervalo que está aberto no painel.
      const [rv,rh]=await Promise.all([
        supabase.from('vendas').select('id,unidade_id,produto_id,data_venda,tipo_venda,valor,cliente_nome,placa,ordem_servico,modelo_veiculo').eq('unidade_id',f.unidade_id).gte('data_venda',f.data_inicio).lte('data_venda',f.data_fim).limit(10000),
        supabase.from('historico_vendas_detalhes').select('id_fonte,data_fonte,unidade_nome,produto,tipo,quantidade,valor_historico,placa,ordem_servico,veiculo,status_conferencia').eq('unidade_nome',unidade).eq('competencia',f.data_fim.slice(0,7)).limit(10000)
      ]);
      if(rv.error||rh.error)throw new Error(rv.error?.message||rh.error?.message);
      if((rv.data||[]).length===10000||(rh.data||[]).length===10000)throw new Error('Muitos registros: a consulta atingiu o limite. Solicite exportação paginada.');
      const dados=prepararFechamento({fechamento:f,unidade,vendas:rv.data||[],produtos,historicos:rh.data||[]});
      if(formato==='xlsx')baixarFechamentoExcel(dados);
      else baixarFechamentoPDF(dados);
      setAviso(dados.incompletos||!dados.itens.length||Math.abs(dados.divergencia)>0.009 ? 'Prévia de '+unidade+' baixada. Atenção: faltam dados individuais ou há diferença de valores. Não enviar à concessionária até completar a conferência.' : 'Relatório individual de '+unidade+' gerado com '+dados.itens.length+' vendas conferidas.');
    }catch(error){setAviso('Não foi possível gerar o relatório: '+error.message);}
  }
  // Projeção indicativa baseada exclusivamente em saldos datados; não pressupõe atualizações diárias.
  const projecoes=useMemo(()=>desempenhoFiltrado.map(x=>{
    const m=metasAtivas.get(x.id);
    const saldo=saldos.find(a=>a.unidade_id===x.id);
    const inicio=x.inicio||m?.data_inicio,fim=x.fim||m?.data_fim;
    const referencia=saldo?.data_referencia;
    const diasTotal=diasUteisEntre(inicio,fim);
    const diasDecorridos=referencia?diasUteisEntre(inicio,referencia<fim?referencia:fim):0;
    const realizado=Number(x.realizado||0);
    const apto=!!(mesInteiro&&saldo&&inicio&&fim&&diasTotal>0&&diasDecorridos>0&&x.temMeta);
    const projecao=apto?realizado/diasDecorridos*diasTotal:null;
    return {...x,inicio,fim,referencia,diasTotal,diasDecorridos,projecao,diferenca:projecao===null?null:projecao-x.meta};
  }),[desempenhoFiltrado,saldos,metasAtivas,mesInteiro]);
  async function salvar(e){
    e.preventDefault();setAviso('');
    const valor=Number(form.valor);
    if(!form.unidade_id||!form.produto_id||!form.tipo_venda||!form.data_venda||!form.placa.trim()||!form.ordem_servico.trim()||!form.modelo_veiculo.trim()||!Number.isFinite(valor)||valor<=0){setAviso('Preencha todos os campos obrigatórios: unidade, produto, tipo, data, valor, placa, modelo e OS.');return;}
    setSalvando(true);
    const payload={unidade_id:form.unidade_id,produto_id:form.produto_id,vendedor_id:sessao.user.id,tipo_venda:form.tipo_venda,data_venda:form.data_venda,valor,cliente_nome:form.cliente_nome.trim()||null,placa:form.placa.trim().toUpperCase(),ordem_servico:form.ordem_servico.trim(),modelo_veiculo:form.modelo_veiculo.trim().toUpperCase()};
    const {error}=await supabase.from('vendas').insert(payload);
    setSalvando(false);
    if(error){setAviso(`Venda não salva: ${error.message}. Confira o vínculo com a unidade e as permissões RLS.`);return;}
    setForm(f=>({...f,valor:'',cliente_nome:'',placa:'',ordem_servico:'',modelo_veiculo:''}));
    setAviso('Venda salva no Supabase. A comissão foi calculada pelo banco.');
    setPagina('Vendas');
    if(form.data_venda>=dataInicial&&form.data_venda<=dataFinal)await carregar();
    else {setDataInicial(form.data_venda);setDataFinal(form.data_venda);}
  }
  if(!supabase)return <div className="min-h-screen bg-[#111] text-white flex items-center justify-center p-6"><div className="max-w-xl bg-[#222] rounded-2xl p-8 border border-[#555]"><h1 className="text-xl font-bold mb-4">LACC V2 · Configuração pendente</h1><p>Configure <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> nas variáveis de ambiente da Vercel e publique novamente.</p><p className="text-[#ba852c] mt-4">Não use a chave service_role.</p></div></div>;
  if(iniciando)return <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">Carregando LACC V2...</div>;
  if(!sessao)return <Login entrar={entrar} carregando={carregandoLogin} erro={erroLogin}/>;
  if(!perfil)return <div className="min-h-screen bg-[#111] text-white flex items-center justify-center p-6"><div className="max-w-md bg-[#222] rounded-2xl p-8"><h2 className="font-bold text-xl">Validando acesso</h2><p className="text-[#ccc] my-5">{erroDados||'Buscando seu perfil...'}</p><div className="flex flex-wrap gap-3"><button onClick={()=>{setErroDados('');setTentativaPerfil(n=>n+1);}} className="bg-[#d9a441] text-black font-bold rounded-xl px-5 py-3">Tentar novamente</button><button onClick={sair} className="bg-[#444] text-white font-bold rounded-xl px-5 py-3">Sair</button></div></div></div>;
  function navegar(p){setPagina(p);setAberto(false);setAviso('');}
  const card=(titulo,valor,tom='ouro')=>{const tons={ouro:{fundo:'from-[#fff9ed] to-[#fffdf8]',borda:'border-[#ebd6ae]',barra:'bg-[#c99a4a]',rotulo:'text-[#8c6a32]'},azul:{fundo:'from-[#f0f6fb] to-[#fcfdff]',borda:'border-[#cbdce9]',barra:'bg-[#658da9]',rotulo:'text-[#4b718d]'},verde:{fundo:'from-[#eef8f2] to-[#fbfefa]',borda:'border-[#c5dfce]',barra:'bg-[#5d9c78]',rotulo:'text-[#3e7b58]'},coral:{fundo:'from-[#fff4f0] to-[#fffcfa]',borda:'border-[#ecd1c6]',barra:'bg-[#c98572]',rotulo:'text-[#a76855]'}};const c=tons[tom];return <div data-kpi-tone={tom} className={`lacc-kpi relative overflow-hidden bg-gradient-to-br ${c.fundo} border ${c.borda} shadow-[0_8px_28px_rgba(45,39,29,0.045)] rounded-[20px] px-4 py-6 flex flex-col items-center justify-center text-center min-w-0`}><span aria-hidden="true" className={`absolute top-0 left-0 right-0 h-1 ${c.barra}`}/><p className={`${c.rotulo} text-[12px] font-semibold tracking-wide text-center w-full`}>{titulo}</p><p className="text-[clamp(1.2rem,2vw,1.7rem)] tracking-tight font-semibold text-[#282724] mt-3 text-center w-full break-words tabular-nums">{valor}</p></div>};
  return <><style>{estiloTema}</style><div className={`lacc-app min-h-screen bg-[#f7f7f5] text-[#292824] ${modoNoturno?'lacc-dark':''}`}>
    <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 lg:w-[68px] lg:hover:w-64 lg:focus-within:w-64 group/sidebar overflow-hidden bg-[#181818] border-r border-[#34312c] text-white p-3 lg:p-2 hover:lg:p-3 transition-all duration-200 lg:translate-x-0 ${aberto?'translate-x-0':'-translate-x-full'}`}><div className="flex gap-3 items-center mb-7 pb-5 border-b border-white/10"><div className="shrink-0 lg:scale-[0.75] lg:group-hover/sidebar:scale-100 lg:group-focus-within/sidebar:scale-100 origin-left transition-transform"><Logo compact/></div><div className="min-w-0 lg:hidden lg:group-hover/sidebar:block lg:group-focus-within/sidebar:block"><b className="block text-[23px] leading-none tracking-[0.06em] font-bold text-[#f5eee2]">LACC</b><p className="text-[#d7b77b] text-[10px] font-medium uppercase tracking-[0.08em] mt-2 leading-snug">Monitor de vendas</p></div></div><nav className="space-y-1">{nav.map(([nome,Icon])=><button key={nome} onClick={()=>navegar(nome)} title={nome} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm whitespace-nowrap ${pagina===nome?'bg-[#e3bb73] text-[#272018] font-semibold shadow-[0_4px_14px_rgba(205,154,69,0.15)]':'text-[#bcb8b1] hover:text-white hover:bg-white/10'}`}><Icon size={19} className="shrink-0"/><span className="lg:hidden lg:group-hover/sidebar:inline lg:group-focus-within/sidebar:inline">{nome}</span></button>)}</nav><button onClick={sair} title="Sair" className="absolute bottom-7 flex items-center gap-2 text-[#bcb8b1] hover:text-white whitespace-nowrap"><LogOut size={18} className="shrink-0"/><span className="lg:hidden lg:group-hover/sidebar:inline lg:group-focus-within/sidebar:inline">Sair</span></button></aside>
    {aberto&&<button aria-label="Fechar menu" className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={()=>setAberto(false)}/>}
    <div className="lg:ml-[68px]"><header className="bg-white/95 border-b border-[#ecebe8] px-6 py-5 flex flex-wrap gap-4 justify-between items-center"><div className="flex gap-3 items-center"><button onClick={()=>setAberto(true)} className="lg:hidden" aria-label="Abrir menu"><Menu/></button><div><h1 className="text-xl md:text-2xl font-bold">{pagina}</h1><p className="text-[#858580] text-xs">{perfil.nome} · {perfil.cargo}</p></div></div><div className="flex items-center gap-3 flex-wrap"><button type="button" role="switch" aria-checked={modoNoturno} aria-label="Modo noturno" title={modoNoturno?'Ativar modo claro':'Ativar modo noturno'} onClick={()=>setModoNoturno(v=>!v)} className="flex items-center gap-2 rounded-full border border-[#dedbd5] bg-[#f5f3ef] px-2 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#cfa25b]"><Sun size={16} className={modoNoturno?'text-[#888]':'text-[#b18a47]'}/><span className={`relative inline-flex w-10 h-6 items-center rounded-full transition-colors ${modoNoturno?'bg-[#b58a4c]':'bg-[#d6d2ca]'}`}><span className={`block rounded-full bg-white shadow-sm transition-transform ${modoNoturno?'translate-x-[19px]':'translate-x-[3px]'}`} style={{width:18,height:18}}/></span><Moon size={16} className={modoNoturno?'text-[#e6bd78]':'text-[#888]'}/><span className="hidden sm:inline">{modoNoturno?'Escuro':'Claro'}</span></button><button title="Atualizar dados" onClick={carregar} disabled={carregando} className="p-3 rounded-xl bg-[#f5f5f2]"><RefreshCw size={19} className={carregando?'animate-spin':''}/></button></div></header>
    <main className="p-5 md:p-8 space-y-6 max-w-[1480px] mx-auto">
      {pagina!=='Nova Venda'&&pagina!=='Administração'&&<section className="bg-white border border-[#e9e7e2] rounded-xl p-3"><div className="flex justify-between items-center gap-3"><button type="button" aria-expanded={filtrosAbertos} onClick={()=>setFiltrosAbertos(v=>!v)} className="flex items-center gap-2 font-semibold text-sm"><span>{filtrosAbertos?'▾':'▸'}</span> Filtros <span className="text-xs font-normal text-[#898985]">{dataInicial} até {dataFinal}</span></button><button className="text-sm text-[#99712e] font-semibold" onClick={()=>{setFiltroUnidade('');setFiltroBusca('');setFiltroTipo('');setFiltroProduto('');setFiltroSituacao('');setDataInicial(`${hoje().slice(0,7)}-01`);setDataFinal(ultimoDia(hoje().slice(0,7)));}}>Limpar filtros</button></div>{filtrosAbertos&&<div className="mt-3"><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2"><select aria-label="Filtrar unidade" className={campoClaro} value={filtroUnidade} onChange={e=>setFiltroUnidade(e.target.value)}><option value="">Todas as unidades</option>{unidades.map(u=><option key={u.id} value={u.nome}>{u.nome}</option>)}</select><input aria-label="Pesquisar" className={campoClaro} value={filtroBusca} onChange={e=>setFiltroBusca(e.target.value)} placeholder="Buscar unidade, placa, serviço"/><select aria-label="Filtrar tipo" className={campoClaro} value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)}><option value="">Todos os tipos</option>{[...new Set([...vendasHistoricas.map(v=>v.tipo),...vendas.map(v=>v.tipo_venda)].filter(Boolean))].sort().map(t=><option key={t}>{t}</option>)}</select><select aria-label="Filtrar produto" className={campoClaro} value={filtroProduto} onChange={e=>setFiltroProduto(e.target.value)}><option value="">Todos os produtos</option>{[...new Set([...produtos.map(p=>p.nome),...vendasHistoricas.map(v=>v.produto)].filter(Boolean))].sort().map(p=><option key={p}>{p}</option>)}</select><select aria-label="Filtrar situação" className={campoClaro} value={filtroSituacao} onChange={e=>setFiltroSituacao(e.target.value)}><option value="">Todas as situações</option>{['VALIDADO','PENDENTE','META ATINGIDA','TRANQUILO','ATENÇÃO','URGENTE','ENCERRADO','ATIVO','INATIVO'].map(t=><option key={t}>{t}</option>)}</select></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"><label className="text-xs text-[#858580]">Data inicial<input type="date" aria-label="Data inicial" className={`${campoClaro} mt-1`} value={dataInicial} onChange={e=>setDataInicial(e.target.value)}/></label><label className="text-xs text-[#858580]">Data final<input type="date" aria-label="Data final" className={`${campoClaro} mt-1`} min={dataInicial||undefined} value={dataFinal} onChange={e=>setDataFinal(e.target.value)}/></label></div>{intervaloInvalido&&<p role="alert" className="text-sm text-rose-600 mt-2">A data final deve ser igual ou posterior à inicial.</p>}</div>}</section>}
      {erroDados&&<div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-4 flex gap-2"><AlertCircle/>{erroDados}</div>}
      {aviso&&<div role="status" className="rounded-xl bg-[#fff8e9] text-[#806022] border border-[#ecd9b3] p-4">{aviso}</div>}
      {pagina==='Dashboard'&&<>
        <div className="flex justify-between flex-wrap gap-4 items-center"><div><h2 className="text-[29px] tracking-tight font-semibold text-[#292824]">Visão geral</h2></div><button onClick={()=>navegar('Nova Venda')} className="bg-[#e3b66c] hover:bg-[#e9c587] text-[#302719] font-semibold px-5 py-3 rounded-xl flex gap-2 items-center shadow-sm"><Plus size={18}/>Nova venda</button></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">{card('Meta total',brl(totalMeta),'ouro')}{card('Realizado gerencial',brl(totalVendas),'azul')}{card('Atingimento',totalMeta?percent(totalVendas/totalMeta*100):'—','verde')}{card('Falta para meta 1',brl(Math.max(totalMeta-totalVendas,0)),'coral')}</div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3"><Caixa titulo="Meta x realizado por unidade" extra={<span className="text-xs text-[#8a8a86]">Valores em R$</span>}>
            {comparativoBI.length?<div style={{height:Math.max(370,comparativoBI.length*45)}}><ResponsiveContainer width="100%" height="100%"><BarChart data={comparativoBI} layout="vertical" margin={{top:4,right:20,left:10,bottom:4}} barGap={7}><CartesianGrid stroke="#f0eee9" strokeDasharray="2 5" horizontal={false}/><XAxis type="number" stroke="#9a9a96" tickFormatter={v=>`${Math.round(v/1000)} mil`} fontSize={11}/><YAxis type="category" dataKey="nome" stroke="#777" width={185} fontSize={11} tick={{fill:"#696969"}}/><Tooltip formatter={(v,n)=>[brl(v),n==='meta'?'Meta':'Realizado']} contentStyle={{background:modoNoturno?'#25282e':'#fff',border:modoNoturno?'1px solid #454852':'1px solid #ecece8',borderRadius:12,color:modoNoturno?'#f1ede5':'#333'}}/><Legend formatter={n=>n==='meta'?'Meta':'Realizado'}/><Bar dataKey="meta" fill="#cbd7de" radius={[0,5,5,0]} maxBarSize={8}/><Bar dataKey="realizado" fill="#c99a4a" radius={[0,5,5,0]} maxBarSize={8}/></BarChart></ResponsiveContainer></div>:<p className="text-[#8a8a86]">Sem metas cadastradas para o período.</p>}
          </Caixa></div>
          <div className="xl:col-span-2"><Caixa titulo="Ranking de atingimento" extra={<span className="text-xs text-[#8a8a86]">% da meta 1</span>}>
            <div className="space-y-5">{rankingBI.length?rankingBI.map((x,i)=><div key={x.id||x.nome}><div className="flex justify-between gap-3 text-xs mb-2"><span className="text-[#424242] truncate"><b className="text-[#c5a36a] mr-2">{i+1}º</b>{x.nome}</span><b className="shrink-0">{percent(x.percentual)}</b></div><div className="h-2 rounded-full bg-[#eae8e4] overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${Math.max(0,Math.min(100,x.percentual))}%`,background:x.percentual>=100?"#5d9c78":x.percentual>=50?"#c99a4a":"#c98572"}}/></div></div>):<p className="text-[#8a8a86]">Sem metas cadastradas.</p>}</div>
          </Caixa></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3"><Caixa titulo="Evolução do faturamento" extra={<span className="text-xs text-[#8a8a86]">Vendas individuais por data</span>}>
            {evolucao.length?<div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={evolucao}><CartesianGrid stroke="#eeeeea" strokeDasharray="3 3"/><XAxis dataKey="data" stroke="#9a9a96" fontSize={11}/><YAxis stroke="#9a9a96" fontSize={11} tickFormatter={v=>`${Math.round(v/1000)} mil`}/><Tooltip formatter={v=>brl(v)} contentStyle={{background:modoNoturno?'#25282e':'#fff',border:modoNoturno?'1px solid #454852':'1px solid #ecece8',borderRadius:12,color:modoNoturno?'#f1ede5':'#333'}}/><Area dataKey="acumulado" name="Faturamento acumulado" type="monotone" stroke="#cfa25b" strokeWidth={2} fill="#ead3aa" fillOpacity={0.12}/></AreaChart></ResponsiveContainer></div>:<div className="min-h-52 flex items-center justify-center text-center text-[#8a8a86] px-5">Ainda não existem vendas individuais com data neste período. O saldo parcial já aparece nos outros gráficos, mas não permite reconstruir uma evolução diária confiável.</div>}
          </Caixa></div>
          <div className="xl:col-span-2"><Caixa titulo="Resumo da operação"><div className="space-y-5"><div className="flex justify-between border-b border-[#e9e9e7] pb-3"><span className="text-[#8a8a86]">Unidades com meta</span><b>{desempenhoFiltrado.filter(x=>x.temMeta).length}</b></div><div className="flex justify-between border-b border-[#e9e9e7] pb-3"><span className="text-[#8a8a86]">Meta atingida</span><b className="text-emerald-700">{desempenhoFiltrado.filter(x=>x.temMeta&&x.percentual>=100).length}</b></div><div className="flex justify-between border-b border-[#e9e9e7] pb-3"><span className="text-[#8a8a86]">Em atenção</span><b className="text-amber-700">{desempenhoFiltrado.filter(x=>x.status==='ATENÇÃO').length}</b></div><div className="flex justify-between border-b border-[#e9e9e7] pb-3"><span className="text-[#8a8a86]">Urgentes</span><b className="text-rose-700">{desempenhoFiltrado.filter(x=>x.status==='URGENTE').length}</b></div><div className="flex justify-between"><span className="text-[#8a8a86]">Sem meta</span><b>{desempenhoFiltrado.filter(x=>!x.temMeta).length}</b></div></div></Caixa></div>
        </div>
        <Caixa titulo="Desempenho por unidade"><Tabela cabecalho={['Unidade','Meta 1','Realizado','Atingimento','Falta','Dias úteis','Necessário/dia','Status']} linhas={desempenhoFiltrado.map(x=>[x.nome,x.temMeta?brl(x.meta):'Sem meta',brl(x.realizado),x.temMeta?percent(x.percentual):'—',x.temMeta?brl(x.falta):'—',x.dias??'—',x.necessario==null?'—':brl(x.necessario),<span className={`font-semibold ${x.status==='URGENTE'?'text-rose-600':x.status==='ATENÇÃO'?'text-amber-600':x.status==='TRANQUILO'?'text-emerald-600':'text-gray-500'}`}>{x.status||'—'}</span>])}/></Caixa>
        {linhasBI&&<><Caixa titulo="Metas adicionais e ciclos de fechamento"><Tabela cabecalho={['Unidade','Início','Fechamento','Meta 2','Meta 3','Meta 4','Origem do realizado']} linhas={desempenhoFiltrado.map(x=>[x.nome,x.inicio||'—',x.fim||'—',x.meta2==null?'—':brl(x.meta2),x.meta3==null?'—':brl(x.meta3),x.meta4==null?'—':brl(x.meta4),x.origem])}/></Caixa><p className="text-[#858580] text-xs">Saldos parciais informados em 16/10/2026. Os gráficos de meta, realizado e ranking usam o BI gerencial consolidado. A evolução diária usa somente vendas detalhadas, pois saldos parciais não contêm datas individuais. O BI usa o maior valor entre saldo parcial e vendas detalhadas do ciclo; para totais posteriores exatos, concilie os lançamentos. Dias úteis: segunda a sexta, sem feriados.</p></>}
      </>}
      {pagina==='Nova Venda'&&<Caixa titulo="Registrar venda real"><p className="text-[#8a8a86] text-sm mb-6">Campos com * são obrigatórios. Ao salvar, o registro será enviado ao Supabase. O vendedor será a conta conectada; a comissão é calculada no banco.</p><form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-2 gap-5"><label>Unidade<select required className={`${campoClaro} mt-2`} value={form.unidade_id} onChange={e=>setForm({...form,unidade_id:e.target.value})}><option value="">Selecione</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}</select></label><label>Produto<select required className={`${campoClaro} mt-2`} value={form.produto_id} onChange={e=>setForm({...form,produto_id:e.target.value})}><option value="">Selecione</option>{produtos.filter(p=>p.ativo).map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}</select></label><label>Tipo de venda<select className={`${campoClaro} mt-2`} value={form.tipo_venda} onChange={e=>setForm({...form,tipo_venda:e.target.value})}>{['INTERNA','EXTERNA','PPF'].map(t=><option key={t}>{t}</option>)}</select></label><label>Data<input required type="date" className={`${campoClaro} mt-2`} value={form.data_venda} onChange={e=>setForm({...form,data_venda:e.target.value})}/></label><label>Valor (R$)<input required min="0.01" step="0.01" type="number" className={`${campoClaro} mt-2`} value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})}/></label><div className="rounded-xl bg-[#fff9ec] p-4"><p className="text-[#666]">Comissão estimada ({form.tipo_venda==='EXTERNA'?'5':'2'}%)</p><b className="text-2xl">{brl((Number(form.valor)||0)*(form.tipo_venda==='EXTERNA'?0.05:0.02))}</b></div><label>Cliente (opcional)<input className={`${campoClaro} mt-2`} maxLength={150} value={form.cliente_nome} onChange={e=>setForm({...form,cliente_nome:e.target.value})}/></label><label>Placa *<input required className={`${campoClaro} mt-2`} maxLength={12} placeholder="ABC1D23" value={form.placa} onChange={e=>setForm({...form,placa:e.target.value.toUpperCase()})}/></label><label>Modelo do carro *<input required className={`${campoClaro} mt-2`} maxLength={120} placeholder="Ex.: CRETA, COMPASS, FASTBACK" value={form.modelo_veiculo} onChange={e=>setForm({...form,modelo_veiculo:e.target.value})}/></label><label>OS — Ordem de Serviço *<input required className={`${campoClaro} mt-2`} maxLength={80} placeholder="Número da OS" value={form.ordem_servico} onChange={e=>setForm({...form,ordem_servico:e.target.value})}/></label><button disabled={salvando} className="md:col-span-2 bg-[#e5b456] text-black font-bold rounded-xl py-3 disabled:opacity-50">{salvando?'Salvando...':'Salvar venda no Supabase'}</button></form></Caixa>}
      {pagina==='Vendas'&&<>{historicoMensal?.length>0&&<Caixa titulo="Fechamento validado por unidade — setembro/2026"><p className="text-sm text-[#858580] mb-4">Os valores abaixo são fechamentos mensais oficiais e não representam faturamento proporcional ao intervalo. Películas e PPF não entram na meta. O detalhamento histórico é separado e não gera comissões automaticamente.</p><Tabela cabecalho={['Unidade','Valor válido para a meta','Situação']} linhas={historicoFiltrado.map(h=>[h.unidade,brl(h.realizado),'VALIDADO'])}/></Caixa>}{vendasHistoricas.length>0&&<Caixa titulo={`Vendas históricas / produtos agrupados (${detalhesFiltrados.length} de ${vendasHistoricas.length})`}><p className="text-sm text-[#858580] mb-4">Registros históricos e agrupamentos por produto; outubro contém totais por produto, não OS/placas individuais. Não são somados novamente ao faturamento validado nem geram comissões.</p><Tabela cabecalho={['Data','Unidade','Produto','Tipo','Quantidade','Valor histórico','Situação']} linhas={detalhesFiltrados.map(v=>[v.data_fonte||'—',v.unidade_nome,v.produto||'—',v.tipo||'—',v.quantidade??1,brl(v.valor_historico),v.status_conferencia])}/></Caixa>}<Caixa titulo={`Vendas registradas no período (${vendasFiltradas.length})`}><Tabela cabecalho={['Data','Unidade','Produto','OS','Placa','Modelo','Tipo','Valor','Comissão']} linhas={vendasFiltradas.map(v=>[v.data_venda,mapaUnidades[v.unidade_id]||v.unidade_id,mapaProdutos[v.produto_id]||v.produto_id,v.ordem_servico||'—',v.placa||'—',v.modelo_veiculo||'—',v.tipo_venda,brl(v.valor),brl(v.valor_comissao)])}/></Caixa></>}
      {pagina==='Metas'&&<Caixa titulo="Metas do Supabase"><Tabela cabecalho={['Unidade','Início','Fim','Meta 1','Meta 2','Meta 3','Meta 4']} linhas={[...metasAtivas.values()].filter(m=>unidadeOk(mapaUnidades[m.unidade_id])&&buscaOk(mapaUnidades[m.unidade_id])).map(m=>[mapaUnidades[m.unidade_id]||m.unidade_id,m.data_inicio,m.data_fim,brl(m.meta_1),m.meta_2==null?'—':brl(m.meta_2),m.meta_3==null?'—':brl(m.meta_3),m.meta_4==null?'—':brl(m.meta_4)])}/></Caixa>}
      {pagina==='Produtos'&&<Caixa titulo={`Produtos cadastrados (${produtos.length})`}><Tabela cabecalho={['Produto','Situação']} linhas={produtosFiltrados.map(p=>[p.nome,p.ativo?'ATIVO':'INATIVO'])}/></Caixa>}
      {pagina==='Evolução do Mês'&&<Caixa titulo="Evolução de vendas no mês">{evolucao.length?<div className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={evolucao}><CartesianGrid stroke="#eeeeea" strokeDasharray="3 3"/><XAxis dataKey="data" stroke="#9a9a96"/><YAxis stroke="#9a9a96"/><Tooltip formatter={v=>brl(v)} contentStyle={{background:'#fff',border:'1px solid #ecece8'}}/><Area dataKey="acumulado" type="monotone" stroke="#dca443" fill="#e8b75b" fillOpacity={0.2}/></AreaChart></ResponsiveContainer></div>:<p className="text-[#8a8a86]">Sem vendas registradas no período.</p>}</Caixa>}
      {pagina==='BI Produtos'&&<Caixa titulo="BI de produtos"><p className="text-sm text-[#858580] mb-4">Inclui vendas individuais e produtos históricos agrupados do período. Valores históricos não são adicionados novamente ao saldo de faturamento ou às comissões.</p><Tabela cabecalho={['Produto','Quantidade','Faturamento']} linhas={resumoProdutos.map(p=>[p.nome,p.quantidade,brl(p.total)])}/></Caixa>}
      {pagina==='Ranking Vendedores'&&<><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">Ranking de vendedores</h2><span className="text-xs text-[#858580]">Vendas individuais confirmadas</span></div><Caixa titulo="Desempenho individual">{rankingVendedores.length?<Tabela cabecalho={['Posição','Vendedor','Unidade(s)','Vendas','Faturamento','Ticket médio','Comissão registrada']} linhas={rankingVendedores.map((v,i)=>[i<3?['🥇','🥈','🥉'][i]:i+1,v.nome,[...v.unidades].join(', '),v.quantidade,brl(v.total),brl(v.total/v.quantidade),brl(v.comissao)])}/>:<p className="text-sm text-[#858580]">Ainda não há vendas individuais confirmadas com vendedor identificado neste período. Os 748 lançamentos históricos de setembro estão em conferência e não entram no ranking.</p>}</Caixa></>}
      {pagina==='Central de Fechamentos'&&<><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">Central de fechamentos</h2><span className="text-xs text-[#858580]">Acompanhamento por unidade</span></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{card('Unidades acompanhadas',centralFechamentos.length,'ouro')}{card('Enviados no período',centralFechamentos.filter(x=>x.ultimo).length,'azul')}{card('Sem envio registrado',centralFechamentos.filter(x=>!x.ultimo&&!x.validado).length,'coral')}</div><Caixa titulo="Situação dos fechamentos"><Tabela cabecalho={['Unidade','Situação','Período registrado','Valor informado','Enviado em']} linhas={centralFechamentos.map(x=>[x.nome,x.status,x.ultimo?`${x.ultimo.data_inicio} a ${x.ultimo.data_fim}`:x.validado?'Setembro/2026':'—',x.ultimo?brl(x.ultimo.valor_total):x.validado?brl(x.validado.realizado):'—',x.ultimo?.enviado_em?new Date(x.ultimo.enviado_em).toLocaleString('pt-BR'):'—'])}/><p className="text-xs text-[#858580] mt-4">“Sem envio registrado” significa apenas que não há documento nesta base, não que a loja deixou de enviar por outros canais. Histórico validado é separado de fechamento operacional.</p></Caixa><Caixa titulo="Exportar fechamento para concessionária"><p className="text-sm text-[#858580] mb-4">Relatórios de conferência venda por venda: data, OS, placa, modelo, cliente (quando informado), serviço, tipo e valor. Se houver vendas sem OS, placa ou modelo, ou diferença nos valores, será baixada uma PRÉVIA identificada como incompleta, que não deve ser enviada à concessionária. O relatório definitivo exige detalhamento individual completo e valores conciliados.</p><div className="space-y-3">{fechamentos.filter(f=>f.status==='CONFERIDO'&&unidadeOk(mapaUnidades[f.unidade_id])&&buscaOk(mapaUnidades[f.unidade_id])).map(f=><div key={f.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-[#ecece8] rounded-xl p-4"><div><b>{mapaUnidades[f.unidade_id]||'Unidade'}</b><p className="text-sm text-[#858580]">{f.data_inicio} a {f.data_fim} · {brl(f.valor_total)} · CONFERIDO</p></div><div className="flex gap-2"><button type="button" onClick={()=>exportarFechamento(f,'xlsx')} className="px-4 py-2 rounded-lg bg-[#e5b456] text-black font-semibold">Baixar Excel</button><button type="button" onClick={()=>exportarFechamento(f,'pdf')} className="px-4 py-2 rounded-lg bg-[#282828] text-white font-semibold">Baixar PDF</button></div></div>)}{!fechamentos.some(f=>f.status==='CONFERIDO'&&unidadeOk(mapaUnidades[f.unidade_id]))&&<p className="text-sm text-[#858580]">Nenhum fechamento conferido neste período.</p>}</div></Caixa></>}
      {pagina==='Projeção de Fechamento'&&<><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">Projeção de fechamento</h2><span className="text-xs text-[#858580]">Estimativa pelo ritmo registrado</span></div><Caixa titulo="Projeção por unidade"><Tabela cabecalho={['Unidade','Meta','Realizado','Data da base','Dias úteis decorridos','Projeção estimada','Diferença para meta']} linhas={projecoes.map(x=>[x.nome,x.temMeta?brl(x.meta):'—',brl(x.realizado),x.referencia||'Sem saldo datado',x.projecao===null?'—':`${x.diasDecorridos} de ${x.diasTotal}`,x.projecao===null?'Sem dados suficientes':brl(x.projecao),x.diferenca===null?'—':<span className={x.diferenca>=0?'text-emerald-600 font-semibold':'text-rose-600 font-semibold'}>{x.diferenca>=0?'+':''}{brl(x.diferenca)}</span>])}/><p className="text-xs text-[#858580] mt-4">Projeção indicativa = realizado ÷ dias úteis decorridos até a data do saldo × dias úteis do ciclo. Não considera feriados, sazonalidade nem vendas futuras. Quando não há saldo datado ou o período é parcial, a estimativa fica indisponível. O resultado não altera metas nem faturamento oficial.</p></Caixa></>}
      {pagina==='Administração'&&<Caixa titulo="Conta e segurança"><div className="flex gap-3"><ShieldCheck className="text-[#ba852c] shrink-0"/><div><b>{perfil.nome} · {perfil.cargo}</b><p className="text-[#8a8a86] mt-3">Sessão autenticada pelo Supabase. As consultas e gravações respeitam as políticas RLS configuradas no banco.</p><p className="text-[#8a8a86] mt-3">Cadastro de vendedores, vinculação às unidades e gestão de fechamentos serão implementados na próxima etapa. Não utilize o SQL Editor para criar senhas ou usuários diretamente em auth.users.</p><p className="text-[#ba852c] mt-3">Monitor gerencial LACC V2.</p></div></div></Caixa>}
      
    </main></div>
  </div></>;
}
const root=document.getElementById('root');
if(!root)throw new Error('Elemento #root não encontrado no index.html');
createRoot(root).render(<App/>);

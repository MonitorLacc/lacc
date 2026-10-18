import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const dinheiro = n => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)||0);
const dataBR = d => /^\d{4}-\d{2}-\d{2}$/.test(d||'') ? d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4) : (d||'—');
const seguro = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,65);
const dataISO = s => {const t=String(s||'').trim();if(/^\d{4}-\d{2}-\d{2}/.test(t))return t.slice(0,10);const m=t.match(/^(\d{2})\/(\d{2})\/(\d{4})/);return m?m[3]+'-'+m[2]+'-'+m[1]:'';};
const arredondar = n => Math.round((Number(n)||0)*100)/100;

const grupoVenda = item => {const t=String(item.tipo||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');if(t.includes('PPF'))return 'PPF';if(t.includes('INTERNA'))return 'Internas';if(t.includes('EXTERNA'))return 'Externas';return 'Outros / Ajustes';};
const gruposVenda = ['Internas','Externas','PPF','Outros / Ajustes'];
const itensPorGrupo = (itens,grupo) => itens.filter(item=>grupoVenda(item)===grupo);

export function prepararFechamento({fechamento,unidade,vendas,produtos,historicos}){
  if(!fechamento||fechamento.status!=='CONFERIDO')throw new Error('Somente fechamentos conferidos podem ser exportados.');
  const inicio=fechamento.data_inicio, fim=fechamento.data_fim;
  const vendasUnidade=(vendas||[]).filter(v=>v.unidade_id===fechamento.unidade_id&&v.data_venda>=inicio&&v.data_venda<=fim);
  const historicosUnidade=(historicos||[]).filter(v=>v.unidade_nome===unidade);
  const nomes=Object.fromEntries((produtos||[]).map(p=>[p.id,p.nome]));
  const incompletos=[];
  const historicoPendente=inicio.startsWith('2026-09')?historicosUnidade.filter(v=>v.status_conferencia!=='CONFERIDO').length:0;
  const itens=[
    ...historicosUnidade.map(v=>({data:dataISO(v.data_fonte),produto:v.produto||'—',tipo:v.tipo||'—',quantidade:Number(v.quantidade??1),valor:arredondar(v.valor_historico),os:v.ordem_servico||'',placa:v.placa||'',modelo:v.veiculo||'',cliente:v.cliente_nome||'',origem:v.status_conferencia==='AGRUPADO'?'Resumo por produto':'Histórico'})),
    ...vendasUnidade.map(v=>({data:v.data_venda,produto:nomes[v.produto_id]||'—',tipo:v.tipo_venda||'—',quantidade:1,valor:arredondar(v.valor),os:v.ordem_servico||'',placa:v.placa||'',modelo:v.modelo_veiculo||'',cliente:v.cliente_nome||'',origem:'Venda individual'}))
  ];
  for(const item of itens){if(item.quantidade===0&&item.tipo==='AJUSTE')continue;if(item.quantidade!==1||(!String(item.tipo).toUpperCase().includes('INTERNA')&&!item.os.trim())||!item.placa.trim()||!item.modelo.trim()||!item.data||!item.produto||item.produto==='—')incompletos.push(item);}
  const agrupados=new Map();
  for(const item of itens){const chave=item.produto+'\u0000'+item.tipo;const anterior=agrupados.get(chave)||{produto:item.produto,tipo:item.tipo,quantidade:0,valor:0};anterior.quantidade+=item.quantidade;anterior.valor=arredondar(anterior.valor+item.valor);agrupados.set(chave,anterior);}
  const resumo=[...agrupados.values()].sort((a,b)=>a.produto.localeCompare(b.produto,'pt-BR'));
  const totalDetalhes=arredondar(itens.reduce((a,v)=>a+v.valor,0));
  const totalFechamento=arredondar(fechamento.valor_total);
  return {unidade,inicio,fim,quantidade:fechamento.quantidade_vendas,totalFechamento,totalDetalhes,divergencia:arredondar(totalFechamento-totalDetalhes),interno:arredondar(fechamento.valor_interno),externo:arredondar(fechamento.valor_externo),ppf:arredondar(fechamento.valor_ppf),observacoes:fechamento.observacoes||'',itens,resumo,incompletos:incompletos.length,historicoPendente};
}

export function baixarFechamentoExcel(d){
  const rascunho=!!(d.incompletos||d.historicoPendente||!d.itens.length||Math.abs(d.divergencia)>0.009);
  const wb=XLSX.utils.book_new();
  const linhasResumo=[
    [rascunho?'LACC | PRÉVIA DE CONFERÊNCIA — NÃO ENVIAR':'LACC | FECHAMENTO CONFERIDO'],
    ['Concessionária',d.unidade],
    ['Período',dataBR(d.inicio)+' a '+dataBR(d.fim)],
    ['Status',rascunho?'PRÉVIA INCOMPLETA — NÃO ENVIAR':'CONFERIDO'],
    ['Lançamentos sem OS/placa/modelo ou agrupados',d.incompletos],
    ['Lançamentos históricos pendentes de revisão',d.historicoPendente||0],
    ['Quantidade de vendas',d.quantidade],
    ['Internas (R$)',d.interno],
    ['Externas (R$)',d.externo],
    ['PPF (R$)',d.ppf],
    ['TOTAL OFICIAL (R$)',d.totalFechamento],
    ['Soma dos produtos disponíveis (R$)',d.totalDetalhes],
    ['Diferença a conciliar (R$)',d.divergencia],
    ['Observações',d.observacoes],
    [],
    ['Produto','Tipo','Quantidade','Valor (R$)'],
    ...d.resumo.map(x=>[x.produto,x.tipo,x.quantidade,x.valor])
  ];
  const ws=XLSX.utils.aoa_to_sheet(linhasResumo);
  ws['!cols']=[{wch:42},{wch:26},{wch:18},{wch:18}];
  for(const linha of [6,7,8,9,10]){const cel=ws['B'+(linha+1)];if(cel&&cel.t==='n')cel.z='#,##0.00';}
  for(let i=14;i<linhasResumo.length;i++){const cel=ws['D'+(i+1)];if(cel&&cel.t==='n')cel.z='#,##0.00';}
  XLSX.utils.book_append_sheet(wb,ws,'Resumo');
  const detalhes=[['Data','OS','Placa','Modelo','Cliente','Produto/Serviço','Tipo','Quantidade','Valor (R$)'],...d.itens.map(x=>[dataBR(x.data),x.os,x.placa,x.modelo,x.cliente,x.produto,x.tipo,x.quantidade,x.valor])];
  const wd=XLSX.utils.aoa_to_sheet(detalhes);wd['!cols']=[{wch:14},{wch:18},{wch:16},{wch:25},{wch:26},{wch:40},{wch:16},{wch:14},{wch:18}];
  for(let i=2;i<=detalhes.length;i++){const c=wd['I'+i];if(c&&c.t==='n')c.z='#,##0.00';}
  XLSX.utils.book_append_sheet(wb,wd,'Detalhamento');
  for(const grupo of gruposVenda){
    const itens=itensPorGrupo(d.itens,grupo);
    if(!itens.length)continue;
    const linhas=[['Data','OS','Placa','Modelo','Cliente','Produto/Serviço','Tipo','Quantidade','Valor (R$)'],...itens.map(x=>[dataBR(x.data),x.os,x.placa,x.modelo,x.cliente,x.produto,x.tipo,x.quantidade,x.valor])];
    linhas.push(['','','','','','TOTAL '+grupo,'',itens.reduce((n,x)=>n+Number(x.quantidade||0),0),arredondar(itens.reduce((n,x)=>n+Number(x.valor||0),0))]);
    const aba=XLSX.utils.aoa_to_sheet(linhas);
    aba['!cols']=[{wch:14},{wch:18},{wch:16},{wch:25},{wch:26},{wch:40},{wch:16},{wch:14},{wch:18}];
    for(let i=2;i<=linhas.length;i++){const c=aba['I'+i];if(c&&c.t==='n')c.z='#,##0.00';}
    XLSX.utils.book_append_sheet(wb,aba,grupo==='Outros / Ajustes'?'Outros e Ajustes':grupo);
  }
  XLSX.writeFile(wb,'LACC_'+(rascunho?'PREVIA_':'FECHAMENTO_')+seguro(d.unidade)+'_'+d.fim+'.xlsx');
}

export function baixarFechamentoPDF(d){
  const rascunho=!!(d.incompletos||d.historicoPendente||!d.itens.length||Math.abs(d.divergencia)>0.009);
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  doc.setFillColor(32,32,32);doc.rect(0,0,297,29,'F');
  doc.setTextColor(230,179,79);doc.setFont('helvetica','bold');doc.setFontSize(17);doc.text(rascunho?'LACC | PRÉVIA — NÃO ENVIAR':'LACC | FECHAMENTO CONFERIDO',14,14);
  doc.setTextColor(255,255,255);doc.setFontSize(10);doc.text(d.unidade,14,22);
  doc.setTextColor(45,45,45);doc.setFontSize(10);
  doc.text('Período: '+dataBR(d.inicio)+' a '+dataBR(d.fim),14,38);
  doc.text('Quantidade: '+d.quantidade+' serviços',110,38);
  doc.setFont('helvetica','bold');doc.text('TOTAL OFICIAL: '+dinheiro(d.totalFechamento),193,38);
  doc.setFont('helvetica','normal');
  doc.text('Internas: '+dinheiro(d.interno)+'   |   Externas: '+dinheiro(d.externo)+'   |   PPF: '+dinheiro(d.ppf),14,46);
  if(rascunho){doc.setTextColor(170,44,32);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('PRÉVIA: '+d.incompletos+' registros incompletos; '+(d.historicoPendente||0)+' históricos pendentes. Não enviar.',14,52);doc.setTextColor(45,45,45);doc.setFont('helvetica','normal');}
  let proximoY=rascunho?58:53;
  for(const grupo of gruposVenda){
    const itens=itensPorGrupo(d.itens,grupo);
    if(!itens.length)continue;
    if(proximoY>160){doc.addPage();proximoY=20;}
    doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text(grupo.toUpperCase()+'  |  '+itens.length+' lançamentos  |  '+dinheiro(itens.reduce((n,x)=>n+Number(x.valor||0),0)),14,proximoY);
    autoTable(doc,{startY:proximoY+4,head:[['Data','OS','Placa','Modelo','Cliente','Produto / Serviço','Tipo','Valor']],body:itens.map(x=>[dataBR(x.data),x.os,x.placa,x.modelo,x.cliente||'—',x.produto,x.tipo,dinheiro(x.valor)]),theme:'grid',headStyles:{fillColor:[42,42,42],textColor:[255,255,255]},styles:{fontSize:7,cellPadding:2,overflow:'linebreak'},margin:{left:10,right:10},columnStyles:{0:{cellWidth:21},1:{cellWidth:20},2:{cellWidth:21},3:{cellWidth:32},4:{cellWidth:35},5:{cellWidth:66},6:{cellWidth:25},7:{cellWidth:30,halign:'right'}}});
    proximoY=doc.lastAutoTable.finalY+10;
  }
  let y=proximoY;
  if(y>180){doc.addPage();y=20;}
  doc.setFontSize(9);
  doc.text('TOTAL DAS VENDAS DETALHADAS: '+dinheiro(d.totalDetalhes),14,y);
  if(Math.abs(d.divergencia)>0.009){doc.setTextColor(145,63,24);doc.text('Diferença em relação ao fechamento: '+dinheiro(d.divergencia),115,y);doc.setTextColor(45,45,45);}
  if(d.observacoes){const obs=doc.splitTextToSize('Observações: '+d.observacoes,268);doc.text(obs,14,y+7);}
  const paginas=doc.getNumberOfPages();for(let p=1;p<=paginas;p++){doc.setPage(p);doc.setFontSize(8);doc.setTextColor(115,115,115);doc.text('LACC V2 | Conferência de vendas individuais | Página '+p+' de '+paginas,14,195);}
  doc.save('LACC_'+(rascunho?'PREVIA_':'FECHAMENTO_')+seguro(d.unidade)+'_'+d.fim+'.pdf');
}

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
  'COMERCIAL O. GUARAPUAVA', 'FIAT/JEEP GUARAPUAVA', 'HYUNDAI GUARAPUAVA',
  'MITSUBISHI SEVEN', 'PROVANCE PG', 'HYUNDAI PG', 'JEEP PG',
  'NICENTER LONDRINA', 'FIAT LONDRINA', 'LOVAT MARINGA', 'PSA', 'IATA'
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

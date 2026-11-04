import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { 
  TrendingUp, 
  PlusCircle, 
  ShoppingBag, 
  Package, 
  CheckCircle, 
  Settings,
  BarChart2,
  Target,
  PieChart,
  Lock,
  LogOut
} from 'lucide-react';

const API_PRODUTOS_URL = "https://script.google.com/macros/s/AKfycbyWJYG3tUNFRmC97A-oQXeBpnV3EYpLbt6DUn4zzh0vEfKw2tnYMZknsk9_6TVJ2xSoKg/exec";

// Lojas Oficiais da aba CONFIG_LOJAS_VENDAS
const LOJAS_OFICIAIS = [
  "COMERCIAL O. GUARAPUAVA",
  "FIAT/JEEP GUARAPUAVA",
  "HYUNDAI GUARAPUAVA",
  "MITSUBICHI SEVEN",
  "PROVANCE PG",
  "HYUNDAI PG",
  "JEEP PG",
  "NICENTER LONDRINA",
  "FIAT LONDRINA",
  "LOVAT MARINGA",
  "PSA",
  "IATA"
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ usuario: '', senha: '' });
  const [activeTab, setActiveTab] = useState('nova-venda');

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    loja: '',
    marca: '',
    tipoVenda: '',
    produto: '',
    quantidade: 1,
    valorUnitario: '',
    consultor: '',
    veiculo: '',
    placaChassi: '',
    ordemServico: '',
    observacoes: ''
  });

  const [produtosLista, setProdutosLista] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [erroProdutos, setErroProdutos] = useState(null);
  const [vendasSessao, setVendasSessao] = useState([]);
  const [sucessoMsg, setSucessoMsg] = useState(false);

  useEffect(() => {
    fetch(API_PRODUTOS_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProdutosLista(data);
        } else if (data.error) {
          setErroProdutos(data.error);
        } else {
          setProdutosLista([]);
        }
        setCarregandoProdutos(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar produtos:", err);
        setErroProdutos("Não foi possível carregar a lista oficial de produtos.");
        setCarregandoProdutos(false);
      });
  }, []);

  const totalCalculado = (Number(formData.quantidade) || 0) * (Number(formData.valorUnitario) || 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLimpar = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      loja: '',
      marca: '',
      tipoVenda: '',
      produto: '',
      quantidade: 1,
      valorUnitario: '',
      consultor: '',
      veiculo: '',
      placaChassi: '',
      ordemServico: '',
      observacoes: ''
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.loja || !formData.produto || !formData.valorUnitario || !formData.consultor) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    const novaVenda = {
      ...formData,
      id: Date.now(),
      total: totalCalculado
    };

    setVendasSessao([novaVenda, ...vendasSessao]);
    setSucessoMsg(true);
    handleLimpar();

    setTimeout(() => {
      setSucessoMsg(false);
    }, 4000);
  };

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans text-neutral-100">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <img src="/lacc-logo.jpg" alt="Logo LACC" className="h-20 w-20 rounded-full mx-auto object-cover border-2 border-amber-500/50 shadow-lg" />
            <h1 className="text-2xl font-bold tracking-tight text-amber-400">MONITOR LACC</h1>
            <p className="text-xs text-neutral-400">Acesse o painel de demonstração da V2</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Usuário</label>
              <input 
                type="text" 
                placeholder="admin" 
                value={loginForm.usuario}
                onChange={(e) => setLoginForm({ ...loginForm, usuario: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Senha</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={loginForm.senha}
                onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2"
            >
              <Lock size={16} /> Entrar no Monitor
            </button>
          </form>

          <p className="text-center text-[11px] text-neutral-500">
            Ambiente de Testes — Qualquer usuário/senha acessa a demonstração.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex">
      {/* Sidebar Completa */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-neutral-800">
            <img src="/lacc-logo.jpg" alt="Logo LACC" className="h-10 w-10 rounded-full object-cover border border-amber-500/40" />
            <div>
              <h1 className="font-bold text-amber-400 text-lg leading-none">MONITOR LACC</h1>
              <span className="text-xs text-neutral-400">Versão V2</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
            >
              <TrendingUp size={18} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('nova-venda')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'nova-venda' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
            >
              <PlusCircle size={18} /> Nova Venda
            </button>
            <button 
              onClick={() => setActiveTab('evolucao')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'evolucao' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
            >
              <BarChart2 size={18} /> Evolução do Mês
            </button>
            <button 
              onClick={() => setActiveTab('vendas')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'vendas' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
            >
              <ShoppingBag size={18} /> Vendas
            </button>
            <button 
              onClick={() => setActiveTab('metas')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'metas' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
            >
              <Target size={18} /> Metas
            </button>
            <button 
              onClick={() => setActiveTab('produtos')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'produtos' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
            >
              <Package size={18} /> Produtos
            </button>
            <button 
              onClick={() => setActiveTab('bi-produtos')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'bi-produtos' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
            >
              <PieChart size={18} /> BI Produtos
            </button>
            <button 
              onClick={() => setActiveTab('administracao')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'administracao' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
            >
              <Settings size={18} /> Administração
            </button>
          </nav>
        </div>

        <div className="border-t border-neutral-800 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2 text-xs text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Conectado ao Vercel
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut size={14} /> Sair da Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'nova-venda' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="text-amber-400" /> Registrar Nova Venda
              </h2>
              <p className="text-neutral-400 text-sm mt-1">
                Preencha os dados abaixo para lançar uma venda no sistema de demonstração da V2.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
              <span className="font-bold uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">Aviso</span>
              <span>
                Esta é uma versão de testes (V2). Os lançamentos efetuados nesta página ficam salvos temporariamente na sessão local do seu navegador e não alteram a planilha oficial da V1.
              </span>
            </div>

            {sucessoMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle size={20} />
                <span>Venda registrada com sucesso na demonstração!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
              {/* Seção 1: Informações Gerais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Data *</label>
                  <input 
                    type="date" 
                    name="data" 
                    value={formData.data} 
                    onChange={handleInputChange} 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Loja *</label>
                  <select 
                    name="loja" 
                    value={formData.loja} 
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">Selecione a loja</option>
                    {LOJAS_OFICIAIS.map((lojaNome, idx) => (
                      <option key={idx} value={lojaNome}>{lojaNome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Marca</label>
                  <input 
                    type="text" 
                    name="marca" 
                    value={formData.marca} 
                    onChange={handleInputChange} 
                    placeholder="Ex: Fiat / Jeep"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Tipo de Venda</label>
                  <select 
                    name="tipoVenda" 
                    value={formData.tipoVenda} 
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Externa">Externa</option>
                    <option value="Interna">Interna</option>
                    <option value="Balcão">Balcão</option>
                  </select>
                </div>
              </div>

              {/* Seção 2: Produto e Valores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-800 pt-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Produto ou Serviço *</label>
                  <select 
                    name="produto" 
                    value={formData.produto} 
                    onChange={handleInputChange}
                    disabled={carregandoProdutos}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                    required
                  >
                    <option value="">
                      {carregandoProdutos ? "Carregando cadastro oficial..." : "Selecione um produto ou serviço"}
                    </option>
                    {produtosLista.map((item, idx) => (
                      <option key={idx} value={item.nome || item.produto || item.id}>
                        {item.nome || item.produto || item.id}
                      </option>
                    ))}
                  </select>
                  {erroProdutos && <p className="text-xs text-rose-500 mt-1">{erroProdutos}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Quantidade *</label>
                  <input 
                    type="number" 
                    min="1"
                    name="quantidade" 
                    value={formData.quantidade} 
                    onChange={handleInputChange} 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Valor Unitário (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="valorUnitario" 
                    value={formData.valorUnitario} 
                    onChange={handleInputChange} 
                    placeholder="0,00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Seção 3: Atendimento e Veículo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-neutral-800 pt-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Consultor *</label>
                  <input 
                    type="text" 
                    name="consultor" 
                    value={formData.consultor} 
                    onChange={handleInputChange} 
                    placeholder="Nome do consultor"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Veículo</label>
                  <input 
                    type="text" 
                    name="veiculo" 
                    value={formData.veiculo} 
                    onChange={handleInputChange} 
                    placeholder="Ex: Pulse / Creta"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Placa / Chassi</label>
                  <input 
                    type="text" 
                    name="placaChassi" 
                    value={formData.placaChassi} 
                    onChange={handleInputChange} 
                    placeholder="ABC-1234"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Ordem de Serviço (OS)</label>
                  <input 
                    type="text" 
                    name="ordemServico" 
                    value={formData.ordemServico} 
                    onChange={handleInputChange} 
                    placeholder="Nº da OS"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Observações</label>
                <textarea 
                  name="observacoes" 
                  rows="2"
                  value={formData.observacoes} 
                  onChange={handleInputChange} 
                  placeholder="Anotações adicionais da venda..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                ></textarea>
              </div>

              {/* Totalizador */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-400">Total Previsto:</span>
                <span className="text-xl font-bold text-amber-400">
                  R$ {totalCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleLimpar}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-sm font-medium hover:bg-neutral-700 transition"
                >
                  Limpar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-amber-500 text-neutral-950 font-semibold text-sm hover:bg-amber-400 transition"
                >
                  Registrar Venda
                </button>
              </div>
            </form>

            {/* Tabela de Lançamentos da Sessão */}
            {vendasSessao.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Lançamentos da Sessão</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-neutral-300">
                    <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase border-b border-neutral-800">
                      <tr>
                        <th className="py-2.5 px-3">Data</th>
                        <th className="py-2.5 px-3">Loja</th>
                        <th className="py-2.5 px-3">Consultor</th>
                        <th className="py-2.5 px-3">Produto</th>
                        <th className="py-2.5 px-3">Veículo</th>
                        <th className="py-2.5 px-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {vendasSessao.map((v) => (
                        <tr key={v.id}>
                          <td className="py-2.5 px-3">{v.data}</td>
                          <td className="py-2.5 px-3">{v.loja}</td>
                          <td className="py-2.5 px-3">{v.consultor}</td>
                          <td className="py-2.5 px-3">{v.produto}</td>
                          <td className="py-2.5 px-3">{v.veiculo || '-'}</td>
                          <td className="py-2.5 px-3 text-amber-400 font-medium">
                            R$ {v.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab !== 'nova-venda' && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500 py-20">
            <Settings size={48} className="mb-2 stroke-1" />
            <p className="text-sm">Módulo "{activeTab.toUpperCase()}" em desenvolvimento na V2.</p>
          </div>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

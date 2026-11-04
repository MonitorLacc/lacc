import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importante para carregar os estilos do Tailwind
import { 
  TrendingUp, 
  PlusCircle, 
  ShoppingBag, 
  Package, 
  CheckCircle, 
  Settings 
} from 'lucide-react';

const API_PRODUTOS_URL = "https://script.google.com/macros/s/AKfycbyWJYG3tUNFRmC97A-oQXeBpnV3EYpLbt6DUn4zzh0vEfKw2tnYMZknsk9_6TVJ2xSoKg/exec";

function App() {
  const [activeTab, setActiveTab] = useState('nova-venda');

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    loja: '',
    consultor: '',
    produto: '',
    quantidade: 1,
    valorUnitario: ''
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
      consultor: '',
      produto: '',
      quantidade: 1,
      valorUnitario: ''
    });
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex">
      {/* Sidebar */}
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
              onClick={() => setActiveTab('vendas')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'vendas' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
            >
              <ShoppingBag size={18} /> Vendas
            </button>
            <button 
              onClick={() => setActiveTab('produtos')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'produtos' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
            >
              <Package size={18} /> Produtos
            </button>
          </nav>
        </div>

        <div className="border-t border-neutral-800 pt-4">
          <div className="flex items-center gap-3 px-2 text-xs text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Conectado ao Vercel
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'nova-venda' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="text-amber-400" /> Registrar Nova Venda
              </h2>
              <p className="text-neutral-400 text-sm mt-1">
                Preencha os dados abaixo para lançar uma venda no sistema de demonstração da V2.
              </p>
            </div>

            {sucessoMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle size={20} />
                <span>Venda registrada com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <option value="Loja Matriz">Loja Matriz</option>
                    <option value="Loja Filial 1">Loja Filial 1</option>
                    <option value="Loja Filial 2">Loja Filial 2</option>
                  </select>
                </div>

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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

                <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-400">Total Previsto:</span>
                <span className="text-xl font-bold text-amber-400">
                  R$ {totalCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

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
                        <th className="py-2.5 px-3">Qtd</th>
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
                          <td className="py-2.5 px-3">{v.quantidade}</td>
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
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <Settings size={48} className="mb-2 stroke-1" />
            <p>Módulo em desenvolvimento na V2.</p>
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

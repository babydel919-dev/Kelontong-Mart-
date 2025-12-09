import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ViewState, Product, Transaction, FinancialSummary, CartItem, TransactionType } from './types';
import { Layout, Store, ShoppingCart, BarChart3, Bot, Package, DollarSign } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { analyzeBusinessHealth, chatWithAccountant } from './services/geminiService';

// Dummy Data Initialization
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Beras Premium 5kg', category: 'Sembako', price: 65000, cost: 58000, stock: 20, unit: 'sak' },
  { id: '2', name: 'Minyak Goreng 1L', category: 'Sembako', price: 16000, cost: 14000, stock: 45, unit: 'btl' },
  { id: '3', name: 'Telur Ayam 1kg', category: 'Sembako', price: 28000, cost: 25000, stock: 15, unit: 'kg' },
  { id: '4', name: 'Gula Pasir 1kg', category: 'Sembako', price: 14500, cost: 12500, stock: 30, unit: 'bks' },
  { id: '5', name: 'Indomie Goreng', category: 'Makanan', price: 3500, cost: 2900, stock: 100, unit: 'bks' },
  { id: '6', name: 'Kopi Kapal Api', category: 'Minuman', price: 1500, cost: 1100, stock: 8, unit: 'sachet' }, // Low stock example
  { id: '7', name: 'Sabun Mandi Cair', category: 'Kebersihan', price: 22000, cost: 18000, stock: 12, unit: 'btl' },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [aiAnalysis, setAiAnalysis] = useState<string>('Analisis sedang diproses...');
  const [aiLoading, setAiLoading] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Financial Calculations
  const summary: FinancialSummary = useMemo(() => {
    const revenue = transactions
      .filter(t => t.type === TransactionType.SALE)
      .reduce((sum, t) => sum + t.total, 0);

    const cogs = transactions
      .filter(t => t.type === TransactionType.SALE)
      .reduce((sum, t) => {
        const cost = t.items?.reduce((c, i) => c + (i.cost * i.quantity), 0) || 0;
        return sum + cost;
      }, 0);

    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.total, 0);

    return {
      revenue,
      cogs,
      grossProfit: revenue - cogs,
      expenses,
      netProfit: revenue - cogs - expenses
    };
  }, [transactions]);

  // Actions
  const handleCheckout = (cart: CartItem[]) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: TransactionType.SALE,
      total,
      items: cart.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price, cost: i.cost }))
    };

    setTransactions(prev => [...prev, newTx]);
    
    // Decrease Stock
    setProducts(prev => prev.map(p => {
      const inCart = cart.find(c => c.id === p.id);
      if (inCart) {
        return { ...p, stock: p.stock - inCart.quantity };
      }
      return p;
    }));
  };

  const handleAddProduct = (p: Product) => setProducts(prev => [...prev, p]);
  const handleUpdateProduct = (p: Product) => setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod));
  const handleDeleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  // AI Integration
  const fetchAIAnalysis = useCallback(async () => {
    setAiLoading(true);
    const analysis = await analyzeBusinessHealth(products, transactions, summary);
    setAiAnalysis(analysis);
    setAiLoading(false);
  }, [products, transactions, summary]);

  // Auto-analyze on Dashboard open if empty
  useEffect(() => {
    if (view === 'DASHBOARD' && aiAnalysis === 'Analisis sedang diproses...') {
      fetchAIAnalysis();
    }
  }, [view, fetchAIAnalysis, aiAnalysis]);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleChat = async () => {
    if(!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    // Build context
    const context = `
      Summary: ${JSON.stringify(summary)}
      Top Products: ${JSON.stringify(products.slice(0,5))}
    `;
    const response = await chatWithAccountant(userMsg, context);
    
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setChatLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Store size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg">KelontongPro</h1>
            <p className="text-xs text-slate-400">ERP System</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setView('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'DASHBOARD' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Layout size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setView('POS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'POS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <ShoppingCart size={20} /> Kasir (POS)
          </button>
          <button 
            onClick={() => setView('INVENTORY')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'INVENTORY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Package size={20} /> Inventaris
          </button>
          <button 
            onClick={() => setView('FINANCE')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'FINANCE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <BarChart3 size={20} /> Laporan Keuangan
          </button>
          <button 
            onClick={() => setView('AI_ADVISOR')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'AI_ADVISOR' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Bot size={20} /> AI Akuntan
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <div className="bg-slate-800 p-3 rounded-lg text-xs text-slate-400">
              <p>User: Owner</p>
              <p>Role: Administrator</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-slate-200 p-4 md:hidden flex items-center justify-between">
             <div className="flex items-center gap-2 font-bold text-slate-800">
               <Store className="text-blue-600" /> KelontongPro
             </div>
             {/* Mobile Menu Toggle would go here, omitted for brevity of single-file constraint logic */}
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {view === 'DASHBOARD' && (
            <div className="space-y-6">
              <Dashboard summary={summary} transactions={transactions} products={products} />
              
              {/* Quick AI Insight */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-start gap-4">
                   <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                     <Bot size={32} />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-lg font-bold mb-2">Insight Profesor Akuntansi</h3>
                     <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed whitespace-pre-line">
                       {aiLoading ? (
                         <span className="animate-pulse">Sedang menganalisis neraca dan arus kas toko Anda...</span>
                       ) : aiAnalysis}
                     </div>
                     <button 
                       onClick={fetchAIAnalysis} 
                       className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                     >
                       Perbarui Analisis
                     </button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {view === 'POS' && (
            <POS products={products} onCheckout={handleCheckout} />
          )}

          {view === 'INVENTORY' && (
            <Inventory 
              products={products} 
              onAddProduct={handleAddProduct} 
              onUpdateProduct={handleUpdateProduct} 
              onDeleteProduct={handleDeleteProduct} 
            />
          )}
          
          {view === 'FINANCE' && (
            <div className="space-y-6">
               <h2 className="text-2xl font-bold text-slate-800">Laporan Keuangan Sederhana</h2>
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-4 bg-slate-50 border-b border-slate-100 font-medium text-slate-700">
                    Riwayat Transaksi
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                          <tr>
                             <th className="px-6 py-3">Tanggal</th>
                             <th className="px-6 py-3">Tipe</th>
                             <th className="px-6 py-3">Keterangan</th>
                             <th className="px-6 py-3 text-right">Nominal</th>
                          </tr>
                       </thead>
                       <tbody>
                          {transactions.slice().reverse().map(t => (
                             <tr key={t.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4">{new Date(t.date).toLocaleDateString('id-ID')} {new Date(t.date).toLocaleTimeString('id-ID')}</td>
                                <td className="px-6 py-4">
                                   <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'SALE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {t.type}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                   {t.items ? `${t.items.length} items (e.g. ${t.items[0].name}...)` : t.note || '-'}
                                </td>
                                <td className={`px-6 py-4 text-right font-medium ${t.type === 'SALE' ? 'text-green-600' : 'text-red-600'}`}>
                                   {t.type === 'SALE' ? '+' : '-'} Rp{t.total.toLocaleString('id-ID')}
                                </td>
                             </tr>
                          ))}
                          {transactions.length === 0 && (
                             <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Belum ada transaksi</td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
               </div>
            </div>
          )}

          {view === 'AI_ADVISOR' && (
             <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                   <h2 className="text-lg font-bold flex items-center gap-2">
                      <Bot className="text-blue-600"/> Tanya Akuntan Virtual
                   </h2>
                   <p className="text-xs text-slate-500">Tanyakan tentang profit, stok, atau strategi bisnis.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                   {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                            <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                         </div>
                      </div>
                   ))}
                   {chatLoading && (
                      <div className="flex justify-start">
                         <div className="bg-slate-200 text-slate-500 rounded-lg p-3 rounded-bl-none text-xs animate-pulse">
                            Sedang mengetik...
                         </div>
                      </div>
                   )}
                </div>
                <div className="p-4 bg-white border-t border-slate-200">
                   <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Bagaimana cara meningkatkan margin keuntungan?"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                      />
                      <button 
                        onClick={handleChat}
                        disabled={chatLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                         Kirim
                      </button>
                   </div>
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
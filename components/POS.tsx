import React, { useState, useMemo } from 'react';
import { Product, CartItem } from '../types';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';

interface POSProps {
  products: Product[];
  onCheckout: (cart: CartItem[]) => void;
}

export const POS: React.FC<POSProps> = ({ products, onCheckout }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (confirm(`Konfirmasi pembayaran sebesar Rp${totalAmount.toLocaleString('id-ID')}?`)) {
      onCheckout(cart);
      setCart([]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4">
      {/* Product Selection Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  categoryFilter === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`text-left p-4 rounded-lg border transition-all ${
                  product.stock <= 0 
                    ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' 
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="font-semibold text-slate-800 truncate">{product.name}</div>
                <div className="text-xs text-slate-500 mb-2">{product.category}</div>
                <div className="flex justify-between items-end">
                  <div className="font-bold text-blue-600">Rp{product.price.toLocaleString('id-ID')}</div>
                  <div className={`text-xs ${product.stock < 5 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                    Stok: {product.stock}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[50vh] lg:h-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart size={20} /> Keranjang Belanja
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-slate-400 mt-10">
              <p>Keranjang kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-start border-b border-slate-100 pb-2">
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="text-xs text-slate-500">
                    Rp{item.price.toLocaleString('id-ID')} x {item.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100"><Minus size={14} /></button>
                    <span className="px-2 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl space-y-4">
          <div className="flex justify-between text-lg font-bold text-slate-800">
            <span>Total</span>
            <span>Rp{totalAmount.toLocaleString('id-ID')}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-colors ${
              cart.length === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <CreditCard size={20} />
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
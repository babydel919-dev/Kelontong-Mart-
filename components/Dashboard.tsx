import React from 'react';
import { FinancialSummary, Product, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Wallet } from 'lucide-react';

interface DashboardProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  products: Product[];
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export const Dashboard: React.FC<DashboardProps> = ({ summary, transactions, products }) => {
  
  // Calculate daily sales for chart
  const salesData = transactions
    .filter(t => t.type === 'SALE')
    .slice(-7) // Last 7 transactions/days logic simplified for demo
    .map((t, index) => ({
      name: `Tx ${index + 1}`,
      amount: t.total
    }));

  const lowStockCount = products.filter(p => p.stock < 10).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Keuangan</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Pendapatan</p>
              <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.revenue)}</h3>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Laba Bersih</p>
              <h3 className="text-2xl font-bold text-indigo-600">{formatCurrency(summary.netProfit)}</h3>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Pengeluaran</p>
              <h3 className="text-2xl font-bold text-rose-600">{formatCurrency(summary.expenses)}</h3>
            </div>
            <div className="p-3 bg-rose-100 rounded-full text-rose-600">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Stok Menipis</p>
              <h3 className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {lowStockCount} Item
              </h3>
            </div>
            <div className={`p-3 rounded-full ${lowStockCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Tren Penjualan Terakhir</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Stok Produk Terendah</h3>
          <div className="h-64 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2 text-right">Sisa Stok</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .sort((a, b) => a.stock - b.stock)
                  .slice(0, 5)
                  .map(product => (
                    <tr key={product.id} className="border-b">
                      <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                      <td className={`px-4 py-3 text-right font-bold ${product.stock < 5 ? 'text-red-600' : 'text-slate-600'}`}>
                        {product.stock} {product.unit}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
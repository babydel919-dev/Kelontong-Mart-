import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Edit, Trash, Save, X, Package } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (product: Product) => {
    setIsEditing(product.id);
    setEditForm(product);
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditForm({});
    setIsAdding(false);
  };

  const saveEdit = () => {
    if (isEditing && editForm.name) {
      onUpdateProduct(editForm as Product);
      setIsEditing(null);
    }
  };

  const handleAdd = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: editForm.name || 'Produk Baru',
      category: editForm.category || 'Umum',
      price: Number(editForm.price) || 0,
      cost: Number(editForm.cost) || 0,
      stock: Number(editForm.stock) || 0,
      unit: editForm.unit || 'pcs'
    };
    onAddProduct(newProduct);
    setIsAdding(false);
    setEditForm({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'cost' ? Number(value) : value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Package className="text-blue-600" /> Manajemen Inventaris
        </h2>
        <button 
          onClick={() => { setIsAdding(true); setEditForm({}); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Nama Produk</th>
              <th className="px-6 py-3">Kategori</th>
              <th className="px-6 py-3 text-right">Harga Beli (HPP)</th>
              <th className="px-6 py-3 text-right">Harga Jual</th>
              <th className="px-6 py-3 text-right">Stok</th>
              <th className="px-6 py-3 text-center">Satuan</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
               <tr className="bg-blue-50">
               <td className="px-6 py-4"><input name="name" placeholder="Nama" className="w-full p-1 border rounded" onChange={handleChange} /></td>
               <td className="px-6 py-4"><input name="category" placeholder="Kategori" className="w-full p-1 border rounded" onChange={handleChange} /></td>
               <td className="px-6 py-4"><input name="cost" type="number" placeholder="HPP" className="w-full p-1 border rounded text-right" onChange={handleChange} /></td>
               <td className="px-6 py-4"><input name="price" type="number" placeholder="Harga" className="w-full p-1 border rounded text-right" onChange={handleChange} /></td>
               <td className="px-6 py-4"><input name="stock" type="number" placeholder="Stok" className="w-full p-1 border rounded text-right" onChange={handleChange} /></td>
               <td className="px-6 py-4"><input name="unit" placeholder="Satuan" className="w-full p-1 border rounded text-center" onChange={handleChange} /></td>
               <td className="px-6 py-4 text-center flex justify-center gap-2">
                 <button onClick={handleAdd} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                 <button onClick={cancelEdit} className="text-red-600 hover:text-red-800"><X size={18} /></button>
               </td>
             </tr>
            )}
            {products.map(product => (
              <tr key={product.id} className="border-b hover:bg-slate-50">
                {isEditing === product.id ? (
                  <>
                    <td className="px-6 py-4"><input name="name" value={editForm.name} className="w-full p-1 border rounded" onChange={handleChange} /></td>
                    <td className="px-6 py-4"><input name="category" value={editForm.category} className="w-full p-1 border rounded" onChange={handleChange} /></td>
                    <td className="px-6 py-4"><input name="cost" type="number" value={editForm.cost} className="w-full p-1 border rounded text-right" onChange={handleChange} /></td>
                    <td className="px-6 py-4"><input name="price" type="number" value={editForm.price} className="w-full p-1 border rounded text-right" onChange={handleChange} /></td>
                    <td className="px-6 py-4"><input name="stock" type="number" value={editForm.stock} className="w-full p-1 border rounded text-right" onChange={handleChange} /></td>
                    <td className="px-6 py-4"><input name="unit" value={editForm.unit} className="w-full p-1 border rounded text-center" onChange={handleChange} /></td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button onClick={saveEdit} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                      <button onClick={cancelEdit} className="text-red-600 hover:text-red-800"><X size={18} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-6 py-4 text-slate-500">{product.category}</td>
                    <td className="px-6 py-4 text-right text-slate-500">Rp{product.cost.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-right text-slate-800">Rp{product.price.toLocaleString('id-ID')}</td>
                    <td className={`px-6 py-4 text-right font-bold ${product.stock < 10 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">{product.unit}</td>
                    <td className="px-6 py-4 text-center flex justify-center gap-3">
                      <button onClick={() => startEdit(product)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                      <button onClick={() => onDeleteProduct(product.id)} className="text-red-400 hover:text-red-600"><Trash size={18} /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
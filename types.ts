export enum TransactionType {
  SALE = 'SALE',
  EXPENSE = 'EXPENSE',
  RESTOCK = 'RESTOCK'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // Harga Jual
  cost: number;  // Harga Pokok Penjualan (HPP)
  stock: number;
  unit: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  type: TransactionType;
  total: number;
  items?: { productId: string; name: string; quantity: number; price: number; cost: number }[];
  note?: string;
}

export interface FinancialSummary {
  revenue: number;
  cogs: number; // Cost of Goods Sold
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

export type ViewState = 'DASHBOARD' | 'POS' | 'INVENTORY' | 'FINANCE' | 'AI_ADVISOR';
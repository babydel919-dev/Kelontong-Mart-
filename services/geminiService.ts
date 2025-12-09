import { GoogleGenAI } from "@google/genai";
import { Product, Transaction, FinancialSummary } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBusinessHealth = async (
  products: Product[],
  transactions: Transaction[],
  summary: FinancialSummary
): Promise<string> => {
  try {
    // Prepare a summarized context to avoid token limits if data is huge
    const lowStockItems = products.filter(p => p.stock < 10).map(p => `${p.name} (${p.stock} ${p.unit})`);
    
    // Recent transactions (last 10)
    const recentTx = transactions.slice(0, 10).map(t => 
      `${t.date.split('T')[0]}: ${t.type} - Rp${t.total.toLocaleString('id-ID')}`
    ).join('\n');

    const prompt = `
      Bertindaklah sebagai Profesor Akuntansi Senior dan Konsultan Bisnis berpengalaman untuk Toko Kelontong.
      
      Berikut adalah data keuangan terkini toko kami:
      
      1. Rangkuman Keuangan:
         - Pendapatan (Omzet): Rp${summary.revenue.toLocaleString('id-ID')}
         - HPP (Cost of Goods Sold): Rp${summary.cogs.toLocaleString('id-ID')}
         - Laba Kotor: Rp${summary.grossProfit.toLocaleString('id-ID')}
         - Pengeluaran Operasional: Rp${summary.expenses.toLocaleString('id-ID')}
         - Laba Bersih: Rp${summary.netProfit.toLocaleString('id-ID')}
      
      2. Inventaris & Stok:
         - Total Produk: ${products.length} SKU
         - Stok Menipis (< 10 unit): ${lowStockItems.length > 0 ? lowStockItems.join(', ') : 'Tidak ada'}
      
      3. Transaksi Terakhir (Sampel):
      ${recentTx}

      Tugas Anda:
      Berikan analisis singkat, tajam, dan actionable (dapat ditindaklanjuti) mengenai kesehatan bisnis saya. 
      Fokus pada arus kas, efisiensi stok, dan profitabilitas. Gunakan bahasa Indonesia yang profesional namun mudah dipahami oleh pemilik toko.
      Jika ada stok menipis, beri peringatan keras. Jika margin tipis, beri saran pricing.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep reasoning for dashboard summary
      }
    });

    return response.text || "Maaf, tidak dapat menghasilkan analisis saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi asisten AI. Pastikan API Key valid.";
  }
};

export const chatWithAccountant = async (
  message: string,
  contextData: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Context Data Bisnis:
        ${contextData}

        User Question: ${message}

        System Instruction:
        Anda adalah asisten AI ERP untuk Toko Kelontong. Jawablah pertanyaan pengguna berdasarkan data konteks di atas.
        Jelaskan konsep akuntansi (seperti Laba Rugi, HPP, Margin) dengan sederhana jika ditanya.
        Berikan saran bisnis yang praktis.
      `
    });
    return response.text || "Tidak ada respons.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Maaf, sistem sedang sibuk.";
  }
};
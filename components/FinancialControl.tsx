import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClientData, FinancialTransaction } from '../types';
import { Wallet, TrendingUp, TrendingDown, DollarSign, PlusCircle, Trash2, Calendar, FileText, Tag } from 'lucide-react';
import { NeonInput, NeonSelect } from './ui/Input';

interface FinancialControlProps {
  clients?: ClientData[];
  transactions?: FinancialTransaction[];
  onAddTransaction?: (t: FinancialTransaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const FinancialControl: React.FC<FinancialControlProps> = ({ 
  clients = [], 
  transactions = [], 
  onAddTransaction,
  onDeleteTransaction
}) => {
  
  // State for new transaction form
  const [newTrans, setNewTrans] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers || '0', 10) / 100;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleTransChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      setNewTrans(prev => ({ ...prev, [name]: formatCurrencyInput(value) }));
    } else {
      setNewTrans(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrans.description || !newTrans.amount || !onAddTransaction) return;

    const transaction: FinancialTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: newTrans.description,
      amount: newTrans.amount,
      type: newTrans.type as 'income' | 'expense',
      date: newTrans.date,
      category: newTrans.category
    };

    onAddTransaction(transaction);
    // Reset minimal fields
    setNewTrans(prev => ({ ...prev, description: '', amount: '', category: '' }));
  };

  // Helper to parse "R$ 1.000,00" to 1000.00
  const parseCurrency = (value?: string) => {
    if (!value) return 0;
    return parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  };

  // --- Unified Totals Calculation (Clients + Transactions) ---
  const totals = useMemo(() => {
    let revenue = 0;
    let expenses = 0;

    // 1. From Clients (Projects)
    clients.forEach(client => {
      revenue += parseCurrency(client.contractValue);
      expenses += parseCurrency(client.projectCost);
    });

    // 2. From Standalone Transactions
    transactions.forEach(t => {
      const val = parseCurrency(t.amount);
      if (t.type === 'income') revenue += val;
      else expenses += val;
    });

    return {
      revenue,
      expenses,
      profit: revenue - expenses
    };
  }, [clients, transactions]);

  // --- Unified Chart Data ---
  const chartData = useMemo(() => {
    const dataMap: Record<string, { name: string, receita: number, despesa: number }> = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleString('pt-BR', { month: 'short' }); 
        const name = key.charAt(0).toUpperCase() + key.slice(1);
        dataMap[name] = { name, receita: 0, despesa: 0 };
    }

    // Helper to add data
    const addToMap = (dateStr: string | undefined, amount: number, type: 'income' | 'expense') => {
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      const key = date.toLocaleString('pt-BR', { month: 'short' });
      const name = key.charAt(0).toUpperCase() + key.slice(1);

      if (!dataMap[name]) dataMap[name] = { name, receita: 0, despesa: 0 };

      if (type === 'income') dataMap[name].receita += amount;
      else dataMap[name].despesa += amount;
    };

    // 1. Add Clients Data
    clients.forEach(client => {
      const dateStr = client.installDate || client.createdAt;
      addToMap(dateStr, parseCurrency(client.contractValue), 'income');
      addToMap(dateStr, parseCurrency(client.projectCost), 'expense');
    });

    // 2. Add Transactions Data
    transactions.forEach(t => {
      addToMap(t.date, parseCurrency(t.amount), t.type);
    });

    return Object.values(dataMap);
  }, [clients, transactions]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn overflow-y-auto custom-scrollbar pr-1">
      <h2 className="text-2xl font-black text-neon-400 mb-6 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)] flex items-center gap-3">
        Controle Financeiro Integrado
      </h2>

      {/* Cards de Totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-900 border border-neon-900/50 p-6 rounded-xl shadow-lg relative group overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={64} className="text-neon-500"/>
          </div>
          <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider flex items-center gap-1">
             Receita Total
          </h3>
          <p className="text-4xl font-black text-neon-400 mt-2">{formatCurrency(totals.revenue)}</p>
        </div>

        <div className="bg-dark-900 border border-neon-900/50 p-6 rounded-xl shadow-lg relative group overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown size={64} className="text-red-500"/>
          </div>
          <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Despesas Totais</h3>
          <p className="text-4xl font-black text-red-400 mt-2">{formatCurrency(totals.expenses)}</p>
        </div>

        <div className="bg-dark-900 border border-neon-900/50 p-6 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-neon-500 shadow-neon"></div>
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={64} className="text-white"/>
          </div>
          <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Lucro Líquido</h3>
          <p className={`text-4xl font-black mt-2 ${totals.profit >= 0 ? 'text-white' : 'text-red-500'}`}>
            {formatCurrency(totals.profit)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Gráfico */}
          <div className="lg:col-span-2 bg-dark-900 border border-gray-800 p-6 rounded-xl min-h-[350px] flex flex-col">
            <h3 className="text-lg font-bold text-gray-300 mb-6 flex items-center gap-2">
              <DollarSign size={20} className="text-neon-400"/> Fluxo de Caixa (Mensal)
            </h3>
            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#888" fontSize={14} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={14} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', fontSize: '14px', borderRadius: '8px', padding: '10px' }} 
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => formatCurrency(value)}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="receita" name="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Nova Movimentação Avulsa */}
          <div className="bg-dark-900 border border-gray-800 p-6 rounded-xl flex flex-col">
             <h3 className="text-lg font-bold text-neon-400 mb-6 flex items-center gap-2">
               <PlusCircle size={20} /> Registrar Movimentação
             </h3>
             <form onSubmit={handleSubmitTransaction} className="flex flex-col gap-4 flex-1">
                 <NeonInput 
                    label="Descrição" name="description" placeholder="Ex: Combustível, Uber..." 
                    icon={FileText} value={newTrans.description} onChange={handleTransChange} required
                 />
                 <NeonInput 
                    label="Valor (R$)" name="amount" placeholder="R$ 0,00" 
                    icon={DollarSign} value={newTrans.amount} onChange={handleTransChange} required
                 />
                 <NeonSelect 
                    label="Tipo" name="type" 
                    options={['Despesa', 'Receita']} 
                    value={newTrans.type === 'expense' ? 'Despesa' : 'Receita'}
                    onChange={(e) => setNewTrans(prev => ({ ...prev, type: e.target.value === 'Despesa' ? 'expense' : 'income' }))}
                 />
                 <NeonInput 
                    label="Data" name="date" type="date"
                    icon={Calendar} value={newTrans.date} onChange={handleTransChange} required
                 />
                 <NeonInput 
                    label="Categoria (Opcional)" name="category" placeholder="Ex: Transporte" 
                    icon={Tag} value={newTrans.category} onChange={handleTransChange}
                 />
                 <button type="submit" className="mt-auto bg-neon-900/30 hover:bg-neon-500 hover:text-black text-neon-400 border border-neon-500 py-3 rounded-lg font-bold transition-all shadow-neon flex justify-center items-center gap-2 text-base">
                    <PlusCircle size={18} /> Adicionar
                 </button>
             </form>
          </div>
      </div>

      {/* Histórico de Transações Avulsas */}
      <div className="bg-dark-900 border border-gray-800 p-6 rounded-xl">
         <h3 className="text-lg font-bold text-gray-300 mb-6 flex items-center gap-2">
            <FileText size={20} className="text-neon-400"/> Histórico de Movimentações Avulsas
         </h3>
         <div className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
               <thead className="text-sm uppercase text-gray-500 border-b border-gray-800 font-bold">
                  <tr>
                     <th className="px-6 py-4">Data</th>
                     <th className="px-6 py-4">Descrição</th>
                     <th className="px-6 py-4">Categoria</th>
                     <th className="px-6 py-4 text-right">Valor</th>
                     <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-800">
                  {transactions.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-600 italic text-base">Nenhuma movimentação avulsa registrada.</td></tr>
                  ) : (
                      transactions.map(t => (
                          <tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                              <td className="px-6 py-4 text-gray-300">{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                              <td className="px-6 py-4 text-white font-medium">{t.description}</td>
                              <td className="px-6 py-4 text-gray-400 text-sm">{t.category || '-'}</td>
                              <td className={`px-6 py-4 text-right font-bold text-lg ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                  {t.type === 'income' ? '+' : '-'} {t.amount}
                              </td>
                              <td className="px-6 py-4 text-center">
                                  {onDeleteTransaction && (
                                    <button onClick={() => onDeleteTransaction(t.id)} className="text-gray-500 hover:text-red-500 transition-colors p-2 bg-gray-950 rounded-lg" title="Excluir">
                                        <Trash2 size={18} />
                                    </button>
                                  )}
                              </td>
                          </tr>
                      ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
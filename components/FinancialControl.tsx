import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClientData, FinancialTransaction } from '../types';
import { Wallet, TrendingUp, TrendingDown, DollarSign, PlusCircle, Trash2, Calendar, FileText, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    setNewTrans(prev => ({ ...prev, description: '', amount: '', category: '' }));
  };

  const parseCurrency = (value?: string) => {
    if (!value) return 0;
    return parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  };

  const totals = useMemo(() => {
    let revenue = 0;
    let expenses = 0;

    clients.forEach(client => {
      revenue += parseCurrency(client.contractValue);
      expenses += parseCurrency(client.projectCost);
    });

    transactions.forEach(t => {
      const val = parseCurrency(t.amount);
      if (t.type === 'income') revenue += val;
      else expenses += val;
    });

    return { revenue, expenses, profit: revenue - expenses };
  }, [clients, transactions]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, { name: string, receita: number, despesa: number }> = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleString('pt-BR', { month: 'short' }); 
        const name = key.charAt(0).toUpperCase() + key.slice(1);
        dataMap[name] = { name, receita: 0, despesa: 0 };
    }

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

    clients.forEach(client => {
      const dateStr = client.installDate || client.createdAt;
      addToMap(dateStr, parseCurrency(client.contractValue), 'income');
      addToMap(dateStr, parseCurrency(client.projectCost), 'expense');
    });

    transactions.forEach(t => addToMap(t.date, parseCurrency(t.amount), t.type));
    return Object.values(dataMap);
  }, [clients, transactions]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Compact Card Component
  const KPICard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-dark-900 border border-gray-800 p-3 rounded flex items-center justify-between shadow-sm flex-1 min-w-[200px]">
        <div>
            <h4 className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{title}</h4>
            <p className={`text-xl font-bold tracking-tight ${color}`}>{value}</p>
        </div>
        <div className={`p-2 rounded bg-black/50 ${color.replace('text-', 'text-opacity-50 ')}`}>
            <Icon size={20} />
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-4 animate-fadeIn">
      {/* Top KPI Row */}
      <div className="flex flex-wrap gap-3 shrink-0">
        <KPICard title="Receita Total" value={formatCurrency(totals.revenue)} icon={TrendingUp} color="text-neon-400" />
        <KPICard title="Despesas Totais" value={formatCurrency(totals.expenses)} icon={TrendingDown} color="text-red-400" />
        <KPICard title="Lucro Líquido" value={formatCurrency(totals.profit)} icon={Wallet} color={totals.profit >= 0 ? "text-white" : "text-red-500"} />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-8 bg-dark-900 border border-gray-800 rounded p-4 flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <DollarSign size={14} className="text-neon-400"/> Fluxo de Caixa (6 Meses)
            </h3>
            <div className="flex-1 w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', fontSize: '12px', borderRadius: '4px' }} 
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => formatCurrency(value)}
                      cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    />
                    <Bar dataKey="receita" fill="#22c55e" radius={[2, 2, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="despesa" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Right Side: Quick Add & History */}
          <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Quick Form */}
              <div className="bg-dark-900 border border-gray-800 p-3 rounded shrink-0">
                 <h3 className="text-xs font-bold text-neon-400 mb-3 uppercase flex items-center gap-2">
                   <PlusCircle size={14} /> Novo Lançamento
                 </h3>
                 <form onSubmit={handleSubmitTransaction} className="flex flex-col gap-2">
                     <div className="grid grid-cols-2 gap-2">
                        <NeonInput label="Descrição" name="description" placeholder="Ex: Combustível" value={newTrans.description} onChange={handleTransChange} required className="mb-0" />
                        <NeonInput label="Valor" name="amount" placeholder="R$ 0,00" value={newTrans.amount} onChange={handleTransChange} required className="mb-0" />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <NeonSelect label="Tipo" name="type" options={['Despesa', 'Receita']} value={newTrans.type === 'expense' ? 'Despesa' : 'Receita'} onChange={(e) => setNewTrans(prev => ({ ...prev, type: e.target.value === 'Despesa' ? 'expense' : 'income' }))} className="mb-0" />
                        <NeonInput label="Data" name="date" type="date" value={newTrans.date} onChange={handleTransChange} required className="mb-0" />
                     </div>
                     <button type="submit" className="mt-1 bg-neon-900/30 hover:bg-neon-500 hover:text-black text-neon-400 border border-neon-900 hover:border-neon-500 py-1.5 rounded text-xs font-bold uppercase transition-all">
                        Adicionar
                     </button>
                 </form>
              </div>

              {/* Compact History List */}
              <div className="flex-1 bg-dark-900 border border-gray-800 rounded p-0 overflow-hidden flex flex-col min-h-[200px]">
                 <div className="p-3 border-b border-gray-800 bg-black/20">
                    <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                        <FileText size={14}/> Últimas Movimentações
                    </h3>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    <table className="w-full text-left text-xs">
                       <tbody className="divide-y divide-gray-800">
                          {transactions.length === 0 ? (
                              <tr><td className="p-4 text-center text-gray-600 italic">Sem registros.</td></tr>
                          ) : (
                              transactions.map(t => (
                                  <tr key={t.id} className="hover:bg-gray-800/30">
                                      <td className="p-2 pl-3 text-gray-500 whitespace-nowrap">{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</td>
                                      <td className="p-2 text-gray-300 font-medium truncate max-w-[100px]">{t.description}</td>
                                      <td className={`p-2 text-right font-bold whitespace-nowrap ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                          {t.type === 'income' ? '+' : '-'} {t.amount}
                                      </td>
                                      <td className="p-2 text-center w-8">
                                          {onDeleteTransaction && (
                                            <button onClick={() => onDeleteTransaction(t.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                                                <Trash2 size={12} />
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
      </div>
    </div>
  );
};
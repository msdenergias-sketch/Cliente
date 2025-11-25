import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', receita: 4000, despesa: 2400 },
  { name: 'Fev', receita: 3000, despesa: 1398 },
  { name: 'Mar', receita: 2000, despesa: 9800 },
  { name: 'Abr', receita: 2780, despesa: 3908 },
  { name: 'Mai', receita: 1890, despesa: 4800 },
  { name: 'Jun', receita: 2390, despesa: 3800 },
  { name: 'Jul', receita: 3490, despesa: 4300 },
];

export const FinancialControl: React.FC = () => {
  return (
    <div className="h-full flex flex-col animate-fadeIn overflow-y-auto custom-scrollbar pr-1">
      <h2 className="text-xl font-bold text-neon-400 mb-4 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">
        Controle Financeiro
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-900 border border-neon-900/50 p-4 rounded-lg shadow-lg">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Receita Total</h3>
          <p className="text-2xl font-bold text-neon-400 mt-1">R$ 154.320,00</p>
        </div>
        <div className="bg-dark-900 border border-neon-900/50 p-4 rounded-lg shadow-lg">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Despesas</h3>
          <p className="text-2xl font-bold text-red-400 mt-1">R$ 42.150,00</p>
        </div>
        <div className="bg-dark-900 border border-neon-900/50 p-4 rounded-lg shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-neon-500 shadow-neon"></div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Lucro Líquido</h3>
          <p className="text-2xl font-bold text-white mt-1">R$ 112.170,00</p>
        </div>
      </div>

      <div className="bg-dark-900 border border-gray-800 p-4 rounded-lg flex-1 min-h-[300px]">
        <h3 className="text-base font-bold text-gray-300 mb-4">Fluxo de Caixa (Semestral)</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', fontSize: '12px' }} 
                itemStyle={{ color: '#4ade80' }}
              />
              <Bar dataKey="receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
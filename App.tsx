
import React, { useState, useEffect } from 'react';
import { Tab, ClientData, FinancialTransaction, SystemMeta } from './types';
import { ClientRegistration } from './components/ClientRegistration';
import { ClientList } from './components/ClientList';
import { FinancialControl } from './components/FinancialControl';
import { SystemSettings } from './components/SystemSettings';
import { LayoutDashboard, Users, UserPlus, Settings, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('client-list');
  
  // Estado Global de Clientes (com persistência no LocalStorage)
  const [clients, setClients] = useState<ClientData[]>(() => {
    const saved = localStorage.getItem('neon_clients');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado Global de Transações Financeiras Avulsas (com persistência)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('neon_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Metadados do Sistema (Último Backup, etc)
  const [systemMeta, setSystemMeta] = useState<SystemMeta>(() => {
    const saved = localStorage.getItem('neon_system_meta');
    return saved ? JSON.parse(saved) : { lastBackupDate: null };
  });

  // Estado para controlar qual cliente está sendo editado
  const [clientToEdit, setClientToEdit] = useState<ClientData | null>(null);

  // Persistência: Clientes
  useEffect(() => {
    localStorage.setItem('neon_clients', JSON.stringify(clients));
  }, [clients]);

  // Persistência: Transações
  useEffect(() => {
    localStorage.setItem('neon_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Persistência: Metadados
  useEffect(() => {
    localStorage.setItem('neon_system_meta', JSON.stringify(systemMeta));
  }, [systemMeta]);

  // --- Handlers de Clientes ---
  const handleSaveClient = (clientData: ClientData) => {
    if (clientToEdit) {
      setClients(prev => prev.map(c => c.id === clientData.id ? clientData : c));
      alert("Cliente atualizado com sucesso!");
    } else {
      setClients(prev => [...prev, clientData]);
      alert("Cliente cadastrado com sucesso!");
    }
    setClientToEdit(null);
    setActiveTab('client-list');
  };

  const handleEditClick = (client: ClientData) => {
    setClientToEdit(client);
    setActiveTab('new-client');
  };

  const handleDeleteClick = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // --- Handlers de Transações Financeiras ---
  const handleAddTransaction = (transaction: FinancialTransaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Handlers Gerais ---
  const handleTabChange = (tab: Tab) => {
    if (tab === 'new-client' && activeTab !== 'new-client') {
      setClientToEdit(null); 
    }
    setActiveTab(tab);
  };

  const handleBackupComplete = () => {
    setSystemMeta({ lastBackupDate: new Date().toISOString() });
  };

  // Função chamada pelo componente de Restore
  const handleRestoreData = (restoredClients: ClientData[], restoredTransactions: FinancialTransaction[]) => {
    setClients(restoredClients);
    setTransactions(restoredTransactions);
    // Ao restaurar, assumimos que os dados estão "salvos" pois vieram de um arquivo
    setSystemMeta({ lastBackupDate: new Date().toISOString() });
  };

  // Check backup status for alert icon
  const isBackupOutdated = () => {
    if (!systemMeta.lastBackupDate) return true;
    const last = new Date(systemMeta.lastBackupDate).getTime();
    const now = new Date().getTime();
    const daysDiff = (now - last) / (1000 * 3600 * 24);
    return daysDiff > 7; // Alert if older than 7 days
  };

  const navItems = [
    { id: 'new-client' as Tab, label: clientToEdit ? 'Editando Cliente' : 'Novo Cliente', icon: <UserPlus size={16} /> },
    { id: 'client-list' as Tab, label: 'Lista de Clientes', icon: <Users size={16} /> },
    { id: 'financial' as Tab, label: 'Controle Financeiro', icon: <LayoutDashboard size={16} /> },
    { id: 'settings' as Tab, label: 'Configurações', icon: <Settings size={16} />, alert: isBackupOutdated() },
  ];

  return (
    <div className="h-screen bg-black text-gray-200 font-sans selection:bg-neon-500 selection:text-black flex flex-col overflow-hidden">
      {/* Header Compacto */}
      <header className="px-6 py-3 border-b border-gray-900 bg-black/95 flex flex-col md:flex-row justify-between items-center gap-4 z-10 shrink-0">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-2xl font-extrabold text-neon-500 tracking-tight drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
            Sistema de Gestão
          </h1>
          <p className="text-gray-400 text-xs">
            Gerencie seus clientes e finanças
          </p>
        </div>

        {/* Navigation Compacta */}
        <nav className="flex gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap relative
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-neon-500 to-neon-400 text-black shadow-neon ring-1 ring-neon-400' 
                  : 'bg-dark-900 text-gray-400 border border-gray-800 hover:border-neon-900 hover:text-white hover:bg-dark-800'}
              `}
            >
              {item.icon}
              {item.label}
              {item.alert && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-black" title="Backup necessário"></span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-hidden p-4 relative">
        <div className="bg-dark-950 rounded-xl border border-gray-900/50 w-full h-full overflow-y-auto custom-scrollbar p-2 md:p-4 shadow-inner">
          {activeTab === 'new-client' && (
            <ClientRegistration 
              onSave={handleSaveClient} 
              initialData={clientToEdit}
              onCancel={() => {
                setClientToEdit(null);
                setActiveTab('client-list');
              }}
            />
          )}
          
          {activeTab === 'client-list' && (
            <ClientList 
              clients={clients} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick} 
            />
          )}
          
          {activeTab === 'financial' && (
            <FinancialControl 
              clients={clients} 
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'settings' && (
            <SystemSettings 
              clients={clients} 
              transactions={transactions}
              onRestore={handleRestoreData}
              lastBackupDate={systemMeta.lastBackupDate}
              onBackupComplete={handleBackupComplete}
            />
          )}
        </div>
      </main>
      
      {/* Footer Compacto */}
      <footer className="shrink-0 bg-dark-900 border-t border-gray-800 py-1.5 px-4 text-[10px] text-gray-600 flex justify-between items-center z-10">
        <span>Sistema v1.0.1</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-500 animate-pulse"></span>
          Online
        </span>
      </footer>
    </div>
  );
};

export default App;

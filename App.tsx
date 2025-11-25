import React, { useState, useEffect } from 'react';
import { Tab, ClientData, FinancialTransaction, SystemMeta } from './types';
import { ClientRegistration } from './components/ClientRegistration';
import { ClientList } from './components/ClientList';
import { FinancialControl } from './components/FinancialControl';
import { SystemSettings } from './components/SystemSettings';
import { LayoutDashboard, Users, UserPlus, Settings, AlertTriangle, Zap } from 'lucide-react';

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
    { id: 'new-client' as Tab, label: clientToEdit ? 'Editando' : 'Novo Cliente', icon: <UserPlus size={18} /> },
    { id: 'client-list' as Tab, label: 'Clientes', icon: <Users size={18} /> },
    { id: 'financial' as Tab, label: 'Financeiro', icon: <LayoutDashboard size={18} /> },
    { id: 'settings' as Tab, label: 'Configurações', icon: <Settings size={18} />, alert: isBackupOutdated() },
  ];

  return (
    <div className="h-screen bg-black text-gray-300 font-sans selection:bg-neon-500 selection:text-black flex flex-col overflow-hidden">
      {/* Header Ultra Compacto */}
      <header className="h-14 border-b border-gray-900 bg-black flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-neon-500 fill-neon-500" />
          <h1 className="text-lg font-bold text-white tracking-tight">
            Sistema<span className="text-neon-500">Gestão</span>
          </h1>
        </div>

        {/* Navigation Compacta */}
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 relative
                ${activeTab === item.id 
                  ? 'bg-neon-900/20 text-neon-400 border border-neon-900/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                  : 'text-gray-500 hover:text-gray-200 hover:bg-gray-900'}
              `}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
              {item.alert && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-500 animate-pulse"></span> v1.0.1
        </div>
      </header>

      {/* Main Content Area - Maximized */}
      <main className="flex-1 overflow-hidden bg-dark-950 relative">
        <div className="w-full h-full overflow-hidden p-2">
          <div className="w-full h-full bg-black/40 rounded border border-gray-900 overflow-y-auto custom-scrollbar p-3">
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
        </div>
      </main>
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { Tab, ClientData } from './types';
import { ClientRegistration } from './components/ClientRegistration';
import { ClientList } from './components/ClientList';
import { FinancialControl } from './components/FinancialControl';
import { LayoutDashboard, Users, UserPlus } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('client-list');
  
  // Estado Global de Clientes (com persistência no LocalStorage)
  const [clients, setClients] = useState<ClientData[]>(() => {
    const saved = localStorage.getItem('neon_clients');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado para controlar qual cliente está sendo editado
  const [clientToEdit, setClientToEdit] = useState<ClientData | null>(null);

  // Salvar no LocalStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem('neon_clients', JSON.stringify(clients));
  }, [clients]);

  // Função para Salvar (Criar ou Atualizar)
  const handleSaveClient = (clientData: ClientData) => {
    if (clientToEdit) {
      // Atualizar Existente
      setClients(prev => prev.map(c => c.id === clientData.id ? clientData : c));
      alert("Cliente atualizado com sucesso!");
    } else {
      // Criar Novo
      setClients(prev => [...prev, clientData]);
      alert("Cliente cadastrado com sucesso!");
    }
    setClientToEdit(null); // Limpar modo edição
    setActiveTab('client-list'); // Voltar para a lista
  };

  // Função para Iniciar Edição
  const handleEditClick = (client: ClientData) => {
    setClientToEdit(client);
    setActiveTab('new-client');
  };

  // Função para Excluir
  const handleDeleteClick = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Função para Cancelar Edição ou limpar formulário ao mudar de aba manualmente
  const handleTabChange = (tab: Tab) => {
    if (tab === 'new-client' && activeTab !== 'new-client') {
      // Se clicou na aba "Novo Cliente", limpa o modo edição para começar do zero
      setClientToEdit(null); 
    }
    setActiveTab(tab);
  };

  const navItems = [
    { id: 'new-client' as Tab, label: clientToEdit ? 'Editando Cliente' : 'Novo Cliente', icon: <UserPlus size={16} /> },
    { id: 'client-list' as Tab, label: 'Lista de Clientes', icon: <Users size={16} /> },
    { id: 'financial' as Tab, label: 'Controle Financeiro', icon: <LayoutDashboard size={16} /> },
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
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-neon-500 to-neon-400 text-black shadow-neon ring-1 ring-neon-400' 
                  : 'bg-dark-900 text-gray-400 border border-gray-800 hover:border-neon-900 hover:text-white hover:bg-dark-800'}
              `}
            >
              {item.icon}
              {item.label}
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
          
          {activeTab === 'financial' && <FinancialControl />}
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
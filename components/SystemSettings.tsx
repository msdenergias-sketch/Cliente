
import React, { useRef, useState } from 'react';
import { ClientData, FinancialTransaction } from '../types';
import { Download, Upload, Database, AlertTriangle, CheckCircle, Save, RotateCcw, Clock } from 'lucide-react';

interface SystemSettingsProps {
  clients: ClientData[];
  transactions: FinancialTransaction[];
  onRestore: (clients: ClientData[], transactions: FinancialTransaction[]) => void;
  lastBackupDate: string | null;
  onBackupComplete: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ 
  clients, 
  transactions, 
  onRestore, 
  lastBackupDate, 
  onBackupComplete 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // State for Restore Decision Modal
  const [restoreModalData, setRestoreModalData] = useState<{
      newClients: ClientData[],
      mergedClients: ClientData[],
      newTransactions: FinancialTransaction[],
      mergedTransactions: FinancialTransaction[],
      stats: { newC: number, conflictC: number, newT: number }
  } | null>(null);


  // --- Função de Backup (Exportar) ---
  const handleBackup = () => {
    try {
      const backupData = {
          version: '1.1',
          timestamp: new Date().toISOString(),
          clients,
          transactions
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      const date = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      
      a.href = url;
      a.download = `backup_sistema_neon_${date}_${time}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onBackupComplete(); // Atualiza a data do último backup
      setMessage({ type: 'success', text: 'Backup realizado com sucesso! Verifique sua pasta de downloads.' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erro ao gerar arquivo de backup.' });
    }
  };

  // --- Analisar Arquivo de Backup ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        // Normalização: Suporta formato antigo (array de clientes) ou novo (objeto completo)
        let incomingClients: ClientData[] = [];
        let incomingTransactions: FinancialTransaction[] = [];

        if (Array.isArray(parsedData)) {
            incomingClients = parsedData;
        } else if (parsedData.clients && Array.isArray(parsedData.clients)) {
            incomingClients = parsedData.clients;
            if (parsedData.transactions && Array.isArray(parsedData.transactions)) {
                incomingTransactions = parsedData.transactions;
            }
        } else {
            throw new Error("Formato desconhecido");
        }

        // Lógica de Mesclagem de Clientes
        const currentClientMap = new Map(clients.map(c => [c.id, c]));
        let newClientCount = 0;
        let conflictClientCount = 0;

        const mergedClientsMap = new Map(currentClientMap);
        
        incomingClients.forEach(client => {
            if (currentClientMap.has(client.id)) {
                conflictClientCount++;
                mergedClientsMap.set(client.id, client); // Sobrescreve no merge
            } else {
                newClientCount++;
                mergedClientsMap.set(client.id, client);
            }
        });

        // Lógica de Mesclagem de Transações (Simplificada: Id unico)
        const currentTransMap = new Map(transactions.map(t => [t.id, t]));
        let newTransCount = 0;
        const mergedTransMap = new Map(currentTransMap);
        
        incomingTransactions.forEach(t => {
             if (!currentTransMap.has(t.id)) {
                 newTransCount++;
                 mergedTransMap.set(t.id, t);
             }
        });

        setRestoreModalData({
            newClients: incomingClients,
            mergedClients: Array.from(mergedClientsMap.values()),
            newTransactions: incomingTransactions,
            mergedTransactions: Array.from(mergedTransMap.values()),
            stats: { newC: newClientCount, conflictC: conflictClientCount, newT: newTransCount }
        });

        if (fileInputRef.current) fileInputRef.current.value = '';

      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Arquivo de backup inválido ou corrompido.' });
      }
    };
    reader.readAsText(file);
  };

  const confirmRestore = (mode: 'merge' | 'replace') => {
      if (!restoreModalData) return;

      if (mode === 'replace') {
          onRestore(restoreModalData.newClients, restoreModalData.newTransactions);
          setMessage({ type: 'success', text: 'Sistema restaurado (Substituição Total) com sucesso!' });
      } else {
          onRestore(restoreModalData.mergedClients, restoreModalData.mergedTransactions);
          setMessage({ type: 'success', text: 'Sistema atualizado (Mesclagem) com sucesso!' });
      }
      setRestoreModalData(null);
  };

  // Helper para formatar a data do backup
  const formatLastBackup = () => {
    if (!lastBackupDate) return 'Nunca realizado';
    const date = new Date(lastBackupDate);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR')}`;
  };

  const isBackupOld = () => {
    if (!lastBackupDate) return true;
    const last = new Date(lastBackupDate).getTime();
    const now = new Date().getTime();
    const daysDiff = (now - last) / (1000 * 3600 * 24);
    return daysDiff > 7;
  };

  return (
    <div className="w-full h-full flex flex-col animate-fadeIn overflow-y-auto custom-scrollbar pr-1 relative">
      <h2 className="text-xl font-bold text-neon-400 mb-6 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)] flex items-center gap-2">
        Configurações do Sistema
      </h2>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 animate-fadeIn ${
          message.type === 'success' ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      {/* Status de Backup */}
      <div className={`mb-8 p-4 rounded-lg border flex items-center justify-between ${isBackupOld() ? 'bg-yellow-900/10 border-yellow-700/50' : 'bg-dark-900 border-gray-800'}`}>
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isBackupOld() ? 'bg-yellow-900/30 text-yellow-500' : 'bg-green-900/30 text-green-500'}`}>
                <Clock size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Último Backup</p>
                <p className={`text-sm font-medium ${isBackupOld() ? 'text-yellow-400' : 'text-white'}`}>
                    {formatLastBackup()}
                </p>
                {isBackupOld() && <p className="text-[10px] text-yellow-500 mt-1">Recomendado: Faça um backup agora.</p>}
            </div>
         </div>
      </div>

      {/* Restore Decision Modal */}
      {restoreModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-dark-900 border border-neon-900 p-6 rounded-lg shadow-neon max-w-lg w-full">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Database className="text-neon-500" /> Analise de Backup
                  </h3>
                  <div className="space-y-3 mb-6 text-sm text-gray-300">
                      <p>O arquivo contém:</p>
                      <ul className="list-disc pl-5 text-gray-400">
                          <li><strong>{restoreModalData.newClients.length}</strong> Clientes totais.</li>
                          <li><strong>{restoreModalData.newTransactions.length}</strong> Movimentações financeiras.</li>
                      </ul>
                      <div className="h-px bg-gray-800 my-2"></div>
                      <p>Comparado com seus dados atuais:</p>
                       <ul className="list-disc pl-5 text-gray-400">
                          <li className="text-green-400"><strong>+{restoreModalData.stats.newC}</strong> Novos clientes serão adicionados.</li>
                          <li className="text-yellow-400"><strong>{restoreModalData.stats.conflictC}</strong> Clientes já existem (serão atualizados).</li>
                          <li className="text-blue-400"><strong>+{restoreModalData.stats.newT}</strong> Novas movimentações financeiras.</li>
                      </ul>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => confirmRestore('merge')} className="flex-1 bg-neon-500 hover:bg-neon-400 text-black font-bold py-2 rounded transition-colors">
                          Mesclar (Recomendado)
                      </button>
                      <button onClick={() => confirmRestore('replace')} className="flex-1 bg-red-900/30 border border-red-800 hover:bg-red-800 text-red-200 font-bold py-2 rounded transition-colors">
                          Substituir Tudo
                      </button>
                  </div>
                   <button onClick={() => setRestoreModalData(null)} className="w-full mt-3 text-gray-500 hover:text-white text-xs underline">Cancelar Operação</button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card de Backup */}
        <div className="bg-dark-900 border border-neon-900/50 rounded-xl p-6 shadow-lg relative group overflow-hidden">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database size={120} className="text-neon-500"/>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Save className="text-neon-500" size={20}/> Fazer Backup
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Exporte todos os dados dos seus clientes, projetos e movimentações financeiras.
            </p>
            
            <div className="bg-black/50 rounded p-3 mb-6 text-xs text-gray-500 font-mono border border-gray-800">
              Registros: <span className="text-neon-400 font-bold">{clients.length} clientes</span>, <span className="text-blue-400 font-bold">{transactions.length} transações</span>
            </div>

            <button 
              onClick={handleBackup}
              className="w-full py-3 bg-neon-500 hover:bg-neon-400 text-black font-bold rounded-lg shadow-neon hover:shadow-neon-strong transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} /> Baixar Backup Completo
            </button>
          </div>
        </div>

        {/* Card de Restauração */}
        <div className="bg-dark-900 border border-red-900/30 rounded-xl p-6 shadow-lg relative group overflow-hidden">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <RotateCcw size={120} className="text-red-500"/>
          </div>

          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Upload className="text-red-500" size={20}/> Restaurar Dados
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Importe um arquivo de backup para restaurar clientes e financeiro.
            </p>
            
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-dark-950 border border-gray-600 hover:border-red-500 text-gray-300 hover:text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 hover:bg-red-900/20"
            >
              <Upload size={18} /> Selecionar Backup
            </button>
          </div>
        </div>

      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-600">
          O sistema utiliza o armazenamento local do navegador (LocalStorage). 
          Limpar o cache do navegador pode apagar seus dados se você não tiver um backup salvo.
        </p>
      </div>
    </div>
  );
};

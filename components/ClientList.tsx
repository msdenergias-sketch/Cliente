import React, { useState } from 'react';
import { Search, Edit2, Trash2, AlertTriangle, X, FileText, MessageCircle } from 'lucide-react';
import { NeonInput } from './ui/Input';
import { ClientData } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ClientListProps {
  clients: ClientData[];
  onEdit: (client: ClientData) => void;
  onDelete: (id: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredClients = clients.filter(client => 
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.docNumber.includes(searchTerm)
  );

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // --- WhatsApp Logic ---
  const handleWhatsApp = (client: ClientData) => {
      const nums = client.phone.replace(/\D/g, '');
      if (!nums) {
          alert("Telefone não cadastrado.");
          return;
      }
      const message = `Olá ${client.fullName}, tudo bem? Sou da [Sua Empresa] e gostaria de falar sobre o projeto solar da unidade ${client.uc || ''}.`;
      window.open(`https://wa.me/55${nums}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- PDF Generator Logic ---
  const handleGeneratePDF = (client: ClientData) => {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(10, 10, 10); // Dark background
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(74, 222, 128); // Neon Green
      doc.setFontSize(22);
      doc.text("Ficha Técnica do Projeto", 105, 20, { align: 'center' });
      
      // Status Badge
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`Status: ${client.projectStatus || 'N/A'}`, 180, 20, { align: 'right' });

      // Section: Dados do Cliente
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text("Dados do Cliente", 14, 45);
      doc.setLineWidth(0.5);
      doc.line(14, 47, 196, 47);

      autoTable(doc, {
          startY: 50,
          head: [['Campo', 'Informação']],
          body: [
              ['Nome', client.fullName],
              ['Documento', `${client.docType}: ${client.docNumber}`],
              ['Telefone', client.phone],
              ['Email', client.email],
              ['Endereço', `${client.street}, ${client.number} - ${client.city}/${client.state}`]
          ],
          theme: 'grid',
          headStyles: { fillColor: [20, 83, 45] }, // Dark Green
      });

      // Section: Dados Técnicos
      let finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("Dados Técnicos da Instalação", 14, finalY);
      doc.line(14, finalY + 2, 196, finalY + 2);

      autoTable(doc, {
          startY: finalY + 5,
          head: [['Item', 'Detalhe']],
          body: [
              ['Concessionária', client.concessionaire],
              ['UC', client.uc],
              ['Conexão', `${client.connectionType} / ${client.voltage}`],
              ['Disjuntor', client.breaker],
              ['Consumo Médio', `${client.avgConsumption} kWh`],
              ['Potência Estimada', `${client.avgConsumption ? (parseFloat(client.avgConsumption)/101.25).toFixed(2) : '0'} kWp`]
          ],
          theme: 'grid',
          headStyles: { fillColor: [20, 83, 45] },
      });

      // Section: Equipamentos e Financeiro
      finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("Projeto & Financeiro", 14, finalY);
      doc.line(14, finalY + 2, 196, finalY + 2);

      autoTable(doc, {
          startY: finalY + 5,
          body: [
              ['Equipamentos', client.equipmentList || 'Não especificado'],
              ['Valor do Contrato', client.contractValue || 'R$ 0,00'],
              ['Custo Estimado', client.projectCost || 'R$ 0,00'],
              ['Data de Instalação', client.installDate ? new Date(client.installDate).toLocaleDateString('pt-BR') : 'A definir']
          ],
          theme: 'striped',
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Gerado em ${new Date().toLocaleDateString()} pelo Sistema de Gestão`, 105, 290, { align: 'center' });
      }

      doc.save(`Projeto_${client.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="w-full h-full flex flex-col animate-fadeIn relative">
      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-dark-900 border border-red-900/50 p-6 rounded-lg shadow-[0_0_30px_rgba(239,68,68,0.2)] max-w-md w-full animate-fadeIn flex flex-col items-center text-center">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e todos os dados serão perdidos.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded bg-dark-950 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors font-bold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <h2 className="text-xl font-bold text-neon-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">
          Lista de Clientes
        </h2>
        <div className="w-full md:w-1/3">
          <NeonInput 
            icon={Search}
            placeholder="Buscar por nome, email ou CPF..." 
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-gray-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col">
        {clients.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
            <div className="w-16 h-16 rounded-full bg-dark-900 flex items-center justify-center mb-4 border border-gray-800">
              <Search size={24} />
            </div>
            <p className="text-lg font-medium">Nenhum cliente cadastrado</p>
            <p className="text-sm">Cadastre um novo cliente para vê-lo aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar h-full">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b border-gray-700 bg-dark-900/80 text-neon-400 backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">Nome</th>
                  <th scope="col" className="px-4 py-3 font-bold">Status</th>
                  <th scope="col" className="px-4 py-3 font-bold">Email</th>
                  <th scope="col" className="px-4 py-3 font-bold">Telefone</th>
                  <th scope="col" className="px-4 py-3 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-dark-950">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-neon-900/10 transition-colors duration-200 group">
                    <td className="px-4 py-3 text-gray-300 font-medium">
                        <div className="flex flex-col">
                            <span className="group-hover:text-white">{client.fullName}</span>
                            {client.projectStatus && (
                                <span className="text-[10px] text-gray-500 uppercase">{client.projectStatus}</span>
                            )}
                        </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border shadow-sm ${
                        client.status === 'Ativo' ? 'border-green-800 text-green-400 bg-green-900/20' :
                        client.status === 'Pendente' ? 'border-yellow-800 text-yellow-400 bg-yellow-900/20' :
                        client.status === 'Inativo' ? 'border-red-800 text-red-400 bg-red-900/20' :
                        'border-blue-800 text-blue-400 bg-blue-900/20'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{client.email}</td>
                    <td className="px-4 py-3 text-gray-400">{client.phone}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleWhatsApp(client)}
                          className="p-1.5 rounded hover:bg-green-900/30 text-gray-400 hover:text-green-400 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleGeneratePDF(client)}
                          className="p-1.5 rounded hover:bg-blue-900/30 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Gerar PDF"
                        >
                          <FileText size={16} />
                        </button>
                        <button 
                          onClick={() => onEdit(client)}
                          className="p-1.5 rounded hover:bg-neon-900/30 text-gray-400 hover:text-neon-400 transition-colors group-edit"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(client.id)}
                          className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors group-delete"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
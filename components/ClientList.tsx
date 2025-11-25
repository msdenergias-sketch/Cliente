
import React, { useState } from 'react';
import { Search, Edit2, Trash2, AlertTriangle, FileText, MessageCircle } from 'lucide-react';
import { NeonInput } from './ui/Input';
import { ClientData } from '../types';
import { jsPDF } from 'jspdf';
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
  const handleWhatsApp = (e: React.MouseEvent, client: ClientData) => {
      e.stopPropagation();
      const nums = client.phone.replace(/\D/g, '');
      if (!nums) {
          alert("Telefone não cadastrado.");
          return;
      }
      
      const confirmSend = window.confirm(`Deseja enviar mensagem WhatsApp para ${client.fullName}?`);
      if (!confirmSend) return;

      const message = `Olá ${client.fullName}, tudo bem? Sou da [Sua Empresa]. Gostaria de falar sobre o andamento do seu projeto (Status: ${client.projectStatus || 'Inicial'}).`;
      window.open(`https://wa.me/55${nums}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- PDF Generator Logic ---
  const handleGeneratePDF = (e: React.MouseEvent, client: ClientData) => {
      e.stopPropagation();
      try {
        const doc = new jsPDF();
        
        // --- HEADER DESIGN ---
        doc.setFillColor(5, 5, 5); // Almost Black background
        doc.rect(0, 0, 210, 35, 'F');
        
        doc.setTextColor(74, 222, 128); // Neon Green Title
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("FICHA TÉCNICA DE PROJETO", 105, 18, { align: 'center' });
        
        doc.setTextColor(200, 200, 200); // Subtitle
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 105, 26, { align: 'center' });

        // Status Badge in PDF
        doc.setFillColor(34, 197, 94); // Green Badge
        doc.roundedRect(165, 10, 35, 8, 1, 1, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text((client.projectStatus || 'NOVO').toUpperCase(), 182.5, 15.5, { align: 'center' });

        let finalY = 45; // Start Y position for tables

        // --- 1. DADOS PESSOAIS ---
        autoTable(doc, {
            startY: finalY,
            head: [['DADOS DO CLIENTE', '']],
            body: [
                ['Nome Completo', client.fullName],
                ['Documento', `${client.docType}: ${client.docNumber}`],
                ['Email', client.email],
                ['Telefone', client.phone],
                ['Observações', client.notes || 'Nenhuma observação registrada.']
            ],
            theme: 'grid',
            headStyles: { fillColor: [20, 20, 20], textColor: [74, 222, 128], fontStyle: 'bold', lineWidth: 0.1, lineColor: [74, 222, 128] },
            columnStyles: { 0: { fontStyle: 'bold', width: 50, fillColor: [245, 245, 245] } },
            styles: { fontSize: 9, cellPadding: 2 }
        });

        finalY = (doc as any).lastAutoTable.finalY + 10;

        // --- 2. LOCALIZAÇÃO ---
        autoTable(doc, {
            startY: finalY,
            head: [['LOCALIZAÇÃO & ENDEREÇO', '']],
            body: [
                ['Endereço', `${client.street}, ${client.number}`],
                ['Bairro / Cidade', `${client.neighborhood} - ${client.city} / ${client.state}`],
                ['CEP', client.cep],
                ['Referência', client.reference || '-'],
                ['Coordenadas (GPS)', `Lat: ${client.latitude || '-'} | Lon: ${client.longitude || '-'}`],
                ['Coordenadas (UTM)', `Zona: ${client.utmZone || '-'} | E: ${client.utmEasting || '-'} | N: ${client.utmNorthing || '-'}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [20, 20, 20], textColor: [74, 222, 128], fontStyle: 'bold', lineWidth: 0.1, lineColor: [74, 222, 128] },
            columnStyles: { 0: { fontStyle: 'bold', width: 50, fillColor: [245, 245, 245] } },
            styles: { fontSize: 9, cellPadding: 2 }
        });

        finalY = (doc as any).lastAutoTable.finalY + 10;

        // --- 3. DADOS TÉCNICOS ---
        // Estimativa Potência
        const estimatedPower = client.avgConsumption ? (parseFloat(client.avgConsumption) / 101.25).toFixed(2) + ' kWp' : 'N/A';
        const calculatedKw = client.voltage && client.breaker 
            ? `${((parseInt(client.voltage) * parseInt(client.breaker) * (client.connectionType === 'Trifásico' ? 1.732 : 1)) / 1000).toFixed(2)} kW`
            : '-';

        autoTable(doc, {
            startY: finalY,
            head: [['DADOS TÉCNICOS DA INSTALAÇÃO', '']],
            body: [
                ['Concessionária', client.concessionaire],
                ['Unidade Consumidora (UC)', client.uc],
                ['Tipo Instalação', client.installType],
                ['Conexão / Tensão', `${client.connectionType} - ${client.voltage}`],
                ['Disjuntor', client.breaker],
                ['Potência Disponibilizada', calculatedKw],
                ['Consumo Médio Mensal', `${client.avgConsumption || '0'} kWh`],
                ['Sugestão Sistema Solar', estimatedPower]
            ],
            theme: 'grid',
            headStyles: { fillColor: [20, 20, 20], textColor: [74, 222, 128], fontStyle: 'bold', lineWidth: 0.1, lineColor: [74, 222, 128] },
            columnStyles: { 0: { fontStyle: 'bold', width: 50, fillColor: [245, 245, 245] } },
            styles: { fontSize: 9, cellPadding: 2 }
        });

        finalY = (doc as any).lastAutoTable.finalY + 10;

        // --- 4. PROJETO & FINANCEIRO ---
        // Check if we need a new page
        if (finalY > 220) {
            doc.addPage();
            finalY = 20;
        }

        autoTable(doc, {
            startY: finalY,
            head: [['PROJETO & FINANCEIRO', '']],
            body: [
                ['Status Atual', client.projectStatus || 'Inicial'],
                ['Data Instalação', client.installDate ? new Date(client.installDate).toLocaleDateString('pt-BR') : 'A definir'],
                ['Valor do Contrato', client.contractValue || 'R$ 0,00'],
                ['Custo do Projeto', client.projectCost || 'R$ 0,00'],
                ['Lista de Equipamentos', client.equipmentList || 'Nenhum equipamento listado.']
            ],
            theme: 'grid',
            headStyles: { fillColor: [20, 83, 45], textColor: [255, 255, 255], fontStyle: 'bold' }, // Green Header for money
            columnStyles: { 0: { fontStyle: 'bold', width: 50, fillColor: [245, 245, 245] } },
            styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' } // Allow multiline for equipment
        });

        // --- FOOTER ---
        const pageCount = (doc as any).internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Sistema de Gestão - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
        }

        doc.save(`Ficha_${client.fullName.replace(/\s+/g, '_')}.pdf`);
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique se todos os dados estão preenchidos corretamente.");
      }
  };

  return (
    <div className="w-full h-full flex flex-col animate-fadeIn relative">
      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-dark-900 border border-red-900/50 p-6 rounded-lg shadow-[0_0_30px_rgba(239,68,68,0.2)] max-w-sm w-full animate-fadeIn flex flex-col items-center text-center">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Tem certeza? Esta ação é irreversível.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded bg-dark-950 border border-gray-700 text-gray-300 hover:bg-gray-800 font-bold text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 gap-4 bg-dark-950 p-2 rounded border border-gray-900">
        <h2 className="text-lg font-bold text-neon-400 flex items-center gap-2 px-2">
          Clientes <span className="bg-neon-900/30 text-neon-500 px-2 py-0.5 rounded-full text-xs border border-neon-900/50">{clients.length}</span>
        </h2>
        <div className="w-64">
          <NeonInput 
            icon={Search}
            placeholder="Buscar..." 
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded border border-gray-800 bg-black flex flex-col">
        {clients.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 p-10">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Nenhum cliente cadastrado</p>
          </div>
        ) : (
          <div className="overflow-auto custom-scrollbar h-full">
            <table className="min-w-full text-left whitespace-nowrap">
              <thead className="text-[10px] uppercase font-bold text-gray-500 bg-dark-900 sticky top-0 z-10 border-b border-gray-800 tracking-wider">
                <tr>
                  <th className="px-4 py-2">Nome / Projeto</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Contato</th>
                  <th className="px-4 py-2">Localização</th>
                  <th className="px-4 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900 bg-black text-sm">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-900/50 transition-colors group">
                    <td className="px-4 py-2.5">
                        <div className="flex flex-col">
                            <span className="text-gray-200 font-medium group-hover:text-neon-400 transition-colors">{client.fullName}</span>
                            <span className="text-[10px] text-gray-500">{client.projectStatus || 'Sem projeto'}</span>
                        </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wide border ${
                        client.status === 'Ativo' ? 'border-green-900 text-green-500 bg-green-950/30' :
                        client.status === 'Pendente' ? 'border-yellow-900 text-yellow-500 bg-yellow-950/30' :
                        'border-red-900 text-red-500 bg-red-950/30'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs">{client.phone}</span>
                            <span className="text-gray-600 text-[10px]">{client.email}</span>
                        </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                        {client.city} - {client.state}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={(e) => handleWhatsApp(e, client)} className="p-1.5 rounded bg-dark-900 hover:bg-green-900/20 text-gray-500 hover:text-green-500 border border-transparent hover:border-green-900 transition-all" title="WhatsApp">
                          <MessageCircle size={14} />
                        </button>
                        <button onClick={(e) => handleGeneratePDF(e, client)} className="p-1.5 rounded bg-dark-900 hover:bg-blue-900/20 text-gray-500 hover:text-blue-500 border border-transparent hover:border-blue-900 transition-all" title="Gerar PDF">
                          <FileText size={14} />
                        </button>
                        <button onClick={() => onEdit(client)} className="p-1.5 rounded bg-dark-900 hover:bg-neon-900/20 text-gray-500 hover:text-neon-500 border border-transparent hover:border-neon-900 transition-all" title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirmId(client.id)} className="p-1.5 rounded bg-dark-900 hover:bg-red-900/20 text-gray-500 hover:text-red-500 border border-transparent hover:border-red-900 transition-all" title="Excluir">
                          <Trash2 size={14} />
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

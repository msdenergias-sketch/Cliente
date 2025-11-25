import React, { useState, useEffect, useRef } from 'react';
import { FormStep, ClientStatus, DocType, ClientData, SavedDocument } from '../types';
import { NeonInput, NeonSelect, NeonTextArea } from './ui/Input';
import { 
  User, Mail, Phone, FileText, Hash, CheckCircle, Zap, Wrench, Award, ClipboardCheck,
  Camera, Upload, X, FileSignature, Cpu, Send, RefreshCw, DollarSign, MapPin
} from 'lucide-react';

const steps: { id: FormStep; label: string; number: number }[] = [
  { id: 'personal-data', label: 'Dados', number: 1 },
  { id: 'installation', label: 'Instalação', number: 2 },
  { id: 'initial-docs', label: 'Docs Iniciais', number: 3 },
  { id: 'concessionaire-docs', label: 'Concessionária', number: 4 },
  { id: 'projects', label: 'Projeto', number: 5 },
];

interface AttachedFile {
  id: string;
  file: File;
  previewUrl: string | null;
  type: 'image' | 'pdf';
}

type DocState = Record<string, AttachedFile[]>;

// --- Modal de Visualização Compacto ---
interface FilePreviewModalProps {
  file: AttachedFile | null;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  if (!file) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn p-4" onClick={onClose}>
      <div className="relative max-w-3xl max-h-[90vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-gray-300 hover:text-white"><X size={24} /></button>
        {file.type === 'image' && file.previewUrl ? (
          <img src={file.previewUrl} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded border border-neon-900" />
        ) : (
          <div className="bg-dark-900 p-8 rounded border border-neon-900 text-center">
            <FileText size={64} className="text-neon-400 mx-auto mb-4" />
            <p className="text-white mb-4">{file.file.name}</p>
            <a href={file.previewUrl!} target="_blank" rel="noreferrer" className="bg-neon-500 text-black font-bold py-2 px-6 rounded text-sm">Abrir PDF</a>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Card de Upload Compacto ---
interface DocUploadCardProps {
  id: string;
  title: string;
  icon: React.ElementType;
  files: AttachedFile[];
  onUpload: (files: FileList | null) => void;
  onRemove: (fileId: string) => void;
  onPreview: (file: AttachedFile) => void;
  onDownload: (file: AttachedFile) => void;
}

const DocUploadCard: React.FC<DocUploadCardProps> = ({ id, title, icon: Icon, files, onUpload, onRemove, onPreview, onDownload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const camInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-dark-900 border border-gray-800 rounded p-2 flex flex-col h-full hover:border-neon-900 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-neon-400 font-bold text-xs uppercase"><Icon size={14} /> {title}</div>
        <div className="flex gap-1">
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-gray-800 rounded hover:bg-neon-900/50 hover:text-neon-400 transition-colors text-gray-400" title="Upload"><Upload size={14} /></button>
            <button onClick={() => camInputRef.current?.click()} className="p-1.5 bg-gray-800 rounded hover:bg-neon-900/50 hover:text-neon-400 transition-colors text-gray-400" title="Câmera"><Camera size={14} /></button>
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" multiple onChange={(e) => onUpload(e.target.files)} />
      <input type="file" ref={camInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => onUpload(e.target.files)} />

      <div className="flex-1 space-y-1 overflow-y-auto max-h-[100px] custom-scrollbar min-h-[40px]">
        {files.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-700 text-[10px] italic">Vazio</div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-1.5 bg-black rounded border border-gray-800 group">
              <div className="flex items-center gap-2 overflow-hidden cursor-pointer w-full" onClick={() => onPreview(file)}>
                <span className="text-[10px] text-gray-300 truncate font-mono">{file.file.name}</span>
              </div>
              <button onClick={() => onRemove(file.id)} className="text-gray-600 hover:text-red-500"><X size={12} /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Timeline Compacta ---
interface ProjectTimelineProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ currentStatus, onStatusChange }) => {
  const timelineSteps = [
    { id: 'Contrato Assinado', label: 'Contrato', pct: 10, icon: FileSignature },
    { id: 'Engenharia', label: 'Engenharia', pct: 25, icon: Cpu },
    { id: 'Protocolado', label: 'Protocolo', pct: 40, icon: Send },
    { id: 'Aprovado', label: 'Aprovado', pct: 55, icon: CheckCircle },
    { id: 'Em Instalação', label: 'Instalação', pct: 75, icon: Wrench },
    { id: 'Vistoria Solicitada', label: 'Vistoria', pct: 85, icon: ClipboardCheck },
    { id: 'Troca de Medidor', label: 'Medidor', pct: 95, icon: RefreshCw },
    { id: 'Homologado', label: 'Final', pct: 100, icon: Award },
  ];

  const currentIndex = timelineSteps.findIndex(s => s.id === currentStatus) !== -1 
      ? timelineSteps.findIndex(s => s.id === currentStatus) 
      : 0;
  const currentPct = timelineSteps[currentIndex]?.pct || 10;

  return (
    <div className="w-full mb-4 bg-dark-900 border border-gray-800 rounded p-3">
      <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-bold uppercase text-neon-500">Progresso do Projeto</span>
          <span className="text-[10px] font-bold text-white bg-neon-900/50 px-2 py-0.5 rounded">{currentPct}%</span>
      </div>
      <div className="relative h-1 bg-gray-800 rounded-full mb-3">
          <div className="absolute h-full bg-neon-500 rounded-full transition-all duration-500" style={{ width: `${currentPct}%` }}></div>
      </div>
      <div className="flex justify-between w-full relative">
          {timelineSteps.map((step, index) => {
              const Icon = step.icon;
              const isPastOrCurrent = index <= currentIndex;
              return (
                  <div key={step.id} onClick={() => onStatusChange(step.id)} className="flex flex-col items-center group cursor-pointer w-12">
                      <div className={`w-6 h-6 rounded flex items-center justify-center mb-1 transition-all ${index === currentIndex ? 'bg-neon-500 text-black scale-110' : isPastOrCurrent ? 'bg-gray-800 text-neon-500 border border-neon-900' : 'bg-gray-900 text-gray-600'}`}>
                          <Icon size={12} />
                      </div>
                      <span className={`text-[8px] font-bold uppercase text-center leading-tight ${index > currentIndex ? 'text-white' : 'text-gray-500'}`}>{step.label}</span>
                  </div>
              );
          })}
      </div>
    </div>
  );
};

interface ClientRegistrationProps {
  onSave: (client: ClientData) => void;
  initialData?: ClientData | null;
  onCancel?: () => void;
}

export const ClientRegistration: React.FC<ClientRegistrationProps> = ({ onSave, initialData, onCancel }) => {
  const [activeStep, setActiveStep] = useState<FormStep>('personal-data');
  const [loadingCep, setLoadingCep] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [calculatedKw, setCalculatedKw] = useState<string>('');
  const [calculatedKwp, setCalculatedKwp] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialFormState: ClientData = {
    id: '', createdAt: '', fullName: '', status: 'Ativo', docType: 'CPF', docNumber: '', email: '', phone: '', notes: '',
    cep: '', street: '', number: '', neighborhood: '', city: '', state: '', reference: '', concessionaire: '', uc: '',
    installType: '', avgConsumption: '', connectionType: '', voltage: '', breaker: '', latitude: '', longitude: '',
    utmZone: '', utmEasting: '', utmNorthing: '', projectStatus: 'Contrato Assinado', installDate: '', equipmentList: '',
    contractValue: '', projectCost: '', documents: []
  };

  const [formData, setFormData] = useState<ClientData>(initialFormState);
  
  const [docs, setDocs] = useState<DocState>({
    identification: [], energyBill: [], signedContract: [], other: [], art: [], locationMap: [], diagram: [], annex1: [], memorial: [],
    holderDoc: [], powerOfAttorney: [], inverterCert: [], techRespDoc: [], othersConc: []
  });

  const concessionaireOptions = [
    // --- RS (Prioridade) ---
    'RGE Sul', 'CEEE Equatorial', 'Coprel', 'Certel', 'Ceriluz', 'Cerfox', 'Creral', 'Cermissões', 'Certhil',
    'Cooperluz', 'Coopernorte', 'Coopersul', 'Celetro', 'Nova Palma Energia', 'Hidropan', 'Muxfeldt', 'Demei',
    // --- Principais Brasil ---
    'Amazonas Energia', 'Celesc', 'Cemig', 'Coelba', 'Copel', 'Cosern', 'CPFL Paulista', 'CPFL Piratininga',
    'EDP ES', 'EDP SP', 'Elektro', 'Enel CE', 'Enel GO', 'Enel RJ', 'Enel SP', 'Energisa', 'Equatorial AL',
    'Equatorial MA', 'Equatorial PA', 'Equatorial PI', 'Light', 'Neoenergia', 'Roraima Energia', 'Sulgipe'
  ];

  // Helper: Base64 to File for Editing
  const base64ToFile = (dataurl: string, filename: string): File => {
    try {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    } catch (e) {
        return new File([], filename);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      
      // Restaurar arquivos salvos
      if (initialData.documents && initialData.documents.length > 0) {
        const restoredDocs: DocState = { ...docs };
        initialData.documents.forEach(doc => {
           if (!restoredDocs[doc.categoryId]) restoredDocs[doc.categoryId] = [];
           const file = base64ToFile(doc.data, doc.name);
           restoredDocs[doc.categoryId].push({
               id: doc.id,
               file: file,
               previewUrl: URL.createObjectURL(file),
               type: doc.type
           });
        });
        setDocs(restoredDocs);
      }
    } else {
        setFormData({ ...initialFormState, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() });
    }
  }, [initialData]);

  // Cálculos Automáticos
  useEffect(() => {
    const vol = parseInt(formData.voltage.replace(/\D/g, '')) || 0;
    const amp = parseInt(formData.breaker.replace(/\D/g, '')) || 0;
    
    if (vol && amp) {
       // Cálculo Monofásico/Bifásico: (V * A) / 1000
       // Trifásico: (V * A * 1.732) / 1000
       const isTri = formData.connectionType === 'Trifásico';
       const kw = isTri ? (vol * amp * 1.732) / 1000 : (vol * amp) / 1000;
       setCalculatedKw(kw.toFixed(2));
    } else {
        setCalculatedKw('');
    }

    if (formData.avgConsumption) {
        // Est: (Consumo / 30 dias / 4.5h sol * 0.75 eficiencia) -> Simplificado ~ / 101.25
        const cons = parseFloat(formData.avgConsumption);
        setCalculatedKwp((cons / 101.25).toFixed(2));
    } else {
        setCalculatedKwp('');
    }
  }, [formData.voltage, formData.breaker, formData.connectionType, formData.avgConsumption]);

  // Debounce Address Search for Coordinates
  useEffect(() => {
    if (formData.city && formData.street && formData.number && !initialData) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchCoordinates(`${formData.street}, ${formData.number}, ${formData.city}, ${formData.state}`);
        }, 1500);
    }
  }, [formData.street, formData.number, formData.city, formData.state]);


  const formatPhone = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2').substring(0, 15);
  const formatCep = (v: string) => v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
  const formatDoc = (v: string) => {
      const clean = v.replace(/\D/g, '');
      if (clean.length > 11) { // CNPJ
          return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5').substring(0, 18);
      }
      return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4').substring(0, 14);
  };
  const formatMoney = (v: string) => {
      const clean = v.replace(/\D/g, '');
      return (parseInt(clean || '0') / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const performCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
        setLoadingCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await res.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));
                // Tenta buscar coordenada aproximada (Centro da rua)
                fetchCoordinates(`${data.logradouro}, ${data.localidade}, ${data.uf}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCep(false);
            // Focus Number
            const numInput = document.getElementsByName('number')[0] as HTMLElement;
            if (numInput) numInput.focus();
        }
    }
  };

  const fetchCoordinates = async (query: string) => {
      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
              headers: { 'User-Agent': 'SistemaNeon/1.0' }
          });
          const data = await res.json();
          if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
              setFormData(prev => ({
                  ...prev,
                  latitude: lat.toFixed(6),
                  longitude: lon.toFixed(6),
                  ...calcUTM(lat, lon)
              }));
          }
      } catch (e) {
          console.error("Erro geocodificação", e);
      }
  };

  const calcUTM = (lat: number, lon: number) => {
      // Conversão Simplificada WGS84 -> UTM (Apenas para demonstração funcional)
      // Zona = floor((lon + 180) / 6) + 1
      const zone = Math.floor((lon + 180) / 6) + 1;
      // Letra Latitude (C...X)
      const latLetters = "CDEFGHJKLMNPQRSTUVWXX";
      const latIndex = Math.floor((lat + 80) / 8);
      const letter = latLetters[latIndex] || 'S';
      
      // Mock math for Easting/Northing (Full Proj4 logic is too heavy for this snippet, approximating)
      const easting = 500000 + (lon * 10000); // Placeholder logic
      const northing = lat < 0 ? 10000000 + (lat * 10000) : lat * 10000;

      return {
          utmZone: `${zone} ${letter}`,
          utmEasting: `${Math.floor(easting)}.00 m E`,
          utmNorthing: `${Math.floor(northing)}.00 m S`
      };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    
    // Máscaras
    if (name === 'phone') value = formatPhone(value);
    if (name === 'cep') {
        value = formatCep(value);
        if (value.length === 9) performCepSearch(value);
    }
    if (name === 'docNumber') value = formatDoc(value);
    if (name === 'contractValue' || name === 'projectCost') value = formatMoney(value);

    setFormData(prev => ({...prev, [name]: value}));
  };

  const resizeImage = (file: File): Promise<string> => {
      return new Promise((resolve) => {
          if (file.type.includes('pdf')) {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
              return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  let width = img.width;
                  let height = img.height;
                  const MAX = 1024;
                  if (width > height && width > MAX) {
                      height *= MAX / width;
                      width = MAX;
                  } else if (height > MAX) {
                      width *= MAX / height;
                      height = MAX;
                  }
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx?.drawImage(img, 0, 0, width, height);
                  resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress 70%
              };
              img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
      });
  };

  const handleFileUpload = async (category: string, files: FileList | null) => {
      if (!files) return;
      const newFiles: AttachedFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // Validar tamanho (ex: max 10MB antes de processar)
          if (file.size > 10 * 1024 * 1024) {
              alert(`Arquivo ${file.name} muito grande! Máximo 10MB.`);
              continue;
          }
          newFiles.push({
              id: Math.random().toString(36).substr(2, 9),
              file: file,
              previewUrl: URL.createObjectURL(file),
              type: file.type.includes('pdf') ? 'pdf' : 'image'
          });
      }

      setDocs(prev => ({ ...prev, [category]: [...prev[category], ...newFiles] }));
  };

  const removeFile = (category: string, id: string) => {
      setDocs(prev => ({
          ...prev,
          [category]: prev[category].filter(f => f.id !== id)
      }));
  };

  const handlePreview = (file: AttachedFile) => setPreviewFile(file);
  
  const handleDownload = (file: AttachedFile) => {
      const a = document.createElement('a');
      a.href = file.previewUrl!;
      a.download = file.file.name;
      a.click();
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    // Convert docs to Base64 for storage
    const savedDocs: SavedDocument[] = [];
    
    for (const [cat, files] of Object.entries(docs) as [string, AttachedFile[]][]) {
        for (const f of files) {
            const b64 = await resizeImage(f.file);
            savedDocs.push({
                id: f.id,
                categoryId: cat,
                name: f.file.name,
                type: f.type,
                data: b64
            });
        }
    }

    const finalData = { ...formData, documents: savedDocs };
    onSave(finalData);
    setIsSaving(false);
  };

  const getMapSrc = () => {
    if (formData.latitude && formData.longitude) return `https://maps.google.com/maps?q=loc:${formData.latitude},${formData.longitude}&z=18&output=embed`;
    return "";
  };

  return (
    <div className="w-full h-full flex flex-col animate-fadeIn">
      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
        <h2 className="text-lg font-bold text-neon-400 flex items-center gap-2">
          {initialData ? 'Editando' : 'Novo Cliente'}
        </h2>
        
        {/* Compact Steps Nav */}
        <div className="flex gap-1">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all border ${activeStep === step.id ? 'bg-neon-500 text-black border-neon-400' : 'bg-dark-900 text-gray-500 border-gray-800'}`}
            >
              {step.number}. {step.label}
            </button>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={isSaving} className="bg-neon-500 hover:bg-neon-400 text-black font-bold py-1 px-4 rounded text-xs uppercase flex items-center gap-2 disabled:opacity-50">
           {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />} Salvar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        
        {/* STEP 1: DADOS */}
        {activeStep === 'personal-data' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
             <div className="md:col-span-8"><NeonInput label="Nome Completo" name="fullName" icon={User} value={formData.fullName} onChange={handleChange} /></div>
             <div className="md:col-span-4"><NeonSelect label="Status" name="status" options={Object.values(ClientStatus)} value={formData.status} onChange={handleChange} /></div>
             
             <div className="md:col-span-2"><NeonSelect label="Doc" name="docType" options={Object.values(DocType)} value={formData.docType} onChange={handleChange} /></div>
             <div className="md:col-span-4"><NeonInput label="Número" name="docNumber" icon={Hash} value={formData.docNumber} onChange={handleChange} /></div>
             <div className="md:col-span-3"><NeonInput label="Email" name="email" icon={Mail} value={formData.email} onChange={handleChange} /></div>
             <div className="md:col-span-3"><NeonInput label="Telefone" name="phone" icon={Phone} value={formData.phone} onChange={handleChange} /></div>
             
             <div className="md:col-span-12"><NeonTextArea label="Observações" name="notes" className="h-20" value={formData.notes} onChange={handleChange} /></div>
          </div>
        )}

        {/* STEP 2: INSTALAÇÃO (Layout Otimizado: 30% Dados / 70% Mapa) */}
        {activeStep === 'installation' && (
          <div className="grid grid-cols-12 gap-3 h-full">
             {/* Painel Lateral Esquerdo (Compacto) */}
             <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
                 <div className="bg-dark-900/50 p-2 rounded border border-gray-800 space-y-2">
                     <div className="flex gap-2">
                        <NeonInput className="w-2/3" label="CEP" name="cep" value={formData.cep} onChange={handleChange} icon={loadingCep ? RefreshCw : undefined} />
                        <NeonSelect className="w-1/3" label="UF" name="state" options={['RS', 'SC', 'PR', 'SP', 'RJ', 'MG', 'BA', 'GO', 'MT', 'MS', 'DF']} value={formData.state} onChange={handleChange} />
                     </div>
                     <NeonInput label="Endereço" name="street" value={formData.street} onChange={handleChange} />
                     <div className="flex gap-2">
                        <NeonInput className="w-1/3" label="Nº" name="number" value={formData.number} onChange={handleChange} />
                        <NeonInput className="w-2/3" label="Bairro" name="neighborhood" value={formData.neighborhood} onChange={handleChange} />
                     </div>
                     <NeonInput label="Cidade" name="city" value={formData.city} onChange={handleChange} />
                 </div>
                 
                 <div className="bg-dark-900/50 p-2 rounded border border-gray-800 space-y-2">
                     <NeonSelect label="Concessionária" name="concessionaire" options={concessionaireOptions} value={formData.concessionaire} onChange={handleChange} />
                     <div className="flex gap-2">
                        <NeonInput className="w-1/2" label="UC" name="uc" value={formData.uc} onChange={handleChange} />
                        <NeonSelect className="w-1/2" label="Tipo" name="installType" options={['Residencial', 'Comercial', 'Industrial', 'Rural']} value={formData.installType} onChange={handleChange} />
                     </div>
                     <div className="grid grid-cols-3 gap-1">
                        <NeonSelect label="Conexão" name="connectionType" options={['Monofásico', 'Bifásico', 'Trifásico']} value={formData.connectionType} onChange={handleChange} />
                        <NeonSelect label="Tensão" name="voltage" options={['127V', '220V', '380V']} value={formData.voltage} onChange={handleChange} />
                        <NeonSelect label="Disj." name="breaker" options={['30A', '40A', '50A', '63A', '70A', '80A', '100A', '125A', '150A']} value={formData.breaker} onChange={handleChange} />
                     </div>
                     <div className="flex gap-2">
                        <div className="w-1/2 p-1.5 bg-black rounded border border-gray-800 flex flex-col items-end">
                            <span className="text-[9px] text-gray-500 uppercase font-bold">Pot. Disp.</span>
                            <span className="text-neon-400 font-bold text-xs">{calculatedKw || '-'} kW</span>
                        </div>
                        <div className="w-1/2 p-1.5 bg-black rounded border border-gray-800 flex flex-col items-end">
                             <span className="text-[9px] text-gray-500 uppercase font-bold">Sugestão</span>
                             <span className="text-yellow-400 font-bold text-xs">{calculatedKwp || '-'} kWp</span>
                        </div>
                     </div>
                     <NeonInput label="Consumo Médio (kWh)" name="avgConsumption" value={formData.avgConsumption} onChange={handleChange} />
                 </div>
             </div>
             
             {/* Mapa Expandido (Direita) */}
             <div className="col-span-12 lg:col-span-8 flex flex-col h-full bg-black border border-neon-900/30 rounded relative overflow-hidden min-h-[400px]">
                 <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur px-3 py-1 rounded border border-neon-500/50 flex items-center gap-2">
                    <MapPin size={14} className="text-neon-500" /> <span className="text-white text-xs font-bold uppercase">Localização Exata</span>
                 </div>
                 {getMapSrc() ? (
                     <iframe src={getMapSrc()} className="w-full h-full opacity-90 transition-opacity duration-700" style={{ filter: 'invert(90%) hue-rotate(180deg) contrast(90%) grayscale(20%)' }}></iframe>
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-900/20">
                        <p className="text-xs">Preencha o endereço para carregar o mapa</p>
                    </div>
                 )}
                 <div className="absolute bottom-0 w-full bg-black/90 backdrop-blur py-2 px-4 border-t border-gray-800 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                         <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">Coordenadas Geográficas</span>
                         <span className="text-xs font-mono text-neon-400">{formData.latitude || '--'}, {formData.longitude || '--'}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">Coordenadas UTM</span>
                        <span className="text-xs font-mono text-blue-400">
                            {formData.utmZone || '--'} | E: {formData.utmEasting?.replace(' m E', '') || '--'} | N: {formData.utmNorthing?.replace(' m S', '') || '--'}
                        </span>
                    </div>
                 </div>
             </div>
          </div>
        )}

        {/* STEP 3 & 4: DOCS (Compact Grid) */}
        {(activeStep === 'initial-docs' || activeStep === 'concessionaire-docs') && (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activeStep === 'initial-docs' ? (
                  <>
                    <DocUploadCard id="identification" title="Identificação" icon={User} files={docs['identification']} onUpload={(f) => handleFileUpload('identification', f)} onRemove={(id) => removeFile('identification', id)} onPreview={handlePreview} onDownload={handleDownload} />
                    <DocUploadCard id="energyBill" title="Fatura Energia" icon={Zap} files={docs['energyBill']} onUpload={(f) => handleFileUpload('energyBill', f)} onRemove={(id) => removeFile('energyBill', id)} onPreview={handlePreview} onDownload={handleDownload} />
                    <DocUploadCard id="signedContract" title="Contrato Assinado" icon={FileSignature} files={docs['signedContract'] || []} onUpload={(f) => handleFileUpload('signedContract', f)} onRemove={(id) => removeFile('signedContract', id)} onPreview={handlePreview} onDownload={handleDownload} />
                    <DocUploadCard id="other" title="Outros" icon={FileText} files={docs['other']} onUpload={(f) => handleFileUpload('other', f)} onRemove={(id) => removeFile('other', id)} onPreview={handlePreview} onDownload={handleDownload} />
                  </>
              ) : (
                  ['art', 'locationMap', 'diagram', 'annex1', 'memorial', 'holderDoc', 'powerOfAttorney', 'inverterCert'].map(id => (
                      <DocUploadCard key={id} id={id} title={id.toUpperCase()} icon={FileText} files={docs[id] || []} onUpload={(f) => handleFileUpload(id, f)} onRemove={(fid) => removeFile(id, fid)} onPreview={handlePreview} onDownload={handleDownload} />
                  ))
              )}
           </div>
        )}

        {/* STEP 5: PROJETOS */}
        {activeStep === 'projects' && (
           <div className="flex flex-col h-full">
              <ProjectTimeline currentStatus={formData.projectStatus || 'Contrato Assinado'} onStatusChange={(s) => handleChange({target: {name:'projectStatus', value: s}} as any)} />
              
              <div className="grid grid-cols-12 gap-4 flex-1">
                  <div className="col-span-12 md:col-span-4 bg-dark-900 border border-gray-800 rounded p-3">
                      <h4 className="text-neon-400 text-xs font-bold uppercase mb-3 flex items-center gap-2"><DollarSign size={14} /> Financeiro</h4>
                      <div className="space-y-3">
                          <NeonInput label="Valor Contrato" name="contractValue" value={formData.contractValue} onChange={handleChange} className="text-green-400" />
                          <NeonInput label="Custo Projeto" name="projectCost" value={formData.projectCost} onChange={handleChange} />
                          <NeonInput label="Data Instalação" name="installDate" type="date" value={formData.installDate} onChange={handleChange} />
                      </div>
                  </div>
                  <div className="col-span-12 md:col-span-8 bg-dark-900 border border-gray-800 rounded p-3 flex flex-col">
                      <h4 className="text-neon-400 text-xs font-bold uppercase mb-3 flex items-center gap-2"><Wrench size={14} /> Equipamentos</h4>
                      <NeonTextArea label="Lista de Itens" name="equipmentList" value={formData.equipmentList} onChange={handleChange} className="flex-1 h-full" />
                  </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { FormStep, ClientStatus, DocType, ClientData, SavedDocument } from '../types';
import { NeonInput, NeonSelect, NeonTextArea } from './ui/Input';
import { 
  User, Mail, Phone, FileText, Hash, CheckCircle, AlertCircle, 
  Search, Zap, Sun, Globe, Crosshair, Map as MapIcon, Loader2,
  Camera, Upload, File as FileIcon, X, MapPin, FileCheck, Eye, Download, ExternalLink, Save,
  Briefcase, Calendar, DollarSign, PenTool, ClipboardList, Clock, Wrench, Award, ClipboardCheck
} from 'lucide-react';

const steps: { id: FormStep; label: string; number: number }[] = [
  { id: 'personal-data', label: 'Dados Pessoais', number: 1 },
  { id: 'installation', label: 'Instalação', number: 2 },
  { id: 'initial-docs', label: 'Doc. Iniciais', number: 3 },
  { id: 'concessionaire-docs', label: 'Doc. Concessionária', number: 4 },
  { id: 'projects', label: 'Projetos', number: 5 },
];

interface AttachedFile {
  id: string;
  file: File;
  previewUrl: string | null;
  type: 'image' | 'pdf';
}

// Flexible state to hold any document category key
type DocState = Record<string, AttachedFile[]>;

// --- Componente Modal de Visualização ---
interface FilePreviewModalProps {
  file: AttachedFile | null;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        {file.type === 'image' && file.previewUrl ? (
          <img 
            src={file.previewUrl} 
            alt="Preview" 
            className="max-w-full max-h-[80vh] object-contain rounded-lg border border-neon-900 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
          />
        ) : (
          <div className="bg-dark-900 p-10 rounded-lg border border-neon-900 text-center">
            <FileText size={64} className="text-neon-400 mx-auto mb-4" />
            <p className="text-xl text-white mb-2">Visualização de PDF</p>
            <p className="text-gray-400 mb-6">{file.file.name}</p>
            <a 
              href={file.previewUrl!} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-neon-500 hover:bg-neon-400 text-black font-bold py-2 px-6 rounded transition-all"
            >
              <ExternalLink size={18} /> Abrir em nova aba
            </a>
          </div>
        )}
        
        <div className="mt-4 flex gap-4">
           <p className="text-gray-300 font-medium">{file.file.name}</p>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Document Card Component ---
interface DocUploadCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  files: AttachedFile[];
  onUpload: (files: FileList | null) => void;
  onRemove: (fileId: string) => void;
  onPreview: (file: AttachedFile) => void;
  onDownload: (file: AttachedFile) => void;
}

const DocUploadCard: React.FC<DocUploadCardProps> = ({ 
  id, title, subtitle, icon: Icon, files, onUpload, onRemove, onPreview, onDownload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const camInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-dark-900/50 border border-neon-900/50 rounded-lg p-4 flex flex-col h-full shadow-lg hover:border-neon-500/50 transition-colors animate-fadeIn">
      <div className="flex items-center gap-2 mb-2 text-neon-400 font-bold text-sm">
        <Icon size={16} /> {title}
      </div>
      <p className="text-xs text-gray-500 mb-4 h-8">{subtitle}</p>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-3 bg-dark-950 border border-gray-700 rounded hover:border-neon-500 hover:text-neon-400 transition-all group">
            <Upload size={20} className="mb-1 text-gray-400 group-hover:text-neon-400" />
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-neon-400">Upload</span>
          </button>
          <button type="button" onClick={() => camInputRef.current?.click()} className="flex flex-col items-center justify-center p-3 bg-dark-950 border border-gray-700 rounded hover:border-neon-500 hover:text-neon-400 transition-all group">
            <Camera size={20} className="mb-1 text-gray-400 group-hover:text-neon-400" />
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-neon-400">Câmera</span>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" multiple onChange={(e) => onUpload(e.target.files)} />
          <input type="file" ref={camInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => onUpload(e.target.files)} />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto max-h-[150px] custom-scrollbar pr-1 min-h-[60px]">
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-700 text-xs italic py-2 border border-dashed border-gray-800 rounded">Nenhum arquivo</div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-2 bg-dark-950 border border-gray-800 rounded group hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-2 overflow-hidden cursor-pointer" onClick={() => onPreview(file)}>
                {file.type === 'image' && file.previewUrl ? <img src={file.previewUrl} alt="Preview" className="w-8 h-8 object-cover rounded border border-gray-700" /> : <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded text-red-400"><FileIcon size={16} /></div>}
                <span className="text-xs text-gray-300 truncate max-w-[80px] hover:text-neon-400 transition-colors" title={file.file.name}>{file.file.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onPreview(file)} className="text-gray-500 hover:text-neon-400 transition-colors p-1" title="Visualizar"><Eye size={14} /></button>
                <button onClick={() => onDownload(file)} className="text-gray-500 hover:text-blue-400 transition-colors p-1" title="Baixar"><Download size={14} /></button>
                <button onClick={() => onRemove(file.id)} className="text-gray-500 hover:text-red-500 transition-colors p-1" title="Remover"><X size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Timeline Component ---
interface ProjectTimelineProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ currentStatus, onStatusChange }) => {
  const timelineSteps = [
    { id: 'Em Análise', label: 'Análise', icon: Search },
    { id: 'Aprovado', label: 'Aprovado', icon: CheckCircle },
    { id: 'Em Instalação', label: 'Instalação', icon: Wrench },
    { id: 'Vistoria Solicitada', label: 'Vistoria', icon: ClipboardCheck },
    { id: 'Finalizado', label: 'Finalizado', icon: Award },
  ];

  const getCurrentIndex = () => {
    const idx = timelineSteps.findIndex(s => s.id === currentStatus);
    return idx === -1 ? 0 : idx;
  };

  const currentIndex = getCurrentIndex();

  return (
    <div className="w-full py-6 px-2 mb-6">
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-800 rounded-full -z-10"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-neon-500 rounded-full -z-10 transition-all duration-500 ease-out shadow-neon"
          style={{ width: `${(currentIndex / (timelineSteps.length - 1)) * 100}%` }}
        ></div>

        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center group cursor-pointer" onClick={() => onStatusChange(step.id)}>
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative
                  ${isCurrent 
                    ? 'bg-black border-neon-500 text-neon-500 shadow-neon scale-110' 
                    : isCompleted 
                      ? 'bg-neon-500 border-neon-500 text-black shadow-neon' 
                      : 'bg-dark-900 border-gray-700 text-gray-600 hover:border-gray-500'}
                `}
              >
                <Icon size={isCurrent ? 20 : 16} />
                {isCurrent && (
                  <span className="absolute w-full h-full rounded-full border border-neon-500 animate-ping opacity-75"></span>
                )}
              </div>
              <span 
                className={`
                  mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300
                  ${isCompleted ? 'text-neon-400' : 'text-gray-600'}
                  ${isCurrent ? 'scale-110' : ''}
                `}
              >
                {step.label}
              </span>
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
  const [loadingCoords, setLoadingCoords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // State for calculated fields
  const [calculatedKw, setCalculatedKw] = useState<string>('');
  const [calculatedKwp, setCalculatedKwp] = useState<string>('');
  
  // State for File Preview
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);

  const initialFormState: ClientData = {
    id: '',
    createdAt: '',
    fullName: '',
    status: '',
    docType: '',
    docNumber: '',
    email: '',
    phone: '',
    notes: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    reference: '',
    concessionaire: '',
    uc: '',
    installType: '',
    avgConsumption: '',
    connectionType: '',
    voltage: '',
    breaker: '',
    latitude: '',
    longitude: '',
    utmZone: '',
    utmEasting: '',
    utmNorthing: '',
    // Step 5 fields
    projectStatus: 'Em Análise',
    installDate: '',
    equipmentList: '',
    contractValue: '',
    projectCost: '',
    documents: []
  };

  const [formData, setFormData] = useState<ClientData>(initialFormState);
  
  // Documents State (Flexible Record)
  const [docs, setDocs] = useState<DocState>({
    identification: [],
    energyBill: [],
    other: [],
    art: [],
    locationMap: [],
    diagram: [],
    annex1: [],
    memorial: [],
    holderDoc: [],
    powerOfAttorney: [],
    inverterCert: [],
    techRespDoc: [],
    othersConc: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lista Completa de Concessionárias (RS First)
  const concessionaireOptions = [
    // --- Rio Grande do Sul (Prioridade) ---
    'RGE Sul',
    'CEEE Equatorial',
    'Coprel',
    'Certel',
    'Ceriluz',
    'Cerfox',
    'Creral',
    'Certaja',
    'Castro Dis',
    'Hidropan',
    'Muxfeldt',
    'Nova Palma',
    'Eletrocar',
    'Demei',
    // --- Outras Nacionais ---
    'Amazonas Energia',
    'Celesc',
    'Cemig',
    'Coelba (Neoenergia)',
    'Copel',
    'Cosern (Neoenergia)',
    'CPFL Paulista',
    'CPFL Piratininga',
    'CPFL Santa Cruz',
    'EDP Espírito Santo',
    'EDP São Paulo',
    'Elektro (Neoenergia)',
    'Enel Ceará',
    'Enel Goiás',
    'Enel Rio',
    'Enel São Paulo',
    'Energisa (Diversos Estados)',
    'Energisa Mato Grosso',
    'Energisa Mato Grosso do Sul',
    'Energisa Paraíba',
    'Energisa Sergipe',
    'Energisa Tocantins',
    'Equatorial Alagoas',
    'Equatorial Maranhão',
    'Equatorial Pará',
    'Equatorial Piauí',
    'Light',
    'Neoenergia Brasília',
    'Neoenergia Pernambuco',
    'Roraima Energia',
    'Sulgipe'
  ];

  // Helper: Convert Base64 to File object to restore visuals
  const base64ToFile = (dataurl: string, filename: string): File => {
    try {
        const arr = dataurl.split(',');
        if (arr.length < 2) return new File([], filename);
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    } catch (e) {
        console.error("Error converting base64", e);
        return new File([], filename);
    }
  };

  // Load initial data if editing, including reconstructing documents
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      
      // Reconstruct docs state from saved documents
      if (initialData.documents && initialData.documents.length > 0) {
        const restoredDocs: DocState = {};
        
        initialData.documents.forEach(savedDoc => {
           if (!restoredDocs[savedDoc.categoryId]) {
               restoredDocs[savedDoc.categoryId] = [];
           }
           // Convert back to File/Blob for preview
           const fileObj = base64ToFile(savedDoc.data, savedDoc.name);
           const attachedFile: AttachedFile = {
               id: savedDoc.id,
               file: fileObj,
               previewUrl: URL.createObjectURL(fileObj),
               type: savedDoc.type
           };
           restoredDocs[savedDoc.categoryId].push(attachedFile);
        });

        setDocs(prev => ({ ...prev, ...restoredDocs }));
      }
    } else {
      setFormData(initialFormState);
      setDocs({});
    }
  }, [initialData]);

  // --- Automatic Calculation of Power ---
  useEffect(() => {
    const calculateTechnicalData = () => {
      const vol = parseInt(formData.voltage.replace(/\D/g, ''));
      const amp = parseInt(formData.breaker.replace(/\D/g, ''));
      const type = formData.connectionType;
      
      if (!isNaN(vol) && !isNaN(amp) && type) {
        let kw = 0;
        if (type === 'Trifásico') {
           kw = (vol * amp * Math.sqrt(3)) / 1000;
        } else {
           kw = (vol * amp) / 1000;
        }
        setCalculatedKw(kw.toFixed(2));
      } else {
        setCalculatedKw('');
      }

      const consumption = parseFloat(formData.avgConsumption);
      if (!isNaN(consumption) && consumption > 0) {
        const kwp = consumption / 101.25;
        setCalculatedKwp(kwp.toFixed(2));
      } else {
        setCalculatedKwp('');
      }
    };
    
    calculateTechnicalData();
  }, [formData.voltage, formData.breaker, formData.connectionType, formData.avgConsumption]);

  // --- Automatic Geocoding Effect ---
  useEffect(() => {
    if (initialData && formData.street === initialData.street && formData.number === initialData.number) return;
    if (!formData.street && !formData.city) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const queryParts = [];
      if (formData.street) queryParts.push(formData.street);
      if (formData.number) queryParts.push(formData.number);
      if (formData.neighborhood) queryParts.push(formData.neighborhood);
      if (formData.city) queryParts.push(formData.city);
      if (formData.state) queryParts.push(formData.state);
      queryParts.push("Brasil");

      if (queryParts.length > 2) {
          const fullQuery = queryParts.join(', ');
          fetchCoordinates(fullQuery);
      }
    }, 1000);

    return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.street, formData.number, formData.neighborhood, formData.city, formData.state]);


  // --- Utility Functions for Coordinates ---
  const toRadians = (deg: number) => deg * Math.PI / 180;
  const getUTMLatitudeBand = (lat: number): string => {
    if ((84 >= lat) && (lat >= 72)) return 'X';
    else if ((72 > lat) && (lat >= 64)) return 'W';
    else if ((64 > lat) && (lat >= 56)) return 'V';
    // ... Simplified ranges for brevity, assumes standard
    else if ((-72 > lat) && (lat >= -80)) return 'C';
    else return 'J'; // Default fallback for Brazil mostly
  };

  const latLonToUTM = (lat: number, lon: number) => {
    if (isNaN(lat) || isNaN(lon)) return { zone: '', easting: '', northing: '' };

    const a = 6378137;
    const eccSquared = 0.00669438;
    const k0 = 0.9996;
    const zoneNumber = Math.floor((lon + 180) / 6) + 1;
    const zoneCentralMeridian = (zoneNumber - 1) * 6 - 180 + 3;
    const zoneCentralMeridianRad = toRadians(zoneCentralMeridian);
    const latRad = toRadians(lat);
    const lonRad = toRadians(lon);

    const n = a / Math.sqrt(1 - eccSquared * Math.sin(latRad) * Math.sin(latRad));
    const t = Math.tan(latRad) * Math.tan(latRad);
    const c = (eccSquared / (1 - eccSquared)) * Math.cos(latRad) * Math.cos(latRad);
    const A = Math.cos(latRad) * (lonRad - zoneCentralMeridianRad);
    const M = a * ((1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256) * latRad
      - (3 * eccSquared / 8 + 3 * eccSquared * eccSquared / 32 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(2 * latRad)
      + (15 * eccSquared * eccSquared / 256 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(4 * latRad)
      - (35 * eccSquared * eccSquared * eccSquared / 3072) * Math.sin(6 * latRad));
    const easting = k0 * n * (A + (1 - t + c) * A * A * A / 6 + (5 - 18 * t + t * t + 72 * c - 58 * eccSquared) * A * A * A * A * A / 120) + 500000;
    let northing = k0 * (M + n * Math.tan(latRad) * (A * A / 2 + (5 - t + 9 * c + 4 * c * c) * A * A * A * A / 24 + (61 - 58 * t + t * t + 600 * c - 330 * eccSquared) * A * A * A * A * A * A / 720));
    if (lat < 0) { northing += 10000000; }
    const zoneLetter = getUTMLatitudeBand(lat);
    return { zone: `${zoneNumber} ${zoneLetter}`, easting: easting.toFixed(2), northing: northing.toFixed(2) };
  };

  const handleCoordinateChange = (lat: string, lng: string) => {
    const cleanLat = lat.replace(',', '.');
    const cleanLng = lng.replace(',', '.');
    const latNum = parseFloat(cleanLat);
    const lngNum = parseFloat(cleanLng);

    if (!isNaN(latNum) && !isNaN(lngNum)) {
      const utm = latLonToUTM(latNum, lngNum);
      setFormData(prev => ({
        ...prev,
        latitude: cleanLat,
        longitude: cleanLng,
        utmZone: utm.zone,
        utmEasting: utm.easting,
        utmNorthing: utm.northing
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        latitude: cleanLat,
        longitude: cleanLng
      }));
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLoadingCoords(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          handleCoordinateChange(lat, lng);
          setLoadingCoords(false);
        },
        (error) => {
          alert("Erro ao obter localização: " + error.message);
          setLoadingCoords(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocalização não suportada neste navegador.");
    }
  };

  // --- Input Formatting ---
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 11) return value.slice(0, 15);
    if (numbers.length <= 10) return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatCPF = (value: string) => value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const formatCNPJ = (value: string) => value.replace(/\D/g, '').slice(0, 14).replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const formatCEP = (value: string) => value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
  const formatRG = (value: string) => value.replace(/\D/g, '').slice(0, 9);
  
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers || '0', 10) / 100;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const performCepSearch = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setLoadingCep(true);
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (data.erro) {
            alert("CEP não encontrado.");
            setLoadingCep(false);
            return;
        }
        setFormData(prev => ({ 
            ...prev, 
            street: data.logradouro || '', 
            neighborhood: data.bairro || '', 
            city: data.localidade || '', 
            state: data.uf || '',
            latitude: '', longitude: '', utmZone: '', utmEasting: '', utmNorthing: ''
        }));
        setTimeout(() => {
            const numberInput = document.querySelector('input[name="number"]') as HTMLInputElement;
            if (numberInput) numberInput.focus();
        }, 100);
    } catch (error) {
        console.error("Error fetching CEP:", error);
    } finally {
        setLoadingCep(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'phone') formattedValue = formatPhone(value);
    else if (name === 'cep') formattedValue = formatCEP(value);
    else if (name === 'docNumber') {
      if (formData.docType === DocType.CPF) formattedValue = formatCPF(value);
      else if (formData.docType === DocType.CNPJ) formattedValue = formatCNPJ(value);
      else if (formData.docType === DocType.RG) formattedValue = formatRG(value);
    }
    else if (name === 'contractValue' || name === 'projectCost') {
        formattedValue = formatCurrency(value);
    }

    if (name === 'latitude') { handleCoordinateChange(value, formData.longitude); return; }
    if (name === 'longitude') { handleCoordinateChange(formData.latitude, value); return; }

    if (name === 'cep') {
        const cleanCep = formattedValue.replace(/\D/g, '');
        if (cleanCep.length === 8) performCepSearch(cleanCep);
    }

    const addressFields = ['street', 'number', 'neighborhood', 'city', 'state'];
    if (addressFields.includes(name)) {
        setFormData(prev => ({ 
            ...prev, 
            [name]: formattedValue,
            latitude: '', longitude: '', utmZone: '', utmEasting: '', utmNorthing: ''
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const fetchCoordinates = async (addressQuery: string) => {
      try {
        setLoadingCoords(true);
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`, {
            headers: { 'User-Agent': 'SistemaDeGestaoNeon/1.0' }
        });
        const geoData = await geoResponse.json();
        if (geoData && geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat).toFixed(6);
            const lng = parseFloat(geoData[0].lon).toFixed(6);
            handleCoordinateChange(lat, lng);
            return true;
        }
        return false;
      } catch (error) {
        console.warn("Error fetching coordinates:", error);
        return false;
      } finally {
        setLoadingCoords(false);
      }
  };

  // --- Image Compression Helper ---
  const compressImage = async (file: File): Promise<Blob> => {
    if (!file.type.startsWith('image/')) return file;
    
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024; // Limit width to 1024px
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with 0.7 quality
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else resolve(file);
            }, 'image/jpeg', 0.7);
        };
        img.onerror = () => resolve(file);
    });
  };

  // --- File Upload Logic ---
  const handleFileUpload = async (category: string, files: FileList | null) => {
    if (!files) return;
    
    // Process files one by one with compression
    const processedFiles: AttachedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let finalFile = file;

        // Compress if it's an image
        if (file.type.startsWith('image/')) {
            const compressedBlob = await compressImage(file);
            finalFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
        }

        processedFiles.push({
            id: Math.random().toString(36).substr(2, 9),
            file: finalFile,
            previewUrl: URL.createObjectURL(finalFile),
            type: file.type.startsWith('image/') ? 'image' : 'pdf'
        });
    }

    setDocs(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), ...processedFiles]
    }));
  };

  const removeFile = (category: string, fileId: string) => {
    setDocs(prev => {
      const fileToRemove = prev[category]?.find(f => f.id === fileId);
      // Clean up the object URL to avoid memory leaks
      if (fileToRemove?.previewUrl) URL.revokeObjectURL(fileToRemove.previewUrl);
      
      return {
        ...prev,
        [category]: prev[category].filter(f => f.id !== fileId)
      };
    });
  };

  const handlePreview = (file: AttachedFile) => {
    if (file.type === 'pdf') {
       if (file.previewUrl) window.open(file.previewUrl, '_blank');
    } else {
       setPreviewFile(file);
    }
  };

  const handleDownload = (file: AttachedFile) => {
     if (!file.previewUrl) return;
     const link = document.createElement('a');
     link.href = file.previewUrl;
     link.download = file.file.name;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  // --- File to Base64 Converter ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Campo obrigatório';
    if (!formData.status) newErrors.status = 'Selecione um status';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveStep('personal-data'); // Jump to first step to show errors
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
       setIsSaving(true);
       try {
           // Convert all current docs to SavedDocument format (Base64)
           const savedDocs: SavedDocument[] = [];
           
           for (const category of Object.keys(docs)) {
               for (const file of docs[category]) {
                   const base64Data = await fileToBase64(file.file);
                   savedDocs.push({
                       id: file.id,
                       categoryId: category,
                       name: file.file.name,
                       type: file.type,
                       data: base64Data
                   });
               }
           }

           const clientToSave = {
             ...formData,
             id: formData.id || Math.random().toString(36).substr(2, 9),
             createdAt: formData.createdAt || new Date().toISOString(),
             documents: savedDocs
           };
           
           onSave(clientToSave);
       } catch (error) {
           console.error("Error saving client files", error);
           alert("Erro ao salvar arquivos. Tente novamente.");
       } finally {
           setIsSaving(false);
       }
    }
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    } else {
      // Last Step - Save
      handleSubmit();
    }
  };

  const getMapSrc = () => {
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (!isNaN(lat) && !isNaN(lng) && formData.latitude !== '') {
      return `https://maps.google.com/maps?q=loc:${lat},${lng}&z=18&output=embed`;
    }
    if (formData.street && formData.city) {
      const parts = [formData.street, formData.number, formData.neighborhood, formData.city, formData.state].filter(p => p).join(', ');
      return `https://maps.google.com/maps?q=${encodeURIComponent(parts)}&z=18&output=embed`;
    }
    return "";
  };

  const mapSrc = getMapSrc();

  // --- Configurations for Steps ---
  
  // Step 4: Concessionaire Documents Config
  const concessionaireDocs = [
    { id: 'art', label: '1. ART / TRT', sub: 'ART ou TRT de Obra/Serviço (Assinado)', icon: FileCheck },
    { id: 'locationMap', label: '2. Localização', sub: 'Mapa/Croqui de localização', icon: MapPin },
    { id: 'diagram', label: '3. Diagrama', sub: 'Diagrama Unifilar do sistema', icon: Zap },
    { id: 'annex1', label: '4. Anexo I', sub: 'Formulário de Solicitação de Acesso', icon: FileText },
    { id: 'memorial', label: '5. Memorial', sub: 'Memorial Técnico Descritivo', icon: FileText },
    { id: 'holderDoc', label: '6. Doc. Titular', sub: 'Documento oficial do titular da UC', icon: User },
    { id: 'powerOfAttorney', label: '7. Procuração', sub: 'Procuração Autenticada (se aplicável)', icon: FileText },
    { id: 'inverterCert', label: '8. Cert. Inversor', sub: 'Certificado de conformidade do inversor', icon: CheckCircle },
    { id: 'techRespDoc', label: '9. Doc. Resp. Téc.', sub: 'Documento do Responsável Técnico', icon: User },
    { id: 'othersConc', label: '10. Outros', sub: 'Outros documentos solicitados', icon: FileIcon },
  ];

  return (
    <div className="w-full h-full flex flex-col animate-fadeIn relative">
      {/* File Preview Modal */}
      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-neon-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)] flex items-center gap-2">
          {initialData ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
        </h2>
        {initialData && (
          <button onClick={onCancel} className="text-gray-500 hover:text-white text-xs underline">
             Cancelar Edição
          </button>
        )}
      </div>

      {/* Steps Navigation */}
      <div className="flex flex-wrap gap-2 mb-4 p-1">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`
              flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border relative overflow-hidden group
              ${activeStep === step.id 
                ? 'bg-neon-500 text-black border-neon-400 shadow-neon' 
                : 'bg-transparent text-gray-400 border-gray-800 hover:border-neon-900 hover:text-neon-400'}
            `}
          >
            <span className={`mr-1.5 flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${activeStep === step.id ? 'bg-black text-neon-500' : 'bg-gray-800'}`}>
              {step.number}
            </span>
            {step.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="border-t border-neon-500/30 pt-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
        <h3 className="text-lg font-bold text-neon-400 mb-6 flex items-center gap-2">
          {steps.find(s => s.id === activeStep)?.number}. {steps.find(s => s.id === activeStep)?.label}
        </h3>

        {/* STEP 1: PERSONAL DATA */}
        {activeStep === 'personal-data' && (
          <form className="space-y-4">
            <div className="w-full">
              <NeonInput label="Nome Completo" name="fullName" icon={User} placeholder="Digite o nome completo" value={formData.fullName} onChange={handleChange} error={errors.fullName} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NeonSelect label="Status do Cliente" name="status" icon={CheckCircle} options={Object.values(ClientStatus)} value={formData.status} onChange={handleChange} />
              <NeonSelect label="Tipo de Documento" name="docType" icon={FileText} options={Object.values(DocType)} value={formData.docType} onChange={handleChange} />
               <NeonInput label="Número do Documento" name="docNumber" icon={Hash} placeholder={formData.docType === 'CPF' ? '000.000.000-00' : formData.docType === 'CNPJ' ? '00.000.000/0000-00' : 'Digite o número'} value={formData.docNumber} onChange={handleChange} disabled={!formData.docType} error={errors.docNumber} maxLength={formData.docType === 'CPF' ? 14 : formData.docType === 'CNPJ' ? 18 : 20} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeonInput label="E-mail" name="email" type="email" icon={Mail} placeholder="email@exemplo.com" value={formData.email} onChange={handleChange} error={errors.email} />
              <NeonInput label="Telefone" name="phone" type="tel" icon={Phone} placeholder="(00) 00000-0000" value={formData.phone} onChange={handleChange} maxLength={15} />
            </div>
            <div className="w-full">
              <NeonTextArea label="Observações" name="notes" placeholder="Observações gerais sobre o cliente" value={formData.notes} onChange={handleChange} />
            </div>
          </form>
        )}

        {/* STEP 2: INSTALLATION */}
        {activeStep === 'installation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-3 flex items-end gap-2">
                    <div className="flex-1"><NeonInput label="CEP" name="cep" placeholder="00000-000" value={formData.cep} onChange={handleChange} maxLength={9} /></div>
                    <button type="button" onClick={() => performCepSearch(formData.cep)} disabled={loadingCep} className={`mb-0.5 bg-neon-500 hover:bg-neon-400 text-black font-bold h-[42px] w-[42px] rounded-lg shadow-neon transition-all flex items-center justify-center ${loadingCep ? 'opacity-70 cursor-wait' : ''}`} title="Buscar CEP">
                        {loadingCep ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} 
                    </button>
                </div>
                <div className="col-span-12 md:col-span-7"><NeonInput label="Endereço" name="street" placeholder="Nome da rua/avenida" value={formData.street} onChange={handleChange} /></div>
                <div className="col-span-12 md:col-span-2"><NeonInput label="Número" name="number" placeholder="Nº" value={formData.number} onChange={handleChange} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                 <div className="col-span-12 md:col-span-4"><NeonInput label="Bairro" name="neighborhood" placeholder="Bairro" value={formData.neighborhood} onChange={handleChange} /></div>
                 <div className="col-span-12 md:col-span-5"><NeonInput label="Cidade" name="city" placeholder="Cidade" value={formData.city} onChange={handleChange} /></div>
                 <div className="col-span-12 md:col-span-3"><NeonSelect label="Estado" name="state" options={['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'ES', 'BA', 'PE', 'CE', 'GO', 'DF']} value={formData.state} onChange={handleChange} /></div>
            </div>
             <div className="w-full"><NeonInput label="Ponto de Referência (Opcional)" name="reference" placeholder="Ex: Próximo ao supermercado, em frente à praça..." value={formData.reference} onChange={handleChange} /></div>
            <div className="h-px bg-gradient-to-r from-transparent via-neon-900 to-transparent my-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <NeonSelect label="Concessionária" name="concessionaire" options={concessionaireOptions} value={formData.concessionaire} onChange={handleChange} />
                 <NeonInput label="UC" name="uc" placeholder="Unidade Consumidora" value={formData.uc} onChange={handleChange} />
                 <NeonSelect label="Tipo de Instalação" name="installType" options={['Residencial', 'Comercial', 'Industrial', 'Rural']} value={formData.installType} onChange={handleChange} />
                 <NeonInput label="Cons. Med. Mensal (kWh)" name="avgConsumption" type="number" placeholder="0" value={formData.avgConsumption} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <NeonSelect label="Conexão" name="connectionType" options={['Monofásico', 'Bifásico', 'Trifásico']} value={formData.connectionType} onChange={handleChange} />
                 <NeonSelect label="Tensão" name="voltage" options={['127V', '220V', '380V']} value={formData.voltage} onChange={handleChange} />
                 <NeonSelect label="Disjuntor" name="breaker" options={['40A', '50A', '63A', '80A', '100A', '125A', '150A']} value={formData.breaker} onChange={handleChange} />
                <div className="flex flex-col">
                    <label className="text-neon-400 text-xs font-bold mb-1.5 ml-1 flex items-center gap-1.5">Pot. Disp. (kW) <Zap size={12} className="text-yellow-400" /></label>
                    <div className={`w-full bg-dark-900/50 text-sm rounded-lg py-2.5 px-3 border border-neon-900/30 cursor-not-allowed ${calculatedKw ? 'text-neon-400 font-bold' : 'text-gray-400'}`}>{calculatedKw ? `${calculatedKw} kW` : 'Auto-calculado'}</div>
                </div>
                 <div className="flex flex-col">
                    <label className="text-neon-400 text-xs font-bold mb-1.5 ml-1 flex items-center gap-1.5">Pot. Nesc. Inst. (kWp) <Sun size={12} className="text-yellow-400" /></label>
                    <div className={`w-full bg-dark-900/50 text-sm rounded-lg py-2.5 px-3 border border-neon-900/30 cursor-not-allowed ${calculatedKwp ? 'text-neon-400 font-bold' : 'text-gray-400'}`}>{calculatedKwp ? `${calculatedKwp} kWp` : 'Auto-calculado'}</div>
                </div>
            </div>
            <div className="border border-neon-900/50 rounded-lg p-3 mt-4 bg-dark-900/20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-9 h-[320px] bg-black border border-gray-800 rounded-lg relative overflow-hidden group">
                        {mapSrc ? (
                          <iframe width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src={mapSrc} className="w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-500" style={{ filter: 'invert(90%) hue-rotate(180deg) contrast(90%)' }}></iframe>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-900/20 to-transparent opacity-50"></div>
                            <MapIcon size={48} className="text-neon-900 mb-2" /><span className="text-gray-500 text-sm font-medium z-10">Mapa Indisponível</span>
                          </div>
                        )}
                        {loadingCoords && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm"><Loader2 className="text-neon-500 animate-spin" size={32} /></div>}
                    </div>
                    <div className="lg:col-span-3 flex flex-col gap-3 h-[320px] overflow-y-auto custom-scrollbar pr-1">
                         <div className="flex justify-between items-center pb-2 border-b border-gray-800 shrink-0">
                             <h4 className="text-neon-400 font-bold flex items-center gap-2 text-xs"><MapPin size={14} /> Localização</h4>
                             <button type="button" onClick={handleGetLocation} disabled={loadingCoords} className="text-[10px] bg-dark-950 border border-neon-900 text-neon-400 hover:bg-neon-900/30 px-2 py-1 rounded flex items-center gap-1 transition-colors">{loadingCoords ? <Loader2 size={10} className="animate-spin" /> : <Crosshair size={10} />} GPS</button>
                         </div>
                         <div className="flex flex-col gap-1">
                            <label className="text-gray-400 text-[10px] font-bold flex items-center gap-1"><Globe size={10} className="text-blue-400"/> Latitude</label>
                            <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="-00.000000" className="w-full bg-dark-950 border border-gray-800 rounded px-2 py-1.5 text-xs text-gray-200 focus:border-neon-500 outline-none" />
                         </div>
                         <div className="flex flex-col gap-1">
                            <label className="text-gray-400 text-[10px] font-bold flex items-center gap-1"><Globe size={10} className="text-blue-400"/> Longitude</label>
                            <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="-00.000000" className="w-full bg-dark-950 border border-gray-800 rounded px-2 py-1.5 text-xs text-gray-200 focus:border-neon-500 outline-none" />
                         </div>
                        <div className="h-px bg-gray-800 my-1"></div>
                        <div className="flex flex-col gap-2">
                            <label className="text-neon-500 text-[10px] font-bold uppercase">Coordenadas UTM</label>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-gray-500 text-[10px] font-bold">Zone:</label>
                                <input readOnly value={formData.utmZone || ''} className="w-full bg-dark-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 focus:border-neon-500 outline-none shadow-inner" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-gray-500 text-[10px] font-bold">Longitude UTM:</label>
                                <input readOnly value={formData.utmEasting ? `${formData.utmEasting} m E` : ''} className="w-full bg-dark-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 focus:border-neon-500 outline-none shadow-inner" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-gray-500 text-[10px] font-bold">Latitude UTM:</label>
                                <input readOnly value={formData.utmNorthing ? `${formData.utmNorthing} m S` : ''} className="w-full bg-dark-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 focus:border-neon-500 outline-none shadow-inner" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* STEP 3: INITIAL DOCS */}
        {activeStep === 'initial-docs' && (
          <div className="space-y-6">
            <p className="text-gray-400 text-sm mb-4">
              Anexe fotos legíveis ou arquivos PDF dos documentos solicitados. Você pode tirar uma foto agora ou enviar da galeria.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <DocUploadCard id="identification" title="1. Doc. Identificação" subtitle="RG ou CNH (Frente e Verso)" icon={User} files={docs['identification'] || []} onUpload={(f) => handleFileUpload('identification', f)} onRemove={(id) => removeFile('identification', id)} onPreview={handlePreview} onDownload={handleDownload} />
               <DocUploadCard id="energyBill" title="2. Fatura de Energia" subtitle="Fatura recente (últimos 3 meses)" icon={Zap} files={docs['energyBill'] || []} onUpload={(f) => handleFileUpload('energyBill', f)} onRemove={(id) => removeFile('energyBill', id)} onPreview={handlePreview} onDownload={handleDownload} />
               <DocUploadCard id="other" title="3. Outros Documentos" subtitle="Outros arquivos relevantes" icon={FileText} files={docs['other'] || []} onUpload={(f) => handleFileUpload('other', f)} onRemove={(id) => removeFile('other', id)} onPreview={handlePreview} onDownload={handleDownload} />
            </div>
          </div>
        )}

        {/* STEP 4: CONCESSIONAIRE DOCS */}
        {activeStep === 'concessionaire-docs' && (
          <div className="space-y-6">
            <p className="text-gray-400 text-sm mb-4">
              Anexe os documentos técnicos e legais necessários para homologação junto à concessionária.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {concessionaireDocs.map((doc) => (
                <DocUploadCard 
                  key={doc.id}
                  id={doc.id}
                  title={doc.label}
                  subtitle={doc.sub}
                  icon={doc.icon}
                  files={docs[doc.id] || []}
                  onUpload={(f) => handleFileUpload(doc.id, f)}
                  onRemove={(fileId) => removeFile(doc.id, fileId)}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: PROJECTS (Updated) */}
        {activeStep === 'projects' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Project Timeline Component */}
            <ProjectTimeline 
              currentStatus={formData.projectStatus || 'Em Análise'} 
              onStatusChange={(newStatus) => setFormData(prev => ({ ...prev, projectStatus: newStatus }))} 
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NeonSelect 
                label="Status do Projeto" 
                name="projectStatus" 
                icon={Briefcase} 
                options={['Em Análise', 'Aprovado', 'Em Instalação', 'Vistoria Solicitada', 'Finalizado']} 
                value={formData.projectStatus || ''} 
                onChange={handleChange} 
              />
              <div className="flex flex-col">
                <label className="text-neon-400 text-xs font-bold mb-1.5 ml-1 flex items-center gap-1.5">
                  Data de Instalação Prevista
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-neon-500 transition-colors">
                    <Calendar size={16} />
                  </div>
                  <input 
                    type="date"
                    name="installDate"
                    className="w-full bg-dark-900 text-gray-200 text-sm rounded-lg py-2.5 pl-9 pr-3 border border-neon-900 focus:border-neon-500 focus:shadow-neon transition-all outline-none"
                    value={formData.installDate || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <div className="bg-dark-900/30 border border-gray-800 rounded-lg p-3 w-full text-xs text-gray-400 italic">
                  * Preencha os valores abaixo para alimentar o Controle Financeiro.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-neon-900/30 bg-dark-900/20">
                <h4 className="text-neon-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <DollarSign size={16} /> Financeiro do Projeto
                </h4>
                <div className="space-y-4">
                  <NeonInput 
                    label="Valor do Contrato (Receita)" 
                    name="contractValue" 
                    icon={DollarSign} 
                    placeholder="R$ 0,00" 
                    value={formData.contractValue || ''} 
                    onChange={handleChange} 
                    className="text-green-400"
                  />
                  <NeonInput 
                    label="Custo Estimado (Despesa)" 
                    name="projectCost" 
                    icon={DollarSign} 
                    placeholder="R$ 0,00" 
                    value={formData.projectCost || ''} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border border-neon-900/30 bg-dark-900/20">
                <h4 className="text-neon-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                   <PenTool size={16} /> Detalhes Técnicos
                </h4>
                <NeonTextArea 
                  label="Lista de Equipamentos" 
                  name="equipmentList" 
                  placeholder="Ex: 10x Módulos 550W, 1x Inversor 5kW..." 
                  value={formData.equipmentList || ''} 
                  onChange={handleChange} 
                  className="h-32"
                />
              </div>
            </div>
            
            <div className="mt-4">
               <div className="flex items-center gap-2 text-neon-400 font-bold text-sm mb-2">
                 <ClipboardList size={16} /> Resumo do Projeto
               </div>
               <div className="bg-black border border-gray-800 rounded-lg p-4 text-sm text-gray-400">
                  <p>O projeto <span className="text-white font-bold">{formData.fullName || 'sem nome'}</span> está classificado como <span className="text-neon-500">{formData.installType || '-'}</span> com conexão <span className="text-neon-500">{formData.connectionType || '-'}</span>.</p>
                  <p className="mt-2">Potência estimada: <span className="text-white">{calculatedKwp ? `${calculatedKwp} kWp` : 'Não calculada'}</span>.</p>
               </div>
            </div>
          </div>
        )}
      </div>

       {/* Floating Action Button for Next */}
       <div className="pt-4 border-t border-gray-800 mt-2 flex justify-end">
            <button 
                type="button" 
                onClick={handleNext}
                disabled={isSaving}
                className={`
                  bg-neon-500 hover:bg-neon-400 text-black font-bold py-2 px-6 rounded shadow-neon transition-all hover:shadow-neon-strong transform hover:-translate-y-1 flex items-center gap-2 text-sm
                  ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {activeStep === 'projects' ? (initialData ? 'Atualizar Cliente' : 'Finalizar Cadastro') : 'Salvar e Avançar'}
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : (activeStep === 'projects' ? <Save size={16} /> : <CheckCircle size={16} />)}
            </button>
        </div>
    </div>
  );
};
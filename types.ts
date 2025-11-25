
export type Tab = 'new-client' | 'client-list' | 'financial' | 'settings';

export type FormStep = 
  | 'personal-data' 
  | 'installation' 
  | 'initial-docs' 
  | 'concessionaire-docs' 
  | 'projects';

export interface FinancialTransaction {
  id: string;
  description: string;
  type: 'income' | 'expense';
  amount: string; // Format: R$ 0,00
  date: string;
  category: string; // Ex: 'Combustível', 'Laudo', etc.
}

export interface SavedDocument {
  id: string;
  categoryId: string; // identification, energyBill, etc.
  name: string;
  type: 'image' | 'pdf';
  data: string; // Base64 string
}

export interface ClientData {
  id: string; // Unique ID
  createdAt: string;
  // Personal
  fullName: string;
  status: string;
  docType: string;
  docNumber: string;
  email: string;
  phone: string;
  notes: string;
  // Address
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  reference: string;
  // Technical
  concessionaire: string;
  uc: string;
  installType: string;
  avgConsumption: string;
  connectionType: string;
  voltage: string;
  breaker: string;
  // Location
  latitude: string;
  longitude: string;
  utmZone: string;
  utmEasting: string;
  utmNorthing: string;
  // Project & Financial
  projectStatus?: string;
  installDate?: string;
  equipmentList?: string;
  contractValue?: string; // Format: R$ 0.000,00
  projectCost?: string;   // Format: R$ 0.000,00
  // Documents
  documents?: SavedDocument[];
}

export interface SystemMeta {
  lastBackupDate: string | null;
}

// Enum for select inputs
export enum ClientStatus {
  Active = 'Ativo',
  Pending = 'Pendente',
  Inactive = 'Inativo',
  Lead = 'Lead'
}

export enum DocType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  RG = 'RG'
}

export type Tab = 'new-client' | 'client-list' | 'financial';

export type FormStep = 
  | 'personal-data' 
  | 'installation' 
  | 'initial-docs' 
  | 'concessionaire-docs' 
  | 'projects';

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
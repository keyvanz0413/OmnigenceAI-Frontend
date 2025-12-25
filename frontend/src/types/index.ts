export type DocumentType = 'invoice' | 'shipping' | 'custom';

export interface BaseField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'amount';
  value: string | number;
}

export interface DocumentSchema {
  id: string;
  name: string;
  type: DocumentType;
  fields: BaseField[];
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'word' | 'html';
  content: string; // HTML string or path to word file
  thumbnail?: string;
  category: DocumentType;
}

export interface AppSettings {
  openaiApiKey: string;
  preferredModel: string;
}

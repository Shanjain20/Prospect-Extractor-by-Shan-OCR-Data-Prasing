export interface Prospect {
  Name: string;
  PhoneNumber: string;
  Company: string;
  Email: string;
  Address: string;
}

export interface ProcessingStatus {
  total: number;
  processed: number;
  isProcessing: boolean;
  currentFile?: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedData?: Prospect[];
}
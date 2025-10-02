// Document validation configuration (separate from images)
export const DOCUMENT_VALIDATION_CONFIG = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB (larger than images)
  ALLOWED_FORMATS: ["pdf", "doc", "docx", "txt"] as const,
  MAX_FILES: 5, // Allow multiple documents
} as const;

export interface DocumentUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: UploadedDocument[];
}

export interface UploadedDocument {
  secure_url: string;
  public_id: string;
  original_filename: string;
  format: string;
  bytes: number;
  resource_type: string;
}

export interface DocumentValidationError {
  field: string;
  message: string;
}

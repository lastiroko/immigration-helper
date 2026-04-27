import { useRef, useState } from 'react';
import { documentAPI } from '../services/api';
import {
  DOCUMENT_TYPE_ICON,
  DOCUMENT_TYPE_LABEL,
  formatFileSize,
} from '../lib/applicationDisplay';
import type { ApplicationDocument, DocumentType } from '../types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const DOCUMENT_TYPES: DocumentType[] = [
  'PASSPORT',
  'VISA',
  'BIRTH_CERTIFICATE',
  'MARRIAGE_CERTIFICATE',
  'PROOF_OF_INCOME',
  'PROOF_OF_ADDRESS',
  'HEALTH_INSURANCE',
  'ENROLLMENT_CERTIFICATE',
  'EMPLOYMENT_CONTRACT',
  'BANK_STATEMENT',
  'PHOTO',
  'OTHER',
];

interface Props {
  applicationId: string;
  onUploadSuccess: (doc: ApplicationDocument) => void;
}

export default function DocumentUpload({ applicationId, onUploadSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_FILE_SIZE) return 'File exceeds 10MB limit';
    if (!ALLOWED_TYPES.includes(f.type)) {
      return 'Only PDF, DOCX, JPEG, and PNG files are allowed';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const err = validateFile(selected);
    if (err) {
      setError(err);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError('');
    setFile(selected);
  };

  const reset = () => {
    setFile(null);
    setDocumentType('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentType) return;
    setError('');
    setLoading(true);
    try {
      const res = await documentAPI.upload(applicationId, documentType, file);
      onUploadSuccess(res.data);
      reset();
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 400) {
        setError(err.response?.data?.message || 'Invalid file or document type.');
      } else if (status === 403) {
        setError('Not authorized');
      } else {
        setError(err.response?.data?.message || 'Upload failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!file && !!documentType && !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
          Document type
        </label>
        <select
          value={documentType}
          onChange={e => setDocumentType(e.target.value as DocumentType | '')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 bg-white"
        >
          <option value="">Select a document type…</option>
          {DOCUMENT_TYPES.map(t => (
            <option key={t} value={t}>
              {DOCUMENT_TYPE_ICON[t]}  {DOCUMENT_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
          File
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            Choose file…
          </button>
          {file ? (
            <div className="flex-1 min-w-0 text-sm">
              <p className="text-gray-700 truncate">{file.name}</p>
              <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No file selected</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="sr-only"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">PDF, DOCX, JPEG, or PNG · max 10 MB</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition"
      >
        {loading ? 'Uploading…' : 'Upload document'}
      </button>
    </form>
  );
}

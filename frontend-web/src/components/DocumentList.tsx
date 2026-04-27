import { useState } from 'react';
import { documentAPI } from '../services/api';
import {
  DOCUMENT_TYPE_ICON,
  DOCUMENT_TYPE_LABEL,
  formatDateTime,
  formatFileSize,
  relativeTime,
} from '../lib/applicationDisplay';
import type { ApplicationDocument } from '../types';

interface Props {
  applicationId: string;
  documents: ApplicationDocument[];
  onDelete: (docId: string) => void;
}

export default function DocumentList({ applicationId, documents, onDelete }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleDownload = async (doc: ApplicationDocument) => {
    setError('');
    setBusyId(doc.id);
    try {
      const res = await documentAPI.download(applicationId, doc.id);
      const blob = new Blob([res.data], { type: doc.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Download failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (doc: ApplicationDocument) => {
    if (!confirm(`Delete "${doc.originalFilename}"?`)) return;
    setError('');
    setBusyId(doc.id);
    try {
      await documentAPI.delete(applicationId, doc.id);
      onDelete(doc.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">No documents uploaded yet</p>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      <ul className="divide-y divide-gray-100">
        {documents.map(doc => {
          const busy = busyId === doc.id;
          return (
            <li key={doc.id} className="py-3 flex items-center gap-4">
              <div className="text-2xl shrink-0" aria-hidden>
                {DOCUMENT_TYPE_ICON[doc.documentType]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {DOCUMENT_TYPE_LABEL[doc.documentType]}
                  </span>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
                </div>
                <p className="text-sm text-gray-800 truncate" title={doc.originalFilename}>
                  {doc.originalFilename}
                </p>
                <p className="text-xs text-gray-400" title={formatDateTime(doc.uploadedAt)}>
                  Uploaded {relativeTime(doc.uploadedAt)} by {doc.uploadedByEmail}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  disabled={busy}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-300 transition"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  disabled={busy}
                  className="text-sm text-red-600 hover:text-red-700 font-medium disabled:text-gray-300 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

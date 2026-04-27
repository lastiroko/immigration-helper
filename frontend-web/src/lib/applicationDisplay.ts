import type { ApplicationStatus, DocumentType, VisaType } from '../types';

export const VISA_LABELS: Record<VisaType, string> = {
  STUDENT:   'Student Visa',
  WORK:      'Work Visa',
  BLUE_CARD: 'EU Blue Card',
  FAMILY:    'Family Reunion Visa',
};

export const VISA_ICONS: Record<VisaType, string> = {
  STUDENT:   '🎓',
  WORK:      '💼',
  BLUE_CARD: '🔵',
  FAMILY:    '👨‍👩‍👧',
};

export const STATUS_BADGE: Record<ApplicationStatus, { label: string; cls: string; dot: string }> = {
  DRAFT:     { label: 'Draft',     cls: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
  SUBMITTED: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  APPROVED:  { label: 'Approved',  cls: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  REJECTED:  { label: 'Rejected',  cls: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
};

export function visaLabel(t: VisaType | string): string {
  return VISA_LABELS[t as VisaType] ?? t;
}

export function visaIcon(t: VisaType | string): string {
  return VISA_ICONS[t as VisaType] ?? '🛂';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  PASSPORT:               'Passport',
  VISA:                   'Visa',
  BIRTH_CERTIFICATE:      'Birth Certificate',
  MARRIAGE_CERTIFICATE:   'Marriage Certificate',
  PROOF_OF_INCOME:        'Proof of Income',
  PROOF_OF_ADDRESS:       'Proof of Address',
  HEALTH_INSURANCE:       'Health Insurance',
  ENROLLMENT_CERTIFICATE: 'Enrollment Certificate',
  EMPLOYMENT_CONTRACT:    'Employment Contract',
  BANK_STATEMENT:         'Bank Statement',
  PHOTO:                  'Photo',
  OTHER:                  'Other',
};

export const DOCUMENT_TYPE_ICON: Record<DocumentType, string> = {
  PASSPORT:               '📘',
  VISA:                   '🛂',
  BIRTH_CERTIFICATE:      '👶',
  MARRIAGE_CERTIFICATE:   '💍',
  PROOF_OF_INCOME:        '💶',
  PROOF_OF_ADDRESS:       '🏠',
  HEALTH_INSURANCE:       '🏥',
  ENROLLMENT_CERTIFICATE: '🎓',
  EMPLOYMENT_CONTRACT:    '📝',
  BANK_STATEMENT:         '🏦',
  PHOTO:                  '🖼️',
  OTHER:                  '📄',
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.round(ms / 1000);
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? '' : 's'} ago`;
  const yr = Math.round(day / 365);
  return `${yr} year${yr === 1 ? '' : 's'} ago`;
}

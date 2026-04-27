export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM';
  subscriptionStatus?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  name: string;
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface ImmigrationOffice {
  id: string;
  name: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  appointmentUrl?: string;
  type: 'AUSLAENDERBEHORDE' | 'BAMF' | 'EMBASSY';
  openingHours?: string;
  averageWaitTime?: number;
}

export type VisaType = 'STUDENT' | 'WORK' | 'BLUE_CARD' | 'FAMILY';
export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface VisaApplication {
  id: string;
  user: { id: string; email: string; name: string };
  office?: { id: number; name: string; city: string };
  visaType: VisaType;
  status: ApplicationStatus;
  documents?: Record<string, unknown>[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedByEmail: string;
  changedAt: string;
  note: string | null;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  expiryDate?: string;
  url: string;
}
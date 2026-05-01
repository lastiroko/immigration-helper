// ── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
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
  subscriptionTier: User['subscriptionTier'];
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; name: string; }

// ── Profile + onboarding ────────────────────────────────────────────────────
export type VisaPathway = 'STUDENT' | 'CHANCENKARTE' | 'BLUE_CARD' | 'FAMILY_REUNION' | 'REFUGEE' | 'OTHER';
export type FamilyStatus = 'SINGLE' | 'PARTNERED' | 'MARRIED' | 'PARENT';

export interface UserProfile {
  userId: string;
  firstName: string | null;
  nationality: string | null;
  cityId: string | null;
  citySlug: string | null;
  visaPathway: VisaPathway | null;
  familyStatus: FamilyStatus | null;
  familyInGermany: boolean;
  arrivalDate: string | null;
  anmeldungDate: string | null;
  permitExpiryDate: string | null;
}

export interface OnboardingStepRequest {
  firstName?: string;
  nationality?: string;
  cityId?: string;
  citySlug?: string;
  visaPathway?: VisaPathway;
  familyStatus?: FamilyStatus;
  familyInGermany?: boolean;
  arrivalDate?: string;
  anmeldungDate?: string;
  permitExpiryDate?: string;
  arrivalTimeline?: string;
}

export interface OnboardingFinalizeResponse {
  profile: UserProfile;
  journeys: UserJourney[];
  firstTasks: TaskDto[];
}

// ── Journeys + tasks ────────────────────────────────────────────────────────
export type JourneyType = 'STUDENT_ARRIVAL' | 'JOBSEEKER_TO_WORK' | 'RENEWAL' | 'FAMILY_REUNION' | 'PR_CITIZENSHIP';
export type JourneyStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface UserJourney {
  id: string;
  type: JourneyType;
  status: JourneyStatus;
  startedAt: string;
  expectedEndAt: string | null;
  completedAt: string | null;
}

export type TaskStatus = 'UPCOMING' | 'DUE' | 'OVERDUE' | 'COMPLETE' | 'SKIPPED';

export interface TaskDto {
  id: string;
  journeyId: string;
  templateCode: string;
  title: string;
  description: string;
  dueAt: string | null;
  status: TaskStatus;
  priority: number;
  completedAt: string | null;
  postponedUntil: string | null;
  createdAt: string;
}

export interface TaskListResponse {
  items: TaskDto[];
  page: number;
  size: number;
  total: number;
}

// ── Marketplace ─────────────────────────────────────────────────────────────
export type PartnerCategory = 'BANK' | 'INSURANCE' | 'HOUSING' | 'TRANSLATION' | 'LEGAL' | 'LANGUAGE' | 'RELOCATION' | 'TAX' | 'OTHER';

export interface PartnerCard {
  id: string;
  slug: string;
  name: string;
  category: PartnerCategory;
  logoUrl: string | null;
  commissionDisclosure: string;
  rating: number | null;
}

export interface PartnerDetail extends PartnerCard {
  websiteUrl: string;
  supportedNationalities: string[];
}

export interface PartnerClickResponse {
  clickId: string;
  redirectUrl: string;
}

// ── Offices (new shape) ─────────────────────────────────────────────────────
export type OfficeType = 'BURGERAMT' | 'AUSLANDERBEHORDE' | 'FINANZAMT' | 'STANDESAMT'
  | 'JOBCENTER' | 'FAMILIENKASSE' | 'WOHNUNGSAMT' | 'FUHRERSCHEINSTELLE';

export interface OfficeDto {
  id: string;
  citySlug: string | null;
  cityName: string | null;
  type: OfficeType;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  bookingUrl: string | null;
  phone: string | null;
  email: string | null;
  languagesSupported: string[];
  distanceKm: number | null;
}

// ── Vault documents ─────────────────────────────────────────────────────────
export type ApostilleStatus = 'NONE' | 'NOT_APPLICABLE' | 'PENDING' | 'DONE';
export type TranslationStatus = ApostilleStatus;

export interface VaultDocumentDto {
  id: string;
  type: string;
  title: string;
  sizeBytes: number;
  mimeType: string;
  apostilleStatus: ApostilleStatus;
  translationStatus: TranslationStatus;
  expiryDate: string | null;
  isOriginal: boolean;
  uploadedAt: string;
}

export interface VaultDocumentListResponse {
  items: VaultDocumentDto[];
  quotaUsedBytes: number;
  quotaLimitBytes: number;
}

// Mirrors backend DTOs. Keep in sync with backend/src/main/java/com/immigrationhelper/application/dto.

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
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
  citySlug?: string;
  visaPathway?: VisaPathway;
  familyStatus?: FamilyStatus;
  familyInGermany?: boolean;
  arrivalDate?: string;
}

export type JourneyType = 'STUDENT_ARRIVAL' | 'JOBSEEKER_TO_WORK' | 'RENEWAL' | 'FAMILY_REUNION' | 'PR_CITIZENSHIP';
export interface UserJourney {
  id: string;
  type: JourneyType;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  startedAt: string;
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

export interface OnboardingFinalizeResponse {
  profile: UserProfile;
  journeys: UserJourney[];
  firstTasks: TaskDto[];
}

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

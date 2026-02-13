// ============================================
// DOZ3 Doctor App - Doctor & Auth Types
// ============================================

export interface DoctorProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  qualification: string;
  specialization: string;
  registrationNumber: string;
  clinicName: string;
  clinicAddress: string;
  experience: number; // years
  avatarUrl?: string;
  signatureUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  doctor: DoctorProfile | null;
  /** Which step of onboarding the user is on */
  onboardingStep: "splash" | "login" | "otp" | "profile-setup" | "complete";
}

export const DEFAULT_DOCTOR_PROFILE: DoctorProfile = {
  id: "DOC-001",
  fullName: "Dr. Priya Sharma",
  phone: "+91 98765 43210",
  email: "dr.priya@doz3.health",
  qualification: "MBBS, MD (Internal Medicine)",
  specialization: "Internal Medicine",
  registrationNumber: "MCI-12345678",
  clinicName: "DOZ3 Digital Health Clinic",
  clinicAddress: "42, 1st Cross, Indiranagar, Bengaluru - 560038",
  experience: 12,
};

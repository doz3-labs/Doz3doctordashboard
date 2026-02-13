import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { DoctorProfile, AuthState } from "../types/doctor";
import { DEFAULT_DOCTOR_PROFILE } from "../types/doctor";

interface AuthContextType extends AuthState {
  login: (phone: string) => void;
  verifyOtp: (otp: string) => boolean;
  completeProfile: (profile: DoctorProfile) => void;
  completeOnboarding: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<DoctorProfile>) => void;
  skipToApp: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "doz3_doctor_auth";

/**
 * DEMO MODE: Onboarding is disabled for YC demo.
 * To re-enable onboarding, change DEMO_MODE to false.
 */
const DEMO_MODE = true;

function loadPersistedAuth(): AuthState {
  // In demo mode, always start authenticated with default profile
  if (DEMO_MODE) {
    return {
      isAuthenticated: true,
      isOnboardingComplete: true,
      doctor: DEFAULT_DOCTOR_PROFILE,
      onboardingStep: "complete",
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return {
    isAuthenticated: false,
    isOnboardingComplete: false,
    doctor: null,
    onboardingStep: "splash",
  };
}

function persistAuth(state: AuthState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(loadPersistedAuth);

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setAuthState((prev) => {
      const next = { ...prev, ...updates };
      persistAuth(next);
      return next;
    });
  }, []);

  const login = useCallback(
    (_phone: string) => {
      // LATER: Send OTP via API
      updateState({ onboardingStep: "otp" });
    },
    [updateState]
  );

  const verifyOtp = useCallback(
    (otp: string) => {
      // LATER: Verify OTP via API. For now accept any 6-digit code.
      if (otp.length === 6) {
        updateState({
          isAuthenticated: true,
          onboardingStep: "profile-setup",
        });
        return true;
      }
      return false;
    },
    [updateState]
  );

  const completeProfile = useCallback(
    (profile: DoctorProfile) => {
      updateState({
        doctor: profile,
        onboardingStep: "complete",
        isOnboardingComplete: true,
      });
    },
    [updateState]
  );

  const completeOnboarding = useCallback(() => {
    updateState({ isOnboardingComplete: true, onboardingStep: "complete" });
  }, [updateState]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    if (DEMO_MODE) {
      // In demo mode, logout just resets to default profile
      setAuthState({
        isAuthenticated: true,
        isOnboardingComplete: true,
        doctor: DEFAULT_DOCTOR_PROFILE,
        onboardingStep: "complete",
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        isOnboardingComplete: false,
        doctor: null,
        onboardingStep: "splash",
      });
    }
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<DoctorProfile>) => {
      setAuthState((prev) => {
        const next = {
          ...prev,
          doctor: prev.doctor ? { ...prev.doctor, ...updates } : null,
        };
        persistAuth(next);
        return next;
      });
    },
    []
  );

  /** Dev shortcut: skip onboarding with default profile */
  const skipToApp = useCallback(() => {
    const state: AuthState = {
      isAuthenticated: true,
      isOnboardingComplete: true,
      doctor: DEFAULT_DOCTOR_PROFILE,
      onboardingStep: "complete",
    };
    persistAuth(state);
    setAuthState(state);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        verifyOtp,
        completeProfile,
        completeOnboarding,
        logout,
        updateProfile,
        skipToApp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

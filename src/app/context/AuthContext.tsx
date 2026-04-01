import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { DoctorProfile, AuthState } from "../types/doctor";
import { DEFAULT_DOCTOR_PROFILE } from "../types/doctor";
import { loginDoctor, logoutDoctor, getToken, setToken } from "../lib/api";

interface AuthContextType extends AuthState {
  login: (phone: string) => void;
  verifyOtp: (otp: string) => Promise<boolean>;
  completeProfile: (profile: DoctorProfile) => void;
  completeOnboarding: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<DoctorProfile>) => void;
  skipToApp: () => void;
  doctorId: string | null;
  loginError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "doz3_doctor_auth";
const DEMO_MODE = false;

function loadPersistedAuth(): AuthState {
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
      const parsed = JSON.parse(stored);
      if (parsed.isAuthenticated && getToken()) return parsed;
    }
  } catch { /* ignore */ }

  return {
    isAuthenticated: false,
    isOnboardingComplete: false,
    doctor: null,
    onboardingStep: "splash",
  };
}

function persistAuth(state: AuthState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(loadPersistedAuth);
  const [pendingPhone, setPendingPhone] = useState("");
  const [doctorId, setDoctorId] = useState<string | null>(() => {
    try { return localStorage.getItem("doz3_doctor_id"); } catch { return null; }
  });
  const [loginError, setLoginError] = useState<string | null>(null);

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setAuthState((prev) => {
      const next = { ...prev, ...updates };
      persistAuth(next);
      return next;
    });
  }, []);

  const login = useCallback(
    (phone: string) => {
      setPendingPhone(phone);
      setLoginError(null);
      updateState({ onboardingStep: "otp" });
    },
    [updateState]
  );

  const verifyOtp = useCallback(
    async (otp: string): Promise<boolean> => {
      if (otp.length !== 6) return false;
      setLoginError(null);

      try {
        const resp = await loginDoctor(pendingPhone, otp);
        setDoctorId(resp.user_id);
        try { localStorage.setItem("doz3_doctor_id", resp.user_id); } catch { /* */ }

        const profile: DoctorProfile = {
          ...DEFAULT_DOCTOR_PROFILE,
          id: resp.user_id,
          fullName: resp.name || DEFAULT_DOCTOR_PROFILE.fullName,
          phone: `+91 ${pendingPhone}`,
        };

        updateState({
          isAuthenticated: true,
          doctor: profile,
          onboardingStep: "profile-setup",
        });
        return true;
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : "Login failed");
        return false;
      }
    },
    [updateState, pendingPhone]
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
    logoutDoctor();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("doz3_doctor_id");
    setDoctorId(null);
    setAuthState({
      isAuthenticated: false,
      isOnboardingComplete: false,
      doctor: null,
      onboardingStep: "splash",
    });
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

  const skipToApp = useCallback(() => {
    setToken("demo-token");
    setDoctorId("DOC-DEMO-001");
    try { localStorage.setItem("doz3_doctor_id", "DOC-DEMO-001"); } catch { /* */ }
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
        doctorId,
        loginError,
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

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { DoctorProfile, AuthState } from "../types/doctor";
import { DEFAULT_DOCTOR_PROFILE } from "../types/doctor";
import { loginDoctor, logoutDoctor, getToken, setToken } from "../lib/api";

interface AuthContextType extends AuthState {
  /** Move to the phone-entry step. Use this to *start* sign-in. */
  beginLogin: () => void;
  /** Submit a phone number and advance to OTP entry. */
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
      const parsed = JSON.parse(stored) as AuthState;
      if (parsed.isAuthenticated && getToken()) {
        // `pendingPhone` is deliberately not persisted, so a session restored
        // mid-OTP has no number to verify against and every attempt 403s.
        // Send that case back to phone entry instead of stranding the user.
        if (parsed.onboardingStep === "otp") {
          return { ...parsed, onboardingStep: "login" };
        }
        return parsed;
      }
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

  const beginLogin = useCallback(() => {
    setPendingPhone("");
    setLoginError(null);
    updateState({ onboardingStep: "login" });
  }, [updateState]);

  const login = useCallback(
    (phone: string) => {
      // Guard: advancing to OTP without a phone leaves the user on a form that
      // can only ever 403, with no way forward. The splash screen used to call
      // login("") for its "Get Started" button and skipped phone entry entirely.
      if (!phone) {
        beginLogin();
        return;
      }
      setPendingPhone(phone);
      setLoginError(null);
      updateState({ onboardingStep: "otp" });
    },
    [updateState, beginLogin]
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
        beginLogin,
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

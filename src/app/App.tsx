import { useState } from "react";
import { Toaster } from "sonner";
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  Pill,
  FileText,
  Settings as SettingsIcon,
  QrCode,
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { SplashScreen } from "./components/onboarding/SplashScreen";
import { LoginScreen } from "./components/onboarding/LoginScreen";
import { ProfileSetup } from "./components/onboarding/ProfileSetup";
import { Dashboard } from "./components/dashboard";
import { PatientProfile } from "./components/patient-profile";
import { AIPrescriber } from "./components/ai-prescriber";
import { OrderConfirmation } from "./components/order-confirmation";
import { MedicineCatalog } from "./components/medicine-catalog";
import { PatientRecords } from "./components/patient-records";
import { Settings } from "./components/settings";
import type { PrescriptionData } from "./types/prescription";
import type { SelectedPatientData } from "./components/patient-profile";

type Screen =
  | "dashboard"
  | "patient-profile"
  | "ai-prescriber"
  | "confirmation"
  | "medicine-catalog"
  | "patient-records"
  | "settings";

type SidebarView = "dashboard" | "patients" | "earnings" | "medicines" | "records" | "settings";

const sidebarNav = [
  { id: "dashboard" as SidebarView, screen: "dashboard" as Screen, label: "Dashboard", icon: LayoutDashboard },
  { id: "patients" as SidebarView, screen: "dashboard" as Screen, label: "Patients", icon: Users },
  { id: "records" as SidebarView, screen: "patient-records" as Screen, label: "Patient Records", icon: FileText },
  { id: "medicines" as SidebarView, screen: "medicine-catalog" as Screen, label: "Medicine Database", icon: Pill },
  { id: "earnings" as SidebarView, screen: "dashboard" as Screen, label: "Earnings", icon: IndianRupee },
  { id: "settings" as SidebarView, screen: "settings" as Screen, label: "Settings", icon: SettingsIcon },
];

export default function App() {
  const { isOnboardingComplete, onboardingStep, doctor } = useAuth();

  // ── Onboarding flow ──
  if (!isOnboardingComplete) {
    if (onboardingStep === "splash") return <SplashScreen />;
    if (onboardingStep === "login" || onboardingStep === "otp") return <LoginScreen />;
    if (onboardingStep === "profile-setup") return <ProfileSetup />;
  }

  // ── Main App ──
  return <DoctorDashboard />;
}

function DoctorDashboard() {
  const { doctor } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [activeSidebarView, setActiveSidebarView] = useState<SidebarView>("dashboard");
  const [lastPrescriptionData, setLastPrescriptionData] = useState<PrescriptionData | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatientData | null>(null);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    // Auto-select sidebar view based on screen
    if (screen === "dashboard") setActiveSidebarView("dashboard");
    if (screen === "patient-profile" || screen === "ai-prescriber" || screen === "confirmation") {
      setActiveSidebarView("patients");
    }
    if (screen === "medicine-catalog") setActiveSidebarView("medicines");
    if (screen === "patient-records") setActiveSidebarView("records");
    if (screen === "settings") setActiveSidebarView("settings");
  };

  const handleViewPatientProfile = (patient: SelectedPatientData) => {
    setSelectedPatient(patient);
    handleNavigate("patient-profile");
  };

  const handleSidebarClick = (view: SidebarView, screen: Screen) => {
    setActiveSidebarView(view);
    setCurrentScreen(screen);
  };

  const handleConfirmOrder = (data: PrescriptionData) => {
    setLastPrescriptionData(data);
    setCurrentScreen("confirmation");
    setActiveSidebarView("patients");
  };

  // Determine which sidebar item is "active"
  const isActive = (view: SidebarView) => {
    if (view === "patients") {
      return (
        activeSidebarView === "patients" ||
        ["patient-profile", "ai-prescriber", "confirmation"].includes(currentScreen)
      );
    }
    return activeSidebarView === view;
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-2 sm:p-4">
      <Toaster position="top-right" richColors closeButton />
      <div
        className="flex h-[834px] w-full max-w-[1194px] max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] 
                    overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* ── Sidebar ── */}
        <aside className="no-print w-56 sm:w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
          {/* Logo – clickable → Dashboard */}
          <button
            className="p-4 sm:p-6 border-b border-border w-full text-left hover:bg-muted/40 transition-colors"
            onClick={() => { handleSidebarClick("dashboard", "dashboard"); }}
          >
            <div className="flex items-center gap-2.5">
              <img src="/doz3-logo.png" alt="DOZ3" className="w-9 h-9 object-contain" />
              <div>
                <h1 className="text-primary font-bold text-lg leading-tight">DOZ3</h1>
                <p className="text-[10px] text-muted-foreground leading-tight">Doctor Portal</p>
              </div>
            </div>
          </button>

          {/* Doctor info */}
          <div className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-xs">
                  {doctor?.fullName?.split(" ").slice(0, 2).map((n) => n[0]).join("") ?? "DR"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {doctor?.fullName ?? "Doctor"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {doctor?.specialization ?? "General Medicine"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto">
            {sidebarNav.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSidebarClick(item.id, item.screen)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg mb-1 flex items-center gap-3 transition-colors text-sm ${
                  isActive(item.id)
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Quick Scan Button */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => handleNavigate("patient-profile")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              Scan Patient QR
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {currentScreen === "dashboard" && (
            <Dashboard
              onScanPatient={() => handleNavigate("patient-profile")}
              onNavigate={(s) => handleNavigate(s as Screen)}
              onNavigateToSettings={() => handleNavigate("settings")}
              onViewPatientProfile={handleViewPatientProfile}
              activeSidebarView={activeSidebarView as "dashboard" | "patients" | "earnings"}
              setActiveSidebarView={(v) => setActiveSidebarView(v as SidebarView)}
              hideSidebar
            />
          )}
          {currentScreen === "patient-profile" && (
            <PatientProfile
              patient={selectedPatient}
              onBack={() => handleNavigate("dashboard")}
              onProceedToPrescribe={() => handleNavigate("ai-prescriber")}
              onNavigate={(s) => handleNavigate(s as Screen)}
              hideSidebar
            />
          )}
          {currentScreen === "ai-prescriber" && (
            <AIPrescriber
              patient={selectedPatient}
              onBack={() => handleNavigate("patient-profile")}
              onConfirm={handleConfirmOrder}
              onNavigate={(s) => handleNavigate(s as Screen)}
              hideSidebar
            />
          )}
          {currentScreen === "confirmation" && (
            <OrderConfirmation
              onReturnToDashboard={() => handleNavigate("dashboard")}
              onNavigate={(s) => handleNavigate(s as Screen)}
              prescriptionData={lastPrescriptionData}
              hideSidebar
            />
          )}
          {currentScreen === "medicine-catalog" && <MedicineCatalog />}
          {currentScreen === "patient-records" && (
            <PatientRecords
              onStartConsultation={(patient) => handleViewPatientProfile(patient)}
            />
          )}
          {currentScreen === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}

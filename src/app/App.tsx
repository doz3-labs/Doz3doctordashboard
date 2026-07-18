import { useState } from "react";
import { Toaster, toast } from "sonner";
import {
  LayoutDashboard,
  Users,
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
import {
  getJson,
  postJson,
  createOrUpsertPatient,
  getAllMedications,
  createPrescription,
  createOrderFromPrescription,
  confirmPayment,
  type MedicationAPI,
} from "./lib/api";

type Screen =
  | "dashboard"
  | "patient-profile"
  | "ai-prescriber"
  | "confirmation"
  | "medicine-catalog"
  | "patient-records"
  | "settings";

type SidebarView = "dashboard" | "patients" | "medicines" | "records" | "settings";

const sidebarNav = [
  { id: "dashboard" as SidebarView, screen: "dashboard" as Screen, label: "Dashboard", icon: LayoutDashboard },
  { id: "patients" as SidebarView, screen: "dashboard" as Screen, label: "Patients", icon: Users },
  { id: "records" as SidebarView, screen: "patient-records" as Screen, label: "Patient Records", icon: FileText },
  { id: "medicines" as SidebarView, screen: "medicine-catalog" as Screen, label: "Medicine Database", icon: Pill },
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
  const { doctor, doctorId } = useAuth();
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

  const handleConfirmOrder = async (data: PrescriptionData) => {
    setLastPrescriptionData(data);
    setCurrentScreen("confirmation");
    setActiveSidebarView("patients");

    try {
      const makeAbhaHandle = (name: string) => {
        const base = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "")
          .replace(/^([^a-z0-9])+/g, "")
          .replace(/([^a-z0-9]+)$/g, "");
        const padded = (base.length >= 3 ? base : `p${base}`).slice(0, 20);
        return padded.length >= 3 ? padded : `patient${Date.now()}`;
      };

      // Prefer the real patient row. The upsert below keys on an ABHA handle
      // derived from the patient's NAME, so two patients called "Rajesh Kumar"
      // resolve to the same handle and the second prescription would be filed
      // against the first patient. Only fall back to creating when we genuinely
      // have no existing record (e.g. the QR / ad-hoc path).
      const existingPatientId = selectedPatient?.backendId;
      const createdPatient = existingPatientId
        ? null
        : await createOrUpsertPatient({
            full_name: data.patientName,
            phone_number:
              selectedPatient?.phone?.replace(/[^0-9]/g, "").slice(-10) || "9999999999",
            address_line1: selectedPatient?.address || "42, 1st Cross, Indiranagar",
            address_line2: null,
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560038",
            country: "India",
            // Suffixed so a shared name cannot collide onto one identity.
            abha_address: `${makeAbhaHandle(data.patientName)}.${Date.now().toString(36)}@abdm`,
          });

      const patientId = existingPatientId ?? createdPatient!.id;

      const medicationsExisting = await getAllMedications();

      const medicationIdFor = async (med: (typeof data.medications)[number]) => {
        const found = medicationsExisting.find(
          (m: MedicationAPI) => m.name === med.drug && m.dosage === med.dosage && m.form_factor === med.formFactor
        );
        if (found) return found.id;
        const created = await postJson<MedicationAPI>(
          "/medications/",
          { name: med.drug, dosage: med.dosage, form_factor: med.formFactor }
        );
        medicationsExisting.push(created);
        return created.id;
      };

      const durationDays = data.durationDays;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (durationDays - 1));
      const validUntil = endDate.toISOString().slice(0, 10);

      const dose_schedules: Array<{ medication_id: string; time_slot: "Morning" | "Noon" | "Night"; quantity: number }> = [];
      for (const med of data.medications) {
        const medication_id = await medicationIdFor(med);
        if (med.morning > 0) dose_schedules.push({ medication_id, time_slot: "Morning", quantity: med.morning });
        if (med.afternoon > 0) dose_schedules.push({ medication_id, time_slot: "Noon", quantity: med.afternoon });
        if (med.night > 0) dose_schedules.push({ medication_id, time_slot: "Night", quantity: med.night });
      }

      const prescription = await createPrescription({
        patient_id: patientId,
        abdm_record_id: `abdm-demo-${Date.now()}`,
        valid_until: validUntil,
        duration_days: durationDays,
        doctor_id: doctorId || undefined,
        dose_schedules,
      });

      const delivery_address = createdPatient
        ? `${createdPatient.address_line1}, ${createdPatient.city} - ${createdPatient.pincode}`
        : selectedPatient?.address || "Address on file";
      const order = await createOrderFromPrescription(prescription.id, delivery_address);
      await confirmPayment(order.id);

      toast.success("Order placed for pharmacist approval");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to push prescription (offline mode)");
    }
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
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-1 sm:p-2 lg:p-4">
      <Toaster position="top-right" richColors closeButton />
      <div
        className="flex h-screen w-full lg:h-[calc(100vh-2rem)] lg:max-w-[1400px] xl:max-w-[1600px]
                    overflow-hidden lg:rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* ── Sidebar ── */}
        <aside className="no-print w-16 sm:w-56 lg:w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
          {/* Logo – clickable → Dashboard */}
          <button
            className="p-3 sm:p-4 lg:p-6 border-b border-border w-full text-left hover:bg-muted/40 transition-colors"
            onClick={() => { handleSidebarClick("dashboard", "dashboard"); }}
          >
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <img src={`${import.meta.env.BASE_URL}doz3-logo.png`} alt="DOZ3" className="w-9 h-9 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-primary font-bold text-lg leading-tight">DOZ3</h1>
                <p className="text-[10px] text-muted-foreground leading-tight">Doctor Portal</p>
              </div>
            </div>
          </button>

          {/* Doctor info */}
          <div className="mx-1 sm:mx-3 mt-3 mb-1 p-1.5 sm:p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-xs">
                  {doctor?.fullName?.split(" ").slice(0, 2).map((n) => n[0]).join("") ?? "DR"}
                </span>
              </div>
              <div className="min-w-0 hidden sm:block">
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
          <nav className="flex-1 px-1 sm:px-3 py-2 overflow-y-auto">
            {sidebarNav.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSidebarClick(item.id, item.screen)}
                title={item.label}
                className={`w-full text-left px-2 sm:px-3.5 py-2.5 rounded-lg mb-1 flex items-center justify-center sm:justify-start gap-3 transition-colors text-sm ${
                  isActive(item.id)
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Quick Scan Button */}
          <div className="p-1.5 sm:p-3 border-t border-border">
            <button
              onClick={() => handleNavigate("patient-profile")}
              title="Scan Patient QR"
              className="w-full flex items-center justify-center gap-2 px-2 sm:px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
            >
              <QrCode className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Scan Patient QR</span>
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
              activeSidebarView={activeSidebarView as "dashboard" | "patients"}
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

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Filter,
  Loader2,
  QrCode,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { AdherenceCard } from "./adherence-card";
import { VisitHistory } from "./visit-history";
import {
  getDoctorDashboard,
  getMyPatients,
  type DoctorDashboardAPI,
  type DoctorPatientSummary,
  type FollowUpStatus,
} from "../lib/api";
import type { SelectedPatientData } from "./patient-profile";

/**
 * The doctor's own practice, from real data.
 *
 * Everything here used to be fixtures: eight hardcoded patients, "127 patients
 * this month" and "12 follow-ups required". The numbers never moved and the
 * names were invented, which made the first screen a doctor saw the least
 * trustworthy one in the app.
 *
 * Scope is the signed-in doctor's own patients, established through recorded
 * consultations — PRD §1a's "visibility into their own patients". The full
 * directory stays on Patient Records.
 */

type ViewType = "dashboard" | "patients";

const STATUS_STYLE: Record<FollowUpStatus, string> = {
  "Follow-up overdue": "bg-red-100 text-red-800",
  "Follow-up scheduled": "bg-amber-100 text-amber-800",
  Stable: "bg-accent/10 text-accent",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function deltaLabel(current: number, previous: number): string {
  const d = current - previous;
  if (previous === 0 && current === 0) return "No consultations yet";
  if (d === 0) return "Same as last month";
  return `${d > 0 ? "+" : ""}${d} from last month`;
}

interface DashboardProps {
  onScanPatient: () => void;
  onNavigate: (screen: "dashboard" | "patient-profile" | "ai-prescriber" | "confirmation") => void;
  onNavigateToSettings?: () => void;
  onViewPatientProfile?: (patient: SelectedPatientData) => void;
  activeSidebarView?: ViewType;
  setActiveSidebarView?: (v: ViewType) => void;
  hideSidebar?: boolean;
}

export function Dashboard({
  onScanPatient,
  onNavigateToSettings,
  onViewPatientProfile,
  activeSidebarView = "dashboard",
  setActiveSidebarView,
}: DashboardProps) {
  const { doctor } = useAuth();
  const activeView = activeSidebarView;
  const setActiveView = setActiveSidebarView ?? (() => {});

  const [data, setData] = useState<DoctorDashboardAPI | null>(null);
  const [allPatients, setAllPatients] = useState<DoctorPatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "follow-up" | "stable">("all");
  const [selected, setSelected] = useState<DoctorPatientSummary | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, p] = await Promise.all([getDoctorDashboard(6), getMyPatients()]);
      setData(d);
      setAllPatients(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPatients.filter((p) => {
      const matchesSearch =
        !q ||
        p.full_name.toLowerCase().includes(q) ||
        p.last_diagnosis.toLowerCase().includes(q) ||
        p.abha_address.toLowerCase().includes(q);
      const matchesFilter =
        statusFilter === "all" ||
        (statusFilter === "follow-up" && p.status !== "Stable") ||
        (statusFilter === "stable" && p.status === "Stable");
      return matchesSearch && matchesFilter;
    });
  }, [allPatients, searchQuery, statusFilter]);

  const openProfile = (p: DoctorPatientSummary) => {
    onViewPatientProfile?.({
      backendId: p.patient_id,
      name: p.full_name,
      age: p.age,
      weight: 0,
      condition: p.last_diagnosis || "General Checkup",
      bloodPressure: "—",
      bloodSugar: "—",
      heartRate: "—",
      medications: [],
      visitHistory: [],
    });
  };

  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl text-foreground">
            {activeView === "dashboard" ? "Dashboard" : "Patients"}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => void load()}
              title="Refresh"
              className="p-2 rounded-md border border-border text-muted-foreground hover:bg-muted/40 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Button
              onClick={onScanPatient}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-8 text-lg font-semibold shadow-lg"
            >
              <QrCode className="mr-3 h-7 w-7" />
              SCAN PATIENT QR
            </Button>
            <button
              onClick={onNavigateToSettings}
              className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-foreground font-medium">
                {doctor?.fullName ?? "Doctor"}
              </span>
            </button>
          </div>
        </header>

        {error ? (
          <div className="p-8">
            <Card className="border border-border shadow-sm p-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{error}</p>
                <button
                  onClick={() => void load()}
                  className="text-xs text-primary font-medium hover:underline mt-1"
                >
                  Try again
                </button>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Dashboard view */}
        {!error && activeView === "dashboard" && (
          <div className="flex-1 overflow-auto p-8">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatCard
                label="Patients This Month"
                value={data?.patients_this_month}
                caption={
                  data ? deltaLabel(data.patients_this_month, data.patients_last_month) : ""
                }
                loading={loading}
                onClick={() => setActiveView("patients")}
              />
              <StatCard
                label="Follow-ups Overdue"
                value={data?.follow_ups_overdue}
                caption={
                  data
                    ? `${data.follow_ups_upcoming} scheduled ahead`
                    : ""
                }
                loading={loading}
                emphasis={(data?.follow_ups_overdue ?? 0) > 0 ? "warn" : undefined}
                onClick={() => {
                  setActiveView("patients");
                  setStatusFilter("follow-up");
                }}
              />
              <StatCard
                label="Patients Under Your Care"
                value={data?.total_patients}
                caption="Seen at least once"
                loading={loading}
                onClick={() => setActiveView("patients")}
              />
            </div>

            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Recent Patients</h3>
              </div>
              <PatientTable
                rows={data?.recent_patients ?? []}
                loading={loading}
                onSelect={setSelected}
                emptyMessage="No consultations recorded yet. Recording one puts the patient here."
              />
            </Card>
          </div>
        )}

        {/* Patients view */}
        {!error && activeView === "patients" && (
          <div className="flex-1 overflow-auto p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, diagnosis or ABHA address"
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const next =
                    statusFilter === "all"
                      ? "follow-up"
                      : statusFilter === "follow-up"
                        ? "stable"
                        : "all";
                  setStatusFilter(next);
                  toast.info(
                    `Filter: ${next === "all" ? "All patients" : next === "follow-up" ? "Needs follow-up" : "Stable"}`,
                  );
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter === "all"
                  ? "All patients"
                  : statusFilter === "follow-up"
                    ? "Needs follow-up"
                    : "Stable"}
              </Button>
            </div>

            <Card className="border border-border shadow-sm">
              <PatientTable
                rows={filteredPatients}
                loading={loading}
                onSelect={setSelected}
                emptyMessage={
                  allPatients.length === 0
                    ? "You have not consulted any patients yet."
                    : "No patients match this search."
                }
              />
            </Card>
          </div>
        )}
      </div>

      {selected ? (
        <PatientModal
          patient={selected}
          onClose={() => setSelected(null)}
          onViewFullProfile={() => {
            openProfile(selected);
            setSelected(null);
          }}
        />
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  caption,
  loading,
  onClick,
  emphasis,
}: {
  label: string;
  value: number | undefined;
  caption: string;
  loading: boolean;
  onClick?: () => void;
  emphasis?: "warn";
}) {
  return (
    <Card
      className="p-6 border border-border shadow-sm cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
      onClick={onClick}
    >
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      {loading && value === undefined ? (
        <div className="h-9 w-16 bg-muted rounded animate-pulse" />
      ) : (
        <h3
          className={`text-3xl font-semibold ${
            emphasis === "warn" ? "text-red-600" : "text-foreground"
          }`}
        >
          {value ?? "—"}
        </h3>
      )}
      <p className="text-xs text-muted-foreground mt-2">{caption}</p>
    </Card>
  );
}

function PatientTable({
  rows,
  loading,
  onSelect,
  emptyMessage,
}: {
  rows: DoctorPatientSummary[];
  loading: boolean;
  onSelect: (p: DoctorPatientSummary) => void;
  emptyMessage: string;
}) {
  if (loading && rows.length === 0) {
    return (
      <div className="p-6 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-5 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/30">
          <tr>
            {["Patient", "Age", "Last Visit", "Diagnosis", "Status"].map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {rows.map((p) => (
            <tr
              key={p.patient_id}
              onClick={() => onSelect(p)}
              className="hover:bg-muted/20 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-foreground">{p.full_name || "—"}</div>
                <div className="text-xs text-muted-foreground">{p.abha_address}</div>
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">{p.age ?? "—"}</td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {fmtDate(p.last_visit_at)}
              </td>
              <td className="px-6 py-4 text-sm text-foreground">{p.last_diagnosis || "—"}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${STATUS_STYLE[p.status]}`}
                >
                  {p.status}
                </span>
                {p.follow_up_date ? (
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {fmtDate(p.follow_up_date)}
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PatientModal({
  patient,
  onClose,
  onViewFullProfile,
}: {
  patient: DoctorPatientSummary;
  onClose: () => void;
  onViewFullProfile: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border-2 border-primary">
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-foreground">{patient.full_name || "—"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {patient.age !== null ? `${patient.age} years old` : "Age not recorded"} · Last visit{" "}
              {fmtDate(patient.last_visit_at)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex px-2 py-1 text-xs rounded-full ${STATUS_STYLE[patient.status]}`}
              >
                {patient.status}
              </span>
              {patient.follow_up_date ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {fmtDate(patient.follow_up_date)}
                </span>
              ) : null}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-md transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Real data, not fixtures: these are the same components the patient
            record uses, keyed on the backend patient id. */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {patient.last_diagnosis ? (
            <Card className="border border-border shadow-sm p-4">
              <p className="text-xs text-muted-foreground mb-1">Latest diagnosis</p>
              <p className="text-sm text-foreground">{patient.last_diagnosis}</p>
            </Card>
          ) : null}
          <AdherenceCard patientId={patient.patient_id} patientName={patient.full_name} />
          <VisitHistory patientId={patient.patient_id} />
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onViewFullProfile} className="bg-primary text-primary-foreground">
            Start Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { SelectedPatientData } from "./patient-profile";
import {
  Search,
  User,
  Phone,
  Mail,
  Heart,
  Droplet,
  Activity,
  Weight,
  Thermometer,
  Clock,
  Pill,
  Calendar,
  AlertTriangle,
  FileText,
  Plus,
  X,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PATIENT_RECORDS } from "../data/patientRecords";
import type { PatientRecord } from "../types/patient";

type View = "list" | "detail";

const STORAGE_KEY = "doz3_patient_records";

function loadPersistedPatients(): PatientRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const added: PatientRecord[] = JSON.parse(stored);
      // Merge: added patients first, then defaults (avoid duplicates by id)
      const defaultIds = new Set(PATIENT_RECORDS.map((p) => p.id));
      const extras = added.filter((p) => !defaultIds.has(p.id));
      return [...extras, ...PATIENT_RECORDS];
    }
  } catch { /* ignore */ }
  return PATIENT_RECORDS;
}

function persistAddedPatients(patients: PatientRecord[]) {
  // Only persist patients that are NOT in the default set
  const defaultIds = new Set(PATIENT_RECORDS.map((p) => p.id));
  const added = patients.filter((p) => !defaultIds.has(p.id));
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(added)); } catch { /* ignore */ }
}

/** Convert a PatientRecord to the SelectedPatientData format used by PatientProfile */
function toSelectedPatient(p: PatientRecord): SelectedPatientData {
  return {
    name: p.name,
    age: p.age,
    weight: p.weight ?? p.vitals.weight,
    condition: p.medicalConditions.join(", ") || "General Checkup",
    bloodPressure: p.vitals.bloodPressure,
    bloodSugar: p.vitals.bloodSugar,
    heartRate: p.vitals.heartRate,
    medications: p.activeMedications.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
    })),
    visitHistory: p.visits.map((v) => ({
      date: new Date(v.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      diagnosis: v.diagnosis,
      prescriptions: v.prescriptions,
    })),
  };
}

export function PatientRecords({
  onStartConsultation,
}: {
  onStartConsultation?: (patient: SelectedPatientData) => void;
}) {
  const [patients, setPatients] = useState<PatientRecord[]>(loadPersistedPatients);

  const addPatient = useCallback((newPatient: PatientRecord) => {
    setPatients((prev) => {
      const next = [newPatient, ...prev];
      persistAddedPatients(next);
      return next;
    });
    toast.success(`${newPatient.name} added to patient records`);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [view, setView] = useState<View>("list");
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = patients.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.medicalConditions.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const openPatient = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setView("detail");
  };

  if (view === "detail" && selectedPatient) {
    return (
      <PatientDetailView
        patient={selectedPatient}
        onBack={() => { setView("list"); setSelectedPatient(null); }}
        onStartConsultation={onStartConsultation}
      />
    );
  }

  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl text-foreground font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Patient Records
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {patients.length} registered patients
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, phone, or condition..."
                className="pl-10 py-5"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Active", "Follow-up Required", "Inactive"].map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Patient List */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-3">
              {filtered.map((patient) => (
                <Card
                  key={patient.id}
                  className="p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => openPatient(patient)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">
                        {patient.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-foreground">{patient.name}</h3>
                        <span className="text-xs text-muted-foreground font-mono">{patient.id}</span>
                        <PatientStatusBadge status={patient.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {patient.age}y / {patient.gender} &middot; {patient.bloodGroup} &middot; {patient.phone}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.medicalConditions.map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-foreground">
                            {c}
                          </span>
                        ))}
                        {patient.allergies.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-50 text-[10px] text-red-700 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {patient.allergies.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Last visit & arrow */}
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Last Visit</p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(patient.lastVisit).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short",
                          })}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}

              {filtered.length === 0 && (
                <Card className="p-8 text-center">
                  <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No patients found</p>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Add Patient Modal */}
        {showAddModal && (
          <AddPatientModal
            onClose={() => setShowAddModal(false)}
            onAdd={(p) => { addPatient(p); setShowAddModal(false); }}
          />
        )}
      </div>
    </div>
  );
}

// ── Patient Detail View ──
function PatientDetailView({
  patient,
  onBack,
  onStartConsultation,
}: {
  patient: PatientRecord;
  onBack: () => void;
  onStartConsultation?: (p: SelectedPatientData) => void;
}) {
  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <X className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">
                    {patient.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{patient.name}</h2>
                    <span className="text-xs text-muted-foreground font-mono">{patient.id}</span>
                    <PatientStatusBadge status={patient.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {patient.age}y / {patient.gender} &middot; {patient.bloodGroup} &middot; {patient.weight}kg, {patient.height}cm
                  </p>
                </div>
              </div>
            </div>
            {onStartConsultation && (
              <Button onClick={() => onStartConsultation(toSelectedPatient(patient))} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start Consultation
              </Button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Info & Vitals */}
          <div className="w-1/2 border-r border-border overflow-y-auto p-6 space-y-4">
            {/* Contact */}
            <Card className="p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> Contact & Demographics
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{patient.address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registered</p>
                  <p className="font-medium">{new Date(patient.registeredDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            </Card>

            {/* Vitals */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Current Vitals
                </h4>
                <span className="text-xs text-muted-foreground">
                  Recorded: {new Date(patient.vitals.recordedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <VitalCard icon={Heart} label="Blood Pressure" value={patient.vitals.bloodPressure} color="text-red-500" bgColor="bg-red-50" />
                <VitalCard icon={Droplet} label="Blood Sugar" value={patient.vitals.bloodSugar} color="text-blue-500" bgColor="bg-blue-50" />
                <VitalCard icon={Activity} label="Heart Rate" value={patient.vitals.heartRate} color="text-emerald-500" bgColor="bg-emerald-50" />
                <VitalCard icon={Thermometer} label="Temperature" value={patient.vitals.temperature} color="text-orange-500" bgColor="bg-orange-50" />
                <VitalCard icon={Weight} label="Weight" value={`${patient.vitals.weight} kg`} color="text-amber-500" bgColor="bg-amber-50" />
                <VitalCard icon={Activity} label="SpO2" value={patient.vitals.spo2} color="text-violet-500" bgColor="bg-violet-50" />
              </div>
            </Card>

            {/* Allergies & Conditions */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Allergies
                </h4>
                {patient.allergies.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No known allergies</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-medium">{a}</span>
                    ))}
                  </div>
                )}
              </Card>
              <Card className="p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Conditions
                </h4>
                <div className="flex flex-wrap gap-1">
                  {patient.medicalConditions.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{c}</span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Active Medications */}
            <Card className="p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary" /> Active Medications
              </h4>
              <div className="space-y-2">
                {patient.activeMedications.map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{med.name} <span className="text-muted-foreground">{med.dosage}</span></p>
                      <p className="text-xs text-muted-foreground">Since {new Date(med.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <span className="text-sm font-bold text-primary">{med.frequency}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Visit History */}
          <div className="w-1/2 overflow-y-auto p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Visit History ({patient.visits.length})
            </h3>

            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />

              <div className="space-y-4">
                {patient.visits.map((visit, idx) => (
                  <div key={visit.id} className="relative pl-9">
                    <div
                      className={`absolute left-1 top-1 w-5 h-5 rounded-full flex items-center justify-center ${
                        idx === 0 ? "bg-primary text-white" : "bg-white border-2 border-border"
                      }`}
                    >
                      {idx === 0 ? (
                        <Activity className="w-3 h-3" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>

                    <Card className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{visit.diagnosis}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(visit.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Symptoms:</strong> {visit.symptoms}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {visit.prescriptions.map((rx, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                            {rx}
                          </span>
                        ))}
                      </div>

                      {visit.notes && (
                        <p className="text-xs text-muted-foreground italic">"{visit.notes}"</p>
                      )}

                      {visit.followUpDate && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                          <Calendar className="w-3 h-3" />
                          Follow-up: {new Date(visit.followUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──
function VitalCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`p-3 rounded-lg ${bgColor}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function PatientStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700",
    "Follow-up Required": "bg-amber-100 text-amber-700",
    Inactive: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

// ── Add Patient Modal (simplified) ──
function AddPatientModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: PatientRecord) => void }) {
  const [form, setForm] = useState({
    name: "", age: "", gender: "Male", phone: "", email: "",
    weight: "", height: "", bloodGroup: "B+",
    allergies: "", conditions: "", address: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Add New Patient
          </h3>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Rajesh Kumar" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Age *</label>
                <Input type="number" value={form.age} onChange={(e) => updateField("age", e.target.value)} placeholder="58" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="patient@email.com" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <Input type="number" value={form.weight} onChange={(e) => updateField("weight", e.target.value)} placeholder="72" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height (cm)</label>
              <Input type="number" value={form.height} onChange={(e) => updateField("height", e.target.value)} placeholder="170" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => updateField("bloodGroup", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Known Allergies</label>
            <Input value={form.allergies} onChange={(e) => updateField("allergies", e.target.value)} placeholder="Penicillin, Sulfa drugs (comma separated)" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Medical Conditions</label>
            <Input value={form.conditions} onChange={(e) => updateField("conditions", e.target.value)} placeholder="Type 2 Diabetes, Hypertension (comma separated)" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="123, 4th main road, Bangalore, Karnataka - 560001"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none h-20"
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!form.name.trim() || !form.age.trim() || !form.phone.trim()}
            onClick={() => {
              const newPatient: PatientRecord = {
                id: `PAT-${String(Date.now()).slice(-6)}`,
                name: form.name.trim(),
                age: parseInt(form.age) || 0,
                gender: form.gender as "Male" | "Female" | "Other",
                phone: form.phone.trim(),
                email: form.email.trim() || `${form.name.trim().toLowerCase().replace(/\s+/g, ".")}@email.com`,
                address: form.address.trim() || "Address not provided",
                bloodGroup: form.bloodGroup,
                weight: parseFloat(form.weight) || 70,
                height: parseFloat(form.height) || 170,
                allergies: form.allergies ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean) : [],
                medicalConditions: form.conditions ? form.conditions.split(",").map((c) => c.trim()).filter(Boolean) : ["General Checkup"],
                status: "Active",
                vitals: {
                  bloodPressure: "120/80 mmHg",
                  heartRate: "72 bpm",
                  temperature: "98.4°F",
                  weight: parseFloat(form.weight) || 70,
                  spo2: "98%",
                  bloodSugar: "110 mg/dL",
                  recordedAt: new Date().toISOString(),
                },
                visits: [],
                activeMedications: [],
                registeredDate: new Date().toISOString().split("T")[0],
                lastVisit: "New Patient",
              };
              onAdd(newPatient);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Patient
          </Button>
        </div>
      </div>
    </div>
  );
}

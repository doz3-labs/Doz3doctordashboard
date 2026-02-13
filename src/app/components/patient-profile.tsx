import { ArrowLeft, Activity, Pill, TrendingDown, Mic, MicOff } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { useState } from "react";
import { toast } from "sonner";

/** Data shape passed from Dashboard/PatientRecords into PatientProfile */
export interface SelectedPatientData {
  name: string;
  age: number;
  weight: number;
  condition: string;
  bloodPressure: string;
  bloodSugar: string;
  heartRate: string;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  visitHistory: Array<{ date: string; diagnosis: string; prescriptions: string[] }>;
  bpData?: Array<{ date: string; systolic: number; diastolic: number }>;
}

// Default patient for when none is selected (e.g. QR scan)
const DEFAULT_PATIENT: SelectedPatientData = {
  name: "Rajesh Kumar",
  age: 58,
  weight: 72,
  condition: "Type 2 Diabetes, Hypertension",
  bloodPressure: "138/85",
  bloodSugar: "162 mg/dL",
  heartRate: "76 bpm",
  medications: [
    { name: "Metformin", dosage: "500mg", frequency: "1-0-1" },
    { name: "Telmisartan", dosage: "40mg", frequency: "1-0-0" },
  ],
  visitHistory: [
    { date: "Jan 29, 2026", diagnosis: "Follow-up: Diabetes management", prescriptions: ["Metformin 500mg", "Telmisartan 40mg"] },
    { date: "Jan 15, 2026", diagnosis: "Hypertension review", prescriptions: ["Telmisartan 40mg"] },
    { date: "Dec 28, 2025", diagnosis: "Diabetes Type 2 - Initial consultation", prescriptions: ["Metformin 500mg"] },
  ],
  bpData: [
    { date: "Jan 15", systolic: 152, diastolic: 95 },
    { date: "Jan 22", systolic: 148, diastolic: 92 },
    { date: "Jan 29", systolic: 142, diastolic: 88 },
    { date: "Feb 5", systolic: 138, diastolic: 85 },
  ],
};

const quickSymptomTemplates = [
  "Uncontrolled sugar levels, dizziness",
  "High blood pressure, headache",
  "Chest pain, shortness of breath",
  "Fever, body ache, weakness",
  "Chronic cough, fatigue",
  "Abdominal pain, nausea",
];

interface PatientProfileProps {
  patient?: SelectedPatientData | null;
  onBack: () => void;
  onProceedToPrescribe: () => void;
  onNavigate: (screen: "dashboard" | "patient-profile" | "ai-prescriber" | "confirmation") => void;
  hideSidebar?: boolean;
}

export function PatientProfile({ patient, onBack, onProceedToPrescribe, onNavigate, hideSidebar }: PatientProfileProps) {
  const p = patient ?? DEFAULT_PATIENT;
  const [isMicOn, setIsMicOn] = useState(false);
  const [symptoms, setSymptoms] = useState("");

  // Generate BP data from the patient's blood pressure if not provided
  const bpData = p.bpData ?? generateBpData(p.bloodPressure);

  const handleVoiceInput = () => {
    setIsMicOn(!isMicOn);
    if (!isMicOn) {
      setTimeout(() => {
        setSymptoms(p.condition ? `${p.condition} related symptoms` : "Uncontrolled sugar levels, dizziness, and fatigue");
        setIsMicOn(false);
      }, 2000);
    }
  };

  const handleQuickTemplate = (template: string) => {
    setSymptoms(symptoms ? symptoms + ", " + template : template);
  };

  return (
    <div className="flex h-full bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl text-foreground font-semibold">Patient: {p.name}</h2>
              <p className="text-sm text-muted-foreground">
                Age: {p.age} | Weight: {p.weight}kg | History: {p.condition}
              </p>
            </div>
          </div>
        </header>

        {/* Split Panel Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - History */}
          <div className="w-1/2 border-r border-border overflow-y-auto p-8">
            <h3 className="text-lg font-semibold text-foreground mb-6">Patient History</h3>

            {/* Active Medications */}
            <Card className="mb-6 border border-border shadow-sm">
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Current Medications</h4>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {p.medications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active medications</p>
                ) : (
                  p.medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between hover:bg-muted/30 p-2 rounded-lg transition-colors cursor-pointer"
                      onClick={() => toast.info(`${med.name} ${med.dosage} — Dosage: ${med.frequency} (Morning-Afternoon-Night)`)}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dosage}</p>
                      </div>
                      <span className="text-sm text-primary font-medium">{med.frequency}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* BP Trend */}
            <Card className="mb-6 border border-border shadow-sm">
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">Blood Pressure Trend</h4>
                  </div>
                  <div className="flex items-center gap-1 text-accent">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-xs">Improving</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bpData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <Line type="monotone" dataKey="systolic" stroke="#0F4C81" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="diastolic" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-xs text-muted-foreground">Systolic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    <span className="text-xs text-muted-foreground">Diastolic</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Visit Timeline */}
            <h4 className="text-sm font-semibold text-foreground mb-4">Previous Visits</h4>
            <div className="space-y-4">
              {p.visitHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No previous visits recorded</p>
              ) : (
                p.visitHistory.map((visit, idx) => (
                  <div key={idx} className="relative pl-6 pb-4 border-l-2 border-border">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary"></div>
                    <div
                      className="bg-card border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                      onClick={() => toast.info(`Visit on ${visit.date}: ${visit.diagnosis}`, { description: `Prescribed: ${visit.prescriptions.join(", ")}` })}
                    >
                      <p className="text-xs text-muted-foreground mb-1">{visit.date}</p>
                      <p className="text-sm font-medium text-foreground mb-2">{visit.diagnosis}</p>
                      <div className="flex flex-wrap gap-2">
                        {visit.prescriptions.map((rx, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground hover:bg-primary/10 transition-colors">
                            {rx}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Action */}
          <div className="w-1/2 overflow-y-auto p-8 bg-muted/10">
            <h3 className="text-lg font-semibold text-foreground mb-6">Consultation</h3>

            <Card className="border border-border shadow-sm">
              <div className="p-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Enter Symptoms / Diagnosis
                </label>
                <textarea
                  className="w-full h-40 px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Describe patient symptoms, complaints, or diagnosis..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
                <div className="flex items-center gap-3 mt-3">
                  <Button
                    onClick={handleVoiceInput}
                    variant="outline"
                    className={`px-6 py-8 ${isMicOn ? 'bg-red-50 border-red-500 text-red-600' : ''}`}
                  >
                    {isMicOn ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Button
                    onClick={onProceedToPrescribe}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Proceed to Prescription
                  </Button>
                </div>
                {isMicOn && (
                  <p className="text-xs text-red-600 mt-2 animate-pulse">
                    Listening... Speak now
                  </p>
                )}
                <div className="mt-4">
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">Quick Templates</h5>
                  <div className="flex flex-wrap gap-2">
                    {quickSymptomTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        className="text-xs bg-muted px-3 py-2 rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleQuickTemplate(template)}
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Vitals */}
            <Card className="mt-6 border border-border shadow-sm">
              <div className="p-4 border-b border-border bg-muted/30">
                <h4 className="text-sm font-semibold text-foreground">Latest Vitals</h4>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg hover:bg-primary/5 hover:border hover:border-primary/20 transition-all cursor-pointer" onClick={() => toast.info(`Blood Pressure: ${p.bloodPressure}`, { description: "Target: <130/80 mmHg" })}>
                  <p className="text-xs text-muted-foreground">Blood Pressure</p>
                  <p className="text-sm font-medium text-foreground">{p.bloodPressure}</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-primary/5 hover:border hover:border-primary/20 transition-all cursor-pointer" onClick={() => toast.info(`Blood Sugar: ${p.bloodSugar}`, { description: "Fasting target: 80-130 mg/dL" })}>
                  <p className="text-xs text-muted-foreground">Blood Sugar</p>
                  <p className="text-sm font-medium text-foreground">{p.bloodSugar}</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-primary/5 hover:border hover:border-primary/20 transition-all cursor-pointer" onClick={() => toast.info(`Heart Rate: ${p.heartRate}`, { description: "Normal resting: 60-100 bpm" })}>
                  <p className="text-xs text-muted-foreground">Heart Rate</p>
                  <p className="text-sm font-medium text-foreground">{p.heartRate}</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-primary/5 hover:border hover:border-primary/20 transition-all cursor-pointer" onClick={() => toast.info("Temperature: 98.2°F", { description: "Normal (97.8-99.1°F)" })}>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                  <p className="text-sm font-medium text-foreground">98.2°F</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Generate synthetic BP data from a blood pressure string like "140/90" */
function generateBpData(bp: string) {
  const parts = bp.replace(/[^\d/]/g, "").split("/");
  const sys = parseInt(parts[0]) || 130;
  const dia = parseInt(parts[1]) || 85;
  return [
    { date: "Week 1", systolic: sys + 12, diastolic: dia + 10 },
    { date: "Week 2", systolic: sys + 8, diastolic: dia + 7 },
    { date: "Week 3", systolic: sys + 2, diastolic: dia + 3 },
    { date: "Week 4", systolic: sys, diastolic: dia },
  ];
}

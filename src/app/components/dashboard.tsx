import { useState } from "react";
import { User, QrCode, TrendingUp, Search, Filter, Building2, Smartphone, CreditCard, ArrowDownToLine, X, Calendar, Phone, Mail, Activity, Heart, Droplet, Weight, FileText, Clock, Eye, CheckCircle2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import type { SelectedPatientData } from "./patient-profile";

const earningsTrendData = [
  { value: 38000 },
  { value: 40000 },
  { value: 39500 },
  { value: 42000 },
  { value: 43500 },
  { value: 45200 },
];

const recentPatients = [
  {
    id: 1,
    name: "Rajesh Kumar",
    lastVisit: "Feb 3, 2026",
    condition: "Type 2 Diabetes, Hypertension",
    status: "Follow-up Required",
    age: 58,
    phone: "+91 98765 43210",
    email: "rajesh.kumar@email.com",
    weight: 72,
    bloodPressure: "140/90",
    bloodSugar: "185 mg/dL",
    heartRate: "78 bpm",
    activeMedications: [
      { name: "Glimepiride", dosage: "1mg", frequency: "1-0-0" },
      { name: "Metformin", dosage: "500mg", frequency: "1-0-1" },
      { name: "Telmisartan", dosage: "40mg", frequency: "1-0-0" },
    ],
    medicalHistory: [
      { date: "Feb 3, 2026", diagnosis: "Elevated blood sugar levels", prescription: "Metformin 500mg, Glimepiride 1mg" },
      { date: "Jan 15, 2026", diagnosis: "High BP, Fatigue", prescription: "Telmisartan 40mg" },
      { date: "Dec 10, 2025", diagnosis: "Regular checkup", prescription: "Continue existing medication" },
    ],
    nextAppointment: "Feb 10, 2026",
  },
  {
    id: 2,
    name: "Priya Sharma",
    lastVisit: "Feb 2, 2026",
    condition: "Asthma",
    status: "Stable",
    age: 34,
    phone: "+91 98765 43211",
    email: "priya.sharma@email.com",
    weight: 58,
    bloodPressure: "120/80",
    bloodSugar: "95 mg/dL",
    heartRate: "72 bpm",
    activeMedications: [
      { name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "1-1-1" },
      { name: "Montelukast", dosage: "10mg", frequency: "0-0-1" },
    ],
    medicalHistory: [
      { date: "Feb 2, 2026", diagnosis: "Mild asthma attack", prescription: "Salbutamol Inhaler 100mcg, Montelukast 10mg" },
      { date: "Jan 5, 2026", diagnosis: "Routine checkup", prescription: "Montelukast 10mg" },
    ],
    nextAppointment: "Mar 2, 2026",
  },
  {
    id: 3,
    name: "Anil Verma",
    lastVisit: "Feb 1, 2026",
    condition: "Chronic Back Pain, Mild Hypertension",
    status: "Follow-up Required",
    age: 45,
    phone: "+91 98765 43212",
    email: "anil.verma@email.com",
    weight: 78,
    bloodPressure: "130/85",
    bloodSugar: "102 mg/dL",
    heartRate: "75 bpm",
    activeMedications: [
      { name: "Aceclofenac", dosage: "100mg", frequency: "1-0-1" },
      { name: "Thiocolchicoside", dosage: "4mg", frequency: "1-0-1" },
      { name: "Pregabalin", dosage: "75mg", frequency: "0-0-1" },
    ],
    medicalHistory: [
      { date: "Feb 1, 2026", diagnosis: "Chronic lower back pain - Flare up", prescription: "Aceclofenac 100mg, Thiocolchicoside 4mg, Pregabalin 75mg" },
      { date: "Jan 10, 2026", diagnosis: "Back pain management", prescription: "Diclofenac 50mg" },
    ],
    nextAppointment: "Feb 8, 2026",
  },
  {
    id: 4,
    name: "Meera Patel",
    lastVisit: "Jan 31, 2026",
    condition: "Hypothyroidism",
    status: "Stable",
    age: 52,
    phone: "+91 98765 43213",
    email: "meera.patel@email.com",
    weight: 65,
    bloodPressure: "125/82",
    bloodSugar: "90 mg/dL",
    heartRate: "70 bpm",
    activeMedications: [
      { name: "Levothyroxine", dosage: "75mcg", frequency: "1-0-0" },
    ],
    medicalHistory: [
      { date: "Jan 31, 2026", diagnosis: "Hypothyroidism - Dose adjustment", prescription: "Levothyroxine 75mcg" },
      { date: "Dec 20, 2025", diagnosis: "TSH monitoring", prescription: "Levothyroxine 50mcg" },
    ],
    nextAppointment: "Apr 30, 2026",
  },
  {
    id: 5,
    name: "Suresh Reddy",
    lastVisit: "Jan 30, 2026",
    condition: "Hypertension, High Cholesterol",
    status: "Follow-up Required",
    age: 61,
    phone: "+91 98765 43214",
    email: "suresh.reddy@email.com",
    weight: 82,
    bloodPressure: "150/95",
    bloodSugar: "105 mg/dL",
    heartRate: "80 bpm",
    activeMedications: [
      { name: "Amlodipine", dosage: "10mg", frequency: "1-0-0" },
      { name: "Telmisartan", dosage: "40mg", frequency: "1-0-0" },
      { name: "Atorvastatin", dosage: "20mg", frequency: "0-0-1" },
    ],
    medicalHistory: [
      { date: "Jan 30, 2026", diagnosis: "Uncontrolled hypertension with dyslipidemia", prescription: "Amlodipine 10mg, Atorvastatin 20mg" },
      { date: "Jan 2, 2026", diagnosis: "Regular checkup", prescription: "Telmisartan 40mg" },
    ],
    nextAppointment: "Feb 13, 2026",
  },
  {
    id: 6,
    name: "Kavita Singh",
    lastVisit: "Jan 29, 2026",
    condition: "Migraine",
    status: "Stable",
    age: 29,
    phone: "+91 98765 43215",
    email: "kavita.singh@email.com",
    weight: 54,
    bloodPressure: "118/75",
    bloodSugar: "88 mg/dL",
    heartRate: "68 bpm",
    activeMedications: [
      { name: "Sumatriptan", dosage: "50mg", frequency: "1-0-0" },
      { name: "Propranolol", dosage: "40mg", frequency: "1-0-1" },
    ],
    medicalHistory: [
      { date: "Jan 29, 2026", diagnosis: "Chronic migraine with aura", prescription: "Sumatriptan 50mg, Propranolol 40mg" },
      { date: "Dec 15, 2025", diagnosis: "Severe headache", prescription: "Paracetamol 650mg" },
    ],
    nextAppointment: "Mar 29, 2026",
  },
  {
    id: 7,
    name: "Vikram Malhotra",
    lastVisit: "Jan 28, 2026",
    condition: "High Cholesterol",
    status: "Stable",
    age: 55,
    phone: "+91 98765 43216",
    email: "vikram.m@email.com",
    weight: 85,
    bloodPressure: "135/88",
    bloodSugar: "98 mg/dL",
    heartRate: "74 bpm",
    activeMedications: [
      { name: "Atorvastatin", dosage: "20mg", frequency: "0-0-1" },
    ],
    medicalHistory: [
      { date: "Jan 28, 2026", diagnosis: "High LDL cholesterol", prescription: "Atorvastatin 20mg" },
      { date: "Dec 5, 2025", diagnosis: "Lipid panel review", prescription: "Atorvastatin 20mg" },
    ],
    nextAppointment: "Apr 28, 2026",
  },
  {
    id: 8,
    name: "Anita Desai",
    lastVisit: "Jan 27, 2026",
    condition: "Arthritis",
    status: "Follow-up Required",
    age: 67,
    phone: "+91 98765 43217",
    email: "anita.desai@email.com",
    weight: 62,
    bloodPressure: "138/86",
    bloodSugar: "110 mg/dL",
    heartRate: "76 bpm",
    activeMedications: [
      { name: "Ibuprofen", dosage: "400mg", frequency: "1-0-1" },
      { name: "Calcium", dosage: "500mg", frequency: "0-1-0" },
      { name: "Vitamin D", dosage: "60,000 IU", frequency: "1-0-0" },
    ],
    medicalHistory: [
      { date: "Jan 27, 2026", diagnosis: "Osteoarthritis", prescription: "Ibuprofen 400mg, Calcium 500mg, Vitamin D 60,000 IU" },
      { date: "Dec 28, 2025", diagnosis: "Joint pain", prescription: "Diclofenac 50mg" },
    ],
    nextAppointment: "Feb 10, 2026",
  },
];

const transactions = [
  {
    id: 1,
    date: "Feb 4, 2026",
    patient: "Rajesh Kumar",
    amount: 450,
    status: "Pending",
    method: "-",
  },
  {
    id: 2,
    date: "Feb 3, 2026",
    patient: "Priya Sharma",
    amount: 350,
    status: "Completed",
    method: "UPI",
  },
  {
    id: 3,
    date: "Feb 2, 2026",
    patient: "Anil Verma",
    amount: 500,
    status: "Completed",
    method: "Bank Transfer",
  },
  {
    id: 4,
    date: "Feb 1, 2026",
    patient: "Meera Patel",
    amount: 400,
    status: "Completed",
    method: "UPI",
  },
  {
    id: 5,
    date: "Jan 31, 2026",
    patient: "Suresh Reddy",
    amount: 450,
    status: "Completed",
    method: "Bank Transfer",
  },
  {
    id: 6,
    date: "Jan 30, 2026",
    patient: "Kavita Singh",
    amount: 300,
    status: "Completed",
    method: "UPI",
  },
];

type ViewType = "dashboard" | "patients" | "earnings";

interface DashboardProps {
  onScanPatient: () => void;
  onNavigate: (screen: "dashboard" | "patient-profile" | "ai-prescriber" | "confirmation") => void;
  onNavigateToSettings?: () => void;
  onViewPatientProfile?: (patient: SelectedPatientData) => void;
  activeSidebarView?: ViewType;
  setActiveSidebarView?: (v: ViewType) => void;
  hideSidebar?: boolean;
}

export function Dashboard({ onScanPatient, onNavigate, onNavigateToSettings, onViewPatientProfile, activeSidebarView = "dashboard", setActiveSidebarView, hideSidebar }: DashboardProps) {
  const activeView = activeSidebarView;
  const setActiveView = setActiveSidebarView ?? (() => {});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<typeof recentPatients[0] | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "follow-up" | "stable">("all");
  const [selectedWithdrawalMethod, setSelectedWithdrawalMethod] = useState<"bank" | "upi" | "card">("bank");

  const handlePatientClick = (patient: typeof recentPatients[0]) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const filteredPatients = recentPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      statusFilter === "all" ||
      (statusFilter === "follow-up" && patient.status === "Follow-up Required") ||
      (statusFilter === "stable" && patient.status === "Stable");
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-full bg-background">
      {/* Main Content (sidebar is in App when hideSidebar) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl text-foreground">
            {activeView === "dashboard" && "Dashboard"}
            {activeView === "patients" && "Patients"}
            {activeView === "earnings" && "Earnings"}
          </h2>
          <div className="flex items-center gap-4">
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
              <span className="text-sm text-foreground font-medium">Dr. Sharma</span>
            </button>
          </div>
        </header>

        {/* Dashboard View */}
        {activeView === "dashboard" && (
          <div className="flex-1 overflow-auto p-8">
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Earnings Widget */}
              <Card
                className="col-span-1 p-6 border border-border shadow-sm cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                onClick={() => setActiveView("earnings")}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                    <h3 className="text-3xl font-semibold text-foreground">₹45,200</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                </div>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={earningsTrendData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-accent mt-2">+12.5% from last month</p>
              </Card>

              {/* Stats Cards */}
              <Card
                className="p-6 border border-border shadow-sm cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                onClick={() => setActiveView("patients")}
              >
                <p className="text-sm text-muted-foreground mb-1">Patients This Month</p>
                <h3 className="text-3xl font-semibold text-foreground">127</h3>
                <p className="text-xs text-muted-foreground mt-2">+8 from last month</p>
              </Card>

              <Card
                className="p-6 border border-border shadow-sm cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                onClick={() => {
                  setActiveView("patients");
                  setStatusFilter("follow-up");
                  toast.info("Showing patients with follow-ups required");
                }}
              >
                <p className="text-sm text-muted-foreground mb-1">Follow-ups Required</p>
                <h3 className="text-3xl font-semibold text-foreground">12</h3>
                <p className="text-xs text-muted-foreground mt-2">3 due this week</p>
              </Card>
            </div>

            {/* Recent Patients */}
            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Recent Patients</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Last Visit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {recentPatients.slice(0, 6).map((patient) => (
                      <tr key={patient.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => handlePatientClick(patient)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">{patient.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">{patient.lastVisit}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">{patient.condition}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              patient.status === "Follow-up Required"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-accent/10 text-accent"
                            }`}
                          >
                            {patient.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Patients View */}
        {activeView === "patients" && (
          <div className="flex-1 overflow-auto p-8">
            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">All Patients</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button
                      variant={statusFilter !== "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const next = statusFilter === "all" ? "follow-up" : statusFilter === "follow-up" ? "stable" : "all";
                        setStatusFilter(next);
                        toast.info(`Filter: ${next === "all" ? "All Patients" : next === "follow-up" ? "Follow-up Required" : "Stable"}`);
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {statusFilter === "all" ? "Filter" : statusFilter === "follow-up" ? "Follow-up" : "Stable"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Last Visit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => handlePatientClick(patient)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">{patient.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">{patient.age}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">{patient.lastVisit}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">{patient.condition}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">{patient.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              patient.status === "Follow-up Required"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-accent/10 text-accent"
                            }`}
                          >
                            {patient.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Earnings View */}
        {activeView === "earnings" && (
          <div className="flex-1 overflow-auto p-8">
            {/* Earnings Summary */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <Card className="p-6 border border-border shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <h3 className="text-3xl font-semibold text-foreground">₹45,200</h3>
                <p className="text-xs text-accent mt-2">+12.5% from last month</p>
              </Card>

              <Card className="p-6 border border-border shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
                <h3 className="text-3xl font-semibold text-amber-600">₹450</h3>
                <p className="text-xs text-muted-foreground mt-2">1 transaction pending</p>
              </Card>

              <Card className="p-6 border border-border shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Available to Withdraw</p>
                <h3 className="text-3xl font-semibold text-foreground">₹44,750</h3>
                <p className="text-xs text-muted-foreground mt-2">Ready for withdrawal</p>
              </Card>
            </div>

            {/* Withdrawal Methods */}
            <Card className="mb-8 border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Withdrawal Methods</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose your preferred method to withdraw earnings
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => { setSelectedWithdrawalMethod("bank"); toast.success("Bank Transfer selected"); }}
                    className={`border-2 rounded-lg p-6 transition-colors ${
                      selectedWithdrawalMethod === "bank"
                        ? "border-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                        selectedWithdrawalMethod === "bank" ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Building2 className={`h-6 w-6 ${selectedWithdrawalMethod === "bank" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Bank Transfer</h4>
                      <p className="text-xs text-muted-foreground">Direct to your bank account</p>
                      <p className={`text-xs mt-2 font-medium ${selectedWithdrawalMethod === "bank" ? "text-primary" : "text-muted-foreground"}`}>
                        {selectedWithdrawalMethod === "bank" ? "✓ Selected" : "Select"}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setSelectedWithdrawalMethod("upi"); toast.success("UPI selected"); }}
                    className={`border-2 rounded-lg p-6 transition-colors ${
                      selectedWithdrawalMethod === "upi"
                        ? "border-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                        selectedWithdrawalMethod === "upi" ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Smartphone className={`h-6 w-6 ${selectedWithdrawalMethod === "upi" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">UPI</h4>
                      <p className="text-xs text-muted-foreground">Instant transfer via UPI</p>
                      <p className={`text-xs mt-2 font-medium ${selectedWithdrawalMethod === "upi" ? "text-primary" : "text-muted-foreground"}`}>
                        {selectedWithdrawalMethod === "upi" ? "✓ Selected" : "Select"}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setSelectedWithdrawalMethod("card"); toast.success("Card selected"); }}
                    className={`border-2 rounded-lg p-6 transition-colors ${
                      selectedWithdrawalMethod === "card"
                        ? "border-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                        selectedWithdrawalMethod === "card" ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <CreditCard className={`h-6 w-6 ${selectedWithdrawalMethod === "card" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Card</h4>
                      <p className="text-xs text-muted-foreground">Transfer to debit card</p>
                      <p className={`text-xs mt-2 font-medium ${selectedWithdrawalMethod === "card" ? "text-primary" : "text-muted-foreground"}`}>
                        {selectedWithdrawalMethod === "card" ? "✓ Selected" : "Select"}
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => toast.success("Withdrawal of ₹44,750 initiated via " + (selectedWithdrawalMethod === "bank" ? "Bank Transfer" : selectedWithdrawalMethod === "upi" ? "UPI" : "Card") + ". Processing in 2-3 business days.", { icon: <CheckCircle2 className="w-5 h-5" /> })}
                  >
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Withdraw ₹44,750
                  </Button>
                  <Button variant="outline" onClick={() => toast.info("Payment method settings will be available soon.")}>
                    Update Payment Method
                  </Button>
                </div>
              </div>
            </Card>

            {/* Transaction History */}
            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-muted/20">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">{transaction.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">
                            {transaction.patient}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-foreground">
                            ₹{transaction.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">{transaction.method}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              transaction.status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-accent/10 text-accent"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border-2 border-primary">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">{selectedPatient.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPatient.age} years old • Last Visit: {selectedPatient.lastVisit}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowPatientModal(false)}
                className="h-10 w-10 p-0"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Contact & Vitals */}
                <div className="space-y-4">
                  {/* Contact Information */}
                  <Card className="p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="text-foreground font-medium">{selectedPatient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-foreground font-medium">{selectedPatient.email}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Current Vitals */}
                  <Card className="p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Current Vitals
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-muted-foreground">Blood Pressure</span>
                        </div>
                        <p className="text-base font-semibold text-foreground">{selectedPatient.bloodPressure}</p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Droplet className="h-4 w-4 text-blue-500" />
                          <span className="text-xs text-muted-foreground">Blood Sugar</span>
                        </div>
                        <p className="text-base font-semibold text-foreground">{selectedPatient.bloodSugar}</p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-muted-foreground">Heart Rate</span>
                        </div>
                        <p className="text-base font-semibold text-foreground">{selectedPatient.heartRate}</p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Weight className="h-4 w-4 text-amber-500" />
                          <span className="text-xs text-muted-foreground">Weight</span>
                        </div>
                        <p className="text-base font-semibold text-foreground">{selectedPatient.weight} kg</p>
                      </div>
                    </div>
                  </Card>

                  {/* Current Condition */}
                  <Card className="p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Current Condition
                    </h4>
                    <p className="text-sm text-foreground">{selectedPatient.condition}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Next Appointment:</span>
                      <span className="text-sm font-medium text-primary">{selectedPatient.nextAppointment}</span>
                    </div>
                  </Card>
                </div>

                {/* Right Column - Medical History */}
                <div>
                  <Card className="p-4 border border-border h-full">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Medical History
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedPatient.medicalHistory.map((record, idx) => (
                        <div key={idx} className="border-l-2 border-primary pl-4 pb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">{record.date}</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground mb-1">{record.diagnosis}</p>
                          <div className="bg-muted/30 p-2 rounded text-xs text-muted-foreground">
                            <span className="font-medium">Prescription:</span> {record.prescription}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPatientModal(false)}
              >
                Close
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                  setShowPatientModal(false);
                  if (onViewPatientProfile && selectedPatient) {
                    // Convert dashboard patient format to SelectedPatientData
                    const patientData: SelectedPatientData = {
                      name: selectedPatient.name,
                      age: selectedPatient.age,
                      weight: selectedPatient.weight,
                      condition: selectedPatient.condition,
                      bloodPressure: selectedPatient.bloodPressure,
                      bloodSugar: selectedPatient.bloodSugar,
                      heartRate: selectedPatient.heartRate,
                      medications: selectedPatient.activeMedications.map((m) => ({
                        name: m.name,
                        dosage: m.dosage,
                        frequency: m.frequency,
                      })),
                      visitHistory: selectedPatient.medicalHistory.map((h) => ({
                        date: h.date,
                        diagnosis: h.diagnosis,
                        prescriptions: h.prescription.split(",").map((p) => p.trim()),
                      })),
                    };
                    onViewPatientProfile(patientData);
                  } else {
                    onNavigate("patient-profile");
                  }
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
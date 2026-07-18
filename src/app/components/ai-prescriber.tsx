import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ClipboardList, Printer, X, Search, Plus, Trash2, Check, RefreshCw, Loader2 } from "lucide-react";
import { ClinicalChecks } from "./clinical-checks";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { DosageRoller } from "./dosage-roller";
import { PrintPrescription } from "./print-prescription";
import type { SelectedPatientData } from "./patient-profile";
import { searchMedications, type MedicationAPI } from "../lib/api";

interface DrugSuggestion {
  drug: string;
  dosage: string;
  type: string;
  morning: number;
  afternoon: number;
  night: number;
}

/** Initial AI suggestion for a medication (used to detect doctor override) */
interface AISuggestionSnapshot {
  morning: number;
  afternoon: number;
  night: number;
}

// ── Medication type database ──
const medicationTypeDatabase: Record<string, string> = {
  "Glimepiride": "Tablet", "Metformin": "Tablet", "Telmisartan": "Tablet",
  "Aspirin": "Tablet", "Paracetamol": "Tablet", "Ibuprofen": "Tablet",
  "Atorvastatin": "Tablet", "Amlodipine": "Tablet", "Losartan": "Tablet",
  "Aceclofenac": "Tablet", "Diclofenac": "Tablet", "Cetirizine": "Tablet",
  "Montelukast": "Tablet", "Levothyroxine": "Tablet", "Propranolol": "Tablet",
  "Azithromycin": "Tablet", "Ciprofloxacin": "Tablet", "Metoprolol": "Tablet",
  "Rosuvastatin": "Tablet", "Clopidogrel": "Tablet", "Pantoprazole": "Tablet",
  "Gliclazide": "Tablet", "Sitagliptin": "Tablet", "Sumatriptan": "Tablet",
  "Cough Syrup": "Syrup", "Ambroxol": "Syrup",
  "Insulin": "Injection", "Vitamin B12": "Injection",
  "Betamethasone": "Cream", "Clotrimazole": "Cream", "Fusidic Acid": "Cream",
  "Omeprazole": "Capsule", "Vitamin D": "Capsule", "Pregabalin": "Capsule",
  "Amoxicillin": "Capsule", "Thiocolchicoside": "Capsule",
  "Salbutamol Inhaler": "Inhaler", "Salbutamol": "Inhaler",
};

// ── Medicine "Add" modal database (for browsing) ──
interface Medicine {
  name: string;
  dosage: string;
  category: string;
}

const medicineDatabase: Medicine[] = [
  { name: "Metformin", dosage: "500mg", category: "Diabetes" },
  { name: "Metformin", dosage: "850mg", category: "Diabetes" },
  { name: "Glimepiride", dosage: "1mg", category: "Diabetes" },
  { name: "Glimepiride", dosage: "2mg", category: "Diabetes" },
  { name: "Gliclazide", dosage: "80mg", category: "Diabetes" },
  { name: "Insulin", dosage: "10 units", category: "Diabetes" },
  { name: "Sitagliptin", dosage: "100mg", category: "Diabetes" },
  { name: "Telmisartan", dosage: "40mg", category: "Hypertension" },
  { name: "Telmisartan", dosage: "80mg", category: "Hypertension" },
  { name: "Amlodipine", dosage: "5mg", category: "Hypertension" },
  { name: "Amlodipine", dosage: "10mg", category: "Hypertension" },
  { name: "Losartan", dosage: "50mg", category: "Hypertension" },
  { name: "Metoprolol", dosage: "25mg", category: "Hypertension" },
  { name: "Propranolol", dosage: "40mg", category: "Hypertension" },
  { name: "Atorvastatin", dosage: "20mg", category: "Cholesterol" },
  { name: "Rosuvastatin", dosage: "10mg", category: "Cholesterol" },
  { name: "Paracetamol", dosage: "500mg", category: "Pain & Fever" },
  { name: "Paracetamol", dosage: "650mg", category: "Pain & Fever" },
  { name: "Ibuprofen", dosage: "400mg", category: "Pain & Fever" },
  { name: "Diclofenac", dosage: "50mg", category: "Pain & Fever" },
  { name: "Aceclofenac", dosage: "100mg", category: "Pain & Fever" },
  { name: "Omeprazole", dosage: "20mg", category: "Gastric" },
  { name: "Pantoprazole", dosage: "40mg", category: "Gastric" },
  { name: "Cetirizine", dosage: "10mg", category: "Allergy" },
  { name: "Montelukast", dosage: "10mg", category: "Allergy" },
  { name: "Azithromycin", dosage: "500mg", category: "Antibiotics" },
  { name: "Amoxicillin", dosage: "500mg", category: "Antibiotics" },
  { name: "Ciprofloxacin", dosage: "500mg", category: "Antibiotics" },
  { name: "Vitamin D", dosage: "60,000 IU", category: "Vitamins" },
  { name: "Vitamin B12", dosage: "1500mcg", category: "Vitamins" },
  { name: "Calcium", dosage: "500mg", category: "Vitamins" },
  { name: "Iron", dosage: "100mg", category: "Vitamins" },
  { name: "Levothyroxine", dosage: "75mcg", category: "Thyroid" },
  { name: "Sumatriptan", dosage: "50mg", category: "Neurology" },
  { name: "Pregabalin", dosage: "75mg", category: "Neurology" },
  { name: "Thiocolchicoside", dosage: "4mg", category: "Orthopaedic" },
  { name: "Salbutamol Inhaler", dosage: "100mcg", category: "Respiratory" },
];

// ── Medication type lookup ──
const getMedicationType = (drugName: string): string => {
  if (medicationTypeDatabase[drugName]) return medicationTypeDatabase[drugName];
  const lower = drugName.toLowerCase();
  if (lower.includes("syrup")) return "Syrup";
  if (lower.includes("injection") || lower.includes("insulin")) return "Injection";
  if (lower.includes("cream") || lower.includes("ointment")) return "Cream";
  if (lower.includes("capsule")) return "Capsule";
  if (lower.includes("drops")) return "Drops";
  if (lower.includes("inhaler")) return "Inhaler";
  return "Tablet";
};

// Was "AI-generated based on patient history", displayed over a rule that
// simply copied the patient's existing medications forward. The label now
// states what the rule actually did.
const CARRIED_FORWARD_BASIS = "Carried forward from active medications";

// ── Smart dosage: every known drug MUST have a sensible default ──
const smartDosageDefaults: Record<string, { morning: number; afternoon: number; night: number }> = {
  "Metformin": { morning: 1, afternoon: 0, night: 1 },
  "Glimepiride": { morning: 1, afternoon: 0, night: 0 },
  "Gliclazide": { morning: 1, afternoon: 0, night: 0 },
  "Sitagliptin": { morning: 1, afternoon: 0, night: 0 },
  "Insulin": { morning: 1, afternoon: 0, night: 1 },
  "Telmisartan": { morning: 1, afternoon: 0, night: 0 },
  "Amlodipine": { morning: 1, afternoon: 0, night: 0 },
  "Losartan": { morning: 1, afternoon: 0, night: 0 },
  "Metoprolol": { morning: 1, afternoon: 0, night: 0 },
  "Propranolol": { morning: 1, afternoon: 0, night: 1 },
  "Atorvastatin": { morning: 0, afternoon: 0, night: 1 },
  "Rosuvastatin": { morning: 0, afternoon: 0, night: 1 },
  "Clopidogrel": { morning: 1, afternoon: 0, night: 0 },
  "Aspirin": { morning: 0, afternoon: 1, night: 0 },
  "Paracetamol": { morning: 1, afternoon: 1, night: 1 },
  "Ibuprofen": { morning: 1, afternoon: 0, night: 1 },
  "Diclofenac": { morning: 1, afternoon: 0, night: 1 },
  "Aceclofenac": { morning: 1, afternoon: 0, night: 1 },
  "Thiocolchicoside": { morning: 1, afternoon: 0, night: 1 },
  "Pregabalin": { morning: 0, afternoon: 0, night: 1 },
  "Omeprazole": { morning: 1, afternoon: 0, night: 0 },
  "Pantoprazole": { morning: 1, afternoon: 0, night: 0 },
  "Montelukast": { morning: 0, afternoon: 0, night: 1 },
  "Cetirizine": { morning: 0, afternoon: 0, night: 1 },
  "Azithromycin": { morning: 1, afternoon: 0, night: 0 },
  "Amoxicillin": { morning: 1, afternoon: 1, night: 1 },
  "Ciprofloxacin": { morning: 1, afternoon: 0, night: 1 },
  "Calcium": { morning: 0, afternoon: 1, night: 0 },
  "Iron": { morning: 1, afternoon: 0, night: 0 },
  "Vitamin D": { morning: 1, afternoon: 0, night: 0 },
  "Vitamin B12": { morning: 1, afternoon: 0, night: 0 },
  "Levothyroxine": { morning: 1, afternoon: 0, night: 0 },
  "Sumatriptan": { morning: 1, afternoon: 0, night: 0 },
  "Salbutamol Inhaler": { morning: 1, afternoon: 1, night: 1 },
  "Salbutamol": { morning: 1, afternoon: 1, night: 1 },
};

/** Get a sensible dosage for a drug — never returns 0-0-0 */
function getSmartDosage(drugName: string): { morning: number; afternoon: number; night: number } {
  // Try exact match
  if (smartDosageDefaults[drugName]) return { ...smartDosageDefaults[drugName] };
  // Try partial match (e.g. "Salbutamol Inhaler" for "Salbutamol")
  for (const [key, val] of Object.entries(smartDosageDefaults)) {
    if (drugName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(drugName.toLowerCase())) {
      return { ...val };
    }
  }
  // Ultimate fallback — never 0-0-0
  return { morning: 1, afternoon: 0, night: 1 };
}

/**
 * Parse a frequency string like "1-0-1" or "0-0-1" into M/A/N values.
 * Returns null if unparseable (e.g. "As needed").
 */
function parseFrequency(freq: string): { morning: number; afternoon: number; night: number } | null {
  const parts = freq.split("-").map(Number);
  if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
    return { morning: parts[0], afternoon: parts[1], night: parts[2] };
  }
  return null;
}

/**
 * Build AI suggestions from the patient's ACTUAL data:
 * 1. Active medications with their real frequency
 * 2. Recent prescriptions from visit history (deduplicated)
 * Any medicine that resolves to 0-0-0 is auto-removed.
 */
function buildSuggestionsFromPatient(patient: SelectedPatientData): DrugSuggestion[] {
  const seen = new Set<string>();
  const result: DrugSuggestion[] = [];

  // ── 1. Active medications (highest priority — they have real frequency data) ──
  if (patient.medications && patient.medications.length > 0) {
    for (const med of patient.medications) {
      const key = `${med.name}-${med.dosage}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      // Parse frequency from the patient record (e.g. "1-0-1")
      const parsed = parseFrequency(med.frequency);
      const dosage = parsed ?? getSmartDosage(med.name);

      // Skip 0-0-0
      if (dosage.morning === 0 && dosage.afternoon === 0 && dosage.night === 0) continue;
      // Skip "As needed" type medications (doctor can add manually if desired)
      if (med.frequency.toLowerCase().includes("as needed")) continue;

      result.push({
        drug: med.name,
        dosage: med.dosage,
        type: getMedicationType(med.name),
        ...dosage,
      });
    }
  }

  // ── 2. If no active meds, try parsing from last visit's prescriptions ──
  if (result.length === 0 && patient.visitHistory && patient.visitHistory.length > 0) {
    const lastVisit = patient.visitHistory[0]; // most recent
    for (const rx of lastVisit.prescriptions) {
      // Parse "Metformin 500mg" or "Glimepiride 1mg"
      const match = rx.match(/^(.+?)\s+(\d+\S*)$/);
      if (!match) continue;
      const [, name, dosage] = match;
      const key = `${name}-${dosage}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const smartDose = getSmartDosage(name.trim());
      if (smartDose.morning === 0 && smartDose.afternoon === 0 && smartDose.night === 0) continue;

      result.push({
        drug: name.trim(),
        dosage: dosage,
        type: getMedicationType(name.trim()),
        ...smartDose,
      });
    }
  }

  // ── 3. If still nothing (shouldn't happen), give a sensible fallback ──
  if (result.length === 0) {
    result.push(
      { drug: "Paracetamol", dosage: "650mg", type: "Tablet", ...getSmartDosage("Paracetamol") },
      { drug: "Pantoprazole", dosage: "40mg", type: "Tablet", ...getSmartDosage("Pantoprazole") },
    );
  }

  return result;
}

/**
 * A prescription starts empty.
 *
 * This used to pre-fill Glimepiride + Metformin + Telmisartan — the demo
 * patient's regimen — whenever no patient was selected. A doctor arriving
 * without a selected patient would find three real drugs already on the
 * prescription, one confirmation away from being dispensed to whoever the
 * order was later attached to.
 */
const DEFAULT_SUGGESTIONS: DrugSuggestion[] = [];

interface AIPrescriberProps {
  patient?: SelectedPatientData | null;
  onBack: () => void;
  onConfirm: (data: {
    patientName: string;
    /** null when no date of birth is on file — never substitute a default. */
    patientAge: number | null;
    patientWeight: number;
    patientHistory: string;
    symptoms: string;
    medications: Array<{ drug: string; dosage: string; formFactor: string; morning: number; afternoon: number; night: number }>;
    additionalInstructions?: string;
    orderAmount: number;
    durationDays: number;
  }) => void;
  onNavigate: (screen: "dashboard" | "patient-profile" | "ai-prescriber" | "confirmation") => void;
  hideSidebar?: boolean;
}

export function AIPrescriber({ patient, onBack, onConfirm, onNavigate, hideSidebar }: AIPrescriberProps) {
  // No invented patient. These used to default to "Rajesh Kumar", 72kg,
  // "Hypertension, Type 2 Diabetes" — a fictional history that then drove the
  // safety rules and got printed on the prescription.
  const patientName = patient?.name ?? "No patient selected";
  // No fallback age. This used to default to 58, which meant the screen showed
  // "Based on <name>'s Age (58)" for patients whose date of birth was never
  // recorded — fabricated clinical justification. null now means unknown, and
  // the UI says so instead of inventing a number.
  const patientAge = patient?.age ?? null;
  const patientWeight = patient?.weight ?? 0;
  const patientHistory = patient?.condition ?? "";

  // Drugs the patient is already on, used to label which prescription rows were
  // carried forward rather than chosen fresh in this consultation.
  const carriedForward = new Set(
    (patient?.medications ?? []).map((m) => m.name.toLowerCase()),
  );

  // Build suggestions from the patient's ACTUAL medication history
  const patientSuggestions = patient
    ? buildSuggestionsFromPatient(patient)
    : DEFAULT_SUGGESTIONS;

  const [suggestions, setSuggestions] = useState(patientSuggestions);
  const [symptomsText, setSymptomsText] = useState(patientHistory);
  /** Snapshot of AI suggestion at add time; used to detect doctor override */
  const [aiSnapshots, setAiSnapshots] = useState<AISuggestionSnapshot[]>(() =>
    patientSuggestions.map((s) => ({ morning: s.morning, afternoon: s.afternoon, night: s.night }))
  );
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  // AI-suggested default duration (doctor can override this single value for the whole prescription).
  const [durationDays, setDurationDays] = useState<number>(30);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMedicines, setSelectedMedicines] = useState<Medicine[]>([]);

  const updateFrequency = (index: number, field: "morning" | "afternoon" | "night", value: number) => {
    const newSuggestions = [...suggestions];
    newSuggestions[index] = { ...newSuggestions[index], [field]: value };
    setSuggestions(newSuggestions);
  };

  /** Check if a suggestion has 0-0-0 dosage */
  const isZeroDosage = (s: DrugSuggestion) =>
    s.morning === 0 && s.afternoon === 0 && s.night === 0;

  const isOverridden = (index: number): { morning: boolean; afternoon: boolean; night: boolean } => {
    const snap = aiSnapshots[index];
    const s = suggestions[index];
    if (!snap || !s) return { morning: false, afternoon: false, night: false };
    return {
      morning: s.morning !== snap.morning,
      afternoon: s.afternoon !== snap.afternoon,
      night: s.night !== snap.night,
    };
  };

  const updateMedicationType = (index: number, newType: string) => {
    const newSuggestions = [...suggestions];
    newSuggestions[index].type = newType;
    setSuggestions(newSuggestions);
  };

  const toggleMedicineSelection = (medicine: Medicine) => {
    const isSelected = selectedMedicines.some(
      m => m.name === medicine.name && m.dosage === medicine.dosage
    );
    
    if (isSelected) {
      setSelectedMedicines(selectedMedicines.filter(
        m => !(m.name === medicine.name && m.dosage === medicine.dosage)
      ));
    } else {
      setSelectedMedicines([...selectedMedicines, medicine]);
    }
  };

  const isMedicineSelected = (medicine: Medicine) => {
    return selectedMedicines.some(
      m => m.name === medicine.name && m.dosage === medicine.dosage
    );
  };

  const addSelectedMedications = () => {
    const newMeds: DrugSuggestion[] = selectedMedicines.map((medicine) => {
      const dose = getSmartDosage(medicine.name);
      return {
        drug: medicine.name,
        dosage: medicine.dosage,
        type: getMedicationType(medicine.name),
        ...dose,
      };
    });
    const newSnaps: AISuggestionSnapshot[] = newMeds.map((m) => ({
      morning: m.morning,
      afternoon: m.afternoon,
      night: m.night,
    }));
    setSuggestions([...suggestions, ...newMeds]);
    setAiSnapshots([...aiSnapshots, ...newSnaps]);
    setShowMedicineModal(false);
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedMedicines([]);
  };

  const addMedication = (medicine: Medicine) => {
    const dose = getSmartDosage(medicine.name);
    const newMed: DrugSuggestion = {
      drug: medicine.name,
      dosage: medicine.dosage,
      type: getMedicationType(medicine.name),
      ...dose,
    };
    setSuggestions([...suggestions, newMed]);
    setAiSnapshots([...aiSnapshots, { ...dose }]);
    setShowMedicineModal(false);
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedMedicines([]);
  };

  const removeMedication = (index: number) => {
    const newSuggestions = [...suggestions];
    const newSnaps = [...aiSnapshots];
    newSuggestions.splice(index, 1);
    newSnaps.splice(index, 1);
    setSuggestions(newSuggestions);
    setAiSnapshots(newSnaps);
  };

  const [apiMedicines, setApiMedicines] = useState<MedicationAPI[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  const fetchMedsFromBackend = useCallback(async (q: string) => {
    setLoadingMeds(true);
    try {
      const results = await searchMedications(q || undefined, undefined, undefined, 50, 0);
      setApiMedicines(results);
    } catch {
      setApiMedicines([]);
    } finally {
      setLoadingMeds(false);
    }
  }, []);

  useEffect(() => {
    if (!showMedicineModal) return;
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => fetchMedsFromBackend(searchQuery), 250);
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
  }, [searchQuery, showMedicineModal, fetchMedsFromBackend]);

  const filteredMedicines = apiMedicines.length > 0
    ? apiMedicines.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        category: m.drug_schedule === "OTC" ? "OTC" : m.form_factor,
        form_factor: m.form_factor,
        salt: m.salt_composition,
      }))
    : medicineDatabase.map((m) => ({ ...m, form_factor: getMedicationType(m.name), salt: null }));

  const categories = ["All", ...Array.from(new Set(filteredMedicines.map((m) => m.category)))];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-full bg-background">
      {/* Print Prescription Component */}
      <PrintPrescription
        patientName={patientName}
        patientAge={patientAge}
        patientWeight={patientWeight}
        patientHistory={patientHistory}
        symptoms={symptomsText}
        medications={suggestions}
        additionalInstructions={additionalInstructions}
        doctorName="Dr. Priya Sharma"
        doctorQualification="MBBS, MD (Internal Medicine)"
        doctorRegistration="MCI-12345678"
        clinicName="DOZ3 Digital Health Clinic"
        clinicAddress="42, 1st Cross, Indiranagar, Bengaluru - 560038"
        clinicContact="+91-80-4567-8901 | care@doz3.health"
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden no-print">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl text-foreground font-semibold">Patient: {patientName}</h2>
              <p className="text-sm text-muted-foreground">
                Age: {patientAge ?? "Not recorded"} | Weight: {patientWeight}kg | History: {patientHistory}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Prescription
          </Button>
        </header>

        {/* Prescription Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Symptoms Input */}
            <Card className="mb-6 border border-border shadow-sm">
              <div className="p-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Symptoms / Diagnosis
                </label>
                <textarea
                  className="w-full h-32 px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Symptoms and diagnosis — recorded on the prescription and used to match safety rules"
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                />
              </div>
            </Card>

            {/* Safety review of what the doctor has actually selected. */}
            <div className="mb-6">
              <ClinicalChecks
                drugs={suggestions.map((s) => s.drug)}
                age={patientAge}
                conditions={patientHistory.split(/[,;]/).map((c) => c.trim()).filter(Boolean)}
              />
            </div>

            <Card className="border-2 border-primary shadow-lg">
              <div className="p-4 border-b border-border bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Prescription</h3>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-foreground">
                    Carried forward from{" "}
                    <span className="font-semibold">{patientName.split(" ")[0]}'s active medications</span>
                    {patientAge !== null ? (
                      <> (age <span className="font-semibold">{patientAge}</span>)</>
                    ) : null}
                    . Review each line before confirming:
                  </p>
                  {patientAge === null ? (
                    <p className="text-xs text-amber-700 mt-2">
                      Date of birth not recorded — age-based checks are unavailable
                      for this patient.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => {
                    const override = isOverridden(index);
                    return (
                      <div
                        key={index}
                        className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow relative"
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-50 no-print"
                          onClick={() => removeMedication(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>

                        {/* Only rows that genuinely came from the patient's
                            active medications carry this badge. It used to be
                            on every row, so a drug the doctor had just added by
                            hand claimed to have been carried forward. */}
                        {carriedForward.has(suggestion.drug.toLowerCase()) ? (
                          <div className="flex items-center gap-2 mb-2 pr-10">
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0 no-print">
                              {CARRIED_FORWARD_BASIS}
                            </Badge>
                          </div>
                        ) : null}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-base font-semibold text-foreground">
                                {suggestion.drug}
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {suggestion.dosage}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-muted-foreground">Type:</label>
                              <span className="text-xs font-medium text-foreground bg-muted px-2 py-1 rounded">
                                {suggestion.type}
                              </span>
                            </div>
                          </div>
                          <span className={`text-sm font-medium px-2 py-1 rounded ${
                            isZeroDosage(suggestion) ? "text-red-600 bg-red-50 border border-red-200" : "text-primary bg-primary/10"
                          }`}>
                            {suggestion.morning}-{suggestion.afternoon}-{suggestion.night}
                            {isZeroDosage(suggestion) && " ⚠"}
                          </span>
                        </div>

                        <DosageRoller
                          morning={suggestion.morning}
                          afternoon={suggestion.afternoon}
                          night={suggestion.night}
                          onMorningChange={(val) => updateFrequency(index, "morning", val)}
                          onAfternoonChange={(val) => updateFrequency(index, "afternoon", val)}
                          onNightChange={(val) => updateFrequency(index, "night", val)}
                          morningOverridden={override.morning}
                          afternoonOverridden={override.afternoon}
                          nightOverridden={override.night}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowMedicineModal(true)}>
                    Add Another Medication
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // Regenerate from patient's actual history
                      const newMeds = patient
                        ? buildSuggestionsFromPatient(patient)
                        : DEFAULT_SUGGESTIONS;
                      const newSnaps: AISuggestionSnapshot[] = newMeds.map((m) => ({
                        morning: m.morning, afternoon: m.afternoon, night: m.night,
                      }));
                      setSuggestions(newMeds);
                      setAiSnapshots(newSnaps);
                      toast.success(`AI regenerated ${newMeds.length} medications from ${patientName}'s history`);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload from active medications
                  </Button>
                </div>
              </div>
            </Card>

            {/* Additional Notes */}
            <Card className="mt-6 border border-border shadow-sm">
              <div className="p-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  className="w-full h-24 px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Add any special instructions for the patient..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                />
              </div>
            </Card>

            {/* Duration Override (single value for whole prescription) */}
            <Card className="mt-6 border border-border shadow-sm">
              <div className="p-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Duration (Doctor override)
                </label>
                <div className="flex items-center gap-3">
                  <select
                    className="flex-1 px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                  >
                    <option value={15}>15 days</option>
                    <option value={30}>30 days</option>
                    <option value={45}>45 days</option>
                    <option value={60}>60 days</option>
                  </select>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Default: AI suggestion</span>
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => {
                  // Filter out any medicines the doctor set to 0-0-0
                  const validMeds = suggestions.filter((s) => !isZeroDosage(s));
                  if (validMeds.length === 0) {
                    toast.error("Please add at least one medication with a dosage");
                    return;
                  }
                  const removed = suggestions.length - validMeds.length;
                  if (removed > 0) {
                    toast.info(`${removed} medicine(s) with 0-0-0 dosage removed from prescription`);
                  }
                  onConfirm({
                    patientName,
                    patientAge,
                    patientWeight,
                    patientHistory,
                    symptoms: symptomsText,
                    medications: validMeds.map((s) => ({
                      drug: s.drug,
                      dosage: s.dosage,
                      formFactor: s.type,
                      morning: s.morning,
                      afternoon: s.afternoon,
                      night: s.night,
                    })),
                    additionalInstructions,
                    orderAmount: 450,
                    durationDays,
                  });
                }
                }
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base shadow-lg"
              >
                CONFIRM & CREATE ORDER
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Medicine Modal */}
      {showMedicineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col border-2 border-primary">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Add Medication</h3>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowMedicineModal(false);
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search and Filter Section */}
            <div className="p-6 border-b border-border bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Search className="inline h-4 w-4 mr-1" />
                    Search Medication
                  </label>
                  <input
                    type="text"
                    placeholder="Type medicine name or dosage..."
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Filter by Category</label>
                  <select
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Medicine List */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-xs text-muted-foreground mb-4">
                {loadingMeds ? "Searching..." : `Found ${filteredMedicines.length} medication(s)`}
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {selectedMedicines.length > 0 && ` • ${selectedMedicines.length} selected`}
                {apiMedicines.length > 0 && " (from DOZ3 database)"}
              </p>
              <div className="space-y-2">
                {filteredMedicines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No medications found</p>
                    <p className="text-xs mt-2">Try adjusting your search or filter</p>
                  </div>
                ) : (
                  filteredMedicines.map((med, idx) => {
                    const isSelected = isMedicineSelected(med);
                    return (
                      <div
                        key={`${med.name}-${med.dosage}-${idx}`}
                        className={`flex items-center gap-3 p-4 border rounded-lg transition-all cursor-pointer ${
                          isSelected 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary hover:bg-primary/5"
                        }`}
                        onClick={() => toggleMedicineSelection(med)}
                      >
                        <div 
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected 
                              ? "bg-primary border-primary" 
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-semibold text-foreground">{med.name}</h4>
                            <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                              {med.dosage}
                            </span>
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                              {med.form_factor}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {med.salt ? `Salt: ${med.salt}` : `Category: ${med.category}`}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            {selectedMedicines.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedMedicines.length} medication{selectedMedicines.length > 1 ? "s" : ""} selected
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedMedicines([])}
                  >
                    Clear Selection
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={addSelectedMedications}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Selected ({selectedMedicines.length})
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
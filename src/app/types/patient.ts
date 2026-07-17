// ============================================
// DOZ3 Doctor App - Patient Record Types
// Designed to sync with the Patient App via API later
// ============================================

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  weight: number;
  height: number;
  bloodGroup: string;
  allergies: string[];
  medicalConditions: string[];
  address: string;
  registeredDate: string;
  lastVisit: string;
  status: "Active" | "Follow-up Required" | "Inactive";
  vitals: PatientVitals;
  visits: PatientVisit[];
  activeMedications: ActiveMedication[];
}

export interface PatientVitals {
  bloodPressure: string;
  bloodSugar: string;
  heartRate: string;
  temperature: string;
  weight: number;
  spo2: string;
  recordedAt: string;
}

export interface PatientVisit {
  id: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  prescriptions: string[];
  notes: string;
  followUpDate?: string;
}

export interface ActiveMedication {
  name: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1"
  startDate: string;
  endDate?: string;
  prescribedBy: string;
}

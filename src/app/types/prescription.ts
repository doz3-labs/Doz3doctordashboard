export interface PrescriptionMedication {
  drug: string;
  dosage: string;
  formFactor: string;
  morning: number;
  afternoon: number;
  night: number;
}

export interface PrescriptionData {
  patientName: string;
  /** null when no date of birth is on file. */
  patientAge: number | null;
  patientWeight: number;
  patientHistory: string;
  symptoms: string;
  medications: PrescriptionMedication[];
  additionalInstructions?: string;
  orderAmount: number;
  durationDays: number;
}

export const DEFAULT_PRESCRIPTION_DATA: PrescriptionData = {
  patientName: "Rajesh Kumar",
  patientAge: 58,
  patientWeight: 72,
  patientHistory: "Hypertension, Type 2 Diabetes",
  symptoms: "Uncontrolled sugar levels, dizziness",
  medications: [
    { drug: "Glimepiride", dosage: "1mg", formFactor: "Tablet", morning: 1, afternoon: 0, night: 0 },
    { drug: "Metformin", dosage: "500mg", formFactor: "Tablet", morning: 1, afternoon: 0, night: 1 },
  ],
  additionalInstructions: "",
  orderAmount: 450,
  durationDays: 30,
};

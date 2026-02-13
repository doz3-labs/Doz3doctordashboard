export interface PrescriptionMedication {
  drug: string;
  dosage: string;
  morning: number;
  afternoon: number;
  night: number;
}

export interface PrescriptionData {
  patientName: string;
  patientAge: number;
  patientWeight: number;
  patientHistory: string;
  symptoms: string;
  medications: PrescriptionMedication[];
  additionalInstructions?: string;
  orderAmount: number;
}

export const DEFAULT_PRESCRIPTION_DATA: PrescriptionData = {
  patientName: "Rajesh Kumar",
  patientAge: 58,
  patientWeight: 72,
  patientHistory: "Hypertension, Type 2 Diabetes",
  symptoms: "Uncontrolled sugar levels, dizziness",
  medications: [
    { drug: "Glimepiride", dosage: "1mg", morning: 1, afternoon: 0, night: 0 },
    { drug: "Metformin", dosage: "500mg", morning: 1, afternoon: 0, night: 1 },
  ],
  additionalInstructions: "",
  orderAmount: 450,
};

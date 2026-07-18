// ============================================
// DOZ3 Doctor App - Medicine Database Types
// ============================================

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  dosages: string[];
  type: MedicineType;
  category: string;
  schedule: "OTC" | "H" | "H1" | "X"; // Indian drug schedules
  sideEffects: string[];
  contraindications: string[];
  interactions: string[];
  usageNotes: string;
  // NOTE: `priceRange`, `incentivePerUnit` and `unitType` were removed here.
  // A per-prescription incentive to a prescribing doctor is very likely caught
  // by MCI Regulation 6.4.1 (see docs/doctor-compensation-findings.md), and the
  // product decision (PRD §1a) is that the doctor's win is non-monetary:
  // adherence visibility, not a payment. The fields were written in the data
  // file but read by no component, so nothing rendered them.
  inStock: boolean;
}

export type MedicineType =
  | "Tablet"
  | "Capsule"
  | "Syrup"
  | "Injection"
  | "Cream"
  | "Ointment"
  | "Drops"
  | "Inhaler"
  | "Powder"
  | "Gel"
  | "Patch";

export type MedicineCategory =
  | "Diabetes"
  | "Hypertension"
  | "Cholesterol"
  | "Pain & Fever"
  | "Antibiotics"
  | "Gastric"
  | "Allergy"
  | "Respiratory"
  | "Cardiac"
  | "Thyroid"
  | "Vitamins & Supplements"
  | "Dermatology"
  | "Neurology"
  | "Psychiatry"
  | "Orthopaedic";

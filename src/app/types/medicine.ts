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
  priceRange: string; // e.g. "₹5-15 per strip" (legacy, unused in UI)
  /** Doctor's incentive per unit (strip/sachet/vial/etc) */
  incentivePerUnit: number;
  /** Unit type for the incentive display */
  unitType: "strip" | "sachet" | "vial" | "pen" | "tube" | "bottle" | "inhaler" | "patch" | "injection";
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

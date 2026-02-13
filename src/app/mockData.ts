/**
 * Maps symptoms (lowercase keywords) to suggested medications for AI prescriber.
 * When user types a symptom, the AI can suggest the corresponding medication.
 *
 * LATER: Replace this mock with your custom ML model API:
 * - Call your model with symptomsText (and optionally patient history, age, etc.)
 * - Return suggested medications in the same shape as SymptomMedicationSuggestion[]
 */

export interface SymptomMedicationSuggestion {
  name: string;
  dosage: string;
  /** Optional reasoning for AI badge */
  reasoning?: string;
}

/** Symptom keyword (lowercase) -> suggested medication(s) */
export const SYMPTOM_TO_MEDICATIONS: Record<string, SymptomMedicationSuggestion[]> = {
  dizziness: [
    { name: "Glimepiride", dosage: "1mg", reasoning: "Based on History of Diabetes + Age 58" },
  ],
  "sugar": [
    { name: "Metformin", dosage: "500mg", reasoning: "Based on History of Diabetes" },
    { name: "Glimepiride", dosage: "1mg", reasoning: "Based on History of Diabetes + Age 58" },
  ],
  diabetes: [
    { name: "Metformin", dosage: "500mg", reasoning: "Based on History of Diabetes" },
    { name: "Glimepiride", dosage: "1mg", reasoning: "Based on History of Diabetes + Age 58" },
  ],
  hypertension: [
    { name: "Telmisartan", dosage: "40mg", reasoning: "Based on History of Hypertension" },
  ],
  "blood pressure": [
    { name: "Telmisartan", dosage: "40mg", reasoning: "Based on History of Hypertension" },
  ],
  fever: [
    { name: "Paracetamol", dosage: "500mg", reasoning: "Symptom: Fever" },
  ],
  pain: [
    { name: "Paracetamol", dosage: "500mg", reasoning: "Symptom: Pain" },
    { name: "Ibuprofen", dosage: "400mg", reasoning: "Symptom: Pain" },
  ],
  cough: [
    { name: "Cetirizine", dosage: "10mg", reasoning: "Symptom: Cough/Allergy" },
  ],
  headache: [
    { name: "Paracetamol", dosage: "500mg", reasoning: "Symptom: Headache" },
  ],
};

/**
 * Given symptom text (e.g. from input), returns suggested medications whose symptom keyword appears in the text.
 * Uses lowercase matching. Deduplicates by name+dosage.
 */
export function getMedicationSuggestionsFromSymptoms(symptomText: string): SymptomMedicationSuggestion[] {
  if (!symptomText || !symptomText.trim()) return [];
  const lower = symptomText.toLowerCase().trim();
  const seen = new Set<string>();
  const result: SymptomMedicationSuggestion[] = [];
  for (const [keyword, meds] of Object.entries(SYMPTOM_TO_MEDICATIONS)) {
    if (lower.includes(keyword)) {
      for (const m of meds) {
        const key = `${m.name}-${m.dosage}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(m);
        }
      }
    }
  }
  return result;
}

// ============================================
// DOZ3 Doctor App - Comprehensive Medicine Database
// This will be replaced by a backend API + search later
// ============================================

import type { Medicine } from "../types/medicine";

export const MEDICINE_DATABASE: Medicine[] = [
  // ──── Diabetes ────
  {
    id: "MED-001", name: "Metformin", genericName: "Metformin Hydrochloride", brand: "Glucophage / Glycomet",
    dosages: ["250mg", "500mg", "850mg", "1000mg"], type: "Tablet", category: "Diabetes", schedule: "H",
    sideEffects: ["Nausea", "Diarrhea", "Abdominal discomfort", "Metallic taste"],
    contraindications: ["Renal impairment", "Hepatic disease", "Alcoholism"],
    interactions: ["Iodinated contrast agents", "Alcohol", "Cimetidine"],
    usageNotes: "Take with food. Start with low dose and titrate up. Monitor renal function.",
    priceRange: "₹3-12 per strip", incentivePerUnit: 8, unitType: "strip", inStock: true,
  },
  {
    id: "MED-002", name: "Glimepiride", genericName: "Glimepiride", brand: "Amaryl / Glimisave",
    dosages: ["1mg", "2mg", "3mg", "4mg"], type: "Tablet", category: "Diabetes", schedule: "H",
    sideEffects: ["Hypoglycemia", "Weight gain", "Dizziness", "Nausea"],
    contraindications: ["Type 1 Diabetes", "Diabetic ketoacidosis", "Severe hepatic impairment"],
    interactions: ["Beta-blockers", "NSAIDs", "Warfarin"],
    usageNotes: "Take with breakfast. Educate patient about hypoglycemia signs. Carry glucose tablets.",
    priceRange: "₹4-15 per strip", incentivePerUnit: 10, unitType: "strip", inStock: true,
  },
  {
    id: "MED-003", name: "Sitagliptin", genericName: "Sitagliptin Phosphate", brand: "Januvia / Istavel",
    dosages: ["25mg", "50mg", "100mg"], type: "Tablet", category: "Diabetes", schedule: "H",
    sideEffects: ["Upper respiratory infection", "Headache", "Nasopharyngitis"],
    contraindications: ["History of pancreatitis", "Severe renal impairment"],
    interactions: ["Digoxin", "Other DPP-4 inhibitors"],
    usageNotes: "Can be taken with or without food. Low risk of hypoglycemia as monotherapy.",
    priceRange: "₹25-50 per strip", incentivePerUnit: 35, unitType: "strip", inStock: true,
  },
  {
    id: "MED-004", name: "Insulin Glargine", genericName: "Insulin Glargine", brand: "Lantus / Basalog",
    dosages: ["100 IU/mL"], type: "Injection", category: "Diabetes", schedule: "H",
    sideEffects: ["Hypoglycemia", "Injection site reaction", "Weight gain", "Lipodystrophy"],
    contraindications: ["Hypoglycemia episodes"],
    interactions: ["Beta-blockers", "ACE inhibitors", "Oral anti-diabetics"],
    usageNotes: "Inject subcutaneously once daily at the same time. Rotate injection sites.",
    priceRange: "₹500-900 per pen", incentivePerUnit: 120, unitType: "pen", inStock: true,
  },

  // ──── Hypertension ────
  {
    id: "MED-010", name: "Telmisartan", genericName: "Telmisartan", brand: "Telma / Telsartan",
    dosages: ["20mg", "40mg", "80mg"], type: "Tablet", category: "Hypertension", schedule: "H",
    sideEffects: ["Dizziness", "Back pain", "Diarrhea", "Upper respiratory infection"],
    contraindications: ["Pregnancy", "Bilateral renal artery stenosis", "Hyperkalemia"],
    interactions: ["NSAIDs", "Potassium supplements", "Lithium"],
    usageNotes: "Take at the same time daily. Monitor potassium and renal function.",
    priceRange: "₹5-18 per strip", incentivePerUnit: 12, unitType: "strip", inStock: true,
  },
  {
    id: "MED-011", name: "Amlodipine", genericName: "Amlodipine Besylate", brand: "Amlong / Amlokind",
    dosages: ["2.5mg", "5mg", "10mg"], type: "Tablet", category: "Hypertension", schedule: "H",
    sideEffects: ["Ankle edema", "Flushing", "Headache", "Dizziness", "Palpitations"],
    contraindications: ["Severe aortic stenosis", "Unstable angina", "Cardiogenic shock"],
    interactions: ["Simvastatin (high doses)", "CYP3A4 inhibitors", "Cyclosporine"],
    usageNotes: "Can be taken with or without food. May cause peripheral edema.",
    priceRange: "₹3-10 per strip", incentivePerUnit: 7, unitType: "strip", inStock: true,
  },
  {
    id: "MED-012", name: "Losartan", genericName: "Losartan Potassium", brand: "Losacar / Repace",
    dosages: ["25mg", "50mg", "100mg"], type: "Tablet", category: "Hypertension", schedule: "H",
    sideEffects: ["Dizziness", "Nasal congestion", "Back pain", "Fatigue"],
    contraindications: ["Pregnancy", "Severe hepatic impairment"],
    interactions: ["NSAIDs", "Potassium-sparing diuretics", "Lithium"],
    usageNotes: "Take once or twice daily. Good option for diabetic patients with proteinuria.",
    priceRange: "₹5-20 per strip", incentivePerUnit: 14, unitType: "strip", inStock: true,
  },
  {
    id: "MED-013", name: "Metoprolol", genericName: "Metoprolol Succinate", brand: "Betaloc / Met XL",
    dosages: ["12.5mg", "25mg", "50mg", "100mg"], type: "Tablet", category: "Hypertension", schedule: "H",
    sideEffects: ["Bradycardia", "Fatigue", "Cold extremities", "Dizziness"],
    contraindications: ["Heart block", "Severe bradycardia", "Decompensated heart failure"],
    interactions: ["Verapamil", "Clonidine", "MAOIs"],
    usageNotes: "Do not stop abruptly — taper gradually. Monitor heart rate.",
    priceRange: "₹5-15 per strip", incentivePerUnit: 9, unitType: "strip", inStock: true,
  },

  // ──── Cholesterol ────
  {
    id: "MED-020", name: "Atorvastatin", genericName: "Atorvastatin Calcium", brand: "Lipitor / Atorva",
    dosages: ["10mg", "20mg", "40mg", "80mg"], type: "Tablet", category: "Cholesterol", schedule: "H",
    sideEffects: ["Muscle pain", "Liver enzyme elevation", "Headache", "Nausea"],
    contraindications: ["Active liver disease", "Pregnancy", "Breastfeeding"],
    interactions: ["Cyclosporine", "Clarithromycin", "Gemfibrozil", "Grapefruit juice"],
    usageNotes: "Take at bedtime for best effect. Monitor liver function periodically.",
    priceRange: "₹5-25 per strip", incentivePerUnit: 18, unitType: "strip", inStock: true,
  },
  {
    id: "MED-021", name: "Rosuvastatin", genericName: "Rosuvastatin Calcium", brand: "Crestor / Rosuvas",
    dosages: ["5mg", "10mg", "20mg", "40mg"], type: "Tablet", category: "Cholesterol", schedule: "H",
    sideEffects: ["Myalgia", "Headache", "Abdominal pain", "Weakness"],
    contraindications: ["Active liver disease", "Pregnancy", "Severe renal impairment"],
    interactions: ["Cyclosporine", "Warfarin", "Antacids"],
    usageNotes: "Can be taken any time of day. Most potent statin per mg.",
    priceRange: "₹8-30 per strip", incentivePerUnit: 22, unitType: "strip", inStock: true,
  },

  // ──── Pain & Fever ────
  {
    id: "MED-030", name: "Paracetamol", genericName: "Acetaminophen", brand: "Crocin / Dolo",
    dosages: ["325mg", "500mg", "650mg"], type: "Tablet", category: "Pain & Fever", schedule: "OTC",
    sideEffects: ["Liver damage (overdose)", "Nausea", "Rash (rare)"],
    contraindications: ["Severe hepatic impairment", "Active liver disease"],
    interactions: ["Warfarin", "Alcohol", "Isoniazid"],
    usageNotes: "Max 4g/day in adults. Avoid with alcohol. Safe in pregnancy (short term).",
    priceRange: "₹2-5 per strip", incentivePerUnit: 3, unitType: "strip", inStock: true,
  },
  {
    id: "MED-031", name: "Ibuprofen", genericName: "Ibuprofen", brand: "Brufen / Combiflam",
    dosages: ["200mg", "400mg", "600mg"], type: "Tablet", category: "Pain & Fever", schedule: "H",
    sideEffects: ["GI upset", "Gastric ulcers", "Renal impairment", "Dizziness"],
    contraindications: ["Active GI bleeding", "Severe renal impairment", "Third trimester pregnancy"],
    interactions: ["Aspirin", "Anticoagulants", "ACE inhibitors", "Corticosteroids"],
    usageNotes: "Take with food. Avoid long-term use. Not recommended in dengue.",
    priceRange: "₹3-10 per strip", incentivePerUnit: 6, unitType: "strip", inStock: true,
  },
  {
    id: "MED-032", name: "Diclofenac", genericName: "Diclofenac Sodium", brand: "Voveran / Voltaren",
    dosages: ["25mg", "50mg", "75mg SR"], type: "Tablet", category: "Pain & Fever", schedule: "H",
    sideEffects: ["GI disturbance", "Headache", "Edema", "Hepatotoxicity"],
    contraindications: ["GI bleeding", "Severe heart failure", "Hepatic porphyria"],
    interactions: ["Anticoagulants", "Lithium", "Methotrexate", "Digoxin"],
    usageNotes: "Take with food. Short-term use preferred. Monitor renal/hepatic function.",
    priceRange: "₹3-12 per strip", incentivePerUnit: 8, unitType: "strip", inStock: true,
  },

  // ──── Antibiotics ────
  {
    id: "MED-040", name: "Azithromycin", genericName: "Azithromycin Dihydrate", brand: "Zithromax / Azithral",
    dosages: ["250mg", "500mg"], type: "Tablet", category: "Antibiotics", schedule: "H1",
    sideEffects: ["Diarrhea", "Nausea", "Abdominal pain", "Headache"],
    contraindications: ["Hypersensitivity to macrolides", "Severe hepatic impairment"],
    interactions: ["Antacids", "Warfarin", "Cyclosporine", "Digoxin"],
    usageNotes: "Take 1 hour before or 2 hours after meals. Complete full course.",
    priceRange: "₹10-30 per strip", incentivePerUnit: 20, unitType: "strip", inStock: true,
  },
  {
    id: "MED-041", name: "Amoxicillin", genericName: "Amoxicillin Trihydrate", brand: "Mox / Novamox",
    dosages: ["250mg", "500mg"], type: "Capsule", category: "Antibiotics", schedule: "H1",
    sideEffects: ["Diarrhea", "Rash", "Nausea", "Vomiting"],
    contraindications: ["Penicillin allergy", "Infectious mononucleosis"],
    interactions: ["Methotrexate", "Probenecid", "Oral contraceptives"],
    usageNotes: "Can be taken with or without food. Complete full course. Check for penicillin allergy.",
    priceRange: "₹5-15 per strip", incentivePerUnit: 10, unitType: "strip", inStock: true,
  },
  {
    id: "MED-042", name: "Ciprofloxacin", genericName: "Ciprofloxacin Hydrochloride", brand: "Ciplox / Cifran",
    dosages: ["250mg", "500mg", "750mg"], type: "Tablet", category: "Antibiotics", schedule: "H1",
    sideEffects: ["Nausea", "Diarrhea", "Tendon damage", "Photosensitivity"],
    contraindications: ["Children < 18 years", "Pregnancy", "Tendon disorders with fluoroquinolones"],
    interactions: ["Antacids", "Theophylline", "Warfarin", "NSAIDs"],
    usageNotes: "Avoid dairy products 2 hours before/after. Stay hydrated. Avoid sun exposure.",
    priceRange: "₹5-20 per strip", incentivePerUnit: 14, unitType: "strip", inStock: true,
  },
  {
    id: "MED-043", name: "Cefixime", genericName: "Cefixime Trihydrate", brand: "Taxim-O / Zifi",
    dosages: ["100mg", "200mg", "400mg"], type: "Tablet", category: "Antibiotics", schedule: "H1",
    sideEffects: ["Diarrhea", "Abdominal pain", "Nausea", "Headache"],
    contraindications: ["Cephalosporin allergy", "Severe penicillin allergy (cross-reactivity)"],
    interactions: ["Anticoagulants", "Probenecid"],
    usageNotes: "Can be taken with or without food. Complete full course.",
    priceRange: "₹8-25 per strip", incentivePerUnit: 16, unitType: "strip", inStock: true,
  },

  // ──── Gastric ────
  {
    id: "MED-050", name: "Pantoprazole", genericName: "Pantoprazole Sodium", brand: "Pan / Pantocid",
    dosages: ["20mg", "40mg"], type: "Tablet", category: "Gastric", schedule: "H",
    sideEffects: ["Headache", "Diarrhea", "Flatulence", "Abdominal pain"],
    contraindications: ["Hypersensitivity to PPIs"],
    interactions: ["Clopidogrel", "Methotrexate", "Ketoconazole"],
    usageNotes: "Take 30 minutes before meals on empty stomach. Avoid long-term use without review.",
    priceRange: "₹4-15 per strip", incentivePerUnit: 10, unitType: "strip", inStock: true,
  },
  {
    id: "MED-051", name: "Omeprazole", genericName: "Omeprazole", brand: "Omez / Prilosec",
    dosages: ["10mg", "20mg", "40mg"], type: "Capsule", category: "Gastric", schedule: "H",
    sideEffects: ["Headache", "Nausea", "Abdominal pain", "Vitamin B12 deficiency (long-term)"],
    contraindications: ["Hypersensitivity to PPIs"],
    interactions: ["Clopidogrel", "Diazepam", "Phenytoin"],
    usageNotes: "Take before meals. Do not crush capsule. Limit to 8 weeks when possible.",
    priceRange: "₹5-15 per strip", incentivePerUnit: 10, unitType: "strip", inStock: true,
  },
  {
    id: "MED-052", name: "Domperidone", genericName: "Domperidone", brand: "Domstal / Motilium",
    dosages: ["10mg"], type: "Tablet", category: "Gastric", schedule: "H",
    sideEffects: ["Dry mouth", "Headache", "Galactorrhoea", "QT prolongation (rare)"],
    contraindications: ["Prolactinoma", "GI hemorrhage", "Cardiac conduction disorders"],
    interactions: ["Ketoconazole", "Erythromycin", "QT-prolonging drugs"],
    usageNotes: "Take 15-30 min before meals. Max 30mg/day. Short-term use.",
    priceRange: "₹3-8 per strip", incentivePerUnit: 5, unitType: "strip", inStock: true,
  },

  // ──── Allergy & Respiratory ────
  {
    id: "MED-060", name: "Cetirizine", genericName: "Cetirizine Dihydrochloride", brand: "Zyrtec / Cetzine",
    dosages: ["5mg", "10mg", "5mg/5mL syrup"], type: "Tablet", category: "Allergy", schedule: "OTC",
    sideEffects: ["Drowsiness", "Dry mouth", "Fatigue", "Headache"],
    contraindications: ["Severe renal impairment (without dose adjustment)"],
    interactions: ["CNS depressants", "Alcohol", "Theophylline"],
    usageNotes: "Can cause drowsiness. Take at bedtime if needed. Reduce dose in renal impairment.",
    priceRange: "₹2-8 per strip", incentivePerUnit: 5, unitType: "strip", inStock: true,
  },
  {
    id: "MED-061", name: "Montelukast", genericName: "Montelukast Sodium", brand: "Singulair / Montair",
    dosages: ["4mg", "5mg", "10mg"], type: "Tablet", category: "Respiratory", schedule: "H",
    sideEffects: ["Headache", "Abdominal pain", "Behavioural changes (rare)", "Dream abnormalities"],
    contraindications: ["Phenylketonuria (chewable tabs contain phenylalanine)"],
    interactions: ["Phenobarbital", "Rifampin"],
    usageNotes: "Take at bedtime. Not for acute asthma attacks. Monitor for mood changes.",
    priceRange: "₹8-20 per strip", incentivePerUnit: 14, unitType: "strip", inStock: true,
  },
  {
    id: "MED-062", name: "Salbutamol", genericName: "Salbutamol Sulfate", brand: "Asthalin / Ventolin",
    dosages: ["2mg tablet", "100mcg/puff inhaler", "2mg/5mL syrup"], type: "Inhaler", category: "Respiratory", schedule: "H",
    sideEffects: ["Tremor", "Palpitations", "Headache", "Muscle cramps"],
    contraindications: ["Hypertrophic obstructive cardiomyopathy"],
    interactions: ["Beta-blockers", "MAOIs", "Tricyclic antidepressants"],
    usageNotes: "Shake inhaler well. Use spacer for better delivery. Max 8 puffs/day.",
    priceRange: "₹80-150 per inhaler", incentivePerUnit: 45, unitType: "inhaler", inStock: true,
  },

  // ──── Cardiac ────
  {
    id: "MED-070", name: "Aspirin", genericName: "Acetylsalicylic Acid", brand: "Ecosprin / Disprin",
    dosages: ["75mg", "150mg", "325mg"], type: "Tablet", category: "Cardiac", schedule: "OTC",
    sideEffects: ["GI bleeding", "Tinnitus", "Bruising", "Dyspepsia"],
    contraindications: ["Active bleeding", "Peptic ulcer", "Aspirin allergy", "Children with viral illness"],
    interactions: ["Anticoagulants", "NSAIDs", "Methotrexate", "SSRIs"],
    usageNotes: "Take with food. Low-dose for cardiac protection. Avoid in dengue.",
    priceRange: "₹2-6 per strip", incentivePerUnit: 4, unitType: "strip", inStock: true,
  },
  {
    id: "MED-071", name: "Clopidogrel", genericName: "Clopidogrel Bisulfate", brand: "Plavix / Clopilet",
    dosages: ["75mg", "150mg"], type: "Tablet", category: "Cardiac", schedule: "H",
    sideEffects: ["Bleeding", "Bruising", "Diarrhea", "Rash"],
    contraindications: ["Active bleeding", "Severe hepatic impairment"],
    interactions: ["Omeprazole", "NSAIDs", "Warfarin"],
    usageNotes: "Do not stop without medical advice. Discontinue 5-7 days before surgery.",
    priceRange: "₹5-15 per strip", incentivePerUnit: 10, unitType: "strip", inStock: true,
  },

  // ──── Thyroid ────
  {
    id: "MED-080", name: "Levothyroxine", genericName: "Levothyroxine Sodium", brand: "Thyronorm / Eltroxin",
    dosages: ["12.5mcg", "25mcg", "50mcg", "75mcg", "100mcg", "150mcg"], type: "Tablet", category: "Thyroid", schedule: "H",
    sideEffects: ["Palpitations", "Weight loss", "Tremor", "Insomnia"],
    contraindications: ["Thyrotoxicosis", "Untreated adrenal insufficiency"],
    interactions: ["Calcium supplements", "Iron supplements", "Antacids", "Soy products"],
    usageNotes: "Take on empty stomach 30-60 min before breakfast. Separate from calcium/iron by 4 hours.",
    priceRange: "₹3-10 per strip", incentivePerUnit: 6, unitType: "strip", inStock: true,
  },

  // ──── Vitamins & Supplements ────
  {
    id: "MED-090", name: "Vitamin D3", genericName: "Cholecalciferol", brand: "D-Rise / Uprise",
    dosages: ["1000 IU", "2000 IU", "60,000 IU (sachet)"], type: "Tablet", category: "Vitamins & Supplements", schedule: "OTC",
    sideEffects: ["Hypercalcemia (excess)", "Nausea", "Constipation"],
    contraindications: ["Hypercalcemia", "Vitamin D toxicity"],
    interactions: ["Thiazide diuretics", "Digoxin"],
    usageNotes: "60,000 IU weekly for deficiency. Take with fatty food for absorption.",
    priceRange: "₹5-30 per sachet", incentivePerUnit: 18, unitType: "sachet", inStock: true,
  },
  {
    id: "MED-091", name: "Calcium + Vitamin D3", genericName: "Calcium Carbonate + Cholecalciferol", brand: "Shelcal / CCM",
    dosages: ["500mg+250IU", "1000mg+200IU"], type: "Tablet", category: "Vitamins & Supplements", schedule: "OTC",
    sideEffects: ["Constipation", "Bloating", "Gas"],
    contraindications: ["Hypercalcemia", "Renal calculi"],
    interactions: ["Thyroid hormones", "Tetracycline", "Bisphosphonates"],
    usageNotes: "Take with meals. Space 2 hours from thyroid medication. Avoid with high-oxalate foods.",
    priceRange: "₹8-20 per strip", incentivePerUnit: 12, unitType: "strip", inStock: true,
  },
  {
    id: "MED-092", name: "Iron + Folic Acid", genericName: "Ferrous Fumarate + Folic Acid", brand: "Autrin / Fefol",
    dosages: ["100mg+0.5mg", "150mg+0.5mg"], type: "Tablet", category: "Vitamins & Supplements", schedule: "OTC",
    sideEffects: ["Constipation", "Black stools", "Nausea", "Metallic taste"],
    contraindications: ["Hemochromatosis", "Hemolytic anemia"],
    interactions: ["Antacids", "Tetracycline", "Calcium supplements", "Tea/Coffee"],
    usageNotes: "Take on empty stomach with vitamin C for better absorption. Separate from tea by 2 hours.",
    priceRange: "₹5-15 per strip", incentivePerUnit: 8, unitType: "strip", inStock: true,
  },

  // ──── Dermatology ────
  {
    id: "MED-100", name: "Clotrimazole", genericName: "Clotrimazole", brand: "Candid / Canesten",
    dosages: ["1% cream", "1% dusting powder"], type: "Cream", category: "Dermatology", schedule: "OTC",
    sideEffects: ["Local irritation", "Burning sensation", "Redness"],
    contraindications: ["Hypersensitivity to azole antifungals"],
    interactions: ["None significant for topical use"],
    usageNotes: "Apply 2-3 times daily. Continue for 2 weeks after symptoms resolve.",
    priceRange: "₹30-80 per tube", incentivePerUnit: 25, unitType: "tube", inStock: true,
  },
  {
    id: "MED-101", name: "Betamethasone", genericName: "Betamethasone Valerate", brand: "Betnovate / Diprosone",
    dosages: ["0.05% cream", "0.1% cream"], type: "Cream", category: "Dermatology", schedule: "H",
    sideEffects: ["Skin thinning", "Stretch marks", "Acne", "Pigmentation changes"],
    contraindications: ["Skin infections", "Rosacea", "Perioral dermatitis"],
    interactions: ["None significant for topical use"],
    usageNotes: "Apply thin layer. Do not use on face/groin long-term. Taper, don't stop abruptly.",
    priceRange: "₹40-100 per tube", incentivePerUnit: 35, unitType: "tube", inStock: true,
  },

  // ──── Neurology ────
  {
    id: "MED-110", name: "Sumatriptan", genericName: "Sumatriptan Succinate", brand: "Suminat / Imitrex",
    dosages: ["25mg", "50mg", "100mg"], type: "Tablet", category: "Neurology", schedule: "H",
    sideEffects: ["Tingling", "Flushing", "Dizziness", "Chest tightness"],
    contraindications: ["Ischemic heart disease", "Uncontrolled hypertension", "Basilar migraine"],
    interactions: ["SSRIs/SNRIs (serotonin syndrome)", "MAOIs", "Ergotamine"],
    usageNotes: "Take at onset of migraine. Max 200mg/day. Not for prevention.",
    priceRange: "₹15-40 per strip", incentivePerUnit: 28, unitType: "strip", inStock: true,
  },
  {
    id: "MED-111", name: "Pregabalin", genericName: "Pregabalin", brand: "Lyrica / Pregastar",
    dosages: ["50mg", "75mg", "150mg", "300mg"], type: "Capsule", category: "Neurology", schedule: "H",
    sideEffects: ["Dizziness", "Drowsiness", "Weight gain", "Blurred vision"],
    contraindications: ["Galactose intolerance"],
    interactions: ["CNS depressants", "Alcohol", "Opioids"],
    usageNotes: "Taper gradually when stopping. May impair driving. Adjust dose in renal impairment.",
    priceRange: "₹10-30 per strip", incentivePerUnit: 20, unitType: "strip", inStock: true,
  },

  // ──── Orthopaedic ────
  {
    id: "MED-120", name: "Aceclofenac", genericName: "Aceclofenac", brand: "Zerodol / Hifenac",
    dosages: ["100mg", "200mg SR"], type: "Tablet", category: "Orthopaedic", schedule: "H",
    sideEffects: ["GI disturbance", "Dizziness", "Hepatic enzyme elevation"],
    contraindications: ["GI bleeding", "Severe hepatic impairment", "Renal failure"],
    interactions: ["Anticoagulants", "Lithium", "Diuretics"],
    usageNotes: "Take with food. Short courses preferred. Monitor liver function.",
    priceRange: "₹5-15 per strip", incentivePerUnit: 10, unitType: "strip", inStock: true,
  },
  {
    id: "MED-121", name: "Thiocolchicoside", genericName: "Thiocolchicoside", brand: "Myoril / Myospaz",
    dosages: ["4mg", "8mg"], type: "Capsule", category: "Orthopaedic", schedule: "H",
    sideEffects: ["Drowsiness", "Diarrhea", "Nausea", "Allergic reactions"],
    contraindications: ["Pregnancy", "Breastfeeding", "Epilepsy"],
    interactions: ["CNS depressants", "Alcohol"],
    usageNotes: "Muscle relaxant. Max 7 days of oral use. Take after meals.",
    priceRange: "₹6-18 per strip", incentivePerUnit: 12, unitType: "strip", inStock: true,
  },
];

/** Get all unique categories from the database */
export function getMedicineCategories(): string[] {
  const cats = new Set(MEDICINE_DATABASE.map((m) => m.category));
  return Array.from(cats).sort();
}

/** Search medicines by name, generic name, or brand */
export function searchMedicines(query: string, category?: string): Medicine[] {
  let results = MEDICINE_DATABASE;
  if (category && category !== "All") {
    results = results.filter((m) => m.category === category);
  }
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    results = results.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }
  return results;
}


  # Doctor App Prototype Flow

  This is a code bundle for Doctor App Prototype Flow. The original project is available at https://www.figma.com/design/hq4Gw5TOd0nKdh8IC60NpU/Doctor-App-Prototype-Flow.

  ## Running the code

  1. **Install dependencies** (required first time; `node_modules` was missing):
     ```bash
     npm install
     ```
  2. **Start the local dev server**:
     ```bash
     npm run dev
     ```
  3. Open **http://localhost:5173** in your browser.

  If `vite` is not recognized, ensure you ran `npm install` from the project root so `node_modules/.bin` exists.

  ## DOZ3 Doctor Dashboard – progress

  - **Theme & layout**: Tailwind primary #0F4C81, accent #10B981, Inter font; iPad Pro 11" (1194×834) layout; persistent sidebar (Dashboard, Patients, Earnings).
  - **AI Prescriber**: DosageRoller (Morning/Afternoon/Night 0–5 scroll); AI Reasoning badge; Doctor Override (amber highlight when dosage is changed from AI suggestion).
  - **Scan → Patient flow**: Scan simulates “Rajesh Kumar”; Patient Profile split-screen (left: history + BP graph with Recharts, right: consultation); Confirm & Create Order → Success (₹450) with Print Prescription button.
  - **Print**: Print stylesheet hides sidebar/buttons; prescription shows “DOZ3 Digital Health” header, patient name, date, medicines in 1-0-1 format.
  - **Symptom → medication**: `src/app/mockData.ts` maps symptoms to medications (e.g. typing “dizziness” suggests Glimepiride). **To connect your custom ML model**: replace or call your API from `getMedicationSuggestionsFromSymptoms()` in `mockData.ts` and use the same return shape (`SymptomMedicationSuggestion[]`); the AI Prescriber already consumes that for suggestions.
  
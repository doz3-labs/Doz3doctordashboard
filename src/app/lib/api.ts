const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

const TOKEN_KEY = "doz3_doctor_token";
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// ── Token management ──

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* noop */ }
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* noop */ }
}

// ── Simple in-memory cache for GET requests ──

interface CacheEntry<T> { data: T; ts: number; }
const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 60_000; // 1 minute

function getCached<T>(key: string, ttl: number): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T) {
  cache.set(key, { data, ts: Date.now() });
}

export function invalidateCache(pattern?: string) {
  if (!pattern) { cache.clear(); return; }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}

// ── Core fetch with auth + retry ──

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function parseJsonSafe(res: Response) {
  const text = await res.text().catch(() => "");
  try { return text ? JSON.parse(text) : null; }
  catch { return text; }
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY * (attempt + 1)));
    }
  }
  throw new Error("fetchWithRetry: exhausted retries");
}

// ── Public helpers ──

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithRetry(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = await parseJsonSafe(res);
    throw new Error(`POST ${path} failed (${res.status}): ${typeof b === "string" ? b : JSON.stringify(b)}`);
  }
  return (await res.json()) as T;
}

export async function getJson<T>(path: string, cacheTtl?: number): Promise<T> {
  const ttl = cacheTtl ?? 0;
  if (ttl > 0) {
    const cached = getCached<T>(path, ttl);
    if (cached) return cached;
  }
  const res = await fetchWithRetry(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const b = await parseJsonSafe(res);
    throw new Error(`GET ${path} failed (${res.status}): ${typeof b === "string" ? b : JSON.stringify(b)}`);
  }
  const data = (await res.json()) as T;
  if (ttl > 0) setCache(path, data);
  return data;
}

export async function putJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithRetry(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = await parseJsonSafe(res);
    throw new Error(`PUT ${path} failed (${res.status}): ${typeof b === "string" ? b : JSON.stringify(b)}`);
  }
  return (await res.json()) as T;
}

// ── Auth endpoints ──

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  role: string;
  name: string;
}

export async function loginDoctor(phone: string, otp: string): Promise<LoginResponse> {
  // The backend's LoginRequest field is `phone` — sending `phone_number` 422s.
  const data = await postJson<LoginResponse>("/auth/doctor/login", { phone, otp });
  setToken(data.access_token);
  return data;
}

export function logoutDoctor() {
  clearToken();
  invalidateCache();
}

// ── Medication endpoints ──

export interface MedicationAPI {
  id: string;
  name: string;
  dosage: string;
  form_factor: string;
  salt_composition: string | null;
  manufacturer: string | null;
  drug_schedule: string | null;
  requires_prescription: boolean;
  hsn_code: string | null;
  gst_percent: number | null;
  mrp_paise: number | null;
}

export async function searchMedications(
  q?: string,
  formFactor?: string,
  schedule?: string,
  limit = 100,
  offset = 0,
): Promise<MedicationAPI[]> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (formFactor) params.set("form_factor", formFactor);
  if (schedule) params.set("schedule", schedule);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return getJson<MedicationAPI[]>(`/medications/?${params}`, DEFAULT_TTL);
}

export async function getAllMedications(): Promise<MedicationAPI[]> {
  return getJson<MedicationAPI[]>("/medications/?limit=2000", 5 * 60_000);
}

// ── Patient endpoints ──

export interface PatientAPI {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  abha_address: string;
}

export async function listPatients(search?: string): Promise<PatientAPI[]> {
  // The backend reads `q`; `search` was silently ignored and returned everything.
  const qs = search ? `?q=${encodeURIComponent(search)}` : "";
  return getJson<PatientAPI[]>(`/patients/${qs}`, DEFAULT_TTL);
}

export async function createOrUpsertPatient(data: {
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  abha_address: string;
}): Promise<PatientAPI> {
  invalidateCache("/patients/");
  return postJson<PatientAPI>("/patients/", data);
}

// ── Prescription endpoints ──

export interface PrescriptionAPI {
  id: string;
  patient_id: string;
  abdm_record_id: string;
  valid_until: string;
  duration_days: number;
  doctor_id: string | null;
  dose_schedules: Array<{
    id: string;
    medication_id: string;
    time_slot: string;
    quantity: number;
  }>;
}

export async function createPrescription(data: {
  patient_id: string;
  abdm_record_id: string;
  valid_until: string;
  duration_days: number;
  doctor_id?: string;
  dose_schedules: Array<{
    medication_id: string;
    time_slot: "Morning" | "Noon" | "Night";
    quantity: number;
  }>;
}): Promise<PrescriptionAPI> {
  return postJson<PrescriptionAPI>("/prescriptions/", data);
}

export async function getPatientPrescriptions(patientId: string): Promise<PrescriptionAPI[]> {
  // The backend filters via a query param; there is no /prescriptions/patient/{id} route.
  const qs = `?patient_id=${encodeURIComponent(patientId)}`;
  return getJson<PrescriptionAPI[]>(`/prescriptions/${qs}`, DEFAULT_TTL);
}

// ── Order endpoints ──

export interface OrderAPI {
  id: string;
  patient_id: string;
  status: string;
  delivery_address: string;
  total_amount_paise: number;
  created_at: string;
}

export async function createOrderFromPrescription(
  prescriptionId: string,
  deliveryAddress: string,
): Promise<OrderAPI> {
  return postJson<OrderAPI>(`/orders/from-prescription/${prescriptionId}`, {
    delivery_address: deliveryAddress,
  });
}

export async function confirmPayment(orderId: string): Promise<unknown> {
  return postJson(`/payments/${orderId}/confirm`, {});
}

// ── Adherence endpoints ──
//
// The doctor's non-monetary win (PRD §1a): visibility into whether their own
// patients are actually taking what was prescribed. A doctor token reaches any
// patient's adherence — require_patient_access treats staff as authorized.

export interface AdherenceSummaryAPI {
  patient_id: string;
  start: string;
  end: string;
  /** Doses the schedule expected over the window. */
  expected: number;
  taken: number;
  missed: number;
  /** null when nothing was expected — distinct from 0%. */
  adherence_percent: number | null;
}

export interface DoseTakenAPI {
  id: string;
  patient_id: string;
  scheduled_date: string;
  time_slot: "Morning" | "Noon" | "Night";
  taken_at: string;
  source: string;
}

/** ISO date (YYYY-MM-DD) `days` before today, or today when days = 0. */
export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function getAdherenceSummary(
  patientId: string,
  start: string,
  end: string,
): Promise<AdherenceSummaryAPI> {
  const qs = `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  // Short TTL: a patient marking a dose should show up promptly.
  return getJson<AdherenceSummaryAPI>(
    `/patients/${encodeURIComponent(patientId)}/adherence/summary${qs}`,
    15_000,
  );
}

export async function getAdherenceEvents(
  patientId: string,
  start: string,
  end: string,
): Promise<DoseTakenAPI[]> {
  const qs = `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  return getJson<DoseTakenAPI[]>(
    `/patients/${encodeURIComponent(patientId)}/adherence${qs}`,
    15_000,
  );
}

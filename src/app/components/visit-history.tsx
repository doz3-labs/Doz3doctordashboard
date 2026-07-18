import { useCallback, useEffect, useState } from "react";
import { Activity, AlertCircle, Clock, Droplet, Heart, Pill, Thermometer, Weight } from "lucide-react";
import { Card } from "./ui/card";
import {
  getLatestVitals,
  listEncounters,
  type EncounterAPI,
  type LatestVitalsAPI,
} from "../lib/api";

/**
 * Real consultation history and vitals, from the encounters the doctor recorded.
 *
 * Replaces a fixture timeline that always read "Visit History (0)" for any
 * patient that actually existed on the server.
 */

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** How long ago, for dating a vital that came from an older visit. */
function relative(iso: string | null): string {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 31) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

interface VisitHistoryProps {
  /** Backend patient UUID. Absent for device-local records. */
  patientId?: string;
  /**
   * Which half to render. Vitals and the timeline sit in different columns of
   * the patient detail view, so they mount separately; the API client's TTL
   * cache means the second mount reuses the first one's fetch.
   */
  only?: "vitals" | "history";
}

export function VisitHistory({ patientId, only }: VisitHistoryProps) {
  const [encounters, setEncounters] = useState<EncounterAPI[]>([]);
  const [vitals, setVitals] = useState<LatestVitalsAPI | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const [e, v] = await Promise.all([
        listEncounters(patientId),
        getLatestVitals(patientId),
      ]);
      setEncounters(e);
      setVitals(v);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load visit history");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!patientId) {
    return (
      <Card className="border border-border shadow-sm">
        <Header count={null} />
        <div className="p-4 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            This record is local to this device, so it has no consultation history.
          </p>
        </div>
      </Card>
    );
  }

  if (only === "vitals") {
    return <VitalsCard vitals={vitals} loading={loading} />;
  }

  return (
    <div className="space-y-3">
      {only === undefined ? <VitalsCard vitals={vitals} loading={loading} /> : null}

      <Card className="border border-border shadow-sm">
        <Header count={encounters.length} />
        <div className="p-4">
          {error ? (
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground">{error}</p>
                <button onClick={() => void load()} className="text-xs text-primary font-medium hover:underline mt-1">
                  Retry
                </button>
              </div>
            </div>
          ) : loading && encounters.length === 0 ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 w-40 bg-muted rounded" />
              <div className="h-3 w-64 bg-muted rounded" />
            </div>
          ) : encounters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No consultations recorded yet. Recording one creates the visit history
              a repeat prescription is built from.
            </p>
          ) : (
            <ol className="space-y-4">
              {encounters.map((e) => (
                <li key={e.id} className="border-l-2 border-primary/30 pl-4 relative">
                  <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {e.diagnosis || e.chief_complaint || "Consultation"}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(e.occurred_at)}
                    </span>
                  </div>

                  {e.chief_complaint && e.diagnosis ? (
                    <p className="text-xs text-muted-foreground mt-0.5">{e.chief_complaint}</p>
                  ) : null}

                  {(e.systolic_mmhg || e.heart_rate_bpm || e.weight_kg) ? (
                    <p className="text-xs text-muted-foreground mt-1">
                      {e.systolic_mmhg ? `BP ${e.systolic_mmhg}/${e.diastolic_mmhg}` : null}
                      {e.heart_rate_bpm ? ` · HR ${e.heart_rate_bpm}` : null}
                      {e.weight_kg ? ` · ${e.weight_kg}kg` : null}
                      {e.blood_glucose_mgdl ? ` · Glucose ${e.blood_glucose_mgdl}` : null}
                    </p>
                  ) : null}

                  {e.prescriptions.length > 0 ? (
                    <p className="text-xs text-foreground/80 mt-1 flex items-start gap-1">
                      <Pill className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      {e.prescriptions.flatMap((p) => p.medications).join(", ")}
                    </p>
                  ) : null}

                  {e.notes ? <p className="text-xs text-muted-foreground mt-1">{e.notes}</p> : null}

                  {e.follow_up_date ? (
                    <p className="text-xs text-amber-700 mt-1">
                      Follow-up {fmtDate(e.follow_up_date)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </div>
      </Card>
    </div>
  );
}

function Header({ count }: { count: number | null }) {
  return (
    <div className="p-4 border-b border-border">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        Visit History{count === null ? "" : ` (${count})`}
      </h4>
    </div>
  );
}

function VitalsCard({ vitals, loading }: { vitals: LatestVitalsAPI | null; loading: boolean }) {
  const items = vitals
    ? [
        {
          Icon: Heart,
          label: "Blood Pressure",
          value: vitals.systolic_mmhg ? `${vitals.systolic_mmhg}/${vitals.diastolic_mmhg}` : null,
          at: vitals.blood_pressure_recorded_at,
          color: "text-red-500",
          bg: "bg-red-50",
        },
        {
          Icon: Droplet,
          label: "Blood Glucose",
          value: vitals.blood_glucose_mgdl ? `${vitals.blood_glucose_mgdl} mg/dL` : null,
          at: vitals.blood_glucose_recorded_at,
          color: "text-blue-500",
          bg: "bg-blue-50",
        },
        {
          Icon: Activity,
          label: "Heart Rate",
          value: vitals.heart_rate_bpm ? `${vitals.heart_rate_bpm} bpm` : null,
          at: vitals.heart_rate_recorded_at,
          color: "text-emerald-500",
          bg: "bg-emerald-50",
        },
        {
          Icon: Thermometer,
          label: "Temperature",
          value: vitals.temperature_c ? `${vitals.temperature_c} °C` : null,
          at: vitals.temperature_recorded_at,
          color: "text-orange-500",
          bg: "bg-orange-50",
        },
        {
          Icon: Weight,
          label: "Weight",
          value: vitals.weight_kg ? `${vitals.weight_kg} kg` : null,
          at: vitals.weight_recorded_at,
          color: "text-amber-500",
          bg: "bg-amber-50",
        },
        {
          Icon: Activity,
          label: "SpO2",
          value: vitals.spo2_percent ? `${vitals.spo2_percent}%` : null,
          at: vitals.spo2_recorded_at,
          color: "text-violet-500",
          bg: "bg-violet-50",
        },
      ]
    : [];

  const recorded = items.filter((i) => i.value !== null);

  return (
    <Card className="border border-border shadow-sm">
      <div className="p-4 border-b border-border">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Latest Vitals
        </h4>
      </div>
      <div className="p-4">
        {loading && !vitals ? (
          <div className="grid grid-cols-3 gap-3 animate-pulse">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        ) : recorded.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No vitals recorded yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {recorded.map(({ Icon, label, value, at, color, bg }) => (
              <div key={label} className={`${bg} rounded-lg p-3`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{value}</p>
                {/* Each sign is dated individually — the most recent weight and
                    the most recent BP often come from different visits. */}
                <p className="text-[10px] text-muted-foreground mt-0.5">{relative(at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

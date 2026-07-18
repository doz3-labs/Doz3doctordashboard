import { useCallback, useEffect, useState } from "react";
import { Activity, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Card } from "./ui/card";
import {
  getAdherenceEvents,
  getAdherenceSummary,
  isoDaysAgo,
  type AdherenceSummaryAPI,
  type DoseTakenAPI,
} from "../lib/api";

/**
 * Adherence visibility — the doctor's win (PRD §1a).
 *
 * This replaces the earnings surface that was removed. A per-prescription
 * incentive is very likely caught by MCI Reg 6.4.1; knowing whether your
 * patient actually took the medicine is not a payment, is legally durable,
 * and is the one asset a competitor cannot copy.
 */

const WINDOWS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
] as const;

/** 80% is the conventional clinical threshold for "adherent". */
const GOOD = 80;
const FAIR = 50;

function toneFor(percent: number) {
  if (percent >= GOOD) {
    return {
      text: "text-accent",
      bar: "bg-accent",
      pill: "bg-accent/10 text-accent",
      label: "On track",
    };
  }
  if (percent >= FAIR) {
    return {
      text: "text-amber-600",
      bar: "bg-amber-500",
      pill: "bg-amber-100 text-amber-800",
      label: "Slipping",
    };
  }
  return {
    text: "text-red-600",
    bar: "bg-red-500",
    pill: "bg-red-100 text-red-800",
    label: "At risk",
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface AdherenceCardProps {
  /** The backend patient UUID. Locally-added records don't have one. */
  patientId?: string;
  patientName?: string;
}

export function AdherenceCard({ patientId, patientName }: AdherenceCardProps) {
  const [days, setDays] = useState<number>(30);
  const [summary, setSummary] = useState<AdherenceSummaryAPI | null>(null);
  const [events, setEvents] = useState<DoseTakenAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    const start = isoDaysAgo(days);
    const end = isoDaysAgo(0);
    try {
      const [s, e] = await Promise.all([
        getAdherenceSummary(patientId, start, end),
        getAdherenceEvents(patientId, start, end),
      ]);
      setSummary(s);
      setEvents(e);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load adherence");
      setSummary(null);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [patientId, days]);

  useEffect(() => {
    void load();
  }, [load]);

  const header = (
    <div className="p-6 border-b border-border flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Adherence
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {patientName ? `Is ${patientName} taking what you prescribed?` : "Doses taken vs prescribed"}
        </p>
      </div>
      {patientId ? (
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            {WINDOWS.map((w) => (
              <button
                key={w.days}
                onClick={() => setDays(w.days)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === w.days
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => void load()}
            title="Refresh"
            className="p-2 rounded-md border border-border text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      ) : null}
    </div>
  );

  // A record that only exists on this device has no server-side history.
  if (!patientId) {
    return (
      <Card className="border border-border shadow-sm">
        {header}
        <div className="p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            This record is local to this device, so there is no adherence history
            for it. Adherence appears once the patient exists on the server and
            has a prescription.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-sm">
      {header}

      {error ? (
        <div className="p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium">Could not load adherence</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <button
              onClick={() => void load()}
              className="text-xs text-primary font-medium mt-2 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      ) : loading && !summary ? (
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-10 w-28 bg-muted rounded" />
          <div className="h-2 w-full bg-muted rounded-full" />
          <div className="h-3 w-48 bg-muted rounded" />
        </div>
      ) : summary ? (
        <AdherenceBody summary={summary} events={events} days={days} />
      ) : null}
    </Card>
  );
}

function AdherenceBody({
  summary,
  events,
  days,
}: {
  summary: AdherenceSummaryAPI;
  events: DoseTakenAPI[];
  days: number;
}) {
  // null means nothing was expected in this window — materially different from
  // 0%, which means doses were expected and none were taken.
  if (summary.adherence_percent === null || summary.expected === 0) {
    return (
      <div className="p-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-foreground font-medium">No doses expected</p>
          <p className="text-xs text-muted-foreground mt-1">
            There is no active dose schedule covering the last {days} days, so
            there is nothing to measure against yet.
          </p>
        </div>
      </div>
    );
  }

  const percent = summary.adherence_percent;
  const tone = toneFor(percent);

  return (
    <div className="p-6">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Doses taken</p>
          <div className="flex items-baseline gap-3">
            <h3 className={`text-4xl font-semibold ${tone.text}`}>
              {percent.toFixed(0)}%
            </h3>
            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${tone.pill}`}>
              {tone.label}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {summary.taken} of {summary.expected} doses
        </p>
      </div>

      {/* Not the Progress primitive: its indicator colour is fixed to
          bg-primary, and the tone here is the whole point. */}
      <div
        className="h-2 w-full rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Adherence"
      >
        <div
          className={`h-full rounded-full transition-all ${tone.bar}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <Stat label="Expected" value={summary.expected} />
        <Stat label="Taken" value={summary.taken} accent="text-accent" />
        <Stat label="Missed" value={summary.missed} accent={summary.missed > 0 ? "text-red-600" : undefined} />
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Recent doses
        </h4>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No doses marked taken in this window.
          </p>
        ) : (
          <ul className="space-y-2">
            {events.slice(0, 6).map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
              >
                <span className="text-foreground">{formatDate(e.scheduled_date)}</span>
                <span className="text-muted-foreground">{e.time_slot}</span>
                <span className="text-xs text-muted-foreground">{e.source}</span>
              </li>
            ))}
          </ul>
        )}
        {events.length > 6 ? (
          <p className="text-xs text-muted-foreground mt-3">
            +{events.length - 6} more in this window
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${accent ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}

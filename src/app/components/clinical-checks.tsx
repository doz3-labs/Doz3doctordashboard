import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Ban, Info, Loader2, ShieldCheck } from "lucide-react";
import { Card } from "./ui/card";
import { checkRegimen, type ClinicalFinding, type Severity } from "../lib/api";

/**
 * Safety review of the regimen the doctor has actually chosen.
 *
 * Deliberately not branded as AI: the rules are deterministic, and every
 * finding shows the reason it fired. The screen this replaced said
 * "AI Reasoning: AI-generated based on patient history" over a rule that
 * simply copied the patient's existing medications forward.
 */

const TONE: Record<Severity, { pill: string; border: string; Icon: typeof AlertTriangle }> = {
  Contraindicated: {
    pill: "bg-red-100 text-red-800",
    border: "border-l-red-500",
    Icon: Ban,
  },
  Major: {
    pill: "bg-orange-100 text-orange-800",
    border: "border-l-orange-500",
    Icon: AlertTriangle,
  },
  Moderate: {
    pill: "bg-amber-100 text-amber-800",
    border: "border-l-amber-500",
    Icon: AlertTriangle,
  },
  Minor: {
    pill: "bg-zinc-100 text-zinc-700",
    border: "border-l-zinc-400",
    Icon: Info,
  },
};

const KIND_LABEL: Record<ClinicalFinding["kind"], string> = {
  interaction: "Interaction",
  contraindication: "Contraindication",
  age_caution: "Age caution",
  duplicate_therapy: "Duplicate therapy",
};

interface ClinicalChecksProps {
  /** Generic drug names currently on the prescription. */
  drugs: string[];
  age: number | null;
  conditions?: string[];
  allergies?: string[];
}

export function ClinicalChecks({ drugs, age, conditions = [], allergies = [] }: ClinicalChecksProps) {
  const [findings, setFindings] = useState<ClinicalFinding[]>([]);
  const [ageApplied, setAgeApplied] = useState(true);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-check whenever the regimen changes. Joined into a string so the effect
  // keys on contents rather than array identity.
  const key = drugs.map((d) => d.toLowerCase()).sort().join("|");

  const run = useCallback(async () => {
    if (drugs.length === 0) {
      setFindings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await checkRegimen({ drugs, age, conditions, allergies });
      setFindings(res.findings);
      setAgeApplied(res.age_rules_applied);
      setDisclaimer(res.disclaimer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not run safety checks");
      setFindings([]);
    } finally {
      setLoading(false);
    }
    // conditions/allergies are stable per patient; key covers the drug list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, age]);

  useEffect(() => {
    void run();
  }, [run]);

  const worst = findings[0]?.severity;
  const blocking = findings.filter((f) => f.severity === "Contraindicated").length;

  return (
    <Card className="border border-border shadow-sm">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : findings.length === 0 ? (
            <ShieldCheck className="h-4 w-4 text-accent" />
          ) : (
            <AlertTriangle className={`h-4 w-4 ${worst === "Contraindicated" ? "text-red-600" : "text-amber-600"}`} />
          )}
          Safety checks
        </h3>
        {findings.length > 0 ? (
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${TONE[worst!].pill}`}>
            {blocking > 0 ? `${blocking} contraindicated` : `${findings.length} to review`}
          </span>
        ) : null}
      </div>

      <div className="p-4 space-y-3">
        {error ? (
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground">{error}</p>
              <button onClick={() => void run()} className="text-xs text-primary font-medium hover:underline mt-1">
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {!error && drugs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add a medication to run safety checks.</p>
        ) : null}

        {!error && drugs.length > 0 && findings.length === 0 && !loading ? (
          <p className="text-sm text-muted-foreground">
            No rule matched this combination.{" "}
            <span className="text-xs">
              That is not the same as “safe” — these checks cover a limited rule set.
            </span>
          </p>
        ) : null}

        {findings.map((f, i) => {
          const tone = TONE[f.severity];
          return (
            <div key={`${f.kind}-${i}`} className={`border-l-2 ${tone.border} pl-3 py-1`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex px-1.5 py-0.5 text-[11px] rounded ${tone.pill}`}>
                  {f.severity}
                </span>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  {KIND_LABEL[f.kind]}
                </span>
              </div>
              <p className="text-sm text-foreground">{f.message}</p>
              {f.management ? (
                <p className="text-xs text-foreground/80 mt-1">
                  <span className="font-medium">Action:</span> {f.management}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">Basis:</span> {f.basis}
              </p>
            </div>
          );
        })}

        {!ageApplied && drugs.length > 0 ? (
          <p className="text-xs text-amber-700 border-t border-border pt-2">
            No date of birth on file, so age-based checks did not run. This is not a pass —
            add a date of birth to enable them.
          </p>
        ) : null}

        {disclaimer && findings.length > 0 ? (
          <p className="text-[11px] text-muted-foreground border-t border-border pt-2">{disclaimer}</p>
        ) : null}
      </div>
    </Card>
  );
}

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search,
  Pill,
  ChevronDown,
  ChevronUp,
  Shield,
  IndianRupee,
  Loader2,
  Filter,
  Package,
} from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { searchMedications, type MedicationAPI } from "../lib/api";

const FORM_FACTORS = [
  "All", "Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment",
  "Drops", "Inhaler", "Gel", "Patch", "Powder", "Sachet", "Suspension",
  "Lotion", "Spray", "Suppository", "Mouthwash",
];

const SCHEDULES = [
  { label: "All Schedules", value: "" },
  { label: "OTC", value: "OTC" },
  { label: "Schedule G", value: "ScheduleG" },
  { label: "Schedule H", value: "ScheduleH" },
  { label: "Schedule H1", value: "ScheduleH1" },
  { label: "Schedule X", value: "ScheduleX" },
];

const scheduleColors: Record<string, string> = {
  OTC: "bg-emerald-100 text-emerald-700",
  ScheduleG: "bg-lime-100 text-lime-700",
  ScheduleH: "bg-blue-100 text-blue-700",
  ScheduleH1: "bg-orange-100 text-orange-700",
  ScheduleX: "bg-red-100 text-red-700",
};

const typeColors: Record<string, string> = {
  Tablet: "bg-blue-50 text-blue-700 border-blue-200",
  Capsule: "bg-violet-50 text-violet-700 border-violet-200",
  Syrup: "bg-amber-50 text-amber-700 border-amber-200",
  Injection: "bg-red-50 text-red-700 border-red-200",
  Cream: "bg-pink-50 text-pink-700 border-pink-200",
  Ointment: "bg-pink-50 text-pink-700 border-pink-200",
  Drops: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Inhaler: "bg-teal-50 text-teal-700 border-teal-200",
  Powder: "bg-gray-50 text-gray-700 border-gray-200",
  Gel: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Patch: "bg-orange-50 text-orange-700 border-orange-200",
  Sachet: "bg-lime-50 text-lime-700 border-lime-200",
  Suspension: "bg-amber-50 text-amber-700 border-amber-200",
  Lotion: "bg-rose-50 text-rose-700 border-rose-200",
  Spray: "bg-sky-50 text-sky-700 border-sky-200",
};

function scheduleLabel(s: string | null): string {
  if (!s) return "—";
  if (s === "OTC") return "OTC";
  return s.replace("Schedule", "Sch ");
}

function formatMRP(paise: number | null): string {
  if (!paise) return "—";
  return `₹${(paise / 100).toFixed(2)}`;
}

export function MedicineCatalog() {
  const [query, setQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState("All");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [medications, setMedications] = useState<MedicationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const PAGE_SIZE = 50;

  const fetchMedications = useCallback(
    async (resetPage = true) => {
      setLoading(true);
      try {
        const offset = resetPage ? 0 : page * PAGE_SIZE;
        const results = await searchMedications(
          query || undefined,
          selectedForm !== "All" ? selectedForm : undefined,
          selectedSchedule || undefined,
          PAGE_SIZE,
          offset,
        );
        if (resetPage) {
          setMedications(results);
          setPage(0);
        } else {
          setMedications((prev) => [...prev, ...results]);
        }
        setHasMore(results.length === PAGE_SIZE);
        setTotalCount(resetPage ? results.length : medications.length + results.length);
      } catch {
        if (resetPage) setMedications([]);
      } finally {
        setLoading(false);
      }
    },
    [query, selectedForm, selectedSchedule, page, medications.length],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchMedications(true), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedForm, selectedSchedule]);

  const formCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of medications) {
      counts[m.form_factor] = (counts[m.form_factor] || 0) + 1;
    }
    return counts;
  }, [medications]);

  const loadMore = () => {
    setPage((p) => p + 1);
    fetchMedications(false);
  };

  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg sm:text-xl text-foreground font-semibold flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Medicine Database
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {loading ? "Loading..." : `${totalCount}+ medicines from DOZ3 backend`}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col p-3 sm:p-4 lg:p-6">
          {/* Search + Schedule filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search medicine name or salt composition..."
                className="pl-10 py-5"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <select
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-2.5 bg-background text-foreground min-w-[140px]"
              >
                {SCHEDULES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Factor pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 hide-scrollbar">
            {FORM_FACTORS.map((ff) => (
              <button
                key={ff}
                onClick={() => setSelectedForm(ff)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedForm === ff
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {ff}
                {ff !== "All" && formCounts[ff] ? (
                  <span className="ml-1 opacity-60">({formCounts[ff]})</span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Results grid */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading && medications.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : medications.length === 0 ? (
              <Card className="p-8 text-center">
                <Pill className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No medicines found matching your search</p>
              </Card>
            ) : (
              <>
                {medications.map((med) => (
                  <MedicineCardAPI
                    key={med.id}
                    med={med}
                    isExpanded={expandedId === med.id}
                    onToggle={() => setExpandedId(expandedId === med.id ? null : med.id)}
                  />
                ))}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full py-3 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {loading ? "Loading..." : "Load more medicines"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MedicineCardAPI({
  med,
  isExpanded,
  onToggle,
}: {
  med: MedicationAPI;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 sm:p-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-bold text-foreground">{med.name}</h3>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                  typeColors[med.form_factor] ?? "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {med.form_factor}
              </span>
              {med.drug_schedule && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    scheduleColors[med.drug_schedule] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {scheduleLabel(med.drug_schedule)}
                </span>
              )}
              {med.requires_prescription ? (
                <span className="flex items-center gap-0.5 text-[10px] text-orange-600">
                  <Shield className="w-3 h-3" /> Rx
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-medium">OTC</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Dosage:</span> {med.dosage}
            </p>
            {med.salt_composition && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                <span className="font-medium">Salt:</span> {med.salt_composition}
              </p>
            )}
          </div>
          <div className="ml-2 flex items-center gap-2 flex-shrink-0">
            {med.mrp_paise ? (
              <span className="text-xs font-semibold text-foreground flex items-center">
                <IndianRupee className="w-3 h-3" />
                {formatMRP(med.mrp_paise)}
              </span>
            ) : null}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-border">
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <DetailBox label="Form Factor" value={med.form_factor} icon={<Package className="w-3 h-3" />} color="blue" />
            <DetailBox label="Dosage" value={med.dosage} icon={<Pill className="w-3 h-3" />} color="violet" />
            {med.salt_composition && (
              <DetailBox
                label="Salt / Composition"
                value={med.salt_composition}
                icon={<Pill className="w-3 h-3" />}
                color="teal"
              />
            )}
            {med.manufacturer && (
              <DetailBox label="Manufacturer" value={med.manufacturer} icon={<Package className="w-3 h-3" />} color="gray" />
            )}
            <DetailBox
              label="Drug Schedule"
              value={med.drug_schedule ? scheduleLabel(med.drug_schedule) : "Not classified"}
              icon={<Shield className="w-3 h-3" />}
              color="amber"
            />
            <DetailBox
              label="MRP"
              value={formatMRP(med.mrp_paise)}
              icon={<IndianRupee className="w-3 h-3" />}
              color="emerald"
            />
            {med.hsn_code && (
              <DetailBox label="HSN Code" value={med.hsn_code} icon={<Package className="w-3 h-3" />} color="gray" />
            )}
            {med.gst_percent != null && (
              <DetailBox label="GST" value={`${med.gst_percent}%`} icon={<IndianRupee className="w-3 h-3" />} color="orange" />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

const colorMap: Record<string, { bg: string; border: string; label: string; text: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-100", label: "text-blue-700", text: "text-blue-800" },
  violet: { bg: "bg-violet-50", border: "border-violet-100", label: "text-violet-700", text: "text-violet-800" },
  teal: { bg: "bg-teal-50", border: "border-teal-100", label: "text-teal-700", text: "text-teal-800" },
  amber: { bg: "bg-amber-50", border: "border-amber-100", label: "text-amber-700", text: "text-amber-800" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-100", label: "text-emerald-700", text: "text-emerald-800" },
  gray: { bg: "bg-gray-50", border: "border-gray-100", label: "text-gray-700", text: "text-gray-800" },
  orange: { bg: "bg-orange-50", border: "border-orange-100", label: "text-orange-700", text: "text-orange-800" },
};

function DetailBox({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const c = colorMap[color] ?? colorMap.gray;
  return (
    <div className={`p-2.5 rounded-lg ${c.bg} border ${c.border}`}>
      <p className={`text-[10px] font-semibold ${c.label} flex items-center gap-1 mb-0.5`}>
        {icon} {label}
      </p>
      <p className={`text-xs ${c.text} leading-relaxed break-words`}>{value}</p>
    </div>
  );
}

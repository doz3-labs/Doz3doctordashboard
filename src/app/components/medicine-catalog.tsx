import { useState } from "react";
import {
  Search,
  Pill,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Beaker,
  Shield,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { searchMedicines, getMedicineCategories, MEDICINE_DATABASE } from "../data/medicineDatabase";
import type { Medicine } from "../types/medicine";

export function MedicineCatalog() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ["All", ...getMedicineCategories()];
  const results = searchMedicines(query, selectedCategory);

  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl text-foreground font-semibold flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Medicine Database
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {MEDICINE_DATABASE.length} medicines across {getMedicineCategories().length} categories
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by medicine name, brand, or generic name..."
                className="pl-10 py-5"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
                {cat !== "All" && (
                  <span className="ml-1 opacity-60">
                    ({MEDICINE_DATABASE.filter((m) => m.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {results.length === 0 ? (
              <Card className="p-8 text-center">
                <Pill className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No medicines found matching your search</p>
              </Card>
            ) : (
              results.map((med) => (
                <MedicineCard
                  key={med.id}
                  medicine={med}
                  isExpanded={expandedId === med.id}
                  onToggle={() => setExpandedId(expandedId === med.id ? null : med.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MedicineCard({
  medicine,
  isExpanded,
  onToggle,
}: {
  medicine: Medicine;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const scheduleColors: Record<string, string> = {
    OTC: "bg-emerald-100 text-emerald-700",
    H: "bg-blue-100 text-blue-700",
    H1: "bg-orange-100 text-orange-700",
    X: "bg-red-100 text-red-700",
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
  };

  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-bold text-foreground">{medicine.name}</h3>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${typeColors[medicine.type] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
                {medicine.type}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${scheduleColors[medicine.schedule] ?? ""}`}>
                {medicine.schedule}
              </span>
              {medicine.inStock ? (
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" /> In Stock
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[10px] text-red-500">
                  <XCircle className="w-3 h-3" /> Out of Stock
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{medicine.genericName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="font-medium">Brand:</span> {medicine.brand} &middot;{" "}
              <span className="font-medium">Category:</span> {medicine.category}
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {medicine.dosages.map((d, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-[11px] text-foreground">
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="ml-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600">₹{medicine.incentivePerUnit} earned per {medicine.unitType}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Usage Notes */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1 mb-1">
                <Info className="w-3 h-3" /> Usage Notes
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">{medicine.usageNotes}</p>
            </div>

            {/* Side Effects */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3" /> Side Effects
              </p>
              <div className="flex flex-wrap gap-1">
                {medicine.sideEffects.map((se, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-amber-100 text-[10px] text-amber-800">
                    {se}
                  </span>
                ))}
              </div>
            </div>

            {/* Contraindications */}
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-1">
                <Shield className="w-3 h-3" /> Contraindications
              </p>
              <div className="flex flex-wrap gap-1">
                {medicine.contraindications.map((ci, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-red-100 text-[10px] text-red-800">
                    {ci}
                  </span>
                ))}
              </div>
            </div>

            {/* Drug Interactions */}
            <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
              <p className="text-xs font-semibold text-violet-700 flex items-center gap-1 mb-1">
                <Beaker className="w-3 h-3" /> Drug Interactions
              </p>
              <div className="flex flex-wrap gap-1">
                {medicine.interactions.map((di, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-violet-100 text-[10px] text-violet-800">
                    {di}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Incentive & Schedule */}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <IndianRupee className="w-3 h-3" /> ₹{medicine.incentivePerUnit} earned per {medicine.unitType}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Schedule: <strong>{medicine.schedule === "OTC" ? "Over the Counter" : `Schedule ${medicine.schedule}`}</strong>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

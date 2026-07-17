import { useRef, useEffect, useCallback } from "react";

const MIN = 0;
const MAX = 5;
const ITEM_HEIGHT = 40;

interface DosageRollerProps {
  morning: number;
  afternoon: number;
  night: number;
  onMorningChange: (value: number) => void;
  onAfternoonChange: (value: number) => void;
  onNightChange: (value: number) => void;
  /** When true, show subtle amber highlight (doctor override) */
  morningOverridden?: boolean;
  afternoonOverridden?: boolean;
  nightOverridden?: boolean;
}

function ScrollColumn({
  value,
  onChange,
  label,
  overridden,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  overridden?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  /**
   * Only allow scroll-based onChange after the user physically touches/mouses
   * into the scroll area. This prevents programmatic scrollTop assignments
   * (mount, prop changes) from falsely triggering onChange(0).
   */
  const userEngaged = useRef(false);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(MIN, Math.min(MAX, index));
    // Temporarily disengage so the programmatic scroll doesn't trigger onChange
    userEngaged.current = false;
    el.scrollTop = clamped * ITEM_HEIGHT;
  }, []);

  useEffect(() => {
    scrollToIndex(value);
  }, [value, scrollToIndex]);

  const handleScroll = () => {
    if (!userEngaged.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(MIN, Math.min(MAX, index));
    if (clamped !== value) onChange(clamped);
  };

  const enableUserScroll = () => {
    userEngaged.current = true;
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-2 font-medium">{label}</span>
      <div
        ref={scrollRef}
        className="h-32 overflow-y-auto overflow-x-hidden scroll-smooth snap-y snap-mandatory hide-scrollbar border rounded-lg bg-muted/20"
        style={{ width: 48 }}
        onScroll={handleScroll}
        onPointerDown={enableUserScroll}
        onTouchStart={enableUserScroll}
      >
        {Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i).map((n) => (
          <div
            key={n}
            className="h-10 flex items-center justify-center snap-center cursor-pointer select-none text-lg font-semibold text-foreground"
            style={{ minHeight: ITEM_HEIGHT }}
            onClick={() => {
              onChange(n);
              scrollToIndex(n);
              // Re-enable after click-driven scroll settles
              setTimeout(() => { userEngaged.current = true; }, 300);
            }}
          >
            {n}
          </div>
        ))}
      </div>
      <div
        className={`mt-2 w-10 h-10 flex items-center justify-center rounded-lg border-2 font-semibold text-primary ${
          overridden ? "border-amber-400 bg-amber-50 text-amber-800" : "border-primary bg-primary/10"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function DosageRoller({
  morning,
  afternoon,
  night,
  onMorningChange,
  onAfternoonChange,
  onNightChange,
  morningOverridden,
  afternoonOverridden,
  nightOverridden,
}: DosageRollerProps) {
  return (
    <div className="flex items-end gap-4">
      <ScrollColumn
        value={morning}
        onChange={onMorningChange}
        label="Morning"
        overridden={morningOverridden}
      />
      <span className="text-muted-foreground font-medium pb-4">-</span>
      <ScrollColumn
        value={afternoon}
        onChange={onAfternoonChange}
        label="Afternoon"
        overridden={afternoonOverridden}
      />
      <span className="text-muted-foreground font-medium pb-4">-</span>
      <ScrollColumn
        value={night}
        onChange={onNightChange}
        label="Night"
        overridden={nightOverridden}
      />
    </div>
  );
}

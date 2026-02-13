import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

interface FrequencyRollerProps {
  morning: number;
  afternoon: number;
  night: number;
  onMorningChange: (value: number) => void;
  onAfternoonChange: (value: number) => void;
  onNightChange: (value: number) => void;
}

export function FrequencyRoller({
  morning,
  afternoon,
  night,
  onMorningChange,
  onAfternoonChange,
  onNightChange,
}: FrequencyRollerProps) {
  const increment = (value: number, onChange: (val: number) => void) => {
    if (value < 3) onChange(value + 1);
  };

  const decrement = (value: number, onChange: (val: number) => void) => {
    if (value > 0) onChange(value - 1);
  };

  return (
    <div className="flex items-center gap-2 bg-muted/20 rounded-lg p-2 border border-border">
      {/* Morning */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => increment(morning, onMorningChange)}
          className="h-6 w-6 p-0"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <div className="my-1 w-10 h-8 flex items-center justify-center bg-card border border-primary rounded">
          <span className="text-lg font-semibold text-primary">{morning}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => decrement(morning, onMorningChange)}
          className="h-6 w-6 p-0"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
        <span className="text-xs text-muted-foreground mt-1">Morning</span>
      </div>

      <span className="text-lg text-muted-foreground">-</span>

      {/* Afternoon */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => increment(afternoon, onAfternoonChange)}
          className="h-6 w-6 p-0"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <div className="my-1 w-10 h-8 flex items-center justify-center bg-card border border-primary rounded">
          <span className="text-lg font-semibold text-primary">{afternoon}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => decrement(afternoon, onAfternoonChange)}
          className="h-6 w-6 p-0"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
        <span className="text-xs text-muted-foreground mt-1">Afternoon</span>
      </div>

      <span className="text-lg text-muted-foreground">-</span>

      {/* Night */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => increment(night, onNightChange)}
          className="h-6 w-6 p-0"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <div className="my-1 w-10 h-8 flex items-center justify-center bg-card border border-primary rounded">
          <span className="text-lg font-semibold text-primary">{night}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => decrement(night, onNightChange)}
          className="h-6 w-6 p-0"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
        <span className="text-xs text-muted-foreground mt-1">Night</span>
      </div>
    </div>
  );
}
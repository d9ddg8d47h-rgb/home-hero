"use client";

import { Check } from "lucide-react";
import { incrementSetDone, decrementSetDone } from "@/lib/actions/completions";
import { primeAudio } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function SetTracker({
  prescriptionId,
  totalSets,
  doneSets,
}: {
  prescriptionId: string;
  totalSets: number;
  doneSets: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: totalSets }, (_, i) => {
        const setNumber = i + 1;
        const isFilled = setNumber <= doneSets;
        const isLastFilled = isFilled && setNumber === doneSets;
        const isNextUp = !isFilled && setNumber === doneSets + 1;
        const tappable = isLastFilled || isNextUp;
        const action = isFilled ? decrementSetDone : incrementSetDone;

        return (
          <form key={setNumber} action={action.bind(null, prescriptionId)}>
            <button
              type="submit"
              onClick={tappable ? primeAudio : undefined}
              disabled={!tappable}
              aria-label={`Set ${setNumber}${isFilled ? " — done, tap to undo" : ""}`}
              className={cn(
                "flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 text-xs font-bold transition-all active:scale-90 disabled:cursor-default",
                isFilled
                  ? "border-secondary bg-secondary text-secondary-foreground"
                  : isNextUp
                    ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                    : "border-border bg-muted text-muted-foreground opacity-60"
              )}
            >
              {isFilled ? <Check className="h-5 w-5" /> : <span>{setNumber}</span>}
              {!isFilled && <span>Set</span>}
            </button>
          </form>
        );
      })}
    </div>
  );
}

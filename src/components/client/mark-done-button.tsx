"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { toggleCompletion } from "@/lib/actions/completions";
import { primeAudio } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function MarkDoneButton({
  prescriptionId,
  done,
}: {
  prescriptionId: string;
  done: boolean;
}) {
  return (
    <form action={toggleCompletion.bind(null, prescriptionId)}>
      <button
        type="submit"
        onClick={primeAudio}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-95",
          done
            ? "bg-secondary/15 text-secondary"
            : "bg-primary text-primary-foreground hover:opacity-90"
        )}
      >
        {done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        {done ? "Done today!" : "Mark as done"}
      </button>
    </form>
  );
}

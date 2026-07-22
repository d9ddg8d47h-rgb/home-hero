"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { HeatmapDay } from "@/lib/actions/progress";

function levelFor(count: number, total: number): number {
  if (total === 0) return -1;
  if (count <= 0) return 0;
  const pct = count / total;
  if (pct < 0.5) return 1;
  if (pct < 1) return 2;
  return 3;
}

const LEVEL_CLASSES = [
  "bg-muted", // nothing done that day
  "bg-primary/25", // partial
  "bg-primary/55", // mostly
  "bg-primary", // fully done
];

function formatLabel(dateStr: string, count: number, total: number) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const label = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  if (total === 0) return `${label} — no exercises assigned yet`;
  return `${label} — ${count}/${total} done`;
}

export function ProgressHeatmap({
  heatmap,
  totalPrescriptions,
}: {
  heatmap: HeatmapDay[];
  totalPrescriptions: number;
}) {
  const today = heatmap[heatmap.length - 1]?.date;
  const [selected, setSelected] = useState<HeatmapDay | null>(
    heatmap[heatmap.length - 1] ?? null
  );

  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < heatmap.length; i += 7) {
    weeks.push(heatmap.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1.5">
            {week.map((day) => {
              const level = levelFor(day.count, totalPrescriptions);
              const isToday = day.date === today;
              const isSelected = selected?.date === day.date;
              return (
                <button
                  key={day.date}
                  type="button"
                  onMouseEnter={() => setSelected(day)}
                  onFocus={() => setSelected(day)}
                  onClick={() => setSelected(day)}
                  aria-label={formatLabel(day.date, day.count, totalPrescriptions)}
                  className={cn(
                    "h-7 flex-1 rounded-md transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none",
                    level === -1 ? "bg-muted/40" : LEVEL_CLASSES[level],
                    isToday && "ring-2 ring-accent ring-offset-1 ring-offset-card",
                    isSelected && "scale-110"
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground" role="status">
        {selected
          ? formatLabel(selected.date, selected.count, totalPrescriptions)
          : "Tap a day to see details"}
      </p>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        <span className="h-3 w-3 rounded bg-muted" />
        <span className="h-3 w-3 rounded bg-primary/25" />
        <span className="h-3 w-3 rounded bg-primary/55" />
        <span className="h-3 w-3 rounded bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}

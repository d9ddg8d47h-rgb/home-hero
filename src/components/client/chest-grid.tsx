"use client";

import { useRef, useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { openChest } from "@/lib/actions/rewards";
import { fireConfetti } from "@/lib/confetti";
import { playChime, primeAudio } from "@/lib/sound";
import { HERO_RANKS } from "@/lib/gamification";
import { cn } from "@/lib/utils";

export function ChestGrid({
  coins,
  openedKeys,
}: {
  coins: number;
  openedKeys: string[];
}) {
  const [opened, setOpened] = useState(new Set(openedKeys));
  const [isPending, startTransition] = useTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function handleOpen(rankId: string) {
    primeAudio();
    setOpened((prev) => new Set(prev).add(rankId));
    fireConfetti(canvasRef.current);
    playChime();
    startTransition(() => {
      openChest(rankId);
    });
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50"
      />
      {HERO_RANKS.map((rank) => {
        const isUnlocked = coins >= rank.threshold;
        const isOpened = opened.has(rank.id);

        return (
          <button
            key={rank.id}
            type="button"
            disabled={!isUnlocked || isOpened || isPending}
            onClick={() => handleOpen(rank.id)}
            title={
              isUnlocked
                ? isOpened
                  ? rank.accessory.label
                  : `Open to reveal your ${rank.accessory.label}`
                : `Reach ${rank.threshold} coins to unlock`
            }
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-all",
              isOpened
                ? "border-secondary bg-secondary/10"
                : isUnlocked
                  ? "border-accent bg-accent/10 hover:scale-105 active:scale-95"
                  : "border-border bg-muted/50 opacity-60"
            )}
          >
            <span className="text-3xl" aria-hidden="true">
              {isOpened ? rank.accessory.emoji : isUnlocked ? "🎁" : "🔒"}
            </span>
            <p className="text-[11px] font-semibold leading-tight">
              {isOpened ? rank.accessory.label : rank.label}
            </p>
            {!isUnlocked && (
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Lock className="h-2.5 w-2.5" />
                {rank.threshold} coins
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

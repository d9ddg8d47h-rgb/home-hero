"use client";

import { useState, useTransition } from "react";
import { updateAvatarEmoji } from "@/lib/actions/rewards";
import { AVATAR_EMOJI_OPTIONS } from "@/lib/gamification";
import { cn } from "@/lib/utils";

export function AvatarPicker({ current }: { current: string | null }) {
  const [selected, setSelected] = useState(current);
  const [, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-5 gap-2">
      {AVATAR_EMOJI_OPTIONS.map((emoji) => {
        const isSelected = selected === emoji;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              setSelected(emoji);
              startTransition(() => {
                updateAvatarEmoji(emoji);
              });
            }}
            aria-label={`Choose ${emoji} avatar`}
            aria-pressed={isSelected}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-2xl transition-all",
              isSelected
                ? "border-primary bg-primary/10 scale-105"
                : "border-border bg-muted/50 hover:bg-muted"
            )}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}

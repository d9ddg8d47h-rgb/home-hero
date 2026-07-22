"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SurpriseMeButton({ pendingIds }: { pendingIds: string[] }) {
  const [spinning, setSpinning] = useState(false);

  if (pendingIds.length === 0) return null;

  function handleClick() {
    if (spinning) return;
    setSpinning(true);
    const pick = pendingIds[Math.floor(Math.random() * pendingIds.length)];

    setTimeout(() => {
      const el = document.getElementById(`exercise-${pick}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add("ring-4", "ring-accent");
      setTimeout(() => el?.classList.remove("ring-4", "ring-accent"), 1600);
      setSpinning(false);
    }, 450);
  }

  return (
    <Button
      type="button"
      variant="accent"
      onClick={handleClick}
      disabled={spinning}
      className="w-full"
    >
      <Sparkles className="h-4 w-4" />
      {spinning ? "Picking…" : "Surprise me — pick my next one!"}
    </Button>
  );
}

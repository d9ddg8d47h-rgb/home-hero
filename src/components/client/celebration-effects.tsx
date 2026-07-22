"use client";

import { useEffect, useRef } from "react";
import { fireConfetti } from "@/lib/confetti";
import { playChime } from "@/lib/sound";

// Fires confetti + a chime the moment `trigger` flips from false to true
// (i.e. the exact tap that finishes the day's last exercise), and resets
// so it can fire again another day.
export function CelebrationEffects({ trigger }: { trigger: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (trigger && !hasFiredRef.current) {
      fireConfetti(canvasRef.current);
      playChime();
      hasFiredRef.current = true;
    }
    if (!trigger) {
      hasFiredRef.current = false;
    }
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}

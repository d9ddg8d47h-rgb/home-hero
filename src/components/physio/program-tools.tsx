"use client";

import { useActionState } from "react";
import { ArrowUp, ArrowDown, Trash2, Copy, Save } from "lucide-react";
import { deletePrescription, movePrescription, duplicateProgramToClient } from "@/lib/actions/prescriptions";
import { saveClientProgramAsTemplate } from "@/lib/actions/templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/lib/database.types";

type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"] & {
  exercise: { id: string; name: string; video_url: string | null } | null;
};

export function PrescriptionList({
  clientId,
  prescriptions,
}: {
  clientId: string;
  prescriptions: Prescription[];
}) {
  if (prescriptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing prescribed yet — add one below.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {prescriptions.map((p, i) => (
        <div
          key={p.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-border p-3"
        >
          <div>
            <p className="font-medium">{p.exercise?.name ?? "Deleted exercise"}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {p.sets != null && <Badge variant="muted">{p.sets} sets</Badge>}
              {p.reps != null && <Badge variant="muted">{p.reps} reps</Badge>}
            </div>
            {p.note && <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>}
          </div>
          <div className="flex items-center gap-1">
            <form action={movePrescription.bind(null, clientId, p.id, "up")}>
              <button
                type="submit"
                disabled={i === 0}
                aria-label="Move up"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
            <form action={movePrescription.bind(null, clientId, p.id, "down")}>
              <button
                type="submit"
                disabled={i === prescriptions.length - 1}
                aria-label="Move down"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </form>
            <form action={deletePrescription.bind(null, p.id, clientId)}>
              <button
                type="submit"
                aria-label="Remove prescription"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SaveAsTemplateForm({ clientId }: { clientId: string }) {
  const action = saveClientProgramAsTemplate.bind(null, clientId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Label htmlFor="templateName">Save this program as a reusable template</Label>
      <div className="flex gap-2">
        <Input
          id="templateName"
          name="templateName"
          placeholder="e.g. Toddler balance starter"
          required
        />
        <Button type="submit" variant="outline" size="default" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-secondary">
          Saved! Find it under Templates to apply to any client.
        </p>
      )}
    </form>
  );
}

export function CopyProgramForm({
  clientId,
  otherClients,
}: {
  clientId: string;
  otherClients: { id: string; full_name: string }[];
}) {
  const action = duplicateProgramToClient.bind(null, clientId);
  const [state, formAction, pending] = useActionState(action, undefined);

  if (otherClients.length === 0) return null;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Label htmlFor="targetClientId">Copy this program to another client</Label>
      <div className="flex gap-2">
        <select
          id="targetClientId"
          name="targetClientId"
          required
          className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Choose a client…</option>
          {otherClients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="default" disabled={pending}>
          <Copy className="h-4 w-4" />
          {pending ? "Copying…" : "Copy"}
        </Button>
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && <p className="text-sm text-secondary">Program copied over!</p>}
    </form>
  );
}

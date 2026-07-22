"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { applyTemplateToClient } from "@/lib/actions/templates";
import { Button } from "@/components/ui/button";

export function ApplyTemplateForm({
  templateId,
  clients,
}: {
  templateId: string;
  clients: { id: string; full_name: string }[];
}) {
  const action = applyTemplateToClient.bind(null, templateId);
  const [state, formAction, pending] = useActionState(action, undefined);

  if (clients.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Add a client first to apply this template.</p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select
          name="clientId"
          required
          className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Apply to…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          <Send className="h-4 w-4" />
          {pending ? "Applying…" : "Apply"}
        </Button>
      </div>
      {state?.error && (
        <p className="text-xs text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && <p className="text-xs text-secondary">Applied to their program!</p>}
    </form>
  );
}

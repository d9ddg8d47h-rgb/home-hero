"use client";

import { useActionState } from "react";
import { completeInviteSetup } from "@/lib/actions/invites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(completeInviteSetup, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="password">Choose a password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Saving…" : "Set password and continue"}
      </Button>
    </form>
  );
}

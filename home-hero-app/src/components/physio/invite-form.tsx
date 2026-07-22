"use client";

import { useActionState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { inviteClientByEmail } from "@/lib/actions/invites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteClientByEmail, undefined);
  const success = state && "success" in state;

  if (success) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="h-10 w-10 text-secondary" />
          <CardTitle>Invite sent to {state.email}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            They&apos;ll get an email with a link to choose their own password.
            Once they do, they&apos;ll land in their home program, already linked
            to you. They&apos;ll also appear in your client list right away.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite a client by email</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="fullName">Client&apos;s name</Label>
            <Input id="fullName" name="fullName" placeholder="e.g. Teddy Smith" required />
          </div>
          <div>
            <Label htmlFor="email">Parent/caregiver email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          {state && "error" in state && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            <Mail className="h-4 w-4" />
            {pending ? "Sending…" : "Send invite email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

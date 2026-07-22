"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClientAccount } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewClientPage() {
  const [state, action, pending] = useActionState(createClientAccount, undefined);
  const success = state && "success" in state;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/physio"
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </Link>

      {success ? (
        <Card>
          <CardHeader className="items-center text-center">
            <CheckCircle2 className="h-10 w-10 text-secondary" />
            <CardTitle>{state.fullName}&apos;s account is ready</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Share these login details with the family. This password won&apos;t
              be shown again, so copy it now.
            </p>
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Email
              </p>
              <p className="font-mono text-sm">{state.email}</p>
              <p className="mt-3 text-xs font-medium uppercase text-muted-foreground">
                Password
              </p>
              <p className="font-mono text-sm">{state.password}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/physio" className="flex-1">
                <Button variant="outline" className="w-full">
                  Done
                </Button>
              </Link>
              <Link href="/physio/exercises" className="flex-1">
                <Button className="w-full">Prescribe exercises</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add a new client</CardTitle>
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
                <p className="mt-1 text-xs text-muted-foreground">
                  We&apos;ll generate a password automatically — you&apos;ll pass it
                  on to them.
                </p>
              </div>
              {state && "error" in state && (
                <p className="text-sm text-destructive" role="alert">
                  {state.error}
                </p>
              )}
              <Button type="submit" disabled={pending} className="mt-2 w-full">
                {pending ? "Creating…" : "Create client"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

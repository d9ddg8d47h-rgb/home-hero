"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupPhysio } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupPhysio, undefined);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
            HH
          </div>
          <CardTitle>Create your physio account</CardTitle>
          <CardDescription>
            You&apos;ll manage clients and exercises from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="fullName">Your name</Label>
              <Input id="fullName" name="fullName" autoComplete="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
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
            {state?.message && (
              <p className="text-sm text-secondary" role="status">
                {state.message}
              </p>
            )}
            <Button type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

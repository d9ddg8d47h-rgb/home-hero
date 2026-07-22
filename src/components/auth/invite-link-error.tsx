"use client";

import { useSearchParams } from "next/navigation";

export function InviteLinkError() {
  const params = useSearchParams();
  if (params.get("error") !== "invite-link-invalid") return null;

  return (
    <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
      That invite link has expired or already been used. Ask your physio to
      resend it, or log in below if you&apos;ve already set a password.
    </p>
  );
}

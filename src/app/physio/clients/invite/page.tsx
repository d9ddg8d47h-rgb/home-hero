import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InviteForm } from "@/components/physio/invite-form";

export default function InviteClientPage() {
  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/physio"
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invite a client</h1>
        <p className="text-sm text-muted-foreground">
          They&apos;ll get an email to set up their own login — no password to
          pass on yourself.
        </p>
      </div>

      <InviteForm />
    </div>
  );
}

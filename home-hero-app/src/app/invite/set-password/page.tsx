import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/dal";
import { SetPasswordForm } from "@/components/invite/set-password-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function SetPasswordPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?error=invite-link-invalid");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
            HH
          </div>
          <CardTitle>Welcome to Home Hero, {profile.full_name || "there"}</CardTitle>
          <CardDescription>
            Choose a password to finish setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

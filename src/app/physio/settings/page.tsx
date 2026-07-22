import { LogOut } from "lucide-react";
import { requirePhysio } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NameForm, PasswordForm } from "@/components/physio/settings-forms";

export default async function SettingsPage() {
  const physio = await requirePhysio();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">{physio.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your name</CardTitle>
        </CardHeader>
        <CardContent>
          <NameForm defaultFullName={physio.full_name} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <form action={logout}>
        <Button type="submit" variant="outline" className="w-full">
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </form>
    </div>
  );
}

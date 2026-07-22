import { requireClient } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            HH
          </span>
          <span className="text-lg font-semibold">Home Hero</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10 pt-4">
        {children}
      </main>
    </div>
  );
}

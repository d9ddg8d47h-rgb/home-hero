import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/dal";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const profile = await getCurrentProfile();
  if (profile?.role === "physio") redirect("/physio");
  if (profile?.role === "client") redirect("/client");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-3xl font-bold text-primary-foreground">
        HH
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Home Hero
      </h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Home exercise programs for paediatric physiotherapy — simple for
        families, powerful for physios.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link href="/login">
          <Button size="lg" className="w-full">
            Log in
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="lg" variant="outline" className="w-full">
            I&apos;m a physio — create an account
          </Button>
        </Link>
      </div>
      <p className="mt-6 max-w-xs text-xs text-muted-foreground">
        Parents and clients: use the invite link your physio sent you, or log
        in if you already have an account.
      </p>
    </div>
  );
}

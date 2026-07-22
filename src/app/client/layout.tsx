import { requireClient } from "@/lib/dal";
import { ClientNav } from "@/components/client/nav";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ClientNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-4">
        {children}
      </main>
    </div>
  );
}

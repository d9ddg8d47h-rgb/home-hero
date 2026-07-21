import { requirePhysio } from "@/lib/dal";
import { PhysioNav } from "@/components/physio/nav";

export default async function PhysioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePhysio();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PhysioNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-4">
        {children}
      </main>
    </div>
  );
}

import Link from "next/link";
import { Plus, ChevronRight, Mail, Link2 } from "lucide-react";
import { getMyClients } from "@/lib/actions/clients";
import { getClientsAdherenceSummary } from "@/lib/actions/progress";
import { requirePhysio } from "@/lib/dal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdherenceBadge } from "@/components/physio/adherence-badge";

export default async function PhysioDashboard() {
  const physio = await requirePhysio();
  const clients = await getMyClients();
  const adherence = await getClientsAdherenceSummary(clients.map((c) => c.id));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hi {physio.full_name || "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {clients.length} {clients.length === 1 ? "client" : "clients"}
        </p>
      </div>

      <div className="flex gap-2">
        <Link href="/physio/clients/new" className="flex-1">
          <Button size="lg" className="w-full">
            <Plus className="h-5 w-5" />
            Add client
          </Button>
        </Link>
        <Link href="/physio/clients/invite" className="flex-1">
          <Button size="lg" variant="outline" className="w-full">
            <Link2 className="h-5 w-5" />
            Invite link
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="font-medium">No clients yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first client to start prescribing home exercises.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/physio/clients/${client.id}`}>
              <Card className="transition hover:border-primary">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15 text-sm font-semibold text-secondary">
                      {client.full_name
                        ? client.full_name.slice(0, 2).toUpperCase()
                        : "??"}
                    </div>
                    <div>
                      <p className="font-medium leading-tight">
                        {client.full_name || "Unnamed client"}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </p>
                      <div className="mt-1.5">
                        <AdherenceBadge percent={adherence[client.id] ?? null} />
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

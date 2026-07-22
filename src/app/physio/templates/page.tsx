import { Layers, Trash2 } from "lucide-react";
import { getMyTemplates, deleteTemplate } from "@/lib/actions/templates";
import { getMyClients } from "@/lib/actions/clients";
import { emojiForCategory } from "@/lib/exercise-emoji";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplyTemplateForm } from "@/components/physio/template-tools";

export default async function TemplatesPage() {
  const [templates, clients] = await Promise.all([getMyTemplates(), getMyClients()]);
  const clientOptions = clients.map((c) => ({ id: c.id, full_name: c.full_name }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Program templates</h1>
        <p className="text-sm text-muted-foreground">
          Save a client&apos;s program once, then apply it to anyone else in a click.
        </p>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <Layers className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No templates yet. Open a client&apos;s program and use &quot;Save this program as a
              reusable template&quot; to create your first one.
            </p>
          </CardContent>
        </Card>
      ) : (
        templates.map((t) => (
          <Card key={t.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.name}</CardTitle>
              <form action={deleteTemplate.bind(null, t.id)}>
                <button
                  type="submit"
                  aria-label="Delete template"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-1.5">
                {t.items.map((item) => (
                  <Badge key={item.exercise_id + item.order_index} variant="muted">
                    {emojiForCategory(item.exercise?.category)} {item.exercise?.name ?? "Exercise"}
                  </Badge>
                ))}
              </div>
              <ApplyTemplateForm templateId={t.id} clients={clientOptions} />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

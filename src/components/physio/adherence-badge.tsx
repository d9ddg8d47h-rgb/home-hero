import { Badge } from "@/components/ui/badge";

export function AdherenceBadge({ percent }: { percent: number | null }) {
  if (percent === null) {
    return (
      <Badge variant="muted" className="whitespace-nowrap">
        No exercises yet
      </Badge>
    );
  }

  const variant = percent >= 70 ? "secondary" : percent >= 40 ? "accent" : "destructive";

  return (
    <Badge variant={variant} className="whitespace-nowrap">
      {percent}% this week
    </Badge>
  );
}

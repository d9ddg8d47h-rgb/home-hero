"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Pencil, Trash2, Video } from "lucide-react";
import { deleteExercise } from "@/lib/actions/exercises";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/database.types";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export function ExerciseLibraryBrowser({ exercises }: { exercises: Exercise[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.category) set.add(ex.category);
    });
    return Array.from(set).sort();
  }, [exercises]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchesCategory = !category || ex.category === category;
      const matchesQuery =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.description.toLowerCase().includes(q) ||
        (ex.category ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [exercises, query, category]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises…"
          className="pl-10"
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              category === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            All ({exercises.length})
          </button>
          {categories.map((c) => {
            const count = exercises.filter((ex) => ex.category === c).length;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="font-medium">No exercises match</p>
            <p className="text-sm text-muted-foreground">
              Try a different search term or category.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((ex) => (
            <Card key={ex.id}>
              <CardContent className="flex items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-medium">{ex.name}</p>
                    {ex.video_url && <Video className="h-3.5 w-3.5 text-secondary" />}
                  </div>
                  {ex.category && (
                    <Badge variant="muted" className="mt-1">
                      {ex.category}
                    </Badge>
                  )}
                  {ex.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {ex.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Link href={`/physio/exercises/${ex.id}/edit`}>
                    <Button variant="ghost" size="icon" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <form action={deleteExercise.bind(null, ex.id)}>
                    <Button variant="ghost" size="icon" type="submit" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

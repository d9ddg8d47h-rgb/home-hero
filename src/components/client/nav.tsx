"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Trophy, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

const links = [
  { href: "/client", label: "Home", icon: Home, exact: true },
  { href: "/client/program", label: "Program", icon: Dumbbell, exact: false },
  { href: "/client/rewards", label: "Rewards", icon: Trophy, exact: false },
];

export function ClientNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <Link href="/client" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            HH
          </span>
          <span className="text-lg font-semibold">Home Hero</span>
        </Link>
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

      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-border bg-card/95 py-2 backdrop-blur">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-6 py-2 text-xs font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

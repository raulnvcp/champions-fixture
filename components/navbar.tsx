"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  user: User | null;
}

const NAV_LINKS = [
  { href: "/fixtures", label: "Fixtures" },
  { href: "/bracket", label: "Bracket" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const name = user?.user_metadata?.full_name as string | undefined;
  const initials = name
    ? name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          <span className="text-xl">🏆</span>
          <span className="font-bold text-base tracking-tight">
            <span className="text-primary">UCL</span>
            <span className="text-foreground"> 25/26</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-accent transition-colors outline-none">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={avatarUrl} alt={name ?? "User"} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                  {name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-sm">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login" className={cn(buttonVariants({ size: "sm" }), "font-semibold")}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-primary"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            UEFA Champions League
          </p>
          <h1
            className="text-8xl sm:text-[10rem] font-bold leading-none tracking-tighter"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              background: "linear-gradient(135deg, #fff 0%, oklch(0.8 0.15 75) 50%, #fff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            25/26
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
            Follow all 39 matches, track group standings, and compete with your score predictions.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 text-center">
          {[
            { value: "24", label: "Clubs" },
            { value: "8", label: "Groups" },
            { value: "39", label: "Matches" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span
                className="text-2xl font-bold text-primary"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {value}
              </span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/fixtures"
            className={cn(buttonVariants({ size: "lg" }), "font-semibold px-8")}
          >
            View Fixtures
          </Link>
          <Link
            href="/bracket"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-8")}
          >
            Bracket
          </Link>
          <Link
            href="/leaderboard"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}

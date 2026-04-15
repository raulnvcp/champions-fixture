"use client";

import { useState, useTransition } from "react";
import { upsertPrediction } from "@/app/actions/predictions";

interface PredictionFormProps {
  matchId: number;
  existing?: { home_score: number; away_score: number } | null;
}

export default function PredictionForm({ matchId, existing }: PredictionFormProps) {
  const [home, setHome] = useState(existing?.home_score ?? "");
  const [away, setAway] = useState(existing?.away_score ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    String(home) !== String(existing?.home_score ?? "") ||
    String(away) !== String(existing?.away_score ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (home === "" || away === "") return;
    setError(null);

    startTransition(async () => {
      const result = await upsertPrediction(matchId, Number(home), Number(away));
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border/50 pt-3 flex flex-col gap-2"
    >
      <p className="text-xs text-muted-foreground">Your prediction</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={99}
          value={home}
          onChange={(e) => { setHome(e.target.value); setSaved(false); }}
          className="w-12 h-8 rounded-md bg-input/30 border border-border text-center text-sm font-bold focus:outline-none focus:border-ring"
          placeholder="0"
        />
        <span className="text-muted-foreground text-xs">–</span>
        <input
          type="number"
          min={0}
          max={99}
          value={away}
          onChange={(e) => { setAway(e.target.value); setSaved(false); }}
          className="w-12 h-8 rounded-md bg-input/30 border border-border text-center text-sm font-bold focus:outline-none focus:border-ring"
          placeholder="0"
        />
        <button
          type="submit"
          disabled={isPending || !isDirty || home === "" || away === ""}
          className="ml-auto text-xs px-3 h-8 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40 transition-opacity"
        >
          {isPending ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyFeedingsState } from "./empty-feedings-state";
import { FeedingListItem } from "./feeding-list-item";
import { listFeedings } from "@/lib/storage/feedings";
import { loadIdentity } from "@/lib/storage/identity";
import type { Feeding } from "@/lib/types/feeding";
import { strings } from "@/lib/strings";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; feedings: Feeding[] };

export function StarterTrackerScreen() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const fetchFeedings = useCallback(() => {
    const identity = loadIdentity();
    if (!identity) {
      setState({ status: "loaded", feedings: [] });
      return;
    }

    setState({ status: "loading" });
    listFeedings(identity.email)
      .then((feedings) => setState({ status: "loaded", feedings }))
      .catch(() => setState({ status: "error" }));
  }, []);

  useEffect(() => {
    fetchFeedings();
  }, [fetchFeedings]);

  const { list } = strings.starterTracker;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-10">
      <header className="relative z-10 flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          iconStart={<ChevronRight size={20} aria-hidden />}
        >
          {list.backToHome}
        </Button>
        <div className="flex-1" />
      </header>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-display-md text-ink">{list.pageTitle}</h1>
        {state.status === "loaded" && state.feedings.length > 0 && (
          <Button
            variant="accent"
            size="sm"
            onClick={() => router.push("/starter/new")}
          >
            {list.newFeeding}
          </Button>
        )}
      </div>

      {state.status === "loading" && (
        <div className="flex flex-1 items-center justify-center py-16">
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-ink-2"
            aria-hidden
          />
          <span className="sr-only">{strings.common.loading}</span>
        </div>
      )}

      {state.status === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center py-16">
          <p className="text-body-lg text-ink-2">{list.loadErrorMessage}</p>
          <Button variant="soft" onClick={fetchFeedings}>
            {list.retry}
          </Button>
        </div>
      )}

      {state.status === "loaded" && state.feedings.length === 0 && (
        <EmptyFeedingsState />
      )}

      {state.status === "loaded" && state.feedings.length > 0 && (
        <ul aria-label={list.pageTitle} className="flex flex-col gap-3">
          {state.feedings.map((feeding) => (
            <li key={feeding.id}>
              <FeedingListItem feeding={feeding} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

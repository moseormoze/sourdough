"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FeedingFormScreen } from "@/components/starter/feeding-form-screen";
import { loadIdentity } from "@/lib/storage/identity";
import { getFeeding } from "@/lib/storage/feedings";
import { strings } from "@/lib/strings";
import type { FeedingFormValues } from "@/lib/validate-feeding";

function isoToLocalDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
}

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<FeedingFormValues | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const id = params.id;
    if (!id) return;

    const identity = loadIdentity();
    if (!identity) {
      setMissing(true);
      return;
    }

    let cancelled = false;
    getFeeding(id, identity.email)
      .then((feeding) => {
        if (cancelled) return;
        if (!feeding) {
          setMissing(true);
          return;
        }
        const { date, time } = isoToLocalDateTime(feeding.fedAt);
        setInitial({
          ratio: feeding.ratio,
          starterGrams: feeding.starterGrams ?? "",
          flourGrams: feeding.flourGrams ?? "",
          waterGrams: feeding.waterGrams ?? "",
          fedAtDate: date,
          fedAtTime: time,
        });
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (missing) router.replace("/starter");
  }, [missing, router]);

  if (!initial) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-10">
        <p className="text-ink-2 mt-12 text-center">{strings.common.loading}</p>
      </main>
    );
  }

  return <FeedingFormScreen initialValues={initial} feedingId={params.id} />;
}

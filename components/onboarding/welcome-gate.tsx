"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { identifyUser } from "@/lib/analytics/posthog-client";
import { track } from "@/lib/analytics/track";
import {
  isValidEmail,
  loadIdentity,
  normalizeEmail,
  saveIdentity,
} from "@/lib/storage/identity";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/cn";

const EXIT_DURATION_MS = 200;

type GateStatus = "checking" | "gate" | "leaving" | "identified";

export function WelcomeGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GateStatus>("checking");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false });
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const identity = loadIdentity();
    if (identity) {
      identifyUser(identity.email, { name: identity.name });
      setStatus("identified");
    } else {
      setStatus("gate");
    }
    return () => {
      if (exitTimer.current !== null) clearTimeout(exitTimer.current);
    };
  }, []);

  const nameValid = name.trim().length > 0;
  const emailValid = isValidEmail(email);
  const nameError = touched.name && !nameValid ? strings.validation.nameRequired : null;
  const emailError = touched.email && !emailValid ? strings.validation.emailInvalid : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nameValid || !emailValid || status !== "gate") return;

    const identity = {
      name: name.trim(),
      email: normalizeEmail(email),
      identifiedAt: new Date().toISOString(),
    };
    saveIdentity(identity);
    identifyUser(identity.email, { name: identity.name });
    track("identify_completed", {});

    setStatus("leaving");
    exitTimer.current = setTimeout(() => setStatus("identified"), EXIT_DURATION_MS);
  }

  const gateUp = status !== "identified";

  return (
    <>
      <div inert={gateUp}>{children}</div>
      {status === "checking" && (
        <div className="fixed inset-0 z-gate bg-bg" aria-hidden />
      )}
      {(status === "gate" || status === "leaving") && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={strings.welcome.title}
          className={cn(
            "fixed inset-0 z-gate overflow-y-auto bg-bg",
            "transition-opacity duration-base ease-in",
            status === "leaving" && "opacity-0 pointer-events-none"
          )}
        >
          <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10">
            <Image
              src="/logo.svg"
              alt={strings.home.wordmark}
              width={120}
              height={120}
              priority
            />
            <h1 className="mt-4 text-title font-bold text-ink">
              {strings.welcome.title}
            </h1>
            <p className="mt-2 text-center text-body-lg text-ink-2">
              {strings.welcome.subtitle}
            </p>
            <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-4" noValidate>
              <TextInput
                label={strings.welcome.nameLabel}
                placeholder={strings.welcome.namePlaceholder}
                value={name}
                error={nameError}
                autoComplete="given-name"
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              />
              <TextInput
                label={strings.welcome.emailLabel}
                type="email"
                inputMode="email"
                value={email}
                error={emailError}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              />
              <p className="text-small text-ink-3">{strings.welcome.privacyNote}</p>
              <Button
                type="submit"
                variant="accent"
                className="mt-2 w-full"
                disabled={!nameValid || !emailValid}
              >
                {strings.welcome.cta}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallGuideSheet } from "./install-guide-sheet";
import { getInstallEnvironment } from "@/lib/install-environment";
import { useInstallPrompt } from "@/lib/hooks/use-install-prompt";
import {
  loadInstallBannerDismissed,
  loadInstalled,
  saveInstallBannerDismissed,
} from "@/lib/storage/install-flags";
import { track } from "@/lib/analytics/track";
import type { InstallBannerVariant } from "@/lib/analytics/events";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/cn";

const EXIT_DURATION_MS = 200;

function detectStandalone(): boolean {
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
  } catch {
    // matchMedia is unavailable in some test environments
  }
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function InstallBanner() {
  const { promptEvent, installed } = useInstallPrompt();
  const [mounted, setMounted] = useState(false);
  const [flaggedOff, setFlaggedOff] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const shownTracked = useRef(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFlaggedOff(loadInstallBannerDismissed() || loadInstalled());
    setMounted(true);
    return () => {
      if (exitTimer.current !== null) clearTimeout(exitTimer.current);
    };
  }, []);

  const environment = mounted
    ? getInstallEnvironment({
        userAgent: navigator.userAgent,
        isStandalone: detectStandalone(),
        promptCaptured: promptEvent !== null,
      })
    : null;

  const variant: InstallBannerVariant | null =
    environment === "android-promptable"
      ? "android"
      : environment === "ios"
        ? "ios"
        : environment === "fb-in-app"
          ? "fb-in-app"
          : null;

  const visible = mounted && !flaggedOff && !gone && variant !== null;

  useEffect(() => {
    if (visible && variant && !shownTracked.current) {
      shownTracked.current = true;
      track("install_banner_shown", { variant });
    }
  }, [visible, variant]);

  // appinstalled while the banner is up → same exit as dismiss; the hook
  // already persisted the installed flag, so no dismissed flag is written.
  useEffect(() => {
    if (installed && visible && !leaving) {
      setLeaving(true);
      exitTimer.current = setTimeout(() => setGone(true), EXIT_DURATION_MS);
    }
  }, [installed, visible, leaving]);

  if (!visible) return null;

  function beginExit() {
    setLeaving(true);
    exitTimer.current = setTimeout(() => setGone(true), EXIT_DURATION_MS);
  }

  function handleDismiss() {
    if (!variant) return;
    saveInstallBannerDismissed();
    track("install_banner_dismissed", { variant });
    beginExit();
  }

  function handleAction() {
    if (variant === "android" && promptEvent) {
      track("install_prompt_shown", { variant: "android" });
      void promptEvent.prompt();
    } else if (variant === "ios") {
      track("install_prompt_shown", { variant: "ios" });
      setSheetOpen(true);
    }
  }

  const isFb = variant === "fb-in-app";

  return (
    <>
      <aside
        aria-label={isFb ? strings.install.fbTitle : strings.install.title}
        className={cn(
          "mt-4 overflow-hidden rounded-2xl border border-line bg-paper shadow-sm",
          "transition-[opacity,max-height,margin-top] duration-base ease-in",
          leaving ? "max-h-0 mt-0 opacity-0" : "max-h-96"
        )}
      >
        <div className="relative p-5">
          <button
            type="button"
            aria-label={strings.install.dismissLabel}
            onClick={handleDismiss}
            className={cn(
              "pressable absolute top-1 end-1 flex h-11 w-11 items-center justify-center",
              "rounded-full text-ink-3 hover:text-ink transition-colors duration-fast ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3"
            )}
          >
            <X size={16} aria-hidden />
          </button>

          <div className="flex items-start gap-3 pe-10">
            <span className="mt-0.5 text-accent" aria-hidden>
              {isFb ? <Compass size={22} /> : <Download size={22} />}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-heading text-ink">
                {isFb ? strings.install.fbTitle : strings.install.title}
              </h3>
              <p className="mt-1 text-small text-ink-2 leading-relaxed">
                {isFb ? strings.install.fbBody : strings.install.body}
              </p>
              {!isFb && (
                <Button variant="accent" size="sm" className="mt-3" onClick={handleAction}>
                  {variant === "android"
                    ? strings.install.installCta
                    : strings.install.iosCta}
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>

      <InstallGuideSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

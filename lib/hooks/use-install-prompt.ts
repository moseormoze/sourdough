"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics/track";
import { saveInstalled } from "@/lib/storage/install-flags";

// Chromium-only event, not in TypeScript's DOM lib.
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface InstallPromptState {
  promptEvent: BeforeInstallPromptEvent | null;
  installed: boolean;
}

export function useInstallPrompt(): InstallPromptState {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }
    function onAppInstalled() {
      saveInstalled();
      track("install_completed", {});
      setInstalled(true);
      setPromptEvent(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  return { promptEvent, installed };
}

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInstallPrompt } from "./use-install-prompt";
import { loadInstalled } from "@/lib/storage/install-flags";
import { track } from "@/lib/analytics/track";

vi.mock("@/lib/analytics/track", () => ({ track: vi.fn() }));

describe("useInstallPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("starts with no captured prompt and not installed", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.promptEvent).toBeNull();
    expect(result.current.installed).toBe(false);
  });

  it("captures beforeinstallprompt and prevents its default", () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = new Event("beforeinstallprompt", { cancelable: true });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(result.current.promptEvent).toBe(event);
  });

  it("on appinstalled: persists the flag, tracks, clears the prompt", () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(new Event("beforeinstallprompt", { cancelable: true }));
    });
    expect(result.current.promptEvent).not.toBeNull();

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    expect(result.current.installed).toBe(true);
    expect(result.current.promptEvent).toBeNull();
    expect(loadInstalled()).toBe(true);
    expect(track).toHaveBeenCalledWith("install_completed", {});
  });

  it("stops listening after unmount", () => {
    const { result, unmount } = renderHook(() => useInstallPrompt());
    unmount();

    const event = new Event("beforeinstallprompt", { cancelable: true });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(false);
    expect(result.current.promptEvent).toBeNull();
  });
});

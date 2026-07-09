import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { InstallBanner } from "./install-banner";
import { strings } from "@/lib/strings";
import { track } from "@/lib/analytics/track";
import { getInstallEnvironment } from "@/lib/install-environment";
import { useInstallPrompt } from "@/lib/hooks/use-install-prompt";
import {
  INSTALL_BANNER_DISMISSED_STORAGE_KEY,
  saveInstallBannerDismissed,
  saveInstalled,
} from "@/lib/storage/install-flags";

vi.mock("@/lib/analytics/track", () => ({ track: vi.fn() }));
vi.mock("@/lib/install-environment", () => ({ getInstallEnvironment: vi.fn() }));
vi.mock("@/lib/hooks/use-install-prompt", () => ({ useInstallPrompt: vi.fn() }));

function mockEnv(env: string) {
  (getInstallEnvironment as Mock).mockReturnValue(env);
}

function mockPrompt(
  overrides: Partial<{ promptEvent: { prompt: Mock } | null; installed: boolean }> = {}
) {
  (useInstallPrompt as Mock).mockReturnValue({
    promptEvent: null,
    installed: false,
    ...overrides,
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mockPrompt();
});

describe("InstallBanner — variants", () => {
  it("android: renders title, body and an install button that fires the native prompt", async () => {
    const promptEvent = { prompt: vi.fn().mockResolvedValue(undefined) };
    mockEnv("android-promptable");
    mockPrompt({ promptEvent });
    render(<InstallBanner />);

    expect(await screen.findByText(strings.install.title)).toBeInTheDocument();
    expect(screen.getByText(strings.install.body)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: strings.install.installCta }));
    expect(promptEvent.prompt).toHaveBeenCalledOnce();
    expect(track).toHaveBeenCalledWith("install_prompt_shown", { variant: "android" });
  });

  it("ios: the button opens the guide sheet and tracks install_prompt_shown", async () => {
    mockEnv("ios");
    render(<InstallBanner />);

    fireEvent.click(await screen.findByRole("button", { name: strings.install.iosCta }));
    expect(track).toHaveBeenCalledWith("install_prompt_shown", { variant: "ios" });
    expect(await screen.findByText(strings.install.guideTitle)).toBeInTheDocument();
    expect(screen.getByText(strings.install.guideStep2)).toBeInTheDocument();
  });

  it("fb-in-app: instruction only, no action button", async () => {
    mockEnv("fb-in-app");
    render(<InstallBanner />);

    expect(await screen.findByText(strings.install.fbTitle)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: strings.install.installCta })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: strings.install.iosCta })
    ).not.toBeInTheDocument();
  });

  it.each(["standalone", "none"])("%s: renders nothing", async (env) => {
    mockEnv(env);
    const { container } = render(<InstallBanner />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});

describe("InstallBanner — flags and lifecycle", () => {
  it("does not render when previously dismissed", async () => {
    saveInstallBannerDismissed();
    mockEnv("ios");
    const { container } = render(<InstallBanner />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("does not render when already installed (storage flag)", async () => {
    saveInstalled();
    mockEnv("ios");
    const { container } = render(<InstallBanner />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("dismiss: writes the flag, tracks with variant, and the banner leaves", async () => {
    mockEnv("ios");
    render(<InstallBanner />);
    await screen.findByText(strings.install.title);

    fireEvent.click(screen.getByRole("button", { name: strings.install.dismissLabel }));

    expect(localStorage.getItem(INSTALL_BANNER_DISMISSED_STORAGE_KEY)).not.toBeNull();
    expect(track).toHaveBeenCalledWith("install_banner_dismissed", { variant: "ios" });
    await waitFor(() =>
      expect(screen.queryByText(strings.install.title)).not.toBeInTheDocument()
    );
  });

  it("appinstalled while visible: banner leaves without writing the dismissed flag", async () => {
    mockEnv("android-promptable");
    mockPrompt({ promptEvent: { prompt: vi.fn() } });
    const { rerender } = render(<InstallBanner />);
    await screen.findByText(strings.install.title);

    mockPrompt({ promptEvent: null, installed: true });
    rerender(<InstallBanner />);

    await waitFor(() =>
      expect(screen.queryByText(strings.install.title)).not.toBeInTheDocument()
    );
    expect(localStorage.getItem(INSTALL_BANNER_DISMISSED_STORAGE_KEY)).toBeNull();
    expect(track).not.toHaveBeenCalledWith("install_banner_dismissed", expect.anything());
  });

  it("fires install_banner_shown exactly once with the variant", async () => {
    mockEnv("fb-in-app");
    const { rerender } = render(<InstallBanner />);
    await screen.findByText(strings.install.fbTitle);
    rerender(<InstallBanner />);

    const shownCalls = (track as Mock).mock.calls.filter(
      ([name]) => name === "install_banner_shown"
    );
    expect(shownCalls).toEqual([["install_banner_shown", { variant: "fb-in-app" }]]);
  });
});

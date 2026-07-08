import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WelcomeGate } from "./welcome-gate";
import { strings } from "@/lib/strings";
import { IDENTITY_STORAGE_KEY } from "@/lib/storage/identity";
import { identifyUser } from "@/lib/analytics/posthog-client";
import { track } from "@/lib/analytics/track";

vi.mock("@/lib/analytics/posthog-client", () => ({ identifyUser: vi.fn() }));
vi.mock("@/lib/analytics/track", () => ({ track: vi.fn() }));

const storedIdentity = {
  name: "אילון",
  email: "moozly5@gmail.com",
  identifiedAt: "2026-07-05T10:00:00.000Z",
};

function renderGate() {
  return render(
    <WelcomeGate>
      <div data-testid="app-content">app</div>
    </WelcomeGate>
  );
}

function nameInput() {
  return screen.getByLabelText(strings.welcome.nameLabel);
}

function emailInput() {
  return screen.getByLabelText(strings.welcome.emailLabel);
}

function cta() {
  return screen.getByRole("button", { name: strings.welcome.cta });
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("WelcomeGate — gating", () => {
  it("shows the gate and makes the app content inert when no identity is stored", () => {
    renderGate();
    expect(screen.getByText(strings.welcome.title)).toBeInTheDocument();
    expect(screen.getByTestId("app-content").closest("[inert]")).not.toBeNull();
  });

  it("skips the gate and silently re-identifies when an identity is stored", () => {
    localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(storedIdentity));
    renderGate();
    expect(screen.queryByText(strings.welcome.title)).not.toBeInTheDocument();
    expect(screen.getByTestId("app-content").closest("[inert]")).toBeNull();
    expect(identifyUser).toHaveBeenCalledWith("moozly5@gmail.com", {
      name: "אילון",
    });
  });

  it("treats corrupt stored identity as unidentified and shows the gate", () => {
    localStorage.setItem(IDENTITY_STORAGE_KEY, "{not-json");
    renderGate();
    expect(screen.getByText(strings.welcome.title)).toBeInTheDocument();
    expect(identifyUser).not.toHaveBeenCalled();
  });
});

describe("WelcomeGate — validation", () => {
  it("disables the CTA until both fields are valid", () => {
    renderGate();
    expect(cta()).toBeDisabled();

    fireEvent.change(nameInput(), { target: { value: "אילון" } });
    expect(cta()).toBeDisabled();

    fireEvent.change(emailInput(), { target: { value: "not-an-email" } });
    expect(cta()).toBeDisabled();

    fireEvent.change(emailInput(), { target: { value: "moozly5@gmail.com" } });
    expect(cta()).not.toBeDisabled();
  });

  it("shows the email error only after first blur", () => {
    renderGate();
    fireEvent.change(emailInput(), { target: { value: "not-an-email" } });
    expect(
      screen.queryByText(strings.validation.emailInvalid)
    ).not.toBeInTheDocument();

    fireEvent.blur(emailInput());
    expect(
      screen.getByText(strings.validation.emailInvalid)
    ).toBeInTheDocument();
    expect(emailInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("shows the name error after blur on an empty name", () => {
    renderGate();
    fireEvent.blur(nameInput());
    expect(
      screen.getByText(strings.validation.nameRequired)
    ).toBeInTheDocument();
  });

  it("renders the email field as a real email input", () => {
    renderGate();
    expect(emailInput()).toHaveAttribute("type", "email");
    expect(emailInput()).toHaveAttribute("inputmode", "email");
  });
});

describe("WelcomeGate — submit", () => {
  it("saves a normalized identity, identifies, tracks, and removes the gate", async () => {
    renderGate();
    fireEvent.change(nameInput(), { target: { value: " אילון " } });
    fireEvent.change(emailInput(), { target: { value: " Moozly5@Gmail.COM " } });
    fireEvent.click(cta());

    const raw = localStorage.getItem(IDENTITY_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const saved: unknown = JSON.parse(raw as string);
    expect(saved).toMatchObject({ name: "אילון", email: "moozly5@gmail.com" });
    expect((saved as { identifiedAt: string }).identifiedAt).toBeTruthy();

    expect(identifyUser).toHaveBeenCalledWith("moozly5@gmail.com", {
      name: "אילון",
    });
    expect(track).toHaveBeenCalledWith("identify_completed", {});

    await waitFor(() => {
      expect(
        screen.queryByText(strings.welcome.title)
      ).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("app-content").closest("[inert]")).toBeNull();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const posthogMock = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
  startSessionRecording: vi.fn(),
}));

vi.mock("posthog-js", () => ({ default: posthogMock }));

async function freshClient() {
  vi.resetModules();
  return import("./posthog-client");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("identifyUser", () => {
  it("no-ops before PostHog is initialized", async () => {
    const client = await freshClient();
    client.identifyUser("moozly5@gmail.com", { name: "אילון" });
    expect(posthogMock.identify).not.toHaveBeenCalled();
    expect(posthogMock.startSessionRecording).not.toHaveBeenCalled();
  });

  it("identifies with the normalized email as distinct id and person properties", async () => {
    const client = await freshClient();
    client.initPostHog({ apiKey: "key", host: "https://eu.i.posthog.com" });
    client.identifyUser("  Moozly5@Gmail.COM ", { name: "אילון" });
    expect(posthogMock.identify).toHaveBeenCalledWith("moozly5@gmail.com", {
      email: "moozly5@gmail.com",
      name: "אילון",
    });
  });

  it("starts session recording only after identify", async () => {
    const client = await freshClient();
    client.initPostHog({ apiKey: "key", host: "https://eu.i.posthog.com" });

    expect(posthogMock.startSessionRecording).not.toHaveBeenCalled();

    client.identifyUser("moozly5@gmail.com", { name: "אילון" });

    expect(posthogMock.startSessionRecording).toHaveBeenCalledTimes(1);
    const identifyOrder = posthogMock.identify.mock.invocationCallOrder[0];
    const recordingOrder =
      posthogMock.startSessionRecording.mock.invocationCallOrder[0];
    expect(recordingOrder).toBeGreaterThan(
      identifyOrder ?? Number.POSITIVE_INFINITY
    );
  });

  it("keeps session recording disabled at init", async () => {
    const client = await freshClient();
    client.initPostHog({ apiKey: "key", host: "https://eu.i.posthog.com" });
    expect(posthogMock.init).toHaveBeenCalledWith(
      "key",
      expect.objectContaining({ disable_session_recording: true })
    );
  });

  it("is idempotent — repeat calls with the same email re-identify without error", async () => {
    const client = await freshClient();
    client.initPostHog({ apiKey: "key", host: "https://eu.i.posthog.com" });
    client.identifyUser("moozly5@gmail.com", { name: "אילון" });
    client.identifyUser("moozly5@gmail.com", { name: "אילון" });
    expect(posthogMock.identify).toHaveBeenCalledTimes(2);
    expect(posthogMock.identify).toHaveBeenNthCalledWith(2, "moozly5@gmail.com", {
      email: "moozly5@gmail.com",
      name: "אילון",
    });
  });
});

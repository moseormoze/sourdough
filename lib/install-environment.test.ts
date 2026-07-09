import { describe, expect, it } from "vitest";
import { getInstallEnvironment } from "./install-environment";

const UA = {
  fbIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21A329 [FBAN/FBIOS;FBAV/438.0.0.31.115;FBDV/iPhone15,2]",
  fbAndroid:
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.119 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/438.0.0.24.117;]",
  instagram:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.119 Mobile Safari/537.36 Instagram 300.0.0.29.110 Android",
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36",
  desktopChrome:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  desktopSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
};

function env(userAgent: string, overrides?: { isStandalone?: boolean; promptCaptured?: boolean }) {
  return getInstallEnvironment({
    userAgent,
    isStandalone: overrides?.isStandalone ?? false,
    promptCaptured: overrides?.promptCaptured ?? false,
  });
}

describe("getInstallEnvironment", () => {
  it("detects the Facebook in-app browser on iOS", () => {
    expect(env(UA.fbIos)).toBe("fb-in-app");
  });

  it("detects the Facebook in-app browser on Android", () => {
    expect(env(UA.fbAndroid)).toBe("fb-in-app");
  });

  it("detects the Instagram in-app browser", () => {
    expect(env(UA.instagram)).toBe("fb-in-app");
  });

  it("fb-in-app wins over ios even though the UA also says iPhone", () => {
    expect(env(UA.fbIos, { promptCaptured: false })).toBe("fb-in-app");
  });

  it("detects iPhone Safari as ios", () => {
    expect(env(UA.iphoneSafari)).toBe("ios");
  });

  it("detects iPhone Chrome as ios (same add-to-home-screen guidance)", () => {
    expect(env(UA.iphoneChrome)).toBe("ios");
  });

  it("android is promptable only once beforeinstallprompt was captured", () => {
    expect(env(UA.androidChrome, { promptCaptured: true })).toBe("android-promptable");
    expect(env(UA.androidChrome, { promptCaptured: false })).toBe("none");
  });

  it("desktop chrome with a captured prompt is promptable", () => {
    expect(env(UA.desktopChrome, { promptCaptured: true })).toBe("android-promptable");
  });

  it("desktop without a prompt is none", () => {
    expect(env(UA.desktopChrome)).toBe("none");
    expect(env(UA.desktopSafari)).toBe("none");
  });

  it("standalone wins over everything", () => {
    expect(env(UA.fbIos, { isStandalone: true })).toBe("standalone");
    expect(env(UA.iphoneSafari, { isStandalone: true })).toBe("standalone");
    expect(env(UA.androidChrome, { isStandalone: true, promptCaptured: true })).toBe("standalone");
  });
});

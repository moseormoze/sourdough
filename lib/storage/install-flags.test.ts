import { beforeEach, describe, expect, it } from "vitest";
import {
  INSTALLED_STORAGE_KEY,
  INSTALL_BANNER_DISMISSED_STORAGE_KEY,
  loadInstallBannerDismissed,
  loadInstalled,
  saveInstallBannerDismissed,
  saveInstalled,
} from "./install-flags";

describe("install flags storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses versioned storage keys", () => {
    expect(INSTALL_BANNER_DISMISSED_STORAGE_KEY).toBe(
      "sourdough:v1:install-banner-dismissed"
    );
    expect(INSTALLED_STORAGE_KEY).toBe("sourdough:v1:installed");
  });

  it("defaults to false when nothing is stored", () => {
    expect(loadInstallBannerDismissed()).toBe(false);
    expect(loadInstalled()).toBe(false);
  });

  it("persists the dismissed flag", () => {
    saveInstallBannerDismissed();
    expect(loadInstallBannerDismissed()).toBe(true);
    expect(loadInstalled()).toBe(false);
  });

  it("persists the installed flag", () => {
    saveInstalled();
    expect(loadInstalled()).toBe(true);
    expect(loadInstallBannerDismissed()).toBe(false);
  });
});

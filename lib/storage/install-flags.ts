export const INSTALL_BANNER_DISMISSED_STORAGE_KEY =
  "sourdough:v1:install-banner-dismissed";
export const INSTALLED_STORAGE_KEY = "sourdough:v1:installed";

function loadFlag(key: string): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(key) !== null;
}

export function loadInstallBannerDismissed(): boolean {
  return loadFlag(INSTALL_BANNER_DISMISSED_STORAGE_KEY);
}

export function saveInstallBannerDismissed(): void {
  localStorage.setItem(INSTALL_BANNER_DISMISSED_STORAGE_KEY, "1");
}

export function loadInstalled(): boolean {
  return loadFlag(INSTALLED_STORAGE_KEY);
}

export function saveInstalled(): void {
  localStorage.setItem(INSTALLED_STORAGE_KEY, "1");
}

export type InstallEnvironment =
  | "standalone"
  | "fb-in-app"
  | "ios"
  | "android-promptable"
  | "none";

export interface InstallEnvironmentDeps {
  userAgent: string;
  isStandalone: boolean;
  promptCaptured: boolean;
}

// Order matters: the Facebook in-app browser UA also says "iPhone", and a
// standalone launch must suppress install UI regardless of anything else.
export function getInstallEnvironment({
  userAgent,
  isStandalone,
  promptCaptured,
}: InstallEnvironmentDeps): InstallEnvironment {
  if (isStandalone) return "standalone";
  if (/FBAN|FBAV|FB_IAB|Instagram/i.test(userAgent)) return "fb-in-app";
  if (promptCaptured) return "android-promptable";
  if (/iPhone|iPad|iPod/.test(userAgent)) return "ios";
  return "none";
}

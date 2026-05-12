const DEFAULT_AOS_APP_URL = "https://alpos.alpcontractorcircle.com";

export const AOS_APP_URL =
  (import.meta.env.VITE_AOS_APP_URL as string | undefined)?.trim() || DEFAULT_AOS_APP_URL;

export function getAosHost() {
  if (!AOS_APP_URL) return null;

  try {
    return new URL(AOS_APP_URL).host;
  } catch {
    return null;
  }
}

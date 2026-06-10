import CookieManager from "@preeternal/react-native-cookie-manager";

import { authClient } from "./auth-client";
import { API_URL } from "./config";

const STANDALONE_COOKIE_NAME = "trackback-standalone";

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf("=");
      if (separator === -1) {
        return null;
      }
      return {
        name: part.slice(0, separator).trim(),
        value: part.slice(separator + 1).trim(),
      };
    })
    .filter((cookie): cookie is { name: string; value: string } => cookie !== null);
}

export async function syncAuthCookiesToWebView(): Promise<boolean> {
  const cookieHeader = authClient.getCookie();
  if (!cookieHeader) {
    return false;
  }

  const base = new URL(API_URL);
  const cookies = parseCookieHeader(cookieHeader);

  await Promise.all([
    ...cookies.map((cookie) =>
      CookieManager.set(
        base.origin,
        {
          name: cookie.name,
          value: cookie.value,
          domain: base.hostname,
          path: "/",
          secure: base.protocol === "https:",
          httpOnly: true,
        },
        true,
      ),
    ),
    CookieManager.set(
      base.origin,
      {
        name: STANDALONE_COOKIE_NAME,
        value: "true",
        domain: base.hostname,
        path: "/",
        secure: base.protocol === "https:",
      },
      true,
    ),
  ]);

  await CookieManager.flush();

  return true;
}

export async function clearWebViewAuthCookies(): Promise<void> {
  await CookieManager.clearAll(true);
}

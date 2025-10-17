import Cookies from "js-cookie";

export const STANDALONE_COOKIE_NAME = "trackback-standalone";

/**
 * Set the standalone detection cookie
 */
export function setStandaloneCookie(isStandalone: boolean) {
  Cookies.set(STANDALONE_COOKIE_NAME, isStandalone.toString(), {
    expires: 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

/**
 * Get the standalone detection cookie value
 */
export function getStandaloneCookie(): boolean {
  const value = Cookies.get(STANDALONE_COOKIE_NAME);
  return value === "true";
}

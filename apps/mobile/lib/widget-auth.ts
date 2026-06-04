import { authClient } from "./auth-client";

export function isWidgetAuthenticated(): boolean {
  return !!authClient.getCookie();
}

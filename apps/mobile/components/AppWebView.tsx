import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Linking, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, type WebViewNavigation } from "react-native-webview";

import { authClient } from "@/lib/auth-client";
import { API_URL } from "@/lib/config";
import { clearWebViewAuthCookies, syncAuthCookiesToWebView } from "@/lib/sync-webview-cookies";
import { verifyServerSession } from "@/lib/verify-server-session";

const DASHBOARD_URL = `${API_URL}/dashboard`;

function isApiOrigin(url: string): boolean {
  try {
    return new URL(url).origin === new URL(API_URL).origin;
  } catch {
    return false;
  }
}

function isLoggedOutLandingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!isApiOrigin(url)) {
      return false;
    }
    const path = parsed.pathname.replace(/\/$/, "") || "/";
    return path === "/";
  } catch {
    return false;
  }
}

export function AppWebView() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const prepareWebView = useCallback(async () => {
    setReady(false);

    const synced = await syncAuthCookiesToWebView();
    if (!synced) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, []);

  useEffect(() => {
    void prepareWebView();
  }, [prepareWebView]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigationChange = useCallback(async (event: WebViewNavigation) => {
    setCanGoBack(event.canGoBack);

    if (!isLoggedOutLandingUrl(event.url)) {
      return;
    }

    const hasSession = await verifyServerSession();
    if (!hasSession) {
      await authClient.signOut();
      await clearWebViewAuthCookies();
      router.replace("/login");
    }
  }, []);

  const handleShouldStartLoad = useCallback((request: { url: string }) => {
    if (isApiOrigin(request.url)) {
      return true;
    }

    if (request.url.startsWith("http://") || request.url.startsWith("https://")) {
      void Linking.openURL(request.url);
      return false;
    }

    return true;
  }, []);

  if (!ready) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <WebView
        ref={webViewRef}
        source={{ uri: DASHBOARD_URL }}
        style={styles.webview}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        onNavigationStateChange={handleNavigationChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        pullToRefreshEnabled
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121327",
  },
  webview: {
    flex: 1,
    backgroundColor: "#121327",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121327",
  },
});

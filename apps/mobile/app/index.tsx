import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { AppWebView } from "@/components/AppWebView";
import { authClient } from "@/lib/auth-client";
import { syncWatchStatsFromCache } from "@/lib/sync-watch-stats";

export default function HomeScreen() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session) {
      void syncWatchStatsFromCache();
    }
  }, [session]);

  if (isPending) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#121327" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return <AppWebView />;
}

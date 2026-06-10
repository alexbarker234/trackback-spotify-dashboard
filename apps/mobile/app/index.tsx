import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { AppWebView } from "@/components/AppWebView";
import { authClient } from "@/lib/auth-client";

export default function HomeScreen() {
  const { data: session, isPending } = authClient.useSession();

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

import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { authClient } from "@/lib/auth-client";
import { refreshStatWidget } from "@/lib/refresh-stat-widget";

export default function ProfileScreen() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [refreshingWidget, setRefreshingWidget] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshWidget = async () => {
    setRefreshingWidget(true);
    try {
      await refreshStatWidget();
    } finally {
      setRefreshingWidget(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppIcon size={72} style={styles.logo} />
      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.name}>{session?.user.name ?? session?.user.email ?? "User"}</Text>

      {Platform.OS === "android" ? (
        <Pressable
          style={[styles.button, styles.widgetButton, refreshingWidget && styles.buttonDisabled]}
          onPress={handleRefreshWidget}
          disabled={refreshingWidget}
        >
          {refreshingWidget ? (
            <ActivityIndicator color="#fafafa" />
          ) : (
            <Text style={styles.buttonText}>Refresh home screen widget</Text>
          )}
        </Pressable>
      ) : null}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignOut}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign out</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#0a0a0a",
  },
  logo: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#737373",
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fafafa",
    marginBottom: 32,
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#262626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    cursor: "pointer",
  },
  widgetButton: {
    marginBottom: 16,
    backgroundColor: "#1db954",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fafafa",
    fontSize: 16,
    fontWeight: "500",
  },
});

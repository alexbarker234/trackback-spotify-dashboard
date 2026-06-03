import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { authClient } from "@/lib/auth-client";

export default function ProfileScreen() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.name}>{session?.user.name ?? session?.user.email ?? "User"}</Text>

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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fafafa",
    fontSize: 16,
    fontWeight: "500",
  },
});

import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { authClient } from "@/lib/auth-client";
import { clearWebViewAuthCookies } from "@/lib/sync-webview-cookies";

export default function LoginScreen() {
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void clearWebViewAuthCookies();
  }, []);

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/" />;
  }

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.social({
        provider: "spotify",
        callbackURL: "/",
      });

      if (result.error) {
        setError(result.error.message ?? "Sign in failed");
        return;
      }

      await authClient.getSession();
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppIcon size={96} style={styles.logo} />
      <Text style={styles.title}>Trackback</Text>
      <Text style={styles.subtitle}>Your Spotify listening dashboard</Text>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in with Spotify</Text>
        )}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0a0a0a",
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#a3a3a3",
    marginBottom: 48,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1db954",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    minWidth: 220,
    alignItems: "center",
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    marginTop: 16,
    color: "#f87171",
    textAlign: "center",
  },
});

"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { FaSpotify } from "react-icons/fa";

export default function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "spotify"
      });
      if (result.data?.redirect) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
    >
      {loading ? (
        <span>Signing in...</span>
      ) : (
        <>
          <FaSpotify />
          <span>Sign in with Spotify</span>
        </>
      )}
    </button>
  );
}

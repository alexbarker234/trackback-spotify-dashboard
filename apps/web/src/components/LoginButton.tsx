"use client";

import { authClient } from "@/lib/auth-client";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

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
      className="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 font-medium text-white transition-colors hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FontAwesomeIcon icon={faSpotify} />
      <span>Sign in with Spotify</span>
    </button>
  );
}

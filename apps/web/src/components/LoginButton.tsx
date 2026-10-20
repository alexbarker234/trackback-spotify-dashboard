"use client";

import { authClient } from "@/lib/auth-client";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import Loading from "./Loading";

let signInRequest: Promise<string | null> | null = null;

function requestSpotifySignIn() {
  if (!signInRequest) {
    signInRequest = authClient
      .signIn.social({ provider: "spotify" })
      .then((result) => {
        if (result.data?.redirect && result.data.url) return result.data.url;
        signInRequest = null;
        return null;
      })
      .catch((error) => {
        console.error("Login failed", error);
        signInRequest = null;
        return null;
      });
  }
  return signInRequest;
}

export default function LoginButton() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void requestSpotifySignIn().then((url) => {
      if (!active) return;
      if (url) {
        window.location.href = url;
        return;
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = () => {
    setLoading(true);
    void requestSpotifySignIn().then((url) => {
      if (url) {
        window.location.href = url;
        return;
      }
      setLoading(false);
    });
  };

  if (loading) return <Loading />;

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 font-medium text-white transition-colors hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FontAwesomeIcon icon={faSpotify} />
      <span>Sign in with Spotify</span>
    </button>
  );
}

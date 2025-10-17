"use client";

import { authClient } from "@/lib/auth-client";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./Button";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      loading={loading}
      onClick={handleLogout}
      label="Sign out"
      icon={faSignOutAlt}
      variant="danger"
      className="w-full"
    />
  );
}

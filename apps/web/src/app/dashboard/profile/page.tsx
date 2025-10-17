import Button from "@/components/Button";
import LogoutButton from "@/components/LogoutButton";
import { auth } from "@/lib/auth";
import { faUpload, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Profile"
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const user = session.user;

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4">
      {/* User Profile Section */}
      <div className="rounded-lg bg-white/5 p-6 text-center backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-32 w-32 justify-center">
          {user.image ? (
            <div className="mt-4">
              <img src={user.image} alt="Profile" className="rounded-full" />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
              <FontAwesomeIcon icon={faUser} className="text-2xl text-white" />
            </div>
          )}
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">{user.name || "Spotify User"}</h1>

        {user.email && <p className="text-gray-400">{user.email}</p>}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button href="/dashboard/import" label="Import Data" icon={faUpload} variant="primary" className="w-full" />

        <LogoutButton />
      </div>
    </div>
  );
}

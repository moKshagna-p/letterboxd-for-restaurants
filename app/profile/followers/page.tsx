"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthStorage from "../../utils/authStorage";

export default function FollowersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user");
  const [user, setUser] = useState(() => {
    if (userId)
      return AuthStorage.getUsers().find((u) => u.id === userId) || null;
    return AuthStorage.currentUser();
  });
  const [followers, setFollowers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    const allUsers = AuthStorage.getUsers();
    setFollowers(
      (user.followers || [])
        .map((id) => allUsers.find((u) => u.id === id))
        .filter(Boolean)
    );
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.name}'s Followers
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
          {followers.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              No followers yet
            </div>
          ) : (
            <div className="space-y-4">
              {followers.map((f) => (
                <Link
                  key={f.id}
                  href={`/profile?user=${f.username}`}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-xl">
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {f.name}
                    </div>
                    <div className="text-gray-500 text-sm">@{f.username}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import AuthStorage from "../utils/authStorage";
import RestaurantStorage from "../utils/restaurantStorage";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState(() => AuthStorage.currentUser());
  const [listsCount, setListsCount] = useState(0);

  useEffect(() => {
    if (!me) {
      router.replace("/auth/login");
      return;
    }
    setListsCount(RestaurantStorage.getInstance().getUserLists().length);
  }, []);

  if (!me) return null;

  const diary = AuthStorage.getDiary(me.id);
  const followers = me.followers?.length || 0;
  const following = me.following?.length || 0;
  const incoming = me.incomingRequests || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-2xl">
                {me.name.charAt(0)}
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">
                  {me.name}
                </div>
                <div className="text-gray-500">@{me.username}</div>
              </div>
            </div>
            <button
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              onClick={() => {
                AuthStorage.logout();
                router.push("/");
              }}
            >
              Log out
            </button>
          </div>
          {me.bio && (
            <p className="text-gray-600 dark:text-gray-400 mt-4">{me.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {diary.length}
            </div>
            <div className="text-gray-500">Restaurants Logged</div>
          </div>
          <Link
            href="/lists"
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {listsCount}
            </div>
            <div className="text-gray-500">Lists</div>
          </Link>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center">
            <Link
              href={`/profile/followers?user=${me.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors p-2 -m-2 rounded-lg"
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {followers}
              </div>
              <div className="text-gray-500">Followers</div>
            </Link>
            <Link
              href={`/profile/following?user=${me.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors p-2 -m-2 rounded-lg mt-2"
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {following}
              </div>
              <div className="text-gray-500">Following</div>
            </Link>
          </div>
        </div>

        {/* Incoming requests */}
        {incoming.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow mb-6">
            <div className="font-semibold text-gray-900 dark:text-white mb-3">
              Follow Requests
            </div>
            <div className="space-y-3">
              {incoming.map((id) => {
                const u = AuthStorage.getUsers().find((x) => x.id === id)!;
                return (
                  <div key={id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-gray-900 dark:text-white">
                          {u.name}
                        </div>
                        <div className="text-gray-500 text-sm">
                          @{u.username}
                        </div>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1 rounded-full bg-orange-600 text-white text-sm"
                      onClick={() => {
                        AuthStorage.acceptFollowRequest(id);
                        window.location.reload();
                      }}
                    >
                      Accept
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Diary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
          <div className="font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </div>
          {diary.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-400">
              No activity yet. Log a restaurant to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {diary.map((log) => (
                <div key={log.id} className="flex items-center gap-4">
                  <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                    {log.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={log.photoUrl}
                        alt={log.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>🍽️</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-white">
                      {log.name}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

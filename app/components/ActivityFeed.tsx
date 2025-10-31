"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import AuthStorage, { VisitLog } from "../utils/authStorage";

interface ActivityItem {
  userId: string;
  userName: string;
  userAvatar: string;
  action: "logged";
  restaurantName: string;
  restaurantId: string;
  restaurantPhoto?: string | null;
  date: number;
  rating?: number;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const currentUser = AuthStorage.currentUser();
    if (!currentUser) return;

    const allUsers = AuthStorage.getUsers();
    const following = currentUser.following || [];
    const activityItems: ActivityItem[] = [];

    // Get recent activities from users you follow
    following.forEach((userId) => {
      const user = allUsers.find((u) => u.id === userId);
      if (!user || !user.diary) return;

      const recentVisits = user.diary.slice(0, 5); // Get last 5 visits
      recentVisits.forEach((visit: VisitLog) => {
        activityItems.push({
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar || user.name.charAt(0),
          action: "logged",
          restaurantName: visit.name,
          restaurantId: visit.placeId,
          restaurantPhoto: visit.photoUrl,
          date: visit.date,
          rating: visit.rating,
        });
      });
    });

    // Sort by date (newest first)
    activityItems.sort((a, b) => b.date - a.date);

    // Limit to 20 most recent
    setActivities(activityItems.slice(0, 20));
  }, []);

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Activity Feed
        </h2>
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <p>Follow users to see their restaurant activity here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Activity Feed
      </h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <Link
            key={`${activity.userId}-${activity.restaurantId}-${index}`}
            href={`/restaurants/google/${activity.restaurantId}`}
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {activity.userAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {activity.userName}
                </span>{" "}
                logged{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {activity.restaurantName}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {activity.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">
                      {activity.rating}
                    </span>
                  </div>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {activity.restaurantPhoto ? (
                <Image
                  src={activity.restaurantPhoto}
                  alt={activity.restaurantName}
                  width={64}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized={true}
                />
              ) : (
                <span className="text-lg">🍽️</span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

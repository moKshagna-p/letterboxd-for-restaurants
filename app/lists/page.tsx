"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Star,
  MapPin,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import RestaurantStorage, { UserList } from "../utils/restaurantStorage";

export default function UserListsPage() {
  const router = useRouter();
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [storage] = useState(() => RestaurantStorage.getInstance());

  useEffect(() => {
    loadUserLists();
  }, []);

  const loadUserLists = () => {
    const lists = storage.getUserLists();
    setUserLists(lists);
    setLoading(false);
  };

  const handleDeleteList = (listId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this list? This action cannot be undone."
      )
    ) {
      const success = storage.deleteUserList(listId);
      if (success) {
        loadUserLists();
      }
    }
  };

  const handleRemoveRestaurant = (listId: string, placeId: string) => {
    const success = storage.removeRestaurantFromList(listId, placeId);
    if (success) {
      loadUserLists();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading your lists...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Lists
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your personal restaurant collections
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/lists/create")}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create List
          </button>
        </div>

        {/* Lists Grid */}
        {userLists.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No lists created yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first list to organize your favorite restaurants
            </p>
            <button
              onClick={() => router.push("/lists/create")}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Create Your First List
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userLists.map((list) => (
              <div
                key={list.id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                {/* List Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{list.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {list.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {list.restaurants.length} restaurants
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/lists/edit/${list.id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {list.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {list.description}
                    </p>
                  )}
                </div>

                {/* Restaurants Preview */}
                <div className="p-6">
                  {list.restaurants.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No restaurants added yet</p>
                      <p className="text-xs mt-1">
                        Add restaurants from search results
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {list.restaurants.slice(0, 3).map((restaurant) => (
                        <div
                          key={restaurant.placeId}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {restaurant.photoUrl ? (
                              <Image
                                src={restaurant.photoUrl}
                                alt={restaurant.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                                unoptimized={true}
                              />
                            ) : (
                              <div className="text-white text-sm">🍽️</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/restaurants/google/${restaurant.placeId}`}
                              className="block"
                            >
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {restaurant.name}
                              </h4>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {restaurant.rating}
                                </span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500 truncate">
                                  {restaurant.address.split(",")[0]}
                                </span>
                              </div>
                            </Link>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveRestaurant(
                                list.id,
                                restaurant.placeId
                              )
                            }
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {list.restaurants.length > 3 && (
                        <div className="text-center pt-2">
                          <Link
                            href={`/lists/${list.id}`}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                          >
                            View all {list.restaurants.length} restaurants →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


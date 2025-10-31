"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  MapPin,
  ArrowLeft,
  Loader2,
  Filter,
  SortAsc,
} from "lucide-react";
import AddToList from "../components/AddToList";
import AuthStorage from "../utils/authStorage";
import RestaurantStorage from "../utils/restaurantStorage";

interface SearchResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  photoUrl: string | null;
  openNow?: boolean;
  placeId: string;
  types?: string[];
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "distance" | "name">(
    "rating"
  );

  const query = searchParams.get("q");
  const type = searchParams.get("type") || "restaurants";
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") || "15000";

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (type !== "restaurants") {
        setLoading(false);
        setError(null);
        return;
      }
      if (!lat || !lng) {
        setError("Location not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Store search in localStorage
        const searchData = {
          query,
          location: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius: parseInt(radius),
          timestamp: Date.now(),
        };
        localStorage.setItem("lastSearch", JSON.stringify(searchData));

        // Fetch restaurants using comprehensive search
        const response = await fetch(
          `/api/places/search?q=${encodeURIComponent(
            query || ""
          )}&lat=${lat}&lng=${lng}&radius=${radius}`
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data.restaurants || []);

          // Store results in localStorage
          localStorage.setItem(
            "searchResults",
            JSON.stringify(data.restaurants || [])
          );
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch search results");
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Error fetching search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [lat, lng, radius, query, type]);

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      case "distance":
        // For now, just return as-is since we don't have distance data
        return 0;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {type === "restaurants"
              ? "Searching for restaurants near you..."
              : "Loading results..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Search Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
                <option value="distance">Sort by Distance</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {type === "profiles"
                ? `Profiles matching "${query}"`
                : type === "lists"
                ? `Lists matching "${query}"`
                : `Search Results for "${query}"`}
            </h1>
            {type === "restaurants" && (
              <p className="text-gray-600 dark:text-gray-400">
                Found {results.length} restaurants in Chennai
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-8">
        {type === "profiles" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AuthStorage.searchProfiles(query || "").map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-700">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {p.name}
                    </div>
                    <div className="text-gray-500 text-sm">@{p.username}</div>
                  </div>
                </div>
                {p.bio && (
                  <p className="text-gray-600 dark:text-gray-400 mt-3">
                    {p.bio}
                  </p>
                )}
                <div className="mt-4">
                  {(() => {
                    const me = AuthStorage.currentUser();
                    if (!me || me.id === p.id) return null;
                    const alreadyFollowing = (me.following || []).includes(
                      p.id
                    );
                    const alreadyRequested = (
                      me.outgoingRequests || []
                    ).includes(p.id);
                    return (
                      <button
                        onClick={() => {
                          if (alreadyFollowing || alreadyRequested) return;
                          const res = AuthStorage.sendFollowRequest(p.id);
                          if (!res.success) alert(res.error);
                          else window.location.reload();
                        }}
                        className="px-4 py-2 rounded-full text-sm bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                        disabled={alreadyFollowing || alreadyRequested}
                      >
                        {alreadyFollowing
                          ? "Following"
                          : alreadyRequested
                          ? "Requested"
                          : "Follow"}
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : type === "lists" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const currentUser = AuthStorage.currentUser();
              if (!currentUser) return [];
              return RestaurantStorage.getInstance()
                .getUserLists(currentUser.id)
                .filter((l) =>
                  (query || "")
                    .toLowerCase()
                    .split(" ")
                    .every((t) =>
                      (l.name + " " + (l.description || ""))
                        .toLowerCase()
                        .includes(t)
                    )
                );
            })().map((l) => (
              <div
                key={l.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{l.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {l.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {l.restaurants.length} places
                    </div>
                  </div>
                </div>
                {l.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-3">
                    {l.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : sortedResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedResults.map((restaurant) => (
              <div
                key={restaurant.placeId}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 group"
              >
                {/* Restaurant Image */}
                <div className="h-48 bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center overflow-hidden">
                  {restaurant.photoUrl ? (
                    <Image
                      src={restaurant.photoUrl}
                      alt={restaurant.name}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      unoptimized={true}
                    />
                  ) : (
                    <div className="text-white text-6xl">🍽️</div>
                  )}
                </div>

                <div className="p-6">
                  <Link
                    href={`/restaurants/google/${restaurant.placeId}`}
                    className="block"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {restaurant.rating || 0}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({restaurant.reviewCount} reviews)
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {restaurant.address}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>In Chennai</span>
                    </div>
                  </Link>

                  {/* Add to List Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <AddToList
                      restaurant={{
                        id: restaurant.id,
                        name: restaurant.name,
                        address: restaurant.address,
                        rating: restaurant.rating,
                        reviewCount: restaurant.reviewCount,
                        photoUrl: restaurant.photoUrl,
                        openNow: restaurant.openNow,
                        placeId: restaurant.placeId,
                        types: restaurant.types,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {type === "profiles"
                ? "No profiles found"
                : type === "lists"
                ? "No lists found"
                : "No restaurants found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {type === "restaurants"
                ? "Try adjusting your search terms or location"
                : "Try a different query"}
            </p>
            <button
              onClick={() => router.back()}
              className="bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

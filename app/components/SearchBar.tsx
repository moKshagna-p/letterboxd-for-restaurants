"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2 } from "lucide-react";
import AuthStorage from "../utils/authStorage";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"restaurants" | "profiles" | "lists">(
    "restaurants"
  );
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const router = useRouter();

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search term");
      return;
    }

    setIsSearching(true);

    try {
      if (mode !== "restaurants") {
        // Require login for profiles/lists
        if (!AuthStorage.currentUser()) {
          alert("Please log in to search profiles and lists.");
          router.push("/auth/login");
          return;
        }
        router.push(
          `/search?type=${mode}&q=${encodeURIComponent(searchQuery)}`
        );
      } else {
        // Use Chennai's coordinates for city-wide search
        const chennaiLocation = {
          lat: 13.0827,
          lng: 80.2707,
        };
        const searchData = {
          query: searchQuery,
          location: chennaiLocation,
          radius: 50000,
          timestamp: Date.now(),
        };
        localStorage.setItem("lastSearch", JSON.stringify(searchData));
        router.push(
          `/search?q=${encodeURIComponent(searchQuery)}&lat=${
            chennaiLocation.lat
          }&lng=${chennaiLocation.lng}&radius=50000`
        );
      }
    } catch (error) {
      console.error("Error in search:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
        <MapPin className="w-6 h-6 text-orange-600 ml-4" />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
          className="bg-transparent text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 pr-3"
        >
          <option value="restaurants">Restaurants</option>
          <option value="profiles">Profiles</option>
          <option value="lists">Lists</option>
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            mode === "restaurants"
              ? "Search restaurants, cuisines, or locations..."
              : mode === "profiles"
              ? "Search user profiles..."
              : "Search your lists..."
          }
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
          disabled={isSearching}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-orange-600 text-white px-8 py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
        Search all restaurants in Chennai
      </p>
    </div>
  );
}

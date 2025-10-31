"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2 } from "lucide-react";
import AuthStorage from "../utils/authStorage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
      <div className="flex gap-2 p-2 bg-card rounded-full shadow-lg border">
        <div className="flex items-center pl-4 pr-2">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <Select value={mode} onValueChange={(value: any) => setMode(value)}>
          <SelectTrigger className="w-[140px] border-0 shadow-none bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="restaurants">Restaurants</SelectItem>
            <SelectItem value="profiles">Profiles</SelectItem>
            <SelectItem value="lists">Lists</SelectItem>
          </SelectContent>
        </Select>
        <Input
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
          className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent"
          disabled={isSearching}
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          size="lg"
          className="rounded-full"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Search
            </>
          )}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground text-center mt-2">
        Search all restaurants in Chennai
      </p>
    </div>
  );
}

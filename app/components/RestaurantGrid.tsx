"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Star, MapPin, Loader2, AlertCircle } from "lucide-react";
import { restaurants } from "../../data/restaurants";
import Image from "next/image";
import RestaurantStorage from "../utils/restaurantStorage";
import AddToList from "./AddToList";

interface GoogleRestaurant {
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

export default function RestaurantGrid() {
  const [googleRestaurants, setGoogleRestaurants] = useState<
    GoogleRestaurant[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [useGoogleData, setUseGoogleData] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasTriedFetching, setHasTriedFetching] = useState(false);
  const [storage] = useState(() => RestaurantStorage.getInstance());

  const fetchNearbyRestaurants = async () => {
    if (!location) {
      alert("Location is required to find nearby restaurants.");
      return;
    }

    setLoading(true);
    setUseGoogleData(true);

    try {
      const response = await fetch(
        `/api/places/nearby?lat=${location.lat}&lng=${location.lng}&radius=5000`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched restaurants:", data.restaurants);

        // Store restaurants in local storage
        const restaurants = data.restaurants || [];
        restaurants.forEach((restaurant: GoogleRestaurant) => {
          storage.storeRestaurant({
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
            rating: restaurant.rating,
            reviewCount: restaurant.reviewCount,
            photoUrl: restaurant.photoUrl,
            openNow: restaurant.openNow,
            placeId: restaurant.placeId,
            types: restaurant.types,
            lastVisited: Date.now(),
          });
        });

        setGoogleRestaurants(restaurants);
      } else {
        let errorMessage = "Failed to fetch restaurants";
        try {
          const errorData = await response.json();
          console.error("Failed to fetch nearby restaurants:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response");
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        console.error("API Error:", errorMessage);
        alert(
          errorMessage +
            "\n\nPlease check:\n1. Places API is enabled in Google Cloud\n2. API key restrictions allow localhost\n3. Billing is enabled"
        );
        setUseGoogleData(false);
      }
    } catch (error) {
      console.error("Error fetching nearby restaurants:", error);
      alert(
        "Error fetching nearby restaurants. Please check console for details."
      );
      setUseGoogleData(false);
    } finally {
      setLoading(false);
      setHasTriedFetching(true);
    }
  };

  useEffect(() => {
    // Try to get user's location automatically when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("Got user location:", userLocation);
          setLocation(userLocation);
          // Automatically fetch nearby restaurants
          if (!hasTriedFetching) {
            fetchNearbyRestaurants();
          }
        },
        (error) => {
          console.log("Could not get location:", error);
          setLocationError(
            "Location access denied or unavailable. Click the button below to try manually."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Use Google data if available, otherwise fall back to static data
  const displayRestaurants =
    useGoogleData && googleRestaurants.length > 0
      ? googleRestaurants
      : restaurants.slice(0, 4);

  return (
    <>
      {/* Info and Toggle */}
      <div className="text-center mb-6 space-y-3">
        {locationError && (
          <div className="flex items-center justify-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{locationError}</span>
          </div>
        )}

        {!useGoogleData && location && (
          <div className="text-green-600 text-sm">
            Location detected! Fetching nearby restaurants...
          </div>
        )}

        <button
          onClick={() => {
            if (!location) {
              // Try to get location first
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setLocation({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    });
                    // Then fetch restaurants
                    setTimeout(() => fetchNearbyRestaurants(), 100);
                  },
                  (error) => {
                    alert(
                      "Could not get your location. Please enable location access."
                    );
                  }
                );
              }
            } else if (location && !useGoogleData) {
              fetchNearbyRestaurants();
            } else {
              setUseGoogleData(false);
            }
          }}
          className="px-6 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </span>
          ) : useGoogleData ? (
            "Show Chennai Restaurants"
          ) : (
            "Find Restaurants Near Me (5km)"
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Finding restaurants near you...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {displayRestaurants.map((restaurant: any) => (
            <div
              key={restaurant.id || restaurant.placeId}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 group"
            >
              {/* Restaurant Image */}
              <div className="h-48 bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center overflow-hidden relative">
                {useGoogleData && restaurant.photoUrl ? (
                  <Image
                    src={restaurant.photoUrl}
                    alt={restaurant.name}
                    width={800}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error("Image load error:", e);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-white text-6xl">
                    {restaurant.image || "🍽️"}
                  </div>
                )}
              </div>

              <div className="p-6">
                <Link
                  href={
                    useGoogleData
                      ? `/restaurants/google/${restaurant.placeId}`
                      : `/restaurants/${restaurant.id}`
                  }
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
                      (
                      {useGoogleData
                        ? restaurant.reviewCount
                        : restaurant.reviews.length}{" "}
                      reviews)
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {restaurant.cuisine ||
                      (useGoogleData ? restaurant.address : "")}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {useGoogleData ? restaurant.address : restaurant.location}
                    </span>
                  </div>
                </Link>

                {/* Add to List Button */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <AddToList
                    restaurant={{
                      id: restaurant.id || restaurant.placeId,
                      name: restaurant.name,
                      address: restaurant.address || restaurant.location,
                      rating: restaurant.rating || 0,
                      reviewCount:
                        restaurant.reviewCount ||
                        restaurant.reviews?.length ||
                        0,
                      photoUrl: restaurant.photoUrl,
                      openNow: restaurant.openNow,
                      placeId: restaurant.placeId || restaurant.id,
                      types: restaurant.types,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

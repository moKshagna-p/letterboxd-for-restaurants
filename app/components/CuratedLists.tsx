"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Clock, UtensilsCrossed, Loader2 } from "lucide-react";
import RestaurantStorage from "../utils/restaurantStorage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";

interface CuratedRestaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  photoUrl: string | null;
  openNow?: boolean;
  placeId: string;
  types?: string[];
  category: string;
}

interface CuratedList {
  id: string;
  title: string;
  description: string;
  icon: string;
  restaurants: CuratedRestaurant[];
  searchQuery: string;
}

export default function CuratedLists() {
  const [lists, setLists] = useState<CuratedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [storage] = useState(() => RestaurantStorage.getInstance());

  const fetchRestaurantsForCategory = async (
    searchQuery: string,
    category: string
  ) => {
    try {
      // Try to get user's location
      const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (position) =>
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }),
            reject,
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
          );
        });
      };

      const location = await getCurrentLocation();

      // Search for restaurants with the specific query using user's location
      const response = await fetch(
        `/api/places/search?q=${encodeURIComponent(searchQuery)}&lat=${
          location.lat
        }&lng=${location.lng}&radius=15000`
      );

      if (response.ok) {
        const data = await response.json();
        return (data.restaurants || []).slice(0, 3).map((restaurant: any) => ({
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          rating: restaurant.rating,
          reviewCount: restaurant.reviewCount,
          photoUrl: restaurant.photoUrl,
          openNow: restaurant.openNow,
          placeId: restaurant.placeId,
          types: restaurant.types,
          category: category,
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${category} restaurants:`, error);
    }

    return [];
  };

  useEffect(() => {
    const generateCuratedLists = async () => {
      setLoading(true);

      try {
        // Define curated list configurations
        const listConfigs = [
          {
            id: "biryani-spots",
            title: "Favorite Biryani Spots",
            description: "The best places for authentic biryani in Chennai",
            icon: "🍛",
            searchQuery: "biryani restaurant",
            category: "biryani",
          },
          {
            id: "night-cafes",
            title: "Best Night Cafes",
            description:
              "Perfect spots for late-night coffee and conversations",
            icon: "☕",
            searchQuery: "coffee shop cafe",
            category: "cafe",
          },
          {
            id: "fine-dining",
            title: "Fine Dining Experiences",
            description: "Upscale restaurants for special occasions",
            icon: "🍽️",
            searchQuery: "fine dining restaurant",
            category: "fine-dining",
          },
        ];

        // Fetch restaurants for each category
        const curatedLists: CuratedList[] = await Promise.all(
          listConfigs.map(async (config) => {
            const restaurants = await fetchRestaurantsForCategory(
              config.searchQuery,
              config.category
            );
            return {
              id: config.id,
              title: config.title,
              description: config.description,
              icon: config.icon,
              searchQuery: config.searchQuery,
              restaurants: restaurants,
            };
          })
        );

        // Store in localStorage
        storage.storeCuratedLists(curatedLists);
        setLists(curatedLists);
      } catch (error) {
        console.error("Error generating curated lists:", error);
        // Fallback to empty lists
        setLists([]);
      } finally {
        setLoading(false);
      }
    };

    generateCuratedLists();
  }, [storage]);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Curated Lists</h2>
            <p className="text-muted-foreground">
              Discovering the best restaurants near you...
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Loading curated lists...
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Curated Lists</h2>
          <p className="text-muted-foreground">
            Handpicked collections of the best restaurants near you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lists.map((list) => (
            <Card key={list.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{list.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{list.title}</CardTitle>
                    <CardDescription>{list.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {list.restaurants.length > 0 ? (
                    list.restaurants.map((restaurant) => (
                      <Link
                        key={restaurant.placeId}
                        href={`/restaurants/google/${restaurant.placeId}`}
                        className="block p-3 bg-muted rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {/* Restaurant Image */}
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {restaurant.photoUrl ? (
                              <Image
                                src={restaurant.photoUrl}
                                alt={restaurant.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                                unoptimized={true}
                              />
                            ) : (
                              <div className="text-white text-lg">🍽️</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {restaurant.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">
                                {restaurant.rating}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                •
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {restaurant.address.split(",")[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No restaurants found for this category
                    </div>
                  )}
                </div>

                <Button variant="ghost" className="w-full mt-4" size="sm">
                  View All →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

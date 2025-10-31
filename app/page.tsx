"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  Star,
  Users,
  MapPin,
  UtensilsCrossed,
  TrendingUp,
  User,
  LogOut,
} from "lucide-react";
import { restaurants } from "../data/restaurants";
import RestaurantGrid from "./components/RestaurantGrid";
import SearchBar from "./components/SearchBar";
import CuratedLists from "./components/CuratedLists";
import ActivityFeed from "./components/ActivityFeed";
import AuthStorage from "./utils/authStorage";

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined") {
      return AuthStorage.currentUser();
    }
    return null;
  });

  useEffect(() => {
    setCurrentUser(AuthStorage.currentUser());
  }, []);

  const handleLogout = () => {
    AuthStorage.logout();
    setCurrentUser(null);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-8 h-8 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            RestaurantReview
          </h1>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <a
            href="#explore"
            className="text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-colors"
          >
            Explore
          </a>
          <a
            href="#features"
            className="text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-colors"
          >
            Features
          </a>
          <Link
            href="/lists"
            className="text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-colors"
          >
            My Lists
          </Link>
          {currentUser ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-colors"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Discover the Best
            <span className="text-orange-600"> Restaurants</span>
            <br />
            Near You
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Find authentic reviews, ratings, and recommendations from real
            diners. Share your experiences and help others discover amazing
            food.
          </p>

          {/* Search Bar */}
          <SearchBar />

          {/* Activity Feed - Only show when logged in */}
          {currentUser && (
            <div className="max-w-4xl mx-auto mt-12">
              <ActivityFeed />
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600">10K+</div>
              <div className="text-gray-600 dark:text-gray-400">
                Restaurants
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">50K+</div>
              <div className="text-gray-600 dark:text-gray-400">Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">100K+</div>
              <div className="text-gray-600 dark:text-gray-400">
                Food Lovers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section id="explore" className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <TrendingUp className="w-10 h-10 text-orange-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Popular Restaurants
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Most reviewed and loved places in town
          </p>
        </div>

        <RestaurantGrid />
      </section>

      {/* Curated Lists Section */}
      <CuratedLists />

      {/* Features Section */}
      <section id="features" className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Everything you need to find your next favorite restaurant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Verified Reviews
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Read authentic reviews from verified diners who have actually
                visited the restaurants
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Community Driven
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join a community of food lovers sharing their experiences and
                discovering new favorites
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Location Based
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find restaurants near you with accurate locations, maps, and
                directions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-pink-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Discover Amazing Food?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of food lovers sharing reviews and finding the best
            restaurants
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
            <a
              href="#explore"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Browse Restaurants
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <UtensilsCrossed className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-white">RestaurantReview</h3>
            </div>
            <p className="text-sm">
              &copy; 2024 RestaurantReview. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">RestaurantReview</h1>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <a
            href="#explore"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Explore
          </a>
          <a
            href="#features"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Features
          </a>
          <Link
            href="/lists"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            My Lists
          </Link>
          {currentUser ? (
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover the Best
            <span className="text-primary"> Restaurants</span>
            <br />
            Near You
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
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
            <Card className="border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-muted-foreground">Restaurants</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-muted-foreground">Reviews</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">100K+</div>
                <div className="text-muted-foreground">Food Lovers</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section id="explore" className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <TrendingUp className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Popular Restaurants</h2>
          <p className="text-muted-foreground">
            Most reviewed and loved places in town
          </p>
        </div>

        <RestaurantGrid />
      </section>

      {/* Curated Lists Section */}
      <CuratedLists />

      {/* Features Section */}
      <section id="features" className="bg-card py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground">
              Everything you need to find your next favorite restaurant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="mb-3">Verified Reviews</CardTitle>
                <CardDescription>
                  Read authentic reviews from verified diners who have actually
                  visited the restaurants
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="mb-3">Community Driven</CardTitle>
                <CardDescription>
                  Join a community of food lovers sharing their experiences and
                  discovering new favorites
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="mb-3">Location Based</CardTitle>
                <CardDescription>
                  Find restaurants near you with accurate locations, maps, and
                  directions
                </CardDescription>
              </CardContent>
            </Card>
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
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="rounded-full">
                Get Started Free
              </Button>
            </Link>
            <a href="#explore">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white text-white hover:bg-white/10"
              >
                Browse Restaurants
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">RestaurantReview</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 RestaurantReview. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

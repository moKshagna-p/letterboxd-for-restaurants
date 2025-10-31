"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowLeft,
  MapPin,
  UtensilsCrossed,
  Loader2,
  Plus,
  Filter,
  SortAsc,
  Camera,
  Heart,
  MessageCircle,
  ThumbsUp,
  Share2,
} from "lucide-react";
import AddToList from "../../../components/AddToList";
import RestaurantStorage from "../../../utils/restaurantStorage";
import AuthStorage from "../../../utils/authStorage";

interface GooglePlaceData {
  name: string;
  formatted_address: string;
  rating: number;
  user_ratings_total: number;
  photos: Array<{ url: string; reference: string }>;
  reviews: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  website?: string;
  formatted_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

export default function GoogleRestaurantPage() {
  const params = useParams();
  const [placeData, setPlaceData] = useState<GooglePlaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [reviewSort, setReviewSort] = useState<"newest" | "oldest" | "rating">(
    "newest"
  );
  const [showMenuPhotos, setShowMenuPhotos] = useState(false);
  const [menuPhotos, setMenuPhotos] = useState<string[]>([]);
  const [showLogVisitModal, setShowLogVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [visitRating, setVisitRating] = useState(0);
  const [storage] = useState(() => RestaurantStorage.getInstance());

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    userName: "",
    rating: 5,
    comment: "",
    foodRating: 5,
    serviceRating: 5,
    ambianceRating: 5,
    valueRating: 5,
  });

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      console.log("useEffect triggered, params.id:", params.id);
      setLoading(true);
      setError(null);

      // Auto-timeout after 8 seconds
      const timeoutId = setTimeout(() => {
        console.log("Auto-timeout triggered");
        setError("Loading timed out. Please try refreshing the page.");
        setLoading(false);
      }, 8000);

      try {
        console.log("Fetching place details for:", params.id);

        const response = await fetch(
          `/api/places/details?place_id=${params.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        clearTimeout(timeoutId);
        console.log("Response received:", response.status, response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log("Place details loaded:", data.name);
          setPlaceData(data);

          // Load stored user reviews
          const storedReviews = storage.getUserReviews(
            params.id as string
          ) as any[];
          setUserReviews(storedReviews);
        } else {
          const errorData = await response.json();
          console.error("Failed to load restaurant details:", errorData);
          setError(errorData.error || "Failed to load restaurant details");
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("Error fetching place details:", err);
        setError("Error loading restaurant details. Please try again.");
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPlaceDetails();
    } else {
      console.log("No params.id, setting error");
      setError("No restaurant ID provided");
      setLoading(false);
    }
  }, [params.id]);

  const handleSubmitReview = () => {
    if (!reviewForm.userName || !reviewForm.comment) {
      alert("Please fill in your name and review comment");
      return;
    }

    const newReview = {
      id: `user-review-${Date.now()}`,
      userName: reviewForm.userName,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      date: new Date().toISOString().split("T")[0],
      foodRating: reviewForm.foodRating,
      serviceRating: reviewForm.serviceRating,
      ambianceRating: reviewForm.ambianceRating,
      valueRating: reviewForm.valueRating,
      likes: 0,
      isUserReview: true,
    };

    setUserReviews([newReview, ...userReviews]);

    // Store review in local storage
    storage.storeUserReview(params.id as string, newReview);

    setReviewForm({
      userName: "",
      rating: 5,
      comment: "",
      foodRating: 5,
      serviceRating: 5,
      ambianceRating: 5,
      valueRating: 5,
    });
    setShowReviewModal(false);
  };

  const generateMenuPhotos = async () => {
    try {
      // Try to fetch menu photos from Google Places API
      const response = await fetch(
        `/api/places/details?place_id=${params.id}&fields=photos`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          // Use actual restaurant photos as menu photos
          const photos = data.photos.slice(0, 6).map((photo: any) => photo.url);
          setMenuPhotos(photos);
          setShowMenuPhotos(true);
          return;
        }
      }

      // Fallback to curated food photos if no restaurant photos available
      const fallbackPhotos = [
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563379091339-03246963d4d0?w=800&h=600&fit=crop",
      ];
      setMenuPhotos(fallbackPhotos);
      setShowMenuPhotos(true);
    } catch (error) {
      console.error("Error fetching menu photos:", error);
      // Use fallback photos on error
      const fallbackPhotos = [
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563379091339-03246963d4d0?w=800&h=600&fit=crop",
      ];
      setMenuPhotos(fallbackPhotos);
      setShowMenuPhotos(true);
    }
  };

  const sortedReviews = [...(placeData?.reviews || []), ...userReviews].sort(
    (a, b) => {
      switch (reviewSort) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading restaurant details...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This may take a few seconds
          </p>
          <button
            onClick={() => {
              setLoading(false);
              setError("Manual timeout - please refresh the page");
            }}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Cancel Loading
          </button>
        </div>
      </div>
    );
  }

  if (error || !placeData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Restaurant Not Found"}
          </h1>
          <Link href="/" className="text-orange-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Restaurants</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Photo Gallery */}
            <div className="md:w-1/3">
              {placeData.photos && placeData.photos.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative w-full h-64 rounded-2xl shadow-lg overflow-hidden">
                    <Image
                      src={placeData.photos[0].url}
                      alt={placeData.name}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image load error:", e);
                        e.currentTarget.style.display = "none";
                        // Show fallback
                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                      unoptimized={true}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-6xl hidden"
                      style={{ display: "none" }}
                    >
                      🍽️
                    </div>
                  </div>
                  {placeData.photos.length > 1 && (
                    <div className="grid grid-cols-2 gap-2">
                      {placeData.photos.slice(1, 3).map((photo, index) => (
                        <div
                          key={index}
                          className="relative w-full h-32 rounded-lg overflow-hidden"
                        >
                          <Image
                            src={photo.url}
                            alt={`${placeData.name} ${index + 2}`}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Image load error:", e);
                              e.currentTarget.style.display = "none";
                              // Show fallback
                              const fallback = e.currentTarget
                                .nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                            unoptimized={true}
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-2xl hidden"
                            style={{ display: "none" }}
                          >
                            🍽️
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl flex items-center justify-center text-6xl">
                  🍽️
                </div>
              )}
            </div>

            {/* Info */}
            <div className="md:w-2/3">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {placeData.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {placeData.formatted_address}
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900 px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {placeData.rating}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({placeData.user_ratings_total} reviews)
                  </span>
                </div>
                {placeData.opening_hours && (
                  <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 px-4 py-2 rounded-full">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        placeData.opening_hours.open_now
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {placeData.opening_hours.open_now ? "Open Now" : "Closed"}
                    </span>
                  </div>
                )}
              </div>

              {placeData.formatted_phone_number && (
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  📞 {placeData.formatted_phone_number}
                </p>
              )}
              {placeData.website && (
                <a
                  href={placeData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline"
                >
                  Visit Website →
                </a>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <AddToList
                  restaurant={{
                    id: (params.id as string) || "",
                    name: placeData.name,
                    address: placeData.formatted_address,
                    rating: placeData.rating || 0,
                    reviewCount: placeData.user_ratings_total || 0,
                    photoUrl: placeData.photos?.[0]?.url,
                    openNow: placeData.opening_hours?.open_now,
                    placeId: (params.id as string) || "",
                    types: [],
                  }}
                />
                <button
                  onClick={() => {
                    const me = AuthStorage.currentUser();
                    if (!me) {
                      alert("Please log in to log visits.");
                      window.location.href = "/auth/login";
                      return;
                    }
                    setShowLogVisitModal(true);
                  }}
                  className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Log Visit
                </button>
                <button
                  onClick={() => {
                    const storage = RestaurantStorage.getInstance();
                    // Ensure a default list exists
                    const me = AuthStorage.currentUser();
                    if (!me) {
                      alert("Please log in to add to lists.");
                      window.location.href = "/auth/login";
                      return;
                    }
                    const lists = storage.getUserLists(me.id);
                    let visitList = lists.find(
                      (l) => l.name === "Want to Visit"
                    );
                    if (!visitList) {
                      visitList = storage.createUserList(
                        "Want to Visit",
                        "Places I want to try",
                        "⭐",
                        me.id
                      );
                    }
                    storage.addRestaurantToList(
                      visitList.id,
                      {
                        id: (params.id as string) || "",
                        name: placeData.name,
                        address: placeData.formatted_address,
                        rating: placeData.rating || 0,
                        reviewCount: placeData.user_ratings_total || 0,
                        photoUrl: placeData.photos?.[0]?.url || null,
                        openNow: placeData.opening_hours?.open_now,
                        placeId: (params.id as string) || "",
                        types: [],
                      },
                      me.id
                    );
                    alert("Added to 'Want to Visit'.");
                  }}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  Add to Want to Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Photos Section */}
      {showMenuPhotos && (
        <section className="bg-white dark:bg-gray-800 py-12">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Menu Photos
              </h2>
              <button
                onClick={() => setShowMenuPhotos(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={photo}
                    alt={`Menu item ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-shadow"
                    onError={(e) => {
                      console.error("Menu image load error:", e);
                      e.currentTarget.style.display = "none";
                    }}
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-xl flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-full hover:bg-gray-100 transition-all">
                      View Full Size
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reviews ({sortedReviews.length})
            </h2>
            <div className="flex gap-3">
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rated</option>
              </select>
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Review
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {sortedReviews.length > 0 ? (
              sortedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                      {review.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {review.userName}
                        </h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {review.date}
                        </span>
                      </div>

                      {/* Detailed Ratings */}
                      {review.foodRating && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              Food:
                            </span>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.foodRating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              Service:
                            </span>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.serviceRating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              Ambiance:
                            </span>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.ambianceRating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              Value:
                            </span>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.valueRating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {review.comment}
                      </p>

                      {/* Review Actions */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.likes || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          Reply
                        </button>
                        <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        {review.isUserReview && (
                          <span className="ml-auto text-orange-600 font-medium">
                            Your Review
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Be the first to share your experience at this restaurant!
                </p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700 transition-colors"
                >
                  Write the First Review
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comprehensive Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* User Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={reviewForm.userName}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, userName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>

              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Overall Rating *
                </label>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: i + 1 })
                      }
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          i < reviewForm.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        } hover:scale-110 transition-transform`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Ratings */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Detailed Ratings
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "foodRating", label: "Food Quality" },
                    { key: "serviceRating", label: "Service" },
                    { key: "ambianceRating", label: "Ambiance" },
                    { key: "valueRating", label: "Value for Money" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {label}
                      </label>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() =>
                              setReviewForm({ ...reviewForm, [key]: i + 1 })
                            }
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                i <
                                (reviewForm[
                                  key as keyof typeof reviewForm
                                ] as number)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              } hover:scale-110 transition-transform`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Share your detailed experience at this restaurant..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewForm({
                      userName: "",
                      rating: 5,
                      comment: "",
                      foodRating: 5,
                      serviceRating: 5,
                      ambianceRating: 5,
                      valueRating: 5,
                    });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Visit Modal */}
      {showLogVisitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Log Visit
              </h3>
              <button
                onClick={() => {
                  setShowLogVisitModal(false);
                  setVisitDate(new Date().toISOString().split("T")[0]);
                  setVisitRating(0);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date Visited *
                </label>
                <input
                  type="date"
                  value={visitDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Rating (optional)
                </label>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setVisitRating(i + 1)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          i < visitRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        } hover:scale-110 transition-transform`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowLogVisitModal(false);
                    setVisitDate(new Date().toISOString().split("T")[0]);
                    setVisitRating(0);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const me = AuthStorage.currentUser();
                    if (!me) {
                      alert("Please log in to log visits.");
                      return;
                    }
                    const res = AuthStorage.logVisit({
                      placeId: (params.id as string) || "",
                      name: placeData.name,
                      photoUrl: placeData.photos?.[0]?.url || null,
                      date: new Date(visitDate).getTime(),
                      rating: visitRating || undefined,
                    });
                    if (!res.success) {
                      alert(res.error);
                    } else {
                      alert("Visit logged!");
                      setShowLogVisitModal(false);
                      setVisitDate(new Date().toISOString().split("T")[0]);
                      setVisitRating(0);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Log Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

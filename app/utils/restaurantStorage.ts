// Local storage utilities for restaurant data
export interface StoredRestaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  photoUrl: string | null;
  openNow?: boolean;
  placeId: string;
  types?: string[];
  lastVisited?: number;
  isFavorite?: boolean;
  userReviews?: any[];
}

export interface SearchHistory {
  query: string;
  location: { lat: number; lng: number };
  radius: number;
  timestamp: number;
  results: StoredRestaurant[];
}

export interface UserList {
  id: string;
  userId: string; // Add userId to make lists user-specific
  name: string;
  description: string;
  icon: string;
  restaurants: StoredRestaurant[];
  createdAt: number;
  updatedAt: number;
}

export interface CuratedList {
  id: string;
  title: string;
  description: string;
  icon: string;
  restaurants: StoredRestaurant[];
}

class RestaurantStorage {
  private static instance: RestaurantStorage;
  
  static getInstance(): RestaurantStorage {
    if (!RestaurantStorage.instance) {
      RestaurantStorage.instance = new RestaurantStorage();
    }
    return RestaurantStorage.instance;
  }

  // Store restaurant data
  storeRestaurant(restaurant: StoredRestaurant): void {
    try {
      const stored = this.getStoredRestaurants();
      const existingIndex = stored.findIndex(r => r.placeId === restaurant.placeId);
      
      if (existingIndex >= 0) {
        stored[existingIndex] = { ...stored[existingIndex], ...restaurant };
      } else {
        stored.push(restaurant);
      }
      
      localStorage.setItem('restaurants', JSON.stringify(stored));
    } catch (error) {
      console.error('Error storing restaurant:', error);
    }
  }

  // Get all stored restaurants
  getStoredRestaurants(): StoredRestaurant[] {
    try {
      const stored = localStorage.getItem('restaurants');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored restaurants:', error);
      return [];
    }
  }

  // Store search history
  storeSearchHistory(searchData: SearchHistory): void {
    try {
      const history = this.getSearchHistory();
      history.unshift(searchData);
      
      // Keep only last 10 searches
      if (history.length > 10) {
        history.splice(10);
      }
      
      localStorage.setItem('searchHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error storing search history:', error);
    }
  }

  // Get search history
  getSearchHistory(): SearchHistory[] {
    try {
      const history = localStorage.getItem('searchHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  // Store curated lists
  storeCuratedLists(lists: CuratedList[]): void {
    try {
      localStorage.setItem('curatedLists', JSON.stringify(lists));
    } catch (error) {
      console.error('Error storing curated lists:', error);
    }
  }

  // Get curated lists
  getCuratedLists(): CuratedList[] {
    try {
      const lists = localStorage.getItem('curatedLists');
      return lists ? JSON.parse(lists) : [];
    } catch (error) {
      console.error('Error getting curated lists:', error);
      return [];
    }
  }

  // Store user reviews
  storeUserReview(placeId: string, review: any): void {
    try {
      const reviews = this.getUserReviews();
      const placeReviews = reviews[placeId] || [];
      placeReviews.push(review);
      reviews[placeId] = placeReviews;
      
      localStorage.setItem('userReviews', JSON.stringify(reviews));
    } catch (error) {
      console.error('Error storing user review:', error);
    }
  }

  // Get user reviews for a place
  getUserReviews(placeId?: string): { [key: string]: any[] } | any[] {
    try {
      const reviews = localStorage.getItem('userReviews');
      const allReviews = reviews ? JSON.parse(reviews) : {};
      
      if (placeId) {
        return allReviews[placeId] || [];
      }
      
      return allReviews;
    } catch (error) {
      console.error('Error getting user reviews:', error);
      return placeId ? [] : {};
    }
  }

  // Mark restaurant as favorite
  toggleFavorite(placeId: string): boolean {
    try {
      const stored = this.getStoredRestaurants();
      const restaurant = stored.find(r => r.placeId === placeId);
      
      if (restaurant) {
        restaurant.isFavorite = !restaurant.isFavorite;
        this.storeRestaurant(restaurant);
        return restaurant.isFavorite;
      }
      
      return false;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  // Get favorite restaurants
  getFavoriteRestaurants(): StoredRestaurant[] {
    try {
      const stored = this.getStoredRestaurants();
      return stored.filter(r => r.isFavorite);
    } catch (error) {
      console.error('Error getting favorite restaurants:', error);
      return [];
    }
  }

  // Clear all data
  clearAllData(): void {
    try {
      localStorage.removeItem('restaurants');
      localStorage.removeItem('searchHistory');
      localStorage.removeItem('curatedLists');
      localStorage.removeItem('userReviews');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

Ø  // User Lists Management
  createUserList(name: string, description: string, icon: string, userId: string): UserList {
    try {
      const newList: UserList = {
        id: `user-list-${Date.now()}`,
        userId,
        name,
        description,
        icon,
        restaurants: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const userLists = this.getUserLists(userId);
      userLists.push(newList);
      this.saveUserLists(userId, userLists);
      console.log('Saved user list to localStorage:', newList.name);
      
      return newList;
    } catch (error) {
      console.error('Error creating user list:', error);
      throw error;
    }
  }

  getUserLists(userId?: string): UserList[] {
    try {
      // If userId is provided, return lists for that user
      if (userId) {
        const key = `userLists_${userId}`;
        const lists = localStorage.getItem(key);
        return lists ? JSON.parse(lists) : [];
      }
      
      // Otherwise, get current user's lists
      const currentUserId = localStorage.getItem('currentUserId');
      if (!currentUserId) return [];
      
      const key = `userLists_${currentUserId}`;
      const lists = localStorage.getItem(key);
      return lists ? JSON.parse(lists) : [];
    } catch (error) {
      console.error('Error getting user lists:', error);
      return [];
    }
  }

  private saveUserLists(userId: string, lists: UserList[]): void {
    const key = `userLists_${userId}`;
    localStorage.setItem(key, JSON.stringify(lists));
  }

  updateUserList(listId: string, updates: Partial<UserList>, userId?: string): boolean {
    try {
      const currentUserId = userId || localStorage.getItem('currentUserId');
      if (!currentUserId) return false;
      
      const userLists = this.getUserLists(currentUserId);
      const listIndex = userLists.findIndex(list => list.id === listId);
      
      if (listIndex >= 0) {
        userLists[listIndex] = {
          ...userLists[listIndex],
          ...updates,
          updatedAt: Date.now(),
        };
        this.saveUserLists(currentUserId, userLists);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating user list:', error);
      return false;
    }
  }

  deleteUserList(listId: string, userId?: string): boolean {
    try {
      const currentUserId = userId || localStorage.getItem('currentUserId');
      if (!currentUserId) return false;
      
      const userLists = this.getUserLists(currentUserId);
      const filteredLists = userLists.filter(list => list.id !== listId);
      this.saveUserLists(currentUserId, filteredLists);
      return true;
    } catch (error) {
      console.error('Error deleting user list:', error);
      return false;
    }
  }

  addRestaurantToList(listId: string, restaurant: StoredRestaurant, userId?: string): boolean {
    try {
      const currentUserId = userId || localStorage.getItem('currentUserId');
      if (!currentUserId) return false;
      
      const userLists = this.getUserLists(currentUserId);
      const listIndex = userLists.findIndex(list => list.id === listId);
      
      if (listIndex >= 0) {
        // Check if restaurant already exists in the list
        const existingIndex = userLists[listIndex].restaurants.findIndex(
          r => r.placeId === restaurant.placeId
        );
        
        if (existingIndex === -1) {
          userLists[listIndex].restaurants.push(restaurant);
          userLists[listIndex].updatedAt = Date.now();
          this.saveUserLists(currentUserId, userLists);
          console.log('Added restaurant to list:', restaurant.name, 'to list:', userLists[listIndex].name);
          return true;
        } else {
          console.log('Restaurant already in list:', restaurant.name);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error adding restaurant to list:', error);
      return false;
    }
  }

  removeRestaurantFromList(listId: string, placeId: string, userId?: string): boolean {
    try {
      const currentUserId = userId || localStorage.getItem('currentUserId');
      if (!currentUserId) return false;
      
      const userLists = this.getUserLists(currentUserId);
      const listIndex = userLists.findIndex(list => list.id === listId);
      
      if (listIndex >= 0) {
        userLists[listIndex].restaurants = userLists[listIndex].restaurants.filter(
          r => r.placeId !== placeId
        );
        userLists[listIndex].updatedAt = Date.now();
        this.saveUserLists(currentUserId, userLists);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing restaurant from list:', error);
      return false;
    }
  }

  getRestaurantLists(placeId: string, userId?: string): UserList[] {
    try {
      const currentUserId = userId || localStorage.getItem('currentUserId');
      if (!currentUserId) return [];
      
      const userLists = this.getUserLists(currentUserId);
      return userLists.filter(list => 
        list.restaurants.some(r => r.placeId === placeId)
      );
    } catch (error) {
      console.error('Error getting restaurant lists:', error);
      return [];
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      const keys = ['restaurants', 'searchHistory', 'curatedLists', 'userReviews', 'userLists'];
      
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          used += new Blob([data]).size;
        }
      });
      
      // Estimate total available (usually 5-10MB for localStorage)
      const total = 5 * 1024 * 1024; // 5MB
      const percentage = (used / total) * 100;
      
      return { used, total, percentage };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}

export default RestaurantStorage;

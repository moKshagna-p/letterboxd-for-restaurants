"use client";

import { useState, useEffect } from "react";
import { Plus, List, X, Edit3, Trash2, Check } from "lucide-react";
import RestaurantStorage, {
  StoredRestaurant,
  UserList,
} from "../utils/restaurantStorage";
import AuthStorage from "../utils/authStorage";

interface AddToListProps {
  restaurant: StoredRestaurant;
  onListUpdate?: () => void;
}

export default function AddToList({
  restaurant,
  onListUpdate,
}: AddToListProps) {
  const [showModal, setShowModal] = useState(false);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newListIcon, setNewListIcon] = useState("📝");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [storage] = useState(() => RestaurantStorage.getInstance());

  const icons = [
    "📝",
    "❤️",
    "⭐",
    "🍽️",
    "☕",
    "🍕",
    "🍔",
    "🍜",
    "🍰",
    "🥘",
    "🌮",
    "🍱",
  ];

  useEffect(() => {
    loadUserLists();
  }, []);

  // Reload lists when modal is opened to ensure we have the latest data
  useEffect(() => {
    if (showModal) {
      loadUserLists();
    }
  }, [showModal]);

  const loadUserLists = () => {
    setLoading(true);
    const lists = storage.getUserLists();
    console.log("Loaded user lists:", lists.length, "lists");
    setUserLists(lists);
    setLoading(false);
  };

  const handleAddToList = (listId: string) => {
    const success = storage.addRestaurantToList(listId, restaurant);
    if (success) {
      const listName = userLists.find((l) => l.id === listId)?.name || "list";
      setSuccessMessage(`Added to ${listName}!`);
      setTimeout(() => setSuccessMessage(""), 2000);
      loadUserLists();
      onListUpdate?.();
    }
  };

  const handleRemoveFromList = (listId: string) => {
    const success = storage.removeRestaurantFromList(
      listId,
      restaurant.placeId
    );
    if (success) {
      loadUserLists();
      onListUpdate?.();
    }
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      const currentUser = AuthStorage.currentUser();
      if (!currentUser) {
        alert("Please log in to create lists");
        return;
      }
      try {
        const newList = storage.createUserList(
          newListName.trim(),
          newListDescription.trim(),
          newListIcon,
          currentUser.id
        );
        console.log("Created new list:", newList.name, "with ID:", newList.id);
        setUserLists([...userLists, newList]);
        setNewListName("");
        setNewListDescription("");
        setNewListIcon("📝");
        setShowCreateForm(false);
      } catch (error) {
        console.error("Error creating list:", error);
      }
    }
  };

  const handleDeleteList = (listId: string) => {
    if (confirm("Are you sure you want to delete this list?")) {
      const success = storage.deleteUserList(listId);
      if (success) {
        loadUserLists();
      }
    }
  };

  const isRestaurantInList = (listId: string) => {
    const list = userLists.find((l) => l.id === listId);
    return (
      list?.restaurants.some((r) => r.placeId === restaurant.placeId) || false
    );
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Add to List
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add to List
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {restaurant.name}
              </p>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Loading lists...
                  </span>
                </div>
              ) : !showCreateForm ? (
                <>
                  <div className="space-y-3">
                    {userLists.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No lists created yet</p>
                        <p className="text-sm">
                          Create your first list to organize restaurants
                        </p>
                      </div>
                    ) : (
                      userLists.map((list) => {
                        const isInList = isRestaurantInList(list.id);
                        return (
                          <div
                            key={list.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{list.icon}</span>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {list.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {list.restaurants.length} restaurants
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isInList ? (
                                <button
                                  onClick={() => handleRemoveFromList(list.id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm"
                                >
                                  <X className="w-3 h-3" />
                                  Remove
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAddToList(list.id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteList(list.id)}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New List
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      List Name
                    </label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="e.g., My Favorites"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      placeholder="e.g., My go-to restaurants"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {icons.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewListIcon(icon)}
                          className={`p-2 text-xl rounded-lg border-2 transition-colors ${
                            newListIcon === icon
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-900"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateList}
                      disabled={!newListName.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      Create List
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Plus, List, X, Edit3, Trash2, Check } from "lucide-react";
import RestaurantStorage, {
  StoredRestaurant,
  UserList,
} from "../utils/restaurantStorage";
import AuthStorage from "../utils/authStorage";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";

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
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm">
            <Plus className="w-4 h-4" />
            Add to List
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add to List</DialogTitle>
            <DialogDescription>{restaurant.name}</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {successMessage && (
              <Alert className="mb-4">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">
                  Loading lists...
                </span>
              </div>
            ) : !showCreateForm ? (
              <>
                <div className="space-y-3">
                  {userLists.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
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
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{list.icon}</span>
                            <div>
                              <h4 className="font-medium">{list.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {list.restaurants.length} restaurants
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isInList ? (
                              <Button
                                onClick={() => handleRemoveFromList(list.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <X className="w-3 h-3" />
                                Remove
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleAddToList(list.id)}
                                variant="default"
                                size="sm"
                              >
                                <Plus className="w-3 h-3" />
                                Add
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDeleteList(list.id)}
                              variant="ghost"
                              size="icon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full mt-4"
                >
                  <Plus className="w-4 h-4" />
                  Create New List
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="list-name">List Name</Label>
                  <Input
                    id="list-name"
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., My Favorites"
                  />
                </div>

                <div>
                  <Label htmlFor="list-desc">Description (Optional)</Label>
                  <Input
                    id="list-desc"
                    type="text"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="e.g., My go-to restaurants"
                  />
                </div>

                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {icons.map((icon) => (
                      <Button
                        key={icon}
                        onClick={() => setNewListIcon(icon)}
                        variant={newListIcon === icon ? "default" : "outline"}
                        size="icon"
                        className="text-xl"
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateList}
                    disabled={!newListName.trim()}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4" />
                    Create List
                  </Button>
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

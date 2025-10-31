"use client";

import { useEffect, useState } from "react";
import RestaurantStorage from "../utils/restaurantStorage";

export default function TestStoragePage() {
  const [storage] = useState(() => RestaurantStorage.getInstance());
  const [lists, setLists] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const userLists = storage.getUserLists();
    setLists(userLists);
    console.log("Current lists in localStorage:", userLists);
  };

  const createTestList = () => {
    try {
      const newList = storage.createUserList(
        "Test List " + Date.now(),
        "This is a test list",
        "🧪"
      );
      setTestResult(`Created list: ${newList.name}`);
      loadLists();
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };

  const clearAllLists = () => {
    if (confirm("Clear all lists?")) {
      localStorage.removeItem("userLists");
      setTestResult("Cleared all lists");
      loadLists();
    }
  };

  const checkLocalStorage = () => {
    const rawData = localStorage.getItem("userLists");
    setTestResult(
      `Raw localStorage data: ${
        rawData ? rawData.substring(0, 100) + "..." : "null"
      }`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          LocalStorage Test Page
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={createTestList}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Test List
              </button>
              <button
                onClick={loadLists}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Reload Lists
              </button>
              <button
                onClick={checkLocalStorage}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Check Raw localStorage
              </button>
              <button
                onClick={clearAllLists}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear All Lists
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
              {testResult || "No test result yet"}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Current Lists ({lists.length})
          </h2>
          {lists.length === 0 ? (
            <p className="text-gray-500">No lists found</p>
          ) : (
            <div className="space-y-3">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="border border-gray-200 dark:border-gray-700 p-3 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{list.icon}</span>
                    <div>
                      <h3 className="font-semibold">{list.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {list.description} • {list.restaurants.length}{" "}
                        restaurants
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(list.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


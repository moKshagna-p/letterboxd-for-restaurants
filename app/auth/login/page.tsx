"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthStorage from "../../utils/authStorage";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && AuthStorage.currentUser()) {
      router.replace("/");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = AuthStorage.login(identifier);
    if (!res.success) {
      setError(res.error || "Unable to login");
      return;
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Log in
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Username or Email
            </label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700"
          >
            Log in
          </button>
        </form>
        <button
          className="w-full mt-4 text-sm text-gray-600 dark:text-gray-300"
          onClick={() => router.push("/auth/signup")}
        >
          Create an account
        </button>
      </div>
    </div>
  );
}



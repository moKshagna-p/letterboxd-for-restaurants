"use client";

export interface UserProfile {
  id: string;
  username: string; // unique handle
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: number;
  followers?: string[]; // userIds
  following?: string[]; // userIds
  incomingRequests?: string[]; // userIds requesting to follow
  outgoingRequests?: string[]; // userIds we've requested
  diary?: VisitLog[];
}

export interface VisitLog {
  id: string;
  placeId: string;
  name: string;
  photoUrl?: string | null;
  date: number;
  rating?: number;
}

export default class AuthStorage {
  static getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem("users");
      return data ? (JSON.parse(data) as UserProfile[]) : [];
    } catch {
      return [];
    }
  }

  static saveUsers(users: UserProfile[]) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  static createUser(partial: Omit<UserProfile, "id" | "createdAt">): {
    success: boolean;
    error?: string;
    user?: UserProfile;
  } {
    const users = this.getUsers();
    if (users.some((u) => u.username.toLowerCase() === partial.username.toLowerCase())) {
      return { success: false, error: "Username already taken" };
    }
    if (users.some((u) => u.email.toLowerCase() === partial.email.toLowerCase())) {
      return { success: false, error: "Email already registered" };
    }
    const user: UserProfile = {
      ...partial,
      id: `user-${Date.now()}`,
      createdAt: Date.now(),
      followers: [],
      following: [],
      incomingRequests: [],
      outgoingRequests: [],
      diary: [],
    };
    users.push(user);
    this.saveUsers(users);
    localStorage.setItem("currentUserId", user.id);
    return { success: true, user };
  }

  static login(identifier: string): { success: boolean; error?: string; user?: UserProfile } {
    const users = this.getUsers();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === identifier.toLowerCase() ||
        u.email.toLowerCase() === identifier.toLowerCase()
    );
    if (!user) return { success: false, error: "User not found" };
    localStorage.setItem("currentUserId", user.id);
    return { success: true, user };
  }

  static currentUser(): UserProfile | null {
    const id = localStorage.getItem("currentUserId");
    if (!id) return null;
    return this.getUsers().find((u) => u.id === id) || null;
  }

  static logout() {
    localStorage.removeItem("currentUserId");
  }

  static searchProfiles(query: string): UserProfile[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.getUsers().filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        (u.bio || "").toLowerCase().includes(q)
    );
  }

  // Follow requests
  static sendFollowRequest(toUserId: string): { success: boolean; error?: string } {
    const current = this.currentUser();
    if (!current) return { success: false, error: "Not logged in" };
    if (current.id === toUserId) return { success: false, error: "Cannot follow yourself" };
    const users = this.getUsers();
    const to = users.find((u) => u.id === toUserId);
    const from = users.find((u) => u.id === current.id);
    if (!to || !from) return { success: false, error: "User not found" };
    to.incomingRequests = Array.from(new Set([...(to.incomingRequests || []), from.id]));
    from.outgoingRequests = Array.from(new Set([...(from.outgoingRequests || []), to.id]));
    this.saveUsers(users);
    return { success: true };
  }

  static acceptFollowRequest(fromUserId: string): { success: boolean; error?: string } {
    const current = this.currentUser();
    if (!current) return { success: false, error: "Not logged in" };
    const users = this.getUsers();
    const me = users.find((u) => u.id === current.id)!;
    const from = users.find((u) => u.id === fromUserId);
    if (!from) return { success: false, error: "Requesting user not found" };
    me.incomingRequests = (me.incomingRequests || []).filter((id) => id !== from.id);
    from.outgoingRequests = (from.outgoingRequests || []).filter((id) => id !== me.id);
    me.followers = Array.from(new Set([...(me.followers || []), from.id]));
    from.following = Array.from(new Set([...(from.following || []), me.id]));
    this.saveUsers(users);
    return { success: true };
  }

  // Visit diary
  static logVisit(entry: Omit<VisitLog, "id" | "date"> & { date?: number }): { success: boolean; error?: string } {
    const current = this.currentUser();
    if (!current) return { success: false, error: "Not logged in" };
    const users = this.getUsers();
    const me = users.find((u) => u.id === current.id)!;
    const log: VisitLog = {
      id: `log-${Date.now()}`,
      date: entry.date || Date.now(),
      placeId: entry.placeId,
      name: entry.name,
      photoUrl: entry.photoUrl,
      rating: entry.rating,
    };
    me.diary = [log, ...(me.diary || [])];
    this.saveUsers(users);
    return { success: true };
  }

  static getDiary(userId?: string): VisitLog[] {
    const id = userId || localStorage.getItem("currentUserId");
    if (!id) return [];
    const users = this.getUsers();
    return users.find((u) => u.id === id)?.diary || [];
  }

  static getByUsername(username: string): UserProfile | null {
    return this.getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  }
}



"use client";

import { create } from "zustand";
import type { Tables } from "@/types/database";

type Profile = Tables<"profiles">;
type DietaryProfile = Tables<"dietary_profiles">;
type Subscription = Tables<"subscriptions">;

type ProfileStore = {
  profile: Profile | null;
  dietary: DietaryProfile | null;
  subscription: Subscription | null;
  setProfile: (profile: Profile | null) => void;
  setDietary: (dietary: DietaryProfile | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  reset: () => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  dietary: null,
  subscription: null,
  setProfile: (profile) => set({ profile }),
  setDietary: (dietary) => set({ dietary }),
  setSubscription: (subscription) => set({ subscription }),
  reset: () => set({ profile: null, dietary: null, subscription: null }),
}));

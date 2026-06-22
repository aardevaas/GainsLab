import { UtensilsCrossed } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nutrition" };

export default function NutritionPage() {
  return (
    <ComingSoon
      title="Nutrition"
      description="Log meals, search 1M+ foods, and track your daily intake against your macro targets."
      icon={UtensilsCrossed}
    />
  );
}

import { ChefHat } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recipes" };

export default function RecipesPage() {
  return (
    <ComingSoon
      title="Recipes"
      description="Discover high-protein meals, build your own recipes with auto macro calculation, and plan your week."
      icon={ChefHat}
    />
  );
}

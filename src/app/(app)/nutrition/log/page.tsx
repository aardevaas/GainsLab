import { UtensilsCrossed } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Log Food" };

export default function LogFoodPage() {
  return (
    <ComingSoon
      title="Log Food"
      description="Search millions of foods and log your meals with one tap."
      icon={UtensilsCrossed}
    />
  );
}

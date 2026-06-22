import { Dumbbell } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Workouts" };

export default function WorkoutsPage() {
  return (
    <ComingSoon
      title="Workouts"
      description="Build custom workout plans, log sets and reps, and track progressive overload."
      icon={Dumbbell}
    />
  );
}

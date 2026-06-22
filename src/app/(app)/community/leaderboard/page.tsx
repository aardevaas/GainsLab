import { Trophy } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return (
    <ComingSoon
      title="Leaderboard"
      description="Monthly competitions with real prizes. Top performers earn GainsLab Pro subscriptions and partner gear."
      icon={Trophy}
    />
  );
}

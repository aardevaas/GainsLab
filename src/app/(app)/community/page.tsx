import { Users } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <ComingSoon
      title="Community"
      description="Connect with athletes, join monthly challenges, share progress, and compete on leaderboards."
      icon={Users}
    />
  );
}

import { TrendingUp } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Progress Tracker" };

export default function TrackerPage() {
  return (
    <ComingSoon
      title="Progress Tracker"
      description="Log body weight, measurements, and progress photos. See your body composition change over time."
      icon={TrendingUp}
    />
  );
}

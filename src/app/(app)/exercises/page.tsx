import { Zap } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Exercise Library" };

export default function ExercisesPage() {
  return (
    <ComingSoon
      title="Exercise Library"
      description="Browse 800+ exercises with instructions, muscle diagrams, and video demos."
      icon={Zap}
    />
  );
}

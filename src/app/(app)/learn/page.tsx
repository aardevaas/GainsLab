import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Education Hub" };

export default function LearnPage() {
  return (
    <ComingSoon
      title="Education Hub"
      description="Science-backed guides on training, nutrition, recovery, and body composition — all cited."
      icon={BookOpen}
    />
  );
}

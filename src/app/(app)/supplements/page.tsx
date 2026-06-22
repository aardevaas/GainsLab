import { FlaskConical } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Supplement Advisor" };

export default function SupplementsPage() {
  return (
    <ComingSoon
      title="Supplement Advisor"
      description="Evidence-ranked supplement recommendations based on your goals, budget, and what actually works."
      icon={FlaskConical}
    />
  );
}

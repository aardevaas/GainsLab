import { Moon } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sleep Log" };

export default function SleepLogPage() {
  return (
    <ComingSoon
      title="Sleep Log"
      description="Track sleep duration and quality to understand how recovery affects your performance."
      icon={Moon}
    />
  );
}

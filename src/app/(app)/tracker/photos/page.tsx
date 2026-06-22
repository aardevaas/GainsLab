import { Camera } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Progress Photos" };

export default function ProgressPhotosPage() {
  return (
    <ComingSoon
      title="Progress Photos"
      description="Upload progress photos and compare your transformation side by side over time."
      icon={Camera}
    />
  );
}

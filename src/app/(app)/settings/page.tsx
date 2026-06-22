import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Manage account, notifications, privacy, subscription, and connected apps."
      icon={Settings}
    />
  );
}

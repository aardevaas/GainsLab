import { User } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <ComingSoon
      title="Profile"
      description="Manage your personal stats, profile photo, goals, and public athlete card."
      icon={User}
    />
  );
}

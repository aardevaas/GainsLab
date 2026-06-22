"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  TrendingUp,
  Zap,
  ChefHat,
  ShoppingCart,
  Users,
  BookOpen,
  FlaskConical,
  User,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV: NavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Track",
    items: [
      { label: "Nutrition", href: "/nutrition", icon: UtensilsCrossed },
      { label: "Workouts", href: "/workouts", icon: Dumbbell },
      { label: "Tracker", href: "/tracker", icon: TrendingUp },
    ],
  },
  {
    label: "Explore",
    items: [
      { label: "Exercises", href: "/exercises", icon: Zap },
      { label: "Recipes", href: "/recipes", icon: ChefHat },
      { label: "Grocery", href: "/grocery", icon: ShoppingCart },
    ],
  },
  {
    label: "Compete",
    items: [{ label: "Community", href: "/community", icon: Users }],
  },
  {
    label: "Learn",
    items: [
      { label: "Education", href: "/learn", icon: BookOpen },
      { label: "Supplements", href: "/supplements", icon: FlaskConical },
    ],
  },
];

type SidebarProps = {
  userEmail: string;
  profileName: string | null;
  avatarUrl: string | null;
  onboardingComplete: boolean;
};

export function Sidebar({
  userEmail,
  profileName,
  avatarUrl,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const displayName = profileName ?? userEmail.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col border-r z-40"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--color-bg-secondary)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 h-16 border-b shrink-0"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <div
          className="size-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          G
        </div>
        <span className="font-bold text-base" style={{ color: "var(--color-text)" }}>
          Gains<span style={{ color: "var(--color-accent)" }}>Lab</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV.map((section) => (
          <div key={section.label}>
            <p
              className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                        active
                          ? "text-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
                      )}
                    >
                      <Icon
                        size={15}
                        className={active ? "text-[var(--color-accent)]" : ""}
                      />
                      {item.label}
                      {active && (
                        <span
                          className="ml-auto size-1.5 rounded-full"
                          style={{ background: "var(--color-accent)" }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div
        className="shrink-0 border-t px-3 py-3 space-y-0.5"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150",
            pathname.startsWith("/profile")
              ? "text-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
          )}
        >
          <User size={15} />
          Profile
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150",
            pathname.startsWith("/settings")
              ? "text-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
          )}
        >
          <Settings size={15} />
          Settings
        </Link>

        {/* User card */}
        <div
          className="flex items-center gap-2.5 px-2 py-2.5 mt-2 rounded-lg border"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="size-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: "var(--color-text)" }}
            >
              {displayName}
            </p>
            <p
              className="text-[10px] truncate"
              style={{ color: "var(--color-text-muted)" }}
            >
              {userEmail}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="shrink-0 p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={13} style={{ color: "var(--color-text-muted)" }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

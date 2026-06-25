import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageTransition } from "@/components/layout/PageTransition";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileRes, subRes, creatorRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase
      .from("subscriptions")
      .select("status, expires_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("creator_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;

  // Gate: send new users to /profile before they can access any app route.
  // We read the path from the header set by middleware so the layout can
  // redirect without needing the request object directly.
  const headerList = await headers();
  const currentPath = headerList.get('x-invoke-path') ?? '';
  if (!profile?.onboarding_completed && !currentPath.startsWith('/profile')) {
    redirect('/profile');
  }

  const sub = subRes.data;
  const isPro =
    sub?.status === "active" &&
    !!sub.expires_at &&
    new Date(sub.expires_at) > new Date();
  const isCreator = !!creatorRes.data;

  return (
    <div className="flex min-h-dvh" style={{ background: "var(--color-bg)" }}>
      <Sidebar
        userId={user.id}
        userEmail={user.email ?? ""}
        profileName={profile?.name ?? null}
        avatarUrl={profile?.avatar_url ?? null}
        onboardingComplete={profile?.onboarding_completed ?? false}
        isPro={isPro}
        isCreator={isCreator}
      />
      <div className="flex-1 flex flex-col pt-14 lg:pt-0 lg:ml-[var(--sidebar-width)]">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}

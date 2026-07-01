import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Space_Grotesk, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { routing } from "@/i18n/routing";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gainslab.app';

const OG_LOCALES: Record<string, string> = { es: "es_BO", en: "en_US" };

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090D15" },
    { media: "(prefers-color-scheme: light)", color: "#FF8000" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(APP_URL),
    applicationName: "GainsLab",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "GainsLab",
    },
    formatDetection: {
      telephone: false,
    },
    title: {
      default: "GainsLab — The Platform for Fitness Creators",
      template: "%s | GainsLab",
    },
    description:
      "Where fitness coaches, nutritionists, and trainers build their community, sell programs, and track results. Join as a Founding Creator.",
    keywords: [
      "fitness creator platform",
      "fitness coach community",
      "sell workout programs",
      "nutrition tracker",
      "macros calculator",
      "workout builder",
      "body composition tracker",
    ],
    openGraph: {
      siteName: "GainsLab",
      title: "GainsLab — The Platform for Fitness Creators",
      description:
        "Where fitness coaches, nutritionists, and trainers build their community, sell programs, and track results.",
      url: APP_URL,
      type: "website",
      locale: OG_LOCALES[locale] ?? "es_BO",
    },
    twitter: {
      card: "summary_large_image",
      title: "GainsLab — The Platform for Fitness Creators",
      description: "Where fitness coaches build communities, sell programs, and grow their income.",
      site: "@gainslab",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for this locale's subtree.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${jakartaSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col">
        <NextIntlClientProvider>
          <PostHogProvider>
            <ToastProvider>{children}</ToastProvider>
          </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

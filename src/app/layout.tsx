import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gainslab.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "GainsLab — Your Complete Fitness Platform",
    template: "%s | GainsLab",
  },
  description:
    "The bridge between gym, nutrition, science, and results. Track macros, build workouts, analyze your body, and compete with the world.",
  keywords: [
    "macros calculator",
    "fitness tracker",
    "workout builder",
    "nutrition database",
    "calorie counter",
    "body composition",
    "gym progress",
  ],
  openGraph: {
    siteName: "GainsLab",
    title: "GainsLab — Your Complete Fitness Platform",
    description:
      "The bridge between gym, nutrition, science, and results. Track macros, build workouts, analyze your body, and compete with the world.",
    url: APP_URL,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GainsLab — Your Complete Fitness Platform",
    description: "The bridge between gym, nutrition, science, and results.",
    site: "@gainslab",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

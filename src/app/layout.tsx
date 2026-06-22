import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
    title: "GainsLab — Your Complete Fitness Platform",
    description:
      "The bridge between gym, nutrition, science, and results.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GainsLab",
    description: "The bridge between gym, nutrition, science, and results.",
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
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}

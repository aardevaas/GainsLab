import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GainsLab — Fitness Creator Platform",
    short_name: "GainsLab",
    description:
      "Where fitness coaches, nutritionists, and trainers build their community, sell programs, and track results.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#090D15",
    theme_color: "#FF8000",
    categories: ["health", "fitness", "lifestyle"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Dashboard",
        url: "/dashboard",
        description: "Go to your fitness dashboard",
      },
      {
        name: "Log Food",
        url: "/nutrition",
        description: "Log today's nutrition",
      },
    ],
  };
}

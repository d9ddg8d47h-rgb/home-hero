import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // youtube.com/shorts/VIDEOID
    if (u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/shorts/")[1]?.split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // youtu.be/VIDEOID
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // youtube.com/watch?v=VIDEOID
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      // youtube.com/embed/VIDEOID already
      if (u.pathname.startsWith("/embed/")) return url;
    }
    return null;
  } catch {
    return null;
  }
}

export function generatePassword(): string {
  const adjectives = ["Sunny", "Brave", "Happy", "Swift", "Bright", "Bold", "Calm", "Kind"];
  const nouns = ["Tiger", "River", "Comet", "Falcon", "Maple", "Otter", "Rocket", "Star"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}${noun}${num}!`;
}

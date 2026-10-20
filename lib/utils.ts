import { interviewCovers, mappings } from "@/constants";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech?: string) => {
  if (!tech || typeof tech !== "string") return undefined;
  const key = tech.trim().toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray?: string[]) => {
  if (!techArray || !Array.isArray(techArray) || techArray.length === 0) {
    return [];
  }

  const logoURLs = techArray
    .filter((tech) => Boolean(tech && typeof tech === "string"))
    .map((tech) => {
      const trimmed = tech.trim();
      const normalized = normalizeTechName(trimmed);
      return {
        tech: trimmed,
        url: normalized
          ? `${techIconBaseURL}/${normalized}/${normalized}-original.svg`
          : "/tech.svg",
      };
    });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => {
      if (url === "/tech.svg") return { tech, url };
      const exists = await checkIconExists(url);
      return {
        tech,
        url: exists ? url : "/tech.svg",
      };
    }),
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

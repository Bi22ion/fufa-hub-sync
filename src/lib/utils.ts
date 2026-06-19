import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind CSS classes.
 * Keeps your UI consistent and modular.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Universal parser for video embed URLs.
 * Converts various video link formats into valid embed URLs 
 * so that they can be displayed correctly inside an iframe.
 */
export const getUniversalEmbedUrl = (url: string) => {
  if (!url) return "";

  // 1. YouTube Handler
  // Regex extracts the 11-character video ID from common YouTube URL formats
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const ytMatch = url.match(ytRegex);
  
  // If a valid ID is found, return the standard embed URL
  if (ytMatch && ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch}`;
  }

  // 2. TikTok Handler
  if (url.includes("tiktok.com")) {
    return url;
  }

  // 3. Fallback: returns the original link if no specific handler matches
  return url; 
};

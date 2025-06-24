import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Universal userId para navegador (cotizador y ecommerce)
export function getOrCreateBrowserUserId(): string {
  const KEY = "browser_user_id";
  let userId = localStorage.getItem(KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(KEY, userId);
  }
  return userId;
}

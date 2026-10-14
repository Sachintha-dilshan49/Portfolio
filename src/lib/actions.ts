import { profile } from "@/content/profile";

/** Browser-only helpers shared by the shell, the command palette and the theme toggle. */

export type Theme = "dark" | "light";

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

export function toggleTheme() {
  setTheme(currentTheme() === "light" ? "dark" : "light");
}

/** Saves the public CV under its friendly file name. */
export function downloadCv() {
  const a = document.createElement("a");
  a.href = profile.cvPath;
  a.download = profile.cvFileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Resolves to false when the clipboard is unavailable (insecure context, denied permission). */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

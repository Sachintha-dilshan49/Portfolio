/** Site pages — drives the nav and the ⌘K command palette. */
export const pages = [
  { href: "/", label: "~/", title: "Home" },
  { href: "/projects", label: "./projects", title: "Projects" },
  { href: "/achievements", label: "./achievements", title: "Achievements" },
  { href: "/about", label: "./about", title: "About" },
  { href: "/contact", label: "./contact", title: "Contact" },
];

/** Labels for the ⌘K command palette. */
export const palette = {
  trigger: "Command palette (⌘K / Ctrl+K)",
  label: "Command palette",
  close: "Close command palette",
  footer: "↑↓ move · ↵ open · esc close",
  results: "results",
  placeholder: "Search pages, projects, actions…",
  empty: "No matches. Try a project name, “cv” or “theme”.",
  groups: { pages: "Pages", projects: "Projects", actions: "Actions" },
  actions: {
    copyEmail: { title: "Copy email", keywords: "mail contact address clipboard" },
    downloadCv: { title: "Download CV", keywords: "resume pdf curriculum vitae" },
    toggleTheme: { title: "Toggle theme", keywords: "dark light mode colour color" },
    github: { title: "Open GitHub", keywords: "code repos source" },
    linkedin: { title: "Open LinkedIn", keywords: "profile social" },
  },
  toasts: {
    copied: "Email copied to clipboard",
    copyFailed: "Couldn’t copy — the email is",
    downloading: "Downloading CV…",
  },
};

/** Labels for the achievement photo lightbox. */
export const lightbox = {
  open: "open larger view",
  close: "close",
  previous: "Previous photo",
  next: "Next photo",
  counter: (i: number, n: number) => `photo ${i} of ${n}`,
};

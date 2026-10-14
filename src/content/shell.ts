/**
 * Text for the interactive shell on the home page (components/shell.tsx).
 * The data it prints (profile, projects, wins, skills) comes from the other
 * content files; this file only holds the shell's own words.
 */
export const shell = {
  user: "guest@sachintha",
  title: "guest@sachintha: ~ — interactive",
  heading: "Interactive shell",
  launcher: "./shell --interactive",
  intro: "Try a command — tap one below or type it.",
  outputLabel: "Shell output",
  inputLabel: "Type a command, then press Enter",
  placeholder: "type help",
  chipsLabel: "Commands",
  noscript: "This shell needs JavaScript. Everything it prints is also on the Projects, About and Contact pages.",
  /** Shown as chips, in `help`, and used for Tab completion. */
  commands: [
    { name: "whoami", description: "who I am, in a few lines" },
    { name: "projects", description: "every project, linked to its case study" },
    { name: "wins", description: "hackathons and competitions" },
    { name: "stack", description: "languages and tools I use" },
    { name: "contact", description: "email, GitHub, LinkedIn" },
    { name: "cv", description: "download my CV (PDF)" },
    { name: "help", description: "this list" },
    { name: "clear", description: "clear the screen" },
  ],
  /** neofetch keys (content/profile.ts) that `whoami` prints. */
  whoamiKeys: ["Role", "Uni", "Focus", "Status"],
  helpFooter: "Tab completes · ↑/↓ history · Ctrl+K / ⌘K opens the command palette",
  projectsHint: "open a name to read its case study",
  contactPage: "or write to me on the contact page",
  cvDownloading: "downloading",
  cvFallback: "nothing happened? download it here",
  /** `ls` and `ls -a`. */
  files: ["projects/", "wins.txt", "stack.txt", "cv.pdf", "contact.sh"],
  hiddenFiles: [".", "..", ".secret"],
  secret: "You found the secret file 🎉 Thanks for poking around — curious people are my favourite kind. Say hi:",
  sudoHire: {
    prompt: "[sudo] password for recruiter: ********",
    granted: "permission granted ✓",
    next: "next step",
  },
  sudoOther: "guest is not in the sudoers file. This incident will be reported. (try: sudo hire sachintha)",
  rmRf: "nice try 🙂",
  exit: "there’s no escape — but here’s my email",
  notFound: (cmd: string) => `command not found: ${cmd} — try help`,
  cleared: "screen cleared",
};

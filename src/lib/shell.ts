import { neofetch, profile, skills } from "@/content/profile";
import type { ProjectLink } from "@/content/projects";
import { shell } from "@/content/shell";
import { wins } from "@/content/timeline";

/**
 * The interactive shell's interpreter: input text in, lines of output out.
 * Pure — side effects (clearing, downloading) are returned for the component
 * to carry out. Every word printed comes from src/content/.
 */

export type Tone = "accent" | "muted" | "gold" | "ok" | "danger";

export type Segment =
  | { text: string; tone?: Tone }
  | { text: string; href: string; kind: "internal" | "external" | "mailto" | "download"; tone?: Tone };

export type Line = Segment[];

export type ShellResult = { lines: Line[]; effect?: "clear" | "download-cv" };

export const commandNames = shell.commands.map((c) => c.name);

const t = (text: string, tone?: Tone): Segment => ({ text, tone });

const emailLine = (): Line => [{ text: profile.email, href: `mailto:${profile.email}`, kind: "mailto" }];

const commands: Record<string, (projects: ProjectLink[]) => ShellResult> = {
  whoami: () => ({
    lines: [
      [t(profile.name, "accent"), t(` — ${profile.role}`)],
      [t(profile.summary)],
      ...neofetch
        .filter((l) => shell.whoamiKeys.includes(l.key))
        .map((l): Line => [t(`${l.key.toLowerCase()}: `, "muted"), t(l.value, l.tone)]),
    ],
  }),

  projects: (projects) => ({
    lines: [
      ...projects.map((p): Line => [
        t("→ ", "muted"),
        { text: p.name, href: `/projects/${p.slug}`, kind: "internal", tone: "accent" },
        t(` · ${p.team === "solo" ? "solo" : "team"} · ${p.stack.slice(0, 3).join(", ")}`, "muted"),
      ]),
      [t(`# ${shell.projectsHint}`, "muted")],
    ],
  }),

  wins: () => ({
    lines: wins.map((w): Line => [t(w.place, "gold"), t(` — ${w.event}`), t(` · ${w.where}`, "muted")]),
  }),

  stack: () => ({
    lines: skills.map((s): Line => [t(`${s.group}: `, "accent"), t(s.items)]),
  }),

  contact: () => ({
    lines: [
      [t("email    ", "muted"), ...emailLine()],
      [t("github   ", "muted"), { text: profile.github.replace("https://", ""), href: profile.github, kind: "external" }],
      [t("linkedin ", "muted"), { text: profile.linkedin.replace("https://www.", ""), href: profile.linkedin, kind: "external" }],
      [t("# ", "muted"), { text: shell.contactPage, href: "/contact", kind: "internal" }],
    ],
  }),

  cv: () => ({
    effect: "download-cv",
    lines: [
      [t(`${shell.cvDownloading} `, "muted"), t(profile.cvFileName, "accent"), t(" …", "muted")],
      [t("# ", "muted"), { text: shell.cvFallback, href: profile.cvPath, kind: "download" }],
    ],
  }),

  help: () => ({
    lines: [
      ...shell.commands.map((c): Line => [t(c.name.padEnd(10), "accent"), t(c.description)]),
      [t(shell.helpFooter, "muted")],
    ],
  }),

  clear: () => ({ lines: [], effect: "clear" }),

  ls: () => ({ lines: [[t(shell.files.join("  "))]] }),

  exit: () => ({ lines: [[t(shell.exit)], emailLine()] }),
};

/** Normalise for matching: trim, collapse spaces, lower-case (phones like to capitalise). */
const normalise = (input: string) => input.trim().replace(/\s+/g, " ").toLowerCase();

export function runCommand(input: string, projects: ProjectLink[]): ShellResult {
  const cmd = normalise(input);
  if (!cmd) return { lines: [] };

  // Easter eggs first.
  if (cmd === "sudo hire sachintha") {
    return {
      lines: [
        [t(shell.sudoHire.prompt, "muted")],
        [t(shell.sudoHire.granted, "ok")],
        [t(`${shell.sudoHire.next}: `, "muted"), { text: "/contact", href: "/contact", kind: "internal", tone: "accent" }],
      ],
    };
  }
  if (/^(sudo )?rm -(rf|fr|r -f|f -r) \/\*?$/.test(cmd)) return { lines: [[t(shell.rmRf)]] };
  if (cmd.startsWith("sudo")) return { lines: [[t(shell.sudoOther, "danger")]] };
  if (/^ls -(a|la|al|all)$/.test(cmd)) {
    return {
      lines: [
        [...shell.hiddenFiles.map((f) => t(`${f}  `, f === ".secret" ? "gold" : undefined)), t(shell.files.join("  "))],
        [t("# .secret: ", "muted"), t(shell.secret)],
        emailLine(),
      ],
    };
  }
  if (cmd === "cat .secret") return { lines: [[t(shell.secret)], emailLine()] };

  const handler = Object.hasOwn(commands, cmd) ? commands[cmd] : undefined;
  if (handler) return handler(projects);

  const name = input.trim().split(/\s+/)[0];
  return { lines: [[t(shell.notFound(name), "danger")]] };
}

/** Tab completion over the documented commands. */
export function complete(input: string): { value: string; options: string[] } {
  const prefix = input.trimStart().toLowerCase();
  if (!prefix || prefix.includes(" ")) return { value: input, options: [] };
  const options = commandNames.filter((c) => c.startsWith(prefix));
  if (options.length === 1) return { value: `${options[0]} `, options: [] };
  // Several matches: extend to their common prefix and list them.
  let common = options[0] ?? prefix;
  for (const o of options) while (!o.startsWith(common)) common = common.slice(0, -1);
  return { value: common.length > prefix.length ? common : input, options };
}

export function plainText(lines: Line[]) {
  return lines.map((l) => l.map((s) => s.text).join("")).join("\n");
}

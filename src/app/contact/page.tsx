import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Prompt, TerminalWindow } from "@/components/terminal";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${profile.name}.`,
};

const links: { label: string; value: string; href: string; download?: string }[] = [
  { label: "email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "github", value: "Sachintha-dilshan49", href: profile.github },
  { label: "linkedin", value: "sachintha-dilshan", href: profile.linkedin },
  { label: "cv", value: "cv.pdf ↓", href: profile.cvPath, download: profile.cvFileName },
];

export default function ContactPage() {
  return (
    <section className="flex flex-wrap gap-10 pb-16 pt-8">
      <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-5">
        <Prompt>./contact.sh</Prompt>
        <h1 className="m-0 font-sans text-[clamp(2.25rem,10vw,3rem)] font-bold leading-none tracking-tight">Open a connection.</h1>
        <p className="m-0 text-[15px] leading-relaxed text-soft">
          Looking for a software engineering internship from {profile.availability}, in Sri Lanka or remote. I reply
          within a day.
        </p>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0 pt-2 text-sm">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} download={l.download} className="flex gap-3 rounded-lg border border-line bg-surface px-4 py-3.5 no-underline transition-colors hover:border-accent">
                <span className="w-[72px] shrink-0 text-muted">{l.label}</span>
                <span className="min-w-0 text-accent [overflow-wrap:anywhere]">{l.value}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0 flex-[1_1_440px]">
        <TerminalWindow title="POST /api/contact">
          <ContactForm />
        </TerminalWindow>
      </div>
    </section>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { profile } from "@/content/profile";

// 16px text so iOS doesn't zoom into the field on focus.
const field =
  "w-full rounded-lg border border-border bg-bg px-3.5 py-3 text-base text-text placeholder:text-muted focus:border-accent focus:outline-none";
const label = "flex flex-col gap-1.5 text-sm text-soft";

/**
 * Phase 1: opens the visitor's mail app with the message filled in.
 * Phase 3: POST to /api/contact (Resend) instead — see docs/PLAN.md.
 */
export function ContactForm() {
  const [sent, setSent] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setSent(name.split(" ")[0] || "there");
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-2.5 p-7 text-sm leading-relaxed">
        <div className="text-ok">HTTP/1.1 200 OK</div>
        <div className="text-muted">{'{ "status": "handed to your mail app" }'}</div>
        <p className="m-0 pt-2">Thanks, {sent}. Hit send in your mail app and I&apos;ll reply within a day.</p>
        <button type="button" onClick={() => setSent(null)} className="mt-2 min-h-11 self-start rounded-md border border-border px-3.5 text-[13px] text-accent">
          send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
      <label className={label}>
        --name
        <input name="name" required autoComplete="name" placeholder="Jane from Acme" className={field} />
      </label>
      <label className={label}>
        --email
        <input name="email" type="email" required autoComplete="email" placeholder="jane@acme.com" className={field} />
      </label>
      <label className={label}>
        --message
        <textarea name="message" required rows={5} placeholder="We have an internship opening…" className={`${field} resize-y`} />
      </label>
      <button type="submit" className="min-h-14 w-full rounded-lg bg-accent px-4 text-base font-semibold text-accent-fg">
        $ send --now
      </button>
    </form>
  );
}

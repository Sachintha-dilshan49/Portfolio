import type { ReactNode } from "react";

export function TerminalWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border bg-chrome px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff6b5b]" />
        <span className="size-3 rounded-full bg-[#f5c26b]" />
        <span className="size-3 rounded-full bg-[#3ddc97]" />
        <span className="flex-1 text-center text-[13px] text-muted">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function Prompt({ children, user = "guest@sachintha" }: { children: ReactNode; user?: string }) {
  return (
    <div className="text-[15px]">
      <span className="text-accent">{user}</span>
      <span className="text-muted">:~$</span> {children}
    </div>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="m-0 text-xl font-semibold text-accent">## {children}</h2>;
}

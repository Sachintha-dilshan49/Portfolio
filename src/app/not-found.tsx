import Link from "next/link";
import { Prompt, TerminalWindow } from "@/components/terminal";

export default function NotFound() {
  return (
    <section className="py-16">
      <TerminalWindow title="zsh">
        <div className="flex flex-col gap-3 p-5 text-[15px] sm:p-7">
          <Prompt>cd ./this-page</Prompt>
          <div className="text-danger">zsh: no such file or directory (404)</div>
          <div className="flex flex-wrap items-center gap-x-3 pt-2">
            <Link href="/" className="inline-flex min-h-11 min-w-11 items-center justify-center">
              cd ~
            </Link>
            <span className="text-muted">or</span>
            <Link href="/projects" className="inline-flex min-h-11 items-center">
              ls ./projects
            </Link>
          </div>
        </div>
      </TerminalWindow>
    </section>
  );
}

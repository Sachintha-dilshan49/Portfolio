import Link from "next/link";
import { Prompt, TerminalWindow } from "@/components/terminal";

export default function NotFound() {
  return (
    <section className="py-16">
      <TerminalWindow title="zsh">
        <div className="flex flex-col gap-3 p-7 text-[15px]">
          <Prompt>cd ./this-page</Prompt>
          <div className="text-danger">zsh: no such file or directory (404)</div>
          <div className="pt-2">
            <Link href="/">cd ~</Link> <span className="text-muted">or</span> <Link href="/projects">ls ./projects</Link>
          </div>
        </div>
      </TerminalWindow>
    </section>
  );
}

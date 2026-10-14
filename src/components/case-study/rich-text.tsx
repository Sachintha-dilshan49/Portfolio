import { isTodo, type Text } from "@/content/case-study";

/** A missing fact, shown on purpose so it gets filled in rather than guessed. */
export function TodoMark({ children }: { children: string }) {
  return (
    <span className="rounded border border-dashed border-gold px-1.5 py-0.5 font-mono text-[0.85em] text-gold">
      [TODO: {children}]
    </span>
  );
}

export function RichText({ value }: { value: Text }) {
  return isTodo(value) ? <TodoMark>{value.todo}</TodoMark> : <>{value}</>;
}

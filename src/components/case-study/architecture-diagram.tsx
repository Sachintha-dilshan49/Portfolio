import type { CSSProperties } from "react";
import type { Diagram, DiagramTone } from "@/content/case-study";

const STACK_OFFSET = 6;
const LINE_HEIGHT = 15;

const stroke: Record<DiagramTone, string> = {
  accent: "stroke-accent",
  info: "stroke-info",
  plain: "stroke-border",
};

const titleFill: Record<DiagramTone, string> = {
  accent: "fill-accent",
  info: "fill-info",
  plain: "fill-text",
};

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Boxes-and-arrows diagram drawn from data. All colours are theme tokens, so it
 * follows dark/light. Items carry `.reveal-item` so a wrapping <Reveal> can fade
 * them in one after another.
 */
export function ArchitectureDiagram({ id, diagram }: { id: string; diagram: Diagram }) {
  const { width, height, nodes, edges } = diagram;
  const arrow = `${id}-arrow`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={`${id}-title ${id}-desc`}
      className="block h-auto w-full min-w-[640px] font-mono"
    >
      <title id={`${id}-title`}>{diagram.title}</title>
      <desc id={`${id}-desc`}>{diagram.description}</desc>
      <defs>
        <marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted" />
        </marker>
      </defs>

      {nodes.map((n, i) => {
        const tone = n.tone ?? "plain";
        const stack = n.stack ?? 0;
        return (
          <g key={n.id} className="reveal-item" style={delay(i)}>
            {Array.from({ length: stack }, (_, k) => stack - k).map((k) => (
              <rect
                key={k}
                x={n.x + k * STACK_OFFSET}
                y={n.y + k * STACK_OFFSET}
                width={n.w}
                height={n.h}
                rx={10}
                className={`fill-bg ${stroke[tone]}`}
                strokeOpacity={0.45}
              />
            ))}
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10} className={`fill-bg ${stroke[tone]}`} strokeWidth={1.5} />
            <text x={n.x + 14} y={n.y + 26} fontSize={13} fontWeight={600} className={titleFill[tone]}>
              {n.title}
            </text>
            {n.lines?.map((line, j) => (
              <text key={line} x={n.x + 14} y={n.y + 48 + j * 18} fontSize={11.5} className="fill-soft">
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {edges.map((e, i) => {
        const d = e.points.map(([x, y], j) => `${j ? "L" : "M"}${x},${y}`).join(" ");
        const [lx, ly] = e.labelAt ?? e.points[0];
        return (
          <g key={d} className="reveal-item" style={delay(nodes.length + i)}>
            <path d={d} pathLength={1} fill="none" strokeWidth={1.5} markerEnd={`url(#${arrow})`} className="reveal-draw stroke-muted" />
            {e.label && (
              <text x={lx} y={ly} fontSize={11} textAnchor={e.labelAnchor ?? "start"} className="fill-muted">
                {e.label.map((line, j) => (
                  <tspan key={line} x={lx} dy={j ? LINE_HEIGHT : 0}>
                    {line}
                  </tspan>
                ))}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

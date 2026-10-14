import type { CSSProperties, ReactNode } from "react";
import type { Diagram, DiagramNode, DiagramTone, NarrowLayout } from "@/content/case-study";

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

type Point = [number, number];
const pathOf = (points: Point[]) => points.map(([x, y], j) => `${j ? "L" : "M"}${x},${y}`).join(" ");

/**
 * Boxes-and-arrows diagram drawn from data, in two layouts: the wide one from
 * md up, and a vertical one (boxes stacked down the page) on phones. All
 * colours are theme tokens, so both follow dark/light. Items carry
 * `.reveal-item` so a wrapping <Reveal> can fade them in one after another.
 */
export function ArchitectureDiagram({ id, diagram }: { id: string; diagram: Diagram }) {
  return (
    <>
      <WideDiagram id={`${id}-wide`} diagram={diagram} />
      <NarrowDiagram id={`${id}-narrow`} diagram={diagram} />
    </>
  );
}

function Frame({
  id,
  diagram,
  width,
  height,
  className,
  children,
}: {
  id: string;
  diagram: Diagram;
  width: number;
  height: number;
  className: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={`${id}-title ${id}-desc`}
      className={`h-auto w-full font-mono ${className}`}
    >
      <title id={`${id}-title`}>{diagram.title}</title>
      <desc id={`${id}-desc`}>{diagram.description}</desc>
      <defs>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted" />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

type BoxLayout = { node: DiagramNode; x: number; y: number; w: number; h: number; title: string[]; lines: string[] };

function Box({ box, offset, index }: { box: BoxLayout; offset: number; index: number }) {
  const { node, x, y, w, h, title, lines } = box;
  const tone = node.tone ?? "plain";
  const stack = node.stack ?? 0;
  const bodyTop = y + 26 + (title.length - 1) * 17;
  return (
    <g className="reveal-item" style={delay(index)}>
      {Array.from({ length: stack }, (_, k) => stack - k).map((k) => (
        <rect
          key={k}
          x={x + k * offset}
          y={y + k * offset}
          width={w}
          height={h}
          rx={10}
          className={`fill-bg ${stroke[tone]}`}
          strokeOpacity={0.45}
        />
      ))}
      <rect x={x} y={y} width={w} height={h} rx={10} className={`fill-bg ${stroke[tone]}`} strokeWidth={1.5} />
      {title.map((t, j) => (
        <text key={j} x={x + 14} y={y + 26 + j * 17} fontSize={13} fontWeight={600} className={titleFill[tone]}>
          {t}
        </text>
      ))}
      {lines.map((line, j) => (
        <text key={j} x={x + 14} y={bodyTop + 22 + j * 18} fontSize={11.5} className="fill-soft">
          {line}
        </text>
      ))}
    </g>
  );
}

type LabelLayout = { lines: string[]; x: number; y: number; anchor?: "start" | "middle" | "end" };

function Label({ lines, x, y, anchor = "start" }: LabelLayout) {
  return (
    <text x={x} y={y} fontSize={11} textAnchor={anchor} className="fill-muted">
      {lines.map((line, j) => (
        <tspan key={j} x={x} dy={j ? LINE_HEIGHT : 0}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

type ArrowLayout = { key: string; points: Point[]; label?: LabelLayout };

function Arrow({ id, arrow, index }: { id: string; arrow: ArrowLayout; index: number }) {
  return (
    <g className="reveal-item" style={delay(index)}>
      <path
        d={pathOf(arrow.points)}
        pathLength={1}
        fill="none"
        strokeWidth={1.5}
        markerEnd={`url(#${id}-arrow)`}
        className="reveal-draw stroke-muted"
      />
      {arrow.label && <Label {...arrow.label} />}
    </g>
  );
}

function WideDiagram({ id, diagram }: { id: string; diagram: Diagram }) {
  const boxes: BoxLayout[] = diagram.nodes.map((n) => ({ node: n, x: n.x, y: n.y, w: n.w, h: n.h, title: [n.title], lines: n.lines ?? [] }));
  const arrows: ArrowLayout[] = diagram.edges.map((e) => {
    const [x, y] = e.labelAt ?? e.points[0];
    return { key: pathOf(e.points), points: e.points, label: e.label && { lines: e.label, x, y, anchor: e.labelAnchor } };
  });
  return (
    <Frame id={id} diagram={diagram} width={diagram.width} height={diagram.height} className="hidden md:block">
      {boxes.map((b, i) => (
        <Box key={b.node.id} box={b} offset={STACK_OFFSET} index={i} />
      ))}
      {arrows.map((a, i) => (
        <Arrow key={a.key} id={id} arrow={a} index={boxes.length + i} />
      ))}
    </Frame>
  );
}

/* ── Phone layout ─────────────────────────────────────────── */

const N_WIDTH = 300;
const N_PAD = 8;
const N_STACK = 4;
const LANE_GAP = 12;
const TITLE_CHAR = 7.8; // JetBrains Mono advance at 13px
const LINE_CHAR = 6.9; // … at 11.5px
const ADJ_ARROW_X = 28; // first straight arrow, from the box's left edge
const ADJ_ARROW_STEP = 64; // between parallel straight arrows in one gap

/** Greedy word wrap for monospaced text. */
function wrap(text: string, maxChars: number) {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && line.length + 1 + word.length > maxChars) {
      out.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) out.push(line);
  return out;
}

type NarrowEdge = NarrowLayout["edges"][number];

/** Pure layout pass for the phone diagram: positions only, no JSX. */
function layoutNarrow(diagram: Diagram) {
  const { order, edges } = diagram.narrow;
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  const index = new Map(order.map((nodeId, i) => [nodeId, i]));
  const pos = (nodeId: string) => {
    const i = index.get(nodeId);
    if (i === undefined) throw new Error(`${diagram.title}: narrow layout is missing node "${nodeId}"`);
    return i;
  };
  const span = (e: NarrowEdge) => Math.abs(pos(e.from) - pos(e.to));

  const straight = edges.filter((e) => span(e) === 1);
  // Arrows between non-neighbours run down a gutter; shortest span on the innermost lane.
  const gutter = edges.filter((e) => span(e) !== 1).sort((a, b) => span(a) - span(b));
  const boxW = N_WIDTH - 2 * N_PAD - (gutter.length ? 10 + gutter.length * LANE_GAP : 0);

  // Gap i sits between order[i] and order[i + 1]. A gutter arrow's label goes in
  // the gap next to its target, on the side the arrow comes from.
  const gaps = order.slice(0, -1).map((_, i) => ({
    straight: straight.filter((e) => Math.min(pos(e.from), pos(e.to)) === i),
    gutterLabel: gutter
      .filter((e) => (pos(e.to) > pos(e.from) ? pos(e.to) - 1 : pos(e.to)) === i)
      .flatMap((e) => e.label ?? []),
  }));

  // Boxes top to bottom; each gap is tall enough for its labels.
  const boxes: (BoxLayout & { bottom: number })[] = [];
  for (const [i, nodeId] of order.entries()) {
    const node = byId.get(nodeId);
    if (!node) throw new Error(`${diagram.title}: unknown node "${nodeId}"`);
    const prev = boxes[i - 1];
    const gap = gaps[i - 1];
    const labelLines = gap ? Math.max(gap.gutterLabel.length, ...gap.straight.map((e) => e.label?.length ?? 0)) : 0;
    const y = prev ? prev.bottom + Math.max(34, 20 + labelLines * LINE_HEIGHT) : N_PAD;
    const stack = node.stack ?? 0;
    const w = boxW - stack * N_STACK;
    const title = wrap(node.title, Math.floor((w - 24) / TITLE_CHAR));
    const lines = (node.lines ?? []).flatMap((l) => wrap(l, Math.floor((w - 24) / LINE_CHAR)));
    const h = 26 + (title.length - 1) * 17 + (lines.length ? 22 + (lines.length - 1) * 18 : 0) + 14;
    boxes.push({ node, x: N_PAD, y, w, h, title, lines, bottom: y + h + stack * N_STACK });
  }
  const box = (nodeId: string) => boxes[pos(nodeId)];
  const gapMid = (i: number) => (boxes[i].bottom + boxes[i + 1].y) / 2;
  const centred = (lines: string[], i: number) => gapMid(i) - ((lines.length - 1) * LINE_HEIGHT) / 2 + 4;

  const arrows: ArrowLayout[] = gaps.flatMap((gap, i) =>
    gap.straight.map((e, k) => {
      const x = N_PAD + ADJ_ARROW_X + k * ADJ_ARROW_STEP;
      const upper = boxes[i];
      const lower = boxes[i + 1];
      const points: Point[] =
        pos(e.from) < pos(e.to)
          ? [
              [x, upper.bottom + 2],
              [x, lower.y - 3],
            ]
          : [
              [x, lower.y - 2],
              [x, upper.bottom + 3],
            ];
      const lines = e.label ?? [];
      return { key: `${e.from}-${e.to}`, points, label: lines.length ? { lines, x: x + 10, y: centred(lines, i) } : undefined };
    }),
  );

  // Gutter arrows. The outermost lane attaches highest on a box, so lines don't cross.
  const slots = new Map<string, number>();
  const slotY = (nodeId: string) => {
    const s = slots.get(nodeId) ?? 0;
    slots.set(nodeId, s + 1);
    return box(nodeId).y + 16 + s * 9;
  };
  for (let lane = gutter.length - 1; lane >= 0; lane--) {
    const e = gutter[lane];
    const from = box(e.from);
    const to = box(e.to);
    const x = N_PAD + boxW + 10 + lane * LANE_GAP;
    const y1 = slotY(e.from);
    const y2 = slotY(e.to);
    arrows.push({
      key: `${e.from}-${e.to}`,
      points: [
        [from.x + from.w, y1],
        [x, y1],
        [x, y2],
        [to.x + to.w + 4, y2],
      ],
    });
  }

  const gutterLabels: LabelLayout[] = gaps.flatMap((gap, i) =>
    gap.gutterLabel.length ? [{ lines: gap.gutterLabel, x: N_PAD + boxW - 4, y: centred(gap.gutterLabel, i), anchor: "end" as const }] : [],
  );

  return { boxes, arrows, gutterLabels, height: boxes[boxes.length - 1].bottom + N_PAD };
}

function NarrowDiagram({ id, diagram }: { id: string; diagram: Diagram }) {
  const { boxes, arrows, gutterLabels, height } = layoutNarrow(diagram);
  return (
    <Frame id={id} diagram={diagram} width={N_WIDTH} height={height} className="md:hidden">
      {boxes.map((b, i) => (
        <Box key={b.node.id} box={b} offset={N_STACK} index={i} />
      ))}
      {arrows.map((a, i) => (
        <Arrow key={a.key} id={id} arrow={a} index={boxes.length + i} />
      ))}
      {gutterLabels.map((l, i) => (
        <g key={i} className="reveal-item" style={delay(boxes.length + arrows.length + i)}>
          <Label {...l} />
        </g>
      ))}
    </Frame>
  );
}

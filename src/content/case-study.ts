/**
 * Types for the case-study template (see docs/PLAN.md → "Case-study template").
 * Each project in projects.ts may carry an optional `caseStudy` of this shape.
 */

/** A fact that is still missing. Rendered as a visible `[TODO: …]`. */
export type Todo = { todo: string };

/** Plain text, or a TODO placeholder. */
export type Text = string | Todo;

export function todo(text: string): Todo {
  return { todo: text };
}

export function isTodo<T>(value: T | Todo): value is Todo {
  return typeof value === "object" && value !== null && "todo" in value;
}

/* ── Architecture diagram ─────────────────────────────────── */

export type DiagramTone = "accent" | "info" | "plain";

export type DiagramNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines?: string[];
  tone?: DiagramTone;
  /** Draw extra stacked copies behind the box to show "× N" instances. */
  stack?: number;
};

export type DiagramEdge = {
  /** Polyline points in viewBox units; the arrow points at the last one. */
  points: [number, number][];
  label?: string[];
  labelAt?: [number, number];
  labelAnchor?: "start" | "middle" | "end";
};

/**
 * Phone layout: the same boxes stacked top to bottom. Arrows between
 * neighbouring boxes are drawn straight with their label; any other arrow is
 * routed down a gutter on the right, labelled where it enters its target.
 */
export type NarrowLayout = {
  /** Node ids, top to bottom. */
  order: string[];
  edges: { from: string; to: string; label?: string[] }[];
};

export type Diagram = {
  /** Wide (md and up) layout size, in viewBox units. */
  width: number;
  height: number;
  /** Read out by screen readers in place of the picture. */
  title: string;
  description: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  narrow: NarrowLayout;
};

/* ── Case study ───────────────────────────────────────────── */

export type Decision = {
  title: string;
  body: string;
  /** A measured result or test that backs the decision up. */
  evidence?: Text;
};

export type CaseStudy = {
  overview: Text[];
  architecture: { diagram: Diagram; caption: Text };
  role: {
    summary: Text;
    owned: Text[];
    timeframe: Text;
  };
  decisions: Decision[];
  /** Optional one-line "why/how" note per entry in `project.stack`. */
  stackNotes?: Record<string, string>;
  /** Extra links shown after GitHub / live demo. */
  extraLinks?: ({ label: string; href: string } | Todo)[];
};

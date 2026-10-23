import type { CSSProperties } from "react";

/**
 * Ścieżka powstawania numeru: Pomysł → Tekst → Bit → (Wynajem studia | Sesja nagraniowa)
 * → Mix / Master → Teledysk → Materiały promocyjne → Dystrybucja.
 * Linie rysują się po kolei przy wejściu, potem po trasie w pętli biegnie "sygnał",
 * a mijane punkty się podświetlają (animacje w styles.css, klasy roadmap-*).
 * Od sm w poziomie, na telefonie pionowo (dwie osobne grafiki SVG).
 */

type Point = { x: number; y: number };
type Node = Point & { level: number; label: string[]; labelAt: "above" | "below" | "right" };
type Edge = { level: number; d: string };

// Poziom 3 to rozwidlenie: wynajem studia albo sesja z realizatorem.
const STEPS: { label: string[]; fork?: true }[] = [
  { label: ["Pomysł"] },
  { label: ["Tekst"] },
  { label: ["Bit"] },
  { label: ["Wynajem", "studia"], fork: true },
  { label: ["Mix /", "Master"] },
  { label: ["Teledysk"] },
  { label: ["Materiały", "promocyjne"] },
  { label: ["Dystrybucja"] },
];
const FORK_B = ["Sesja", "nagraniowa"];

// Krzywa między dwoma punktami - wychodzi i wchodzi równolegle do osi trasy.
function curve(a: Point, b: Point, horizontal: boolean) {
  if (a.x === b.x || a.y === b.y) return `M${a.x} ${a.y} L${b.x} ${b.y}`;
  const k = horizontal ? (b.x - a.x) / 2 : (b.y - a.y) / 2;
  return horizontal
    ? `M${a.x} ${a.y} C${a.x + k} ${a.y} ${b.x - k} ${b.y} ${b.x} ${b.y}`
    : `M${a.x} ${a.y} C${a.x} ${a.y + k} ${b.x} ${b.y - k} ${b.x} ${b.y}`;
}

function layout(horizontal: boolean) {
  const nodes: Node[] = [];
  STEPS.forEach((s, level) => {
    if (horizontal) {
      const x = 36 + level * 80;
      if (s.fork) {
        nodes.push({ x, y: 48, level, label: s.label, labelAt: "above" });
        nodes.push({ x, y: 102, level, label: FORK_B, labelAt: "below" });
      } else nodes.push({ x, y: 75, level, label: s.label, labelAt: "below" });
    } else {
      const y = 12 + level * 38;
      if (s.fork) {
        nodes.push({ x: 12, y, level, label: [s.label.join(" ")], labelAt: "right" });
        nodes.push({ x: 176, y, level, label: [FORK_B.join(" ")], labelAt: "right" });
      } else nodes.push({ x: 12, y, level, label: [s.label.join(" ")], labelAt: "right" });
    }
  });

  const edges: Edge[] = [];
  for (const a of nodes)
    for (const b of nodes)
      if (b.level === a.level + 1) edges.push({ level: a.level, d: curve(a, b, horizontal) });
  return { nodes, edges };
}

const H = layout(true);
const V = layout(false);

function Roadmap({ horizontal, className }: { horizontal: boolean; className: string }) {
  const { nodes, edges } = horizontal ? H : V;
  return (
    <svg
      viewBox={horizontal ? "0 0 640 150" : "0 0 330 290"}
      className={className}
      aria-hidden="true"
    >
      {edges.map((e, i) => (
        <g key={i} style={{ "--l": e.level } as CSSProperties}>
          <path d={e.d} pathLength={1} className="roadmap-line" />
          <path d={e.d} pathLength={1} className="roadmap-signal" />
        </g>
      ))}
      {nodes.map((n, i) => {
        const lineH = 12;
        const tx = n.labelAt === "right" ? n.x + 18 : n.x;
        const ty =
          n.labelAt === "right"
            ? n.y + 4
            : n.labelAt === "above"
              ? n.y - 16 - (n.label.length - 1) * lineH
              : n.y + 24;
        return (
          <g key={i} className="roadmap-node" style={{ "--l": n.level } as CSSProperties}>
            <circle cx={n.x} cy={n.y} r={9} className="roadmap-halo" />
            <circle cx={n.x} cy={n.y} r={5} className="roadmap-dot" />
            <text
              x={tx}
              y={ty}
              textAnchor={n.labelAt === "right" ? "start" : "middle"}
              className="roadmap-label"
            >
              {n.label.map((line, j) => (
                <tspan key={j} x={tx} dy={j ? lineH : 0}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function RecordingRoadmap({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <figcaption className="sr-only">
        Proces: pomysł, tekst, bit, wynajem studia albo sesja nagraniowa z realizatorem, mix i
        master, teledysk, materiały promocyjne, dystrybucja.
      </figcaption>
      <Roadmap horizontal className="hidden w-full max-w-[680px] sm:block" />
      <Roadmap horizontal={false} className="w-full max-w-[360px] sm:hidden" />
    </figure>
  );
}

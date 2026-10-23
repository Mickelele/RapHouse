import type { CSSProperties } from "react";
import type { RoadmapStep } from "@/data/raphouse";
import { useRoadmap } from "@/lib/content";

/**
 * Ścieżka powstawania numeru (domyślnie Pomysł → Tekst → Bit → Wynajem studia | Sesja nagraniowa
 * → Mix / Master → Teledysk → Materiały promocyjne → Dystrybucja). Kroki i ich odnośniki są
 * edytowane w panelu admina; krok oznaczony jako alternatywa staje obok poprzedniego (rozwidlenie).
 * Linie rysują się po kolei przy wejściu, potem po trasie w pętli biegnie "sygnał",
 * a mijane punkty się podświetlają (animacje w styles.css, klasy roadmap-*).
 * Od sm w poziomie, na telefonie pionowo (dwie osobne grafiki SVG).
 */

type Point = { x: number; y: number };
type Node = Point & {
  level: number;
  label: string[];
  labelAt: "above" | "below" | "right";
  step: RoadmapStep;
};
type Edge = { level: number; d: string };

const LINE_H = 12;

// Kroki pogrupowane w poziomy: alternatywa dołącza do poziomu poprzedniego kroku.
function levelsOf(steps: RoadmapStep[]) {
  const levels: RoadmapStep[][] = [];
  for (const s of steps) {
    const last = levels[levels.length - 1];
    if (s.alternative && last) last.push(s);
    else levels.push([s]);
  }
  return levels;
}

// Dłuższy podpis w poziomie łamany na dwie linie, przy spacji najbliżej środka.
function splitLabel(label: string) {
  if (label.length <= 10) return [label];
  let best = -1;
  for (let i = 0; i < label.length; i++)
    if (
      label[i] === " " &&
      (best < 0 || Math.abs(i - label.length / 2) < Math.abs(best - label.length / 2))
    )
      best = i;
  return best < 0 ? [label] : [label.slice(0, best), label.slice(best + 1)];
}

// Krzywa między dwoma punktami - wychodzi i wchodzi równolegle do osi trasy.
function curve(a: Point, b: Point, horizontal: boolean) {
  if (a.x === b.x || a.y === b.y) return `M${a.x} ${a.y} L${b.x} ${b.y}`;
  const k = horizontal ? (b.x - a.x) / 2 : (b.y - a.y) / 2;
  return horizontal
    ? `M${a.x} ${a.y} C${a.x + k} ${a.y} ${b.x - k} ${b.y} ${b.x} ${b.y}`
    : `M${a.x} ${a.y} C${a.x} ${a.y + k} ${b.x} ${b.y - k} ${b.x} ${b.y}`;
}

function layout(steps: RoadmapStep[], horizontal: boolean) {
  const levels = levelsOf(steps);
  const gap = levels.length > 1 ? 568 / (levels.length - 1) : 0;
  const nodes: Node[] = [];
  levels.forEach((group, level) => {
    group.forEach((step, j) => {
      if (horizontal) {
        // Pojedynczy krok na osi; rozwidlenie: rozłożone między nad i pod osią.
        nodes.push({
          x: 36 + level * gap,
          y: group.length === 1 ? 75 : 48 + (54 * j) / (group.length - 1),
          level,
          step,
          label: splitLabel(step.label),
          labelAt: group.length > 1 && j === 0 ? "above" : "below",
        });
      } else {
        nodes.push({
          x: 12 + j * 164,
          y: 12 + level * 38,
          level,
          step,
          label: [step.label],
          labelAt: "right",
        });
      }
    });
  });

  const edges: Edge[] = [];
  for (const a of nodes)
    for (const b of nodes)
      if (b.level === a.level + 1) edges.push({ level: a.level, d: curve(a, b, horizontal) });
  const height = horizontal ? 150 : 24 + (levels.length - 1) * 38;
  return { nodes, edges, height };
}

function Roadmap({
  steps,
  horizontal,
  className,
}: {
  steps: RoadmapStep[];
  horizontal: boolean;
  className: string;
}) {
  const { nodes, edges, height } = layout(steps, horizontal);
  return (
    <svg viewBox={`0 0 ${horizontal ? 640 : 330} ${height}`} className={className}>
      {edges.map((e, i) => (
        <g key={i} style={{ "--l": e.level } as CSSProperties} aria-hidden="true">
          <path d={e.d} pathLength={1} className="roadmap-line" />
          <path d={e.d} pathLength={1} className="roadmap-signal" />
        </g>
      ))}
      {nodes.map((n, i) => {
        const tx = n.labelAt === "right" ? n.x + 18 : n.x;
        const ty =
          n.labelAt === "right"
            ? n.y + 4
            : n.labelAt === "above"
              ? n.y - 16 - (n.label.length - 1) * LINE_H
              : n.y + 24;
        // Pole kliknięcia: punkt + podpis.
        const hit =
          n.labelAt === "right"
            ? { x: n.x - 12, y: n.y - 16, width: 152, height: 32 }
            : n.labelAt === "above"
              ? { x: n.x - 38, y: ty - 12, width: 76, height: n.y + 12 - (ty - 12) }
              : {
                  x: n.x - 38,
                  y: n.y - 12,
                  width: 76,
                  height: ty + (n.label.length - 1) * LINE_H + 6 - (n.y - 12),
                };
        const node = (
          <g className="roadmap-node" style={{ "--l": n.level } as CSSProperties}>
            <rect {...hit} rx={6} className="roadmap-hit" />
            <circle cx={n.x} cy={n.y} r={9} className="roadmap-halo" />
            <circle cx={n.x} cy={n.y} r={5} className="roadmap-dot" />
            <text
              x={tx}
              y={ty}
              textAnchor={n.labelAt === "right" ? "start" : "middle"}
              className="roadmap-label"
            >
              {n.label.map((line, j) => (
                <tspan key={j} x={tx} dy={j ? LINE_H : 0}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
        const link = n.step.link;
        if (!link) return <g key={i}>{node}</g>;
        const external = /^https?:\/\//.test(link);
        return (
          <a
            key={i}
            href={link}
            aria-label={n.step.label}
            className="roadmap-link"
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {node}
          </a>
        );
      })}
    </svg>
  );
}

export function RecordingRoadmap({ className }: { className?: string }) {
  const steps = useRoadmap();
  return (
    <nav aria-label="Proces: od pomysłu do dystrybucji" className={className}>
      <Roadmap steps={steps} horizontal className="hidden w-full max-w-[680px] sm:block" />
      <Roadmap steps={steps} horizontal={false} className="w-full max-w-[360px] sm:hidden" />
    </nav>
  );
}

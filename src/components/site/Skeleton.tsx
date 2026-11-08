import { cn } from "@/lib/utils";

/** Szary, pulsujący prostokąt w miejscu treści, która jeszcze się ładuje z bazy. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-secondary/70", className)} />;
}

import { useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PUBLIC_CALENDAR_URL, useBusySlots, type BusySlot } from "@/lib/availability";
import { cn } from "@/lib/utils";

type View = "month" | "week";

const VIEWS: { value: View; label: string }[] = [
  { value: "month", label: "Miesiąc" },
  { value: "week", label: "Tydzień" },
];
const WEEKDAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const WEEK = { weekStartsOn: 1 } as const;
// Domyślny zakres godzin w widoku tygodnia; rozszerza się, jeśli rezerwacja wychodzi poza niego.
const DAY_START = 10;
const DAY_END = 24;
const HOUR_PX = 36;

const iso = (d: Date) => format(d, "yyyy-MM-dd");

/** Kalendarz zajętości studia (dane z RapApp): widok miesięczny i tygodniowy. */
export function BookingCalendar() {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => new Date());

  const days = useMemo(
    () =>
      view === "month"
        ? eachDayOfInterval({
            start: startOfWeek(startOfMonth(cursor), WEEK),
            end: endOfWeek(endOfMonth(cursor), WEEK),
          })
        : eachDayOfInterval({ start: startOfWeek(cursor, WEEK), end: endOfWeek(cursor, WEEK) }),
    [view, cursor],
  );
  const first = days[0] ?? cursor;
  const last = days[days.length - 1] ?? cursor;
  const { data, isLoading, isError } = useBusySlots(iso(first), iso(last));
  const slotsOf = (d: Date) => data?.get(iso(d)) ?? [];

  const step = (dir: 1 | -1) =>
    setCursor((c) => (view === "month" ? addMonths(c, dir) : addWeeks(c, dir)));

  const title =
    view === "month"
      ? format(cursor, "LLLL yyyy", { locale: pl })
      : `${format(first, "d MMM", { locale: pl })} – ${format(last, "d MMM yyyy", { locale: pl })}`;

  return (
    <div className="card-surface overflow-hidden">
      {/* Pasek: przełącznik widoku + nawigacja */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4 md:p-5">
        <div
          role="tablist"
          aria-label="Widok kalendarza"
          className="grid grid-cols-2 rounded-md border border-border p-1"
        >
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              role="tab"
              aria-selected={view === v.value}
              onClick={() => setView(v.value)}
              className={cn(
                "min-h-10 rounded px-5 text-xs font-bold uppercase tracking-[0.18em] transition-colors",
                view === v.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor(new Date())}
            className="min-h-10 rounded border border-border px-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Dziś
          </button>
          <button
            type="button"
            aria-label={view === "month" ? "Poprzedni miesiąc" : "Poprzedni tydzień"}
            onClick={() => step(-1)}
            className="inline-flex size-10 items-center justify-center rounded border border-border transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label={view === "month" ? "Następny miesiąc" : "Następny tydzień"}
            onClick={() => step(1)}
            className="inline-flex size-10 items-center justify-center rounded border border-border transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <h2 aria-live="polite" className="font-display w-full text-2xl capitalize md:text-3xl">
          {title}
        </h2>
      </div>

      <div className="relative">
        {view === "month" ? (
          <MonthGrid
            days={days}
            cursor={cursor}
            slotsOf={slotsOf}
            onPick={(d) => {
              setCursor(d);
              setView("week");
            }}
          />
        ) : (
          <WeekView days={days} slotsOf={slotsOf} />
        )}

        {(isLoading || isError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 p-6 text-center text-sm text-muted-foreground">
            {isLoading ? (
              "Ładowanie terminów…"
            ) : (
              <p>
                Nie udało się pobrać terminów.{" "}
                <a
                  href={PUBLIC_CALENDAR_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Otwórz kalendarz RapApp
                </a>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border p-4 text-xs text-muted-foreground md:px-5">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block size-3 rounded-sm border-l-2 border-primary bg-primary/20" />
          Zajęte godziny
        </span>
        <span>Pozostałe godziny są wolne - zadzwoń, żeby zarezerwować.</span>
      </div>
    </div>
  );
}

function SlotChip({ slot, compact }: { slot: BusySlot; compact?: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden whitespace-nowrap rounded-sm border-l-2 border-primary bg-primary/20 text-foreground",
        compact ? "px-0.5 text-[9px] leading-tight" : "px-1.5 py-0.5 text-[11px]",
      )}
    >
      {slot.start}–{slot.end}
    </div>
  );
}

function MonthGrid({
  days,
  cursor,
  slotsOf,
  onPick,
}: {
  days: Date[];
  cursor: Date;
  slotsOf: (d: Date) => BusySlot[];
  onPick: (d: Date) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const slots = slotsOf(d);
          const inMonth = isSameMonth(d, cursor);
          return (
            <button
              key={iso(d)}
              type="button"
              onClick={() => onPick(d)}
              aria-label={`${format(d, "EEEE d MMMM", { locale: pl })}: ${
                slots.length
                  ? `zajęte ${slots.map((s) => `${s.start}-${s.end}`).join(", ")}`
                  : "wolne"
              }. Pokaż tydzień.`}
              className={cn(
                "flex min-h-[76px] flex-col gap-1 border-b border-r border-border p-1 text-left transition-colors hover:bg-secondary/60 sm:min-h-[112px] sm:p-2 [&:nth-child(7n)]:border-r-0",
                !inMonth && "opacity-35",
              )}
            >
              <span
                className={cn(
                  "ml-auto inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                  isToday(d) && "bg-primary text-primary-foreground",
                )}
              >
                {format(d, "d")}
              </span>
              {/* Telefon: maks. 2 przedziały drobnym drukiem; większe ekrany: 3. */}
              <div className="flex w-full flex-col gap-0.5 sm:hidden">
                {slots.slice(0, 2).map((s) => (
                  <SlotChip key={s.start} slot={s} compact />
                ))}
                {slots.length > 2 && (
                  <span className="text-[9px] text-muted-foreground">+{slots.length - 2}</span>
                )}
              </div>
              <div className="hidden w-full flex-col gap-1 sm:flex">
                {slots.slice(0, 3).map((s) => (
                  <SlotChip key={s.start} slot={s} />
                ))}
                {slots.length > 3 && (
                  <span className="text-[11px] text-muted-foreground">
                    +{slots.length - 3} więcej
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ days, slotsOf }: { days: Date[]; slotsOf: (d: Date) => BusySlot[] }) {
  const all = days.flatMap(slotsOf);
  const startH = Math.min(DAY_START, ...all.map((s) => Math.floor(s.startMin / 60)));
  const endH = Math.max(DAY_END, ...all.map((s) => Math.ceil(s.endMin / 60)));
  const hours = Array.from({ length: endH - startH }, (_, i) => startH + i);

  return (
    <>
      {/* Telefon: lista dni */}
      <ul className="divide-y divide-border sm:hidden">
        {days.map((d) => {
          const slots = slotsOf(d);
          return (
            <li key={iso(d)} className="flex items-start gap-4 p-4">
              <div
                className={cn(
                  "w-14 shrink-0 text-xs font-bold uppercase tracking-[0.14em]",
                  isToday(d) ? "text-primary" : "text-muted-foreground",
                )}
              >
                {format(d, "EEE", { locale: pl })}
                <span className="font-display block text-2xl tracking-normal text-foreground">
                  {format(d, "d")}
                </span>
              </div>
              <div className="flex flex-1 flex-wrap gap-1.5 pt-1">
                {slots.length ? (
                  slots.map((s) => <SlotChip key={s.start} slot={s} />)
                ) : (
                  <span className="text-sm text-muted-foreground">Cały dzień wolny</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Większe ekrany: siatka godzin */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-border">
          <div />
          {days.map((d) => (
            <div
              key={iso(d)}
              className={cn(
                "border-l border-border py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em]",
                isToday(d) ? "text-primary" : "text-muted-foreground",
              )}
            >
              {format(d, "EEE", { locale: pl })}
              <span className="font-display block text-xl tracking-normal text-foreground">
                {format(d, "d")}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)]">
          <div>
            {hours.map((h) => (
              <div
                key={h}
                style={{ height: HOUR_PX }}
                className="-translate-y-2 pr-2 text-right text-[11px] text-muted-foreground"
              >
                {h > startH && `${String(h % 24).padStart(2, "0")}:00`}
              </div>
            ))}
          </div>
          {days.map((d) => (
            <div
              key={iso(d)}
              className={cn("relative border-l border-border", isToday(d) && "bg-primary/5")}
              style={{ height: hours.length * HOUR_PX }}
            >
              {hours.slice(1).map((h, i) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-border/50"
                  style={{ top: (i + 1) * HOUR_PX }}
                />
              ))}
              {slotsOf(d).map((s) => (
                <div
                  key={s.start}
                  title={`Zajęte ${s.start}–${s.end}`}
                  className="absolute inset-x-1 overflow-hidden rounded-sm border-l-2 border-primary bg-primary/20 px-1.5 py-1 text-[11px] leading-tight text-foreground"
                  style={{
                    top: ((s.startMin - startH * 60) / 60) * HOUR_PX,
                    height: ((s.endMin - s.startMin) / 60) * HOUR_PX - 2,
                  }}
                >
                  {s.start}–{s.end}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

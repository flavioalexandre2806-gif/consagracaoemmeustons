import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runAction, useCatalog } from "@/components/catalog-provider";
import { SECTION_LABEL, type LiturgyEvent } from "@/lib/catalog";
import {
  formatDayHeading,
  formatEventWhen,
  parseLocalDate,
  sameDay,
  ymd,
} from "@/lib/dates";
import { isRenderableHttpUrl } from "@/lib/links";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function monthCells(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function monthTitle(year: number, month: number): string {
  const raw = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1),
  );
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function CalendarPanel({
  onCreate,
  onEdit,
}: {
  onCreate: () => void;
  onEdit: (event: LiturgyEvent) => void;
}) {
  const { events, songs, isAdmin, removeEvent } = useCatalog();
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => monthCells(year, month), [year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, LiturgyEvent[]>();
    for (const event of events) {
      const d = parseLocalDate(event.startsAt);
      if (!d) continue;
      const key = ymd(d);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const selectedKey = ymd(selected);
  const dayEvents = eventsByDay.get(selectedKey) ?? [];
  const upcoming = events
    .filter((e) => {
      const d = parseLocalDate(e.startsAt);
      return d && d.getTime() >= new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    })
    .slice(0, 6);

  const songTitle = (id: string) => songs.find((s) => s.id === id)?.title;

  async function onDelete(event: LiturgyEvent) {
    const ok = window.confirm(`Excluir o evento “${event.name}”?`);
    if (!ok) return;
    await runAction(() => removeEvent(event.id), "Evento excluído.");
  }

  return (
    <section aria-labelledby="agenda-title" className="min-w-0">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-muted">Agenda</p>
          <h2 id="agenda-title" className="font-display text-3xl font-semibold leading-tight mt-1">
            Calendário
          </h2>
        </div>
        {isAdmin ? (
          <Button onClick={onCreate} className="shrink-0">
            Novo evento
          </Button>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="icon"
              className="size-11"
              aria-label="Mês anterior"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <p className="font-display text-xl font-medium">{monthTitle(year, month)}</p>
            <Button
              variant="icon"
              className="size-11"
              aria-label="Próximo mês"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
          <div className="cal-grid mb-1">
            {WEEKDAYS.map((d) => (
              <span key={d} className="text-center text-[0.7rem] uppercase tracking-wider text-subtle py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="cal-grid">
            {cells.map((day) => {
              const key = ymd(day);
              const inMonth = day.getMonth() === month;
              const isSel = sameDay(day, selected);
              const isToday = sameDay(day, today);
              const has = (eventsByDay.get(key)?.length ?? 0) > 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelected(day);
                    if (day.getMonth() !== month) setCursor(new Date(day.getFullYear(), day.getMonth(), 1));
                  }}
                  className={[
                    "cal-cell",
                    inMonth ? "" : "is-muted",
                    isSel ? "is-selected" : "",
                    isToday && !isSel ? "is-today" : "",
                  ].join(" ")}
                >
                  <span className="text-sm leading-none">{day.getDate()}</span>
                  {has ? <span className="cal-dot" /> : <span className="h-[0.28rem]" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="font-display text-xl font-medium mb-3">
            {formatDayHeading(selected)}
          </h3>
          {dayEvents.length === 0 ? (
            <p className="text-muted text-sm mb-8">Nenhum evento neste dia.</p>
          ) : (
            <ul className="space-y-4 mb-8">
              {dayEvents.map((event) => (
                <li key={event.id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-xl font-medium leading-snug">{event.name}</p>
                      <p className="text-sm text-muted mt-1">{formatEventWhen(event.startsAt)}</p>
                      {event.location ? (
                        <p className="text-sm text-muted mt-1 inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {event.location}
                        </p>
                      ) : null}
                      {event.isWedding ? (
                        <p className="text-xs uppercase tracking-wider text-subtle mt-2">Casamento</p>
                      ) : null}
                    </div>
                    {isAdmin ? (
                      <div className="flex">
                        <Button variant="icon" className="size-11" aria-label="Editar evento" onClick={() => onEdit(event)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="icon" className="size-11" aria-label="Excluir evento" onClick={() => onDelete(event)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  {event.songs.length > 0 ? (
                    <ol className="mt-4 space-y-1.5 border-t border-border pt-3">
                      {event.songs.map((item, i) => {
                        const title = songTitle(item.songId);
                        const song = songs.find((s) => s.id === item.songId);
                        return (
                          <li key={`${event.id}-${i}`} className="flex items-baseline gap-2 text-sm">
                            <span className="text-subtle w-28 shrink-0 truncate">
                              {item.slotLabel || SECTION_LABEL[item.category]}
                            </span>
                            {song && isRenderableHttpUrl(song.pdfUrl) ? (
                              <a
                                href={song.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-fg hover:text-accent truncate transition-colors duration-150"
                              >
                                {title ?? "—"}
                              </a>
                            ) : (
                              <span className="text-fg truncate">{title ?? "Cântico indisponível"}</span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <h3 className="font-display text-xl font-medium mb-3">Próximos</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted">A agenda está em aberto.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    className="w-full text-left rounded-md px-3 py-2 hover:bg-raised transition-colors duration-150 min-h-11"
                    onClick={() => {
                      const d = parseLocalDate(event.startsAt);
                      if (!d) return;
                      setSelected(d);
                      setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
                    }}
                  >
                    <p className="text-fg truncate">{event.name}</p>
                    <p className="text-xs text-muted">{formatEventWhen(event.startsAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

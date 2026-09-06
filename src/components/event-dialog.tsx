import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import {
  eventCategories,
  songsInSection,
  withSlotLabels,
  EVENT_TO_CATALOG,
  SECTION_LABEL,
  type EventSong,
  type LiturgyEvent,
  type Song,
} from "@/lib/catalog";
import { toDatetimeLocal } from "@/lib/dates";
import { runAction, useCatalog } from "@/components/catalog-provider";

function filterSongs(all: Song[], category: string): Song[] {
  const mapped = EVENT_TO_CATALOG[category];
  if (mapped) return songsInSection(all, mapped);
  return [...all].sort((a, b) =>
    a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }),
  );
}

export function EventDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: LiturgyEvent | null;
}) {
  const { songs, addEvent, editEvent } = useCatalog();
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");
  const [isWedding, setIsWedding] = useState(false);
  const [items, setItems] = useState<EventSong[]>([]);
  const [pickCategory, setPickCategory] = useState("entrada");
  const [pickSongId, setPickSongId] = useState("");
  const [pending, setPending] = useState(false);

  const categories = eventCategories(isWedding);
  const available = useMemo(
    () => filterSongs(songs, pickCategory),
    [songs, pickCategory],
  );

  useEffect(() => {
    if (!open) return;
    setName(event?.name ?? "");
    setStartsAt(event ? toDatetimeLocal(event.startsAt) : "");
    setLocation(event?.location ?? "");
    setIsWedding(event?.isWedding ?? false);
    setItems(event?.songs ?? []);
    setPickCategory("entrada");
    setPickSongId("");
  }, [open, event]);

  useEffect(() => {
    if (!categories.some((c) => c.id === pickCategory)) {
      setPickCategory(categories[0]?.id ?? "entrada");
    }
  }, [categories, pickCategory]);

  useEffect(() => {
    if (!available.some((s) => s.id === pickSongId)) {
      setPickSongId(available[0]?.id ?? "");
    }
  }, [available, pickSongId]);

  function addPicked() {
    if (!pickSongId || !pickCategory) return;
    setItems((prev) =>
      withSlotLabels([
        ...prev,
        {
          songId: pickSongId,
          category: pickCategory,
          sortOrder: prev.length,
          slotLabel: "",
        },
      ]),
    );
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return withSlotLabels(next);
    });
  }

  function remove(index: number) {
    setItems((prev) => withSlotLabels(prev.filter((_, i) => i !== index)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    const payload = {
      name: name.trim(),
      startsAt,
      location: location.trim(),
      isWedding,
      songs: withSlotLabels(items),
    };
    const ok = await runAction(async () => {
      if (event) await editEvent({ id: event.id, ...payload });
      else await addEvent(payload);
    }, event ? "Evento atualizado." : "Evento salvo.");
    setPending(false);
    if (ok) onOpenChange(false);
  }

  const songById = useMemo(() => new Map(songs.map((s) => [s.id, s])), [songs]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={event ? "Editar evento" : "Novo evento"}
        description="Defina a ordem das músicas no momento da criação. Categorias repetidas são numeradas automaticamente."
        className="w-[min(92vw,44rem)]"
      >
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Nome do evento" htmlFor="ev-name">
            <Input
              id="ev-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Missa dominical, Casamento…"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data e horário" htmlFor="ev-when">
              <Input
                id="ev-when"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </Field>
            <Field label="Local" htmlFor="ev-loc">
              <Input
                id="ev-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Paróquia, capela…"
              />
            </Field>
          </div>
          <label className="flex items-center gap-3 min-h-11 text-sm text-fg">
            <input
              type="checkbox"
              className="size-4 accent-accent"
              checked={isWedding}
              onChange={(e) => setIsWedding(e.target.checked)}
            />
            Evento de casamento (libera categorias adicionais)
          </label>

          <div className="rounded-lg border border-border bg-raised/50 p-3 sm:p-4 space-y-3">
            <p className="text-sm font-medium text-fg">Músicas utilizadas</p>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Select
                value={pickCategory}
                onChange={(e) => setPickCategory(e.target.value)}
                aria-label="Filtrar categoria"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Select
                value={pickSongId}
                onChange={(e) => setPickSongId(e.target.value)}
                aria-label="Escolher cântico"
                disabled={available.length === 0}
              >
                {available.length === 0 ? (
                  <option value="">Nenhum cântico nesta categoria</option>
                ) : (
                  available.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))
                )}
              </Select>
              <Button
                variant="outline"
                onClick={addPicked}
                disabled={!pickSongId}
                className="w-full sm:w-auto"
              >
                <Plus className="size-4" />
                Incluir
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-subtle py-2">
                Nenhuma música neste evento ainda. Filtre a categoria e inclua na ordem da celebração.
              </p>
            ) : (
              <ol className="space-y-1.5">
                {items.map((item, index) => {
                  const song = songById.get(item.songId);
                  return (
                    <li
                      key={`${item.songId}-${index}`}
                      className="flex items-center gap-2 rounded-md bg-surface px-2 py-1.5 border border-border"
                    >
                      <span className="text-xs text-subtle w-6 tabular-nums shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted">{item.slotLabel || SECTION_LABEL[item.category]}</p>
                        <p className="text-sm text-fg truncate">
                          {song?.title ?? "Cântico removido do catálogo"}
                        </p>
                      </div>
                      <Button
                        variant="icon"
                        className="size-10"
                        aria-label="Subir"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        variant="icon"
                        className="size-10"
                        aria-label="Descer"
                        onClick={() => move(index, 1)}
                        disabled={index === items.length - 1}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        variant="icon"
                        className="size-10 text-danger hover:text-danger"
                        aria-label="Remover"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || !name.trim() || !startsAt}>
              {pending ? "Salvando…" : "Salvar evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

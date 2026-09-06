import { useEffect, useState, type FormEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ALL_SONG_SECTIONS, type Song } from "@/lib/catalog";
import { normalizePdfUrl } from "@/lib/links";
import { runAction, useCatalog } from "@/components/catalog-provider";

export function SongDialog({
  open,
  onOpenChange,
  sectionId,
  song,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  song: Song | null;
}) {
  const { addSong, editSong } = useCatalog();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(sectionId);
  const [pdfUrl, setPdfUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(song?.title ?? "");
    setCategory(song?.category ?? sectionId);
    setPdfUrl(song?.pdfUrl ?? "");
    setLinkError("");
  }, [open, song, sectionId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizePdfUrl(pdfUrl);
    if (normalized === null) {
      setLinkError("Informe um link http(s) válido, de preferência do Google Drive.");
      return;
    }
    setLinkError("");
    setPending(true);
    const payload = { title: title.trim(), category, pdfUrl: normalized };
    const ok = await runAction(async () => {
      if (song) await editSong({ id: song.id, ...payload });
      else await addSong(payload);
    }, song ? "Cântico atualizado." : "Cântico adicionado.");
    setPending(false);
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={song ? "Editar cântico" : "Novo cântico"}
        description="O título entra na lista em ordem alfabética. O PDF abre em nova aba."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Título" htmlFor="song-title">
            <Input
              id="song-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={160}
            />
          </Field>
          <Field label="Seção" htmlFor="song-cat">
            <Select
              id="song-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {ALL_SONG_SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Link do PDF (Google Drive)" htmlFor="song-pdf">
            <Input
              id="song-pdf"
              type="url"
              inputMode="url"
              placeholder="https://drive.google.com/file/d/…"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
            />
            {linkError ? (
              <p className="mt-1.5 text-sm text-danger">{linkError}</p>
            ) : (
              <p className="mt-1.5 text-sm text-subtle">
                Cole o link de compartilhamento. Deixe em branco se ainda não houver partitura.
              </p>
            )}
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || !title.trim()}>
              {pending ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

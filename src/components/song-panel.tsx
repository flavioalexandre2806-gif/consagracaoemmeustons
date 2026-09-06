import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runAction, useCatalog } from "@/components/catalog-provider";
import { SECTION_LABEL, songsInSection, type Song } from "@/lib/catalog";
import { isRenderableHttpUrl } from "@/lib/links";

export function SongPanel({
  sectionId,
  onAdd,
  onEdit,
}: {
  sectionId: string;
  onAdd: () => void;
  onEdit: (song: Song) => void;
}) {
  const { songs, isAdmin, removeSong } = useCatalog();
  const list = songsInSection(songs, sectionId);
  const label = SECTION_LABEL[sectionId] ?? sectionId;

  async function onDelete(song: Song) {
    const ok = window.confirm(`Excluir “${song.title}” desta seção?`);
    if (!ok) return;
    await runAction(() => removeSong(song.id), "Cântico excluído.");
  }

  return (
    <section
      aria-labelledby="section-title"
      className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-muted">Seção</p>
          <h2 id="section-title" className="font-display text-3xl font-semibold leading-tight mt-1">
            {label}
          </h2>
        </div>
        {isAdmin && list.length === 0 ? (
          <Button variant="plus" className="size-11" aria-label="Adicionar cântico" onClick={onAdd}>
            <Plus className="size-5" />
          </Button>
        ) : null}
      </div>

      {list.length === 0 ? (
        <div className="rounded-md bg-raised border border-border px-5 py-10 text-center">
          <p className="text-muted">Nenhum cântico nesta seção ainda.</p>
          <p className="text-sm text-subtle mt-1">
            {isAdmin
              ? "Use o botão + para adicionar o primeiro."
              : "O repertório aparece aqui quando for publicado."}
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-border border-y border-border">
          {list.map((song) => (
            <li key={song.id} className="flex items-center gap-3 py-3 min-h-14">
              <div className="min-w-0 flex-1">
                <p className="text-fg truncate">{song.title}</p>
                {isRenderableHttpUrl(song.pdfUrl) ? (
                  <a
                    href={song.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-0.5 text-sm text-muted hover:text-accent transition-colors duration-150"
                  >
                    <FileText className="size-3.5" />
                    Abrir partitura
                  </a>
                ) : null}
              </div>
              {isAdmin ? (
                <div className="flex items-center shrink-0">
                  <Button
                    variant="icon"
                    className="size-11"
                    aria-label={`Editar ${song.title}`}
                    onClick={() => onEdit(song)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="icon"
                    className="size-11"
                    aria-label={`Excluir ${song.title}`}
                    onClick={() => onDelete(song)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      {isAdmin && list.length > 0 ? (
        <div className="flex justify-center mt-6">
          <Button variant="plus" aria-label="Adicionar cântico" onClick={onAdd}>
            <Plus className="size-6" />
          </Button>
        </div>
      ) : null}
    </section>
  );
}

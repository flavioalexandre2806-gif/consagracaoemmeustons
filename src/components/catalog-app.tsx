import { useState, type ReactNode } from "react";
import { CalendarDays, Lock, LogOut, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { CatalogProvider, useCatalog } from "@/components/catalog-provider";
import { LoginDialog } from "@/components/login-dialog";
import { SongDialog } from "@/components/song-dialog";
import { EventDialog } from "@/components/event-dialog";
import { SongPanel } from "@/components/song-panel";
import { CalendarPanel } from "@/components/calendar-panel";
import {
  LITURGY_SECTIONS,
  SPECIAL_SECTIONS,
  type LiturgyEvent,
  type Song,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

type View = "liturgy" | "special" | "agenda";

function Portrait() {
  return (
    <div className="portrait-frame">
      <img
        src="/flavio.jpg"
        alt="Flávio Vieira"
        width={88}
        height={88}
      />
    </div>
  );
}

function NavItem({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-md px-3 min-h-11 text-sm transition-colors duration-150",
        active
          ? "bg-raised text-fg"
          : "text-muted hover:text-fg hover:bg-raised/60",
      )}
    >
      {children}
    </button>
  );
}

function Shell() {
  const { isAdmin, logout } = useCatalog();
  const [view, setView] = useState<View>("liturgy");
  const [sectionId, setSectionId] = useState(LITURGY_SECTIONS[0].id);
  const [loginOpen, setLoginOpen] = useState(false);
  const [songOpen, setSongOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [eventOpen, setEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LiturgyEvent | null>(null);

  const sections = view === "special" ? SPECIAL_SECTIONS : LITURGY_SECTIONS;

  function openSection(id: string, nextView: View) {
    setView(nextView);
    setSectionId(id);
  }

  function openNewSong() {
    setEditingSong(null);
    setSongOpen(true);
  }

  function openEditSong(song: Song) {
    setEditingSong(song);
    setSongOpen(true);
  }

  function openNewEvent() {
    setEditingEvent(null);
    setEventOpen(true);
    setView("agenda");
  }

  return (
    <div className="relative min-h-dvh">
      <Portrait />

      <header className="site-header mx-auto max-w-6xl px-5 pt-10 pb-6 sm:pt-14 sm:px-8">
        <p className="text-center text-xs tracking-[0.28em] uppercase text-muted">
          Repertório litúrgico
        </p>
        <h1 className="mt-3 text-center font-display text-[clamp(1.85rem,5.4vw,3.5rem)] font-semibold italic leading-[1.12] text-fg max-w-[18ch] mx-auto">
          Consagração em Meus Tons
        </h1>
        <p className="mt-3 text-center font-display text-xl sm:text-2xl tracking-wide text-accent">
          Flávio Vieira
        </p>
        <div className="mx-auto mt-5 h-px w-14 bg-fg/20" />
      </header>

      <nav
        aria-label="Principal"
        className="mx-auto max-w-6xl px-5 sm:px-8 mb-6"
      >
        <div className="site-nav flex flex-wrap items-center justify-center gap-2">
          <Button
            variant={view === "liturgy" ? "primary" : "outline"}
            className="whitespace-nowrap px-3 text-sm"
            onClick={() => {
              setView("liturgy");
              if (!LITURGY_SECTIONS.some((s) => s.id === sectionId)) {
                setSectionId(LITURGY_SECTIONS[0].id);
              }
            }}
          >
            <Music className="size-4" />
            Liturgia
          </Button>
          <Button
            variant={view === "special" ? "primary" : "outline"}
            className="whitespace-nowrap px-3 text-sm"
            onClick={() => {
              setView("special");
              if (!SPECIAL_SECTIONS.some((s) => s.id === sectionId)) {
                setSectionId(SPECIAL_SECTIONS[0].id);
              }
            }}
          >
            Cânticos
            <span className="hidden sm:inline">&nbsp;especiais</span>
          </Button>
          <Button
            variant={view === "agenda" ? "primary" : "outline"}
            className="whitespace-nowrap px-3 text-sm"
            onClick={() => setView("agenda")}
          >
            <CalendarDays className="size-4" />
            Agenda
          </Button>
          {isAdmin ? (
            <Button variant="outline" className="whitespace-nowrap px-3 text-sm" onClick={openNewEvent}>
              Novo evento
            </Button>
          ) : null}
          {isAdmin ? (
            <Button variant="ghost" className="whitespace-nowrap px-3 text-sm" onClick={logout} aria-label="Sair">
              <LogOut className="size-4" />
              Sair
            </Button>
          ) : (
            <Button variant="ghost" className="whitespace-nowrap px-3 text-sm" onClick={() => setLoginOpen(true)}>
              <Lock className="size-4" />
              Área restrita
            </Button>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 sm:px-8 pb-16">
        {view === "agenda" ? (
          <CalendarPanel
            onCreate={openNewEvent}
            onEdit={(event) => {
              setEditingEvent(event);
              setEventOpen(true);
            }}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-[15.5rem_minmax(0,1fr)] min-w-0">
            <aside className="min-w-0">
              <div className="md:hidden mb-3">
                <p className="text-xs tracking-[0.18em] uppercase text-subtle mb-2 px-1">
                  {view === "special" ? "Especiais" : "Ordem da Missa"}
                </p>
                <Select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  aria-label="Seção do repertório"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="hidden md:block">
                <p className="text-xs tracking-[0.18em] uppercase text-subtle mb-2 px-3">
                  {view === "special" ? "Especiais" : "Ordem da Missa"}
                </p>
                <div className="flex flex-col gap-1">
                  {sections.map((section) => (
                    <NavItem
                      key={section.id}
                      active={sectionId === section.id}
                      onClick={() => openSection(section.id, view)}
                    >
                      {section.label}
                    </NavItem>
                  ))}
                </div>
              </div>
            </aside>
            <SongPanel
              sectionId={sectionId}
              onAdd={openNewSong}
              onEdit={openEditSong}
            />
          </div>
        )}
      </main>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <SongDialog
        open={songOpen}
        onOpenChange={setSongOpen}
        sectionId={sectionId}
        song={editingSong}
      />
      <EventDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        event={editingEvent}
      />
    </div>
  );
}

export function CatalogApp() {
  return (
    <CatalogProvider>
      <Shell />
    </CatalogProvider>
  );
}

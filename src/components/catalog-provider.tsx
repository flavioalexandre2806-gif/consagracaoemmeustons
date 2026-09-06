import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  clearAdminToken,
  readAdminToken,
  writeAdminToken,
} from "@/lib/admin-session";
import type { EventSong, LiturgyEvent, Song } from "@/lib/catalog";
import { sortSongsAlpha } from "@/lib/catalog";
import {
  readCachedEvents,
  readCachedSongs,
  writeCachedEvents,
  writeCachedSongs,
} from "@/lib/local-cache";
import {
  createEvent as createEventFn,
  createSong as createSongFn,
  deleteEvent as deleteEventFn,
  deleteSong as deleteSongFn,
  listEvents,
  listSongs,
  loginAdmin,
  restoreCatalog,
  updateEvent as updateEventFn,
  updateSong as updateSongFn,
} from "@/server/catalog";

type CatalogContextValue = {
  ready: boolean;
  isAdmin: boolean;
  songs: Song[];
  events: LiturgyEvent[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  addSong: (input: { title: string; category: string; pdfUrl: string }) => Promise<void>;
  editSong: (input: {
    id: string;
    title: string;
    category: string;
    pdfUrl: string;
  }) => Promise<void>;
  removeSong: (id: string) => Promise<void>;
  addEvent: (input: {
    name: string;
    startsAt: string;
    location: string;
    isWedding: boolean;
    songs: EventSong[];
  }) => Promise<void>;
  editEvent: (input: {
    id: string;
    name: string;
    startsAt: string;
    location: string;
    isWedding: boolean;
    songs: EventSong[];
  }) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Não foi possível concluir a ação.";
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [events, setEvents] = useState<LiturgyEvent[]>([]);

  const persist = useCallback((nextSongs: Song[], nextEvents: LiturgyEvent[]) => {
    writeCachedSongs(nextSongs);
    writeCachedEvents(nextEvents);
  }, []);

  useEffect(() => {
    const cachedSongs = readCachedSongs();
    const cachedEvents = readCachedEvents();
    if (cachedSongs.length) setSongs(sortSongsAlpha(cachedSongs));
    if (cachedEvents.length) setEvents(cachedEvents);
    setIsAdmin(Boolean(readAdminToken()));

    let cancelled = false;
    (async () => {
      try {
        const [remoteSongs, remoteEvents] = await Promise.all([
          listSongs(),
          listEvents(),
        ]);
        if (cancelled) return;

        const token = readAdminToken();
        const remoteEmpty = remoteSongs.length === 0 && remoteEvents.length === 0;
        const cacheHasData = cachedSongs.length > 0 || cachedEvents.length > 0;

        if (remoteEmpty && cacheHasData && token) {
          await restoreCatalog({
            data: { token, songs: cachedSongs, events: cachedEvents },
          });
          const [s2, e2] = await Promise.all([listSongs(), listEvents()]);
          if (cancelled) return;
          setSongs(sortSongsAlpha(s2));
          setEvents(e2);
          persist(s2, e2);
          return;
        }

        if (remoteEmpty && cacheHasData) {
          setSongs(sortSongsAlpha(cachedSongs));
          setEvents(cachedEvents);
          return;
        }

        setSongs(sortSongsAlpha(remoteSongs));
        setEvents(remoteEvents);
        persist(remoteSongs, remoteEvents);
      } catch {
        /* mantém o cache local se o servidor falhar */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [persist]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginAdmin({ data: { username, password } });
    writeAdminToken(result.token);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    clearAdminToken();
    setIsAdmin(false);
  }, []);

  const addSong = useCallback(
    async (input: { title: string; category: string; pdfUrl: string }) => {
      const token = readAdminToken();
      if (!token) throw new Error("Entre na área restrita para editar.");
      const created = await createSongFn({ data: { token, ...input } });
      setSongs((prev) => {
        const next = sortSongsAlpha([...prev, created]);
        persist(next, events);
        return next;
      });
    },
    [events, persist],
  );

  const editSong = useCallback(
    async (input: { id: string; title: string; category: string; pdfUrl: string }) => {
      const token = readAdminToken();
      if (!token) throw new Error("Entre na área restrita para editar.");
      const updated = await updateSongFn({ data: { token, ...input } });
      setSongs((prev) => {
        const next = sortSongsAlpha(prev.map((s) => (s.id === updated.id ? updated : s)));
        persist(next, events);
        return next;
      });
    },
    [events, persist],
  );

  const removeSong = useCallback(
    async (id: string) => {
      const token = readAdminToken();
      if (!token) throw new Error("Entre na área restrita para editar.");
      await deleteSongFn({ data: { token, id } });
      setSongs((prev) => {
        const next = prev.filter((s) => s.id !== id);
        persist(next, events);
        return next;
      });
    },
    [events, persist],
  );

  const addEvent = useCallback(
    async (input: {
      name: string;
      startsAt: string;
      location: string;
      isWedding: boolean;
      songs: EventSong[];
    }) => {
      const token = readAdminToken();
      if (!token) throw new Error("Entre na área restrita para editar.");
      const created = await createEventFn({ data: { token, ...input } });
      setEvents((prev) => {
        const next = [...prev, created].sort((a, b) =>
          a.startsAt.localeCompare(b.startsAt),
        );
        persist(songs, next);
        return next;
      });
    },
    [persist, songs],
  );

  const editEvent = useCallback(
    async (input: {
      id: string;
      name: string;
      startsAt: string;
      location: string;
      isWedding: boolean;
      songs: EventSong[];
    }) => {
      const token = readAdminToken();
      if (!token) throw new Error("Entre na área restrita para editar.");
      const updated = await updateEventFn({ data: { token, ...input } });
      setEvents((prev) => {
        const next = prev
          .map((e) => (e.id === updated.id ? updated : e))
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        persist(songs, next);
        return next;
      });
    },
    [persist, songs],
  );

  const removeEvent = useCallback(
    async (id: string) => {
      const token = readAdminToken();
      if (!token) throw new Error("Entre na área restrita para editar.");
      await deleteEventFn({ data: { token, id } });
      setEvents((prev) => {
        const next = prev.filter((e) => e.id !== id);
        persist(songs, next);
        return next;
      });
    },
    [persist, songs],
  );

  const value = useMemo(
    () => ({
      ready,
      isAdmin,
      songs,
      events,
      login,
      logout,
      addSong,
      editSong,
      removeSong,
      addEvent,
      editEvent,
      removeEvent,
    }),
    [
      ready,
      isAdmin,
      songs,
      events,
      login,
      logout,
      addSong,
      editSong,
      removeSong,
      addEvent,
      editEvent,
      removeEvent,
    ],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}

export async function runAction(action: () => Promise<void>, success: string) {
  try {
    await action();
    toast.success(success);
    return true;
  } catch (err) {
    toast.error(errorMessage(err));
    return false;
  }
}

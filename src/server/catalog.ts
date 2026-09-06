/**
 * Funções de servidor do catálogo.
 * Leitura é pública. Escrita exige o token da área restrita.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import type { EventSong, LiturgyEvent, Song } from "@/lib/catalog";
import { withSlotLabels } from "@/lib/catalog";
import { normalizePdfUrl } from "@/lib/links";

const eventSongSchema = z.object({
  songId: z.string().min(1),
  category: z.string().min(1),
  sortOrder: z.number().int(),
  slotLabel: z.string(),
});

const songRow = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  pdfUrl: z.string(),
  createdAt: z.string(),
});

const eventRow = z.object({
  id: z.string(),
  name: z.string(),
  startsAt: z.string(),
  location: z.string(),
  isWedding: z.boolean(),
  songs: z.array(eventSongSchema),
  createdAt: z.string(),
});

type SongRow = {
  id: string;
  title: string;
  category: string;
  pdf_url: string;
  created_at: string;
};

type EventRow = {
  id: string;
  name: string;
  starts_at: string;
  location: string;
  is_wedding: boolean | string | number;
  songs_json: string;
  created_at: string;
};

function mapSong(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    pdfUrl: row.pdf_url,
    createdAt: row.created_at,
  };
}

function mapEvent(row: EventRow): LiturgyEvent {
  let songs: EventSong[] = [];
  try {
    const parsed = JSON.parse(row.songs_json || "[]") as EventSong[];
    songs = Array.isArray(parsed) ? parsed : [];
  } catch {
    songs = [];
  }
  return {
    id: row.id,
    name: row.name,
    startsAt: row.starts_at,
    location: row.location,
    isWedding: row.is_wedding === true || row.is_wedding === "t" || row.is_wedding === 1,
    songs,
    createdAt: row.created_at,
  };
}

async function requireAdmin(token: string) {
  const { assertAdmin } = await import("./admin.server");
  assertAdmin(token);
}

export const loginAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ username: z.string(), password: z.string() }))
  .handler(async ({ data }) => {
    const { verifyCredentials, issueToken } = await import("./admin.server");
    if (!verifyCredentials(data.username, data.password)) {
      throw new Error("Usuário ou senha inválidos.");
    }
    return { token: issueToken() };
  });

export const listSongs = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<SongRow>`
    select id, title, category, pdf_url, created_at
    from songs
    order by title
  `;
  return rows.map(mapSong);
});

export const listEvents = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<EventRow>`
    select id, name, starts_at, location, is_wedding, songs_json, created_at
    from events
    order by starts_at asc
  `;
  return rows.map(mapEvent);
});

export const createSong = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string(),
      title: z.string().min(1),
      category: z.string().min(1),
      pdfUrl: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const pdfUrl = normalizePdfUrl(data.pdfUrl);
    if (pdfUrl === null) {
      throw new Error("Link do PDF inválido. Use uma URL http(s) do Google Drive.");
    }
    const song: Song = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      category: data.category,
      pdfUrl,
      createdAt: new Date().toISOString(),
    };
    const sql = await getSql();
    await sql`
      insert into songs (id, title, category, pdf_url, created_at)
      values (${song.id}, ${song.title}, ${song.category}, ${song.pdfUrl}, ${song.createdAt})
    `;
    return song;
  });

export const updateSong = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string(),
      id: z.string().min(1),
      title: z.string().min(1),
      category: z.string().min(1),
      pdfUrl: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const pdfUrl = normalizePdfUrl(data.pdfUrl);
    if (pdfUrl === null) {
      throw new Error("Link do PDF inválido. Use uma URL http(s) do Google Drive.");
    }
    const sql = await getSql();
    await sql`
      update songs
      set title = ${data.title.trim()},
          category = ${data.category},
          pdf_url = ${pdfUrl}
      where id = ${data.id}
    `;
    const rows = await sql<SongRow>`
      select id, title, category, pdf_url, created_at from songs where id = ${data.id}
    `;
    if (!rows[0]) throw new Error("Música não encontrada.");
    return mapSong(rows[0]);
  });

export const deleteSong = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string(), id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const sql = await getSql();
    await sql`delete from songs where id = ${data.id}`;
    return { ok: true as const };
  });

export const createEvent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string(),
      name: z.string().min(1),
      startsAt: z.string().min(1),
      location: z.string(),
      isWedding: z.boolean(),
      songs: z.array(eventSongSchema),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const event: LiturgyEvent = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      startsAt: data.startsAt,
      location: data.location.trim(),
      isWedding: data.isWedding,
      songs: withSlotLabels(data.songs),
      createdAt: new Date().toISOString(),
    };
    const sql = await getSql();
    await sql`
      insert into events (id, name, starts_at, location, is_wedding, songs_json, created_at)
      values (
        ${event.id},
        ${event.name},
        ${event.startsAt},
        ${event.location},
        ${event.isWedding},
        ${JSON.stringify(event.songs)},
        ${event.createdAt}
      )
    `;
    return event;
  });

export const updateEvent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string(),
      id: z.string().min(1),
      name: z.string().min(1),
      startsAt: z.string().min(1),
      location: z.string(),
      isWedding: z.boolean(),
      songs: z.array(eventSongSchema),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const songs = withSlotLabels(data.songs);
    const sql = await getSql();
    await sql`
      update events
      set name = ${data.name.trim()},
          starts_at = ${data.startsAt},
          location = ${data.location.trim()},
          is_wedding = ${data.isWedding},
          songs_json = ${JSON.stringify(songs)}
      where id = ${data.id}
    `;
    const rows = await sql<EventRow>`
      select id, name, starts_at, location, is_wedding, songs_json, created_at
      from events where id = ${data.id}
    `;
    if (!rows[0]) throw new Error("Evento não encontrado.");
    return mapEvent(rows[0]);
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string(), id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const sql = await getSql();
    await sql`delete from events where id = ${data.id}`;
    return { ok: true as const };
  });

/** Recupera o catálogo local quando o banco da preview foi reiniciado vazio. */
export const restoreCatalog = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string(),
      songs: z.array(songRow),
      events: z.array(eventRow),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const sql = await getSql();
    for (const song of data.songs) {
      await sql`
        insert into songs (id, title, category, pdf_url, created_at)
        values (${song.id}, ${song.title}, ${song.category}, ${song.pdfUrl}, ${song.createdAt})
        on conflict (id) do nothing
      `;
    }
    for (const event of data.events) {
      await sql`
        insert into events (id, name, starts_at, location, is_wedding, songs_json, created_at)
        values (
          ${event.id},
          ${event.name},
          ${event.startsAt},
          ${event.location},
          ${event.isWedding},
          ${JSON.stringify(event.songs)},
          ${event.createdAt}
        )
        on conflict (id) do nothing
      `;
    }
    return { ok: true as const };
  });

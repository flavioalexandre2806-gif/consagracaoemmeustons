/**
 * Espelho local do catálogo. Garante que músicas e eventos não se percam
 * se a sessão de preview reiniciar, e dá resposta instantânea na UI.
 */

import type { LiturgyEvent, Song } from "./catalog";

const SONGS_KEY = "cmt.songs.v1";
const EVENTS_KEY = "cmt.events.v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readCachedSongs(): Song[] {
  const value = readJson<Song[]>(SONGS_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function readCachedEvents(): LiturgyEvent[] {
  const value = readJson<LiturgyEvent[]>(EVENTS_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function writeCachedSongs(songs: Song[]) {
  window.localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

export function writeCachedEvents(events: LiturgyEvent[]) {
  window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

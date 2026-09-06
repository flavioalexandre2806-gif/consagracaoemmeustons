/**
 * Categorias fixas da liturgia e dos cânticos especiais.
 * Os IDs são estáveis (usados no banco); os rótulos aparecem na interface.
 */

export type LiturgySection = {
  id: string;
  label: string;
};

/** Seções da Missa — menu principal, inicialmente sem músicas. */
export const LITURGY_SECTIONS: LiturgySection[] = [
  { id: "entrada-e-louvor", label: "Entrada e Louvor" },
  { id: "ato-penitencial", label: "Ato penitencial" },
  { id: "hino-de-louvor", label: "Hino de louvor" },
  { id: "aclamacao-ao-evangelho", label: "Aclamação ao Evangelho" },
  { id: "salmos", label: "Salmos" },
  { id: "ofertorio", label: "Ofertório" },
  { id: "santo", label: "Santo" },
  { id: "amem", label: "Amém" },
  { id: "cordeiro-de-deus", label: "Cordeiro de Deus" },
  { id: "comunhao", label: "Comunhão" },
  { id: "pos-comunhao", label: "Pós comunhão" },
  { id: "final", label: "Final" },
];

/** Cânticos especiais, fora da ordem da Missa. */
export const SPECIAL_SECTIONS: LiturgySection[] = [
  { id: "espirito-santo", label: "Espírito Santo" },
  { id: "adoracao", label: "Adoração" },
  { id: "reflexao", label: "Reflexão" },
  { id: "nossa-senhora", label: "Nossa Senhora" },
];

/** Categorias usadas ao montar o repertório de um evento (Missa comum). */
export const EVENT_CATEGORIES: LiturgySection[] = [
  { id: "entrada", label: "Entrada" },
  { id: "ato-penitencial", label: "Ato penitencial" },
  { id: "hino-de-louvor", label: "Hino de louvor" },
  { id: "salmo", label: "Salmo" },
  { id: "ofertorio", label: "Ofertório" },
  { id: "santo", label: "Santo" },
  { id: "amem", label: "Amém" },
  { id: "cordeiro-de-deus", label: "Cordeiro de Deus" },
  { id: "comunhao", label: "Comunhão" },
  { id: "acao-de-gracas", label: "Ação de graças" },
  { id: "final", label: "Final" },
  { id: "espirito-santo", label: "Espírito Santo" },
  { id: "adoracao", label: "Adoração" },
  { id: "louvor", label: "Louvor" },
  { id: "nossa-senhora", label: "Nossa Senhora" },
];

/** Categorias extras exclusivas de casamento. */
export const WEDDING_CATEGORIES: LiturgySection[] = [
  { id: "entrada-da-noiva", label: "Entrada da noiva" },
  { id: "entrada-do-noivo", label: "Entrada do noivo" },
  { id: "padrinhos", label: "Padrinhos" },
  { id: "entrada-da-alianca", label: "Entrada da Aliança" },
  { id: "cumprimentos", label: "Cumprimentos" },
  { id: "daminhas", label: "Daminhas" },
  { id: "pagens", label: "Pagens" },
  { id: "entrada-de-cada-senhora", label: "Entrada de cada senhora" },
  { id: "assinatura", label: "Assinatura" },
  { id: "entrada-dos-pais-ou-avos", label: "Entrada dos Pais ou avós" },
];

/** Relaciona categoria de evento → seção do catálogo de músicas. */
export const EVENT_TO_CATALOG: Record<string, string> = {
  entrada: "entrada-e-louvor",
  "ato-penitencial": "ato-penitencial",
  "hino-de-louvor": "hino-de-louvor",
  salmo: "salmos",
  ofertorio: "ofertorio",
  santo: "santo",
  amem: "amem",
  "cordeiro-de-deus": "cordeiro-de-deus",
  comunhao: "comunhao",
  "acao-de-gracas": "pos-comunhao",
  final: "final",
  "espirito-santo": "espirito-santo",
  adoracao: "adoracao",
  louvor: "entrada-e-louvor",
  "nossa-senhora": "nossa-senhora",
};

export const ALL_SONG_SECTIONS: LiturgySection[] = [
  ...LITURGY_SECTIONS,
  ...SPECIAL_SECTIONS,
];

export const SECTION_LABEL: Record<string, string> = Object.fromEntries(
  [...ALL_SONG_SECTIONS, ...EVENT_CATEGORIES, ...WEDDING_CATEGORIES].map(
    (s) => [s.id, s.label],
  ),
);

export type Song = {
  id: string;
  title: string;
  category: string;
  pdfUrl: string;
  createdAt: string;
};

export type EventSong = {
  songId: string;
  category: string;
  sortOrder: number;
  slotLabel: string;
};

export type LiturgyEvent = {
  id: string;
  name: string;
  startsAt: string;
  location: string;
  isWedding: boolean;
  songs: EventSong[];
  createdAt: string;
};

export function sortSongsAlpha(songs: Song[]): Song[] {
  return [...songs].sort((a, b) =>
    a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }),
  );
}

export function songsInSection(songs: Song[], sectionId: string): Song[] {
  return sortSongsAlpha(songs.filter((s) => s.category === sectionId));
}

export function eventCategories(isWedding: boolean): LiturgySection[] {
  return isWedding
    ? [...EVENT_CATEGORIES, ...WEDDING_CATEGORIES]
    : EVENT_CATEGORIES;
}

/** Numera automaticamente músicas repetidas da mesma categoria (Adoração 1, 2…). */
export function withSlotLabels(items: EventSong[]): EventSong[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  const seen = new Map<string, number>();
  return items.map((item, index) => {
    const total = counts.get(item.category) ?? 1;
    const n = (seen.get(item.category) ?? 0) + 1;
    seen.set(item.category, n);
    const base = SECTION_LABEL[item.category] ?? item.category;
    const slotLabel = total > 1 ? `${base} ${n}` : base;
    return { ...item, sortOrder: index, slotLabel };
  });
}

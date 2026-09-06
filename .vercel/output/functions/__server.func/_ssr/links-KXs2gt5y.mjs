//#region node_modules/.nitro/vite/services/ssr/assets/links-KXs2gt5y.js
/** Seções da Missa — menu principal, inicialmente sem músicas. */
var LITURGY_SECTIONS = [
	{
		id: "entrada-e-louvor",
		label: "Entrada e Louvor"
	},
	{
		id: "ato-penitencial",
		label: "Ato penitencial"
	},
	{
		id: "hino-de-louvor",
		label: "Hino de louvor"
	},
	{
		id: "aclamacao-ao-evangelho",
		label: "Aclamação ao Evangelho"
	},
	{
		id: "salmos",
		label: "Salmos"
	},
	{
		id: "ofertorio",
		label: "Ofertório"
	},
	{
		id: "santo",
		label: "Santo"
	},
	{
		id: "amem",
		label: "Amém"
	},
	{
		id: "cordeiro-de-deus",
		label: "Cordeiro de Deus"
	},
	{
		id: "comunhao",
		label: "Comunhão"
	},
	{
		id: "pos-comunhao",
		label: "Pós comunhão"
	},
	{
		id: "final",
		label: "Final"
	}
];
/** Cânticos especiais, fora da ordem da Missa. */
var SPECIAL_SECTIONS = [
	{
		id: "espirito-santo",
		label: "Espírito Santo"
	},
	{
		id: "adoracao",
		label: "Adoração"
	},
	{
		id: "reflexao",
		label: "Reflexão"
	},
	{
		id: "nossa-senhora",
		label: "Nossa Senhora"
	}
];
/** Categorias usadas ao montar o repertório de um evento (Missa comum). */
var EVENT_CATEGORIES = [
	{
		id: "entrada",
		label: "Entrada"
	},
	{
		id: "ato-penitencial",
		label: "Ato penitencial"
	},
	{
		id: "hino-de-louvor",
		label: "Hino de louvor"
	},
	{
		id: "salmo",
		label: "Salmo"
	},
	{
		id: "ofertorio",
		label: "Ofertório"
	},
	{
		id: "santo",
		label: "Santo"
	},
	{
		id: "amem",
		label: "Amém"
	},
	{
		id: "cordeiro-de-deus",
		label: "Cordeiro de Deus"
	},
	{
		id: "comunhao",
		label: "Comunhão"
	},
	{
		id: "acao-de-gracas",
		label: "Ação de graças"
	},
	{
		id: "final",
		label: "Final"
	},
	{
		id: "espirito-santo",
		label: "Espírito Santo"
	},
	{
		id: "adoracao",
		label: "Adoração"
	},
	{
		id: "louvor",
		label: "Louvor"
	},
	{
		id: "nossa-senhora",
		label: "Nossa Senhora"
	}
];
/** Categorias extras exclusivas de casamento. */
var WEDDING_CATEGORIES = [
	{
		id: "entrada-da-noiva",
		label: "Entrada da noiva"
	},
	{
		id: "entrada-do-noivo",
		label: "Entrada do noivo"
	},
	{
		id: "padrinhos",
		label: "Padrinhos"
	},
	{
		id: "entrada-da-alianca",
		label: "Entrada da Aliança"
	},
	{
		id: "cumprimentos",
		label: "Cumprimentos"
	},
	{
		id: "daminhas",
		label: "Daminhas"
	},
	{
		id: "pagens",
		label: "Pagens"
	},
	{
		id: "entrada-de-cada-senhora",
		label: "Entrada de cada senhora"
	},
	{
		id: "assinatura",
		label: "Assinatura"
	},
	{
		id: "entrada-dos-pais-ou-avos",
		label: "Entrada dos Pais ou avós"
	}
];
/** Relaciona categoria de evento → seção do catálogo de músicas. */
var EVENT_TO_CATALOG = {
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
	"nossa-senhora": "nossa-senhora"
};
var ALL_SONG_SECTIONS = [...LITURGY_SECTIONS, ...SPECIAL_SECTIONS];
var SECTION_LABEL = Object.fromEntries([
	...ALL_SONG_SECTIONS,
	...EVENT_CATEGORIES,
	...WEDDING_CATEGORIES
].map((s) => [s.id, s.label]));
function sortSongsAlpha(songs) {
	return [...songs].sort((a, b) => a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }));
}
function songsInSection(songs, sectionId) {
	return sortSongsAlpha(songs.filter((s) => s.category === sectionId));
}
function eventCategories(isWedding) {
	return isWedding ? [...EVENT_CATEGORIES, ...WEDDING_CATEGORIES] : EVENT_CATEGORIES;
}
/** Numera automaticamente músicas repetidas da mesma categoria (Adoração 1, 2…). */
function withSlotLabels(items) {
	const counts = /* @__PURE__ */ new Map();
	for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
	const seen = /* @__PURE__ */ new Map();
	return items.map((item, index) => {
		const total = counts.get(item.category) ?? 1;
		const n = (seen.get(item.category) ?? 0) + 1;
		seen.set(item.category, n);
		const base = SECTION_LABEL[item.category] ?? item.category;
		const slotLabel = total > 1 ? `${base} ${n}` : base;
		return {
			...item,
			sortOrder: index,
			slotLabel
		};
	});
}
/**
* Validação de links de partitura (PDF / Google Drive).
* Nunca renderizamos um href que não passou por aqui.
*/
/** Extrai o ID de um link do Google Drive, se houver. */
function driveFileId(url) {
	const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
	if (fileMatch?.[1]) return fileMatch[1];
	const openId = url.searchParams.get("id");
	if (openId) return openId;
	return null;
}
/**
* Normaliza e valida uma URL colada pelo administrador.
* Retorna string vazia se o campo estiver em branco,
* a URL canônica se for válida, ou null se for inválida.
*/
function normalizePdfUrl(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return "";
	let url;
	try {
		url = new URL(trimmed);
	} catch {
		return null;
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") return null;
	const id = driveFileId(url);
	if (id && /(?:^|\.)drive\.google\.com$/i.test(url.hostname)) return `https://drive.google.com/file/d/${id}/view`;
	return url.toString();
}
function isRenderableHttpUrl(value) {
	if (!value) return false;
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}
//#endregion
export { SPECIAL_SECTIONS as a, normalizePdfUrl as c, withSlotLabels as d, SECTION_LABEL as i, songsInSection as l, EVENT_TO_CATALOG as n, eventCategories as o, LITURGY_SECTIONS as r, isRenderableHttpUrl as s, ALL_SONG_SECTIONS as t, sortSongsAlpha as u };

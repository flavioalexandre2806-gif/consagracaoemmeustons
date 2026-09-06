import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as SPECIAL_SECTIONS, c as normalizePdfUrl, d as withSlotLabels, i as SECTION_LABEL, l as songsInSection, n as EVENT_TO_CATALOG, o as eventCategories, r as LITURGY_SECTIONS, s as isRenderableHttpUrl, t as ALL_SONG_SECTIONS, u as sortSongsAlpha } from "./links-KXs2gt5y.mjs";
import { a as object, i as number, n as boolean, o as string, t as array } from "../_libs/zod.mjs";
import { a as Pencil, c as LogOut, d as ChevronRight, f as ChevronLeft, h as ArrowDown, i as Plus, l as Lock, m as ArrowUp, o as Music, p as CalendarDays, r as Trash2, s as MapPin, t as X, u as FileText } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DNXFIuWW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Combina classes Tailwind sem conflitos. */
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium transition-[opacity,transform,background-color,color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: { variant: {
		primary: "bg-accent text-accent-fg hover:opacity-90 rounded-md min-h-11 px-4",
		outline: "bg-transparent text-fg border border-border hover:border-fg/30 rounded-md min-h-11 px-4",
		ghost: "bg-transparent text-muted hover:text-fg hover:bg-raised rounded-md min-h-11 px-3",
		danger: "bg-transparent text-danger border border-danger/40 hover:bg-danger/10 rounded-md min-h-11 px-4",
		icon: "bg-transparent text-muted hover:text-fg hover:bg-raised rounded-sm size-11 p-0",
		plus: "bg-accent text-accent-fg rounded-full size-12 p-0 shadow-[var(--shadow-border)] hover:opacity-90"
	} },
	defaultVariants: { variant: "primary" }
});
function Button({ className, variant, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonVariants({ variant }), className),
		...props
	});
}
var fieldClass = "w-full min-h-11 rounded-md bg-raised text-fg px-3 py-2 border border-border placeholder:text-subtle focus:outline-none focus:border-fg/35 transition-[border-color] duration-150";
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("block text-sm font-medium text-muted mb-1.5", className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn(fieldClass, className),
		...props
	});
}
function Select({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn(fieldClass, "appearance-none pr-8", className),
		...props
	});
}
function Field({ label, htmlFor, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		htmlFor,
		children: label
	}), children] });
}
/** Sessão da área restrita — só existe neste navegador. */
var TOKEN_KEY = "cmt.admin.token";
function readAdminToken() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}
function writeAdminToken(token) {
	window.localStorage.setItem(TOKEN_KEY, token);
}
function clearAdminToken() {
	window.localStorage.removeItem(TOKEN_KEY);
}
var SONGS_KEY = "cmt.songs.v1";
var EVENTS_KEY = "cmt.events.v1";
function readJson(key, fallback) {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}
function readCachedSongs() {
	const value = readJson(SONGS_KEY, []);
	return Array.isArray(value) ? value : [];
}
function readCachedEvents() {
	const value = readJson(EVENTS_KEY, []);
	return Array.isArray(value) ? value : [];
}
function writeCachedSongs(songs) {
	window.localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}
function writeCachedEvents(events) {
	window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Funções de servidor do catálogo.
* Leitura é pública. Escrita exige o token da área restrita.
*/
var eventSongSchema = object({
	songId: string().min(1),
	category: string().min(1),
	sortOrder: number().int(),
	slotLabel: string()
});
var songRow = object({
	id: string(),
	title: string(),
	category: string(),
	pdfUrl: string(),
	createdAt: string()
});
var eventRow = object({
	id: string(),
	name: string(),
	startsAt: string(),
	location: string(),
	isWedding: boolean(),
	songs: array(eventSongSchema),
	createdAt: string()
});
var loginAdmin = createServerFn({ method: "POST" }).validator(object({
	username: string(),
	password: string()
})).handler(createSsrRpc("74df92d8a59ff9afbc5275e391927a9634113b0396502f810cf244a7a3277914"));
var listSongs = createServerFn({ method: "GET" }).handler(createSsrRpc("799cf2a9a017e8f760438be9cda4b39a829d5679b5e2b4f1ce425bc8caf02c56"));
var listEvents = createServerFn({ method: "GET" }).handler(createSsrRpc("f35b4161a6d9ba2ac8a202114d164743ca7992ca39982cf9d80feeaeb1b3d382"));
var createSong = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	title: string().min(1),
	category: string().min(1),
	pdfUrl: string()
})).handler(createSsrRpc("978dd5922115e05923d6c4c52d991b1768a77821492d2710f55d4d6bde5f5896"));
var updateSong = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	id: string().min(1),
	title: string().min(1),
	category: string().min(1),
	pdfUrl: string()
})).handler(createSsrRpc("cdfdcaf08619340df89809c0082cfd8479a9e69100cf7827151806fa4568471f"));
var deleteSong = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	id: string().min(1)
})).handler(createSsrRpc("8812f905d3909b0ecd543052df42de68c6f8de8f7779e26766af0a962c7629f5"));
var createEvent = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	name: string().min(1),
	startsAt: string().min(1),
	location: string(),
	isWedding: boolean(),
	songs: array(eventSongSchema)
})).handler(createSsrRpc("9a6203311e1be42d551b733996362b637ce337e23c2a91db79eeb87d93089160"));
var updateEvent = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	id: string().min(1),
	name: string().min(1),
	startsAt: string().min(1),
	location: string(),
	isWedding: boolean(),
	songs: array(eventSongSchema)
})).handler(createSsrRpc("de159604234757d283dd8f2b0462230856af93352379248335f24059aa9742c7"));
var deleteEvent = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	id: string().min(1)
})).handler(createSsrRpc("25c0d39fab049418fc1ee8a290240bdc56cd3491b1bbb5e2bf88b2638f59b5f0"));
/** Recupera o catálogo local quando o banco da preview foi reiniciado vazio. */
var restoreCatalog = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	songs: array(songRow),
	events: array(eventRow)
})).handler(createSsrRpc("5314c1b71cd289bd475953e6c5b607f0dcc0ac924b25857bae645ab3fe27517b"));
var CatalogContext = (0, import_react.createContext)(null);
function errorMessage(err) {
	if (err instanceof Error && err.message) return err.message;
	return "Não foi possível concluir a ação.";
}
function CatalogProvider({ children }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [isAdmin, setIsAdmin] = (0, import_react.useState)(false);
	const [songs, setSongs] = (0, import_react.useState)([]);
	const [events, setEvents] = (0, import_react.useState)([]);
	const persist = (0, import_react.useCallback)((nextSongs, nextEvents) => {
		writeCachedSongs(nextSongs);
		writeCachedEvents(nextEvents);
	}, []);
	(0, import_react.useEffect)(() => {
		const cachedSongs = readCachedSongs();
		const cachedEvents = readCachedEvents();
		if (cachedSongs.length) setSongs(sortSongsAlpha(cachedSongs));
		if (cachedEvents.length) setEvents(cachedEvents);
		setIsAdmin(Boolean(readAdminToken()));
		let cancelled = false;
		(async () => {
			try {
				const [remoteSongs, remoteEvents] = await Promise.all([listSongs(), listEvents()]);
				if (cancelled) return;
				const token = readAdminToken();
				const remoteEmpty = remoteSongs.length === 0 && remoteEvents.length === 0;
				const cacheHasData = cachedSongs.length > 0 || cachedEvents.length > 0;
				if (remoteEmpty && cacheHasData && token) {
					await restoreCatalog({ data: {
						token,
						songs: cachedSongs,
						events: cachedEvents
					} });
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
			} catch {} finally {
				if (!cancelled) setReady(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [persist]);
	const login = (0, import_react.useCallback)(async (username, password) => {
		writeAdminToken((await loginAdmin({ data: {
			username,
			password
		} })).token);
		setIsAdmin(true);
	}, []);
	const logout = (0, import_react.useCallback)(() => {
		clearAdminToken();
		setIsAdmin(false);
	}, []);
	const addSong = (0, import_react.useCallback)(async (input) => {
		const token = readAdminToken();
		if (!token) throw new Error("Entre na área restrita para editar.");
		const created = await createSong({ data: {
			token,
			...input
		} });
		setSongs((prev) => {
			const next = sortSongsAlpha([...prev, created]);
			persist(next, events);
			return next;
		});
	}, [events, persist]);
	const editSong = (0, import_react.useCallback)(async (input) => {
		const token = readAdminToken();
		if (!token) throw new Error("Entre na área restrita para editar.");
		const updated = await updateSong({ data: {
			token,
			...input
		} });
		setSongs((prev) => {
			const next = sortSongsAlpha(prev.map((s) => s.id === updated.id ? updated : s));
			persist(next, events);
			return next;
		});
	}, [events, persist]);
	const removeSong = (0, import_react.useCallback)(async (id) => {
		const token = readAdminToken();
		if (!token) throw new Error("Entre na área restrita para editar.");
		await deleteSong({ data: {
			token,
			id
		} });
		setSongs((prev) => {
			const next = prev.filter((s) => s.id !== id);
			persist(next, events);
			return next;
		});
	}, [events, persist]);
	const addEvent = (0, import_react.useCallback)(async (input) => {
		const token = readAdminToken();
		if (!token) throw new Error("Entre na área restrita para editar.");
		const created = await createEvent({ data: {
			token,
			...input
		} });
		setEvents((prev) => {
			const next = [...prev, created].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
			persist(songs, next);
			return next;
		});
	}, [persist, songs]);
	const editEvent = (0, import_react.useCallback)(async (input) => {
		const token = readAdminToken();
		if (!token) throw new Error("Entre na área restrita para editar.");
		const updated = await updateEvent({ data: {
			token,
			...input
		} });
		setEvents((prev) => {
			const next = prev.map((e) => e.id === updated.id ? updated : e).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
			persist(songs, next);
			return next;
		});
	}, [persist, songs]);
	const removeEvent = (0, import_react.useCallback)(async (id) => {
		const token = readAdminToken();
		if (!token) throw new Error("Entre na área restrita para editar.");
		await deleteEvent({ data: {
			token,
			id
		} });
		setEvents((prev) => {
			const next = prev.filter((e) => e.id !== id);
			persist(songs, next);
			return next;
		});
	}, [persist, songs]);
	const value = (0, import_react.useMemo)(() => ({
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
		removeEvent
	}), [
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
		removeEvent
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogContext.Provider, {
		value,
		children
	});
}
function useCatalog() {
	const ctx = (0, import_react.useContext)(CatalogContext);
	if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
	return ctx;
}
async function runAction(action, success) {
	try {
		await action();
		toast.success(success);
		return true;
	} catch (err) {
		toast.error(errorMessage(err));
		return false;
	}
}
var Dialog = Dialog$1;
function DialogContent({ title, description, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed z-50 left-1/2 top-1/2 w-[min(92vw,40rem)] max-h-[min(90dvh,44rem)] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface text-fg p-5 sm:p-6 shadow-[var(--shadow-border)] border border-border focus:outline-none", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-4 mb-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-display text-2xl font-semibold leading-snug text-fg",
				children: title
			}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
				className: "mt-1 text-sm text-muted",
				children: description
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
				className: "sr-only",
				children: title
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "icon",
					"aria-label": "Fechar",
					className: "shrink-0 -mr-1 -mt-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})
			})]
		}), children]
	})] });
}
function LoginDialog({ open, onOpenChange }) {
	const { login } = useCatalog();
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setPending(true);
		const ok = await runAction(() => login(username, password), "Área restrita liberada.");
		setPending(false);
		if (ok) {
			setPassword("");
			onOpenChange(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: "Área restrita",
			description: "Somente o administrador pode adicionar ou editar cânticos e eventos.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Usuário",
						htmlFor: "admin-user",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "admin-user",
							autoComplete: "username",
							value: username,
							onChange: (e) => setUsername(e.target.value),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Senha",
						htmlFor: "admin-pass",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "admin-pass",
							type: "password",
							autoComplete: "current-password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: pending,
							children: pending ? "Entrando…" : "Entrar"
						})
					})
				]
			})
		})
	});
}
function SongDialog({ open, onOpenChange, sectionId, song }) {
	const { addSong, editSong } = useCatalog();
	const [title, setTitle] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)(sectionId);
	const [pdfUrl, setPdfUrl] = (0, import_react.useState)("");
	const [linkError, setLinkError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setTitle(song?.title ?? "");
		setCategory(song?.category ?? sectionId);
		setPdfUrl(song?.pdfUrl ?? "");
		setLinkError("");
	}, [
		open,
		song,
		sectionId
	]);
	async function onSubmit(e) {
		e.preventDefault();
		const normalized = normalizePdfUrl(pdfUrl);
		if (normalized === null) {
			setLinkError("Informe um link http(s) válido, de preferência do Google Drive.");
			return;
		}
		setLinkError("");
		setPending(true);
		const payload = {
			title: title.trim(),
			category,
			pdfUrl: normalized
		};
		const ok = await runAction(async () => {
			if (song) await editSong({
				id: song.id,
				...payload
			});
			else await addSong(payload);
		}, song ? "Cântico atualizado." : "Cântico adicionado.");
		setPending(false);
		if (ok) onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: song ? "Editar cântico" : "Novo cântico",
			description: "O título entra na lista em ordem alfabética. O PDF abre em nova aba.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Título",
						htmlFor: "song-title",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "song-title",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							required: true,
							maxLength: 160
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Seção",
						htmlFor: "song-cat",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							id: "song-cat",
							value: category,
							onChange: (e) => setCategory(e.target.value),
							children: ALL_SONG_SECTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s.id,
								children: s.label
							}, s.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "Link do PDF (Google Drive)",
						htmlFor: "song-pdf",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "song-pdf",
							type: "url",
							inputMode: "url",
							placeholder: "https://drive.google.com/file/d/…",
							value: pdfUrl,
							onChange: (e) => setPdfUrl(e.target.value)
						}), linkError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm text-danger",
							children: linkError
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm text-subtle",
							children: "Cole o link de compartilhamento. Deixe em branco se ainda não houver partitura."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => onOpenChange(false),
							children: "Cancelar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: pending || !title.trim(),
							children: pending ? "Salvando…" : "Salvar"
						})]
					})
				]
			})
		})
	});
}
/** Formatação de datas em pt-BR, sem dependência de fuso externo. */
function toDatetimeLocal(value) {
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function parseLocalDate(value) {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d;
}
function formatEventWhen(startsAt) {
	const d = parseLocalDate(startsAt);
	if (!d) return startsAt;
	return new Intl.DateTimeFormat("pt-BR", {
		weekday: "short",
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).format(d);
}
function formatDayHeading(date) {
	const raw = new Intl.DateTimeFormat("pt-BR", {
		weekday: "long",
		day: "2-digit",
		month: "long"
	}).format(date);
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}
function sameDay(a, b) {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function ymd(date) {
	const pad = (n) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function filterSongs(all, category) {
	const mapped = EVENT_TO_CATALOG[category];
	if (mapped) return songsInSection(all, mapped);
	return [...all].sort((a, b) => a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }));
}
function EventDialog({ open, onOpenChange, event }) {
	const { songs, addEvent, editEvent } = useCatalog();
	const [name, setName] = (0, import_react.useState)("");
	const [startsAt, setStartsAt] = (0, import_react.useState)("");
	const [location, setLocation] = (0, import_react.useState)("");
	const [isWedding, setIsWedding] = (0, import_react.useState)(false);
	const [items, setItems] = (0, import_react.useState)([]);
	const [pickCategory, setPickCategory] = (0, import_react.useState)("entrada");
	const [pickSongId, setPickSongId] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const categories = eventCategories(isWedding);
	const available = (0, import_react.useMemo)(() => filterSongs(songs, pickCategory), [songs, pickCategory]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setName(event?.name ?? "");
		setStartsAt(event ? toDatetimeLocal(event.startsAt) : "");
		setLocation(event?.location ?? "");
		setIsWedding(event?.isWedding ?? false);
		setItems(event?.songs ?? []);
		setPickCategory("entrada");
		setPickSongId("");
	}, [open, event]);
	(0, import_react.useEffect)(() => {
		if (!categories.some((c) => c.id === pickCategory)) setPickCategory(categories[0]?.id ?? "entrada");
	}, [categories, pickCategory]);
	(0, import_react.useEffect)(() => {
		if (!available.some((s) => s.id === pickSongId)) setPickSongId(available[0]?.id ?? "");
	}, [available, pickSongId]);
	function addPicked() {
		if (!pickSongId || !pickCategory) return;
		setItems((prev) => withSlotLabels([...prev, {
			songId: pickSongId,
			category: pickCategory,
			sortOrder: prev.length,
			slotLabel: ""
		}]));
	}
	function move(index, dir) {
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
	function remove(index) {
		setItems((prev) => withSlotLabels(prev.filter((_, i) => i !== index)));
	}
	async function onSubmit(e) {
		e.preventDefault();
		setPending(true);
		const payload = {
			name: name.trim(),
			startsAt,
			location: location.trim(),
			isWedding,
			songs: withSlotLabels(items)
		};
		const ok = await runAction(async () => {
			if (event) await editEvent({
				id: event.id,
				...payload
			});
			else await addEvent(payload);
		}, event ? "Evento atualizado." : "Evento salvo.");
		setPending(false);
		if (ok) onOpenChange(false);
	}
	const songById = (0, import_react.useMemo)(() => new Map(songs.map((s) => [s.id, s])), [songs]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: event ? "Editar evento" : "Novo evento",
			description: "Defina a ordem das músicas no momento da criação. Categorias repetidas são numeradas automaticamente.",
			className: "w-[min(92vw,44rem)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nome do evento",
						htmlFor: "ev-name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "ev-name",
							value: name,
							onChange: (e) => setName(e.target.value),
							required: true,
							placeholder: "Missa dominical, Casamento…"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Data e horário",
							htmlFor: "ev-when",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "ev-when",
								type: "datetime-local",
								value: startsAt,
								onChange: (e) => setStartsAt(e.target.value),
								required: true
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Local",
							htmlFor: "ev-loc",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "ev-loc",
								value: location,
								onChange: (e) => setLocation(e.target.value),
								placeholder: "Paróquia, capela…"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-3 min-h-11 text-sm text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "size-4 accent-accent",
							checked: isWedding,
							onChange: (e) => setIsWedding(e.target.checked)
						}), "Evento de casamento (libera categorias adicionais)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-raised/50 p-3 sm:p-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-fg",
								children: "Músicas utilizadas"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2 sm:grid-cols-[1fr_1fr_auto]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										value: pickCategory,
										onChange: (e) => setPickCategory(e.target.value),
										"aria-label": "Filtrar categoria",
										children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: c.id,
											children: c.label
										}, c.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										value: pickSongId,
										onChange: (e) => setPickSongId(e.target.value),
										"aria-label": "Escolher cântico",
										disabled: available.length === 0,
										children: available.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Nenhum cântico nesta categoria"
										}) : available.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: s.id,
											children: s.title
										}, s.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: addPicked,
										disabled: !pickSongId,
										className: "w-full sm:w-auto",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Incluir"]
									})
								]
							}),
							items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-subtle py-2",
								children: "Nenhuma música neste evento ainda. Filtre a categoria e inclua na ordem da celebração."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "space-y-1.5",
								children: items.map((item, index) => {
									const song = songById.get(item.songId);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center gap-2 rounded-md bg-surface px-2 py-1.5 border border-border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-subtle w-6 tabular-nums shrink-0",
												children: index + 1
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: item.slotLabel || SECTION_LABEL[item.category]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm text-fg truncate",
													children: song?.title ?? "Cântico removido do catálogo"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "icon",
												className: "size-10",
												"aria-label": "Subir",
												onClick: () => move(index, -1),
												disabled: index === 0,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "icon",
												className: "size-10",
												"aria-label": "Descer",
												onClick: () => move(index, 1),
												disabled: index === items.length - 1,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "icon",
												className: "size-10 text-danger hover:text-danger",
												"aria-label": "Remover",
												onClick: () => remove(index),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
											})
										]
									}, `${item.songId}-${index}`);
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => onOpenChange(false),
							children: "Cancelar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: pending || !name.trim() || !startsAt,
							children: pending ? "Salvando…" : "Salvar evento"
						})]
					})
				]
			})
		})
	});
}
function SongPanel({ sectionId, onAdd, onEdit }) {
	const { songs, isAdmin, removeSong } = useCatalog();
	const list = songsInSection(songs, sectionId);
	const label = SECTION_LABEL[sectionId] ?? sectionId;
	async function onDelete(song) {
		if (!window.confirm(`Excluir “${song.title}” desta seção?`)) return;
		await runAction(() => removeSong(song.id), "Cântico excluído.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "section-title",
		className: "min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.18em] uppercase text-muted",
					children: "Seção"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "section-title",
					className: "font-display text-3xl font-semibold leading-tight mt-1",
					children: label
				})] }), isAdmin && list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "plus",
					className: "size-11",
					"aria-label": "Adicionar cântico",
					onClick: onAdd,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
				}) : null]
			}),
			list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md bg-raised border border-border px-5 py-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Nenhum cântico nesta seção ainda."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-subtle mt-1",
					children: isAdmin ? "Use o botão + para adicionar o primeiro." : "O repertório aparece aqui quando for publicado."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "divide-y divide-border border-y border-border",
				children: list.map((song) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 py-3 min-h-14",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-fg truncate",
							children: song.title
						}), isRenderableHttpUrl(song.pdfUrl) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: song.pdfUrl,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "inline-flex items-center gap-1.5 mt-0.5 text-sm text-muted hover:text-accent transition-colors duration-150",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), "Abrir partitura"]
						}) : null]
					}), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "icon",
							className: "size-11",
							"aria-label": `Editar ${song.title}`,
							onClick: () => onEdit(song),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "icon",
							className: "size-11",
							"aria-label": `Excluir ${song.title}`,
							onClick: () => onDelete(song),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})]
					}) : null]
				}, song.id))
			}),
			isAdmin && list.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "plus",
					"aria-label": "Adicionar cântico",
					onClick: onAdd,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-6" })
				})
			}) : null
		]
	});
}
var WEEKDAYS = [
	"Dom",
	"Seg",
	"Ter",
	"Qua",
	"Qui",
	"Sex",
	"Sáb"
];
function monthCells(year, month) {
	const first = new Date(year, month, 1);
	const start = new Date(year, month, 1 - first.getDay());
	return Array.from({ length: 42 }, (_, i) => {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		return d;
	});
}
function monthTitle(year, month) {
	const raw = new Intl.DateTimeFormat("pt-BR", {
		month: "long",
		year: "numeric"
	}).format(new Date(year, month, 1));
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}
function CalendarPanel({ onCreate, onEdit }) {
	const { events, songs, isAdmin, removeEvent } = useCatalog();
	const today = /* @__PURE__ */ new Date();
	const [cursor, setCursor] = (0, import_react.useState)(() => new Date(today.getFullYear(), today.getMonth(), 1));
	const [selected, setSelected] = (0, import_react.useState)(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()));
	const year = cursor.getFullYear();
	const month = cursor.getMonth();
	const cells = (0, import_react.useMemo)(() => monthCells(year, month), [year, month]);
	const eventsByDay = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
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
	const upcoming = events.filter((e) => {
		const d = parseLocalDate(e.startsAt);
		return d && d.getTime() >= new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
	}).slice(0, 6);
	const songTitle = (id) => songs.find((s) => s.id === id)?.title;
	async function onDelete(event) {
		if (!window.confirm(`Excluir o evento “${event.name}”?`)) return;
		await runAction(() => removeEvent(event.id), "Evento excluído.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "agenda-title",
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.18em] uppercase text-muted",
				children: "Agenda"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "agenda-title",
				className: "font-display text-3xl font-semibold leading-tight mt-1",
				children: "Calendário"
			})] }), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: onCreate,
				className: "shrink-0",
				children: "Novo evento"
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "icon",
								className: "size-11",
								"aria-label": "Mês anterior",
								onClick: () => setCursor(new Date(year, month - 1, 1)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-medium",
								children: monthTitle(year, month)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "icon",
								className: "size-11",
								"aria-label": "Próximo mês",
								onClick: () => setCursor(new Date(year, month + 1, 1)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "cal-grid mb-1",
						children: WEEKDAYS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-center text-[0.7rem] uppercase tracking-wider text-subtle py-1",
							children: d
						}, d))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "cal-grid",
						children: cells.map((day) => {
							const key = ymd(day);
							const inMonth = day.getMonth() === month;
							const isSel = sameDay(day, selected);
							const isToday = sameDay(day, today);
							const has = (eventsByDay.get(key)?.length ?? 0) > 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setSelected(day);
									if (day.getMonth() !== month) setCursor(new Date(day.getFullYear(), day.getMonth(), 1));
								},
								className: [
									"cal-cell",
									inMonth ? "" : "is-muted",
									isSel ? "is-selected" : "",
									isToday && !isSel ? "is-today" : ""
								].join(" "),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm leading-none",
									children: day.getDate()
								}), has ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cal-dot" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-[0.28rem]" })]
							}, key);
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl font-medium mb-3",
						children: formatDayHeading(selected)
					}),
					dayEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted text-sm mb-8",
						children: "Nenhum evento neste dia."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-4 mb-8",
						children: dayEvents.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-lg border border-border bg-surface p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-xl font-medium leading-snug",
											children: event.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted mt-1",
											children: formatEventWhen(event.startsAt)
										}),
										event.location ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted mt-1 inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }), event.location]
										}) : null,
										event.isWedding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs uppercase tracking-wider text-subtle mt-2",
											children: "Casamento"
										}) : null
									]
								}), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "icon",
										className: "size-11",
										"aria-label": "Editar evento",
										onClick: () => onEdit(event),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "icon",
										className: "size-11",
										"aria-label": "Excluir evento",
										onClick: () => onDelete(event),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									})]
								}) : null]
							}), event.songs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "mt-4 space-y-1.5 border-t border-border pt-3",
								children: event.songs.map((item, i) => {
									const title = songTitle(item.songId);
									const song = songs.find((s) => s.id === item.songId);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-baseline gap-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-subtle w-28 shrink-0 truncate",
											children: item.slotLabel || SECTION_LABEL[item.category]
										}), song && isRenderableHttpUrl(song.pdfUrl) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: song.pdfUrl,
											target: "_blank",
											rel: "noopener noreferrer",
											className: "text-fg hover:text-accent truncate transition-colors duration-150",
											children: title ?? "—"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-fg truncate",
											children: title ?? "Cântico indisponível"
										})]
									}, `${event.id}-${i}`);
								})
							}) : null]
						}, event.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl font-medium mb-3",
						children: "Próximos"
					}),
					upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "A agenda está em aberto."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: upcoming.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "w-full text-left rounded-md px-3 py-2 hover:bg-raised transition-colors duration-150 min-h-11",
							onClick: () => {
								const d = parseLocalDate(event.startsAt);
								if (!d) return;
								setSelected(d);
								setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-fg truncate",
								children: event.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: formatEventWhen(event.startsAt)
							})]
						}) }, event.id))
					})
				]
			})]
		})]
	});
}
function Portrait() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "portrait-frame",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/flavio.jpg",
			alt: "Flávio Vieira",
			width: 88,
			height: 88
		})
	});
}
function NavItem({ active, children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("w-full text-left rounded-md px-3 min-h-11 text-sm transition-colors duration-150", active ? "bg-raised text-fg" : "text-muted hover:text-fg hover:bg-raised/60"),
		children
	});
}
function Shell() {
	const { isAdmin, logout } = useCatalog();
	const [view, setView] = (0, import_react.useState)("liturgy");
	const [sectionId, setSectionId] = (0, import_react.useState)(LITURGY_SECTIONS[0].id);
	const [loginOpen, setLoginOpen] = (0, import_react.useState)(false);
	const [songOpen, setSongOpen] = (0, import_react.useState)(false);
	const [editingSong, setEditingSong] = (0, import_react.useState)(null);
	const [eventOpen, setEventOpen] = (0, import_react.useState)(false);
	const [editingEvent, setEditingEvent] = (0, import_react.useState)(null);
	const sections = view === "special" ? SPECIAL_SECTIONS : LITURGY_SECTIONS;
	function openSection(id, nextView) {
		setView(nextView);
		setSectionId(id);
	}
	function openNewSong() {
		setEditingSong(null);
		setSongOpen(true);
	}
	function openEditSong(song) {
		setEditingSong(song);
		setSongOpen(true);
	}
	function openNewEvent() {
		setEditingEvent(null);
		setEventOpen(true);
		setView("agenda");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "site-header mx-auto max-w-6xl px-5 pt-10 pb-6 sm:pt-14 sm:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs tracking-[0.28em] uppercase text-muted",
						children: "Repertório litúrgico"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 text-center font-display text-[clamp(1.85rem,5.4vw,3.5rem)] font-semibold italic leading-[1.12] text-fg max-w-[18ch] mx-auto",
						children: "Consagração em Meus Tons"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-center font-display text-xl sm:text-2xl tracking-wide text-accent",
						children: "Flávio Vieira"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-5 h-px w-14 bg-fg/20" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Principal",
				className: "mx-auto max-w-6xl px-5 sm:px-8 mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "site-nav flex flex-wrap items-center justify-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: view === "liturgy" ? "primary" : "outline",
							className: "whitespace-nowrap px-3 text-sm",
							onClick: () => {
								setView("liturgy");
								if (!LITURGY_SECTIONS.some((s) => s.id === sectionId)) setSectionId(LITURGY_SECTIONS[0].id);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "size-4" }), "Liturgia"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: view === "special" ? "primary" : "outline",
							className: "whitespace-nowrap px-3 text-sm",
							onClick: () => {
								setView("special");
								if (!SPECIAL_SECTIONS.some((s) => s.id === sectionId)) setSectionId(SPECIAL_SECTIONS[0].id);
							},
							children: ["Cânticos", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "\xA0especiais"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: view === "agenda" ? "primary" : "outline",
							className: "whitespace-nowrap px-3 text-sm",
							onClick: () => setView("agenda"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-4" }), "Agenda"]
						}),
						isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "whitespace-nowrap px-3 text-sm",
							onClick: openNewEvent,
							children: "Novo evento"
						}) : null,
						isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							className: "whitespace-nowrap px-3 text-sm",
							onClick: logout,
							"aria-label": "Sair",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Sair"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							className: "whitespace-nowrap px-3 text-sm",
							onClick: () => setLoginOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), "Área restrita"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-6xl px-5 sm:px-8 pb-16",
				children: view === "agenda" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPanel, {
					onCreate: openNewEvent,
					onEdit: (event) => {
						setEditingEvent(event);
						setEventOpen(true);
					}
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 md:grid-cols-[15.5rem_minmax(0,1fr)] min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:hidden mb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-[0.18em] uppercase text-subtle mb-2 px-1",
								children: view === "special" ? "Especiais" : "Ordem da Missa"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: sectionId,
								onChange: (e) => setSectionId(e.target.value),
								"aria-label": "Seção do repertório",
								children: sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: section.id,
									children: section.label
								}, section.id))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden md:block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-[0.18em] uppercase text-subtle mb-2 px-3",
								children: view === "special" ? "Especiais" : "Ordem da Missa"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-col gap-1",
								children: sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
									active: sectionId === section.id,
									onClick: () => openSection(section.id, view),
									children: section.label
								}, section.id))
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongPanel, {
						sectionId,
						onAdd: openNewSong,
						onEdit: openEditSong
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginDialog, {
				open: loginOpen,
				onOpenChange: setLoginOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongDialog, {
				open: songOpen,
				onOpenChange: setSongOpen,
				sectionId,
				song: editingSong
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDialog, {
				open: eventOpen,
				onOpenChange: setEventOpen,
				event: editingEvent
			})
		]
	});
}
function CatalogApp() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {}) });
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogApp, {});
}
//#endregion
export { Home as component };

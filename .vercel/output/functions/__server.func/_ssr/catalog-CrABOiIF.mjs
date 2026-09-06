import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { c as normalizePdfUrl, d as withSlotLabels } from "./links-KXs2gt5y.mjs";
import { a as object, i as number, n as boolean, o as string, t as array } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-CrABOiIF.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_catalog_default = "-- Catálogo compartilhado: cânticos e eventos visíveis a todos os visitantes.\n-- Linhas sem user_id — o site é público; a edição é protegida por senha no servidor.\n\ncreate table if not exists songs (\n  id          text primary key,\n  title       text not null,\n  category    text not null,\n  pdf_url     text not null default '',\n  created_at  text not null\n);\n\ncreate index if not exists songs_category_idx on songs (category);\ncreate index if not exists songs_title_idx on songs (title);\n\ncreate table if not exists events (\n  id          text primary key,\n  name        text not null,\n  starts_at   text not null,\n  location    text not null default '',\n  is_wedding  boolean not null default false,\n  songs_json  text not null default '[]',\n  created_at  text not null\n);\n\ncreate index if not exists events_starts_at_idx on events (starts_at);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_catalog.sql": _0002_catalog_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
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
function mapSong(row) {
	return {
		id: row.id,
		title: row.title,
		category: row.category,
		pdfUrl: row.pdf_url,
		createdAt: row.created_at
	};
}
function mapEvent(row) {
	let songs = [];
	try {
		const parsed = JSON.parse(row.songs_json || "[]");
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
		createdAt: row.created_at
	};
}
async function requireAdmin(token) {
	const { assertAdmin } = await import("./admin.server-DbRMPgFN.mjs");
	assertAdmin(token);
}
var loginAdmin_createServerFn_handler = createServerRpc({
	id: "74df92d8a59ff9afbc5275e391927a9634113b0396502f810cf244a7a3277914",
	name: "loginAdmin",
	filename: "src/server/catalog.ts"
}, (opts) => loginAdmin.__executeServer(opts));
var loginAdmin = createServerFn({ method: "POST" }).validator(object({
	username: string(),
	password: string()
})).handler(loginAdmin_createServerFn_handler, async ({ data }) => {
	const { verifyCredentials, issueToken } = await import("./admin.server-DbRMPgFN.mjs");
	if (!verifyCredentials(data.username, data.password)) throw new Error("Usuário ou senha inválidos.");
	return { token: issueToken() };
});
var listSongs_createServerFn_handler = createServerRpc({
	id: "799cf2a9a017e8f760438be9cda4b39a829d5679b5e2b4f1ce425bc8caf02c56",
	name: "listSongs",
	filename: "src/server/catalog.ts"
}, (opts) => listSongs.__executeServer(opts));
var listSongs = createServerFn({ method: "GET" }).handler(listSongs_createServerFn_handler, async () => {
	return (await (await getSql())`
    select id, title, category, pdf_url, created_at
    from songs
    order by title
  `).map(mapSong);
});
var listEvents_createServerFn_handler = createServerRpc({
	id: "f35b4161a6d9ba2ac8a202114d164743ca7992ca39982cf9d80feeaeb1b3d382",
	name: "listEvents",
	filename: "src/server/catalog.ts"
}, (opts) => listEvents.__executeServer(opts));
var listEvents = createServerFn({ method: "GET" }).handler(listEvents_createServerFn_handler, async () => {
	return (await (await getSql())`
    select id, name, starts_at, location, is_wedding, songs_json, created_at
    from events
    order by starts_at asc
  `).map(mapEvent);
});
var createSong_createServerFn_handler = createServerRpc({
	id: "978dd5922115e05923d6c4c52d991b1768a77821492d2710f55d4d6bde5f5896",
	name: "createSong",
	filename: "src/server/catalog.ts"
}, (opts) => createSong.__executeServer(opts));
var createSong = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	title: string().min(1),
	category: string().min(1),
	pdfUrl: string()
})).handler(createSong_createServerFn_handler, async ({ data }) => {
	await requireAdmin(data.token);
	const pdfUrl = normalizePdfUrl(data.pdfUrl);
	if (pdfUrl === null) throw new Error("Link do PDF inválido. Use uma URL http(s) do Google Drive.");
	const song = {
		id: crypto.randomUUID(),
		title: data.title.trim(),
		category: data.category,
		pdfUrl,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	await (await getSql())`
      insert into songs (id, title, category, pdf_url, created_at)
      values (${song.id}, ${song.title}, ${song.category}, ${song.pdfUrl}, ${song.createdAt})
    `;
	return song;
});
var updateSong_createServerFn_handler = createServerRpc({
	id: "cdfdcaf08619340df89809c0082cfd8479a9e69100cf7827151806fa4568471f",
	name: "updateSong",
	filename: "src/server/catalog.ts"
}, (opts) => updateSong.__executeServer(opts));
var updateSong = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	id: string().min(1),
	title: string().min(1),
	category: string().min(1),
	pdfUrl: string()
})).handler(updateSong_createServerFn_handler, async ({ data }) => {
	await requireAdmin(data.token);
	const pdfUrl = normalizePdfUrl(data.pdfUrl);
	if (pdfUrl === null) throw new Error("Link do PDF inválido. Use uma URL http(s) do Google Drive.");
	const sql = await getSql();
	await sql`
      update songs
      set title = ${data.title.trim()},
          category = ${data.category},
          pdf_url = ${pdfUrl}
      where id = ${data.id}
    `;
	const rows = await sql`
      select id, title, category, pdf_url, created_at from songs where id = ${data.id}
    `;
	if (!rows[0]) throw new Error("Música não encontrada.");
	return mapSong(rows[0]);
});
var deleteSong_createServerFn_handler = createServerRpc({
	id: "8812f905d3909b0ecd543052df42de68c6f8de8f7779e26766af0a962c7629f5",
	name: "deleteSong",
	filename: "src/server/catalog.ts"
}, (opts) => deleteSong.__executeServer(opts));
var deleteSong = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	id: string().min(1)
})).handler(deleteSong_createServerFn_handler, async ({ data }) => {
	await requireAdmin(data.token);
	await (await getSql())`delete from songs where id = ${data.id}`;
	return { ok: true };
});
var createEvent_createServerFn_handler = createServerRpc({
	id: "9a6203311e1be42d551b733996362b637ce337e23c2a91db79eeb87d93089160",
	name: "createEvent",
	filename: "src/server/catalog.ts"
}, (opts) => createEvent.__executeServer(opts));
var createEvent = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	name: string().min(1),
	startsAt: string().min(1),
	location: string(),
	isWedding: boolean(),
	songs: array(eventSongSchema)
})).handler(createEvent_createServerFn_handler, async ({ data }) => {
	await requireAdmin(data.token);
	const event = {
		id: crypto.randomUUID(),
		name: data.name.trim(),
		startsAt: data.startsAt,
		location: data.location.trim(),
		isWedding: data.isWedding,
		songs: withSlotLabels(data.songs),
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	await (await getSql())`
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
var updateEvent_createServerFn_handler = createServerRpc({
	id: "de159604234757d283dd8f2b0462230856af93352379248335f24059aa9742c7",
	name: "updateEvent",
	filename: "src/server/catalog.ts"
}, (opts) => updateEvent.__executeServer(opts));
var updateEvent = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	id: string().min(1),
	name: string().min(1),
	startsAt: string().min(1),
	location: string(),
	isWedding: boolean(),
	songs: array(eventSongSchema)
})).handler(updateEvent_createServerFn_handler, async ({ data }) => {
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
	const rows = await sql`
      select id, name, starts_at, location, is_wedding, songs_json, created_at
      from events where id = ${data.id}
    `;
	if (!rows[0]) throw new Error("Evento não encontrado.");
	return mapEvent(rows[0]);
});
var deleteEvent_createServerFn_handler = createServerRpc({
	id: "25c0d39fab049418fc1ee8a290240bdc56cd3491b1bbb5e2bf88b2638f59b5f0",
	name: "deleteEvent",
	filename: "src/server/catalog.ts"
}, (opts) => deleteEvent.__executeServer(opts));
var deleteEvent = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	id: string().min(1)
})).handler(deleteEvent_createServerFn_handler, async ({ data }) => {
	await requireAdmin(data.token);
	await (await getSql())`delete from events where id = ${data.id}`;
	return { ok: true };
});
var restoreCatalog_createServerFn_handler = createServerRpc({
	id: "5314c1b71cd289bd475953e6c5b607f0dcc0ac924b25857bae645ab3fe27517b",
	name: "restoreCatalog",
	filename: "src/server/catalog.ts"
}, (opts) => restoreCatalog.__executeServer(opts));
var restoreCatalog = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	songs: array(songRow),
	events: array(eventRow)
})).handler(restoreCatalog_createServerFn_handler, async ({ data }) => {
	await requireAdmin(data.token);
	const sql = await getSql();
	for (const song of data.songs) await sql`
        insert into songs (id, title, category, pdf_url, created_at)
        values (${song.id}, ${song.title}, ${song.category}, ${song.pdfUrl}, ${song.createdAt})
        on conflict (id) do nothing
      `;
	for (const event of data.events) await sql`
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
	return { ok: true };
});
//#endregion
export { createEvent_createServerFn_handler, createSong_createServerFn_handler, deleteEvent_createServerFn_handler, deleteSong_createServerFn_handler, listEvents_createServerFn_handler, listSongs_createServerFn_handler, loginAdmin_createServerFn_handler, restoreCatalog_createServerFn_handler, updateEvent_createServerFn_handler, updateSong_createServerFn_handler };

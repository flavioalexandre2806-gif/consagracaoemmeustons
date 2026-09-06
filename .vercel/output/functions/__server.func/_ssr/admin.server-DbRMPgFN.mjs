import { createHash, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.server-DbRMPgFN.js
/**
* Credenciais da área restrita — este arquivo é só de servidor.
* Visitantes públicos nunca recebem este módulo.
*/
var ADMIN_USER = "flavio";
var ADMIN_PASS = "consagracao";
var SALT = "cmt-v1";
function digest(username, password) {
	return createHash("sha256").update(`${username}:${password}:${SALT}`).digest("hex");
}
var EXPECTED_TOKEN = digest(ADMIN_USER, ADMIN_PASS);
function safeEqual(a, b) {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
}
function verifyCredentials(username, password) {
	const user = username.trim().toLowerCase();
	const token = digest(user, password);
	return user === ADMIN_USER && safeEqual(token, EXPECTED_TOKEN);
}
function verifyToken(token) {
	if (!token) return false;
	return safeEqual(token, EXPECTED_TOKEN);
}
function issueToken() {
	return EXPECTED_TOKEN;
}
function assertAdmin(token) {
	if (!verifyToken(token)) throw new Error("Não autorizado. Entre na área restrita para editar.");
}
//#endregion
export { assertAdmin, issueToken, verifyCredentials };

/**
 * Validação de links de partitura (PDF / Google Drive).
 * Nunca renderizamos um href que não passou por aqui.
 */

/** Extrai o ID de um link do Google Drive, se houver. */
function driveFileId(url: URL): string | null {
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
export function normalizePdfUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const id = driveFileId(url);
  if (id && /(?:^|\.)drive\.google\.com$/i.test(url.hostname)) {
    // Forma estável que abre o visualizador do Drive em nova aba.
    return `https://drive.google.com/file/d/${id}/view`;
  }
  return url.toString();
}

export function isRenderableHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

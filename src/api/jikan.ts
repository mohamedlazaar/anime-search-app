export const JIKAN_BASE = "https://api.jikan.moe/v4";

export function buildSearchUrl(query: string, page = 1) {
  const q = encodeURIComponent(query || "");
  return `${JIKAN_BASE}/anime?q=${q}&page=${page}`;
}

export function buildAnimeDetailUrl(mal_id: number | string) {
  return `${JIKAN_BASE}/anime/${mal_id}/full`;
}


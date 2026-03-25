const JIKAN_BASE = 'https://api.jikan.moe/v4';

async function jikanFetch(endpoint: string) {
  const res = await fetch(`${JIKAN_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`Jikan error: ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

export async function getTopAnime() {
  return jikanFetch('/top/anime?limit=20');
}

export async function getSeasonalAnime() {
  return jikanFetch('/seasons/now?limit=20');
}

export async function getTopManga() {
  return jikanFetch('/top/manga?limit=20');
}

export async function getAnimeDetails(id: string) {
  const res = await fetch(`${JIKAN_BASE}/anime/${id}/full`);
  const data = await res.json();
  return data.data;
}

export async function getMangaDetails(id: string) {
  const res = await fetch(`${JIKAN_BASE}/manga/${id}/full`);
  const data = await res.json();
  return data.data;
}

export async function searchAnime(query: string) {
  return jikanFetch(`/anime?q=${encodeURIComponent(query)}&limit=10`);
}

export async function searchManga(query: string) {
  return jikanFetch(`/manga?q=${encodeURIComponent(query)}&limit=10`);
}

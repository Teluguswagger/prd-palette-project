import { supabase } from "@/integrations/supabase/client";

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10770: 'TV Movie', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
  10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
  10767: 'Talk', 10768: 'War & Politics',
};

async function tmdbFetch(endpoint: string) {
  const { data, error } = await supabase.functions.invoke('tmdb-proxy', {
    body: { endpoint },
  });
  if (error) throw new Error(`TMDB proxy error: ${error.message}`);
  return data;
}

export async function getTrendingMovies() {
  const data = await tmdbFetch('/trending/movie/week');
  return data.results || [];
}

export async function getTrendingShows() {
  const data = await tmdbFetch('/trending/tv/week');
  return data.results || [];
}

export async function getNowPlayingMovies() {
  const data = await tmdbFetch('/movie/now_playing');
  return data.results || [];
}

export async function getUpcomingMovies() {
  const data = await tmdbFetch('/movie/upcoming');
  return data.results || [];
}

export async function getTopRatedMovies() {
  const data = await tmdbFetch('/movie/top_rated');
  return data.results || [];
}

export async function getTopRatedShows() {
  const data = await tmdbFetch('/tv/top_rated');
  return data.results || [];
}

export async function getMovieDetails(id: string) {
  return tmdbFetch(`/movie/${id}?append_to_response=credits,videos,similar`);
}

export async function getShowDetails(id: string) {
  return tmdbFetch(`/tv/${id}?append_to_response=credits,videos,similar`);
}

export async function searchContent(query: string) {
  const data = await tmdbFetch(`/search/multi?query=${encodeURIComponent(query)}`);
  return data.results || [];
}

export async function getPopularShows() {
  const data = await tmdbFetch('/tv/popular');
  return data.results || [];
}

export async function getIndianMovies() {
  const data = await tmdbFetch('/discover/movie?with_original_language=hi&sort_by=popularity.desc&region=IN');
  return data.results || [];
}

export async function getIndianShows() {
  const data = await tmdbFetch('/discover/tv?with_original_language=hi&sort_by=popularity.desc&region=IN');
  return data.results || [];
}

export async function getInTheatersMovies() {
  const today = new Date().toISOString().split('T')[0];
  const fiveWeeksAgo = new Date(Date.now() - 35 * 86400000).toISOString().split('T')[0];
  const [global, indian] = await Promise.all([
    tmdbFetch(`/discover/movie?region=US&with_release_type=3|2&release_date.gte=${fiveWeeksAgo}&release_date.lte=${today}&sort_by=popularity.desc`),
    tmdbFetch(`/discover/movie?with_original_language=hi|ta|te|ml|kn&region=IN&with_release_type=3|2&release_date.gte=${fiveWeeksAgo}&release_date.lte=${today}&sort_by=popularity.desc`),
  ]);
  const combined = [...(global.results || [])];
  const ids = new Set(combined.map((m: any) => m.id));
  for (const m of (indian.results || [])) {
    if (!ids.has(m.id)) { combined.push(m); ids.add(m.id); }
  }
  combined.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));
  return combined;
}

export async function getOnTVContent() {
  const [globalShows, globalMovies, indianShows] = await Promise.all([
    tmdbFetch('/tv/on_the_air'),
    tmdbFetch('/movie/now_playing'),
    tmdbFetch('/discover/tv?with_original_language=hi&sort_by=vote_average.desc&vote_count.gte=50&with_genres=18,80,10759,10765,9648&without_genres=10766,10767,10764'),
  ]);
  const combined: any[] = [];
  const ids = new Set<number>();
  for (const item of [...(globalShows.results || []), ...(globalMovies.results || []), ...(indianShows.results || [])]) {
    if (!ids.has(item.id)) { combined.push(item); ids.add(item.id); }
  }
  combined.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));
  return combined;
}

export async function getIndianOTTMovies() {
  const data = await tmdbFetch('/discover/movie?with_original_language=hi|ta|te|ml|kn&sort_by=popularity.desc&region=IN&watch_region=IN&with_watch_monetization_types=flatrate');
  return data.results || [];
}

export async function getIndianOTTShows() {
  // Fetch popular Indian OTT shows, excluding soaps/reality/talk/news/kids
  const langs = 'hi|ta|te|ml|kn|bn|mr|pa|gu';
  const base = `sort_by=popularity.desc&region=IN&watch_region=IN&with_watch_monetization_types=flatrate&without_genres=10766,10767,10764,10762,10763&vote_average.gte=6&with_type=4`;
  const [data, data2] = await Promise.all([
    tmdbFetch(`/discover/tv?with_original_language=${langs}&${base}&page=1`),
    tmdbFetch(`/discover/tv?with_original_language=${langs}&${base}&page=2`),
  ]);
  const results = [...(data.results || []), ...(data2.results || [])];
  
  // Fetch details for each show to filter out daily serials (high episode counts)
  const detailedResults = await Promise.all(
    results.slice(0, 20).map(async (item: any) => {
      try {
        const details = await tmdbFetch(`/tv/${item.id}`);
        return { ...item, _episodes: details.number_of_episodes || 0, _seasons: details.number_of_seasons || 0 };
      } catch {
        return { ...item, _episodes: 0, _seasons: 1 };
      }
    })
  );
  
  return detailedResults.filter((item: any) => {
    const dominated = (item.genre_ids || []);
    const isSoapGenre = dominated.includes(10766) || dominated.includes(10767) || dominated.includes(10764);
    // Daily serials typically have 100+ episodes; quality series have fewer
    const isDailySerial = item._episodes > 100;
    return !isSoapGenre && !isDailySerial;
  });
}

export async function getComingSoonIndia() {
  const today = new Date().toISOString().split('T')[0];
  const sixMonths = new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0];
  const [indianMovies, indianShows, globalMovies, globalShows] = await Promise.all([
    tmdbFetch(`/discover/movie?sort_by=popularity.desc&primary_release_date.gte=${today}&primary_release_date.lte=${sixMonths}&with_original_language=hi|ta|te|ml|kn`),
    tmdbFetch(`/discover/tv?sort_by=popularity.desc&first_air_date.gte=${today}&first_air_date.lte=${sixMonths}&with_original_language=hi|ta|te|ml|kn`),
    tmdbFetch(`/movie/upcoming?region=IN`),
    tmdbFetch(`/discover/tv?sort_by=popularity.desc&first_air_date.gte=${today}&first_air_date.lte=${sixMonths}&with_original_language=en&vote_count.gte=5`),
  ]);
  const combined: any[] = [];
  const ids = new Set<number>();
  for (const item of [...(indianMovies.results || []), ...(indianShows.results || []), ...(globalMovies.results || []), ...(globalShows.results || [])]) {
    if (!ids.has(item.id)) { combined.push(item); ids.add(item.id); }
  }
  combined.sort((a: any, b: any) => {
    const dateA = a.release_date || a.first_air_date || '';
    const dateB = b.release_date || b.first_air_date || '';
    return dateA.localeCompare(dateB);
  });
  return combined;
}

export async function getItemWatchProviders(id: number, type: 'movie' | 'tv') {
  const data = await tmdbFetch(`/${type}/${id}/watch/providers`);
  const results = data.results || {};
  return results.IN || results.US || null;
}

export const STREAMING_NETWORKS = [
  { id: 8, name: 'Netflix', logo: '/placeholder.svg', color: 'hsl(0 72% 51%)' },
  { id: 337, name: 'Disney+', logo: '/placeholder.svg', color: 'hsl(220 80% 50%)' },
  { id: 119, name: 'Amazon Prime', logo: '/placeholder.svg', color: 'hsl(195 100% 40%)' },
  { id: 350, name: 'Apple TV+', logo: '/placeholder.svg', color: 'hsl(0 0% 20%)' },
  { id: 531, name: 'Paramount+', logo: '/placeholder.svg', color: 'hsl(220 60% 50%)' },
  { id: 283, name: 'Crunchyroll', logo: '/placeholder.svg', color: 'hsl(25 100% 50%)' },
  { id: 15, name: 'Hulu', logo: '/placeholder.svg', color: 'hsl(150 70% 45%)' },
  { id: 1899, name: 'Max', logo: '/placeholder.svg', color: 'hsl(260 60% 50%)' },
];

export async function getWatchProviders(id: string, type: 'movie' | 'tv') {
  const data = await tmdbFetch(`/${type}/${id}/watch/providers`);
  const results = data.results || {};
  return results.IN || results.US || null;
}

export function getPosterUrl(path: string | null, size = 'w500') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size = 'w1280') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

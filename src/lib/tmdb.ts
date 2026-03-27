const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = '2dca580c2a14b55200e784d157207b4d';
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
  const res = await fetch(`${TMDB_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
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

// Indian content (Bollywood & Indian shows) - region IN
export async function getIndianMovies() {
  const data = await tmdbFetch('/discover/movie?with_original_language=hi&sort_by=popularity.desc&region=IN');
  return data.results || [];
}

export async function getIndianShows() {
  const data = await tmdbFetch('/discover/tv?with_original_language=hi&sort_by=popularity.desc&region=IN');
  return data.results || [];
}

// Indian OTT trending - movies & shows popular on Indian streaming platforms
export async function getIndianOTTMovies() {
  const data = await tmdbFetch('/discover/movie?with_original_language=hi|ta|te|ml|kn&sort_by=popularity.desc&region=IN&watch_region=IN&with_watch_monetization_types=flatrate');
  return data.results || [];
}

export async function getIndianOTTShows() {
  const data = await tmdbFetch('/discover/tv?with_original_language=hi|ta|te|ml|kn&sort_by=popularity.desc&region=IN&watch_region=IN&with_watch_monetization_types=flatrate');
  return data.results || [];
}

// Streaming network / Watch Providers
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
  // Return IN or US providers
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

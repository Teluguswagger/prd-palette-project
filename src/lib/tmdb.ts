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

export function getPosterUrl(path: string | null, size = 'w500') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size = 'w1280') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

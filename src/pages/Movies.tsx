import { useState, useEffect } from "react";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import { getTrendingMovies, getNowPlayingMovies, getUpcomingMovies, getTopRatedMovies, getPosterUrl, GENRE_MAP } from "@/lib/tmdb";

const genres = ["All", "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Romance", "Animation"];
const sorts = ["Trending", "Now Playing", "Upcoming", "Top Rated"];

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState("Trending");
  const [activeGenre, setActiveGenre] = useState("All");

  useEffect(() => {
    setLoading(true);
    const fetcher = activeSort === "Now Playing" ? getNowPlayingMovies
      : activeSort === "Upcoming" ? getUpcomingMovies
      : activeSort === "Top Rated" ? getTopRatedMovies
      : getTrendingMovies;

    fetcher().then((data) => {
      setMovies(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeSort]);

  const filtered = activeGenre === "All" ? movies
    : movies.filter((m: any) => m.genre_ids?.some((gid: number) => GENRE_MAP[gid] === activeGenre));

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Movies</h1>

        {/* Sort tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sorts.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSort(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeSort === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Genre filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                activeGenre === g ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-secondary-foreground'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 20 }).map((_, i) => <ContentCardSkeleton key={i} />)
            : filtered.map((m: any) => (
                <ContentCard
                  key={m.id}
                  id={m.id}
                  title={m.title}
                  posterUrl={getPosterUrl(m.poster_path)}
                  type="Film"
                  genre={GENRE_MAP[m.genre_ids?.[0]] || ''}
                  year={(m.release_date || '').slice(0, 4)}
                  score={m.vote_average}
                  href={`/title/${m.id}?type=movie`}
                />
              ))}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No movies found for this filter.</div>
        )}
      </div>
    </div>
  );
}

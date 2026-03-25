import { useState, useEffect } from "react";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import { getTrendingShows, getPopularShows, getTopRatedShows, getPosterUrl, GENRE_MAP } from "@/lib/tmdb";

const sorts = ["Trending", "Popular", "Top Rated"];

export default function ShowsPage() {
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState("Trending");

  useEffect(() => {
    setLoading(true);
    const fetcher = activeSort === "Popular" ? getPopularShows
      : activeSort === "Top Rated" ? getTopRatedShows
      : getTrendingShows;
    fetcher().then(setShows).catch(() => {}).finally(() => setLoading(false));
  }, [activeSort]);

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">TV Shows</h1>
        <div className="flex flex-wrap gap-2 mb-6">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 20 }).map((_, i) => <ContentCardSkeleton key={i} />)
            : shows.map((s: any) => (
                <ContentCard
                  key={s.id}
                  id={s.id}
                  title={s.name}
                  posterUrl={getPosterUrl(s.poster_path)}
                  type="TV Show"
                  genre={GENRE_MAP[s.genre_ids?.[0]] || ''}
                  year={(s.first_air_date || '').slice(0, 4)}
                  score={s.vote_average}
                  href={`/title/${s.id}?type=show`}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

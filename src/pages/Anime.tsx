import { useState, useEffect } from "react";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import { getTopAnime, getSeasonalAnime } from "@/lib/jikan";

const tabs = ["Currently Airing", "Top of All Time"];

export default function AnimePage() {
  const [seasonal, setSeasonal] = useState<any[]>([]);
  const [top, setTop] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Currently Airing");

  useEffect(() => {
    Promise.all([
      getSeasonalAnime().catch(() => []),
      getTopAnime().catch(() => []),
    ]).then(([s, t]) => {
      setSeasonal(s);
      setTop(t);
      setLoading(false);
    });
  }, []);

  const items = tab === "Currently Airing" ? seasonal : top;

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Anime</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 20 }).map((_, i) => <ContentCardSkeleton key={i} />)
            : items.map((a: any) => (
                <ContentCard
                  key={a.mal_id}
                  id={a.mal_id}
                  title={a.title}
                  posterUrl={a.images?.jpg?.image_url || null}
                  type="Anime"
                  genre={a.genres?.[0]?.name || ''}
                  year={a.year?.toString() || a.aired?.from?.slice(0, 4)}
                  score={a.score}
                  href={`/title/${a.mal_id}?type=anime`}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
